<template>
  <div class="container mt-2 mt-md-4 mb-3 mb-md-5 px-3 px-md-4">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-1 mt-md-2">
      <div class="row g-2 justify-content-center align-items-center mb-3 mb-md-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0 mb-2 mb-md-3">Assigned Tests</h5>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="membershipPending" class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <div class="alert alert-warning mb-0">
          <div class="fw-semibold">Membership pending approval</div>
          <div class="small">
            Your school/coaching admin must accept your request before teacher-assigned tests appear here.
            You can still use self-practice and Smart Tests.
            <span v-if="pendingOrgName"> Org: <strong>{{ pendingOrgName }}</strong></span>
          </div>
          <button
            class="btn btn-outline-danger btn-sm mt-2"
            :disabled="membershipBusy"
            @click="cancelPendingMembership"
          >
            Cancel request
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="activeMembership" class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <div class="alert alert-light border mb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div class="small mb-0">
            Member of <strong>{{ activeMembership.institution?.name }}</strong>
            <span class="text-muted">({{ activeMembership.institution?.institution_type || 'org' }})</span>
          </div>
          <button
            class="btn btn-outline-danger btn-sm"
            :disabled="membershipBusy"
            @click="leaveMembership"
          >
            Leave organization
          </button>
        </div>
      </div>
    </div>

    <div v-if="notifications.length" class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <div class="alert alert-secondary small mb-0">
          <div class="d-flex justify-content-between align-items-center gap-2">
            <span>{{ notifications.length }} unread notification(s)</span>
            <button class="btn btn-outline-dark btn-sm" :disabled="membershipBusy" @click="markAllNotificationsRead">
              Mark all read
            </button>
          </div>
          <ul class="mb-0 mt-2">
            <li v-for="n in notifications.slice(0, 3)" :key="n.id">
              <strong>{{ n.title }}</strong> — {{ n.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <div class="col-12 col-sm-10">
        <!-- Filter Tabs and Auto Refresh -->
        <div class="row mb-3 mb-md-4">
          <div class="col-12">
            <div class="filter-controls mb-3">
              <div class="btn-group-container mb-2 mb-md-0">
                <div class="btn-group" aria-label="Assigned Test Filter">
                  <button 
                    type="button" 
                    class="btn btn-outline-dark btn-sm btn-md-normal"
                    :class="{ active: activeFilter === 'all' }"
                    @click="filterTests('all')"
                  >
                    All
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-dark btn-sm btn-md-normal"
                    :class="{ active: activeFilter === 'active' }"
                    @click="filterTests('active')"
                  >
                    Active
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-dark btn-sm btn-md-normal"
                    :class="{ active: activeFilter === 'upcoming' }"
                    @click="filterTests('upcoming')"
                  >
                    Upcoming
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-dark btn-sm btn-md-normal"
                    :class="{ active: activeFilter === 'completed' }"
                    @click="filterTests('completed')"
                  >
                    Completed
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-dark btn-sm btn-md-normal"
                    :class="{ active: activeFilter === 'absent' }"
                    @click="filterTests('absent')"
                  >
                    Absent
                  </button>
                </div>
              </div>
              
              <!-- Auto Refresh Button -->
              <div class="refresh-container">
                <button 
                  @click="toggleAutoRefresh" 
                  class="btn refresh-btn btn-sm btn-md-normal"
                  :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
                  :title="autoRefresh ? 'Auto-refresh ON (every 2 sec)' : 'Auto-refresh OFF'"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  <span class="d-none d-sm-inline">{{ autoRefresh ? 'Live' : 'Refresh' }}</span>
                  <output v-if="autoRefresh" class="spinner-border spinner-border-sm ms-2">
                    <span class="visually-hidden">Loading...</span>
                  </output>
                </button>
              </div>
            </div>
            
            <h6 class="mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
              <span class="mb-1 mb-sm-0">{{ getFilterTitle() }}</span>
              <span class="badge bg-secondary">
                {{ filteredTests.length }} found
              </span>
            </h6>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-4 py-md-5">
          <output class="spinner-border">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-3">Loading assigned tests...</p>
        </div>

        <!-- Assigned Test Cards -->
        <div v-else-if="filteredTests.length > 0">
          <div 
            v-for="test in filteredTests" 
            :key="test.id"
            class="card test-paper-card mb-3 mb-md-4"
          >
            <div class="card-body">
              <div class="row">
                <!-- Test Details -->
                <div class="col-12 col-md-8 mb-3 mb-md-0">
                  <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-2 mb-sm-0 me-sm-3">{{ test.title }}</h5>
                    <span 
                      class="badge align-self-start"
                      :class="getStatusBadgeClass(test.status)"
                    >
                      {{ getStatusDisplayText(test.status) }}
                    </span>
                  </div>
                  
                  <div class="row mb-3">
                    <div class="col-12 col-md-6 mb-2 mb-md-0">
                      <div class="paper-info-item">
                        <i class="bi bi-calendar text-dark me-2"></i>
                        <span class="fw-medium">
                          {{ test.status === 'upcoming' ? 'Available:' : 'Due:' }} {{ test.dueDate }}
                        </span>
                      </div>
                      <div class="paper-info-item">
                        <i class="bi bi-clock text-dark me-2"></i>
                        <span class="fw-medium">Duration: {{ test.duration }} minutes</span>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="paper-info-item">
                        <i class="bi bi-question-circle text-dark me-2"></i>
                        <span class="fw-medium">Questions: {{ test.questions }}</span>
                      </div>
                      <div class="paper-info-item">
                        <i class="bi bi-trophy text-dark me-2"></i>
                        <span class="fw-medium">Max Score: {{ test.maxScore }} points</span>
                      </div>
                    </div>
                  </div>

                  <!-- Progress Section -->
                  <div v-if="test.status === 'active' && test.progress > 0" class="mb-3">
                    <div class="progress mb-2" style="height: 8px;">
                      <progress
                        class="assigned-test-progress"
                        :value="test.progress"
                        max="100"
                      ></progress>
                    </div>
                    <p class="small text-muted mb-0">Progress: {{ test.progress }}% completed</p>
                    <p v-if="test.remainingTime && test.remainingTime !== '0:00'" class="small text-muted mb-0">
                      <i class="bi bi-clock me-1"></i>{{ formatRemainingTime(test.remainingTime) }}
                    </p>
                  </div>

                  <!-- Status Alerts -->
                  <div v-if="test.status === 'active' && test.progress === 0" class="alert alert-info py-2 mb-3">
                    <small><i class="bi bi-info-circle me-1"></i> Not started yet</small>
                  </div>
                  
                  <div v-if="test.status === 'upcoming'" class="alert alert-warning py-2 mb-3">
                    <small><i class="bi bi-clock me-1"></i> Available on {{ test.availableDate }}</small>
                  </div>

                  <div v-if="test.status === 'completed'" class="alert alert-success py-2 mb-3">
                    <small><i class="bi bi-check-circle me-1"></i> Test completed</small>
                  </div>

                  <div v-if="test.status === 'absent'" class="alert alert-danger py-2 mb-3">
                    <small><i class="bi bi-x-circle me-1"></i> Test deadline passed</small>
                  </div>
                </div>
                
                <!-- Actions Section -->
                <div class="col-12 col-md-4 d-flex flex-column justify-content-center align-items-stretch align-items-md-end">
                  <button 
                    v-if="test.status === 'active' && test.progress > 0"
                    class="btn btn-continue-test action-btn mb-2" 
                    @click="continueTest(test.id)"
                  >
                    <i class="bi bi-play-circle me-2"></i>Continue Test
                  </button>
                  
                  <button 
                    v-if="test.status === 'active' && test.progress === 0"
                    class="btn btn-start-test action-btn mb-2" 
                    @click="startTest(test.id)"
                  >
                    <i class="bi bi-play-circle me-2"></i>Start Test
                  </button>
                  
                  <button 
                    v-if="test.status === 'upcoming'"
                    class="btn btn-secondary action-btn mb-2" 
                    disabled
                  >
                    <i class="bi bi-lock me-2"></i>Not Available Yet
                  </button>

                  <button 
                    v-if="test.status === 'absent'"
                    class="btn btn-danger action-btn mb-2" 
                    disabled
                  >
                    <i class="bi bi-x-circle me-2"></i>Deadline Passed
                  </button>

                  <button 
                    v-if="test.status === 'completed' && test.test_attempt_id"
                    class="btn btn-view-result action-btn mb-2" 
                    @click="viewResult(test.test_attempt_id)"
                  >
                    <i class="bi bi-clipboard-check me-2"></i>View Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="bi bi-journal-x display-1 text-muted"></i>
          <h5 class="mt-3 text-muted">
            {{ membershipPending ? 'No teacher-assigned tests yet' : `No ${activeFilter === 'all' ? '' : activeFilter} tests found` }}
          </h5>
          <p class="text-muted">
            {{
              membershipPending
                ? 'Assigned tests will appear here after your admin approves your membership.'
                : 'Check back later for new assignments.'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Toast Notification for status messages -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
import testAssignmentService, { type StudentAssignedTest } from '@/services/testAssignmentService'
import axiosInstance from '@/config/axios'

// Define component name (for linter)
defineOptions({
  name: 'AssignedTest'
})

const router = useRouter()

// Reactive data
const activeFilter = ref('all')
const isLoading = ref(false)
const assignedTests = ref<StudentAssignedTest[]>([])
const membershipPending = ref(false)
const pendingOrgName = ref('')
const activeMembership = ref<any>(null)
const membershipBusy = ref(false)
const notifications = ref<any[]>([])

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref('success')

// Auto-refresh state
const autoRefresh = ref(true)
const refreshInterval = ref<number | null>(null)

const loadNotifications = async () => {
  try {
    const { data } = await axiosInstance.get('/notifications/me', { params: { unread_only: true } })
    notifications.value = data || []
  } catch {
    notifications.value = []
  }
}

const markAllNotificationsRead = async () => {
  membershipBusy.value = true
  try {
    await axiosInstance.put('/notifications/me/read-all')
    notifications.value = []
  } catch {
    /* ignore */
  } finally {
    membershipBusy.value = false
  }
}

const loadMembershipStatus = async () => {
  try {
    const [{ data: profile }, { data: membership }] = await Promise.all([
      axiosInstance.get('/iti-mocktest/profile'),
      axiosInstance.get('/institutions/me/learner-membership'),
    ])
    const student = profile?.data?.student
    activeMembership.value = null
    membershipPending.value = false
    pendingOrgName.value = ''

    if (membership?.status === 'pending') {
      membershipPending.value = true
      pendingOrgName.value = membership.institution?.name || student?.institution?.name || ''
    } else if (membership?.status === 'active') {
      activeMembership.value = membership
    } else {
      membershipPending.value = !!student?.membership_pending || student?.status === 'pending'
      pendingOrgName.value = student?.institution?.name || ''
    }
  } catch {
    membershipPending.value = false
    activeMembership.value = null
  }
  await loadNotifications()
}

const cancelPendingMembership = async () => {
  if (!confirm('Cancel your pending join request?')) return
  membershipBusy.value = true
  try {
    await axiosInstance.delete('/institutions/me/pending-learner-request')
    toastTitle.value = 'Cancelled'
    toastMessage.value = 'Your join request was cancelled.'
    toastType.value = 'success'
    showToast.value = true
    await loadMembershipStatus()
  } catch (e: any) {
    toastTitle.value = 'Error'
    toastMessage.value = e?.response?.data?.message || 'Cancel failed'
    toastType.value = 'error'
    showToast.value = true
  } finally {
    membershipBusy.value = false
  }
}

const leaveMembership = async () => {
  if (!confirm('Leave this organization? Teacher-assigned tests will stop; self-practice stays.')) return
  membershipBusy.value = true
  try {
    await axiosInstance.delete('/institutions/me/learner-membership')
    toastTitle.value = 'Left organization'
    toastMessage.value = 'You left the organization successfully.'
    toastType.value = 'success'
    showToast.value = true
    await loadMembershipStatus()
  } catch (e: any) {
    toastTitle.value = 'Error'
    toastMessage.value = e?.response?.data?.message || 'Leave failed'
    toastType.value = 'error'
    showToast.value = true
  } finally {
    membershipBusy.value = false
  }
}

// Computed properties
const filteredTests = computed(() => {
  if (activeFilter.value === 'all') {
    return assignedTests.value
  }
  return assignedTests.value.filter(test => test.status === activeFilter.value)
})

// Methods
const filterTests = (type: string) => {
  activeFilter.value = type
}

const getFilterTitle = () => {
  switch (activeFilter.value) {
    case 'active':
      return 'Active Tests'
    case 'upcoming':
      return 'Upcoming Tests'
    case 'completed':
      return 'Completed Tests'
    case 'absent':
      return 'Absent Tests'
    default:
      return 'All Assigned Tests'
  }
}

const fetchAssignedTests = async (showLoading = true) => {
  try {
    if (showLoading) {
      isLoading.value = true
    }
    assignedTests.value = await testAssignmentService.getStudentAssignedTests()
  } catch (error) {
    console.error('Error fetching assigned tests:', error)
    showToastMessage(
      'Error',
      'Failed to load assigned tests. Please try again.',
      'error'
    )
  } finally {
    if (showLoading) {
      isLoading.value = false
    }
  }
}

const continueTest = (testId: number) => {
  // Navigate to exam instructions page for continuing test
  router.push(`/student/exam/instructions?test=${testId}&type=continue`)
}

const startTest = (testId: number) => {
  // Navigate to exam instructions page for starting test
  router.push(`/student/exam/instructions?test=${testId}&type=start`)
}

const viewResult = (testAttemptId: number) => {
  // Navigate to view result page
  router.push(`/student/exam/result?attemptId=${testAttemptId}`)
}

const closeToast = () => {
  showToast.value = false
}

const showToastMessage = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  toastTitle.value = title
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    // Start auto-refresh every 2 seconds without showing loading state
    refreshInterval.value = setInterval(async () => {
      await fetchAssignedTests(false)
    }, 2000)
  } else if (refreshInterval.value) {
    // Stop auto-refresh
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Utility methods using the service
const getStatusBadgeClass = (status: string) => {
  return testAssignmentService.getStatusBadgeClass(status)
}

const getStatusDisplayText = (status: string) => {
  return testAssignmentService.getStatusDisplayText(status)
}

const formatRemainingTime = (remainingTime: string) => {
  return testAssignmentService.formatRemainingTime(remainingTime)
}

// Lifecycle
onMounted(() => {
  loadMembershipStatus()
  fetchAssignedTests()
  
  // Start auto-refresh by default
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(async () => {
      await fetchAssignedTests(false)
    }, 2000)
  }
})

onUnmounted(() => {
  // Clean up auto-refresh interval when component is unmounted
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})
</script>

<style scoped>
/* Test paper card styling with modern design */
.test-paper-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
  position: relative;
}

.test-paper-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
}

.test-paper-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.test-paper-card .card-body {
  padding: 1.5rem;
}

.test-paper-card .card-title {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

/* Enhanced status badges */
.badge {
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Paper info item styling with better spacing */
.paper-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
}

.paper-info-item i {
  color: #6c757d;
  font-size: 1rem;
  width: 20px;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.paper-info-item .fw-medium {
  color: #343a40;
}

/* Enhanced alert styling for different statuses */
.alert {
  border-radius: 10px;
  border: none;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 0;
}

.alert-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border-left: 4px solid #28a745;
}

.alert-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  border-left: 4px solid #ffc107;
}

.alert-danger {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.alert small {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Progress bar improvements */
.progress {
  height: 10px;
  border-radius: 10px;
  background-color: #e9ecef;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  border-radius: 10px;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  transition: width 0.6s ease;
}

.assigned-test-progress {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  appearance: none;
  -webkit-appearance: none;
}

.assigned-test-progress::-webkit-progress-bar {
  background-color: transparent;
  border-radius: 10px;
}

.assigned-test-progress::-webkit-progress-value {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  border-radius: 10px;
}

.assigned-test-progress::-moz-progress-bar {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  border-radius: 10px;
}

/* Action buttons styling */
.action-btn {
  min-width: 160px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  min-height: 44px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Enhanced filter controls layout */
.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-group-container {
  flex: 1;
}

.refresh-container {
  align-self: stretch;
}

/* Filter button styles */
.btn-outline-dark {
  color: #495057;
  border-color: #dee2e6;
  background-color: #ffffff;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 44px;
}

.btn-outline-dark:hover:not(:disabled) {
  background-color: #495057;
  color: white;
  border-color: #495057;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(73, 80, 87, 0.2);
}

.btn-outline-dark.active {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  border-color: #495057;
  color: white;
  box-shadow: 0 2px 8px rgba(73, 80, 87, 0.3);
}

/* Test button styles with gradients */
.btn-start-test {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-start-test:hover {
  background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
  color: white;
}

.btn-continue-test {
  background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
  color: white;
}

.btn-continue-test:hover {
  background: linear-gradient(135deg, #0056b3 0%, #520dc2 100%);
  color: white;
}

.btn-view-result {
  background: linear-gradient(135deg, #17a2b8 0%, #007bff 100%);
  color: white;
}

.btn-view-result:hover {
  background: linear-gradient(135deg, #138496 0%, #0056b3 100%);
  color: white;
}

/* Refresh button styling */
.refresh-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 44px;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.refresh-btn.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-color: #28a745;
}

.refresh-btn.btn-success:hover {
  background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
  border-color: #218838;
}

.refresh-btn.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.refresh-btn.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

/* Enhanced empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.empty-state i {
  color: #6c757d;
  margin-bottom: 1rem;
}

.empty-state h5 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  font-size: 0.95rem;
}

/* Header styling improvements */
h5.text-left {
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 0.5px;
}

h6 {
  color: #495057;
  font-weight: 600;
}

.badge.bg-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%) !important;
  border-radius: 15px;
  padding: 0.4rem 0.8rem;
}

/* Card status indicators */
.test-paper-card:has(.alert-success)::before {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.test-paper-card:has(.alert-info)::before {
  background: linear-gradient(135deg, #17a2b8 0%, #007bff 100%);
}

.test-paper-card:has(.alert-warning)::before {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.test-paper-card:has(.alert-danger)::before {
  background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
}

/* Enhanced responsive adjustments */
@media (min-width: 768px) {
  .filter-controls {
    flex-direction: row;
    align-items: center;
  }
  
  .btn-group-container {
    flex: 1;
  }
  
  .refresh-container {
    align-self: auto;
    margin-left: 0.75rem;
  }
  
  .btn-md-normal {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .test-paper-card .card-body {
    padding: 1.75rem;
  }
  
  .test-paper-card .card-title {
    font-size: 1.35rem;
  }
  
  .paper-info-item {
    font-size: 0.95rem;
    margin-bottom: 0.85rem;
  }
  
  .paper-info-item i {
    font-size: 1.1rem;
    width: 24px;
  }
}

@media (max-width: 767.98px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .action-btn {
    width: 100%;
    margin-bottom: 0.5rem;
    min-width: auto;
  }
  
  .paper-info-item {
    margin-bottom: 0.6rem;
  }
  
  .test-paper-card .card-body {
    padding: 1.25rem;
  }
  
  .test-paper-card .card-title {
    font-size: 1.15rem;
  }
  
  h5 {
    font-size: 1.1rem !important;
    font-weight: 600 !important;
  }
  
  h6 {
    font-size: 0.95rem !important;
  }
  
  .btn-group {
    display: flex;
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
    font-size: 0.8rem;
    padding: 0.5rem 0.25rem;
  }
  
  .refresh-btn {
    width: 100%;
    min-width: auto;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state i {
    font-size: 3rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  h5 {
    font-size: 1rem !important;
  }
  
  h6 {
    font-size: 0.9rem !important;
  }
  
  .test-paper-card .card-body {
    padding: 1rem;
  }
  
  .test-paper-card .card-title {
    font-size: 1.05rem;
  }
  
  .paper-info-item {
    font-size: 0.85rem;
  }
  
  .btn-group .btn {
    font-size: 0.75rem;
    padding: 0.4rem 0.2rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.35rem 0.7rem;
  }
  
  .alert small {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .test-paper-card .card-body {
    padding: 0.875rem;
  }
  
  .test-paper-card .card-title {
    font-size: 1rem;
  }
  
  .paper-info-item {
    font-size: 0.8rem;
  }
  
  .btn-group .btn {
    font-size: 0.7rem;
    padding: 0.35rem 0.15rem;
  }
  
  .empty-state {
    padding: 1.5rem 0.75rem;
  }
  
  .empty-state i {
    font-size: 2.5rem;
  }
  
  .empty-state h5 {
    font-size: 1rem;
  }
  
  .empty-state p {
    font-size: 0.85rem;
  }
}

/* Improved touch targets and accessibility */
@media (max-width: 768px) {
  .btn {
    touch-action: manipulation;
  }
  
  .card:hover {
    transform: none;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .test-paper-card:hover {
    transform: none;
  }
}
</style> 