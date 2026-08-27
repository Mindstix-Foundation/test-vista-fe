<template>
  <!-- Mobile: container-fluid with responsive padding, Desktop: container -->
  <div class="container-fluid container-md mt-4 mb-5 px-3 px-md-4">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          <div class="header-title-section">
            <h4 class="m-0 fw-bold text-dark">Assign Online Test</h4>
            <p class="text-muted mb-0 small">
              Create and assign <strong>online</strong> papers here.
              Nav “Create Test Paper (PDF / Offline)” is for printable papers only — those do not appear in this list.
            </p>
          </div>
          <!-- Desktop create button -->
          <div class="d-none d-sm-block">
            <router-link :to="createRoute" class="btn btn-primary btn-create">
              <i class="bi bi-plus-circle me-2"></i>
              {{ createLabel }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="orgGateChecked && !hasActiveOrg" class="row mb-3">
      <div class="col-12">
        <div class="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-0">
          <div>
            <strong>Organization required to assign.</strong>
            Create or join a School / Coaching Center first. You can still create papers.
          </div>
          <div class="d-flex gap-2">
            <router-link :to="{ name: 'teacherCreateOrg' }" class="btn btn-dark btn-sm">Create</router-link>
            <router-link :to="{ name: 'teacherJoinOrg' }" class="btn btn-outline-dark btn-sm">Join</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam Category Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-tabs category-tabs">
          <li v-for="tab in categoryTabs" :key="tab.value" class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeCategory === tab.value }"
              @click="setCategory(tab.value)"
            >
              {{ tab.label }}
              <span v-if="!isLoading" class="tab-count">{{ countByCategory(tab.value) }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="search-filter-card">
          <div class="row g-3">
            <!-- Search -->
            <div class="col-12 col-md-8">
              <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  class="form-control search-input" 
                  placeholder="Search by name, subject, standard, or marks..."
                  @input="searchTestPapers"
                >
                <i v-if="searchQuery" class="bi bi-x-circle clear-icon" @click="clearSearch"></i>
              </div>
            </div>
            <!-- Sort -->
            <div class="col-12 col-md-4">
              <select 
                v-model="sortOption" 
                class="form-select sort-select" 
                @change="sortTestPapers"
              >
                <option value="date-desc">Sort by Date (Newest First)</option>
                <option value="date-asc">Sort by Date (Oldest First)</option>
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="marks-asc">Sort by Marks (Low to High)</option>
                <option value="marks-desc">Sort by Marks (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Papers Section -->
    <div class="row">
      <div class="col-12">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <output class="spinner-border text-primary">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-3 text-muted">Loading test papers...</p>
        </div>

        <!-- Test Papers Grid -->
        <div v-else-if="filteredTestPapers.length > 0" class="test-papers-grid">
          <div 
            v-for="paper in filteredTestPapers" 
            :key="paper.id"
            class="test-paper-card"
          >
            <!-- Card Header -->
            <div class="card-header">
              <h5 class="card-title">
                {{ paper.name }}
              </h5>
              <div class="card-meta">
                <span class="standard-badge">{{ formatStandard(paper) }}</span>
                <span class="subject-badge">{{ formatSubject(paper) }}</span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <i class="bi bi-award text-success"></i>
                  <div class="info-content">
                    <span class="info-label">Total Marks</span>
                    <span class="info-value">{{ paperTotalMarks(paper) }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="bi bi-question-circle text-info"></i>
                  <div class="info-content">
                    <span class="info-label">Questions</span>
                    <span class="info-value">{{ paper.question_count }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="bi bi-clock text-warning"></i>
                  <div class="info-content">
                    <span class="info-label">Duration</span>
                    <span class="info-value">{{ paper.duration_minutes }}m</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="bi bi-calculator text-secondary"></i>
                  <div class="info-content">
                    <span class="info-label">Per Question</span>
                    <span class="info-value">{{ paper.marks_per_question }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="bi bi-shield-check text-danger"></i>
                  <div class="info-content">
                    <span class="info-label">Negative</span>
                    <span class="info-value">{{ paper.negative_marking ? 'Yes' : 'No' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="bi bi-translate text-primary"></i>
                  <div class="info-content">
                    <span class="info-label">Medium</span>
                    <span class="info-value">{{ formatMediums(paper).join(', ') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
              <button 
                @click="assignToStudents(paper)" 
                class="btn btn-primary btn-action"
                :disabled="!hasActiveOrg"
                :title="!hasActiveOrg ? 'Join an organization to assign' : (paper.exam_program ? 'Assign to aspirants' : 'Assign to Students')"
              >
                <i class="bi bi-person-plus"></i>
                <span class="ms-2">{{ paper.exam_program ? 'Assign Aspirants' : 'Assign Students' }}</span>
              </button>
              <button 
                @click="viewQuestions(paper)" 
                class="btn btn-outline-secondary btn-action"
                title="View Questions"
              >
                <i class="bi bi-eye"></i>
                <span class="ms-2">Questions</span>
              </button>
              <button 
                @click="viewResults(paper)" 
                class="btn btn-outline-success btn-action"
                title="View Results"
              >
                <i class="bi bi-bar-chart"></i>
                <span class="ms-2">Results</span>
              </button>
              <button 
                @click="deleteTestPaper(paper)" 
                class="btn btn-outline-danger btn-action"
                title="Delete Test Paper"
              >
                <i class="bi bi-trash"></i>
                <span class="ms-2">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <i class="bi bi-file-earmark-text empty-icon"></i>
            <h5 class="empty-title">No Test Papers Found</h5>
            <p class="empty-text">
              {{ searchQuery ? 'Try adjusting your search terms or create a new test paper.' : emptyStateText }}
            </p>
            <router-link :to="createRoute" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>
              {{ createLabel }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Create Button -->
    <div class="mobile-create-btn d-sm-none">
      <router-link :to="createRoute" class="btn btn-primary btn-create-mobile">
        <i class="bi bi-plus-circle me-2"></i>
        {{ createLabel }}
      </router-link>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete the test paper "{{ selectedPaper?.name }}"? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Students Modal -->
    <div class="modal fade" id="assignModal" tabindex="-1" aria-labelledby="assignModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignModalLabel">
              Assign Test Paper: {{ selectedPaper?.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Assignment Form -->
            <div class="row mb-4 g-3">
              <div class="col-12 col-md-6">
                <label for="dueDate" class="form-label">Due Date *</label>
                <div class="custom-date-picker">
                  <input 
                    type="text" 
                    class="form-control date-input-modern" 
                    id="dueDate" 
                    v-model="formattedDueDate"
                    placeholder="DD-MM-YYYY"
                    @click="showDueDatePicker = true"
                    @focus="showDueDatePicker = true"
                    readonly
                    required
                  >
                  <i class="bi bi-calendar3 date-icon"></i>
                  
                  <!-- Custom Date Picker Dropdown -->
                  <div v-if="showDueDatePicker" class="date-picker-dropdown">
                    <div class="date-picker-header">
                      <button @click="previousMonth('due')" class="nav-btn">&lt;</button>
                      <span class="month-year">{{ currentMonthYear('due') }}</span>
                      <button @click="nextMonth('due')" class="nav-btn">&gt;</button>
                    </div>
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                      </div>
                      <div class="dates">
                        <button 
                          v-for="date in getCalendarDates('due')" 
                          :key="date.key"
                          @click="selectDate('due', date)"
                          class="date-btn"
                          :class="{
                            'other-month': date.otherMonth,
                            'selected': date.selected,
                            'today': date.today
                          }"
                          :disabled="date.otherMonth"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                    <div class="date-picker-footer">
                      <button @click="clearDate('due')" class="btn btn-sm btn-outline-secondary">Clear</button>
                      <button @click="selectToday('due')" class="btn btn-sm btn-outline-primary">Today</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <label for="availableFrom" class="form-label">Available From *</label>
                <div class="custom-datetime-picker">
                  <input 
                    type="text" 
                    class="form-control datetime-input-modern" 
                    id="availableFrom" 
                    v-model="formattedAvailableFrom"
                    placeholder="DD-MM-YYYY HH:MM"
                    @click="showAvailablePicker = true"
                    @focus="showAvailablePicker = true"
                    readonly
                    required
                  >
                  <i class="bi bi-calendar-event date-icon"></i>
                  
                  <!-- Custom DateTime Picker Dropdown -->
                  <div v-if="showAvailablePicker" class="date-picker-dropdown datetime-dropdown">
                    <div class="date-picker-header">
                      <button @click="previousMonth('available')" class="nav-btn">&lt;</button>
                      <span class="month-year">{{ currentMonthYear('available') }}</span>
                      <button @click="nextMonth('available')" class="nav-btn">&gt;</button>
                    </div>
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                      </div>
                      <div class="dates">
                        <button 
                          v-for="date in getCalendarDates('available')" 
                          :key="date.key"
                          @click="selectDate('available', date)"
                          class="date-btn"
                          :class="{
                            'other-month': date.otherMonth,
                            'selected': date.selected,
                            'today': date.today
                          }"
                          :disabled="date.otherMonth"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                    <div class="time-picker-section">
                      <div class="time-picker-header">Select Time</div>
                      <div class="time-inputs">
                        <div class="time-input-group">
                          <input 
                            id="dashboard-available-time-hour"
                            type="number" 
                            v-model="displayHour" 
                            min="1" 
                            max="12" 
                            class="time-input"
                            placeholder="HH"
                            @input="updateDisplayTime"
                          >
                          <label for="dashboard-available-time-hour">Hour</label>
                        </div>
                        <span class="time-separator">:</span>
                        <div class="time-input-group">
                          <input 
                            id="dashboard-available-time-minute"
                            type="number" 
                            v-model="availableTime.minute" 
                            min="0" 
                            max="59" 
                            class="time-input"
                            placeholder="MM"
                            @input="updateAvailableTime"
                          >
                          <label for="dashboard-available-time-minute">Minute</label>
                        </div>
                        <div class="ampm-toggle">
                          <button 
                            @click="toggleAMPM('AM')" 
                            class="ampm-btn"
                            :class="{ active: availableTime.ampm === 'AM' }"
                          >
                            AM
                          </button>
                          <button 
                            @click="toggleAMPM('PM')" 
                            class="ampm-btn"
                            :class="{ active: availableTime.ampm === 'PM' }"
                          >
                            PM
                          </button>
                        </div>
                      </div>
                      <div class="quick-time-buttons">
                        <button @click="setQuickTime12('9:00 AM')" class="btn btn-sm btn-outline-secondary">9:00 AM</button>
                        <button @click="setQuickTime12('12:00 PM')" class="btn btn-sm btn-outline-secondary">12:00 PM</button>
                        <button @click="setQuickTime12('3:00 PM')" class="btn btn-sm btn-outline-secondary">3:00 PM</button>
                        <button @click="setQuickTime12('6:00 PM')" class="btn btn-sm btn-outline-secondary">6:00 PM</button>
                      </div>
                    </div>
                    <div class="date-picker-footer">
                      <button @click="clearDate('available')" class="btn btn-sm btn-outline-secondary">Clear</button>
                      <button @click="selectToday('available')" class="btn btn-sm btn-outline-primary">Today</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row mb-4 g-3">
              <div class="col-12 col-md-6">
                <label for="maxAttempts" class="form-label">Max Attempts</label>
                <input type="number" class="form-control" id="maxAttempts" v-model="assignmentData.maxAttempts" min="1" max="10">
              </div>
              <div class="col-12 col-md-6">
                <label for="timeLimitMinutes" class="form-label">Time Limit (Minutes)</label>
                <input type="number" class="form-control" id="timeLimitMinutes" v-model="assignmentData.timeLimitMinutes" min="1">
                <small class="form-text text-muted">Leave empty to use test paper's default time limit</small>
              </div>
            </div>

            <!-- Student Selection -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="form-label mb-0 fw-semibold">
                  Select Students 
                  <span v-if="!loadingStudents" class="text-muted small">({{ filteredStudents.length }} {{ assignedOnlyToggle ? 'assigned' : 'available' }})</span>
                </div>
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="assignedOnlyToggle" 
                    v-model="assignedOnlyToggle" 
                    @change="filterStudents"
                  >
                  <label class="form-check-label fw-semibold" for="assignedOnlyToggle">
                    {{ assignedOnlyToggle ? 'Assigned' : 'Non-Assigned' }}
                  </label>
                </div>
              </div>
              
              <div class="students-container">
                <!-- Loading -->
                <div v-if="loadingStudents" class="students-loading">
                  <output class="spinner-border spinner-border-sm text-primary">
                    <span class="visually-hidden">Loading...</span>
                  </output>
                  <p class="mt-2 mb-0 text-muted small">Loading ITI students...</p>
                </div>
                
                <!-- Students List -->
                <div v-else-if="filteredStudents.length > 0" class="students-content">
                  <div class="form-check select-all-container">
                    <input class="form-check-input" type="checkbox" id="selectAllStudents" v-model="selectAllStudents" @change="toggleAllStudents">
                    <label class="form-check-label fw-semibold" for="selectAllStudents">
                      Select All Visible Students ({{ filteredStudents.length }})
                    </label>
                  </div>
                  <hr class="my-2">
                  <div class="student-list">
                    <div v-for="student in filteredStudents" :key="student.id" class="student-item">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" :id="`student-${student.id}`" v-model="student.selected">
                        <label class="form-check-label" :for="`student-${student.id}`">
                          <div class="d-flex justify-content-between align-items-center w-100">
                            <div class="student-info">
                              <span class="student-name">{{ student.name }}</span>
                              <span class="student-roll text-muted">({{ student.rollNumber }})</span>
                            </div>
                            <div class="student-actions d-flex align-items-center gap-2">
                              <span v-if="student.isAssigned" class="badge bg-success">Assigned</span>
                              <span v-else class="badge bg-secondary">Not Assigned</span>
                              <button 
                                v-if="student.isAssigned" 
                                @click="removeAssignment(student)"
                                class="btn btn-sm btn-outline-danger"
                                :disabled="removingAssignment"
                                title="Remove Assignment"
                              >
                                <i class="bi bi-x-circle"></i>
                              </button>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div v-else class="students-empty">
                  <i class="bi bi-person-x display-6 text-muted mb-3"></i>
                  <h6 class="text-muted mb-2">
                    {{ assignedOnlyToggle ? 'No assigned students found for this test.' : 'No non-assigned students found for this test.' }}
                  </h6>
                  <p class="text-muted small mb-2">
                    <template v-if="selectedPaper?.exam_program && !selectedPaper?.pattern && !assignedOnlyToggle">
                      Org approval alone is not enough. Create/select an exam cohort, map teachers, place learners, and enroll them in the exam program.
                    </template>
                    <template v-else>
                      Students need to request enrollment and be approved by you before they can be assigned tests.
                    </template>
                  </p>
                  <router-link
                    v-if="selectedPaper?.exam_program && !selectedPaper?.pattern && !assignedOnlyToggle"
                    :to="{ name: 'teacherOrgCohorts' }"
                    class="btn btn-dark btn-sm"
                  >
                    Open Exam Cohorts
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="confirmAssignment"
              :disabled="loadingStudents || filteredStudents.length === 0 || assigningTest || !hasSelectedStudents"
            >
              <output v-if="assigningTest" class="spinner-border spinner-border-sm me-2"></output>
              <i v-else class="bi bi-person-plus me-2"></i>
              {{ assigningTest ? 'Assigning...' : 'Assign Test' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Modal -->
    <div class="modal fade" id="questionsModal" tabindex="-1" aria-labelledby="questionsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="questionsModalLabel">Test Questions</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Loading -->
            <div v-if="loadingQuestions" class="text-center my-5">
              <output class="spinner-border">
                <span class="visually-hidden">Loading...</span>
              </output>
              <p class="mt-3">Loading questions...</p>
            </div>

            <!-- Questions -->
            <div v-else-if="currentQuestions">
              <div class="test-paper-info mb-4">
                <h6 class="text-primary">{{ currentQuestions.test_paper.name }}</h6>
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">Total Questions: {{ currentQuestions.test_paper.total_questions }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Total Marks: {{ currentQuestions.test_paper.total_marks }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Duration: {{ currentQuestions.test_paper.duration_minutes }} mins</small>
                  </div>
                </div>
              </div>

              <div class="questions-container">
                <div 
                  v-for="(question, questionIndex) in getAllQuestionsFlat()" 
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-wrapper">
                    <div class="d-flex w-100">
                      <div class="question-content">
                        <div class="question-text">
                          {{ questionIndex + 1 }}. {{ question.question_text }}
                          <span v-if="question.chapter" class="chapter-badge">
                            {{ question.chapter.name }}
                          </span>
                        </div>
                        
                        <div v-if="question.mcq_options && question.mcq_options.length > 0" class="options-container">
                          <div class="options-column">
                            <div 
                              v-for="(option, optionIndex) in question.mcq_options" 
                              :key="option.id"
                              class="option-item-column"
                              :class="{ 'correct-option': option.is_correct }"
                            >
                              <div class="option-prefix">
                                <i v-if="option.is_correct" class="bi bi-check-circle-fill correct-tick"></i>
                                <span v-else class="tick-placeholder"></span>
                              </div>
                              <span class="option-label">{{ getOptionLabel(optionIndex) }})</span>
                              <span class="option-text">{{ option.option_text }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else class="text-muted">
                          <i class="bi bi-info-circle me-1"></i>
                          No options available for this question
                        </div>
                      </div>
                      
                      <div class="question-marks">
                        <div class="marks-row">
                          <span class="marks fw-bold">{{ question.marks }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr class="question-divider" />
                </div>
                
                <div v-if="getAllQuestionsFlat().length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-question-circle me-2"></i>
                  No questions available in this test paper
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { formatIsoDateDdMmYyyy, formatIsoDateTimeDdMmYyyy12h } from '@/utils/dateFormatters'

const router = useRouter()
const toastStore = useToastStore()

// Define interfaces for type safety
interface TestPaper {
  id: number
  name: string
  marks_per_question: number
  question_count: number
  duration_minutes: number
  instructions: string
  negative_marking: boolean
  negative_marks_per_question: number
  randomize_questions: boolean
  randomize_options: boolean
  is_online: boolean
  created_at: string
  // Board papers only — competitive/entrance mocks carry exam_program/paper_template instead
  pattern?: {
    id: number
    pattern_name: string
    total_marks: number
    standard: {
      id: number
      name: string
    }
    subject: {
      id: number
      name: string
    }
    sections: Array<{
      id: number
      marks_per_question: number
    }>
  } | null
  chapters: Array<{
    id: number
    name: string
  }>
  school?: {
    id: number
    name: string
  } | null
  exam_category?: string
  exam_program?: {
    id: number
    name: string
    exam_body?: string
  } | null
  exam_stage?: {
    id: number
    name: string
  } | null
  paper_template?: {
    id: number
    name: string
    total_marks: number
  } | null
  total_marks?: number
  standard_name?: string
  subject_name?: string
}

interface QuestionOption {
  id: number
  option_text: string
  is_correct: boolean
  image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
}

interface Question {
  id: number
  question_id: number
  question_text_id: number
  question_order: number
  marks: number
  is_mandatory: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_text: string
  question_image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
  chapter: {
    id: number
    name: string
  }
  topic: {
    id: number
    name: string
  }
  mcq_options: QuestionOption[]
  match_pairs: any[]
}

interface QuestionSubsection {
  id: number
  sequential_number: number
  question_type: {
    id: number
    type_name: string
  }
  questions: Question[]
}

interface QuestionSection {
  id: number
  section_name: string
  sequence_number: number
  section_number: number
  sub_section: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  subsections: QuestionSubsection[]
}

interface TestPaperQuestions {
  test_paper: {
    id: number
    name: string
    duration_minutes: number
    instructions: string
    negative_marking: boolean
    negative_marks_per_question: number
    randomize_questions: boolean
    randomize_options: boolean
    pattern: {
      id: number
      pattern_name: string
      total_marks: number
      standard: {
        id: number
        name: string
      }
      subject: {
        id: number
        name: string
      }
    }
    school: {
      id: number
      name: string
    }
    total_questions: number
    total_marks: number
  }
  sections: QuestionSection[]
}

interface Student {
  id: number
  name: string
  rollNumber: string
  selected: boolean
  isAssigned?: boolean
}

// New reactive variables for filtering and assignment management
const assignedOnlyToggle = ref(false) // boolean: false = all students, true = assigned only
const assigningTest = ref(false)
const removingAssignment = ref(false)

// Date picker reactive variables
const showDueDatePicker = ref(false)
const showAvailablePicker = ref(false)
const dueDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableTime = ref({
  hour: 9,
  minute: 0,
  ampm: 'AM' as 'AM' | 'PM'
})

// Calendar configuration
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Exam category tabs (Board = legacy school papers, Entrance/Competitive = Option C mocks)
const categoryTabs = [
  { value: 'BOARD', label: 'Board Exams' },
  { value: 'ENTRANCE', label: 'Entrance Exams' },
  { value: 'COMPETITIVE', label: 'Competitive Exams' }
]
const activeCategory = ref(localStorage.getItem('assignTestActiveCategory') || 'BOARD')
const hasActiveOrg = ref(false)
const orgGateChecked = ref(false)

const setCategory = (category: string) => {
  activeCategory.value = category
  localStorage.setItem('assignTestActiveCategory', category)
}

const paperCategory = (paper: TestPaper) => paper.exam_category || 'BOARD'
const countByCategory = (category: string) =>
  testPapers.value.filter(paper => paperCategory(paper) === category).length

const paperTotalMarks = (paper: TestPaper) =>
  paper.total_marks ?? paper.pattern?.total_marks ?? 0

const createRoute = computed(() =>
  activeCategory.value === 'BOARD'
    ? '/teacher/assign-test/create'
    : `/teacher/assign-test/create-mock?category=${activeCategory.value}`
)
const createLabel = computed(() =>
  activeCategory.value === 'BOARD' ? 'Create Online Test Paper' : 'Create Mock Test'
)
const emptyStateText = computed(() => {
  if (activeCategory.value === 'BOARD') {
    return 'Create your first online board test paper here (not from PDF / Offline Create).'
  }
  if (activeCategory.value === 'ENTRANCE') {
    return 'Create an entrance mock from a paper pattern, then assign it to enrolled aspirants.'
  }
  return 'Create a competitive mock from a paper pattern, then assign it to enrolled aspirants.'
})

const preferCategoryWithPapers = () => {
  if (countByCategory(activeCategory.value) > 0) return
  const preferred = categoryTabs.find((t) => countByCategory(t.value) > 0)
  if (preferred) {
    setCategory(preferred.value)
  }
}

// Reactive variables
const testPapers = ref<TestPaper[]>([])
const filteredTestPapers = computed(() => {
  let filtered = testPapers.value.filter(paper => paperCategory(paper) === activeCategory.value)

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(paper => 
      paper.name.toLowerCase().includes(query) ||
      formatSubject(paper).toLowerCase().includes(query) ||
      formatStandard(paper).toLowerCase().includes(query) ||
      paperTotalMarks(paper).toString().includes(query)
    )
  }

  // Apply sorting
  if (sortOption.value) {
    const [field, direction] = sortOption.value.split('-')
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'marks':
          aValue = paperTotalMarks(a)
          bValue = paperTotalMarks(b)
          break
        default:
          return 0
      }
      
      if (direction === 'asc') {
        if (aValue < bValue) return -1
        if (aValue > bValue) return 1
        return 0
      }
      if (aValue > bValue) return -1
      if (aValue < bValue) return 1
      return 0
    })
  }

  return filtered
})

const isLoading = ref(false)
const searchQuery = ref('')
const sortOption = ref('date-desc')

// Modal and assignment related variables
const selectedPaper = ref<TestPaper | null>(null)
const students = ref<Student[]>([])
const filteredStudents = computed(() => {
  // Backend already filters based on assigned_only parameter
  // So we just return all students from the API response
  return students.value
})

const loadingStudents = ref(false)
const selectAllStudents = ref(false)
const assignmentData = ref({
  dueDate: '',
  availableFrom: '',
  maxAttempts: 1,
  timeLimitMinutes: null as number | null
})

// Questions modal variables
const currentQuestions = ref<any>(null)
const loadingQuestions = ref(false)

// Computed properties
const showQuestionsModal = ref(false)

const hasSelectedStudents = computed(() => {
  return filteredStudents.value.some(student => student.selected)
})

// Date formatting computed properties
const formattedDueDate = computed({
  get: () => formatIsoDateDdMmYyyy(assignmentData.value.dueDate),
  set: (_value: string) => {
    // This will be handled by the date picker
  }
})

const formattedAvailableFrom = computed({
  get: () => formatIsoDateTimeDdMmYyyy12h(assignmentData.value.availableFrom),
  set: (_value: string) => {
    // This will be handled by the date picker
  }
})

// Display hour computed property for 12-hour format
const displayHour = computed({
  get: () => {
    let hour = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && hour !== 12) hour += 12
    if (availableTime.value.ampm === 'AM' && hour === 12) hour = 0
    
    // Convert back to 12-hour display
    const displayHour = hour % 12
    return displayHour === 0 ? 12 : displayHour
  },
  set: (value: number) => {
    // Convert 12-hour to 24-hour and update
    let hour24 = value
    if (availableTime.value.ampm === 'PM' && value !== 12) {
      hour24 = value + 12
    } else if (availableTime.value.ampm === 'AM' && value === 12) {
      hour24 = 0
    }
    availableTime.value.hour = hour24
    updateAvailableTime()
  }
})

// Toast helper functions
const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  toastStore.showToast({ title, message, type })
}

// API Methods
const fetchOnlineTestPapers = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/create-test-paper/online')
    
    if (response.data && Array.isArray(response.data)) {
      testPapers.value = response.data
      preferCategoryWithPapers()
      console.log('Fetched online test papers:', response.data)
    } else {
      console.warn('Unexpected API response format:', response.data)
      testPapers.value = []
    }
  } catch (error: any) {
    console.error('Error fetching online test papers:', error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('User not authenticated')
      // Optionally redirect to login
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data?.message)
    } else {
      console.error('Failed to fetch test papers')
    }
    
    testPapers.value = []
  } finally {
    isLoading.value = false
  }
}

// Helper functions to format data for display
const formatSubject = (paper: TestPaper) => {
  // Board: pattern subject. Competitive/entrance: exam program (backend fills subject_name).
  if (paper.pattern?.subject) {
    return paper.pattern.subject.name
  }
  return paper.subject_name || paper.exam_program?.name || paper.name
}

const formatStandard = (paper: TestPaper) => {
  // Board: pattern standard. Competitive/entrance: exam stage (backend fills standard_name).
  if (paper.pattern?.standard) {
    return paper.pattern.standard.name
  }
  return paper.standard_name || paper.exam_stage?.name || ''
}

const formatMediums = (paper: TestPaper) => {
  // This would come from the API in a real implementation
  // For now, return a default value
  return ['English'] // Placeholder
}

// Methods
const searchTestPapers = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const sortTestPapers = () => {
  // Sorting is handled by computed property
}

const assignToStudents = async (paper: TestPaper) => {
  if (!hasActiveOrg.value) {
    alert('Join or create a School / Coaching Center before assigning tests.')
    return
  }
  // Store test paper data temporarily in sessionStorage
  sessionStorage.setItem(`testPaper_${paper.id}`, JSON.stringify(paper))
  
  // Navigate to dedicated assignment page
  router.push({
    name: 'assignToStudents',
    params: { testPaperId: paper.id.toString() }
  })
}

const fetchAssignedStudentIds = async (paperId?: number): Promise<Set<number>> => {
  if (!paperId) return new Set<number>()
  try {
    const assignmentsResponse = await axiosInstance.get('/test-assignments', {
      params: { test_paper_id: paperId }
    })
    if (assignmentsResponse.data && Array.isArray(assignmentsResponse.data)) {
      return new Set(assignmentsResponse.data.map((a: any) => a.student_id))
    }
  } catch (assignmentError) {
    console.warn('Could not fetch existing assignments:', assignmentError)
  }
  return new Set<number>()
}

const applyAssignedOnlyFilter = () => {
  if (assignedOnlyToggle.value === true) {
    students.value = students.value.filter(student => student.isAssigned)
  } else if (assignedOnlyToggle.value === false) {
    students.value = students.value.filter(student => !student.isAssigned)
  }
}

const loadAspirantsForPaper = async (paper: TestPaper, assignedStudentIds: Set<number>) => {
  if (!paper.exam_program) {
    students.value = []
    return
  }
  const response = await axiosInstance.get(
    `/participants/assignable-students/${paper.exam_program.id}`
  )
  students.value = (Array.isArray(response.data) ? response.data : []).map((participant: any) => ({
    id: participant.id,
    name: participant.name,
    rollNumber: participant.registration_code,
    selected: false,
    isAssigned: assignedStudentIds.has(participant.id)
  }))
}

const loadBoardEnrolledStudents = async (paper: TestPaper, assignedStudentIds: Set<number>) => {
  const response = await axiosInstance.get('/student-subject-enrollments/teacher/enrolled-students', {
    params: {
      schoolId: paper.school!.id,
      standard_id: paper.pattern!.standard.id,
      subject_id: paper.pattern!.subject.id,
    }
  })
  const enrolled = Array.isArray(response.data) ? response.data : []
  students.value = enrolled.map((row: any) => ({
    id: row.student_id ?? row.student?.id ?? row.id,
    name: row.student_name ?? row.student?.user?.name ?? row.name ?? 'Unknown',
    rollNumber: row.student_roll_number ?? row.student?.student_id ?? row.rollNumber ?? '',
    selected: false,
    isAssigned: assignedStudentIds.has(row.student_id ?? row.student?.id ?? row.id)
  }))
}

// API method to load assignable students (school students or program aspirants)
const loadEnrolledStudents = async (paper: TestPaper) => {
  try {
    loadingStudents.value = true
    const assignedStudentIds = await fetchAssignedStudentIds(paper.id)

    if (!paper.pattern || !paper.school) {
      await loadAspirantsForPaper(paper, assignedStudentIds)
      applyAssignedOnlyFilter()
      return
    }

    await loadBoardEnrolledStudents(paper, assignedStudentIds)
    applyAssignedOnlyFilter()
    console.log('Loaded enrolled students:', students.value.length)
  } catch (error: any) {
    console.error('Error loading enrolled students:', error)
    if (error.response?.status === 401) {
      console.error('User not authenticated')
    } else {
      students.value = []
    }
  } finally {
    loadingStudents.value = false
  }
}

const viewQuestions = async (paper: TestPaper) => {
  try {
    loadingQuestions.value = true
    console.log('Fetching questions for test paper:', paper.id)
    
    const response = await axiosInstance.get(`/create-test-paper/online/${paper.id}/questions`)
    currentQuestions.value = response.data
    
    // Show the modal
    const modal = new Modal(document.getElementById('questionsModal')!)
    modal.show()
    
    console.log('Questions loaded:', response.data)
  } catch (error) {
    console.error('Error fetching questions:', error)
    showToast('Error', 'Failed to load questions. Please try again.', 'error')
  } finally {
    loadingQuestions.value = false
  }
}

const viewResults = (paper: TestPaper) => {
  // Navigate to result dashboard with test paper ID
  router.push({
    name: 'testResultDashboard',
    params: { testPaperId: paper.id.toString() }
  })
}

const closeQuestionsModal = () => {
  const modal = Modal.getInstance(document.getElementById('questionsModal')!)
  modal?.hide()
  currentQuestions.value = null
}

// New function to flatten all questions from nested structure
const getAllQuestionsFlat = () => {
  if (!currentQuestions.value || !currentQuestions.value.sections) {
    return []
  }
  
  const allQuestions: Question[] = []
  
  for (const section of currentQuestions.value.sections) {
    for (const subsection of section.subsections) {
      for (const question of subsection.questions) {
        allQuestions.push(question)
      }
    }
  }
  
  return allQuestions
}

// New function to get option label (A, B, C, D, etc.)
const getOptionLabel = (index: number) => {
  return String.fromCodePoint(65 + index) // Returns A, B, C, D, etc.
}

const deleteTestPaper = (paper: TestPaper) => {
  selectedPaper.value = paper
  const modal = new Modal(document.getElementById('deleteModal')!)
  modal.show()
}

const confirmDelete = async () => {
  if (!selectedPaper.value) return

  try {
    console.log('Deleting test paper:', selectedPaper.value.id)
    
    // Call the correct delete API endpoint for online test papers
    await axiosInstance.delete(`/create-test-paper/online/${selectedPaper.value.id}`)
    
    // Remove from local array after successful deletion
    const index = testPapers.value.findIndex(p => p.id === selectedPaper.value!.id)
    if (index > -1) {
      testPapers.value.splice(index, 1)
    }
    
    const modal = Modal.getInstance(document.getElementById('deleteModal')!)
    modal?.hide()
    selectedPaper.value = null
    
    showToast('Success', 'Test paper deleted successfully.', 'success')
  } catch (error: any) {
    console.error('Error deleting test paper:', error)
    
    let errorMessage = 'Failed to delete test paper. Please try again.'
    
    if (error.response?.status === 404) {
      errorMessage = 'Test paper not found or you do not have permission to delete it.'
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Cannot delete test paper - it may have active student attempts.'
    }
    
    showToast('Error', errorMessage, 'error')
  }
}

const toggleAllStudents = () => {
  for (const student of filteredStudents.value) {
    student.selected = selectAllStudents.value
  }
}

const confirmAssignment = async () => {
  if (filteredStudents.value.length === 0) {
    showToast('No Students Available', 'No students are available for assignment.', 'info')
    return
  }
  
  const selectedStudents = filteredStudents.value.filter(s => s.selected)
  if (selectedStudents.length === 0) {
    showToast('No Students Selected', 'Please select at least one student to assign the test.', 'info')
    return
  }
  
  if (!assignmentData.value.dueDate || !assignmentData.value.availableFrom) {
    showToast('Missing Information', 'Please fill in all required fields (Due Date and Available From).', 'warning')
    return
  }

  // Directly execute assignment without confirmation modal
  await executeAssignment(selectedStudents)
}

const executeAssignment = async (selectedStudents: Student[]) => {
  try {
    assigningTest.value = true
    
    const assignmentPayload = {
      test_paper_id: selectedPaper.value!.id,
      student_ids: selectedStudents.map(s => s.id),
      due_date: new Date(assignmentData.value.dueDate).toISOString(),
      available_from: new Date(assignmentData.value.availableFrom).toISOString(),
      max_attempts: assignmentData.value.maxAttempts,
      time_limit_minutes: assignmentData.value.timeLimitMinutes
    }
    
    console.log('Assigning test with payload:', assignmentPayload)
    
    const response = await axiosInstance.post('/test-assignments/bulk', assignmentPayload)
    
    if (response.status === 201) {
      const result = response.data
      
      // Update assignment status for successfully assigned students
      for (const student of selectedStudents) {
        student.isAssigned = true
        student.selected = false
      }
      
      // Show success message
      let message = `Test assigned successfully to ${result.assigned || selectedStudents.length} student(s)!`
      
      if (result.failed && result.failed.length > 0) {
        message += ` Failed: ${result.failed.length} students.`
      }
      
      showToast('Assignment Successful', message, 'success')
      
      console.log('Assignment completed:', result)
    }
  } catch (error: any) {
    console.error('Error assigning test:', error)
    
    let errorMessage = 'Failed to assign test. Please try again.'
    
    if (error.response?.status === 400) {
      errorMessage = 'Invalid assignment data. Please check your inputs.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Test paper or students not found.'
    }
    
    showToast('Assignment Failed', errorMessage, 'error')
  } finally {
    assigningTest.value = false
  }
  
  // Close modal and reset form
  const modal = Modal.getInstance(document.getElementById('assignModal')!)
  modal?.hide()
  
  // Reset form
  selectAllStudents.value = false
  assignmentData.value = {
    dueDate: '',
    availableFrom: '',
    maxAttempts: 1,
    timeLimitMinutes: null
  }
  selectedPaper.value = null
  assignedOnlyToggle.value = false
}

const filterStudents = async () => {
  console.log('Toggle changed to:', assignedOnlyToggle.value)
  
  // Reset select all when filter changes
  selectAllStudents.value = false
  // Clear all selections when filter changes
  for (const student of students.value) {
    student.selected = false
  }
  
  // Reload students with new filter if we have a selected paper
  if (selectedPaper.value) {
    await loadEnrolledStudents(selectedPaper.value)
  }
}

const removeAssignment = async (student: Student) => {
  if (!selectedPaper.value) return
  
  // Directly execute removal without confirmation modal
  await executeRemoveAssignment(student)
}

const executeRemoveAssignment = async (student: Student) => {
  try {
    removingAssignment.value = true
    
    const response = await axiosInstance.delete('/test-assignments', {
      data: {
        student_id: student.id,
        test_paper_id: selectedPaper.value!.id
      }
    })
    
    if (response.status === 200) {
      // Update student assignment status
      student.isAssigned = false
      student.selected = false
      
      console.log('Assignment removed successfully for student:', student.name)
      
      // Show success message
      showToast('Assignment Removed', `Test assignment removed successfully for ${student.name}.`, 'success')
    }
  } catch (error: any) {
    console.error('Error removing assignment:', error)
    
    let errorMessage = 'Failed to remove assignment. Please try again.'
    
    if (error.response?.status === 404) {
      errorMessage = 'Assignment not found.'
    } else if (error.response?.status === 400) {
      errorMessage = 'Cannot remove assignment - student may have already started the test.'
    }
    
    showToast('Remove Assignment Failed', errorMessage, 'error')
  } finally {
    removingAssignment.value = false
  }
}

// Date picker methods
const currentMonthYear = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  return `${months[picker.month]} ${picker.year}`
}

const previousMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 0) {
    picker.month = 11
    picker.year--
  } else {
    picker.month--
  }
}

const nextMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 11) {
    picker.month = 0
    picker.year++
  } else {
    picker.month++
  }
}

