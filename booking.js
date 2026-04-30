import { db, auth } from "./app.js";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const bookingForm = document.getElementById("bookingForm");
const bookingSuccessMessage = document.getElementById("bookingSuccessMessage");
const bookingErrorMessage = document.getElementById("bookingErrorMessage");
const bookingSubmitButton = document.getElementById("bookingSubmitButton");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

function showSuccess(message) {
  bookingSuccessMessage.textContent = message;
  bookingSuccessMessage.classList.remove("is-hidden");
  bookingErrorMessage.classList.add("is-hidden");
}

function showError(message) {
  bookingErrorMessage.textContent = message;
  bookingErrorMessage.classList.remove("is-hidden");
  bookingSuccessMessage.classList.add("is-hidden");

  bookingErrorMessage.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function showLoginRequiredMessage() {
  bookingErrorMessage.innerHTML = `
    You need to create an account or log in before creating a booking.
    <br><br>
    <a href="signup.html" class="button is-small is-link">Create Account</a>
    <a href="login.html" class="button is-small is-light ml-2">Log In</a>
  `;

  bookingErrorMessage.classList.remove("is-hidden");
  bookingSuccessMessage.classList.add("is-hidden");

  bookingErrorMessage.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function resetMessages() {
  bookingSuccessMessage.classList.add("is-hidden");
  bookingErrorMessage.classList.add("is-hidden");
}

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  resetMessages();

  if (!currentUser) {
    showLoginRequiredMessage();
    return;
  }

  const sessionType = document.getElementById("sessionType").value.trim();
  const preferredDate = document.getElementById("preferredDate").value.trim();
  const hour = document.getElementById("hour-select").value.trim();
  const minute = document.getElementById("minute-select").value.trim();

  const preferredLocation = document
    .getElementById("preferredLocation")
    .value.trim();

  const fullName = document.getElementById("fullName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const emailAddress = document.getElementById("emailAddress").value.trim();

  const additionalNotes = document
    .getElementById("additionalNotes")
    .value.trim();

  if (
    !sessionType ||
    !preferredDate ||
    !hour ||
    !minute ||
    !preferredLocation ||
    !fullName ||
    !phoneNumber ||
    !emailAddress
  ) {
    showError("Please fill out all required fields.");
    return;
  }

  const preferredTime = `${hour}:${minute}`;

  bookingSubmitButton.disabled = true;
  bookingSubmitButton.textContent = "Submitting...";

  try {
    await addDoc(collection(db, "bookings"), {
      sessionType,
      preferredDate,
      preferredTime,
      preferredLocation,
      fullName,
      phoneNumber,
      emailAddress,
      additionalNotes,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    bookingForm.reset();

    showSuccess(
      "Thank you for your request. Your booking information has been saved and we will contact you soon."
    );
  } catch (error) {
    console.error("Error saving booking:", error);
    showError("Could not save your booking request. Please try again.");
  } finally {
    bookingSubmitButton.disabled = false;
    bookingSubmitButton.textContent = "Submit Request";
  }
});
