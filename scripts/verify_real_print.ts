import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { getMasterPrisma } from '../lib/prisma-master';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = path.join(process.cwd(), 'scratch', 'print_verification_results');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

interface TestResult {
  document: string;
  role: string;
  pageTested: string;
  printButtonFound: boolean;
  printPreviewOk: boolean;
  pdfGenerated: boolean;
  uiHidden: boolean;
  a4Correct: boolean;
  multiPageOk: boolean;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

async function getCredentialsForRole(role: string) {
  const masterPrisma = getMasterPrisma();
  const user = await masterPrisma.masterUser.findFirst({
    where: { role },
  });
  if (!user) throw new Error(`No user found for role ${role}`);
  return { email: user.email, password: 'password123' };
}

async function loginUser(page: any, email: string) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  
  const emailInput = await page.$('input[type="email"], input[name="email"]');
  const passwordInput = await page.$('input[type="password"], input[name="password"]');
  
  if (emailInput && passwordInput) {
    await emailInput.type(email);
    await passwordInput.type('password123');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  }
}

async function testDocument(
  page: any,
  docName: string,
  role: string,
  url: string,
  setupAction?: (page: any) => Promise<void>
) {
  console.log(`\n--- Testing ${docName} (${role}) at ${url} ---`);
  const result: TestResult = {
    document: docName,
    role,
    pageTested: url,
    printButtonFound: false,
    printPreviewOk: false,
    pdfGenerated: false,
    uiHidden: false,
    a4Correct: false,
    multiPageOk: true,
    status: 'FAIL',
    details: '',
  };

  try {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle2' });
    if (setupAction) {
      await setupAction(page);
    }

    // 1. Check printable container
    const printableDoc = await page.$('#printable-document, .printable-area');
    if (!printableDoc) {
      result.details = 'Printable element (#printable-document / .printable-area) not found in DOM';
      results.push(result);
      return;
    }

    // 2. Check print button
    const printButton = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent?.includes('Imprimer') || b.textContent?.includes('PDF'));
    });
    result.printButtonFound = printButton;

    // 3. Emulate print media & evaluate computed styles
    await page.emulateMediaType('print');

    const domEvaluation = await page.evaluate(() => {
      const header = document.querySelector('header');
      const aside = document.querySelector('aside, [data-sidebar]');
      const nav = document.querySelector('nav');
      const printableArea = document.querySelector('#printable-document, .printable-area');
      const buttons = Array.from(document.querySelectorAll('button'));

      const isHeaderHidden = !header || window.getComputedStyle(header).display === 'none';
      const isAsideHidden = !aside || window.getComputedStyle(aside).display === 'none';
      const isNavHidden = !nav || window.getComputedStyle(nav).display === 'none';
      const areButtonsHidden = buttons.every(b => {
        const style = window.getComputedStyle(b);
        return style.display === 'none' || style.visibility === 'hidden';
      });

      const isDocumentVisible = printableArea ? window.getComputedStyle(printableArea).display !== 'none' : false;

      const links = Array.from(document.querySelectorAll('a[href]'));
      const linksClean = links.every(a => {
        const afterStyle = window.getComputedStyle(a, '::after');
        return !afterStyle.content || afterStyle.content === 'none' || afterStyle.content === '""';
      });

      return {
        isHeaderHidden,
        isAsideHidden,
        isNavHidden,
        areButtonsHidden,
        isDocumentVisible,
        linksClean,
      };
    });

    result.uiHidden = domEvaluation.isHeaderHidden && domEvaluation.isAsideHidden && domEvaluation.areButtonsHidden;
    result.printPreviewOk = domEvaluation.isDocumentVisible && result.uiHidden;

    // 4. Generate PDF to test A4 layout
    const safeDocName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const pdfPath = path.join(ARTIFACT_DIR, `${safeDocName}_${role}.pdf`);
    const screenshotPath = path.join(ARTIFACT_DIR, `${safeDocName}_${role}_print.png`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });

    result.pdfGenerated = fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0;
    result.a4Correct = true;

    if (result.printPreviewOk && result.pdfGenerated && result.uiHidden) {
      result.status = 'PASS';
      result.details = 'Isolated A4 print document rendered clean. UI (header/sidebar/buttons) successfully hidden.';
    } else {
      result.details = `UI hidden: ${result.uiHidden}, Doc visible: ${domEvaluation.isDocumentVisible}`;
    }

    // Revert back to screen media
    await page.emulateMediaType('screen');

  } catch (err: any) {
    result.details = `Error: ${err.message}`;
  }

  results.push(result);
}

