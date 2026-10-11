<script setup>
import { ref } from "vue";
import axios from "axios";
import Rooms from "./Rooms.vue";

const activePage = ref("home");

const reservations = ref([]);
const reservationsLoading = ref(false);
const reservationsError = ref("");

const selectedReservation = ref(null);

const goHome = () => {
  activePage.value = "home";
};

const goRooms = () => {
  activePage.value = "rooms";
};

const goReservations = async () => {
  activePage.value = "reservations";

  await fetchReservations();
};

const fetchReservations = async () => {
  reservationsError.value = "";

  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    reservationsError.value =
      "Please login first to view your reservations.";
    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (err) {
    console.error("User data error:", err);

    reservationsError.value =
      "Invalid login session. Please login again.";

    return;
  }

  if (!user.id) {
    reservationsError.value =
      "User account could not be identified.";

    return;
  }

  try {
    reservationsLoading.value = true;

    const response = await axios.get(
      `http://localhost:4000/api/reservations/user/${user.id}`
    );

    reservations.value = response.data;

  } catch (err) {
    console.error("Reservations error:", err);

    reservationsError.value =
      err.response?.data?.message ||
      "Failed to load reservations.";

  } finally {
    reservationsLoading.value = false;
  }
};

const openPayment = (reservation) => {
  selectedReservation.value = reservation;
};

const closePayment = () => {
  selectedReservation.value = null;
};

const processPayment = async () => {
  if (!selectedReservation.value) {
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:4000/api/payments",
      {
        reservation_id: selectedReservation.value.id,
        amount: selectedReservation.value.total_amount,
        payment_method: "Test Payment"
      }
    );

    alert(response.data.message);

    closePayment();

    await fetchReservations();

  } catch (err) {
    console.error("Payment error:", err);

    alert(
      err.response?.data?.message ||
      "Payment failed."
    );
  }
};

const logout = () => {
  localStorage.removeItem("user");
  window.location.reload();
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const formattedDate = new Date(date);

  return formattedDate.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
};

const formatAmount = (amount) => {
  return Number(amount).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
};
</script>

