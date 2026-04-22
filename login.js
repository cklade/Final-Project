import { auth, db } from "./app.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const loginIdentifierInput = document.getElementById("loginIdentifier");
const passwordInput = document.getElementById("password");
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
