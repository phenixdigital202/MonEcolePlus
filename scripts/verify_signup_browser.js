const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runAudit() {
  console.log("==================================================");
  console.log("STARTING REAL BROWSER AUDIT — SIGNUP & AUTH");
  console.log("==================================================");

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
    if (msg.type() === "error" || text.includes("Digest:") || text.includes("Error")) {
      console.log(`[Browser Console ${msg.type().toUpperCase()}]`, text);
    }
  });

  page.on("requestfailed", req => {
    networkErrors.push({ url: req.url(), errorText: req.failure() ? req.failure().errorText : "Unknown" });
    console.log(`[Network Error] ${req.url()} - ${req.failure() ? req.failure().errorText : ""}`);
  });

  const report = {
    signupScenario: {},
    logoutLoginScenario: {},
    existingUserScenario: {},
    duplicateEmailScenario: {},
    databaseCheck: {},
    consoleErrors: [],
    networkErrors: []
  };

  const testEmail = `audit_browser_${Date.now()}@monecole.ci`;
  const testSchool = `Lycée Excellence Audit ${Date.now().toString().slice(-4)}`;
  const testPassword = "Password123!";

  try {
    // ----------------------------------------------------
    // SCENARIO 1: SIGNUP NEW USER & NEW SCHOOL
    // ----------------------------------------------------
    console.log("\n--- SCENARIO 1: SIGNUP NEW USER & SCHOOL ---");
    console.log(`Navigating to ${BASE_URL}/signup...`);
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle2" });

    console.log("Filling form...");
    await page.type("input[name='firstName']", "Audit");
    await page.type("input[name='lastName']", "Final");
    await page.type("input[name='school']", testSchool);
    await page.type("input[name='email']", testEmail);
    await page.type("input[name='password']", testPassword);
    
    // Select role admin if dropdown exists
    const roleSelect = await page.$("select[name='role']");
    if (roleSelect) {
      await page.select("select[name='role']", "admin");
    }

    console.log("Submitting signup form...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(e => console.log("Navigation timeout or inline response:", e.message)),
      page.click("button[type='submit']")
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const currentUrlAfterSignup = page.url();
    const pageContentAfterSignup = await page.content();

    const hasDetermineSchoolError = pageContentAfterSignup.includes("Impossible de déterminer l'établissement de l'utilisateur");
    console.log(`Current URL after signup: ${currentUrlAfterSignup}`);
    console.log(`Has 'Impossible de déterminer...' error: ${hasDetermineSchoolError}`);

    report.signupScenario.urlAfterSignup = currentUrlAfterSignup;
    report.signupScenario.hasDetermineSchoolError = hasDetermineSchoolError;

    // Verify redirection to /signup/success or /dashboard
    if (currentUrlAfterSignup.includes("/signup/success")) {
      console.log("✅ Redirected to /signup/success!");
      report.signupScenario.successPageReached = true;

      // Navigate to dashboard
      console.log("Navigating to /dashboard...");
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2" });
    } else if (currentUrlAfterSignup.includes("/dashboard")) {
      console.log("✅ Directly reached /dashboard!");
      report.signupScenario.successPageReached = true;
    } else {
      console.log("⚠️ Page after signup was:", currentUrlAfterSignup);
    }

    const dashboardUrl = page.url();
    const dashboardContent = await page.content();
    console.log(`Dashboard URL: ${dashboardUrl}`);

    const cookiesAfterSignup = await page.cookies();
    const userIdCookie = cookiesAfterSignup.find(c => c.name === "user_id")?.value;
    const schoolIdCookie = cookiesAfterSignup.find(c => c.name === "school_id")?.value;
    const userRoleCookie = cookiesAfterSignup.find(c => c.name === "user_role")?.value;

    console.log(`Cookies after signup: user_id=${userIdCookie}, school_id=${schoolIdCookie}, user_role=${userRoleCookie}`);

    report.signupScenario.dashboardUrl = dashboardUrl;
    report.signupScenario.cookies = { userIdCookie, schoolIdCookie, userRoleCookie };
    report.signupScenario.dashboardLoaded = dashboardUrl.includes("/dashboard") && !dashboardContent.includes("An error occurred");
    report.signupScenario.schoolNameInDashboard = dashboardContent.includes(testSchool) || dashboardContent.includes(testSchool.trim());
    report.signupScenario.emailUsed = testEmail;

    // ----------------------------------------------------
    // SCENARIO 2: LOGOUT / LOGIN CYCLE
    // ----------------------------------------------------
    console.log("\n--- SCENARIO 2: LOGOUT / LOGIN CYCLE ---");
    console.log("Logging out...");
    // Clear cookies or visit logout
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    // Clear cookies explicitly to simulate fresh browser session
    await page.deleteCookie({ name: "user_id" }, { name: "school_id" }, { name: "user_role" });

    console.log("Logging in with newly created user...");
    await page.type("input[name='email']", testEmail);
    await page.type("input[name='password']", testPassword);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(e => console.log("Nav timeout:", e.message)),
      page.click("button[type='submit']")
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const urlAfterLogin = page.url();
    const contentAfterLogin = await page.content();
    const cookiesAfterLogin = await page.cookies();

    console.log(`URL after login: ${urlAfterLogin}`);
    console.log(`Cookies after login: user_id=${cookiesAfterLogin.find(c => c.name === "user_id")?.value}, school_id=${cookiesAfterLogin.find(c => c.name === "school_id")?.value}`);

    report.logoutLoginScenario.loginSuccess = urlAfterLogin.includes("/dashboard");
    report.logoutLoginScenario.urlAfterLogin = urlAfterLogin;
    report.logoutLoginScenario.cookies = {
      userIdCookie: cookiesAfterLogin.find(c => c.name === "user_id")?.value,
      schoolIdCookie: cookiesAfterLogin.find(c => c.name === "school_id")?.value,
      userRoleCookie: cookiesAfterLogin.find(c => c.name === "user_role")?.value
    };

    // ----------------------------------------------------
    // SCENARIO 3: TEST DUPLICATE EMAIL SIGNUP
    // ----------------------------------------------------
    console.log("\n--- SCENARIO 3: TEST DUPLICATE EMAIL SIGNUP ---");
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle2" });
    await page.type("input[name='firstName']", "Audit");
    await page.type("input[name='lastName']", "Dup");
    await page.type("input[name='school']", "Another School Name");
    await page.type("input[name='email']", testEmail); // Duplicate email
    await page.type("input[name='password']", "Password123!");
    
    await page.click("button[type='submit']");
    await new Promise(r => setTimeout(r, 2000));

    const contentDupSignup = await page.content();
    const hasDuplicateEmailError = contentDupSignup.includes("déjà utilisé") || contentDupSignup.includes("deja utilise") || contentDupSignup.includes("error");
    console.log(`Duplicate email error displayed: ${hasDuplicateEmailError}`);
    report.duplicateEmailScenario.properErrorDisplayed = hasDuplicateEmailError;

  } catch (err) {
    console.error("Error during browser audit execution:", err);
    report.error = err.message;
  } finally {
    await browser.close();
  }

  report.consoleErrors = consoleLogs.filter(l => l.type === "error");
  report.networkErrors = networkErrors;

  fs.writeFileSync(
    path.join(__dirname, "browser_audit_results.json"),
    JSON.stringify({ testEmail, testSchool, testPassword, report }, null, 2)
  );

  console.log("\n==================================================");
  console.log("BROWSER AUDIT COMPLETE. Saved to browser_audit_results.json");
  console.log("==================================================");
}

runAudit();
