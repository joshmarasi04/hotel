<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import AdminRooms from "./AdminRooms.vue";
import AdminReservations from "./AdminReservations.vue";
import AdminGuests from "./AdminGuests.vue";
import AdminPayments from "./AdminPayments.vue";

const activeSection = ref("dashboard");

const loading = ref(true);
const error = ref("");

const reservationsLoading = ref(true);
const reservationsError = ref("");

const stats = ref({
  total_rooms: 0,
  available_rooms: 0,
  total_reservations: 0,
  pending_reservations: 0,
  confirmed_reservations: 0,
  cancelled_reservations: 0,
  paid_payments: 0,
  total_revenue: 0
});

const recentReservations = ref([]);

const fetchDashboardStats = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/admin/dashboard-stats"
    );

    stats.value = response.data;
  } catch (err) {
    console.error("Dashboard statistics error:", err);

    error.value =
      err.response?.data?.message ||
      "Failed to load dashboard statistics.";
  } finally {
    loading.value = false;
  }
};

const fetchRecentReservations = async () => {
  try {
    reservationsLoading.value = true;
    reservationsError.value = "";

    const response = await axios.get(
      "http://localhost:4000/api/admin/recent-reservations"
    );

    recentReservations.value = response.data;
  } catch (err) {
    console.error("Recent reservations error:", err);

    reservationsError.value =
      err.response?.data?.message ||
      "Failed to load recent reservations.";
  } finally {
    reservationsLoading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("user");
  window.location.reload();
};

const goToSection = (section) => {
  activeSection.value = section;
};

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

onMounted(() => {
  fetchDashboardStats();
  fetchRecentReservations();
});
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">🏨</div>

        <div class="brand-text">
          <h1>Hotel Stay</h1>
          <span>Management System</span>
        </div>
      </div>

      <div class="sidebar-menu">
        <p class="menu-title">MAIN MENU</p>

        <button
          class="menu-item"
          :class="{ active: activeSection === 'dashboard' }"
          @click="goToSection('dashboard')"
        >
          <span class="menu-icon">⌂</span>
          <span>Dashboard</span>
        </button>

        <button
          class="menu-item"
          :class="{ active: activeSection === 'rooms' }"
          @click="goToSection('rooms')"
        >
          <span class="menu-icon">▦</span>
          <span>Rooms</span>
        </button>

        <button
          class="menu-item"
          :class="{ active: activeSection === 'reservations' }"
          @click="goToSection('reservations')"
        >
          <span class="menu-icon">▣</span>
          <span>Reservations</span>
        </button>

        <button
          class="menu-item"
          :class="{ active: activeSection === 'guests' }"
          @click="goToSection('guests')"
        >
          <span class="menu-icon">♙</span>
          <span>Guests</span>
        </button>

        <button
          class="menu-item"
          :class="{ active: activeSection === 'payments' }"
          @click="goToSection('payments')"
        >
          <span class="menu-icon">₱</span>
          <span>Payments</span>
        </button>

        <div class="menu-divider"></div>

        <p class="menu-title">MANAGEMENT</p>

        <button class="menu-item disabled-item" type="button">
          <span class="menu-icon">▤</span>
          <span>Reports</span>
          <small>SOON</small>
        </button>

        <button class="menu-item disabled-item" type="button">
          <span class="menu-icon">⚙</span>
          <span>Settings</span>
          <small>SOON</small>
        </button>
      </div>

      <div class="sidebar-bottom">
        <div class="admin-profile">
          <div class="profile-avatar">A</div>

          <div class="profile-info">
            <strong>Administrator</strong>
            <span>Hotel Admin</span>
          </div>
        </div>

        <button class="sidebar-logout" @click="logout">
          <span>⇥</span>
          Logout
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <div class="breadcrumb">
            <span>HotelStay</span>
            <b>/</b>
            <strong>
              {{
                activeSection === "dashboard"
                  ? "Dashboard"
                  : activeSection === "rooms"
                    ? "Rooms"
                    : activeSection === "reservations"
                      ? "Reservations"
                      : activeSection === "guests"
                        ? "Guests"
                        : "Payments"
              }}
            </strong>
          </div>

          <h2>
            {{
              activeSection === "dashboard"
                ? "Dashboard"
                : activeSection === "rooms"
                  ? "Rooms"
                  : activeSection === "reservations"
                    ? "Reservations"
                    : activeSection === "guests"
                      ? "Guests"
                      : "Payments"
            }}
          </h2>
        </div>

        <div class="topbar-right">
          <div class="today">
            <span class="today-icon">◷</span>
            <span>
              {{
                new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              }}
            </span>
          </div>

          <div class="top-avatar">A</div>
        </div>
      </header>

      <AdminRooms
        v-if="activeSection === 'rooms'"
      />

      <AdminReservations
        v-else-if="activeSection === 'reservations'"
      />

      <AdminGuests
        v-else-if="activeSection === 'guests'"
      />

      <AdminPayments
        v-else-if="activeSection === 'payments'"
      />

      <div v-else class="dashboard-content">
        <section class="welcome-banner">
          <div class="welcome-content">
            <span class="welcome-label">ADMINISTRATOR PANEL</span>

            <h1>Welcome back, Administrator!</h1>

            <p>Here's what's happening with your hotel today.</p>
          </div>

          <div class="welcome-icon">🏨</div>
        </section>

        <section class="dashboard-section">
          <div class="section-heading centered">
            <h2>Overview</h2>
            <p>Quick summary of your hotel.</p>
          </div>

          <div v-if="loading" class="loading-box">
            Loading dashboard statistics...
          </div>

          <div v-else-if="error" class="error-box">
            <span>{{ error }}</span>

            <button @click="fetchDashboardStats">
              Try Again
            </button>
          </div>

          <div v-else class="stats-grid">
            <div class="stat-card">
              <div class="stat-top">
                <div class="stat-icon blue">🏨</div>
                <span class="stat-label">Total Rooms</span>
              </div>

              <div class="stat-value">
                {{ stats.total_rooms }}
              </div>

              <p>Registered hotel rooms</p>
            </div>

            <div class="stat-card">
              <div class="stat-top">
                <div class="stat-icon green">✓</div>
                <span class="stat-label">Available Rooms</span>
              </div>

              <div class="stat-value">
                {{ stats.available_rooms }}
              </div>

              <p>Rooms currently available</p>
            </div>

            <div class="stat-card">
              <div class="stat-top">
                <div class="stat-icon orange">▣</div>
                <span class="stat-label">Reservations</span>
              </div>

              <div class="stat-value">
                {{ stats.total_reservations }}
              </div>

              <p>Total guest reservations</p>
            </div>

            <div class="stat-card">
              <div class="stat-top">
                <div class="stat-icon emerald">₱</div>
                <span class="stat-label">Total Revenue</span>
              </div>

              <div class="stat-value revenue">
                ₱{{ formatAmount(stats.total_revenue) }}
              </div>

              <p>Paid reservation revenue</p>
            </div>
          </div>
        </section>

        <section class="dashboard-section">
          <div class="section-heading centered">
            <h2>Reservation Overview</h2>
            <p>Current reservation and payment status.</p>
          </div>

          <div class="overview-grid">
            <div class="overview-card">
              <div>
                <span>Pending</span>
                <strong>{{ stats.pending_reservations }}</strong>
              </div>
              <div class="overview-line orange"></div>
            </div>

            <div class="overview-card">
              <div>
                <span>Confirmed</span>
                <strong>{{ stats.confirmed_reservations }}</strong>
              </div>
              <div class="overview-line green"></div>
            </div>

            <div class="overview-card">
              <div>
                <span>Cancelled</span>
                <strong>{{ stats.cancelled_reservations }}</strong>
              </div>
              <div class="overview-line red"></div>
            </div>

            <div class="overview-card">
              <div>
                <span>Paid Payments</span>
                <strong>{{ stats.paid_payments }}</strong>
              </div>
              <div class="overview-line blue"></div>
            </div>
          </div>
        </section>

        <section class="dashboard-section">
          <div class="section-heading centered">
            <h2>Quick Access</h2>
            <p>Open a management section.</p>
          </div>

          <div class="quick-grid">
            <button
              class="quick-card"
              @click="goToSection('rooms')"
            >
              <div class="quick-icon blue">🏨</div>

              <div class="quick-content">
                <h3>Manage Rooms</h3>
                <p>Manage hotel rooms and availability.</p>
              </div>

              <span class="quick-arrow">→</span>
            </button>

            <button
              class="quick-card"
              @click="goToSection('reservations')"
            >
              <div class="quick-icon orange">▣</div>

              <div class="quick-content">
                <h3>Reservations</h3>
                <p>View and manage guest reservations.</p>
              </div>

              <span class="quick-arrow">→</span>
            </button>

            <button
              class="quick-card"
              @click="goToSection('guests')"
            >
              <div class="quick-icon purple">♙</div>

              <div class="quick-content">
                <h3>Guests</h3>
                <p>View registered guest accounts.</p>
              </div>

              <span class="quick-arrow">→</span>
            </button>

            <button
              class="quick-card"
              @click="goToSection('payments')"
            >
              <div class="quick-icon green">💳</div>

              <div class="quick-content">
                <h3>Payments</h3>
                <p>View reservation payment records.</p>
              </div>

              <span class="quick-arrow">→</span>
            </button>
          </div>
        </section>

        <section class="dashboard-section recent-section">
          <div class="section-heading">
            <div>
              <h2>Recent Reservations</h2>
              <p>Latest guest reservations.</p>
            </div>

            <button
              class="view-all-button"
              @click="goToSection('reservations')"
            >
              View All →
            </button>
          </div>

          <div
            v-if="reservationsLoading"
            class="table-message"
          >
            Loading recent reservations...
          </div>

          <div
            v-else-if="reservationsError"
            class="table-message error-text"
          >
            {{ reservationsError }}
          </div>

          <div
            v-else-if="recentReservations.length === 0"
            class="table-message"
          >
            No reservations found.
          </div>

          <div v-else class="table-card">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="reservation in recentReservations"
                    :key="reservation.id"
                  >
                    <td>
                      <div class="guest-cell">
                        <div class="guest-avatar">
                          {{ reservation.guest_name?.charAt(0) || "G" }}
                        </div>

                        <div>
                          <strong>
                            {{ reservation.guest_name }}
                          </strong>

                          <small>
                            Reservation #{{ reservation.id }}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>
                        Room {{ reservation.room_number }}
                      </strong>

                      <small>
                        {{ reservation.room_type }}
                      </small>
                    </td>

                    <td>
                      {{ formatDate(reservation.check_in) }}
                    </td>

                    <td>
                      {{ formatDate(reservation.check_out) }}
                    </td>

                    <td>
                      <strong class="amount">
                        ₱{{ formatAmount(reservation.total_amount) }}
                      </strong>
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
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  width: 100%;
  min-width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
}

