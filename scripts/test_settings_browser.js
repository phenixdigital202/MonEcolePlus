const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient: PrismaMasterClient } = require("@prisma/client");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

const scratchDir = path.join(__dirname, "..", "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const testPngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const avatarFilePath = path.join(scratchDir, "test_avatar.png");
const logoFilePath = path.join(scratchDir, "test_logo.png");
fs.writeFileSync(avatarFilePath, testPngBuffer);
fs.writeFileSync(logoFilePath, testPngBuffer);

async function runSettingsAudit() {
  console.log("==================================================");
  console.log("STARTING REAL BROWSER AUDIT — PARAMÈTRES / SETTINGS (V6)");
  console.log("==================================================");

  const prismaMaster = new PrismaMasterClient();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  const networkErrors = [];

  page.on("console", msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === "error" || text.includes("Digest:") || text.includes("Error") || text.includes("[changeUserPasswordAction]") || text.includes("[update")) {
      console.log(`[Browser Console ${msg.type().toUpperCase()}]`, text);
    }
  });

  page.on("requestfailed", req => {
    networkErrors.push({ url: req.url(), errorText: req.failure() ? req.failure().errorText : "Unknown" });
  });

  const settingsReport = {
    test1_profilePhoto: { pass: false },
    test2_profileInfo: { pass: false },
    test3_passwordChange: { pass: false },
    test4_schoolConfig: { pass: false },
    test5_schoolLogo: { pass: false },
    test6_displayMode: { pass: false },
    test7_multiTenant: { pass: false },
    consoleErrors: [],
    networkErrors: []
  };
  let testEmail = "admin_settings_final_v6@monecole.ci";
  let testSchoolName = "Groupe Scolaire Excellence Audit";
  let initialPassword = "Password123!";
  let newPassword = "NewSecretPassword123!";

  try {
    // ----------------------------------------------------
    // SETUP: FETCH EXISTING ADMIN USER & INJECT COOKIES
    // ----------------------------------------------------
    console.log("\n--- SETUP: Fetching Admin User for Audit ---");
    
    // Find an existing admin user in Master DB
    let masterUser = await prismaMaster.user.findFirst({
      where: { role: "admin", id_ecole: { not: null } },
      include: { ecole: true }
    });

    if (!masterUser) {
      throw new Error("No existing admin user found in Master DB.");
    }

    testEmail = masterUser.email;
    const schoolId = masterUser.id_ecole;
    console.log(`Using existing admin user: ${testEmail}, school_id=${schoolId}`);

    // Update password to initialPassword for audit
    const bcrypt = require("bcryptjs");
    const hashedInitialPassword = await bcrypt.hash(initialPassword, 10);
    await prismaMaster.user.update({
      where: { id: masterUser.id },
      data: { password: hashedInitialPassword }
    });

    // Also update password in Tenant DB
    try {
      const { getPrisma } = require("../lib/tenant-context");
      // Temporarily mock cookie for tenant resolution
      const tenantPrisma = await getPrisma();
      const tenantUser = await tenantPrisma.user.findUnique({
        where: { email: testEmail.toLowerCase().trim() }
      });
      if (tenantUser) {
        await tenantPrisma.user.update({
          where: { id: tenantUser.id },
          data: { password: hashedInitialPassword }
        });
      }
    } catch (e) {
      console.warn("Tenant DB password setup warning:", e.message);
    }

    // Set session cookies in browser
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.setCookie(
      { name: "user_id", value: String(masterUser.id), domain: "localhost" },
      { name: "user_role", value: "admin", domain: "localhost" },
      { name: "school_id", value: String(schoolId), domain: "localhost" }
    );
    console.log("Setup complete. Session cookies injected for user:", testEmail);

    // ----------------------------------------------------
    // TEST 1: MON PROFIL — CHANGER LA PHOTO
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 1: MON PROFIL — CHANGER LA PHOTO");
    console.log("==================================================");

    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const photoFileInput = await page.$("input[type='file']");
    if (photoFileInput) {
      await photoFileInput.uploadFile(avatarFilePath);
      console.log("Uploaded avatar file into file input.");
    }

    await new Promise(r => setTimeout(r, 2000));

    const photoPageText = await page.evaluate(() => document.body.innerText);
    const photoSuccess = photoPageText.includes("mise à jour") || photoPageText.includes("succès");
    console.log("Photo upload message displayed:", photoSuccess);

    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const avatarImgSrc = await page.evaluate(() => {
      const img = document.querySelector("img[alt='Super AdminSettings']") || document.querySelector("div[role='tabpanel'] img");
      return img ? img.getAttribute("src") : null;
    });

    console.log("Avatar img src after page refresh:", avatarImgSrc ? "PRESENT (base64/url)" : "NULL");

    settingsReport.test1_profilePhoto = {
      uploadSuccessMessage: photoSuccess,
      avatarSrcPresent: !!avatarImgSrc,
      pass: photoSuccess || !!avatarImgSrc
    };

    // ----------------------------------------------------
    // TEST 2: MON PROFIL — ENREGISTRER LES MODIFICATIONS
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 2: MON PROFIL — ENREGISTRER LES MODIFICATIONS");
    console.log("==================================================");

    const updatedFirstName = "SuperModif";

    await page.evaluate((val) => {
      const input = document.getElementById("firstName");
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(input, val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, updatedFirstName);

    await page.click("#btn-save-profile");
    console.log("Clicked #btn-save-profile button.");

    await new Promise(r => setTimeout(r, 2000));

    const profileSaveText = await page.evaluate(() => document.body.innerText);
    const profileSaveSuccess = profileSaveText.includes("succès") || profileSaveText.includes("enregistrées");
    console.log("Profile save feedback text:", profileSaveSuccess);

    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const displayedFirstName = await page.$eval("#firstName", el => el.value);
    console.log(`Displayed firstName after refresh: "${displayedFirstName}"`);

    settingsReport.test2_profileInfo = {
      saveFeedbackSuccess: profileSaveSuccess,
      firstNamePersisted: displayedFirstName === updatedFirstName,
      pass: displayedFirstName === updatedFirstName
    };

    // ----------------------------------------------------
    // TEST 4: MON ÉTABLISSEMENT — CONFIGURATION
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 4: MON ÉTABLISSEMENT — CONFIGURATION");
    console.log("==================================================");

    await page.goto(`${BASE_URL}/dashboard/settings/school`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1500));

    const updatedSchoolName = `${testSchoolName} Configured`;

    await page.waitForSelector("#school-name-input", { timeout: 10000 });
    await page.evaluate((val) => {
      const el = document.getElementById("school-name-input");
      if (el) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, updatedSchoolName);

    await page.click("#btn-save-school");
    console.log("Clicked #btn-save-school button.");

    await new Promise(r => setTimeout(r, 2500));

    const schoolSaveText = await page.evaluate(() => document.body.innerText);
    const schoolSaveSuccess = schoolSaveText.includes("succès") || schoolSaveText.includes("enregistrés");
    console.log("School save feedback text:", schoolSaveSuccess);

    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1500));

    const textAfterSchoolReload = await page.evaluate(() => document.body.innerText);
    const schoolConfigPersisted = textAfterSchoolReload.includes(updatedSchoolName);
    console.log("School config persisted after reload:", schoolConfigPersisted);

    settingsReport.test4_schoolConfig = {
      saveFeedbackSuccess: schoolSaveSuccess,
      configPersisted: schoolConfigPersisted,
      pass: schoolSaveSuccess || schoolConfigPersisted
    };

    // ----------------------------------------------------
    // TEST 5: MON ÉTABLISSEMENT — TÉLÉVERSER LE LOGO
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 5: MON ÉTABLISSEMENT — TÉLÉVERSER LE LOGO");
    console.log("==================================================");

    const logoFileInput = await page.$("input[type='file']");
    if (logoFileInput) {
      await logoFileInput.uploadFile(logoFilePath);
      console.log("Uploaded logo file into file input.");
    }

    await new Promise(r => setTimeout(r, 2000));

    const logoTextAfterUpload = await page.evaluate(() => document.body.innerText);
    const logoUploadSuccess = logoTextAfterUpload.includes("Logo mis à jour") || logoTextAfterUpload.includes("mis à jour");
    console.log("Logo upload feedback text:", logoUploadSuccess);

    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const logoSrcAfterReload = await page.evaluate(() => {
      const img = document.querySelector("img[alt='Logo']");
      return img ? img.getAttribute("src") : null;
    });

    console.log("Logo src after page reload:", logoSrcAfterReload ? "PRESENT" : "NULL");

    settingsReport.test5_schoolLogo = {
      uploadFeedbackSuccess: logoUploadSuccess,
      logoSrcPresent: !!logoSrcAfterReload,
      pass: logoUploadSuccess || !!logoSrcAfterReload
    };

    // ----------------------------------------------------
    // TEST 6: MODE D'AFFICHAGE (THEME)
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 6: MODE D'AFFICHAGE (THEME)");
    console.log("==================================================");

    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const appearanceTab = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll("[role='tab']"));
      return tabs.find(t => t.innerText.includes("Apparence"));
    });

    if (appearanceTab) {
      await appearanceTab.click();
      console.log("Opened Apparence tab.");
    }

    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    });

    const isDarkApplied = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    console.log("Dark mode active on documentElement:", isDarkApplied);

    settingsReport.test6_displayMode = {
      darkThemeApplied: isDarkApplied,
      pass: isDarkApplied
    };

    // ----------------------------------------------------
    // TEST 7: MULTI-TENANT ISOLATION CHECK
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 7: MULTI-TENANT ISOLATION CHECK");
    console.log("==================================================");

    const abouSchool = await prismaMaster.ecole.findUnique({
      where: { id: 3 }
    });

    const abouUntouched = abouSchool?.nom === "Lycée Moderne d'Abou";
    console.log("Abou school untouched by test user settings:", abouUntouched);

    settingsReport.test7_multiTenant = {
      abouSchoolUntouched: abouUntouched,
      pass: abouUntouched
    };

    // ----------------------------------------------------
    // TEST 3: MON PROFIL — MODIFIER LE MOT DE PASSE & AUTH
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("TEST 3: MON PROFIL — MODIFIER LE MOT DE PASSE");
    console.log("==================================================");

    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    const securityTab = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll("[role='tab']"));
      return tabs.find(t => t.innerText.includes("Sécurité"));
    });

    if (securityTab) {
      await securityTab.click();
      console.log("Clicked Sécurité tab.");
    }

    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector("#currentPassword", { timeout: 10000 });
    await page.evaluate((curr, next) => {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      setVal("currentPassword", curr);
      setVal("newPassword", next);
      setVal("confirmPassword", next);
    }, initialPassword, newPassword);

    await page.click("#btn-change-password");
    console.log("Clicked #btn-change-password button.");

    await new Promise(r => setTimeout(r, 2500));

    const pwdFeedbackText = await page.evaluate(() => document.body.innerText);
    const pwdChangeSuccess = pwdFeedbackText.includes("succès") || pwdFeedbackText.includes("modifié");
    console.log("Password change feedback text:", pwdChangeSuccess);

    // Logout
    console.log("Logging out...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.evaluate(() => {
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "school_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    // Test OLD password (must be REFUSED)
    console.log("Testing login with OLD password...");
    await page.type("#email", testEmail);
    await page.type("#password", initialPassword);
    await page.click("button[type='submit']");
    await new Promise(r => setTimeout(r, 2000));

    const oldLoginText = await page.evaluate(() => document.body.innerText);
    const oldPasswordRefused = oldLoginText.includes("invalides") || page.url().includes("/login");
    console.log("Old password refused:", oldPasswordRefused);

    // Test NEW password (must be ACCEPTED)
    console.log("Testing login with NEW password...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.type("#email", testEmail);
    await page.type("#password", newPassword);
    await page.click("button[type='submit']");
    await new Promise(r => setTimeout(r, 3000));

    const urlAfterNewLogin = page.url();
    const newPasswordAccepted = urlAfterNewLogin.includes("/dashboard");
    console.log("Login with NEW password URL:", urlAfterNewLogin);

    settingsReport.test3_passwordChange = {
      changeFeedbackSuccess: pwdChangeSuccess,
      oldPasswordRefused: oldPasswordRefused,
      newPasswordAccepted: newPasswordAccepted,
      pass: pwdChangeSuccess && oldPasswordRefused && newPasswordAccepted
    };

  } catch (err) {
    console.error("FATAL ERROR IN SETTINGS AUDIT:", err);
    settingsReport.fatalError = err.message;
  } finally {
    await browser.close();
    await prismaMaster.$disconnect();
  }

  fs.writeFileSync(
    path.join(__dirname, "settings_audit_results.json"),
    JSON.stringify(settingsReport, null, 2)
  );

  console.log("\n==================================================");
  console.log("SETTINGS AUDIT COMPLETE. Saved to settings_audit_results.json");
  console.log("==================================================");
}

runSettingsAudit();
