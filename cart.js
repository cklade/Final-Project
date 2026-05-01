import { auth, db } from "./app.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CART_KEY = "kladeCart";

function getCart() {
  const savedCart = localStorage.getItem(CART_KEY);
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

function formatOrderDate(createdAt) {
  if (!createdAt) {
    return "Date unavailable";
  }

  let date;

  if (createdAt.toDate) {
    date = createdAt.toDate();
  } else if (createdAt.seconds) {
    date = new Date(createdAt.seconds * 1000);
  } else {
    date = new Date(createdAt);
  }

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getOrderTime(createdAt) {
  if (!createdAt) {
    return 0;
  }

  if (createdAt.toDate) {
    return createdAt.toDate().getTime();
  }

  if (createdAt.seconds) {
    return createdAt.seconds * 1000;
  }

  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function updateCartCount() {
  const cart = getCart();
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

async function loadPortfolioPrices() {
  const priceElements = document.querySelectorAll("[data-price-for]");
  const addButtons = document.querySelectorAll(".add-to-cart-button");

  if (priceElements.length === 0 && addButtons.length === 0) {
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "photoPrices"));
    const prices = {};

    snapshot.forEach((docSnap) => {
      prices[docSnap.id] = docSnap.data();
    });

    priceElements.forEach((element) => {
      const photoId = element.dataset.priceFor;
      const priceData = prices[photoId];

      if (priceData && typeof priceData.price === "number") {
        element.textContent = formatPrice(priceData.price);
      } else {
        element.textContent = "Price not set";
      }
    });

    addButtons.forEach((button) => {
      const photoId = button.dataset.photoId;
      const priceData = prices[photoId];

      if (priceData && typeof priceData.price === "number") {
        button.dataset.price = priceData.price;
      } else {
        button.dataset.price = 0;
      }
    });
  } catch (error) {
    console.error("Could not load portfolio prices:", error);
  }
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const photoId = button.dataset.photoId;
      const name = button.dataset.name;
      const image = button.dataset.image;
      const price = Number(button.dataset.price || 0);

      const cart = getCart();

      const alreadyInCart = cart.some((item) => item.photoId === photoId);

      if (alreadyInCart) {
        alert("This photo is already in your cart.");
        return;
      }

      cart.push({
        photoId,
        name,
        image,
        price,
      });

      saveCart(cart);
      updateCartCount();

      alert(`${name} added to cart.`);
    });
  });
}

