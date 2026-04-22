import { db, auth } from "./app.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const usernameInput = document.getElementById("username");
const loginIdentifierInput = document.getElementById("loginIdentifier");
const phoneInput = document.getElementById("phone");
const streetInput = document.getElementById("street");
const unitNumberInput = document.getElementById("unitNumber");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const zipCodeInput = document.getElementById("zipCode");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
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
    case "auth/email-already-in-use":
      return "That email is already being used.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    default:
      return "Signup failed. Please try again.";
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const identifier = loginIdentifierInput.value.trim();
  const password = passwordInput.value;

  try {
    const email = await resolveEmail(identifier);

    await signInWithEmailAndPassword(auth, email, password);

    alert("Login successful!");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Login error:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      showError("Invalid username/email or password.");
    } else {
      showError(error.message);
    }
  }
});

async function resolveEmail(identifier) {
  const trimmed = identifier.trim();

  if (trimmed.includes("@")) {
    return trimmed;
  }

  const usernameRef = doc(db, "usernames", trimmed.toLowerCase());
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) {
    throw new Error("No account found with that username.");
  }

  return usernameSnap.data().email;
}
