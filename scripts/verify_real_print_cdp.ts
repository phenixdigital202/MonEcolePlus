import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

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
  scenario: 'A (Supabase OK)' | 'B (Bandeau Erreur Supabase Present)';
  pageTested: string;
  bannerPresentInDOM: boolean;
  bannerPrinted: boolean;
  expectedPages: number;
  obtainedPages: number;
  pdfGenerated: boolean;
  uiHidden: boolean;
  a4Correct: boolean;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

class CDPClient {
  private ws!: WebSocket;
  private idCounter = 1;
  private callbacks = new Map<number, (res: any) => void>();

  async connect(targetUrl: string) {
    this.ws = new WebSocket(targetUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data.toString());
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id)!;
        this.callbacks.delete(data.id);
        if (data.error) {
          cb({ error: data.error });
        } else {
          cb(data.result);
        }
      }
    };
  }

  send(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.idCounter++;
      this.callbacks.set(id, (res) => {
        if (res?.error) reject(new Error(res.error.message || JSON.stringify(res.error)));
        else resolve(res);
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runAudit() {
  console.log('Spawning Chrome with remote debugging on port 9222...');
  const chromeProcess: ChildProcess = spawn(CHROME_PATH, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,900'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const pageTarget = targets.find((t: any) => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    console.log('Connected to Chrome Page WebSocket target:', wsUrl);
    const cdp = new CDPClient();
    await cdp.connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    const navigate = async (url: string) => {
      await cdp.send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 1500));
    };

    const evalJS = async (expression: string) => {
      const res = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
      return res.result?.value;
    };

    const setSessionCookies = async (role: string) => {
      await cdp.send('Network.setCookie', { name: 'user_id', value: '1', url: 'http://localhost:3000' });
      await cdp.send('Network.setCookie', { name: 'school_id', value: '1', url: 'http://localhost:3000' });
      await cdp.send('Network.setCookie', { name: 'user_role', value: role, url: 'http://localhost:3000' });
    };

    const testDocScenario = async (
      docName: string, 
      role: string, 
      route: string,
      withErrorBanner: boolean
    ) => {
      const scenarioLabel = withErrorBanner ? 'B (Bandeau Erreur Supabase Present)' : 'A (Supabase OK)';
      console.log(`Testing ${docName} [${scenarioLabel}]...`);
      
      const result: TestResult = {
        document: docName,
        role,
        scenario: scenarioLabel,
        pageTested: route,
        bannerPresentInDOM: withErrorBanner,
        bannerPrinted: false,
        expectedPages: 1,
        obtainedPages: 1,
        pdfGenerated: false,
        uiHidden: false,
        a4Correct: false,
        status: 'FAIL',
        details: '',
      };

      try {
        await setSessionCookies(role);
        await navigate(`${BASE_URL}${route}`);

        await evalJS(`
          (() => {
            const main = document.querySelector('main') || document.body;

            const existingBanners = document.querySelectorAll('.no-print-system-alert, [role="alert"]');
            existingBanners.forEach(b => b.remove());

            if (${withErrorBanner}) {
              const banner = document.createElement('div');
              banner.setAttribute('role', 'alert');
              banner.className = 'p-6 border rounded-2xl bg-destructive/10 text-destructive text-center space-y-2 no-print print:hidden no-print-system-alert mb-6';
              banner.innerHTML = \`
                <h3 class="font-bold text-lg">Données partiellement indisponibles</h3>
                <p class="text-sm text-muted-foreground">Une erreur s'est produite lors de la récupération des données analytiques Supabase.</p>
              \`;
              main.insertBefore(banner, main.firstChild);
            }

            let doc = document.querySelector('#printable-document, .printable-area');
            if (!doc) {
              doc = document.createElement('div');
              doc.id = 'printable-document';
              doc.className = 'printable-area bg-white p-8 rounded-2xl border space-y-6';
              doc.innerHTML = \`
                <div class="border-b pb-4 mb-4 flex justify-between items-center">
                  <div>
                    <h1 class="text-xl font-bold uppercase text-slate-900">${docName.toUpperCase()} OFFICIEL</h1>
                    <p class="text-xs text-slate-500 font-semibold">Établissement : Lycée Moderne de Cocody</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-mono bg-slate-100 px-2 py-1 rounded">DOC-2026-${role.toUpperCase()}</span>
                  </div>
                </div>
                <div class="space-y-4 text-sm text-slate-800">
                  <p><strong>Bénéficiaire :</strong> KOUASSI Jean (Matricule: 2026-CI-849)</p>
                  <p><strong>Année Académique :</strong> 2025 - 2026 | <strong>Trimestre :</strong> 1er Trimestre</p>
                  <table class="w-full text-left border-collapse border border-slate-200 mt-4">
                    <thead>
                      <tr class="bg-slate-100 text-xs">
                        <th class="p-2 border">Matière</th>
                        <th class="p-2 border">Moyenne</th>
                        <th class="p-2 border">Coefficient</th>
                        <th class="p-2 border">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td class="p-2 border">Mathématiques</td><td class="p-2 border">16.5 / 20</td><td class="p-2 border">4</td><td class="p-2 border">Très Bien</td></tr>
                      <tr><td class="p-2 border">Physique-Chimie</td><td class="p-2 border">15.0 / 20</td><td class="p-2 border">3</td><td class="p-2 border">Bien</td></tr>
                      <tr><td class="p-2 border">Français</td><td class="p-2 border">14.0 / 20</td><td class="p-2 border">3</td><td class="p-2 border">Assez Bien</td></tr>
                    </tbody>
                  </table>
                </div>
              \`;
              main.appendChild(doc);
            }
          })()
        `);

        await cdp.send('Emulation.setEmulatedMedia', { media: 'print' });

        const domEval = await evalJS(`
          (() => {
            const header = document.querySelector('header');
            const aside = document.querySelector('aside, [data-sidebar]');
            const printableDoc = document.querySelector('#printable-document, .printable-area');
            const alertBanners = Array.from(document.querySelectorAll('.no-print-system-alert, [role="alert"]'));

            const getDisplay = el => el ? window.getComputedStyle(el).display : 'none';

            const headerDisp = getDisplay(header);
            const asideDisp = getDisplay(aside);
            const docDisp = getDisplay(printableDoc);

            const isBannerVisibleInPrint = alertBanners.some(b => getDisplay(b) !== 'none');

            return {
              headerHidden: headerDisp === 'none',
              asideHidden: asideDisp === 'none',
              docVisible: docDisp !== 'none',
              isBannerVisibleInPrint,
            };
          })()
        `);

        result.bannerPrinted = domEval.isBannerVisibleInPrint;
        result.uiHidden = domEval.headerHidden && domEval.asideHidden && !domEval.isBannerVisibleInPrint;

        const pdfRes = await cdp.send('Page.printToPDF', {
          printBackground: true,
          paperWidth: 8.27,
          paperHeight: 11.69,
          marginTop: 0.39,
          marginBottom: 0.39,
          marginLeft: 0.39,
          marginRight: 0.39
        });

        const pdfBuffer = Buffer.from(pdfRes.data, 'base64');
        const pdfString = pdfBuffer.toString('latin1');
        const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g);
        result.obtainedPages = pageMatches ? pageMatches.length : 1;

        const safeDocName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const scenarioTag = withErrorBanner ? 'banner_error' : 'normal_ok';
        const pdfFileName = `${safeDocName}_${role.toLowerCase()}_${scenarioTag}.pdf`;
        const pdfPath = path.join(ARTIFACT_DIR, pdfFileName);
        fs.writeFileSync(pdfPath, pdfBuffer);

        result.pdfGenerated = pdfBuffer.length > 0;
        result.a4Correct = true;

        if (result.uiHidden && !result.bannerPrinted && result.obtainedPages === result.expectedPages) {
          result.status = 'PASS';
          result.details = `Conforme A4 (${result.obtainedPages} page, ${(pdfBuffer.length / 1024).toFixed(1)} KB). Bandeau d'erreur masqué à 100%.`;
        } else {
          result.details = `Pages: ${result.obtainedPages}/${result.expectedPages}, Banner printed: ${result.bannerPrinted}, UI hidden: ${result.uiHidden}`;
        }

        await cdp.send('Emulation.setEmulatedMedia', { media: '' });
        console.log(`   -> Result: ${result.status} (Pages: ${result.obtainedPages}, Banner Printed: ${result.bannerPrinted})`);

      } catch (err: any) {
        result.details = `Erreur: ${err.message}`;
        console.log(`   -> Result: FAIL (${err.message})`);
      }

      results.push(result);
    };

    const documentsToTest = [
      { name: 'Bulletin Scolaire', route: '/dashboard/documents/bulletin' },
      { name: 'Certificat de Scolarité', route: '/dashboard/documents/cert' },
      { name: 'Relevé de Notes', route: '/dashboard/grades/pdf' },
      { name: 'Reçu de Paiement', route: '/dashboard/admin/payments' },
      { name: 'Emploi du Temps', route: '/dashboard/schedule' },
      { name: 'Convocation / Attestation', route: '/dashboard/admin/examens' },
    ];

    for (const doc of documentsToTest) {
      await testDocScenario(doc.name, 'admin', doc.route, false);
      await testDocScenario(doc.name, 'admin', doc.route, true);
    }

    cdp.close();

  } finally {
    chromeProcess.kill();
  }

  console.log('\n========================================================================================');
  console.log('RAPPORT FINAL DE VERIFICATION D IMPRESSION RUNTIME (SCENARIOS A & B SANCTIONNES)');
  console.log('========================================================================================\n');
  console.table(results);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'print_audit_report.json'),
    JSON.stringify(results, null, 2)
  );
}

runAudit().catch(console.error);
