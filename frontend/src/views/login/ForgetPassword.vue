<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="card-title text-center">Forgot Password</h3>
      <p class="text-center">Enter your email address to receive a password reset link.</p>

      <div class="mb-4">
        <label for="email" class="form-label">Email address</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="email"
          placeholder="Enter email"
          :class="{ 'is-invalid': emailError }"
          required
        />
        <div class="invalid-feedback">{{ VALIDATION_MESSAGES.EMAIL.INVALID }}</div>
      </div>

      <button class="btn btn-primary w-100 mb-3" @click="handleSendResetLink" :disabled="isLoading">
        <output
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-2"
        ></output>
        Send Reset Link
      </button>
      <button class="btn btn-link text-decoration-none w-100" @click="backToLogin">
        Back to Login
      </button>

      <!-- Success/Error message -->
      <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import axiosInstance from '@/config/axios'
import { VALIDATION_MESSAGES, validateEmail } from '@/utils/validationConstants'

const router = useRouter()
const email = ref('')
const emailError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleSendResetLink = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''
  emailError.value = false

  // Validate email format
  if (!validateEmail(email.value)) {
    emailError.value = true
    errorMessage.value = VALIDATION_MESSAGES.EMAIL.INVALID
    return
  }

  try {
    isLoading.value = true
    const response = await axiosInstance.post('/auth/forgot-password', {
      email: email.value,
    })

    // Show success message
    successMessage.value = response.data.message

    // Clear the email input
    email.value = ''

    // Automatically redirect to login after 5 seconds
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 5000)
  } catch (error: unknown) {
    console.error('Reset link send error:', error)
    const apiError = error as { response?: { data?: { message?: string } } }
    errorMessage.value =
      apiError.response?.data?.message ?? 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const backToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style scoped>
body {
  background-color: #ffffff;
}

/* Centering the container */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px); /* Adjusted for navbar height */
  margin-top: 20px; /* Add some space below navbar */
}

/* Styling the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Styling form inputs */
.form-control {
  background-color: #fbfbfb;
}

.btn-link {
  text-decoration: none;
  color: #6c757d;
}

.btn-link:hover {
  color: #495057;
}

.alert {
  margin-bottom: 0;
  font-size: 0.875rem;
}
</style>
