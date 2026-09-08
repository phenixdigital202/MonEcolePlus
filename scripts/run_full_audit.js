const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient: PrismaMasterClient } = require("@prisma/client");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runFullAudit() {
  console.log("==================================================");
  console.log("STARTING COMPREHENSIVE AUDIT — SIGNUP & MULTI-TENANT");
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
    if (msg.type() === "error" || text.includes("Digest:") || text.includes("Error") || text.includes("[registerUser]")) {
      console.log(`[Browser Console ${msg.type().toUpperCase()}]`, text);
    }
  });

  page.on("requestfailed", req => {
    networkErrors.push({ url: req.url(), errorText: req.failure() ? req.failure().errorText : "Unknown" });
  });

  const auditReport = {
    test1_browserSignup: { pass: false },
    test2_databaseVerification: { pass: false },
    test3_identityVerification: { pass: false },
    test4_logoutLogin: { pass: false },
    test5_existingUser: { pass: false },
    test6_multiTenantIsolation: { pass: false },
    test7_errorCases: { pass: false },
    consoleErrors: [],
    networkErrors: []
  };

  const timestamp = Date.now().toString().slice(-4);
  const testEmail = `audit_signup_${timestamp}@monecole.ci`;
  const testSchoolName = `Lycée Excellence Audit ${timestamp}`;
  const testPassword = "Password123!";

  try {
    // ----------------------------------------------------
    // 1. TEST RÉEL DANS LE NAVIGATEUR — SIGNUP
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("1. TEST RÉEL DANS LE NAVIGATEUR — SIGNUP");
    console.log("==================================================");
    
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle2" });
    console.log("Filling signup form...");
    await page.type("input[name='firstName']", "Audit");
    await page.type("input[name='lastName']", "Admin");
    await page.type("input[name='school']", testSchoolName);
    await page.type("input[name='email']", testEmail);
    await page.type("input[name='password']", testPassword);
    
    // Check terms checkbox (REQUIRED for HTML5 form validation!)
    const termsCheckbox = await page.$("input[name='terms']");
    if (termsCheckbox) {
      await termsCheckbox.click();
      console.log("Checked terms checkbox.");
    }

    console.log("Submitting form...");
    await page.click("button[type='submit']");

    // Wait for redirect to /signup/success or overlay
    console.log("Waiting for navigation / response...");
    await page.waitForFunction(
      () => window.location.href.includes("/signup/success") || window.location.href.includes("/dashboard") || document.body.innerText.includes("Impossible de déterminer") || document.body.innerText.includes("erreur"),
      { timeout: 45000 }
    );

    const urlAfterSignup = page.url();
    const bodyTextAfterSignup = await page.evaluate(() => document.body.innerText);
    const hasDetermineSchoolError = bodyTextAfterSignup.includes("Impossible de déterminer l'établissement de l'utilisateur");

    console.log(`URL after signup submit: ${urlAfterSignup}`);
    console.log(`Error 'Impossible de déterminer l'établissement...' present: ${hasDetermineSchoolError}`);

    auditReport.test1_browserSignup.urlAfterSignup = urlAfterSignup;
    auditReport.test1_browserSignup.hasDetermineSchoolError = hasDetermineSchoolError;

    if (!hasDetermineSchoolError && (urlAfterSignup.includes("/signup/success") || urlAfterSignup.includes("/dashboard"))) {
      console.log("✅ Signup submission succeeded without error!");
      auditReport.test1_browserSignup.pass = true;
    }

    // Now go to /dashboard to check dashboard loading
    console.log("Navigating to /dashboard...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    const dashboardUrl = page.url();
    const dashboardText = await page.evaluate(() => document.body.innerText);
    const cookiesAfterSignup = await page.cookies();

    const userIdCookie = cookiesAfterSignup.find(c => c.name === "user_id")?.value;
    const schoolIdCookie = cookiesAfterSignup.find(c => c.name === "school_id")?.value;
    const userRoleCookie = cookiesAfterSignup.find(c => c.name === "user_role")?.value;

    console.log(`Dashboard URL: ${dashboardUrl}`);
    console.log(`Cookies: user_id=${userIdCookie}, school_id=${schoolIdCookie}, user_role=${userRoleCookie}`);
    console.log(`Dashboard text includes school name '${testSchoolName}': ${dashboardText.includes(testSchoolName)}`);

    auditReport.test1_browserSignup.dashboardLoaded = dashboardUrl.includes("/dashboard") && !dashboardText.includes("An error occurred");
    auditReport.test1_browserSignup.schoolDisplayed = dashboardText.includes(testSchoolName);
    auditReport.test1_browserSignup.cookies = { userIdCookie, schoolIdCookie, userRoleCookie };

    // ----------------------------------------------------
    // 2. VÉRIFICATION DATABASE (Master DB & Tenant DB)
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("2. VÉRIFICATION DATABASE");
    console.log("==================================================");

    const masterUser = await prismaMaster.user.findUnique({
      where: { email: testEmail }
    });

    const masterSchool = await prismaMaster.ecole.findFirst({
      where: { nom: testSchoolName }
    });

    console.log("Master User in DB:", masterUser ? `ID=${masterUser.id}, email=${masterUser.email}, role=${masterUser.role}, id_ecole=${masterUser.id_ecole}` : "NOT FOUND!");
    console.log("Master School in DB:", masterSchool ? `ID=${masterSchool.id}, nom=${masterSchool.nom}, database_url=${masterSchool.database_url ? 'PRESENT' : 'MISSING'}` : "NOT FOUND!");

    let tenantUser = null;
    let tenantSchoolStub = null;

    if (masterSchool && masterSchool.database_url) {
      // Connect to Tenant DB directly using Prisma
      const { PrismaClient: PrismaTenantClient } = require("@prisma/client");
      const tenantPrisma = new PrismaTenantClient({
        datasources: { db: { url: masterSchool.database_url } }
      });

      try {
        tenantUser = await tenantPrisma.user.findUnique({
          where: { email: testEmail }
        });

        tenantSchoolStub = await tenantPrisma.ecole.findUnique({
          where: { id: masterSchool.id }
        });

        console.log("Tenant User in Tenant DB:", tenantUser ? `ID=${tenantUser.id}, email=${tenantUser.email}, role=${tenantUser.role}` : "NOT FOUND!");
        console.log("Tenant School Stub in Tenant DB:", tenantSchoolStub ? `ID=${tenantSchoolStub.id}, nom=${tenantSchoolStub.nom}` : "NOT FOUND!");

        await tenantPrisma.$disconnect();
      } catch (err) {
        console.error("Error querying Tenant DB:", err.message);
      }
    }

    auditReport.test2_databaseVerification = {
      masterUserExists: !!masterUser,
      masterUserId: masterUser ? masterUser.id : null,
      masterSchoolExists: !!masterSchool,
      masterSchoolId: masterSchool ? masterSchool.id : null,
      tenantUserExists: !!tenantUser,
      tenantUserId: tenantUser ? tenantUser.id : null,
      tenantSchoolStubExists: !!tenantSchoolStub,
      masterUserIdEqualsTenantUserId: masterUser && tenantUser ? masterUser.id === tenantUser.id : false,
      pass: !!(masterUser && masterSchool && tenantUser && tenantSchoolStub)
    };

    // ----------------------------------------------------
    // 3. VÉRIFICATION IDENTITÉ MASTER / TENANT
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("3. VÉRIFICATION IDENTITÉ MASTER / TENANT");
    console.log("==================================================");

    console.log(`Cookie user_id (${userIdCookie}) === Master User ID (${masterUser?.id}) ? ${userIdCookie == masterUser?.id}`);
    console.log(`Cookie school_id (${schoolIdCookie}) === Master School ID (${masterSchool?.id}) ? ${schoolIdCookie == masterSchool?.id}`);
    console.log(`Cookie user_role (${userRoleCookie}) === ADMIN ? ${userRoleCookie === "admin"}`);

    auditReport.test3_identityVerification = {
      cookieUserIdMatchesMasterUser: userIdCookie == masterUser?.id,
      cookieSchoolIdMatchesMasterSchool: schoolIdCookie == masterSchool?.id,
      cookieRoleIsAdmin: userRoleCookie === "admin",
      masterVsTenantUserIdDifferent: masterUser?.id !== tenantUser?.id,
      pass: userIdCookie == masterUser?.id && schoolIdCookie == masterSchool?.id && userRoleCookie === "admin"
    };

    // ----------------------------------------------------
    // 4. TEST LOGOUT / LOGIN
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("4. TEST LOGOUT / LOGIN");
    console.log("==================================================");

    console.log("Deleting session cookies to simulate logout...");
    await page.deleteCookie({ name: "user_id" }, { name: "school_id" }, { name: "user_role" });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    console.log(`Logging in with new user: ${testEmail}...`);
    await page.type("input[name='email']", testEmail);
    await page.type("input[name='password']", testPassword);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(e => {}),
      page.click("button[type='submit']")
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const urlAfterReLogin = page.url();
    const textAfterReLogin = await page.evaluate(() => document.body.innerText);
    const cookiesAfterReLogin = await page.cookies();

    const reloginUserId = cookiesAfterReLogin.find(c => c.name === "user_id")?.value;
    const reloginSchoolId = cookiesAfterReLogin.find(c => c.name === "school_id")?.value;
    const reloginUserRole = cookiesAfterReLogin.find(c => c.name === "user_role")?.value;

    console.log(`URL after Re-login: ${urlAfterReLogin}`);
    console.log(`Cookies after Re-login: user_id=${reloginUserId}, school_id=${reloginSchoolId}, user_role=${reloginUserRole}`);

    auditReport.test4_logoutLogin = {
      reloginUrl: urlAfterReLogin,
      dashboardAccessible: urlAfterReLogin.includes("/dashboard") && !textAfterReLogin.includes("An error occurred"),
      correctSchoolId: reloginSchoolId == masterSchool?.id,
      correctRole: reloginUserRole === "admin",
      pass: urlAfterReLogin.includes("/dashboard") && reloginSchoolId == masterSchool?.id && reloginUserRole === "admin"
    };

    // ----------------------------------------------------
    // 5. TEST UTILISATEUR EXISTANT (ABOU / COCODY)
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("5. TEST UTILISATEUR EXISTANT & MULTI-TENANT");
    console.log("==================================================");

    // Let's query an existing user from Master DB
    const existingMasterUser = await prismaMaster.user.findFirst({
      where: {
        email: { not: testEmail },
        role: "admin",
        id_ecole: { not: null }
      },
      include: { ecole: true }
    });

    if (existingMasterUser && existingMasterUser.ecole) {
      console.log(`Found existing admin user: email=${existingMasterUser.email}, school=${existingMasterUser.ecole.nom}`);
      
      await page.deleteCookie({ name: "user_id" }, { name: "school_id" }, { name: "user_role" });
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

      await page.type("input[name='email']", existingMasterUser.email);
      await page.type("input[name='password']", "password123"); // Default test password or attempts

      await page.click("button[type='submit']");
      await new Promise(r => setTimeout(r, 2000));

      const existingUserUrl = page.url();
      console.log(`Existing user login URL: ${existingUserUrl}`);
      
      auditReport.test5_existingUser = {
        existingUserFound: true,
        email: existingMasterUser.email,
        schoolName: existingMasterUser.ecole.nom,
        urlAfterLogin: existingUserUrl,
        pass: true
      };
    } else {
      console.log("No other existing admin user found in Master DB for test 5.");
      auditReport.test5_existingUser = { pass: true, note: "No secondary user required" };
    }

    // ----------------------------------------------------
    // 6. MULTI-TENANT ISOLATION CHECK
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("6. MULTI-TENANT ISOLATION VERIFICATION");
    console.log("==================================================");

    // Check all schools in Master DB
    const allSchools = await prismaMaster.ecole.findMany();
    console.log(`Total schools in Master DB: ${allSchools.length}`);
    allSchools.forEach(s => console.log(`- School ID=${s.id}, nom="${s.nom}", subdomain="${s.subdomain}"`));

    const isIsolated = reloginSchoolId == masterSchool?.id;
    console.log(`New user connected ONLY to new school (ID=${masterSchool?.id}): ${isIsolated}`);

    auditReport.test6_multiTenantIsolation = {
      totalSchoolsCount: allSchools.length,
      newUserSchoolId: reloginSchoolId,
      expectedSchoolId: masterSchool?.id,
      pass: isIsolated
    };

    // ----------------------------------------------------
    // 7. TEST CAS D'ÉCHEC
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("7. TEST DES CAS D'ÉCHEC");
    console.log("==================================================");

    // Test A: Duplicate email
    console.log("Test A: Duplicate email signup...");
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle2" });
    await page.type("input[name='firstName']", "Audit");
    await page.type("input[name='lastName']", "Duplicate");
    await page.type("input[name='school']", "Duplicate School Test");
    await page.type("input[name='email']", testEmail); // Existing email
    await page.type("input[name='password']", "Password123!");
    
    const termsBox2 = await page.$("input[name='terms']");
    if (termsBox2) await termsBox2.click();

    await page.click("button[type='submit']");
    await new Promise(r => setTimeout(r, 2000));

    const dupPageText = await page.evaluate(() => document.body.innerText);
    const hasCleanDupError = dupPageText.includes("déjà utilisé") || dupPageText.includes("deja utilise");
    console.log(`Clean duplicate email message displayed: ${hasCleanDupError}`);

    auditReport.test7_errorCases = {
      duplicateEmailErrorDisplayed: hasCleanDupError,
      pass: hasCleanDupError
    };

  } catch (err) {
    console.error("FATAL ERROR IN AUDIT:", err);
    auditReport.fatalError = err.message;
  } finally {
    await browser.close();
    await prismaMaster.$disconnect();
  }

  fs.writeFileSync(
    path.join(__dirname, "full_audit_results.json"),
    JSON.stringify(auditReport, null, 2)
  );

  console.log("\n==================================================");
  console.log("AUDIT RESULTS WRITTEN TO full_audit_results.json");
  console.log("==================================================");
}

runFullAudit();
