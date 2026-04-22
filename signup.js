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
const emailInput = document.getElementById("email");
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
  console.log("SHOW ERROR:", message);
  errorText.textContent = message;
  errorMessage.style.display = "block";
}

function hideError() {
  errorText.textContent = "";
  errorMessage.style.display = "none";
}

window.hideError = hideError;

console.log("signup.js loaded");
console.log({ signupForm, usernameInput, emailInput, passwordInput });

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("submit fired");
  hideError();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const username = usernameInput.value.trim().toLowerCase();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const street = streetInput.value.trim();
  const unitNumber = unitNumberInput.value.trim();
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zipCode = zipCodeInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  console.log("form values gathered", { username, email });

  if (!username) {
    showError("Please enter a username.");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  try {
    console.log("checking username...");
    const usernameRef = doc(db, "usernames", username);
    const usernameSnap = await getDoc(usernameRef);

    if (usernameSnap.exists()) {
      showError("That username is already taken.");
      return;
    }

    console.log("creating auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("auth user created", user.uid);

    await updateProfile(user, {
      displayName: username,
    });

    console.log("writing customer doc...");
    await setDoc(doc(db, "Customers", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      username,
      email,
      phone,
      address: {
        street,
        unitNumber,
        city,
        state,
        zipCode,
      },
      createdAt: new Date().toISOString(),
    });

    console.log("writing username doc...");
    await setDoc(doc(db, "usernames", username), {
      uid: user.uid,
      email,
    });

    console.log("success");
    alert("Account created successfully!");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("FULL SIGNUP ERROR:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    switch (error.code) {
      case "auth/email-already-in-use":
        showError("That email is already being used.");
        break;
      case "auth/invalid-email":
        showError("Please enter a valid email address.");
        break;
      case "auth/weak-password":
        showError("Password must be at least 6 characters.");
        break;
      case "auth/operation-not-allowed":
        showError("Email/password sign-in is not enabled in Firebase.");
        break;
      case "permission-denied":
        showError("Firestore rules are blocking writes.");
        break;
      default:
        showError(error.message || "Signup failed. Please try again.");
    }
  }
});
