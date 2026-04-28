/**
 * Klade Photography – Booking Flow Test
 *
 * Tests the full booking flow: login → fill form → submit → confirm success
 *
 * Setup:
 *   1. npm install puppeteer
 *   2. npx serve . -p 3000   (in a separate terminal)
 *   3. node test.js
 */

const puppeteer = require("puppeteer");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const TEST_USER = {
  email: "ryansylim@gmail.com",
  password: "abcd1234",
};

const TEST_BOOKING = {
  sessionType: "Single Portrait",
  preferredDate: "2025-08-15",
  hour: "10",
  minute: "30",
  location: "Memorial Union Terrace, Madison WI",
  fullName: "Ryan Lim",
  phone: "6088670980",
  email: "ryansylim@gmail.com",
  notes: "Puppeteer automated booking test",
};

// ─── tiny test runner ────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

// ─── main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\nKlade Photography – Booking Flow Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log("─".repeat(55));

  const browser = await puppeteer.launch({
    headless: false,        // set to "new" to run silently
    slowMo: 80,             // slows actions so you can watch
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // ── Step 1: Log in ─────────────────────────────────────────────────────────
  console.log("\n── Step 1: Login ───────────────────────────────────────");

  await test("Login page loads", async () => {
    await page.goto(`${BASE_URL}/login.html`, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    assert(title.toLowerCase().includes("login"), `Got title: "${title}"`);
  });

  await test("Fills in email and password", async () => {
    await page.type("#loginIdentifier", TEST_USER.email);
    await page.type("#password", TEST_USER.password);
    const emailVal = await page.$eval("#loginIdentifier", el => el.value);
    assert(emailVal === TEST_USER.email, `Email field value: "${emailVal}"`);
  });

  await test("Submits login form and redirects to homepage", async () => {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    const url = page.url();
    assert(url.includes("homepage.html"), `Expected homepage URL, got: "${url}"`);
  });

  await test("User is shown as logged in on navbar", async () => {
    // auth-ui.js adds a span with the user's name — wait for it
    await page.waitForFunction(
      () => {
        const spans = [...document.querySelectorAll(".navbar-start span")];
        return spans.some(s => s.textContent.toLowerCase().includes("logged in"));
      },
      { timeout: 8000 }
    );
    const navText = await page.$eval(".navbar-start", el => el.textContent);
    assert(navText.toLowerCase().includes("ryan"), `Nav text: "${navText}"`);
  });

  // ── Step 2: Navigate to booking page ───────────────────────────────────────
  console.log("\n── Step 2: Navigate to Booking Page ───────────────────");

  await test("Navigates to booking page", async () => {
    await page.goto(`${BASE_URL}/booking.html`, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    assert(title.toLowerCase().includes("book"), `Got title: "${title}"`);
  });

  await test("Booking form is visible", async () => {
    const form = await page.$("#bookingForm");
    assert(form !== null, "#bookingForm not found on page");
  });

  // ── Step 3: Fill out the booking form ──────────────────────────────────────
  console.log("\n── Step 3: Fill Out Booking Form ───────────────────────");

  await test("Selects session type", async () => {
    await page.select("#sessionType", TEST_BOOKING.sessionType);
    const val = await page.$eval("#sessionType", el => el.value);
    assert(val === TEST_BOOKING.sessionType, `Got: "${val}"`);
  });

  await test("Sets preferred date", async () => {
    await page.evaluate((date) => {
      const input = document.getElementById("preferredDate");
      input.value = date;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, TEST_BOOKING.preferredDate);
    const val = await page.$eval("#preferredDate", el => el.value);
    assert(val === TEST_BOOKING.preferredDate, `Got: "${val}"`);
  });

  await test("Selects hour", async () => {
    await page.select("#hour-select", TEST_BOOKING.hour);
    const val = await page.$eval("#hour-select", el => el.value);
    assert(val === TEST_BOOKING.hour, `Got: "${val}"`);
  });

  await test("Selects minutes", async () => {
    await page.select("#minute-select", TEST_BOOKING.minute);
    const val = await page.$eval("#minute-select", el => el.value);
    assert(val === TEST_BOOKING.minute, `Got: "${val}"`);
  });

  await test("Types preferred location", async () => {
    await page.type("#preferredLocation", TEST_BOOKING.location);
    const val = await page.$eval("#preferredLocation", el => el.value);
    assert(val === TEST_BOOKING.location, `Got: "${val}"`);
  });

  await test("Types full name", async () => {
    await page.type("#fullName", TEST_BOOKING.fullName);
    const val = await page.$eval("#fullName", el => el.value);
    assert(val === TEST_BOOKING.fullName, `Got: "${val}"`);
  });

  await test("Types phone number", async () => {
    await page.type("#phoneNumber", TEST_BOOKING.phone);
    const val = await page.$eval("#phoneNumber", el => el.value);
    assert(val === TEST_BOOKING.phone, `Got: "${val}"`);
  });

  await test("Types email address", async () => {
    await page.type("#emailAddress", TEST_BOOKING.email);
    const val = await page.$eval("#emailAddress", el => el.value);
    assert(val === TEST_BOOKING.email, `Got: "${val}"`);
  });

  await test("Types additional notes", async () => {
    await page.type("#additionalNotes", TEST_BOOKING.notes);
    const val = await page.$eval("#additionalNotes", el => el.value);
    assert(val === TEST_BOOKING.notes, `Got: "${val}"`);
  });

  // ── Step 4: Submit and confirm ─────────────────────────────────────────────
  console.log("\n── Step 4: Submit Booking ──────────────────────────────");

  await test("Submit button is enabled before submit", async () => {
    const disabled = await page.$eval("#bookingSubmitButton", el => el.disabled);
    assert(!disabled, "Submit button was disabled before submitting");
  });

  await test("Clicks submit and shows success message", async () => {
    await page.click("#bookingSubmitButton");

    // Wait for either success or error message to appear
    await page.waitForFunction(
      () => {
        const success = document.getElementById("bookingSuccessMessage");
        const error = document.getElementById("bookingErrorMessage");
        return (
          (success && !success.classList.contains("is-hidden")) ||
          (error && !error.classList.contains("is-hidden"))
        );
      },
      { timeout: 12000 }
    );

    const successVisible = await page.$eval(
      "#bookingSuccessMessage",
      el => !el.classList.contains("is-hidden")
    );
    const errorVisible = await page.$eval(
      "#bookingErrorMessage",
      el => !el.classList.contains("is-hidden")
    );

    if (errorVisible) {
      const errorText = await page.$eval("#bookingErrorMessage", el => el.textContent.trim());
      throw new Error(`Booking failed with error: "${errorText}"`);
    }

    assert(successVisible, "Success message did not appear after submission");
  });

  await test("Success message contains expected text", async () => {
    const text = await page.$eval("#bookingSuccessMessage", el => el.textContent.trim());
    assert(
      text.toLowerCase().includes("thank you"),
      `Success message text: "${text}"`
    );
  });

  await test("Form is reset after successful submission", async () => {
    const sessionType = await page.$eval("#sessionType", el => el.value);
    const fullName = await page.$eval("#fullName", el => el.value);
    assert(sessionType === "", `Session type should be cleared, got: "${sessionType}"`);
    assert(fullName === "", `Full name should be cleared, got: "${fullName}"`);
  });

  // ── Summary ────────────────────────────────────────────────────────────────
  await browser.close();

  console.log("\n" + "─".repeat(55));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  if (failed > 0) {
    console.log("\n⚠  Some tests failed — check output above for details.");
    process.exit(1);
  } else {
    console.log("\n✓  All booking flow tests passed!");
    process.exit(0);
  }
})();