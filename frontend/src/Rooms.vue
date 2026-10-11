<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

const rooms = ref([]);
const loading = ref(true);
const error = ref("");

const selectedRoom = ref(null);

const checkIn = ref("");
const checkOut = ref("");
const guestsCount = ref(1);

const reservationError = ref("");
const reservationLoading = ref(false);

const fetchRooms = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/api/rooms"
    );

    rooms.value = response.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load rooms.";
  } finally {
    loading.value = false;
  }
};

const openReservation = (room) => {
  selectedRoom.value = room;

  checkIn.value = "";
  checkOut.value = "";
  guestsCount.value = 1;
  reservationError.value = "";
};

const closeReservation = () => {
  if (reservationLoading.value) {
    return;
  }

  selectedRoom.value = null;
  reservationError.value = "";
};

const reserveRoom = async () => {
  reservationError.value = "";

  if (!checkIn.value || !checkOut.value) {
    reservationError.value =
      "Please select your check-in and check-out dates.";
    return;
  }

  if (checkOut.value <= checkIn.value) {
    reservationError.value =
      "Check-out date must be after check-in date.";
    return;
  }

  if (
    guestsCount.value < 1 ||
    guestsCount.value > selectedRoom.value.capacity
  ) {
    reservationError.value =
      `This room allows up to ${selectedRoom.value.capacity} guests.`;
    return;
  }

  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    reservationError.value =
      "Please login first before making a reservation.";
    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (err) {
    console.error("User data error:", err);

    reservationError.value =
      "Invalid login session. Please login again.";
    return;
  }

  if (!user.id) {
    reservationError.value =
      "User account could not be identified. Please login again.";
    return;
  }

  try {
    reservationLoading.value = true;

    const response = await axios.post(
      "http://localhost:4000/api/reservations",
      {
        user_id: user.id,
        room_id: selectedRoom.value.id,
        check_in: checkIn.value,
        check_out: checkOut.value,
        guests_count: guestsCount.value
      }
    );

    alert(
      response.data.message ||
      "Reservation created successfully."
    );

    selectedRoom.value = null;

    checkIn.value = "";
    checkOut.value = "";
    guestsCount.value = 1;
    reservationError.value = "";

  } catch (err) {
    console.error("Reservation error:", err);

    reservationError.value =
      err.response?.data?.message ||
      "Failed to create reservation. Please try again.";

  } finally {
    reservationLoading.value = false;
  }
};

onMounted(fetchRooms);
</script>

<template>
  <main class="rooms-page">

    <header class="page-header">
      <h1>Hotel Rooms</h1>
      <p>Choose a room that fits your stay.</p>
    </header>

    <p v-if="loading" class="message">
      Loading rooms...
    </p>

    <p v-else-if="error" class="message error">
      {{ error }}
    </p>

    <section v-else class="rooms-grid">

      <article
        v-for="room in rooms"
        :key="room.id"
        class="room-card"
      >

        <div class="room-image">
          <span>{{ room.room_type }}</span>
        </div>

        <div class="room-content">

          <div class="room-title">
            <h2>Room {{ room.room_number }}</h2>

            <span class="status">
              {{ room.status }}
            </span>
          </div>

          <p class="description">
            {{ room.description }}
          </p>

          <div class="room-info">
            <span>
              👥 {{ room.capacity }} guests
            </span>
          </div>

          <div class="room-bottom">

            <div>
              <strong>
                ₱{{ room.price_per_night }}
              </strong>

              <small>
                / night
              </small>
            </div>

            <button
              :disabled="room.status !== 'available'"
              @click="openReservation(room)"
            >
              Reserve
            </button>

          </div>

        </div>

      </article>

    </section>

    <!-- Reservation Modal -->
    <div
      v-if="selectedRoom"
      class="modal-overlay"
      @click.self="closeReservation"
    >

      <div class="reservation-modal">

        <button
          class="close-button"
          type="button"
          :disabled="reservationLoading"
          @click="closeReservation"
        >
          ×
        </button>

        <h2>
          Reserve Room {{ selectedRoom.room_number }}
        </h2>

        <p class="modal-room-type">
          {{ selectedRoom.room_type }}
        </p>

        <div class="form-group">

          <label for="check-in">
            Check-in
          </label>

          <input
            id="check-in"
            v-model="checkIn"
            type="date"
            :disabled="reservationLoading"
          />

        </div>

        <div class="form-group">

          <label for="check-out">
            Check-out
          </label>

          <input
            id="check-out"
            v-model="checkOut"
            type="date"
            :disabled="reservationLoading"
          />

        </div>

        <div class="form-group">

          <label for="guests">
            Number of Guests
          </label>

          <input
            id="guests"
            v-model.number="guestsCount"
            type="number"
            min="1"
            :max="selectedRoom.capacity"
            :disabled="reservationLoading"
          />

          <small>
            Maximum: {{ selectedRoom.capacity }} guests
          </small>

        </div>

        <p
          v-if="reservationError"
          class="reservation-error"
        >
          {{ reservationError }}
        </p>

        <div class="modal-actions">

          <button
            type="button"
            class="cancel-button"
            :disabled="reservationLoading"
            @click="closeReservation"
          >
            Cancel
          </button>

          <button
            type="button"
            class="confirm-button"
            :disabled="reservationLoading"
            @click="reserveRoom"
          >
            {{ reservationLoading ? "Saving..." : "Continue" }}
          </button>

        </div>

      </div>

    </div>

  </main>