function calculateCartTotal(cart) {
  return cart.reduce((total, item) => {
    return total + Number(item.price || 0);
  }, 0);
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartSummaryCount = document.getElementById("cartSummaryCount");
  const cartEmptyMessage = document.getElementById("cartEmptyMessage");
  const clearCartButton = document.getElementById("clearCartButton");
  const cartTotalAmount = document.getElementById("cartTotalAmount");

  if (!cartItemsContainer) {
    return;
  }

  const cart = getCart();

  cartItemsContainer.innerHTML = "";

  if (cartSummaryCount) {
    cartSummaryCount.textContent = cart.length;
  }

  if (cartTotalAmount) {
    cartTotalAmount.textContent = formatPrice(calculateCartTotal(cart));
  }

  if (cart.length === 0) {
    cartEmptyMessage?.classList.remove("is-hidden");
    clearCartButton?.classList.add("is-hidden");
    return;
  }

  cartEmptyMessage?.classList.add("is-hidden");
  clearCartButton?.classList.remove("is-hidden");

  cart.forEach((item, index) => {
    const itemCard = document.createElement("div");
    itemCard.className = "column is-one-third-desktop is-half-tablet";

    itemCard.innerHTML = `
      <div class="portfolio-card">
        <figure class="image portfolio-image">
          <img src="${item.image}" alt="${item.name}" />
        </figure>

        <p class="portfolio-label">${item.name}</p>
        <p class="portfolio-price">${formatPrice(item.price)}</p>

        <div class="portfolio-card-actions">
          <button class="button is-danger remove-cart-item" data-index="${index}">
            Remove
          </button>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(itemCard);
  });

  document.querySelectorAll(".remove-cart-item").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const updatedCart = getCart();

      updatedCart.splice(index, 1);

      saveCart(updatedCart);
      updateCartCount();
      renderCartPage();
    });
  });

  clearCartButton?.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCartPage();
  });
}

function renderOrderHistory(orders) {
  const orderHistoryContainer = document.getElementById(
    "orderHistoryContainer",
  );
  const orderHistoryMessage = document.getElementById("orderHistoryMessage");

  if (!orderHistoryContainer) {
    return;
  }

  orderHistoryContainer.innerHTML = "";

  if (orderHistoryMessage) {
    orderHistoryMessage.classList.add("is-hidden");
    orderHistoryMessage.textContent = "";
  }

  if (orders.length === 0) {
    if (orderHistoryMessage) {
      orderHistoryMessage.textContent =
        "You do not have any past checkout requests yet.";
      orderHistoryMessage.className = "notification is-warning is-light";
      orderHistoryMessage.classList.remove("is-hidden");
    }
    return;
  }

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-history-card mb-4";

    const items = Array.isArray(order.items) ? order.items : [];
    const itemList =
      items.length > 0
        ? items
            .map((item) => {
              return `
                <li>
                  <strong>${item.name || "Unnamed Photo"}</strong>
                  <span class="order-item-price">
                    ${formatPrice(item.price)}
                  </span>
                </li>
              `;
            })
            .join("")
        : "<li>No item details saved for this order.</li>";

    orderCard.innerHTML = `
      <div class="columns is-vcentered">
        <div class="column is-8">
          <h3 class="title is-5 has-text-black mb-2">
            Order from ${formatOrderDate(order.createdAt)}
          </h3>

          <p class="mb-2">
            <strong>Status:</strong>
            <span class="booking-status-text">${order.status || "pending"}</span>
          </p>

          <p class="mb-2">
            <strong>Name:</strong> ${order.fullName || "Name unavailable"}
          </p>

          <p class="mb-2">
            <strong>Email:</strong> ${order.email || order.userEmail || "Email unavailable"}
          </p>

          ${
            order.notes
              ? `<p class="mb-3"><strong>Notes:</strong> ${order.notes}</p>`
              : ""
          }

          <div class="order-items-box">
            <p class="mb-2"><strong>Photos Ordered:</strong></p>
            <ul class="order-history-list">
              ${itemList}
            </ul>
          </div>
        </div>

        <div class="column is-4 has-text-centered">
          <div class="order-total-box">
            <p class="mb-1">Order Total</p>
            <p class="order-total-text">${formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    `;

    orderHistoryContainer.appendChild(orderCard);
  });
}

async function loadOrderHistory() {
  const orderHistoryMessage = document.getElementById("orderHistoryMessage");

  const user = auth.currentUser;

  if (!user) {
    if (orderHistoryMessage) {
      orderHistoryMessage.textContent =
        "Please log in to view your order history.";
      orderHistoryMessage.className = "notification is-warning is-light";
      orderHistoryMessage.classList.remove("is-hidden");
    }
    return;
  }

  if (orderHistoryMessage) {
    orderHistoryMessage.textContent = "Loading your past orders...";
    orderHistoryMessage.className = "notification is-light";
    orderHistoryMessage.classList.remove("is-hidden");
  }

  try {
    const ordersQuery = query(
      collection(db, "cartOrders"),
      where("userId", "==", user.uid),
    );

    const snapshot = await getDocs(ordersQuery);

    const orders = [];

    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    orders.sort((a, b) => {
      return getOrderTime(b.createdAt) - getOrderTime(a.createdAt);
    });

    renderOrderHistory(orders);
  } catch (error) {
    console.error("Could not load order history:", error);

    if (orderHistoryMessage) {
      orderHistoryMessage.textContent =
        "Could not load order history. Check your Firebase rules and make sure this user is allowed to read their own cart orders.";
      orderHistoryMessage.className = "notification is-danger is-light";
      orderHistoryMessage.classList.remove("is-hidden");
    }
  }
}

function setupOrderHistoryControls() {
  const orderHistoryButton = document.getElementById("orderHistoryButton");
  const hideOrderHistoryButton = document.getElementById(
    "hideOrderHistoryButton",
  );
  const orderHistorySection = document.getElementById("orderHistorySection");

  if (!orderHistoryButton || !orderHistorySection) {
    return;
  }

  orderHistoryButton.addEventListener("click", async () => {
    orderHistorySection.classList.remove("is-hidden");
    await loadOrderHistory();
    orderHistorySection.scrollIntoView({ behavior: "smooth" });
  });

  hideOrderHistoryButton?.addEventListener("click", () => {
    orderHistorySection.classList.add("is-hidden");
  });
}

function setupCheckoutForm() {
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutSuccessMessage = document.getElementById(
    "checkoutSuccessMessage",
  );
  const checkoutErrorMessage = document.getElementById("checkoutErrorMessage");
  const paymentQrBox = document.getElementById("paymentQrBox");

  if (!checkoutForm) {
    return;
  }

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    checkoutSuccessMessage?.classList.add("is-hidden");
    checkoutErrorMessage?.classList.add("is-hidden");
    paymentQrBox?.classList.add("is-hidden");

    const user = auth.currentUser;

    if (!user) {
      if (checkoutErrorMessage) {
        checkoutErrorMessage.textContent =
          "Please log in before submitting a checkout request.";
        checkoutErrorMessage.classList.remove("is-hidden");
      }
      return;
    }

    const cart = getCart();

    if (cart.length === 0) {
      if (checkoutErrorMessage) {
        checkoutErrorMessage.textContent =
          "Your cart is empty. Add photos before checking out.";
        checkoutErrorMessage.classList.remove("is-hidden");
      }
      return;
    }

    const fullName = document.getElementById("checkoutFullName").value.trim();
    const email = document.getElementById("checkoutEmail").value.trim();
    const notes = document.getElementById("checkoutNotes").value.trim();
    const total = calculateCartTotal(cart);
    const paymentQrTotal = document.getElementById("paymentQrTotal");

    if (paymentQrTotal) {
      paymentQrTotal.textContent = formatPrice(total);
    }

    try {
      await addDoc(collection(db, "cartOrders"), {
        userId: user.uid,
        userEmail: user.email,
        fullName,
        email,
        notes,
        items: cart,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      checkoutSuccessMessage?.classList.remove("is-hidden");
      paymentQrBox?.classList.remove("is-hidden");

      checkoutForm.classList.add("is-hidden");

      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCartPage();
      checkoutForm.reset();

      const orderHistorySection = document.getElementById(
        "orderHistorySection",
      );

      if (
        orderHistorySection &&
        !orderHistorySection.classList.contains("is-hidden")
      ) {
        await loadOrderHistory();
      }
    } catch (error) {
      console.error("Checkout error:", error);

      if (checkoutErrorMessage) {
        checkoutErrorMessage.textContent =
          "Could not submit your checkout request.";
        checkoutErrorMessage.classList.remove("is-hidden");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount();
  await loadPortfolioPrices();
  setupAddToCartButtons();
  renderCartPage();
  setupCheckoutForm();
  setupOrderHistoryControls();
});
