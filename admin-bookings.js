import { db } from "./app.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookingsContainer = document.getElementById("bookingsContainer");
const adminBookingsMessage = document.getElementById("adminBookingsMessage");

function showMessage(text, type = "is-light") {
  adminBookingsMessage.className = `notification ${type}`;
  adminBookingsMessage.textContent = text;
}

function formatField(value) {
  if (!value) return "Not provided";
  return value;
}

function bookingCardTemplate(bookingId, booking) {
  return `
    <div class="column is-full">
      <div class="admin-booking-card">
        <div class="columns is-multiline">
          <div class="column is-8">
            <h3 class="title is-4 has-text-black mb-2">${formatField(booking.sessionType)}</h3>
            <p><strong>Status:</strong> <span class="booking-status-text">${formatField(booking.status)}</span></p>
            <p><strong>Name:</strong> ${formatField(booking.fullName)}</p>
            <p><strong>Email:</strong> ${formatField(booking.emailAddress)}</p>
            <p><strong>Phone:</strong> ${formatField(booking.phoneNumber)}</p>
            <p><strong>Preferred Date:</strong> ${formatField(booking.preferredDate)}</p>
            <p><strong>Preferred Time:</strong> ${formatField(booking.preferredTime)}</p>
            <p><strong>Location:</strong> ${formatField(booking.preferredLocation)}</p>
            <p><strong>User Account Email:</strong> ${formatField(booking.userEmail)}</p>
            <p><strong>Notes:</strong> ${formatField(booking.additionalNotes)}</p>
          </div>

          <div class="column is-4">
            <div class="admin-booking-actions">
              <button class="button hero-button-primary admin-status-button" data-id="${bookingId}" data-status="confirmed">
                Mark Confirmed
              </button>

              <button class="button hero-button-secondary admin-status-button" data-id="${bookingId}" data-status="completed">
                Mark Completed
              </button>

              <button class="button is-danger admin-status-button" data-id="${bookingId}" data-status="cancelled">
                Mark Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadBookings() {
  bookingsContainer.innerHTML = "";
  showMessage("Loading booking requests...", "is-light");

  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(bookingsQuery);

    if (snapshot.empty) {
      bookingsContainer.innerHTML = "";
      showMessage("No booking requests found.", "is-warning");
      return;
    }

    let html = "";

    snapshot.forEach((bookingDoc) => {
      html += bookingCardTemplate(bookingDoc.id, bookingDoc.data());
    });

    bookingsContainer.innerHTML = html;
    showMessage("Bookings loaded successfully.", "is-success");

    attachStatusHandlers();
  } catch (error) {
    console.error("Error loading bookings:", error);
    showMessage("Could not load booking requests.", "is-danger");
  }
}

function attachStatusHandlers() {
  const buttons = document.querySelectorAll(".admin-status-button");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const bookingId = button.dataset.id;
      const newStatus = button.dataset.status;

      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "Updating...";

      try {
        await updateDoc(doc(db, "bookings", bookingId), {
          status: newStatus,
        });

        await loadBookings();
      } catch (error) {
        console.error("Error updating booking status:", error);
        showMessage("Could not update booking status.", "is-danger");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
}

loadBookings();
