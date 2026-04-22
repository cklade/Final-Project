import { auth } from "./app.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function getDisplayName(user) {
  if (!user) return "";
  if (user.displayName && user.displayName.trim())
    return user.displayName.trim();
  if (user.email) return user.email;
  return "User";
}

function createNavLink(href, text) {
  const link = document.createElement("a");
  link.className = "navbar-item has-text-white has-text-weight-bold";
  link.href = href;
  link.textContent = text;
  return link;
}

function createLogoutControl() {
  const link = document.createElement("a");
  link.className = "navbar-item has-text-white has-text-weight-bold";
  link.href = "#";
  link.textContent = "Log Out";

  link.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await signOut(auth);
      window.location.href = "homepage.html";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Could not log out. Please try again.");
    }
  });

  return link;
}

function updateNavbar(user) {
  const navContainer = document.querySelector(".navbar-start.nav-center");
  if (!navContainer) return;

  navContainer
    .querySelectorAll('[data-auth-link="true"]')
    .forEach((element) => element.remove());

  navContainer
    .querySelectorAll('a[href="login.html"], a[href="signup.html"]')
    .forEach((element) => element.remove());

  if (user) {
    const status = document.createElement("span");
    status.className = "navbar-item has-text-white has-text-weight-bold";
    status.dataset.authLink = "true";
    status.textContent = `Logged in as ${getDisplayName(user)}`;
    status.style.cursor = "default";

    const logout = createLogoutControl();
    logout.dataset.authLink = "true";

    navContainer.appendChild(status);
    navContainer.appendChild(logout);
    return;
  }

  const loginLink = createNavLink("login.html", "Login");
  loginLink.dataset.authLink = "true";

  const signupLink = createNavLink("signup.html", "Sign Up");
  signupLink.dataset.authLink = "true";

  navContainer.appendChild(loginLink);
  navContainer.appendChild(signupLink);
}

function updatePageStatus(user) {
  const cartStatusBox = document.querySelector(".cart-status-box");

  if (cartStatusBox) {
    const existingStatus = cartStatusBox.querySelector(".login-state-text");
    if (existingStatus) existingStatus.remove();

    const statusText = document.createElement("div");
    statusText.className = "login-state-text";
    statusText.style.marginTop = "0.35rem";
    statusText.style.fontSize = "0.9rem";
    statusText.textContent = user
      ? `Logged in as ${getDisplayName(user)}`
      : "Not logged in";

    cartStatusBox.appendChild(statusText);
  }

  const authPageStatus = document.getElementById("authPageStatus");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (!authPageStatus) return;

  authPageStatus.innerHTML = "";

  if (user) {
    const box = document.createElement("div");
    box.className = "notification is-light";
    box.style.border = "1px solid rgb(79, 26, 26)";
    box.style.marginBottom = "1.25rem";
    box.innerHTML = `<p><strong>Logged in as:</strong> ${getDisplayName(
      user
    )}</p>`;

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "button hero-button-primary is-fullwidth mt-3";
    logoutButton.textContent = "Log Out";

    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.reload();
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Could not log out. Please try again.");
      }
    });

    box.appendChild(logoutButton);
    authPageStatus.appendChild(box);

    if (loginForm) loginForm.style.display = "none";
    if (signupForm) signupForm.style.display = "none";

    document
      .querySelectorAll('a[href="signup.html"], a[href="login.html"]')
      .forEach((element) => {
        const wrapper = element.closest("p");
        if (wrapper) wrapper.style.display = "none";
      });
  } else {
    if (loginForm) loginForm.style.display = "block";
    if (signupForm) signupForm.style.display = "block";

    document
      .querySelectorAll('a[href="signup.html"], a[href="login.html"]')
      .forEach((element) => {
        const wrapper = element.closest("p");
        if (wrapper) wrapper.style.display = "block";
      });
  }
}

onAuthStateChanged(auth, (user) => {
  updateNavbar(user);
  updatePageStatus(user);
});
