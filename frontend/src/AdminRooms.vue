<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

const rooms = ref([]);
const loading = ref(true);
const error = ref("");

const fetchRooms = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/rooms"
    );

    rooms.value = response.data;
  } catch (err) {
    console.error("Rooms error:", err);

    error.value =
      err.response?.data?.message ||
      "Failed to load rooms.";
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
};

onMounted(() => {
  fetchRooms();
});
</script>

<template>
  <div class="rooms-page">

    <!-- Header -->
    <section class="page-header">

      <div>
        <p class="small-title">
          ADMIN PANEL
        </p>

        <h2>
          Manage Rooms
        </h2>

        <p>
          View all hotel rooms and their current information.
        </p>
      </div>

      <div class="header-buttons">

        <button
          class="refresh-button"
          @click="fetchRooms"
        >
          ↻ Refresh
        </button>

      </div>

    </section>

    <!-- Loading -->
    <div
      v-if="loading"
      class="message-card"
    >
      Loading rooms...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="message-card error"
    >
      <p>{{ error }}</p>

      <button
        class="retry-button"
        @click="fetchRooms"
      >
        Try Again
      </button>
    </div>

    <!-- Rooms -->
    <div
      v-else
      class="rooms-container"
    >

      <div
        v-if="rooms.length === 0"
        class="message-card"
      >
        No rooms found.
      </div>

      <div
        v-else
        class="rooms-grid"
      >

        <article
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
        >

          <div class="room-header">

            <div>
              <span class="room-label">
                ROOM
              </span>

              <h3>
                {{ room.room_number }}
              </h3>
            </div>

            <span
              class="status-badge"
              :class="room.status"
            >
              {{ room.status }}
            </span>

          </div>

          <div class="room-body">

            <h4>
              {{ room.room_type }}
            </h4>

            <p class="description">
              {{ room.description }}
            </p>

            <div class="room-details">

              <div>
                <span>
                  Price / Night
                </span>

                <strong>
                  ₱{{ formatAmount(room.price_per_night) }}
                </strong>
              </div>

              <div>
                <span>
                  Capacity
                </span>

                <strong>
                  {{ room.capacity }} guests
                </strong>
              </div>

            </div>

          </div>

        </article>

      </div>

    </div>

  </div>
</template>

<style scoped>
.rooms-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 38px 30px;
}

/* HEADER */

.page-header {
  margin-bottom: 25px;

  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 20px;
}

.small-title {
  margin: 0 0 6px;

  color: #2563eb;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 1px;
}

.page-header h2 {
  margin: 0 0 6px;

  color: #111827;

  font-size: 26px;
}

.page-header p:last-child {
  margin: 0;

  color: #6b7280;

  font-size: 14px;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-button {
  padding: 10px 16px;

  border: none;
  border-radius: 8px;

  background: #2563eb;
  color: #ffffff;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
}

.refresh-button:hover {
  background: #1d4ed8;
}

/* ROOMS */

.rooms-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;
}

.room-card {
  background: #ffffff;

  border: 1px solid #e5e7eb;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.room-header {
  padding: 20px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  border-bottom: 1px solid #e5e7eb;
}

.room-label {
  display: block;

  margin-bottom: 4px;

  color: #9ca3af;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1px;
}

.room-header h3 {
  margin: 0;

  color: #111827;

  font-size: 25px;
}

.status-badge {
  padding: 6px 10px;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 600;

  text-transform: capitalize;
}

.status-badge.available {
  background: #dcfce7;
  color: #166534;
}

.status-badge.maintenance {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.unavailable {
  background: #fee2e2;
  color: #991b1b;
}

.room-body {
  padding: 20px;
}

.room-body h4 {
  margin: 0 0 7px;

  color: #111827;

  font-size: 17px;
}

.description {
  min-height: 42px;

  margin: 0 0 20px;

  color: #6b7280;

  font-size: 13px;

  line-height: 1.5;
}

.room-details {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 15px;

  padding-top: 15px;

  border-top: 1px solid #f1f5f9;
}

.room-details span {
  display: block;

  margin-bottom: 5px;

  color: #9ca3af;

  font-size: 11px;
}

.room-details strong {
  color: #111827;

  font-size: 13px;
}

/* MESSAGES */

.message-card {
  padding: 40px;

  text-align: center;

  background: #ffffff;

  border: 1px solid #e5e7eb;

  border-radius: 14px;

  color: #6b7280;
}

.message-card.error {
  color: #dc2626;
}

.retry-button {
  margin-top: 12px;

  padding: 10px 16px;

  border: none;
  border-radius: 8px;

  background: #2563eb;
  color: #ffffff;

  cursor: pointer;
}

.retry-button:hover {
  background: #1d4ed8;
}

/* MOBILE */

@media (max-width: 900px) {
  .rooms-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .rooms-page {
    padding: 25px 18px;
  }

  .page-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .header-buttons {
    width: 100%;
  }

  .refresh-button {
    width: 100%;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>