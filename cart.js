import { db, auth } from "./app.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  initializePhotoCart();
  renderCartPage();
  initializeCheckoutForm();
});

function getCart() {
  const savedCart = localStorage.getItem("kladePhotoCart");

  if (!savedCart) return [];

  try {
    return JSON.parse(savedCart);
  } catch (error) {
    console.error("Could not parse cart data:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("kladePhotoCart", JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) return;

  const cart = getCart();
  cartCount.textContent = cart.length;
}

function photoAlreadyInCart(cart, imagePath) {
  return cart.some(function (item) {
    return item.image === imagePath;
  });
}

function initializePhotoCart() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-button");

  addToCartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.dataset.name;
      const image = button.dataset.image;

      if (!name || !image) return;

      const cart = getCart();

      if (photoAlreadyInCart(cart, image)) {
        const originalText = button.textContent;
        button.textContent = "Already in Cart";
        button.disabled = true;

        setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 1200);

        updateCartCount();
        return;
      }

      cart.push({ name, image });
      saveCart(cart);
      updateCartCount();

      const originalText = button.textContent;
      button.textContent = "Added!";
      button.disabled = true;

      setTimeout(function () {
        button.textContent = originalText;
        button.disabled = false;
      }, 1200);
    });
  });

  updateCartCount();
}

function removeFromCart(imagePath) {
  const cart = getCart().filter(function (item) {
    return item.image !== imagePath;
  });

  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function clearCart() {
  localStorage.removeItem("kladePhotoCart");
  updateCartCount();
  renderCartPage();
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartEmptyMessage = document.getElementById("cartEmptyMessage");
  const cartSummaryCount = document.getElementById("cartSummaryCount");
  const clearCartButton = document.getElementById("clearCartButton");
  const checkoutForm = document.getElementById("checkoutForm");

  if (!cartItemsContainer) {
    updateCartCount();
    return;
  }

  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cartSummaryCount) {
    cartSummaryCount.textContent = cart.length;
  }

  if (!cart.length) {
    cartEmptyMessage.classList.remove("is-hidden");
    if (clearCartButton) clearCartButton.classList.add("is-hidden");
    if (checkoutForm) checkoutForm.style.display = "none";
    return;
  }

  cartEmptyMessage.classList.add("is-hidden");
  if (clearCartButton) clearCartButton.classList.remove("is-hidden");
  if (checkoutForm) checkoutForm.style.display = "block";

  cart.forEach(function (item) {
    const column = document.createElement("div");
    column.className = "column is-half-tablet is-one-third-desktop";

    column.innerHTML = `
      <div class="portfolio-card">
        <figure class="image portfolio-image">
          <img src="${item.image}" alt="${item.name}" />
        </figure>
        <p class="portfolio-label">${item.name}</p>
        <div class="portfolio-card-actions">
          <button
            class="button is-danger remove-from-cart-button"
            data-image="${item.image}"
          >
            Remove
          </button>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(column);
  });

  const removeButtons = document.querySelectorAll(".remove-from-cart-button");

  removeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const image = button.dataset.image;
      removeFromCart(image);
    });
  });

  if (clearCartButton) {
    clearCartButton.onclick = clearCart;
  }
}

function showCheckoutSuccess(message) {
  const successBox = document.getElementById("checkoutSuccessMessage");
  const errorBox = document.getElementById("checkoutErrorMessage");

  if (successBox) {
    successBox.textContent = message;
    successBox.classList.remove("is-hidden");
  }

  if (errorBox) {
    errorBox.classList.add("is-hidden");
  }
}

function showCheckoutError(message) {
  const successBox = document.getElementById("checkoutSuccessMessage");
  const errorBox = document.getElementById("checkoutErrorMessage");

  if (errorBox) {
    errorBox.textContent = message;
    errorBox.classList.remove("is-hidden");
  }

  if (successBox) {
    successBox.classList.add("is-hidden");
  }
}

function initializeCheckoutForm() {
  const checkoutForm = document.getElementById("checkoutForm");
  if (!checkoutForm) return;

  const user = auth.currentUser;
  const cart = getCart();

  const emailInput = document.getElementById("checkoutEmail");
  if (user?.email && emailInput) {
    emailInput.value = user.email;
  }

  checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentCart = getCart();

    if (!currentCart.length) {
      showCheckoutError("Your cart is empty.");
      return;
    }

    const fullName = document.getElementById("checkoutFullName").value.trim();
    const email = document.getElementById("checkoutEmail").value.trim();
    const notes = document.getElementById("checkoutNotes").value.trim();
    const submitButton = document.getElementById("checkoutSubmitButton");

    const user = auth.currentUser;

    if (!user) {
      showCheckoutError("Please log in before submitting a checkout request.");
      return;
    }
    if (!fullName || !email) {
      showCheckoutError("Please fill out your name and email.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const currentUser = auth.currentUser;

      await addDoc(collection(db, "cartOrders"), {
        userId: currentUser ? currentUser.uid : null,
        userEmail: currentUser ? currentUser.email : email,
        fullName,
        email,
        notes,
        items: currentCart,
        itemCount: currentCart.length,
        status: "submitted",
        createdAt: serverTimestamp(),
      });

      localStorage.removeItem("kladePhotoCart");
      checkoutForm.reset();
      if (currentUser?.email && emailInput) {
        emailInput.value = currentUser.email;
      }

      updateCartCount();
      renderCartPage();
      showCheckoutSuccess(
        "Your checkout request has been submitted successfully.",
      );
    } catch (error) {
      console.error("Checkout error:", error);
      showCheckoutError(
        "Could not submit your checkout request. Please try again.",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Checkout Request";
    }
  });
}
