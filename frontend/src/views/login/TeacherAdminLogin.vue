<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="card-title text-center">Teacher/Admin Login</h3>
      <p class="text-center">Enter your email and password to continue.</p>

      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="email"
          placeholder="Enter email"
          :class="{ 'is-invalid': emailError && emailTouched }"
          @keyup.enter="focusPassword"
          @blur="emailTouched = true"
          @focus="emailTouched = true"
          required
        />
        <div class="invalid-feedback" v-show="emailError && emailTouched">{{ VALIDATION_MESSAGES.EMAIL.INVALID }}</div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <div class="password-field">
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            id="password"
            v-model="password"
            placeholder="Enter password"
            @keyup.enter="login"
            ref="passwordInput"
            required
          />
          <span class="password-toggle" @click="togglePasswordVisibility">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>
      </div>

      <button class="btn btn-primary w-100 mb-2" @click="login">Log In</button>
      <button class="btn btn-link text-decoration-none w-100" @click="forgotPassword">
        Forgot Password?
      </button>

      <!-- Error message below login -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const emailError = ref(false)
const emailTouched = ref(false)
const showPassword = ref(false)
const passwordInput = ref<HTMLInputElement | null>(null)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const focusPassword = () => {
  if (passwordInput.value) {
    passwordInput.value.focus()
  }
}

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.exec(String(email).toLowerCase())
}

interface LoginResponse {
  statusCode: number
  message: string
  data: {
    user: {
      id: number
      email_id: string
      roles: string[]
    }
    access_token: string
  }
}

const login = async () => {
  // Reset error states
  errorMessage.value = ''
  emailError.value = false
  emailTouched.value = true

  // Validate email format
  if (!validateEmail(email.value)) {
    emailError.value = true
    errorMessage.value = VALIDATION_MESSAGES.EMAIL.INVALID
    return
  }

  // Prevent global auth expired handler from redirecting during login
  ;(window as any).preventAuthExpiredRedirect = true

  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', {
      email_id: email.value,
      password: password.value,
    })

    const { data } = response.data

    // Store auth data using the auth store
    authStore.setAuth(data.access_token, data.user.roles[0], data.user.id)

    // Redirect based on role
    if (data.user.roles.includes('ADMIN')) {
      router.push('/admin/board')
    } else if (data.user.roles.includes('TEACHER')) {
      router.push('/teacher/profile')
    } else if (data.user.roles.includes('STUDENT')) {
      router.push('/student/exam')
    }
  } catch (error) {
    console.error('Login error:', error)
    if ((error as AxiosError)?.response?.status === 401) {
      errorMessage.value = 'Invalid email or password. Please try again.'
    } else {
      errorMessage.value = 'An error occurred. Please try again.'
    }
  } finally {
    // Re-enable global handler after this request completes
    ;(window as any).preventAuthExpiredRedirect = false
  }
}

const forgotPassword = () => {
  router.push({ name: 'forgotPassword' })
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
  color: #007bff;
}

.btn-link:hover {
  color: #0056b3;
}

/* Password field styling */
.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
}

.password-toggle:hover {
  color: #495057;
}

/* Error message styling */
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.invalid-feedback {
  display: block;
}
</style> 