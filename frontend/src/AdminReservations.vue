<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

const reservations = ref([]);
const loading = ref(true);
const error = ref("");

const fetchReservations = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/admin/recent-reservations"
    );

    reservations.value = response.data;
  } catch (err) {
    console.error("Reservations error:", err);

    error.value =
      err.response?.data?.message ||
      "Failed to load reservations.";
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

onMounted(() => {
  fetchReservations();
});
</script>

<template>
  <div class="reservations-page">

    <section class="page-header">
      <div>
        <p class="small-title">
          ADMIN PANEL
        </p>

        <h2>
          Manage Reservations
        </h2>

        <p>
          View recent hotel reservations and their current status.
        </p>
      </div>

      <div class="header-buttons">

        <button
          class="refresh-button"
          @click="fetchReservations"
        >
          ↻ Refresh
        </button>

      </div>
    </section>

    <div
      v-if="loading"
      class="message-card"
    >
      Loading reservations...
    </div>

    <div
      v-else-if="error"
      class="message-card error"
    >
      <p>
        {{ error }}
      </p>

      <button
        class="retry-button"
        @click="fetchReservations"
      >
        Try Again
      </button>
    </div>

    <div
      v-else
      class="reservations-container"
    >

      <div
        v-if="reservations.length === 0"
        class="message-card"
      >
        No reservations found.
      </div>

      <div
        v-else
        class="table-card"
      >

        <div class="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Room Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="reservation in reservations"
                :key="reservation.id"
              >

                <td>
                  #{{ reservation.id }}
                </td>

                <td class="guest-name">
                  {{ reservation.guest_name }}
                </td>

                <td>
                  Room {{ reservation.room_number }}
                </td>

                <td>
                  {{ reservation.room_type }}
                </td>

                <td>
                  {{ formatDate(reservation.check_in) }}
                </td>

                <td>
                  {{ formatDate(reservation.check_out) }}
                </td>

                <td class="amount">
                  ₱{{ formatAmount(reservation.total_amount) }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="reservation.status"
                  >
                    {{ reservation.status }}
                  </span>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.reservations-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 38px 30px;
}

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

.reservations-container {
  width: 100%;
}

.table-card {
  width: 100%;

  background: #ffffff;

  border: 1px solid #e5e7eb;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 900px;

  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 15px 16px;

  text-align: left;

  color: #6b7280;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.5px;

  border-bottom: 1px solid #e5e7eb;

  white-space: nowrap;
}

td {
  padding: 16px;

  color: #4b5563;

  font-size: 13px;

  border-bottom: 1px solid #f1f5f9;

  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f8fafc;
}

.guest-name {
  color: #111827;

  font-weight: 600;
}

.amount {
  color: #111827;

  font-weight: 600;
}

.status-badge {
  display: inline-block;

  padding: 6px 10px;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 600;

  text-transform: capitalize;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

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

@media (max-width: 700px) {

  .reservations-page {
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

}
</style>