<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card-header text-center">
        <img src="@/assets/Test.jpg" alt="Test Vista" class="brand-logo mb-2" />
        <h3 class="fw-bold mb-0">Welcome back</h3>
        <p class="auth-card-subtitle small mb-0">Log in with your email and password</p>
      </div>

      <div class="auth-card-body">
        <form @submit.prevent="loginWithEmail" novalidate>
          <div class="form-floating mb-2">
            <input
              type="email"
              class="form-control"
              :class="{ 'is-invalid': emailTouched && !isEmailValid }"
              id="loginEmail"
              v-model="email"
              placeholder="name@example.com"
              @blur="emailTouched = true"
              required
            />
            <label for="loginEmail">Email address</label>
            <div class="invalid-feedback" v-if="emailTouched && !isEmailValid">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-floating password-field mb-2">
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="loginPassword"
              v-model="password"
              placeholder="Password"
              required
            />
            <label for="loginPassword">Password</label>
            <span class="password-toggle" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
          </div>

          <div class="text-end mb-2">
            <router-link :to="{ name: 'forgotPassword' }" class="small text-decoration-none">
              Forgot password?
            </router-link>
          </div>

          <div v-if="errorMessage" class="alert alert-danger py-2 text-center small">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-dark btn-lg w-100" :disabled="isSubmitting">
            <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></output>
            Log In
          </button>
        </form>

        <div class="text-center mt-3">
          <router-link :to="{ name: 'browseOrgs' }" class="small text-decoration-none">
            Browse public organizations
          </router-link>
        </div>

        <div class="divider my-3"><span>New to Test Vista?</span></div>
        <router-link :to="{ name: 'register' }" class="btn btn-outline-dark w-100">
          Create an account
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'
import { validateEmail } from '@/utils/validationConstants'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')
const isSubmitting = ref(false)
const email = ref('')
const password = ref('')
const emailTouched = ref(false)
const showPassword = ref(false)

const isEmailValid = computed(() => validateEmail(email.value))

interface LoginResponse {
  statusCode: number
  message: string
  data: {
    access_token: string
    user: { id: number; email_id: string; name: string; roles: string[] }
  }
  access_token?: string
  user?: { id: number; email_id: string; name: string; roles: string[] }
}

const redirectAfterLogin = (roles: string[]) => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.push(redirect)
    return
  }
  if (roles.includes('ADMIN')) {
    router.push('/admin/board')
  } else if (roles.includes('TEACHER')) {
    router.push('/teacher/home')
  } else {
    router.push('/student/exam')
  }
}

const loginWithEmail = async () => {
  emailTouched.value = true
  errorMessage.value = ''
  if (!isEmailValid.value || !password.value) {
    errorMessage.value = 'Please enter a valid email and password'
    return
  }

  isSubmitting.value = true
  try {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', {
      email_id: email.value.trim().toLowerCase(),
      password: password.value,
    })
    const token = data.data?.access_token || data.access_token
    const user = data.data?.user || data.user
    if (!token || !user) {
      errorMessage.value = 'Login failed. Please try again.'
      return
    }
    const roles = user.roles || []
    let primary: string = 'STUDENT'
    if (roles.includes('ADMIN')) {
      primary = 'ADMIN'
    } else if (roles.includes('TEACHER')) {
      primary = 'TEACHER'
    }
    authStore.setAuth(token, primary, user.id)
    redirectAfterLogin(roles)
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string | string[] }>
    const msg = axiosErr.response?.data?.message
    errorMessage.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'Invalid email or password'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(160deg, #f7f8fa 0%, #eef1f5 100%);
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
}
.auth-card-header {
  background: #000;
  color: #fff;
  padding: 1.5rem 1.75rem 1.25rem;
}
.auth-card-subtitle {
  color: rgba(255, 255, 255, 0.7);
}
.auth-card-body {
  padding: 1.5rem 1.75rem 1.75rem;
}
.brand-logo {
  height: 56px;
  object-fit: contain;
}
.password-field {
  position: relative;
}
.password-toggle {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
  z-index: 5;
}
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
</style>