const getCalendarDates = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  const firstDay = new Date(picker.year, picker.month, 1)
  const today = new Date()
  let selectedDate: Date | null = null
  if (type === 'due') {
    if (assignmentData.value.dueDate) selectedDate = new Date(assignmentData.value.dueDate)
  } else if (assignmentData.value.availableFrom) {
    selectedDate = new Date(assignmentData.value.availableFrom)
  }
  
  const dates = []
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const isSelected = selectedDate && 
      currentDate.getDate() === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    
    const isToday = currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    
    dates.push({
      key: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`,
      day: currentDate.getDate(),
      date: new Date(currentDate),
      otherMonth: currentDate.getMonth() !== picker.month,
      selected: isSelected,
      today: isToday
    })
  }
  
  return dates
}

const selectDate = (type: 'due' | 'available', dateObj: any) => {
  if (dateObj.otherMonth) return
  
  const selectedDate = new Date(dateObj.date)
  
  if (type === 'due') {
    assignmentData.value.dueDate = selectedDate.toISOString().split('T')[0]
    showDueDatePicker.value = false
  } else {
    // For available from, preserve the selected time
    selectedDate.setHours(availableTime.value.hour, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = selectedDate.toISOString()
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dueDatePicker = document.querySelector('.custom-date-picker')
  const availablePicker = document.querySelector('.custom-datetime-picker')
  
  if (showDueDatePicker.value && dueDatePicker && !dueDatePicker.contains(target)) {
    showDueDatePicker.value = false
  }
  
  if (showAvailablePicker.value && availablePicker && !availablePicker.contains(target)) {
    showAvailablePicker.value = false
  }
}

const selectToday = (type: 'due' | 'available') => {
  const today = new Date()
  
  if (type === 'due') {
    assignmentData.value.dueDate = today.toISOString().split('T')[0]
    showDueDatePicker.value = false
  } else {
    // Convert 12-hour to 24-hour format
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    today.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = today.toISOString()
  }
}

const clearDate = (type: 'due' | 'available') => {
  if (type === 'due') {
    assignmentData.value.dueDate = ''
    showDueDatePicker.value = false
  } else {
    assignmentData.value.availableFrom = ''
    showAvailablePicker.value = false
  }
}

const updateAvailableTime = () => {
  if (assignmentData.value.availableFrom) {
    const date = new Date(assignmentData.value.availableFrom)
    
    // Convert 12-hour to 24-hour format for storage
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    date.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = date.toISOString()
  }
}

const setQuickTime = (timeStr: string) => {
  const [hour, minute] = timeStr.split(':').map(Number)
  availableTime.value.hour = hour
  availableTime.value.minute = minute
  updateAvailableTime()
}

// New methods for 12-hour time picker
const updateDisplayTime = () => {
  updateAvailableTime()
}

const toggleAMPM = (period: 'AM' | 'PM') => {
  availableTime.value.ampm = period
  updateAvailableTime()
}

const setQuickTime12 = (timeStr: string) => {
  // Parse time like "9:00 AM" or "3:00 PM"
  const [time, period] = timeStr.split(' ')
  const [hour, minute] = time.split(':').map(Number)
  
  // Convert to 24-hour format
  let hour24 = hour
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0
  }
  
  availableTime.value.hour = hour24
  availableTime.value.minute = minute
  availableTime.value.ampm = period as 'AM' | 'PM'
  updateAvailableTime()
}



// Lifecycle hooks
onMounted(async () => {
  try {
    const { data } = await axiosInstance.get('/institutions/me/membership')
    hasActiveOrg.value = data?.status === 'active'
  } catch {
    hasActiveOrg.value = false
  } finally {
    orgGateChecked.value = true
  }
  fetchOnlineTestPapers()
  // Add click outside listener for date pickers
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.container-fluid {
  padding-bottom: 80px; /* Space for mobile button */
}

/* ===== HEADER STYLES ===== */
.header-title-section h4 {
  color: #212529;
  font-weight: 700;
}

.header-title-section p {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.btn-create {
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
  transition: all 0.3s ease;
}

.btn-create:hover {
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

/* ===== EXAM CATEGORY TABS ===== */
.category-tabs {
  border-bottom: 2px solid #dee2e6;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.category-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-weight: 600;
  padding: 0.6rem 1.25rem;
  white-space: nowrap;
  background: transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.category-tabs .nav-link:hover {
  color: #212529;
  border-bottom-color: #adb5bd;
}

.category-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: transparent;
}

.category-tabs .tab-count {
  display: inline-block;
  min-width: 1.5rem;
  margin-left: 0.4rem;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  background: #e9ecef;
  color: #495057;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-tabs .nav-link.active .tab-count {
  background: #e7f1ff;
  color: #0d6efd;
}

/* ===== SEARCH AND FILTER STYLES ===== */
.search-filter-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 18px; /* Adjusted to work with 50px left padding */
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
}

.search-input {
  padding-left: 50px !important; /* Increased to 50px with !important to override Bootstrap */
  padding-right: 50px !important; /* Increased for consistency */
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.clear-icon {
  position: absolute;
  right: 18px; /* Adjusted to work with 50px right padding */
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 5;
  transition: color 0.3s ease;
}

.clear-icon:hover {
  color: #495057;
}

.sort-select {
  height: 48px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.sort-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* ===== LOADING STATE ===== */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* ===== TEST PAPERS GRID ===== */
.test-papers-grid {
  display: grid;
  grid-template-columns: 1fr; /* Always single column */
  gap: 1.5rem;
}

/* ===== TEST PAPER CARD ===== */
.test-paper-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.test-paper-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Card Header */
.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 1.25rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.standard-badge,
.subject-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.standard-badge {
  background: linear-gradient(135deg, #343a40 0%, #495057 100%);
  color: #ffffff;
  border: 1px solid #6c757d;
}

.subject-badge {
  background: linear-gradient(135deg, #343a40 0%, #495057 100%);
  color: #ffffff;
  border: 1px solid #6c757d;
}

/* Card Body */
.card-body {
  padding: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
}

.info-item i {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.info-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f1f3f4;
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 100px;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  border-width: 1px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-action i {
  font-size: 1rem;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.empty-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.5;
}

/* ===== MOBILE CREATE BUTTON ===== */
.mobile-create-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 1rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.btn-create-mobile {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
  transition: all 0.3s ease;
}

.btn-create-mobile:hover {
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

/* ===== MODAL STYLES ===== */
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 16px 16px 0 0;
  padding: 1.25rem 1.5rem;
}

.modal-title {
  font-weight: 600;
  color: #212529;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 16px 16px;
  padding: 1rem 1.5rem;
}

/* ===== FORM STYLES ===== */
.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* ===== STUDENTS CONTAINER ===== */
.students-container {
  min-height: 300px;
  max-height: 400px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  background: #fafafa;
}

.students-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
}

.students-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.students-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  text-align: center;
}

.select-all-container {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

.student-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.student-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.student-item:hover {
  border-color: #e9ecef;
  box-shadow: none;
}

.student-item .form-check {
  margin-bottom: 0;
}

.student-item .form-check-label {
  width: 100%;
  cursor: pointer;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.student-name {
  font-weight: 500;
  color: #212529;
}

.student-roll {
  font-size: 0.85rem;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ===== QUESTIONS DISPLAY ===== */
.test-paper-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.questions-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  max-height: 60vh;
  overflow-y: auto;
}

.question-item {
  margin-bottom: 1.5rem;
}

.question-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.chapter-badge {
  background: #6c757d;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.options-container {
  margin-top: 0.75rem;
}

.option-item-column {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.option-item-column.correct-option {
  background: #d4edda;
  color: #155724;
}

.option-prefix {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.correct-tick {
  color: #28a745;
  font-size: 0.9rem;
}

.tick-placeholder {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.option-label {
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 20px;
  color: #495057;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
  color: #212529;
  font-size: 0.9rem;
}

.question-marks {
  text-align: right;
  min-width: 60px;
}

.marks {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.question-divider {
  border-color: #e9ecef;
  margin: 1rem 0;
}

/* ===== CUSTOM DATE PICKER ===== */
.custom-date-picker,
.custom-datetime-picker {
  position: relative;
}

.date-input-modern,
.datetime-input-modern {
  cursor: pointer;
  padding-right: 40px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.date-input-modern:focus,
.datetime-input-modern:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 5;
}

.date-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  animation: fadeInDown 0.2s ease-out;
}

.datetime-dropdown {
  min-width: 320px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
  background: white;
  border-radius: 8px 8px 0 0;
}

.month-year {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  min-width: 140px;
  text-align: center;
}

.nav-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.date-picker-calendar {
  padding: 0.75rem;
  background: white;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  padding: 8px 4px;
  text-transform: uppercase;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.date-btn {
  border: none;
  background: none;
  padding: 10px 4px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-btn:not(.other-month):hover {
  background: #e3f2fd;
  color: #1976d2;
}

.date-btn.other-month {
  color: #c4c4c4;
  cursor: not-allowed;
}

.date-btn.selected {
  background: #007bff;
  color: white;
  font-weight: 600;
}

.date-btn.today {
  background: #e8f5e8;
  color: #2e7d32;
  font-weight: 600;
}

.time-picker-section {
  border-top: 1px solid #f1f3f4;
  padding: 0.75rem 1rem;
}

.time-picker-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  text-align: center;
}

.time-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-input {
  width: 60px;
  padding: 8px 4px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

.time-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.time-input-group label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
  font-weight: 500;
}

.time-separator {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
  margin: 0 0.25rem;
  align-self: flex-start;
  margin-top: 8px;
}

.ampm-toggle {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 0.5rem;
}

.ampm-btn {
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 36px;
  text-align: center;
}

.ampm-btn:hover {
  border-color: #86b7fe;
  background: #f8f9fa;
}

.ampm-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
}

.quick-time-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-time-buttons .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
}

.date-picker-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
  border-top: 1px solid #f1f3f4;
  background: white;
  border-radius: 0 0 8px 8px;
}

.date-picker-footer .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 767px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 100px; /* Increased space for mobile button */
  }

  .search-filter-card {
    padding: 1rem;
    margin-bottom: 1rem; /* Reduced margin */
  }

  .test-paper-card {
    margin-bottom: 1rem;
    border-radius: 12px; /* Slightly smaller radius */
  }

  /* Compact card header for mobile */
  .card-header {
    padding: 1rem; /* Reduced padding */
  }

  .card-title {
    font-size: 1.1rem; /* Slightly smaller */
    margin-bottom: 0.5rem; /* Reduced margin */
    line-height: 1.3;
  }

  .card-meta {
    gap: 0.4rem; /* Reduced gap */
  }

  .subject-badge,
  .standard-badge {
    padding: 0.25rem 0.65rem; /* Smaller badges for mobile */
    font-size: 0.7rem;
    border-radius: 4px; /* Smaller radius on mobile */
  }

  /* Compact card body for mobile */
  .card-body {
    padding: 1rem; /* Reduced padding */
  }

  .info-grid {
    grid-template-columns: 1fr 1fr; /* 2 columns on mobile */
    gap: 0.6rem; /* Reduced gap */
  }

  .info-item {
    padding: 0.6rem; /* Reduced padding */
    gap: 0.6rem;
  }

  .info-item i {
    font-size: 1.1rem; /* Slightly smaller icons */
  }

  .info-label {
    font-size: 0.75rem; /* Smaller label */
  }

  .info-value {
    font-size: 0.9rem; /* Smaller value */
  }

  /* Compact action buttons for mobile */
  .card-actions {
    padding: 0.8rem 1rem; /* Reduced padding */
    gap: 0.4rem; /* Reduced gap */
    flex-direction: row; /* Keep horizontal on mobile */
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: calc(50% - 0.2rem); /* 2 buttons per row */
    padding: 0.5rem 0.4rem; /* Compact padding */
    font-size: 0.85rem; /* Slightly smaller text */
    margin-bottom: 0.4rem;
  }

  .btn-action:nth-child(odd) {
    margin-right: 0.2rem;
  }

  .btn-action:nth-child(even) {
    margin-left: 0.2rem;
  }

  .btn-action:nth-last-child(-n+2) {
    margin-bottom: 0; /* Remove margin from last row */
  }

  .btn-action i {
    font-size: 0.9rem;
  }

  /* Ensure mobile create button doesn't overlap */
  .mobile-create-btn {
    padding: 0.8rem; /* Reduced padding */
  }

  .btn-create-mobile {
    padding: 0.6rem 1rem; /* Reduced padding */
  }

  /* Modal optimizations for mobile */
  .modal-dialog {
    margin: 0.5rem;
  }

  .students-container {
    max-height: 300px;
  }

  .date-picker-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 350px !important;
    z-index: 1060 !important;
    margin: 0 !important;
  }
}

@media (max-width: 575px) {
  .header-title-section h4 {
    font-size: 1.25rem;
  }

  /* Even more compact for very small screens */
  .container-fluid {
    padding-left: 0.8rem;
    padding-right: 0.8rem;
  }

  .search-filter-card {
    padding: 0.8rem;
  }

  .card-header {
    padding: 0.8rem;
  }

  .card-title {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .card-body {
    padding: 0.8rem;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr; /* Keep 2 columns */
    gap: 0.5rem;
  }

  .info-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .info-item i {
    font-size: 1rem;
  }

  .info-label {
    font-size: 0.7rem;
  }

  .info-value {
    font-size: 0.85rem;
  }

  .card-actions {
    padding: 0.6rem 0.8rem;
    gap: 0.3rem;
  }

  .btn-action {
    padding: 0.45rem 0.3rem;
    font-size: 0.8rem;
    min-width: calc(50% - 0.15rem);
  }

  .btn-action:nth-child(odd) {
    margin-right: 0.15rem;
  }

  .btn-action:nth-child(even) {
    margin-left: 0.15rem;
  }

  .search-input,
  .sort-select {
    height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .form-control {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* ===== MOBILE LANDSCAPE OPTIMIZATION ===== */
@media (max-width: 767px) and (orientation: landscape) {
  .test-paper-card {
    margin-bottom: 0.8rem;
  }

  .card-header {
    padding: 0.8rem;
  }

  .card-body {
    padding: 0.8rem;
  }

  .info-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns in landscape */
    gap: 0.5rem;
  }

  .card-actions {
    padding: 0.6rem 0.8rem;
  }

  .btn-action {
    min-width: calc(25% - 0.3rem); /* 4 buttons per row in landscape */
    padding: 0.4rem 0.2rem;
    font-size: 0.75rem;
  }

  .btn-action:not(:last-child) {
    margin-right: 0.4rem;
    margin-bottom: 0;
  }
}

/* ===== CUSTOM SCROLLBAR ===== */
.student-list::-webkit-scrollbar,
.questions-container::-webkit-scrollbar {
  width: 6px;
}

.student-list::-webkit-scrollbar-track,
.questions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb,
.questions-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb:hover,
.questions-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== ACCESSIBILITY IMPROVEMENTS ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== TOUCH DEVICE OPTIMIZATIONS ===== */
@media (hover: none) and (pointer: coarse) {
  .test-paper-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .btn-action:hover {
    box-shadow: none;
  }

  .student-item:hover {
    border-color: #e9ecef;
    box-shadow: none;
  }

  .btn-action {
    min-height: 48px;
    padding: 0.75rem;
  }
}
</style>