:global(body) {
  overflow-x: hidden;
  background: #f4f7fb;
}

:global(#app) {
  max-width: none !important;
}

* {
  box-sizing: border-box;
}

.admin-layout {
  width: 100%;
  min-height: 100vh;

  background: #f4f7fb;
  color: #172033;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* SIDEBAR */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;

  width: 300px;

  display: flex;
  flex-direction: column;

  background: #111c33;
  color: #ffffff;

  z-index: 100;

  border-right: 1px solid rgba(255, 255, 255, 0.04);
}

.sidebar-brand {
  height: 90px;

  display: flex;
  align-items: center;

  gap: 16px;
  padding: 0 22px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.brand-logo {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: #2864e8;
  border-radius: 10px;

  font-size: 21px;
}
.brand-text {
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;

  gap: 5px;
}
.brand-text h1 {
  margin: 0;

  color: #ffffff;

  font-size: 22px;
  font-weight: 800;
  line-height: 1;

  letter-spacing: -0.2px;

  white-space: nowrap;
}

.brand-text span {
  display: block;

  margin: 0;

  color: #8e9ab2;

  font-size: 15px;
  font-weight: 500;
  line-height: 1;

  white-space: nowrap;
}
.sidebar-menu {
  flex: 1;

  padding: 25px 14px;

  overflow-y: auto;
}

.menu-title {
  margin: 0 0 11px;
  padding: 0 15px;

  color: #71809d;

  font-size: 20px;
  font-weight: 800;

  letter-spacing: 1.4px;
}

.menu-divider {
  height: 1px;

  margin: 20px 10px;

  background: rgba(255, 255, 255, 0.07);
}

.menu-item {
  width: 100%;
  min-height: 40px;

  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 4px;
  padding: 0 14px;

  border: none;
  border-radius: 8px;

  background: transparent;

  color: #b8c3d8;

  font-size: 18px;
  font-weight: 600;

  text-align: left;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.menu-item.active {
  background: #2864e8;
  color: #ffffff;

  box-shadow: 0 5px 14px rgba(40, 100, 232, 0.25);
}

.menu-icon {
  width: 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
}

.disabled-item {
  cursor: default;
  opacity: 0.58;
}

.disabled-item:hover {
  background: transparent;
  color: #b8c3d8;
}

.disabled-item small {
  margin-left: auto;

  padding: 3px 5px;

  border-radius: 4px;

  background: rgba(255, 255, 255, 0.06);

  color: #697792;

  font-size: 7px;
  font-weight: 700;
}

.sidebar-bottom {
  padding: 18px 14px 14px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-profile {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 5px 4px 15px;
}

.profile-avatar {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: #e6efff;
  color: #2864e8;

  border-radius: 50%;

  font-size: 12px;
  font-weight: 700;
}

.profile-info {
  min-width: 0;
}

.profile-info strong {
  display: block;

  color: #ffffff;

  font-size: 16px;
  font-weight: 700;
}

.profile-info span {
  display: block;

  margin-top: 4px;

  color: #72809a;

  font-size: 17px;
}

.sidebar-logout {
  width: 100%;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;

  background: rgba(255, 255, 255, 0.025);

  color: #b8c3d8;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;
}

.sidebar-logout:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

/* MAIN */

.main-area {
  width: calc(100% - 300px);
  min-height: 100vh;

  margin-left: 300px;

  background: #f4f7fb;
}

/* TOPBAR */

.topbar {
  width: 100%;
  height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 38px;

  background: #ffffff;

  border-bottom: 1px solid #e8edf4;
}

.topbar-left {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 5px;

  font-size: 15px;
}

.breadcrumb span {
  color: #8b96aa;
}

.breadcrumb b {
  color: #c3cbd8;
  font-weight: 400;
}

.breadcrumb strong {
  color: #8190a8;
  font-weight: 700;
  font-size: 11px;
}

.topbar h2 {
  margin: 0;

  color: #172033;

  font-size: 25px;
  font-weight: 800;
}

.topbar-right {
  display: flex;
  align-items: center;

  gap: 18px;
}

.today {
  display: flex;
  align-items: center;

  gap: 7px;

  color: #68758a;

  font-size: 17px;
  font-weight: 500;
}

.today-icon {
  color: #2864e8;
  font-size: 14px;
}

.top-avatar {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e7efff;
  color: #2864e8;

  border-radius: 50%;

  font-size: 17px;
  font-weight: 800;
}

/* DASHBOARD */

.dashboard-content {
  width: 100%;

  padding: 28px 38px 50px;
}

.welcome-banner {
  width: 100%;
  min-height: 150px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 32px 38px;

  margin-bottom: 28px;

  border-radius: 16px;

  background: linear-gradient(
    135deg,
    #2458dc 0%,
    #3279ed 100%
  );

  box-shadow:
    0 10px 24px rgba(38, 96, 224, 0.17);
}

.welcome-content {
  color: #ffffff;
}

.welcome-label {
  display: block;

  margin-bottom: 9px;

  color: rgba(255, 255, 255, 0.72);

  font-size: 17px;
  font-weight: 700;

  letter-spacing: 1.5px;
}

.welcome-content h1 {
  margin: 0 0 9px;

  color: #ffffff;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;

  letter-spacing: -0.3px;
}

.welcome-content p {
  margin: 0;

  color: rgba(255, 255, 255, 0.82);

  font-size: 15px;
  font-weight: 500;
}

.welcome-icon {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: rgba(255, 255, 255, 0.14);

  border-radius: 15px;

  font-size: 32px;
}

/* SECTIONS */

.dashboard-section {
  width: 100%;
  margin-bottom: 30px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-bottom: 15px;
}

.section-heading.centered {
  display: block;
  text-align: center;
}

.section-heading h2 {
  margin: 0 0 4px;

  color: #172033;

  font-size: 19px;
  font-weight: 800;
}

.section-heading p {
  margin: 0;

  color: #8995a8;

  font-size: 13px;
  font-weight: 500;
}

/* OVERVIEW */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;
}

.stat-card {
  min-height: 145px;

  padding: 19px 20px;

  background: #ffffff;

  border: 1px solid #e6ebf2;

  border-radius: 13px;

  box-shadow:
    0 4px 14px rgba(31, 49, 82, 0.04);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 20px rgba(31, 49, 82, 0.07);
}

.stat-top {
  display: flex;
  align-items: center;

  gap: 10px;
}

.stat-icon {
  width: 35px;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  font-size: 15px;
  font-weight: 700;
}

.stat-icon.blue {
  background: #eaf1ff;
  color: #2864e8;
}

.stat-icon.green {
  background: #e8faf1;
  color: #16a05d;
}

.stat-icon.orange {
  background: #fff3e7;
  color: #ef8c16;
}

.stat-icon.emerald {
  background: #e6f8ef;
  color: #15945a;
}

.stat-label {
  color: #78859a;

  font-size: 18px;
  font-weight: 700;
}

.stat-value {
  margin-top: 18px;

  color: #172033;

  font-size: 29px;
  font-weight: 800;
  line-height: 1;
}

.stat-value.revenue {
  font-size: 23px;
}

.stat-card p {
  margin: 9px 0 0;

  color: #9aa5b6;

  font-size: 13px;
  font-weight: 600;
}

/* RESERVATION OVERVIEW */

.overview-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;
}

.overview-card {
  min-height: 90px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 17px 20px;

  background: #ffffff;

  border: 1px solid #e6ebf2;

  border-radius: 13px;

  box-shadow:
    0 4px 14px rgba(31, 49, 82, 0.035);
}

.overview-card span {
  display: block;

  color: #8793a6;

  font-size: 18px;
  font-weight: 600;
}

.overview-card strong {
  display: block;

  margin-top: 7px;

  color: #172033;

  font-size: 24px;
  font-weight: 800;
}

.overview-line {
  width: 4px;
  height: 38px;

  border-radius: 10px;
}

.overview-line.orange {
  background: #f59e0b;
}

.overview-line.green {
  background: #16a05d;
}

.overview-line.red {
  background: #ef3038;
}

.overview-line.blue {
  background: #2864e8;
}

/* QUICK ACCESS */

.quick-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;
}

