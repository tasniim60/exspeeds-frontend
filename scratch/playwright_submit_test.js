const { chromium } = require("C:/Users/TAMER/Downloads/exspeeds.com/public_html/blog/node_modules/playwright");
const path = require("path");
const fs = require("fs");

async function run() {
  console.log("Launching Chromium for submission test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/ar/register", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const testEmail = "playwright_user_" + Date.now() + "@exspeeds.com";
  console.log("Filling form with email:", testEmail);

  await page.fill('input[name="name"]', "عميل تجريبي بلاي رايت");
  await page.fill('input[name="phone"]', "01099887766");
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', "password123");
  await page.fill('input[name="confirmPassword"]', "password123");

  // Take screenshot before click
  const beforeSubmitPath = path.resolve("C:/Users/TAMER/.gemini/antigravity/brain/1c28e68b-7795-4a88-b4bf-2023887b7e3d/register_filled_screenshot.png");
  await page.screenshot({ path: beforeSubmitPath });
  console.log("Filled screenshot saved:", beforeSubmitPath);

  // Click create account
  await page.click('button[type="submit"]');
  console.log("Clicked submit, waiting for navigation or response...");
  await page.waitForTimeout(3000);

  const afterSubmitPath = path.resolve("C:/Users/TAMER/.gemini/antigravity/brain/1c28e68b-7795-4a88-b4bf-2023887b7e3d/register_after_submit_screenshot.png");
  await page.screenshot({ path: afterSubmitPath });
  console.log("After submit screenshot saved:", afterSubmitPath);
  console.log("Current URL after submit:", page.url());

  // Check customer in .data/customers.json
  const customersPath = path.resolve(__dirname, "../.data/customers.json");
  if (fs.existsSync(customersPath)) {
    const list = JSON.parse(fs.readFileSync(customersPath, "utf8"));
    const created = list.find(c => c.email === testEmail);
    console.log("Verified in database:", created);
  }

  await browser.close();
}

run().catch(err => {
  console.error("Submission test error:", err);
  process.exit(1);
});
