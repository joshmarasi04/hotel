<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

const guests = ref([]);
const loading = ref(true);
const error = ref("");

const fetchGuests = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/admin/guests"
    );

    guests.value = response.data;
  } catch (err) {
    console.error("Guests error:", err);

    error.value =
      err.response?.data?.message ||
      "Failed to load guests.";
  } finally {
    loading.value = false;
  }
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
  fetchGuests();
});
</script>

<template>
  <div class="guests-page">

    <!-- HEADER -->
    <section class="page-header">

      <div>
        <p class="small-title">
          ADMIN PANEL
        </p>

        <h2>
          Manage Guests
        </h2>

        <p>
          View registered guest accounts and their information.
        </p>
      </div>

      <div class="header-buttons">

        <button
          class="refresh-button"
          @click="fetchGuests"
        >
          ↻ Refresh
        </button>

      </div>

    </section>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="message-card"
    >
      Loading guests...
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="message-card error"
    >

      <p>
        {{ error }}
      </p>

      <button
        class="retry-button"
        @click="fetchGuests"
      >
        Try Again
      </button>

    </div>

    <!-- GUEST DATA -->
    <div
      v-else
      class="guests-container"
    >

      <!-- EMPTY -->
      <div
        v-if="guests.length === 0"
        class="message-card"
      >
        No guests found.
      </div>

      <!-- TABLE -->
      <div
        v-else
        class="table-card"
      >

        <div class="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered</th>
              </tr>

            </thead>

            <tbody>

              <tr
                v-for="guest in guests"
                :key="guest.id"
              >

                <td>
                  #{{ guest.id }}
                </td>

                <td class="guest-name">
                  {{ guest.full_name }}
                </td>

                <td>
                  {{ guest.email }}
                </td>

                <td>
                  {{ guest.phone || "-" }}
                </td>

                <td>
                  <span
                    class="role-badge"
                    :class="guest.role"
                  >
                    {{ guest.role }}
                  </span>
                </td>

                <td>
                  {{ formatDate(guest.created_at) }}
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
.guests-page {
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

.guests-container {
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

  min-width: 850px;

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

.role-badge {
  display: inline-block;

  padding: 6px 10px;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 600;

  text-transform: capitalize;
}

.role-badge.guest {
  background: #dcfce7;
  color: #166534;
}

.role-badge.admin {
  background: #dbeafe;
  color: #1e40af;
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

  .guests-page {
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