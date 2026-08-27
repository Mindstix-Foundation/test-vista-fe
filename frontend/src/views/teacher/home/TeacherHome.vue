<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="mb-3">
          <h5 class="fw-bolder text-uppercase m-0">Teacher Dashboard</h5>
          <p class="text-muted small mb-0 mt-1">
            Create papers anytime. Assign tests after you belong to an organization.
          </p>
        </div>
        <hr class="mb-4" />

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="registerNotice" class="alert alert-info">{{ registerNotice }}</div>
        <div v-if="loading" class="text-center text-muted py-4">Loading…</div>

        <template v-else>
          <!-- Compact org status strip -->
          <div
            v-if="pendingMembership"
            class="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
          >
            <div class="small mb-0">
              Join request pending for
              <strong>{{ pendingMembership.institution?.name }}</strong>
            </div>
            <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-dark btn-sm text-nowrap">
              View organization
            </router-link>
          </div>

          <div
            v-else-if="activeOrg"
            class="alert alert-light border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
          >
            <div class="small mb-0">
              <strong>{{ activeOrg.name }}</strong>
              <span class="text-muted">
                · {{ activeOrg.member_role }}
                <span v-if="activeOrg.org_code"> · <code>{{ activeOrg.org_code }}</code></span>
              </span>
            </div>
            <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-dark btn-sm text-nowrap">
              Manage organization
            </router-link>
          </div>

          <div
            v-else
            class="alert alert-light border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
          >
            <div class="small mb-0">
              No organization yet — needed to assign tests.
            </div>
            <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-dark btn-sm text-nowrap">
              Go to Organization
            </router-link>
          </div>

          <!-- Notifications -->
          <div v-if="notifications.length" class="alert alert-secondary small">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>You have {{ unreadCount }} unread notification(s).</span>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-dark btn-sm" :disabled="busy" @click="markAllRead">
                  Mark all read
                </button>
                <button class="btn btn-link btn-sm p-0 align-baseline" @click="loadNotifications">
                  Refresh
                </button>
              </div>
            </div>
            <ul class="mb-0 mt-2 list-unstyled">
              <li
                v-for="n in notifications.slice(0, 5)"
                :key="n.id"
                class="d-flex justify-content-between align-items-start gap-2 mb-2"
              >
                <div>
                  <strong>{{ n.title }}</strong> — {{ n.message }}
                </div>
                <button
                  class="btn btn-link btn-sm p-0 text-nowrap"
                  :disabled="busy"
                  @click="markRead(n.id)"
                >
                  Dismiss
                </button>
              </li>
            </ul>
          </div>

          <!-- Quick actions -->
          <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-building me-1" aria-hidden="true"></i>
                    Organization
                  </h6>
                  <p class="card-text small text-muted">
                    View your current org, or create / join one to assign online tests.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-file-earmark-plus me-1" aria-hidden="true"></i>
                    Create Test Paper (PDF / Offline)
                  </h6>
                  <p class="card-text small text-muted">
                    Build printable/offline papers from your teaching scope. For online assignable mocks, use Assign Online Test.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link to="/teacher/create-test-paper" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-send me-1" aria-hidden="true"></i>
                    Assign Online Test
                  </h6>
                  <p class="card-text small text-muted">
                    Assign tests to learners in your organization.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link to="/teacher/assign-test" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-clock-history me-1" aria-hidden="true"></i>
                    Previous Test Papers
                  </h6>
                  <p class="card-text small text-muted">
                    Browse and reuse papers you have already created.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link to="/teacher/previous-test-paper" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-people-fill me-1" aria-hidden="true"></i>
                    Manage Students
                  </h6>
                  <p class="card-text small text-muted">
                    View and manage students linked to your standards.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link to="/teacher/manage-iti-students" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col">
              <div class="card h-100 card-hover">
                <div class="card-body">
                  <h6 class="card-title fw-bold">
                    <i class="bi bi-person-circle me-1" aria-hidden="true"></i>
                    My Profile
                  </h6>
                  <p class="card-text small text-muted">
                    View and update your personal information and contact details.
                  </p>
                </div>
                <div class="card-footer bg-transparent border-0">
                  <router-link to="/teacher/profile" class="btn btn-outline-dark btn-sm">
                    Open
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'

interface OrgInfo {
  id: number
  name: string
  org_code?: string
  member_role?: string
}

const loading = ref(true)
const busy = ref(false)
const activeOrg = ref<OrgInfo | null>(null)
const pendingMembership = ref<any>(null)
const notifications = ref<any[]>([])
const errorMessage = ref('')
const route = useRoute()
const registerNotice = ref(
  route.query.notice === 'logout-to-register'
    ? 'You are already logged in. Log out first to create another account.'
    : '',
)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

const apiError = (e: unknown) =>
  ((e as AxiosError).response?.data as any)?.message || 'Request failed'

const loadNotifications = async () => {
  try {
    const { data } = await axiosInstance.get('/notifications/me', { params: { unread_only: true } })
    notifications.value = data || []
  } catch {
    notifications.value = []
  }
}

const markRead = async (id: number) => {
  busy.value = true
  try {
    await axiosInstance.put(`/notifications/me/${id}/read`)
    notifications.value = notifications.value.filter((n) => n.id !== id)
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const markAllRead = async () => {
  busy.value = true
  try {
    await axiosInstance.put('/notifications/me/read-all')
    notifications.value = []
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const reload = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [{ data: profile }, { data: membership }] = await Promise.all([
      axiosInstance.get('/auth/profile'),
      axiosInstance.get('/institutions/me/membership'),
    ])

    pendingMembership.value = null
    activeOrg.value = null

    if (membership?.status === 'pending') {
      pendingMembership.value = membership
    } else if (membership?.status === 'active' && membership.institution) {
      activeOrg.value = {
        ...membership.institution,
        member_role: membership.member_role,
      }
    } else {
      const institutions = profile?.institutions || []
      activeOrg.value = institutions[0] || null
    }

    await loadNotifications()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.card-hover {
  transition: box-shadow 0.3s ease;
}
.card-hover:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