.quick-card {
  width: 100%;
  min-height: 94px;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 16px;

  border: 1px solid #e6ebf2;
  border-radius: 13px;

  background: #ffffff;

  text-align: left;

  cursor: pointer;

  box-shadow:
    0 4px 14px rgba(31, 49, 82, 0.035);

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-2px);

  border-color: #d3ddef;

  box-shadow:
    0 8px 20px rgba(31, 49, 82, 0.07);
}

.quick-icon {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 9px;

  font-size: 15px;
}

.quick-icon.blue {
  background: #eaf1ff;
  color: #2864e8;
}

.quick-icon.orange {
  background: #fff2e5;
  color: #ee8a18;
}

.quick-icon.purple {
  background: #f1eaff;
  color: #7047b9;
}

.quick-icon.green {
  background: #e7f9f0;
  color: #159b5c;
}

.quick-content {
  min-width: 0;
  flex: 1;
}

.quick-content h3 {
  margin: 0 0 4px;

  color: #172033;

  font-size: 18px;
  font-weight: 800;
}

.quick-content p {
  margin: 0;

  color: #8a96a9;

  font-size: 15px;
  font-weight: 500;

  line-height: 1.4;
}

.quick-arrow {
  color: #93a0b2;

  font-size: 20px;
}

/* RECENT RESERVATIONS */

