import { db } from "./app.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const portfolioPhotosContainer = document.getElementById(
  "portfolioPhotosContainer"
);

const staticPhotos = [
  {
    id: "urban-sunset",
    name: "Urban Sunset",
    imageUrl: "pictures/IMG_1271.jpg",
    price: 0,
  },
  {
    id: "portrait-session",
    name: "Portrait Session",
    imageUrl: "pictures/IMG_3963.jpg",
    price: 0,
  },
  {
    id: "mountain-landscape",
    name: "Mountain Landscape",
    imageUrl: "pictures/IMG_3708-Enhanced-NR.jpg",
    price: 0,
  },
  {
    id: "nature-photography",
    name: "Nature Photography",
    imageUrl: "pictures/IMG_4669.jpg",
    price: 0,
  },
  {
    id: "car-photography",
    name: "Car Photography",
    imageUrl: "pictures/IMG_5065.jpg",
    price: 0,
  },
  {
    id: "city-portraits",
    name: "City Portraits",
    imageUrl: "pictures/IMG_1331.jpg",
    price: 0,
  },
  {
    id: "graduation-photos",
    name: "Graduation Photos",
    imageUrl: "pictures/IMG_4607.jpg",
    price: 0,
  },
  {
    id: "group-session",
    name: "Group Session",
    imageUrl: "pictures/IMG_5929.jpg",
    price: 0,
  },
  {
    id: "star-photography",
    name: "Star Photography",
    imageUrl: "pictures/IMG_5289.jpg",
    price: 0,
  },
];

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadStaticPrices() {
  const snapshot = await getDocs(collection(db, "photoPrices"));
  const prices = {};

  snapshot.forEach((docSnap) => {
    prices[docSnap.id] = docSnap.data();
  });

  return staticPhotos.map((photo) => ({
    ...photo,
    price: prices[photo.id]?.price ?? photo.price ?? 0,
  }));
}

async function loadUploadedPhotos() {
  const photosQuery = query(
    collection(db, "portfolioPhotos"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(photosQuery);
  const uploadedPhotos = [];

  snapshot.forEach((docSnap) => {
    const photo = docSnap.data();

    if (photo.active === false) return;

    uploadedPhotos.push({
      id: docSnap.id,
      name: photo.name,
      imageUrl: photo.imageUrl,
      price: photo.price ?? 0,
    });
  });

  return uploadedPhotos;
}

function createPhotoCard(photo) {
  const safeId = escapeHtml(photo.id);
  const safeName = escapeHtml(photo.name);
  const safeImage = escapeHtml(photo.imageUrl);
  const safePrice = Number(photo.price || 0);

  return `
    <div class="column is-one-third-desktop is-half-tablet">
      <div class="portfolio-card">
        <figure class="image portfolio-image">
          <img src="${safeImage}" alt="${safeName}" />
        </figure>

        <p class="portfolio-label">${safeName}</p>
        <p class="portfolio-price">${formatPrice(safePrice)}</p>

        <div class="portfolio-card-actions">
          <button
            class="button hero-button-primary add-to-cart-button"
            data-photo-id="${safeId}"
            data-name="${safeName}"
            data-image="${safeImage}"
            data-price="${safePrice}"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

async function renderPortfolioPhotos() {
  portfolioPhotosContainer.innerHTML = `
    <div class="column is-full">
      <div class="notification is-light">Loading portfolio photos...</div>
    </div>
  `;

  try {
    const pricedStaticPhotos = await loadStaticPrices();
    const uploadedPhotos = await loadUploadedPhotos();

    const allPhotos = [...pricedStaticPhotos, ...uploadedPhotos];

    portfolioPhotosContainer.innerHTML = allPhotos
      .map(createPhotoCard)
      .join("");
  } catch (error) {
    console.error("Portfolio load error:", error);

    portfolioPhotosContainer.innerHTML = `
      <div class="column is-full">
        <div class="notification is-danger is-light">
          Could not load portfolio photos.
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderPortfolioPhotos);
