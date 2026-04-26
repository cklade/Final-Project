import { auth, db } from "./app.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

function showError(message) {
  errorText.textContent = message;
  errorMessage.style.display = "block";
}

window.hideError = function () {
  errorMessage.style.display = "none";
};

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const street = document.getElementById("street").value.trim();
  const unitNumber = document.getElementById("unitNumber").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const zipCode = document.getElementById("zipCode").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: firstName || username,
    });

    await setDoc(doc(db, "users", user.uid), {
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
      role: "user",
      createdAt: serverTimestamp(),
    });

    window.location.href = "homepage.html";
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
});
