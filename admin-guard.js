import { waitForAuth, getCurrentUserWithRole } from "./roles.js";

(async function () {
  const authUser = await waitForAuth();

  if (!authUser) {
    window.location.href = "login.html";
    return;
  }

  const userData = await getCurrentUserWithRole();

  if (!userData || userData.role !== "admin") {
    alert("You do not have permission to view this page.");
    window.location.href = "homepage.html";
  }
})();
