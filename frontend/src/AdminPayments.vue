<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

const payments = ref([]);
const loading = ref(true);
const error = ref("");

const fetchPayments = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/admin/payments"
    );

    payments.value = response.data;

  } catch (err) {
    console.error("Payments error:", err);

    error.value =
      err.response?.data?.message ||
      "Failed to load payments.";

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
    return "—";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

onMounted(() => {
  fetchPayments();
});
</script>

<template>
  <div class="payments-page">

    <!-- Header -->
    <header class="page-header">

      <div>
        <p class="small-title">
          ADMIN PANEL
        </p>

        <h1>
          Payment Records
        </h1>

        <p class="subtitle">
          View all reservation payment records.
        </p>
      </div>

    </header>

    <!-- Loading -->
    <div
      v-if="loading"
      class="message-card"
    >
      Loading payments...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="message-card error-card"
    >

      <p>
        {{ error }}
      </p>

      <button
        class="retry-button"
        @click="fetchPayments"
      >
        Try Again
      </button>

    </div>

    <!-- No Payments -->
    <div
      v-else-if="payments.length === 0"
      class="message-card"
    >
      No payment records found.
    </div>

    <!-- Payments -->
    <div
      v-else
      class="table-card"
    >

      <div class="table-header">

        <div>
          <h2>
            Payment Records
          </h2>

          <p>
            {{ payments.length }} payment record(s)
          </p>
        </div>

      </div>

      <div class="table-wrapper">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Reservation</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Paid At</th>
            </tr>

          </thead>

          <tbody>

            <tr
              v-for="payment in payments"
              :key="payment.id"
            >

              <td>
                {{ payment.id }}
              </td>

              <td>
                <strong>
                  {{ payment.guest_name }}
                </strong>
              </td>

              <td>
                Room {{ payment.room_number }}
              </td>

              <td>
                #{{ payment.reservation_id }}
              </td>

              <td>
                <strong>
                  ₱{{ formatAmount(payment.amount) }}
                </strong>
              </td>

              <td>
                {{ payment.payment_method || "—" }}
              </td>

              <td>
                <span class="reference">
                  {{ payment.transaction_reference || "—" }}
                </span>
              </td>

              <td>

                <span
                  class="status-badge"
                  :class="payment.status"
                >
                  {{ payment.status }}
                </span>

              </td>

              <td>
                {{ formatDateTime(payment.paid_at) }}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>
</template>

<style scoped>
.payments-page {
  min-height: 100vh;
  padding: 38px 30px;

  background: #f7f8fc;
}

/* HEADER */

.page-header {
  max-width: 1180px;
  margin: 0 auto 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.small-title {
  margin: 0 0 7px;

  color: #2563eb;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 1px;
}

.page-header h1 {
  margin: 0 0 7px;

  color: #111827;

  font-size: 28px;
}

.subtitle {
  margin: 0;

  color: #6b7280;

  font-size: 14px;
}

/* MESSAGE */

.message-card {
  max-width: 1180px;
  margin: 0 auto;

  padding: 35px;

  text-align: center;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 14px;

  color: #6b7280;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);
}

.error-card {
  color: #dc2626;
}

.retry-button {
  margin-top: 10px;

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

/* TABLE */

.table-card {
  max-width: 1180px;
  margin: 0 auto;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 14px;

  box-shadow:
    0 5px 18px rgba(17, 24, 39, 0.05);

  overflow: hidden;
}

.table-header {
  padding: 22px 24px;

  border-bottom: 1px solid #e5e7eb;
}

.table-header h2 {
  margin: 0 0 5px;

  color: #111827;

  font-size: 20px;
}

.table-header p {
  margin: 0;

  color: #6b7280;

  font-size: 13px;
}

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1100px;

  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  padding: 15px 18px;

  text-align: left;

  color: #6b7280;

  font-size: 12px;
  font-weight: 600;

  border-bottom: 1px solid #e5e7eb;

  white-space: nowrap;
}

td {
  padding: 16px 18px;

  color: #374151;

  font-size: 13px;

  border-bottom: 1px solid #f1f5f9;

  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f9fafb;
}

td strong {
  color: #111827;
}

.reference {
  color: #6b7280;

  font-size: 12px;
}

/* STATUS */

.status-badge {
  display: inline-block;

  padding: 5px 10px;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 600;

  text-transform: capitalize;
}

.status-badge.paid {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

/* MOBILE */

@media (max-width: 700px) {

  .payments-page {
    padding: 25px 18px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 25px;
  }

}
</style>