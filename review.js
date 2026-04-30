import { auth, db } from "./app.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const reviewForm = document.getElementById("reviewForm");
const reviewsContainer = document.getElementById("reviewsContainer");
const reviewNameInput = document.getElementById("reviewName");
const reviewTypeInput = document.getElementById("reviewType");
const reviewRatingInput = document.getElementById("reviewRating");
const reviewTextInput = document.getElementById("reviewText");
const submitButton = reviewForm.querySelector("button[type='submit']");

let currentUser = null;

function showReviewMessage(message, type = "is-info") {
  let messageBox = document.getElementById("reviewMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "reviewMessage";
    messageBox.className = `notification ${type} is-light mb-4`;
    reviewForm.parentElement.insertBefore(messageBox, reviewForm);
  }

  messageBox.className = `notification ${type} is-light mb-4`;
  messageBox.textContent = message;
}

function clearReviewMessage() {
  const messageBox = document.getElementById("reviewMessage");

  if (messageBox) {
    messageBox.remove();
  }
}

function setFormLocked(isLocked) {
  reviewNameInput.disabled = isLocked;
  reviewTypeInput.disabled = isLocked;
  reviewRatingInput.disabled = isLocked;
  reviewTextInput.disabled = isLocked;
  submitButton.disabled = isLocked;

  if (isLocked) {
    submitButton.textContent = "Log in to Submit Review";
  } else {
    submitButton.textContent = "Submit Review";
  }
}

function createReviewCard(review) {
  return `
    <div class="column is-half">
      <div class="review-card">
        <p class="reviews-stars mb-3">${review.rating}</p>
        <p class="review-text mb-4">"${review.text}"</p>
        <p class="review-name">${review.name}</p>
        <p class="review-type">${review.type}</p>
      </div>
    </div>
  `;
}

function loadReviews() {
  const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(
    reviewsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        reviewsContainer.innerHTML = `
          <div class="column is-full">
            <p>No reviews yet. Be the first to leave one!</p>
          </div>
        `;
        return;
      }

      const reviewsHTML = snapshot.docs
        .map((doc) => {
          const review = doc.data();
          return createReviewCard(review);
        })
        .join("");

      reviewsContainer.innerHTML = reviewsHTML;
    },
    (error) => {
      console.error("Error loading reviews:", error);
      reviewsContainer.innerHTML = `
        <div class="column is-full">
          <p class="has-text-danger">Reviews could not be loaded.</p>
        </div>
      `;
    }
  );
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (!user) {
    setFormLocked(true);
    showReviewMessage("You must be logged in to leave a review.", "is-warning");
    return;
  }

  setFormLocked(false);
  clearReviewMessage();

  if (user.displayName && !reviewNameInput.value) {
    reviewNameInput.value = user.displayName;
  }
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showReviewMessage("Please log in before submitting a review.", "is-danger");
    return;
  }

  const name = reviewNameInput.value.trim();
  const type = reviewTypeInput.value;
  const rating = reviewRatingInput.value;
  const text = reviewTextInput.value.trim();

  if (!name || !type || !rating || !text) {
    showReviewMessage("Please fill out every review field.", "is-danger");
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    await addDoc(collection(db, "reviews"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      name,
      type,
      rating,
      text,
      createdAt: serverTimestamp(),
    });

    reviewForm.reset();

    if (currentUser.displayName) {
      reviewNameInput.value = currentUser.displayName;
    }

    showReviewMessage("Review submitted successfully!", "is-success");
  } catch (error) {
    console.error("Error submitting review:", error);
    showReviewMessage(
      "Something went wrong while submitting your review.",
      "is-danger"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Review";
  }
});

loadReviews();
