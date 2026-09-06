import puppeteer from "puppeteer"
import * as fs from "fs"
import * as path from "path"

async function runPrintTests() {
  console.log("====================================================")
  console.log("   AUTOMATED PRINT SYSTEM & DOCUMENT E2E AUDIT      ")
  console.log("====================================================")

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  } catch (e) {
    console.log("Launching system chrome browser fallback...")
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox']
    })
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  const screenshotsDir = path.join(process.cwd(), "artifacts_print_tests")
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  let totalTests = 0
  let passCount = 0

  const runPrintCheck = async (
    roleName: string,
    loginEmail: string,
    targetUrl: string,
    docName: string
  ) => {
    totalTests++
    console.log(`\n--- Test #${totalTests}: [${roleName}] Document "${docName}" at ${targetUrl} ---`)
    
    // 1. Login
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" })
    await page.type('input[type="email"]', loginEmail)
    await page.type('input[type="password"]', "password123")
    
    const submitBtn = await page.$('button[type="submit"]')
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        submitBtn.click()
      ])
    }

    // 2. Navigate to target URL
    await page.goto(`http://localhost:3000${targetUrl}`, { waitUntil: "networkidle2" })

    // If bulletin page and selection step, click generate or select student
    if (targetUrl.includes("/bulletin")) {
      const generateBtn = await page.$('button:has-text("Générer tous les bulletins")')
      if (generateBtn) {
        await generateBtn.click()
        await new Promise(r => setTimeout(r, 2000))
      }
    } else if (targetUrl.includes("/cert")) {
      const studentCard = await page.$('div.cursor-pointer')
      if (studentCard) {
        await studentCard.click()
        await new Promise(r => setTimeout(r, 1500))
      }
    } else if (targetUrl.includes("/grades/pdf")) {
      const genBtn = await page.$('button:has-text("Générer les bulletins")')
      if (genBtn) {
        await genBtn.click()
        await new Promise(r => setTimeout(r, 2000))
        const previewBtn = await page.$('button:has-text("Aperçu / Imp.")')
        if (previewBtn) {
          await previewBtn.click()
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    }

    // 3. Emulate print media
    await page.emulateMediaType('print')

    // 4. Verify Printable area exists
    const printableDoc = await page.$("#printable-document, .printable-area")
    if (!printableDoc) {
      console.error(`❌ FAIL: Printable document element (#printable-document / .printable-area) NOT found on page ${targetUrl}`)
      return
    }

    // 5. Verify Interface elements are HIDDEN under @media print
    const hiddenElementsCheck = await page.evaluate(() => {
      const sidebar = document.querySelector("aside") || document.querySelector("[data-sidebar]")
      const header = document.querySelector("header")
      const actionButtons = document.querySelectorAll("button.no-print, button.print\\:hidden, .no-print button")
      
      const isSidebarHidden = !sidebar || window.getComputedStyle(sidebar).display === "none"
      const isHeaderHidden = !header || window.getComputedStyle(header).display === "none"
      
      let allButtonsHidden = true
      actionButtons.forEach(btn => {
        if (window.getComputedStyle(btn).display !== "none") {
          allButtonsHidden = false
        }
      })

      const documentElem = document.querySelector("#printable-document") || document.querySelector(".printable-area")
      const isDocumentVisible = documentElem && window.getComputedStyle(documentElem).display !== "none"

      return {
        isSidebarHidden,
        isHeaderHidden,
        allButtonsHidden,
        isDocumentVisible
      }
    })

    console.log("Print Emulation Results:", hiddenElementsCheck)

    if (
      hiddenElementsCheck.isSidebarHidden &&
      hiddenElementsCheck.isHeaderHidden &&
      hiddenElementsCheck.isDocumentVisible
    ) {
      console.log(`✅ PASS: [${roleName}] Document "${docName}" correctly isolated for A4 printing! Interface elements hidden.`)
      passCount++
    } else {
      console.error(`❌ FAIL: Interface elements still visible or document hidden under print media!`)
    }

    // Save print emulation screenshot
    const screenshotPath = path.join(screenshotsDir, `${roleName.toLowerCase()}_${docName.toLowerCase().replace(/\s+/g, '_')}_print.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`📸 Saved print emulation screenshot to: ${screenshotPath}`)

    // Reset media
    await page.emulateMediaType(null)

    // Logout
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle2" })
    const logoutBtn = await page.$('button:has-text("Déconnexion"), a[href*="logout"]')
    if (logoutBtn) {
      await logoutBtn.click()
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  try {
    // 1. Admin Cocody - Bulletin & Certificat
    await runPrintCheck("ADMIN_COCODY", "admin.cocody@monecole.ci", "/dashboard/documents/bulletin", "Bulletin Scolaire")
    await runPrintCheck("ADMIN_COCODY", "admin.cocody@monecole.ci", "/dashboard/documents/cert", "Certificat de Scolarite")

    // 2. Admin Abou - Bulletin & Relevé
    await runPrintCheck("ADMIN_ABOU", "admin.abou@monecole.ci", "/dashboard/documents/bulletin", "Bulletin Scolaire")
    await runPrintCheck("ADMIN_ABOU", "admin.abou@monecole.ci", "/dashboard/grades/pdf", "Relevé de Notes PDF")

    // 3. Enseignant Cocody - Bulletin
    await runPrintCheck("TEACHER_COCODY", "prof.math.cocody@monecole.ci", "/dashboard/documents/bulletin", "Bulletin Enseignant")

    // 4. Élève Cocody - Bulletin
    await runPrintCheck("STUDENT_COCODY", "eleve.cocody@monecole.ci", "/dashboard/documents/bulletin", "Bulletin Élève")

    // 5. Parent Cocody - Bulletin
    await runPrintCheck("PARENT_COCODY", "parent.cocody@monecole.ci", "/dashboard/parent", "Bulletin Parent")

    console.log("\n====================================================")
    console.log(`   SUMMARY: ${passCount} / ${totalTests} TESTS PASSED`)
    console.log("====================================================")

    await browser.close()

    if (passCount === totalTests) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  } catch (error) {
    console.error("Error during E2E print tests:", error)
    await browser.close()
    process.exit(1)
  }
}

runPrintTests()
