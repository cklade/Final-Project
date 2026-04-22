// login.js

import { auth, db } from "./app.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

function showError(message) {
  errorText.textContent = message;
  errorMessage.style.display = "block";
}

function hideError() {
  errorText.textContent = "";
  errorMessage.style.display = "none";
}

window.hideError = hideError;

function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "Login failed. Please try again.";
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "homepage.html";
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeCheckbox.checked;

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  try {
    const persistenceType = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistenceType);
    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Login error:", error);
    showError(getFriendlyErrorMessage(error.code));
  }
});
