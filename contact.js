import { auth, db } from "./app.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const contactForm = document.getElementById("contactForm");

const firstNameInput = document.getElementById("contactFirstName");
const lastNameInput = document.getElementById("contactLastName");
const emailInput = document.getElementById("contactEmail");
const phoneInput = document.getElementById("contactPhone");
const sessionTypeInput = document.getElementById("contactSessionType");
const messageInput = document.getElementById("contactMessage");

const submitButton = contactForm.querySelector("button[type='submit']");

let currentUser = null;

function showContactMessage(message, type = "is-info") {
  let messageBox = document.getElementById("contactStatusMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "contactStatusMessage";
    messageBox.className = `notification ${type} is-light mb-4`;
    contactForm.parentElement.insertBefore(messageBox, contactForm);
  }

  messageBox.className = `notification ${type} is-light mb-4`;
  messageBox.textContent = message;
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user && user.email && !emailInput.value) {
    emailInput.value = user.email;
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const sessionType = sessionTypeInput.value;
  const message = messageInput.value.trim();

  if (!firstName || !lastName || !email || !phone || !sessionType || !message) {
    showContactMessage("Please fill out every contact field.", "is-danger");
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    await addDoc(collection(db, "contactRequests"), {
      userId: currentUser ? currentUser.uid : null,
      userEmail: currentUser ? currentUser.email : email,
      firstName,
      lastName,
      email,
      phone,
      sessionType,
      message,
      status: "new",
      createdAt: serverTimestamp(),
    });

    contactForm.reset();

    if (currentUser && currentUser.email) {
      emailInput.value = currentUser.email;
    }

    showContactMessage("Message sent successfully!", "is-success");
  } catch (error) {
    console.error("Error sending contact request:", error);
    showContactMessage(
      "Something went wrong while sending your message.",
      "is-danger"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
  }
});
