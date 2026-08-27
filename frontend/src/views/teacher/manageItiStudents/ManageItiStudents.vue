<template>
  <div class="manage-iti-students">
    <div class="container mt-4 mb-5">
      <!-- Header Section -->
      <div class="row p-2 g-2 mb-1 mt-2">
        <div class="row g-2 justify-content-center align-items-center mb-4">
          <div class="col-12 col-sm-10">
            <h5 class="text-left fw-bolder text-uppercase m-0">Manage ITI Students</h5>
            <p class="text-muted">View ITI students by your allocated standards</p>
          </div>
        </div>
        <hr />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="row justify-content-center my-5">
        <div class="col-12 text-center">
          <output class="spinner-border text-primary">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-2 text-muted">Loading your allocated standards...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="row justify-content-center my-4">
        <div class="col-12 col-sm-10">
          <div class="alert alert-danger" role="alert">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Standards Grid -->
      <div v-else class="row justify-content-center">
        <div class="col-12 col-sm-10">
          <!-- No standards message -->
          <div v-if="allocatedStandards.length === 0" class="text-center py-5">
            <i class="bi bi-mortarboard display-1 text-muted mb-3"></i>
            <h5 class="text-muted">No Standards Allocated</h5>
            <p class="text-muted">You don't have any standards allocated for ITI student management.</p>
          </div>

          <!-- Standards Cards -->
          <div v-else class="row g-4">
            <div 
              v-for="standard in allocatedStandards" 
              :key="standard.id"
              class="col-md-6 col-lg-4"
            >
              <div class="card h-100 shadow-sm standard-card" @click="viewItiStudents(standard)">
                <div class="card-body text-center p-4">
                  <div class="icon-circle bg-primary bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-people-fill text-primary"></i>
                  </div>
                  <h5 class="card-title fw-bold">{{ standard.standard.name }}</h5>
                  <p class="card-text text-muted mb-2">
                    <i class="bi bi-building"></i> {{ standard.school.name }}
                  </p>
                  <p class="card-text text-muted mb-3">
                    <i class="bi bi-award"></i> {{ standard.school.board.name }}
                  </p>
                  <div class="d-flex justify-content-center">
                    <span class="badge bg-primary">View Students</span>
                  </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'

const router = useRouter()

// Define interfaces
interface Standard {
  id: number
  name: string
  sequence_number: number
}

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface School {
  id: number
  name: string
  board: Board
}

interface AllocatedStandard {
  id: number
  standard: Standard
  school: School
  medium: {
    id: number
    name: string
  }
}

// State variables
const allocatedStandards = ref<AllocatedStandard[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/**
 * Fetch teacher's allocated standards (unique standards only, not subject-wise)
 */
const fetchAllocatedStandards = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await axiosInstance.get('/auth/profile')
    
    if (response.data && response.data.statusCode === 200) {
      const teacherData = response.data.data
      
      // Extract unique standards from teaching subjects
      if (teacherData.teaching_subjects && teacherData.teaching_subjects.length > 0) {
        const uniqueStandards = new Map()
        
        for (const ts of teacherData.teaching_subjects) {
          const standardId = ts.standard.id
          if (!uniqueStandards.has(standardId)) {
            uniqueStandards.set(standardId, {
              id: ts.id,
              standard: ts.standard,
              school: teacherData.schools[0], // Assuming teacher belongs to one school
              medium: ts.medium
            })
          }
        }
        
        allocatedStandards.value = Array.from(uniqueStandards.values())
      } else {
        allocatedStandards.value = []
      }
    } else {
      throw new Error('Failed to fetch teacher profile')
    }
  } catch (err) {
    console.error('Error fetching allocated standards:', err)
    error.value = 'Failed to load allocated standards. Please try again later.'
  } finally {
    loading.value = false
  }
}

/**
 * Navigate to ITI students list for selected standard
 */
const viewItiStudents = (standard: AllocatedStandard) => {
  router.push({
    name: 'itiStudentsList',
    params: {
      standardId: standard.standard.id,
      schoolId: standard.school.id
    },
    query: {
      standardName: standard.standard.name,
      schoolName: standard.school.name,
      boardName: standard.school.board.name
    }
  })
}

// Initialize
onMounted(() => {
  fetchAllocatedStandards()
})
</script>

<style scoped>
.manage-iti-students {
  background-color: #f8f9fa;
  min-height: calc(100vh - var(--topbar-height, 56px));
}

.standard-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.standard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card {
  border-radius: 12px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .icon-circle {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
}
</style> 