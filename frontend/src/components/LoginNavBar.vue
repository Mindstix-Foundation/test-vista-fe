<template>
  <nav class="navbar">
    <div class="container-fluid px-4">
      <!-- Project Heading -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="brand-logo" />
      </router-link>

      <!-- Auth links -->
      <div class="navbar-nav d-flex flex-row gap-2 align-items-center">
        <router-link
          v-if="!isRegisterPage && !isLoginPage"
          to="/register"
          class="btn btn-light login-btn"
        >
          Create account
        </router-link>
        <router-link
          v-if="!isLoginPage && !isRegisterPage"
          to="/login"
          class="btn btn-outline-light login-btn"
        >
          Log In
        </router-link>
      </div>
    </div>
  </nav>
  <AppBreadcrumb />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'

const route = useRoute()

const isLoginPage = computed(() => route.path === '/login')
const isRegisterPage = computed(() => route.path === '/register')
</script>

<style scoped>
/* General Styling */
.navbar {
  background-color: black !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100px;
  padding-bottom: 10px;
}

.container-fluid {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0;
  margin-top: 50px;
}

.navbar-brand {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: flex-start;
}

.login-btn {
  white-space: nowrap;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: white;
  color: black;
  border-color: white;
}

/* Responsive Design for Small Screens */
@media (max-width: 768px) {
  .navbar {
    height: 80px;
    padding-bottom: 5px;
  }
  
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .brand-logo {
    height: 30px;
    margin-top: 40px;
  }
  
  .login-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 576px) {
  .navbar {
    height: 70px;
  }
  
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .brand-logo {
    height: 25px;
    margin-top: 35px;
  }
  
  .login-btn {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}

/* Extra small screens */
@media (max-width: 400px) {
  .login-btn {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
