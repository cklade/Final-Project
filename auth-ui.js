import { auth, db } from "./app.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function getDisplayName(user, profileData = null) {
  if (profileData?.firstName) return profileData.firstName;
  if (user?.displayName && user.displayName.trim())
    return user.displayName.trim();
  if (user?.email) return user.email;
  return "User";
}

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "user";
    return snap.data().role || "user";
  } catch (error) {
    console.error("Could not load role:", error);
    return "user";
  }
}

async function getProfile(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Could not load profile:", error);
    return null;
  }
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
    await signOut(auth);
    window.location.href = "homepage.html";
  });

  return link;
}

async function updateNavbar(user) {
  const navContainer = document.querySelector(".navbar-start.nav-center");
  if (!navContainer) return;

  navContainer
    .querySelectorAll('[data-auth-link="true"]')
    .forEach((element) => element.remove());

  navContainer
    .querySelectorAll(
      'a[href="login.html"], a[href="signup.html"], a[href="admin-bookings.html"]',
    )
    .forEach((element) => element.remove());

  if (!user) {
    const loginLink = createNavLink("login.html", "Login");
    loginLink.dataset.authLink = "true";

    const signupLink = createNavLink("signup.html", "Sign Up");
    signupLink.dataset.authLink = "true";

    navContainer.appendChild(loginLink);
    navContainer.appendChild(signupLink);
    return;
  }

  const [profileData, role] = await Promise.all([
    getProfile(user.uid),
    getRole(user.uid),
  ]);

  const status = document.createElement("span");
  status.className = "navbar-item has-text-white has-text-weight-bold";
  status.dataset.authLink = "true";
  status.textContent = `Logged in as ${getDisplayName(user, profileData)}`;

  navContainer.appendChild(status);

  if (role === "admin") {
    const adminLink = createNavLink("admin-bookings.html", "Admin");
    adminLink.dataset.authLink = "true";
    navContainer.appendChild(adminLink);
  }

  const logout = createLogoutControl();
  logout.dataset.authLink = "true";
  navContainer.appendChild(logout);
}

onAuthStateChanged(auth, async (user) => {
  await updateNavbar(user);
});
