document.addEventListener("DOMContentLoaded", function () {
  initializePhotoCart();
});

/* ------------------------------ */
/* Photo Cart Functionality       */
/* ------------------------------ */

function initializePhotoCart() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
  const cartCount = document.getElementById("cartCount");

  if (!addToCartButtons.length && !cartCount) return;

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
    if (!cartCount) return;
    const cart = getCart();
    cartCount.textContent = cart.length;
  }

  function photoAlreadyInCart(cart, imagePath) {
    return cart.some(function (item) {
      return item.image === imagePath;
    });
  }

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

button.textContent = "Added!";
button.disabled = true;

setTimeout(function () {
  window.location.href = "cart.html";
}, 800);
    });
  });

  updateCartCount();
}