.recent-section {
  margin-bottom: 0;
}

.view-all-button {
  padding: 7px 12px;

  border: 1px solid #dfe5ee;
  border-radius: 7px;

  background: #ffffff;

  color: #2864e8;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
}

.view-all-button:hover {
  background: #f5f8ff;
}

.table-card {
  width: 100%;

  overflow: hidden;

  background: #ffffff;

  border: 1px solid #e6ebf2;

  border-radius: 13px;

  box-shadow:
    0 4px 14px rgba(31, 49, 82, 0.035);
}

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 760px;

  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 13px 17px;

  text-align: left;

  color: #7d899c;

  font-size: 13px;
  font-weight: 800;

  border-bottom: 1px solid #e9edf3;

  text-transform: uppercase;

  letter-spacing: 0.4px;
}

td {
  padding: 14px 17px;

  color: #3c4759;

  font-size: 13px;
  font-weight: 500;

  border-bottom: 1px solid #f0f2f6;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fbfcfe;
}

td strong {
  display: block;

  color: #263247;

  font-size: 16px;
  font-weight: 750;
}

td small {
  display: block;

  margin-top: 3px;

  color: #9aa5b5;

  font-size: 13px;
  font-weight: 500;
}

.guest-cell {
  display: flex;
  align-items: center;

  gap: 9px;
}

