const puppeteer = require("puppeteer");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 30 });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  await page.goto(`${BASE_URL}/login.html`, { waitUntil: "domcontentloaded" });
  await page.type("#loginIdentifier", "ryansylim@gmail.com");
  await page.type("#password", "abcd1234");

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click('button[type="submit"]'),
  ]);

  await page.goto(`${BASE_URL}/booking.html`, { waitUntil: "domcontentloaded" });

  await page.select("#sessionType", "Single Portrait");
  await page.evaluate(() => {
    const input = document.getElementById("preferredDate");
    input.value = "2025-08-15";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.select("#hour-select", "10");
  await page.select("#minute-select", "30");
  await page.type("#preferredLocation", "Memorial Union Terrace, Madison WI");
  await page.type("#fullName", "Ryan Lim");
  await page.type("#phoneNumber", "6088670980");
  await page.type("#emailAddress", "ryansylim@gmail.com");
  await page.type("#additionalNotes", "This is our simple test");

  await page.click("#bookingSubmitButton");

  await page.waitForFunction(() => {
    const success = document.getElementById("bookingSuccessMessage");
    return success && !success.classList.contains("is-hidden");
  }, { timeout: 12000 });

  await browser.close();
})();