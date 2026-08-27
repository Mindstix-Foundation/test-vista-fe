<template>
  <div class="container mt-2 mt-md-4 mb-5 px-3 px-md-4">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10">
        <div class="mb-3">
          <h5 class="fw-bolder text-uppercase mb-1">My Results</h5>
          <p class="text-muted small mb-0">All your past test results — assigned tests and Smart Tests.</p>
        </div>
        <hr />

        <div v-if="loading" class="text-center py-5">
          <output class="spinner-border text-dark"></output>
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div v-else-if="!results.length" class="text-center text-muted py-5">
          <i class="bi bi-clipboard-data fs-1 d-block mb-2"></i>
          No results yet. Complete a test to see your results here.
        </div>

        <div v-else class="row g-3">
          <div v-for="result in results" :key="result.result_id" class="col-12">
            <div class="card result-card">
              <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h6 class="mb-1 fw-bold">
                    {{ result.title }}
                    <span class="badge ms-1" :class="result.source === 'SMART' ? 'bg-dark' : 'bg-secondary'">
                      {{ result.source === 'SMART' ? 'Smart Test' : 'Assigned' }}
                    </span>
                  </h6>
                  <p class="text-muted small mb-1">
                    <span v-if="result.subject">{{ result.subject }} · </span>
                    <span v-if="result.standard">{{ result.standard }} · </span>
                    Attempt {{ result.attempt_number }} ·
                    {{ formatDate(result.submitted_at) }}
                  </p>
                  <p class="small mb-0">
                    Score:
                    <strong>{{ result.obtained_marks }} / {{ result.total_marks }}</strong>
                    <span class="badge ms-2" :class="percentageBadge(result.percentage)">
                      {{ result.percentage.toFixed(1) }}%
                    </span>
                    <span class="text-muted ms-2">
                      {{ result.correct_answers }}/{{ result.total_questions }} correct
                    </span>
                  </p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" @click="viewResult(result)">
                    View Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { testAssignmentService, type StudentPastResult } from '@/services/testAssignmentService'

const router = useRouter()
const results = ref<StudentPastResult[]>([])
const loading = ref(true)
const errorMessage = ref('')

const percentageBadge = (percentage: number) => {
  if (percentage >= 75) return 'bg-success'
  if (percentage >= 40) return 'bg-warning text-dark'
  return 'bg-danger'
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const viewResult = (result: StudentPastResult) => {
  router.push(`/student/exam/result?attemptId=${result.test_attempt_id}`)
}

onMounted(async () => {
  try {
    results.value = await testAssignmentService.getStudentPastResults()
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load results'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.result-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
</style>