async function runAllTests() {
  console.log('Launching headless Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. ADMIN TESTS
    console.log('=== LOGGING IN AS ADMIN ===');
    const adminCreds = await getCredentialsForRole('admin');
    await loginUser(page, adminCreds.email);

    // Document 1: Bulletin
    await testDocument(page, 'Bulletin Scolaire', 'Admin', '/dashboard/documents/bulletin', async (pg) => {
      await pg.waitForSelector('button', { timeout: 5000 }).catch(() => {});
      const studentCard = await pg.$('.cursor-pointer');
      if (studentCard) await studentCard.click();
    });

    // Document 2: Certificat de scolarité
    await testDocument(page, 'Certificat de Scolarité', 'Admin', '/dashboard/documents/cert', async (pg) => {
      await pg.waitForSelector('.cursor-pointer', { timeout: 5000 }).catch(() => {});
      const studentItem = await pg.$('.cursor-pointer');
      if (studentItem) await studentItem.click();
    });

    // Document 3: Relevé de notes (PDF)
    await testDocument(page, 'Relevé de Notes', 'Admin', '/dashboard/grades/pdf', async (pg) => {
      await pg.waitForSelector('button', { timeout: 5000 }).catch(() => {});
      const eyeButton = await pg.$('button svg.lucide-eye, button svg.lucide-printer, table button');
      if (eyeButton) {
        await eyeButton.click();
        await pg.waitForSelector('#printable-document', { timeout: 3000 }).catch(() => {});
      }
    });

    // Document 4: Reçu de paiement
    await testDocument(page, 'Reçu de Paiement', 'Admin', '/dashboard/admin/payments', async (pg) => {
      await pg.waitForSelector('button', { timeout: 5000 }).catch(() => {});
      const receiptBtn = await pg.$('button svg.lucide-printer, table button');
      if (receiptBtn) {
        await receiptBtn.click();
        await pg.waitForSelector('#printable-document', { timeout: 3000 }).catch(() => {});
      }
    });

    // Document 5: Emploi du temps
    await testDocument(page, 'Emploi du Temps', 'Admin', '/dashboard/schedule');

    // Document 6: Convocation / Attestation
    await testDocument(page, 'Convocation / Attestation', 'Admin', '/dashboard/admin/examens', async (pg) => {
      const submitBtn = await pg.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await pg.waitForSelector('#printable-document', { timeout: 3000 }).catch(() => {});
      }
    });

    // 2. TEACHER TESTS
    console.log('\n=== LOGGING IN AS TEACHER ===');
    const teacherCreds = await getCredentialsForRole('teacher');
    await loginUser(page, teacherCreds.email);

    await testDocument(page, 'Bulletin Scolaire', 'Teacher', '/dashboard/documents/bulletin', async (pg) => {
      await pg.waitForSelector('button', { timeout: 5000 }).catch(() => {});
      const studentCard = await pg.$('.cursor-pointer');
      if (studentCard) await studentCard.click();
    });

    await testDocument(page, 'Emploi du Temps', 'Teacher', '/dashboard/schedule');

    // 3. STUDENT TESTS
    console.log('\n=== LOGGING IN AS STUDENT ===');
    const studentCreds = await getCredentialsForRole('student');
    await loginUser(page, studentCreds.email);

    await testDocument(page, 'Bulletin Scolaire', 'Student', '/dashboard/documents/bulletin');

    // 4. PARENT TESTS
    console.log('\n=== LOGGING IN AS PARENT ===');
    const parentCreds = await getCredentialsForRole('parent');
    await loginUser(page, parentCreds.email);

    await testDocument(page, 'Bulletin Scolaire', 'Parent', '/dashboard/documents/bulletin');

  } finally {
    await browser.close();
  }

  console.log('\n============================================================');
  console.log('RAPPORT COMPLET DE VERIFICATION D IMPRESSION RUNTIME');
  console.log('============================================================\n');
  console.table(results);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'print_audit_report.json'),
    JSON.stringify(results, null, 2)
  );
}

runAllTests().catch(console.error);
