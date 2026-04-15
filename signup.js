// signup.js
import { auth, db } from "./app.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "homepage.html";
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
  ) {
    showError("Please complete all fields.");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    await setDoc(doc(db, "Customers", user.uid), {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      created_at: serverTimestamp(),
      customer_type: "standard",
      preferred_contact_method: "email",
      addresses: [],
    });

    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Signup error:", error);
    showError(getFriendlyErrorMessage(error.code));
  }
});