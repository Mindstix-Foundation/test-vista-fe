<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4" style="margin-left:4px">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">previous test papers</h5>
        </div>

        <div class="col-12 col-sm-5 dynamic-style text-end">
          <!-- Reserved for action buttons -->
        </div>
      </div>
      <hr>
    </div>

    <div class="row justify-content-center align-items-center g-2 mb-4">
      <div class="col-md-10">
        <!-- Search and Sorting Controls -->
        <div class="row mb-4">
          <!-- Search Container -->
          <div class="col-12 col-md-8 mb-3">
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search by Name, Subject, Marks, Date"
                @input="searchTestPapers"
              >
              <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
            </div>
          </div>

          <!-- Sort Select -->
          <div class="col-12 col-md-4 mb-3">
            <div class="sort-field">
              <select 
                v-model="sortOption" 
                class="form-select sort-select" 
                @change="sortTestPapers"
              >
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="date-asc">Sort by Date (Oldest First)</option>
                <option value="date-desc">Sort by Date (Newest First)</option>
                <option value="marks-asc">Sort by Marks (Low to High)</option>
                <option value="marks-desc">Sort by Marks (High to Low)</option>
              </select>
              <i class="bi bi-filter sort-icon"></i>
            </div>
          </div>
        </div>

        <!-- Test Papers Cards -->
        <div id="testPaperCards">
          <!-- Loading indicator -->
          <div v-if="isLoading" class="text-center my-5">
            <output class="spinner-border">
              <span class="visually-hidden">Loading...</span>
            </output>
            <p class="mt-3">Loading test papers...</p>
          </div>

          <!-- Display filtered test papers -->
          <div 
            v-else-if="filteredTestPapers.length > 0"
            v-for="(paper, index) in filteredTestPapers" 
            :key="paper.id"
            class="mb-4"
          >
            <div class="card test-paper-card shadow-sm">
              <div class="card-body">
                <div class="row">
                  <!-- Paper Details -->
                  <div class="col-md-8">
                    <h5 class="card-title mb-3">
                      {{ paper.name }}
                    </h5>
                    
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-book text-dark me-2"></i>
                          <span class="fw-medium">Pattern: {{ paper.pattern?.pattern_name || 'N/A' }}</span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-building text-dark me-2"></i>
                          <span class="fw-medium">School: {{ paper.school?.name || 'N/A' }}</span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-award text-dark me-2"></i>
                          <span class="fw-medium">Total Marks: {{ paper.pattern?.total_marks || 'N/A' }}</span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-clock text-dark me-2"></i>
                          <span class="fw-medium">Exam Time: {{ formatExamTime(paper.exam_time) }}</span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-calendar text-dark me-2"></i>
                          <span class="fw-medium">Created: {{ formatDate(paper.created_at) }}</span>
                        </div>
                        <div class="paper-info-item" v-if="getAvailableMediums(paper).length > 0">
                          <i class="bi bi-translate text-dark me-2"></i>
                          <span class="fw-medium">Available in: 
                            <span v-for="(medium, idx) in getAvailableMediums(paper)" :key="idx" 
                                  class="medium-badge">{{ medium }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Actions Section -->
                  <div class="col-md-4 d-flex flex-column justify-content-center align-items-md-end">
                    <button 
                      @click="viewPDF(getPDFUrl(paper), paper)" 
                      class="btn btn-outline-dark action-btn" 
                      :disabled="!hasPDF(paper)"
                    >
                      <i class="bi bi-file-earmark-pdf me-2"></i>View PDF
                    </button>
                  </div>
                </div>
                
                <!-- View Details Link -->
                <div class="view-details-row">
                  <a 
                    href="#" 
                    class="view-chapters-link" 
                    @click.prevent="toggleChaptersView(index)"
                  >
                    <i class="bi bi-list-check me-2"></i>
                    View Chapters Details
                    <i 
                      class="bi" 
                      :class="expandedPapers.includes(index) ? 'bi-chevron-up' : 'bi-chevron-down'"
                    ></i>
                  </a>
                  <button 
                    class="btn btn-outline-danger ms-auto delete-btn" 
                    @click="confirmDeleteTestPaper(paper)"
                    :disabled="isDeleting"
                  >
                    <output v-if="isDeleting && deletingPaperId === paper.id" class="spinner-border spinner-border-sm me-2"></output>
                    <i v-else class="bi bi-trash me-1"></i> 
                    {{ isDeleting && deletingPaperId === paper.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
                
                <!-- Expandable Chapters Section -->
                <div v-if="expandedPapers.includes(index)" class="chapters-expanded-section mt-3">
                  <div class="row">
                    <div class="col-12">
                      <h6 class="mb-3"><i class="bi bi-list-check text-dark me-2"></i>Chapters and Marks:</h6>
                    </div>
                  </div>
                  
                  <div class="table-responsive">
                    <table class="table table-hover chapter-table">
                     
                      <thead class="table-light">
                        <tr>
                          <th scope="col">Chapter Name</th>
                          <th scope="col" class="text-center">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="chapter in paper.test_paper_chapters" :key="chapter.id">
                          <td>{{ chapter.chapter?.name || 'Unknown Chapter' }}</td>
                          <td class="text-center">{{ chapter.weightage }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-else-if="!isLoading && filteredTestPapers.length === 0" class="text-center mt-4">
            <div class="empty-state">
              <i class="bi bi-file-earmark-x display-1 text-muted"></i>
              <p class="mt-3 text-muted">No test papers found. Try adjusting your search.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" id="deleteConfirmationModalLabel">
              <i class="bi bi-exclamation-triangle text-warning me-2"></i>
              Confirm Delete
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-2">
            <p class="mb-3">Are you sure you want to delete this test paper?</p>
            
            <div v-if="paperToDelete" class="alert alert-light border">
              <div class="row">
                <div class="col-12">
                  <h6 class="fw-bold mb-2">{{ paperToDelete.name }}</h6>
                  <div class="small text-muted">
                    <div><strong>Pattern:</strong> {{ paperToDelete.pattern?.pattern_name || 'N/A' }}</div>
                    <div><strong>School:</strong> {{ paperToDelete.school?.name || 'N/A' }}</div>
                    <div><strong>Total Marks:</strong> {{ paperToDelete.pattern?.total_marks || 'N/A' }}</div>
                    <div><strong>Created:</strong> {{ formatDate(paperToDelete.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>This action cannot be undone.</strong>
            </div>

            <div class="mb-3">
              <p class="mb-2">Type <strong class="text-danger">DELETE</strong> in the box below to confirm:</p>
              <input 
                type="text" 
                v-model="deleteConfirmationText" 
                class="form-control" 
                placeholder="DELETE"
                @input="validateDeleteConfirmation"
                :class="{ 'is-invalid': deleteConfirmationText && !isDeleteConfirmationValid, 'is-valid': isDeleteConfirmationValid }"
              >
              <div v-if="deleteConfirmationText && !isDeleteConfirmationValid" class="invalid-feedback">
                Please type "DELETE" exactly as shown above
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteTestPaper"
              :disabled="isDeleting || !isDeleteConfirmationValid"
            >
              <output v-if="isDeleting" class="spinner-border spinner-border-sm me-2"></output>
              <i v-else class="bi bi-trash me-2"></i>
              {{ isDeleting ? 'Deleting...' : 'Delete Test Paper' }}
            </button>
          </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ToastNotification from '@/components/common/ToastNotification.vue';
import axiosInstance from '@/config/axios';
import { Modal, Tooltip } from 'bootstrap';

// Define component name
defineOptions({
  name: 'PreviousTestPaperDashboard'
});

// Initialize router
const router = useRouter();

// Toast notification state
const showToast = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastType = ref('');

// Search and sort state
const searchQuery = ref('');
const sortOption = ref('date-desc'); // Default sort: newest first

// Loading state
const isLoading = ref(false);

// Delete state
const isDeleting = ref(false);
const deletingPaperId = ref(null);
const paperToDelete = ref(null);

// Delete confirmation text input
const deleteConfirmationText = ref('');
const isDeleteConfirmationValid = ref(false);

// Test papers data - will be populated from API
const testPapers = ref([]);

// Track expanded paper cards
const expandedPapers = ref([]);

// Modal instance
let deleteModal = null;

// Toggle chapter view for a paper
const toggleChaptersView = (index) => {
  const currentIndex = expandedPapers.value.indexOf(index);
  if (currentIndex === -1) {
    expandedPapers.value.push(index);
  } else {
    expandedPapers.value.splice(currentIndex, 1);
  }
};

// Filter test papers by search query
const filterBySearchQuery = (papers, query) => {
  if (!query.trim()) return papers;
  
  const lowercaseQuery = query.toLowerCase();
  return papers.filter(paper => 
    (paper.name?.toLowerCase().includes(lowercaseQuery) || false) ||
    (paper.pattern?.pattern_name?.toLowerCase().includes(lowercaseQuery) || false) ||
    (paper.school?.name?.toLowerCase().includes(lowercaseQuery) || false) ||
    (paper.test_paper_chapters?.some(chapter => 
      chapter.chapter?.name?.toLowerCase().includes(lowercaseQuery)
    ) || false) ||
    (paper.created_at?.includes(lowercaseQuery) || false)
  );
};

// Filter and sort test papers
const filteredTestPapers = computed(() => {
  let result = [...testPapers.value];
  
  // Apply search filter if query exists
  result = filterBySearchQuery(result, searchQuery.value);
  
  // Apply sorting
  result.sort((a, b) => {
    switch (sortOption.value) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'date-asc':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case 'date-desc':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'marks-asc':
        return (a.pattern?.total_marks || 0) - (b.pattern?.total_marks || 0);
      case 'marks-desc':
        return (b.pattern?.total_marks || 0) - (a.pattern?.total_marks || 0);
      default:
        return 0;
    }
  });
  
  return result;
});

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
};

// Format date to readable format
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

// Format exam time to readable format
const formatExamTime = (examTimeString: string) => {
  if (!examTimeString) return 'N/A';
  
  try {
    const examTime = new Date(examTimeString);
    // Check if the date is valid
    if (Number.isNaN(examTime.getTime())) return 'N/A';
    
    // Simple way to format the hours and minutes
    const hours = examTime.getHours();
    const minutes = examTime.getMinutes();
    
    // If both hours and minutes are available
    if (hours > 0 && minutes > 0) {
      return `${hours} Hour${hours === 1 ? '' : 's'} ${minutes} Minute${minutes === 1 ? '' : 's'}`;
    } 
    // If only hours are available
    else if (hours > 0) {
      return `${hours} Hour${hours === 1 ? '' : 's'}`;
    } 
    // If only minutes are available
    else if (minutes > 0) {
      return `${minutes} Minute${minutes === 1 ? '' : 's'}`;
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting exam time:', error);
    return 'N/A';
  }
};

// Check if test paper has PDF
const hasPDF = (paper) => {
  return paper.html_files && 
         paper.html_files.length > 0 && 
         paper.html_files[0].presigned_url;
};

// Get PDF URL for a test paper
const getPDFUrl = (paper) => {
  if (hasPDF(paper)) {
    // Get the default medium PDF or first available
    const defaultMedium = paper.html_files.find(file => file.is_default_medium) || paper.html_files[0];
    return defaultMedium.presigned_url;
  }
  return null;
};

// Get available mediums for a test paper
const getAvailableMediums = (paper) => {
  if (!paper.html_files || paper.html_files.length === 0) return [];
  
  return paper.html_files.map(file => getMediumName(file));
};

// Get medium name from file
const getMediumName = (file) => {
  return file.instruction_medium?.instruction_medium || 'Unknown';
};

// Switch between different medium PDFs
const switchMedium = (pdfUrl) => {
  currentPdfUrl.value = pdfUrl;
};

// Open PDF Viewer page instead of modal
const viewPDF = (pdfUrl, paper) => {
  if (!hasPDF(paper)) {
    showErrorToast('Error', 'No PDF available for this test paper.');
    return;
  }
  
  // Navigate to the PDF viewer page with the paper ID
  router.push(`/teacher/test-paper-pdf/${paper.id}`);
};

// Show delete confirmation modal
const confirmDeleteTestPaper = (paper) => {
  paperToDelete.value = paper;
  deleteConfirmationText.value = ''; // Clear previous input
  isDeleteConfirmationValid.value = false; // Reset validation
  
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteConfirmationModal'));
  }
  
  deleteModal.show();
};

// Validate delete confirmation text
const validateDeleteConfirmation = () => {
  isDeleteConfirmationValid.value = deleteConfirmationText.value.toLowerCase() === 'delete';
};

// Delete test paper
const deleteTestPaper = async () => {
  if (!paperToDelete.value) return;
  
  if (!isDeleteConfirmationValid.value) {
    showErrorToast('Validation Error', 'Please type "DELETE" exactly as shown above to confirm deletion.');
    return;
  }

  try {
    isDeleting.value = true;
    deletingPaperId.value = paperToDelete.value.id;
    
    const response = await axiosInstance.delete(`/test-paper-html/${paperToDelete.value.id}`);
    
    if (response.status === 200) {
      // Remove the deleted paper from the list
      testPapers.value = testPapers.value.filter(paper => paper.id !== paperToDelete.value.id);
      
      // Show success message
      const deletedCount = response.data.deleted_files_count || 0;
      const chaptersCount = response.data.deleted_chapters_count || 0;
      
      showSuccessToast(
        'Test Paper Deleted', 
        `Test paper "${paperToDelete.value.name}" has been successfully deleted. ${deletedCount} file(s) and ${chaptersCount} chapter(s) removed.`
      );
      
      // Hide modal
      deleteModal.hide();
      
      // Reset state
      paperToDelete.value = null;
    }
  } catch (error) {
    console.error('Error deleting test paper:', error);
    
    let errorMessage = 'Failed to delete test paper. Please try again.';
    
    if (error.response?.status === 404) {
      errorMessage = 'Test paper not found. It may have already been deleted.';
      // Remove from local list if it's a 404
      testPapers.value = testPapers.value.filter(paper => paper.id !== paperToDelete.value.id);
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showErrorToast('Delete Failed', errorMessage);
  } finally {
    isDeleting.value = false;
    deletingPaperId.value = null;
  }
};

// Search test papers (debounced in real implementation)
const searchTestPapers = () => {
  // The computed property handles filtering
};

// Sort test papers
const sortTestPapers = () => {
  // The computed property handles sorting
};

// Toast notification methods
const showErrorToast = (title: string, message: string) => {
  toastTitle.value = title;
  toastMessage.value = message;
  toastType.value = 'danger';
  showToast.value = true;
};

const showSuccessToast = (title: string, message: string) => {
  toastTitle.value = title;
  toastMessage.value = message;
  toastType.value = 'success';
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};

// Fetch test papers from API
const fetchTestPapers = async () => {
  try {
    isLoading.value = true;
    
    // Get the current user's profile to get userId and schoolId
    const profileResponse = await axiosInstance.get('/auth/profile');
    let userId, schoolId;
    
    userId = profileResponse.data?.data?.id;
    
    // Get schoolId if available
    schoolId = profileResponse.data?.data?.schools?.[0]?.id;
    
    // Build the query params
    let endpoint = '/test-paper-html';
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('userId', userId.toString());
    }
    
    if (schoolId) {
      params.append('schoolId', schoolId.toString());
    }
    
    // Append params if they exist
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    // Make the API call
    const response = await axiosInstance.get(endpoint);
    
    if (response.data) {
      testPapers.value = response.data;
      console.log('Test papers loaded:', testPapers.value.length);
    } else {
      testPapers.value = [];
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching test papers:', error);
    showErrorToast('Error', 'Failed to load test papers. Please try again.');
    testPapers.value = [];
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchTestPapers();
  
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
});
</script>

<style scoped>
/* Search field styling */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
}

.clear-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
  cursor: pointer;
}

.clear-search-icon:hover {
  color: #212529;
}

input[type="text"] {
  padding-left: 30px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
}

/* Sort field styling */
.sort-field {
  position: relative;
}

.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Card styling aligned with project design */
.test-paper-card {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.test-paper-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.test-paper-card .card-title {
  color: #212529;
  font-weight: 600;
}

/* Paper title with link styling */
/* Removed paper-title styles as they're no longer needed */

.paper-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.chapters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.chapter-badge, .more-badge {
  background-color: #f0f0f0;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #555;
}

.more-badge {
  background-color: #e9ecef;
  color: #6c757d;
}

/* View details link at bottom of card */
.view-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.view-chapters-link {
  display: inline-flex;
  align-items: center;
  color: #212529;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.view-chapters-link i {
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
}

/* Expanded chapters section styling */
.chapters-expanded-section {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.chapter-table {
  font-size: 0.95rem;
  margin-bottom: 0;
}

.chapter-table thead th {
  font-weight: 600;
  background-color: #f8f9fa;
}

/* Action buttons styling */
.action-btn {
  min-width: 160px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.btn-dark {
  background-color: #212529;
  border-color: #212529;
}

.btn-dark:hover:not(:disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-outline-dark {
  color: #212529;
  border-color: #212529;
}

.btn-outline-dark:hover:not(:disabled) {
  background-color: #212529;
  color: white;
}

/* Empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* PDF iframe styling */
.pdf-iframe {
  width: 100%;
  height: 80vh;
  border: none;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .action-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .paper-info-item {
    margin-bottom: 0.5rem;
  }
  
  .view-details-row {
    justify-content: center;
  }
}

/* Medium badges styling */
.medium-badge {
  display: inline-block;
  background-color: #e9ecef;
  color: #212529;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.3rem;
  font-weight: 500;
}

/* Medium selector in PDF modal */
.medium-selector-bar {
  border-bottom: 1px solid #dee2e6;
}

.medium-btn {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.medium-selector-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.medium-btn-group {
  display: flex;
}

.medium-delete-btn {
  padding: 0.25rem 0.5rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
  font-size: 0.85rem;
}

.medium-delete-btn:hover:not(:disabled) {
  background-color: #dc3545;
  color: white;
}

.delete-btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
}

/* Delete confirmation input styling */
.form-control.is-valid {
  border-color: #198754;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='m2.3 6.73.94-.94 1.36 1.36L6.5 5.26l.94.94-2.86 2.86L2.3 6.73z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.form-control.is-invalid {
  border-color: #dc3545;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 4.6 2.4 2.4M8.2 4.6l-2.4 2.4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

/* Delete confirmation text styling */
.text-danger {
  color: #dc3545 !important;
  font-weight: 600;
}
</style> 