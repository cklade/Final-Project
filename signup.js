import { auth, db } from "./app.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
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

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const street = streetInput.value.trim();
  const unitNumber = unitNumberInput.value.trim();
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zipCode = zipCodeInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !street ||
    !city ||
    !state ||
    !zipCode ||
    !password ||
    !confirmPassword
  ) {
    showError("Please complete all required fields.");
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
      addresses: [
        {
          street: street,
          city: city,
          state: state,
          zip_code: zipCode,
          unit_number: unitNumber || "",
        },
      ],
    });

    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Signup error code:", error.code);
    console.error("Signup error message:", error.message);
    console.error("Full signup error:", error);
    showError(error.message || getFriendlyErrorMessage(error.code));
  }
});