<template>
  <div class="container mt-2 mt-md-4 mb-5 px-3 px-md-4">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 class="fw-bolder text-uppercase mb-1">Smart Test</h5>
            <p class="text-muted small mb-0">
              Build a balanced practice test for yourself — questions are selected automatically.
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              v-if="!context?.is_aspirant"
              class="btn btn-dark"
              @click="router.push({ name: 'createBoardSmartTest' })"
            >
              <i class="bi bi-lightning-charge-fill me-1"></i>Create Board Test
            </button>
            <button
              v-if="context?.is_aspirant || (context?.enrolled_programs?.length ?? 0) > 0"
              class="btn btn-dark"
              @click="router.push({ name: 'createAspirantSmartTest' })"
            >
              <i class="bi bi-lightning-charge-fill me-1"></i>Create Exam Test
            </button>
          </div>
        </div>
        <hr />

        <div v-if="loading" class="text-center py-5">
          <output class="spinner-border text-dark"></output>
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <template v-else>
        <div
          v-if="context?.is_aspirant"
          class="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3"
        >
          <div class="small mb-0">
            <template v-if="learnerMembership?.status === 'active'">
              Affiliated with <strong>{{ learnerMembership.institution?.name }}</strong>.
              Self-practice stays available; teacher-assigned tests appear under Exam.
            </template>
            <template v-else-if="learnerMembership?.status === 'pending'">
              Coaching join request pending for
              <strong>{{ learnerMembership.institution?.name }}</strong>.
            </template>
            <template v-else>
              Optional: join a Coaching Center to receive teacher-assigned tests. Self-practice stays available.
            </template>
          </div>
          <router-link :to="{ name: 'studentJoinCoaching' }" class="btn btn-outline-dark btn-sm text-nowrap">
            {{
              learnerMembership?.status === 'active' || learnerMembership?.status === 'pending'
                ? 'Manage / Leave'
                : 'Join coaching'
            }}
          </router-link>
        </div>

        <div v-if="!tests.length" class="text-center text-muted py-5">
          <i class="bi bi-journal-plus fs-1 d-block mb-2"></i>
          No Smart Tests yet. Create one to get started.
        </div>

        <template v-else>
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'ready' }"
                @click="activeTab = 'ready'"
              >
                Ready to Start
                <span class="badge rounded-pill ms-1" :class="activeTab === 'ready' ? 'bg-dark' : 'bg-secondary'">
                  {{ readyTests.length }}
                </span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'completed' }"
                @click="activeTab = 'completed'"
              >
                Completed
                <span class="badge rounded-pill ms-1" :class="activeTab === 'completed' ? 'bg-dark' : 'bg-secondary'">
                  {{ completedTests.length }}
                </span>
              </button>
            </li>
          </ul>

          <div v-if="!visibleTests.length" class="text-center text-muted py-5">
            <i class="bi bi-journal-x fs-1 d-block mb-2"></i>
            {{
              activeTab === 'ready'
                ? 'No tests ready to start. Create a new Smart Test.'
                : 'No completed tests yet.'
            }}
          </div>

          <div v-else class="row g-3">
            <div v-for="test in visibleTests" :key="test.assignment_id" class="col-12">
            <div class="card smart-card">
              <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h6 class="mb-1 fw-bold">{{ test.title }}</h6>
                  <p class="text-muted small mb-1">
                    <span v-if="test.subject">{{ test.subject }} · </span>
                    <span v-if="test.standard">{{ test.standard }} · </span>
                    <span v-if="test.exam_body">{{ test.exam_body }} · </span>
                    <span v-if="test.exam_program">{{ test.exam_program }} · </span>
                    {{ test.total_questions }} Q · {{ test.total_marks }} marks ·
                    {{ test.duration_minutes ?? '—' }} min
                  </p>
                  <p class="small mb-0">
                    Attempts: {{ test.attempts_used }}/{{ test.max_attempts }}
                    <span class="badge ms-2" :class="statusBadge(test)">{{ statusLabel(test) }}</span>
                  </p>
                </div>
                <div class="d-flex gap-2">
                  <button
                    v-if="test.can_start"
                    class="btn btn-dark btn-sm"
                    @click="startTest(test)"
                  >
                    {{ test.in_progress_attempt_id ? 'Continue' : 'Start' }}
                  </button>
                  <button
                    v-if="test.latest_completed_attempt_id || !test.can_start"
                    class="btn btn-outline-dark btn-sm"
                    @click="viewResult(test)"
                  >
                    View Result
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import {
  smartTestService,
  type SmartTestContext,
  type SmartTestListItem,
} from '@/services/smartTestService'

const router = useRouter()
const context = ref<SmartTestContext | null>(null)
const tests = ref<SmartTestListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const activeTab = ref<'ready' | 'completed'>('ready')
const learnerMembership = ref<any>(null)

const readyTests = computed(() => tests.value.filter((t) => t.can_start))
const completedTests = computed(() => tests.value.filter((t) => !t.can_start))
const visibleTests = computed(() =>
  activeTab.value === 'ready' ? readyTests.value : completedTests.value,
)

const statusLabel = (test: SmartTestListItem) => {
  if (test.in_progress_attempt_id) return 'In progress'
  if (test.attempts_used >= test.max_attempts) return 'Completed'
  return 'Ready'
}

const statusBadge = (test: SmartTestListItem) => {
  if (test.in_progress_attempt_id) return 'bg-warning text-dark'
  if (test.attempts_used >= test.max_attempts) return 'bg-success'
  return 'bg-secondary'
}

const startTest = (test: SmartTestListItem) => {
  const type = test.in_progress_attempt_id ? 'continue' : 'start'
  router.push(`/student/exam/instructions?test=${test.assignment_id}&type=${type}`)
}

const viewResult = (test: SmartTestListItem) => {
  if (test.latest_completed_attempt_id) {
    router.push(`/student/exam/result?attemptId=${test.latest_completed_attempt_id}`)
    return
  }
  router.push(`/student/exam/instructions?test=${test.assignment_id}&type=continue`)
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [ctx, mine, membershipRes] = await Promise.all([
      smartTestService.getContext(),
      smartTestService.listMine(),
      axiosInstance.get('/institutions/me/learner-membership').catch(() => ({ data: null })),
    ])
    context.value = ctx
    tests.value = mine
    learnerMembership.value = membershipRes.data || null
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load Smart Tests'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.smart-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
</style>