<template>
  <div class="dashboard">

    <!-- Navbar -->
    <header class="navbar">

      <div class="brand">
        <h1>Hotel Reservation</h1>
        <p>Guest Dashboard</p>
      </div>

      <nav class="nav-links">

        <button
          :class="{ active: activePage === 'home' }"
          @click="goHome"
        >
          Home
        </button>

        <button
          :class="{ active: activePage === 'rooms' }"
          @click="goRooms"
        >
          Rooms
        </button>

        <button
          :class="{ active: activePage === 'reservations' }"
          @click="goReservations"
        >
          My Reservations
        </button>

        <button @click="logout">
          Logout
        </button>

      </nav>

    </header>

    <!-- Home -->
    <main
      v-if="activePage === 'home'"
      class="content"
    >

      <section class="welcome-card">

        <p class="small-title">
          WELCOME BACK
        </p>

        <h2>
          Welcome, Guest!
        </h2>

        <p>
          Find the perfect room for your next stay.
        </p>

        <button
          class="primary-button"
          @click="goRooms"
        >
          Browse Rooms
        </button>

      </section>

      <section class="section-header">

        <div>
          <h2>
            Available Rooms
          </h2>

          <p>
            Choose from our available rooms below.
          </p>
        </div>

        <span class="room-count">
          7 Rooms
        </span>

      </section>

      <div class="rooms-container">
        <Rooms />
      </div>

    </main>

    <!-- Rooms -->
    <main
      v-else-if="activePage === 'rooms'"
      class="content"
    >

      <section class="page-header">

        <h2>
          Available Rooms
        </h2>

        <p>
          Choose a room for your stay.
        </p>

      </section>

      <div class="rooms-container">
        <Rooms />
      </div>

    </main>

    <!-- My Reservations -->
    <main
      v-else-if="activePage === 'reservations'"
      class="content"
    >

      <section class="reservations-section">

        <div class="page-header">

          <h2>
            My Reservations
          </h2>

          <p>
            View your hotel reservations.
          </p>

        </div>

        <!-- Loading -->
        <div
          v-if="reservationsLoading"
          class="empty-card"
        >

          <div class="empty-icon">
            ⏳
          </div>

          <h2>
            Loading reservations...
          </h2>

          <p>
            Please wait while we load your reservations.
          </p>

        </div>

        <!-- Error -->
        <div
          v-else-if="reservationsError"
          class="empty-card"
        >

          <div class="empty-icon">
            ⚠️
          </div>

          <h2>
            Unable to load reservations
          </h2>

          <p>
            {{ reservationsError }}
          </p>

          <button
            class="primary-button"
            @click="fetchReservations"
          >
            Try Again
          </button>

        </div>

        <!-- No Reservations -->
        <div
          v-else-if="reservations.length === 0"
          class="empty-card"
        >

          <div class="empty-icon">
            📋
          </div>

          <h2>
            No Reservations Yet
          </h2>

          <p>
            Your reservations will appear here.
          </p>

          <button
            class="primary-button"
            @click="goRooms"
          >
            Browse Rooms
          </button>

        </div>

        <!-- Reservations List -->
        <div
          v-else
          class="reservations-list"
        >

          <article
            v-for="reservation in reservations"
            :key="reservation.id"
            class="reservation-card"
          >

            <div class="reservation-header">

              <div>
                <h3>
                  Room {{ reservation.room_number }}
                </h3>

                <p>
                  {{ reservation.room_type }}
                </p>
              </div>

              <span
                class="reservation-status"
                :class="reservation.status"
              >
                {{ reservation.status }}
              </span>

            </div>

            <div class="reservation-details">

              <div class="detail-item">

                <span class="detail-label">
                  Check-in
                </span>

                <strong>
                  {{ formatDate(reservation.check_in) }}
                </strong>

              </div>

              <div class="detail-item">

                <span class="detail-label">
                  Check-out
                </span>

                <strong>
                  {{ formatDate(reservation.check_out) }}
                </strong>

              </div>

              <div class="detail-item">

                <span class="detail-label">
                  Guests
                </span>

                <strong>
                  {{ reservation.guests_count }}
                </strong>

              </div>

              <div class="detail-item">

                <span class="detail-label">
                  Total Amount
                </span>

                <strong>
                  ₱{{ formatAmount(reservation.total_amount) }}
                </strong>

              </div>

            </div>

            <!-- Payment Button -->
            <div class="reservation-actions">

              <button
                v-if="reservation.status !== 'confirmed'"
                class="pay-button"
                @click="openPayment(reservation)"
              >
                Pay Now
              </button>

              <span
                v-else
                class="paid-label"
              >
                ✓ Paid
              </span>

            </div>

          </article>

        </div>

      </section>

    </main>

    <!-- Payment Modal -->
    <div
      v-if="selectedReservation"
      class="modal-overlay"
      @click.self="closePayment"
    >

      <div class="payment-modal">

        <button
          class="close-button"
          type="button"
          @click="closePayment"
        >
          ×
        </button>

        <div class="payment-icon">
          💳
        </div>

        <h2>
          Payment
        </h2>

        <p class="payment-subtitle">
          Complete your payment for Room
          {{ selectedReservation.room_number }}.
        </p>

        <div class="payment-summary">

          <div class="summary-row">
            <span>
              Room
            </span>

            <strong>
              {{ selectedReservation.room_type }}
            </strong>
          </div>

          <div class="summary-row">
            <span>
              Check-in
            </span>

            <strong>
              {{ formatDate(selectedReservation.check_in) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>
              Check-out
            </span>

            <strong>
              {{ formatDate(selectedReservation.check_out) }}
            </strong>
          </div>

          <div class="summary-row total-row">
            <span>
              Total
            </span>

            <strong>
              ₱{{ formatAmount(selectedReservation.total_amount) }}
            </strong>
          </div>

        </div>

        <p class="payment-message">
          This is a test payment. Your reservation will be confirmed after payment.
        </p>

        <div class="payment-actions">

          <button
            type="button"
            class="cancel-button"
            @click="closePayment"
          >
            Cancel
          </button>

          <button
            type="button"
            class="continue-payment-button"
            @click="processPayment"
          >
            Continue to Payment
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f7f8fc;
}

/* NAVBAR */

.navbar {
  min-height: 72px;
  padding: 8px 38px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;

  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04);
}

.brand h1 {
  margin: 0;

  font-size: 40px;
  line-height: 1;

  color: #1f2937;
  font-weight: 600;
}

.brand p {
  margin: 2px 0 0 104px;

  font-size: 13px;
  color: #7b8494;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links button {
  padding: 10px 12px;

  border: none;
  background: transparent;

  color: #374151;

  font-size: 12px;

  cursor: pointer;
  border-radius: 6px;
}

.nav-links button:hover {
  background: #f3f4f6;
}

.nav-links button.active {
  color: #2563eb;
  font-weight: 600;
}

/* CONTENT */

.content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 38px 30px;
}

/* WELCOME */

.welcome-card {
  padding: 32px;
  margin-bottom: 35px;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 16px;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.small-title {
  margin: 0 0 8px;

  font-size: 12px;
  font-weight: 700;

  color: #2563eb;
  letter-spacing: 1px;
}

.welcome-card h2 {
  margin: 0 0 8px;

  font-size: 28px;
  color: #111827;
}

.welcome-card p {
  color: #6b7280;
}

/* SECTION */

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;
}

.section-header h2,
.page-header h2 {
  margin: 0 0 5px;

  font-size: 23px;
  color: #111827;
}

.section-header p,
.page-header p {
  margin: 0;

  color: #6b7280;
  font-size: 14px;
}

.room-count {
  padding: 7px 13px;

  background: #eff6ff;
  color: #2563eb;

  border-radius: 20px;

  font-size: 13px;
  font-weight: 600;
}

/* ROOMS */

.rooms-container {
  padding: 22px;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 16px;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.04);
}

.page-header {
  margin-bottom: 22px;
}

/* BUTTON */

.primary-button {
  margin-top: 18px;

  padding: 11px 18px;

  border: none;
  border-radius: 8px;

  background: #2563eb;
  color: #ffffff;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
}