.guest-avatar {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #eaf1ff;
  color: #2864e8;

  font-size: 15px;
  font-weight: 800;
}

.amount {
  color: #172033;
}

.status-badge {
  display: inline-flex;
  align-items: center;

  padding: 5px 9px;

  border-radius: 20px;

  font-size: 14px;
  font-weight: 800;

  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff5d9;
  color: #a46a00;
}

.status-badge.confirmed {
  background: #e7f8ee;
  color: #147a48;
}

.status-badge.cancelled {
  background: #feecee;
  color: #b4232d;
}

.status-badge.completed {
  background: #e9f1ff;
  color: #285dbd;
}

/* LOADING / ERROR */

.loading-box,
.error-box,
.table-message {
  padding: 30px;

  text-align: center;

  background: #ffffff;

  border: 1px solid #e6ebf2;

  border-radius: 12px;

  color: #7c899c;

  font-size: 12px;
  font-weight: 500;
}

.error-box {
  color: #d52f3a;
}

.error-box button {
  margin-left: 12px;

  padding: 7px 12px;

  border: none;
  border-radius: 6px;

  background: #2864e8;
  color: #ffffff;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
}

.error-text {
  color: #d52f3a;
}

/* LARGE SCREENS */

@media (min-width: 1500px) {
  .dashboard-content {
    padding-left: 48px;
    padding-right: 48px;
  }

  .topbar {
    padding-left: 48px;
    padding-right: 48px;
  }

  .welcome-banner {
    padding-left: 42px;
    padding-right: 42px;
  }

  .stats-grid,
  .overview-grid,
  .quick-grid {
    gap: 20px;
  }
}

/* MEDIUM */

@media (max-width: 1150px) {
  .dashboard-content {
    padding: 24px 25px 40px;
  }

  .topbar {
    padding: 0 25px;
  }

  .stats-grid,
  .overview-grid,
  .quick-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

/* TABLET / MOBILE */

@media (max-width: 800px) {
  .sidebar {
    position: relative;

    width: 100%;
    height: auto;
    min-height: auto;
  }

  .sidebar-brand {
    height: 70px;
  }

  .sidebar-menu {
    padding: 15px;
  }

  .sidebar-bottom {
    padding: 10px 15px 15px;
  }

  .main-area {
    width: 100%;
    margin-left: 0;
  }

  .topbar {
    height: 70px;
  }

  .dashboard-content {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .topbar {
    padding: 0 17px;
  }

  .topbar-right .today {
    display: none;
  }

  .dashboard-content {
    padding: 17px;
  }

  .welcome-banner {
    min-height: 135px;

    padding: 23px;

    margin-bottom: 21px;
  }

  .welcome-content h1 {
    font-size: 22px;
  }

  .welcome-icon {
    width: 48px;
    height: 48px;

    font-size: 25px;
  }

  .stats-grid,
  .overview-grid,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
  }
}
</style>