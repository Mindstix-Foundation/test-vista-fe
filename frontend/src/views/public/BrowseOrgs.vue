<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bolder text-uppercase m-0">Public organizations</h5>
          <router-link :to="{ name: 'login' }" class="btn btn-outline-secondary btn-sm">
            Back to login
          </router-link>
        </div>
        <p class="text-muted small mb-4">
          Browse public Schools and Coaching Centers. To join, create an account or log in, then
          request membership (always requires admin approval).
        </p>

        <div class="row g-2 mb-3">
          <div class="col-md-8">
            <input
              v-model="search"
              class="form-control"
              placeholder="Search by name…"
              @keyup.enter="load"
            />
          </div>
          <div class="col-md-4 d-flex gap-2">
            <select v-model="typeFilter" class="form-select">
              <option value="">All types</option>
              <option value="SCHOOL">School</option>
              <option value="COACHING_CENTER">Coaching</option>
            </select>
            <button class="btn btn-dark" :disabled="loading" @click="load">Search</button>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="loading" class="text-center text-muted py-4">Loading…</div>
        <div v-else-if="!orgs.length" class="text-muted">No public organizations found.</div>
        <div v-else class="list-group">
          <div v-for="org in orgs" :key="org.id" class="list-group-item">
            <div class="fw-semibold">{{ org.name }}</div>
            <div class="small text-muted">
              {{ org.institution_type }}
              <span v-if="org.org_code"> · Code: <code>{{ org.org_code }}</code></span>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <router-link :to="{ name: 'register' }" class="btn btn-dark btn-sm">Register to join</router-link>
          <router-link :to="{ name: 'login' }" class="btn btn-outline-dark btn-sm">Log in</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axiosInstance from '@/config/axios'

const orgs = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')
const typeFilter = ref('')

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.get('/institutions/discover', {
      params: {
        ...(search.value.trim() ? { search: search.value.trim() } : {}),
        ...(typeFilter.value ? { institution_type: typeFilter.value } : {}),
      },
    })
    orgs.value = data || []
  } catch (e: any) {
    errorMessage.value = e?.response?.data?.message || 'Failed to load organizations'
    orgs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