.primary-button:hover {
  background: #1d4ed8;
}

/* RESERVATIONS */

.reservations-section {
  width: 100%;
}

.reservations-list {
  display: grid;
  gap: 20px;
}

.reservation-card {
  padding: 24px;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 16px;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.reservation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  padding-bottom: 18px;

  border-bottom: 1px solid #e5e7eb;
}

.reservation-header h3 {
  margin: 0 0 5px;

  font-size: 21px;
  color: #111827;
}

.reservation-header p {
  margin: 0;

  color: #6b7280;
  font-size: 14px;
}

.reservation-status {
  padding: 6px 12px;

  border-radius: 20px;

  font-size: 12px;
  font-weight: 600;

  text-transform: capitalize;
}

/* STATUS COLORS */

.reservation-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.reservation-status.confirmed {
  background: #dcfce7;
  color: #166534;
}

.reservation-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-status.completed {
  background: #dbeafe;
  color: #1e40af;
}

.reservation-details {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 20px;

  padding-top: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;

  gap: 6px;
}

.detail-label {
  color: #6b7280;

  font-size: 12px;
}

.detail-item strong {
  color: #111827;

  font-size: 14px;
}

/* PAYMENT BUTTON */

.reservation-actions {
  display: flex;
  justify-content: flex-end;

  margin-top: 20px;
  padding-top: 18px;

  border-top: 1px solid #e5e7eb;
}

.pay-button {
  padding: 11px 20px;

  border: none;
  border-radius: 8px;

  background: #16a34a;
  color: #ffffff;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
}

.pay-button:hover {
  background: #15803d;
}

.paid-label {
  padding: 11px 20px;

  background: #dcfce7;
  color: #166534;

  border-radius: 8px;

  font-size: 14px;
  font-weight: 600;
}

/* PAYMENT MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(17, 24, 39, 0.5);

  z-index: 1000;
}

.payment-modal {
  position: relative;

  width: 100%;
  max-width: 480px;

  padding: 30px;

  background: #ffffff;

  border-radius: 16px;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;

  top: 15px;
  right: 18px;

  border: none;
  background: transparent;

  font-size: 28px;

  color: #6b7280;

  cursor: pointer;
}

.payment-icon {
  margin-bottom: 10px;

  font-size: 36px;
}

.payment-modal h2 {
  margin: 0 0 6px;

  font-size: 25px;

  color: #111827;
}

.payment-subtitle {
  margin: 0 0 25px;

  color: #6b7280;

  line-height: 1.5;
}

.payment-summary {
  padding: 18px;

  background: #f9fafb;

  border: 1px solid #e5e7eb;

  border-radius: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;

  gap: 15px;

  padding: 10px 0;

  color: #6b7280;

  font-size: 14px;
}

.summary-row strong {
  color: #111827;

  text-align: right;
}

.total-row {
  margin-top: 8px;
  padding-top: 15px;

  border-top: 1px solid #d1d5db;

  color: #111827;

  font-size: 16px;
}

.total-row strong {
  font-size: 18px;
}

.payment-message {
  margin: 20px 0;

  padding: 12px;

  background: #eff6ff;

  border-radius: 8px;

  color: #1e40af;

  font-size: 13px;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  margin-top: 20px;
}

.payment-actions button {
  padding: 11px 18px;

  border: none;
  border-radius: 8px;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
}

.cancel-button {
  background: #e5e7eb;
  color: #374151;
}

.cancel-button:hover {
  background: #d1d5db;
}

.continue-payment-button {
  background: #2563eb;
  color: #ffffff;
}

.continue-payment-button:hover {
  background: #1d4ed8;
}

/* EMPTY */

.empty-card {
  max-width: 600px;

  margin: 50px auto;

  padding: 50px 30px;

  text-align: center;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 16px;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.empty-icon {
  font-size: 38px;
  margin-bottom: 15px;
}

.empty-card h2 {
  margin: 0 0 8px;

  color: #111827;
}

.empty-card p {
  margin: 0;

  color: #6b7280;
}

/* MOBILE */

@media (max-width: 700px) {

  .navbar {
    padding: 15px 18px;

    flex-direction: column;
    align-items: flex-start;

    gap: 15px;
  }

  .brand h1 {
    font-size: 30px;
  }

  .brand p {
    margin-left: 0;
  }

  .nav-links {
    width: 100%;
    overflow-x: auto;
  }

  .content {
    padding: 25px 18px;
  }

  .section-header {
    align-items: flex-start;

    gap: 15px;
  }

  .reservation-header {
    flex-direction: column;
  }

  .reservation-details {
    grid-template-columns: repeat(2, 1fr);
  }

}

@media (max-width: 450px) {

  .reservation-details {
    grid-template-columns: 1fr;
  }

  .reservation-actions {
    justify-content: stretch;
  }

  .pay-button {
    width: 100%;
  }

  .paid-label {
    width: 100%;
    text-align: center;
  }

  .payment-modal {
    padding: 25px 20px;
  }

  .payment-actions {
    flex-direction: column;
  }

  .payment-actions button {
    width: 100%;
  }

}
</style>