</template>

<style scoped>
.rooms-page {
  min-height: 100vh;
  padding: 40px;
  background: #f5f7fb;
  font-family: Arial, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 35px;
}

.page-header h1 {
  margin: 0 0 10px;
  font-size: 36px;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.rooms-grid {
  max-width: 1200px;
  margin: 0 auto;

  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(280px, 1fr));

  gap: 24px;
}

.room-card {
  overflow: hidden;
  background: white;
  border-radius: 16px;

  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08);
}

.room-image {
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #dbeafe;
  color: #1e40af;

  font-size: 22px;
  font-weight: bold;
}

.room-content {
  padding: 20px;
}

.room-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.room-title h2 {
  margin: 0;
  color: #111827;
  font-size: 21px;
}

.status {
  padding: 5px 9px;

  border-radius: 20px;

  background: #dcfce7;
  color: #166534;

  font-size: 12px;
  text-transform: capitalize;
}

.description {
  min-height: 45px;

  color: #6b7280;
  line-height: 1.5;
}

.room-info {
  margin: 15px 0;
  color: #4b5563;
}

.room-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.room-bottom strong {
  font-size: 20px;
  color: #111827;
}

.room-bottom small {
  color: #6b7280;
}

.room-bottom button {
  border: none;
  border-radius: 8px;

  padding: 10px 16px;

  background: #2563eb;
  color: white;

  font-weight: bold;
  cursor: pointer;
}

.room-bottom button:hover {
  background: #1d4ed8;
}

.room-bottom button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.message {
  text-align: center;
  margin-top: 50px;
}

.error {
  color: #dc2626;
}

/* Reservation Modal */

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

.reservation-modal {
  position: relative;

  width: 100%;
  max-width: 450px;

  padding: 30px;

  background: white;
  border-radius: 16px;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.2);
}

.reservation-modal h2 {
  margin: 0 0 6px;

  color: #111827;
  font-size: 24px;
}

.modal-room-type {
  margin: 0 0 25px;

  color: #6b7280;
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

.close-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;

  margin-bottom: 7px;

  color: #374151;

  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;

  padding: 11px 12px;

  border: 1px solid #d1d5db;
  border-radius: 8px;

  font-size: 14px;
  outline: none;
}

.form-group input:focus {
  border-color: #2563eb;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group small {
  display: block;

  margin-top: 5px;

  color: #6b7280;
}

.reservation-error {
  margin: 10px 0;

  color: #dc2626;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  margin-top: 25px;
}

.modal-actions button {
  padding: 11px 18px;

  border: none;
  border-radius: 8px;

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

.cancel-button:disabled,
.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-button {
  background: #2563eb;
  color: white;
}

.confirm-button:hover {
  background: #1d4ed8;
}

@media (max-width: 600px) {

  .rooms-page {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .reservation-modal {
    padding: 25px 20px;
  }

}
</style>