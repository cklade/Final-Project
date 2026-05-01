import { db, auth, storage } from "./app.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const photoUploadForm = document.getElementById("photoUploadForm");
const photoNameInput = document.getElementById("photoName");
const photoPriceInput = document.getElementById("photoPrice");
const photoFileInput = document.getElementById("photoFile");
const uploadPhotoButton = document.getElementById("uploadPhotoButton");
const uploadedPhotosContainer = document.getElementById(
  "uploadedPhotosContainer"
);
const message = document.getElementById("adminPhotosMessage");

function showMessage(text, type = "is-success") {
  message.textContent = text;
  message.className = `notification ${type} is-light`;
  message.classList.remove("is-hidden");
}

function hideMessage() {
  message.classList.add("is-hidden");
}

function makeSafeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

async function loadUploadedPhotos() {
  uploadedPhotosContainer.innerHTML = `
    <div class="column is-full">
      <div class="notification is-light">Loading uploaded photos...</div>
    </div>
  `;

  try {
    const photosQuery = query(
      collection(db, "portfolioPhotos"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(photosQuery);

    if (snapshot.empty) {
      uploadedPhotosContainer.innerHTML = `
        <div class="column is-full">
          <div class="notification is-warning is-light">
            No uploaded photos yet.
          </div>
        </div>
      `;
      return;
    }

    uploadedPhotosContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const photo = docSnap.data();

      const card = document.createElement("div");
      card.className = "column is-one-third-desktop is-half-tablet";

      card.innerHTML = `
        <div class="portfolio-card">
          <figure class="image portfolio-image">
            <img src="${photo.imageUrl}" alt="${photo.name}" />
          </figure>

          <p class="portfolio-label">${photo.name}</p>
          <p class="portfolio-price">${formatPrice(photo.price)}</p>

          <div class="portfolio-card-actions">
            <button
              class="button is-danger is-light delete-photo-button"
              data-doc-id="${docSnap.id}"
              data-storage-path="${photo.storagePath}"
            >
              Delete Photo
            </button>
          </div>
        </div>
      `;

      uploadedPhotosContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-photo-button").forEach((button) => {
      button.addEventListener("click", async () => {
        const docId = button.dataset.docId;
        const storagePath = button.dataset.storagePath;

        const confirmDelete = confirm(
          "Delete this uploaded photo from the portfolio?"
        );

        if (!confirmDelete) return;

        try {
          if (storagePath) {
            await deleteObject(ref(storage, storagePath));
          }

          await deleteDoc(doc(db, "portfolioPhotos", docId));

          showMessage("Photo deleted successfully.");
          await loadUploadedPhotos();
        } catch (error) {
          console.error("Delete photo error:", error);
          showMessage("Could not delete photo.", "is-danger");
        }
      });
    });
  } catch (error) {
    console.error("Load uploaded photos error:", error);
    uploadedPhotosContainer.innerHTML = `
      <div class="column is-full">
        <div class="notification is-danger is-light">
          Could not load uploaded photos.
        </div>
      </div>
    `;
  }
}

photoUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const user = auth.currentUser;
  const name = photoNameInput.value.trim();
  const price = Number(photoPriceInput.value || 0);
  const file = photoFileInput.files[0];

  if (!user) {
    showMessage(
      "You must be logged in as an admin to upload photos.",
      "is-danger"
    );
    return;
  }

  if (!name || !file) {
    showMessage("Please enter a photo name and select a file.", "is-danger");
    return;
  }

  if (!file.type.startsWith("image/")) {
    showMessage("Please upload an image file.", "is-danger");
    return;
  }

  try {
    uploadPhotoButton.classList.add("is-loading");
    uploadPhotoButton.disabled = true;

    const safeFileName = makeSafeFileName(file.name);
    const storagePath = `portfolioPhotos/${
      user.uid
    }/${Date.now()}-${safeFileName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);

    const imageUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "portfolioPhotos"), {
      name,
      price,
      imageUrl,
      storagePath,
      active: true,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    showMessage("Photo uploaded successfully.");
    photoUploadForm.reset();
    await loadUploadedPhotos();
  } catch (error) {
    console.error("Upload photo error:", error);
    showMessage("Could not upload photo.", "is-danger");
  } finally {
    uploadPhotoButton.classList.remove("is-loading");
    uploadPhotoButton.disabled = false;
  }
});

document.addEventListener("DOMContentLoaded", loadUploadedPhotos);
