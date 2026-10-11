```vue
<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits(["go-login"]);

const fullName = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);

const register = async () => {
  error.value = "";
  success.value = "";

  if (!fullName.value || !email.value || !password.value) {
    error.value = "Full name, email, and password are required.";
    return;
  }

  try {
    loading.value = true;

    const response = await axios.post(
      "http://localhost:4000/api/auth/register",
      {
        full_name: fullName.value,
        email: email.value,
        phone: phone.value,
        password: password.value
      }
    );

    success.value =
      response.data.message || "Registration successful.";

    setTimeout(() => {
      emit("go-login");
    }, 1000);

  } catch (err) {
    console.error(err);

    error.value =
      err.response?.data?.message ||
      "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-page">
    <div class="register-card">

      <div class="header">
        <h1>Hotel Reservation</h1>
        <p>Create your guest account</p>
      </div>

      <form @submit.prevent="register">

        <div class="form-group">
          <label for="fullName">Full Name</label>

          <input
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="Enter your full name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>

          <input
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Create a password"
          />
        </div>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <p v-if="success" class="success">
          {{ success }}
        </p>

        <button
          type="submit"
          class="register-button"
          :disabled="loading"
        >
          {{ loading ? "Creating Account..." : "Create Account" }}
        </button>

      </form>

      <div class="login-link">
        <span>Already have an account?</span>

        <button
          type="button"
          @click="emit('go-login')"
        >
          Login
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background: #f7f8fc;
}

.register-card {
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
  margin-bottom: 18px;
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

.register-button {
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

.register-button:hover {
  background: #1d4ed8;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 5px 0 15px;

  color: #dc2626;
  font-size: 13px;
}

.success {
  margin: 5px 0 15px;

  color: #16a34a;
  font-size: 13px;
}

.login-link {
  margin-top: 25px;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 5px;

  font-size: 13px;
  color: #6b7280;
}

.login-link button {
  border: none;
  background: transparent;

  color: #2563eb;

  font-weight: 600;

  cursor: pointer;
}

.login-link button:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .register-card {
    padding: 30px 22px;
  }
}
</style>
```
