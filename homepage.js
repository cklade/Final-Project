// homepage.js
import { app, db, auth, storage } from "./app.js";

console.log("Firebase connected on homepage:", app);

// Example: confirm page loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Homepage ready");
});
