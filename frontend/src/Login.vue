<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits([
  "login-success",
  "go-register"
]);

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const login = async () => {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Please enter your email and password.";
    return;
  }

  try {
    loading.value = true;

    const response = await axios.post(
      "http://localhost:4000/api/auth/login",
      {
        email: email.value,
        password: password.value
      }
    );

    // Save logged-in user for later reservation features
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    emit("login-success", response.data.user);

  } catch (err) {
    console.error("Login error:", err);

    error.value =
      err.response?.data?.message ||
      "Login failed. Please try again.";

  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">

      <div class="header">
        <h1>Hotel Reservation</h1>
        <p>Guest Login</p>
      </div>

      <form @submit.prevent="login">

        <div class="form-group">
          <label for="email">Email Address</label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button
          type="submit"
          class="login-button"
          :disabled="loading"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>

      </form>

      <div class="register-link">
        <span>Don't have an account?</span>

        <button
          type="button"
          @click="emit('go-register')"
        >
          Register
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: #f7f8fc;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e7e9ee;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.07);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0 0 7px;
  font-size: 25px;
  color: #111827;
}

.header p {
  margin: 0;
  font-size: 14px;
  color: #7b8494;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 13px;
  border: 1px solid #d9dee7;
  border-radius: 9px;
  outline: none;
  font-size: 14px;
}

.form-group input:focus {
  border-color: #2563eb;
}

.login-button {
  width: 100%;
  border: none;
  border-radius: 9px;
  padding: 13px;
  background: #2563eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.login-button:hover {
  background: #1d4ed8;
}

.login-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.error {
  margin: -5px 0 15px;
  color: #dc2626;
  font-size: 13px;
}

.register-link {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #6b7280;
}

.register-link button {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.register-link button:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .login-card {
    padding: 30px 22px;
  }
}
</style>