import { db } from "./app.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const photos = [
  {
    id: "urban-sunset",
    name: "Urban Sunset",
    image: "pictures/IMG_1271.jpg",
  },
  {
    id: "portrait-session",
    name: "Portrait Session",
    image: "pictures/IMG_3963.jpg",
  },
  {
    id: "mountain-landscape",
    name: "Mountain Landscape",
    image: "pictures/IMG_3708-Enhanced-NR.jpg",
  },
  {
    id: "nature-photography",
    name: "Nature Photography",
    image: "pictures/IMG_4669.jpg",
  },
  {
    id: "car-photography",
    name: "Car Photography",
    image: "pictures/IMG_5065.jpg",
  },
  {
    id: "city-portraits",
    name: "City Portraits",
    image: "pictures/IMG_1331.jpg",
  },
  {
    id: "graduation-photos",
    name: "Graduation Photos",
    image: "pictures/IMG_4607.jpg",
  },
  {
    id: "group-session",
    name: "Group Session",
    image: "pictures/IMG_5929.jpg",
  },
  {
    id: "star-photography",
    name: "Star Photography",
    image: "pictures/IMG_5289.jpg",
  },
];

const priceFields = document.getElementById("priceFields");
const priceForm = document.getElementById("priceForm");
const message = document.getElementById("adminPricesMessage");

function showMessage(text, type = "is-success") {
  message.textContent = text;
  message.className = `notification ${type} is-light`;
  message.classList.remove("is-hidden");
}

async function loadExistingPrices() {
  const snapshot = await getDocs(collection(db, "photoPrices"));
  const prices = {};

  snapshot.forEach((docSnap) => {
    prices[docSnap.id] = docSnap.data();
  });

  priceFields.innerHTML = photos
    .map((photo) => {
      const savedPrice = prices[photo.id]?.price ?? "";

      return `
        <div class="box mb-4">
          <div class="columns is-vcentered">
            <div class="column is-3">
              <figure class="image is-128x128">
                <img src="${photo.image}" alt="${photo.name}" />
              </figure>
            </div>

            <div class="column">
              <label class="label has-text-black">${photo.name}</label>
              <input
                class="input booking-input price-input"
                type="number"
                min="0"
                step="0.01"
                data-photo-id="${photo.id}"
                data-photo-name="${photo.name}"
                data-photo-image="${photo.image}"
                value="${savedPrice}"
                placeholder="Enter price"
              />
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

priceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputs = document.querySelectorAll(".price-input");

  try {
    for (const input of inputs) {
      const photoId = input.dataset.photoId;
      const name = input.dataset.photoName;
      const image = input.dataset.photoImage;
      const price = Number(input.value || 0);

      await setDoc(doc(db, "photoPrices", photoId), {
        name,
        image,
        price,
        updatedAt: serverTimestamp(),
      });
    }

    showMessage("Photo prices saved successfully.");
  } catch (error) {
    console.error("Price save error:", error);
    showMessage("Could not save photo prices.", "is-danger");
  }
});

document.addEventListener("DOMContentLoaded", loadExistingPrices);
