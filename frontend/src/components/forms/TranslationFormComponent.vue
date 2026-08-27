<template>
  <div>
    <!-- Descriptive Question Form -->
    <div id="descriptiveQuestion" v-show="questionType === 'True or False' ||
                                          questionType === 'Give Scientific Reasons' ||
                                          questionType === 'Short Answer Question' ||
                                          questionType === 'Complete and Identify Reaction' ||
                                          questionType === 'Short Note' ||
                                          questionType === 'One-Word Answer' ||
                                          questionType === 'Fill in the Blanks' ||
                                          questionType === 'Odd One Out' ||
                                          questionType === 'Complete the Correlation'">
      <form @submit.prevent="$emit('save-translation')">
        <div class="mb-3">
          <label for="questionTranslate" class="form-label">
            Original Question
            <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                  class="badge ms-2"
                  :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
              {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
              ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
            </span>
          </label>
          <textarea id="questionTranslate" :value="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

          <!-- Original Question Image (only if available and no new image selected) -->
          <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
            <div v-if="imageLoading" class="image-loading-overlay">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              v-if="questionImage.presigned_url || questionImage.image_url"
              :src="questionImage.presigned_url || questionImage.image_url"
              class="question-image"
              alt="Question"
              @load="imageLoading = false"
              @error="handleImageError"
            />
            <div v-if="imageError" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              Failed to load image
            </div>
          </div>

          <div class="form-floating">
            <textarea id="question" v-model="questionText" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
            <label for="question" class="form-label">
              Translated Question
              <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
            </label>
          </div>
          <div class="input-group input-group-sm mb-3">
            <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
          </div>
        </div>
        <div class="mt-5 text-center">
          <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
            <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- MCQ Question Form -->
    <div id="mcqQuestion" v-show="questionType === 'Multiple Choice Question (MCQ)'">
      <form @submit.prevent="$emit('save-translation')">
        <div class="mb-3">
          <label for="mcqTextTranslate" class="form-label">
            Original Question
            <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                  class="badge ms-2"
                  :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
              {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
              ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
            </span>
          </label>
          <textarea id="mcqTextTranslate" :value="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

          <!-- Original Question Image (only if available and no new image selected) -->
          <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
            <div v-if="imageLoading" class="image-loading-overlay">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              v-if="questionImage.presigned_url || questionImage.image_url"
              :src="questionImage.presigned_url || questionImage.image_url"
              class="question-image"
              alt="Question"
              @load="imageLoading = false"
              @error="handleImageError"
            />
            <div v-if="imageError" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              Failed to load image
            </div>
          </div>

          <div class="form-floating">
            <textarea id="mcqText" v-model="questionText" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
            <label for="mcqText" class="form-label">
              Translated Question
              <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
            </label>
          </div>
          <div class="input-group input-group-sm mb-3">
            <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
          </div>
        </div>

        <div class="mb-3">
          <div class="row g-3">
            <div class="col-12 mb-2">
              <div class="d-flex justify-content-between">
                <h6 class="text-muted" v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0">
                  {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }} Options (Original)
                </h6>
                <h6 class="text-muted" v-else>
                  Original Options
                </h6>
                <h6 class="text-muted">{{ targetMediumName }} Options (Translation)</h6>
              </div>
              <hr class="mt-0">
            </div>
            <div class="col-md-6" v-for="(option, index) in originalOptions" :key="index">
              <div class="form-floating">
                <input type="text" :value="option" readonly class="form-control" :id="'option' + (index + 1) + 'Translate'">
                <label :for="'option' + (index + 1) + 'Translate'" class="small">
                  Option {{ String.fromCharCode(65 + index) }}
                </label>
              </div>
              <div class="form-floating">
                <input type="text" v-model="translatedOpts[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                <label :for="'option' + (index + 1)">
                  Option {{ String.fromCharCode(65 + index) }}
                  <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
                </label>
              </div>
              <div class="input-group input-group-sm mb-3">
                <input type="file" class="form-control" :id="'optionImage' + (index + 1)">
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-3">
          <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
            <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Fill in the Blanks Question Form -->
    <div id="fillBlankQuestion" v-show="questionType === 'Fill in the Blanks'">
      <form @submit.prevent="$emit('save-translation')">
        <div class="mb-3">
          <label for="translateFillBlank" class="form-label">
            Original Question
            <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                  class="badge ms-2"
                  :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
              {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
              ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
            </span>
          </label>
          <textarea id="translateFillBlank" :value="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

          <!-- Original Question Image (only if available and no new image selected) -->
          <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
            <div v-if="imageLoading" class="image-loading-overlay">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              v-if="questionImage.presigned_url || questionImage.image_url"
              :src="questionImage.presigned_url || questionImage.image_url"
              class="question-image"
              alt="Question"
              @load="imageLoading = false"
              @error="handleImageError"
            />
            <div v-if="imageError" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              Failed to load image
            </div>
          </div>

          <div class="form-floating">
            <textarea id="fillInTheBlankQuestion" v-model="questionText" class="form-control" rows="3"
                      placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
            <label for="fillInTheBlankQuestion" class="form-label">
              Translated Question
              <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
            </label>
          </div>
          <div class="input-group input-group-sm mb-3">
            <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
          </div>
          <div class="col text-end">
            <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
          </div>
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
            <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Match Pairs Question Form -->
    <div id="matchPairQuestion" v-show="questionType === 'Match the Pairs'">
      <form @submit.prevent="$emit('save-translation')">
        <div class="mb-3">
          <label for="matchPairTranslate" class="form-label">
            Original Question
            <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                  class="badge ms-2"
                  :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
              {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
              ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
            </span>
          </label>
          <textarea id="matchPairTranslate" :value="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

          <!-- Original Question Image (only if available and no new image selected) -->
          <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
            <div v-if="imageLoading" class="image-loading-overlay">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              v-if="questionImage.presigned_url || questionImage.image_url"
              :src="questionImage.presigned_url || questionImage.image_url"
              class="question-image"
              alt="Question"
              @load="imageLoading = false"
              @error="handleImageError"
            />
            <div v-if="imageError" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              Failed to load image
            </div>
          </div>

          <div class="form-floating">
            <textarea id="matchPairQuestion" v-model="questionText" class="form-control" rows="3" placeholder="Type your question here..." @input="autoResize" required></textarea>
            <label for="matchPairQuestion" class="form-label">
              Translated Question
              <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
            </label>
          </div>
          <div class="input-group input-group-sm mb-3">
            <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
          </div>
        </div>

        <div class="row g-3 justify-content-between mb-4">
          <!-- Original Pair Display -->
          <div class="col-12 mb-3">
            <h6 class="text-muted">Original Matching Pairs</h6>
            <div class="table-responsive">
              <table class="table table-bordered">
                <caption>List of original matching pairs showing left and right side content</caption>
                <thead class="table-light">
                  <tr>
                    <th scope="col">Left Side</th>
                    <th scope="col">Right Side</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(pair, index) in originalMatchPairs" :key="index">
                    <td>{{ pair.left_text }}</td>
                    <td>{{ pair.right_text }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Left-hand side (LHS) Translation -->
          <div class="col-md-5">
            <h5 class="form-label fw-bold">Left Side Translation</h5>
            <div id="lhsInputs">
              <div v-for="(pair, index) in originalMatchPairs" :key="'lhs-'+index" class="mb-3">
                <div class="form-floating">
                  <input type="text" v-model="translatedPairs[index].left_text" class="form-control" :id="'lhs-' + index" :placeholder="'Left Side ' + (index + 1)" required>
                  <label :for="'lhs-' + index">
                    Left Side {{ index + 1 }}
                    <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Right-hand side (RHS) Translation -->
          <div class="col-md-5">
            <h5 class="form-label fw-bold">Right Side Translation</h5>
            <div id="rhsInputs">
              <div v-for="(pair, index) in originalMatchPairs" :key="'rhs-'+index" class="mb-3">
                <div class="form-floating">
                  <input type="text" v-model="translatedPairs[index].right_text" class="form-control" :id="'rhs-' + index" :placeholder="'Right Side ' + (index + 1)" required>
                  <label :for="'rhs-' + index">
                    Right Side {{ index + 1 }}
                    <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-3">
          <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
            <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- True or False Question Form -->
    <div id="trueOrFalseQuestion" v-show="questionType === 'True or False'">
      <form @submit.prevent="$emit('save-translation')">
        <div class="mb-3">
          <label for="tfQuestionTranslate" class="form-label">
            Original Question
            <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                  class="badge ms-2"
                  :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
              {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
              ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
            </span>
          </label>
          <textarea id="tfQuestionTranslate" :value="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

          <!-- Original Question Image (only if available and no new image selected) -->
          <div v-if="questionImage && !newImageSelected" class="question-image-container mb-3 mt-2">
            <div v-if="imageLoading" class="image-loading-overlay">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading image...</span>
              </output>
            </div>
            <img
              v-if="questionImage.presigned_url || questionImage.image_url"
              :src="questionImage.presigned_url || questionImage.image_url"
              class="question-image"
              alt="Question"
              @load="imageLoading = false"
              @error="handleImageError"
            />
            <div v-if="imageError" class="image-error-message">
              <i class="bi bi-exclamation-triangle"></i>
              Failed to load image
            </div>
          </div>

          <div class="form-floating">
            <textarea id="tfQuestion" v-model="questionText" class="form-control" rows="3" placeholder="Type your question here..." @input="autoResize" required></textarea>
            <label for="tfQuestion" class="form-label">
              Translated Question
              <span class="badge bg-primary language-badge">{{ targetMediumName }}</span>
            </label>
          </div>
          <div class="input-group input-group-sm mb-3">
            <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
          </div>
        </div>
        <div class="mt-5 text-center">
          <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
            <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue'

// Define interfaces for type safety
interface QuestionImage {
  id: number;
  presigned_url?: string;
  image_url?: string;
}

interface Medium {
  id: number;
  instruction_medium: string;
}

interface Translation {
  id: number;
  question_text: string;
  medium: Medium;
  translation_status: string;
  image_id?: number;
  image?: QuestionImage;
  mcq_options?: Array<{ option_text: string }>;
  match_pairs?: Array<{ left_text: string; right_text: string }>;
  answer_text?: string;
}

// Define component name
defineOptions({
  name: 'TranslationFormComponent'
})

// Define emits first
const emit = defineEmits([
  'save-translation',
  'auto-resize',
  'handle-image-error',
  'handle-image-change',
  'insert-blank',
  'update:translatedQuestion',
  'update:translatedOptions',
  'update:translatedMatchPairs'
])

// Define props
const props = defineProps({
  questionType: {
    type: String,
    required: true
  },
  originalQuestion: {
    type: String,
    required: true
  },
  originalOptions: {
    type: Array as () => string[],
    default: () => []
  },
  originalMatchPairs: {
    type: Array as () => Array<{ left_text: string; right_text: string }>,
    default: () => []
  },
  translatedQuestion: {
    type: Object as () => { question: string; type?: string },
    required: true
  },
  translatedOptions: {
    type: Array as () => string[],
    default: () => ['', '', '', '']
  },
  translatedMatchPairs: {
    type: Array as () => Array<{ left_text: string; right_text: string }>,
    default: () => []
  },
  questionImage: {
    type: Object as () => QuestionImage | null,
    default: null
  },
  availableTranslations: {
    type: Array as () => Translation[],
    default: () => []
  },
  selectedTranslationIndex: {
    type: Number,
    default: 0
  },
  targetMediumName: {
    type: String,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

// Define model values for two-way binding
const questionText = computed({
  get: () => props.translatedQuestion.question,
  set: (value) => emit('update:translatedQuestion', { ...props.translatedQuestion, question: value })
})

const translatedOpts = computed({
  get: () => props.translatedOptions,
  set: (value) => emit('update:translatedOptions', value)
})

const translatedPairs = computed({
  get: () => props.translatedMatchPairs,
  set: (value) => emit('update:translatedMatchPairs', value)
})

// Reactive state
const imageLoading = ref(false)
const imageError = ref(false)
const newImageSelected = ref(false)
const questionImageInput = ref<HTMLInputElement | null>(null)

// Methods
function autoResize(event: Event) {
  emit('auto-resize', event)

  const textarea = event.target as HTMLTextAreaElement
  if (textarea.readOnly) {
    // Temporarily remove readonly to calculate height
    textarea.readOnly = false
    textarea.style.height = ''
    textarea.style.height = textarea.scrollHeight + 'px'
    textarea.readOnly = true
  } else {
    textarea.style.height = ''
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

function insertBlank() {
  emit('insert-blank')
}

// Handle image error
function handleImageError() {
  imageLoading.value = false
  imageError.value = true
  emit('handle-image-error')
}

// Handle image change
function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    newImageSelected.value = true
  } else {
    newImageSelected.value = false
  }
  emit('handle-image-change', event)
}

// Lifecycle hooks
onMounted(() => {
  // Initialize textareas
  setTimeout(() => {
    for (const textarea of document.querySelectorAll('textarea')) {
      autoResize({ target: textarea } as unknown as Event)
    }
  }, 0)
})
</script>

<style scoped>
textarea[readonly] {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

/* Question image styling */
.question-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
  background-color: #f8f9fa;
}

.question-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-error-message i {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.7);
  z-index: 5;
}

.language-badge {
  font-size: 0.8rem;
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}

.form-floating > label {
  left: 0.5rem;
  padding-right: 2.5rem; /* Increase right padding to prevent badge from being cut off */
}

/* Style for labels with badges in floating elements */
.form-floating label .badge {
  font-weight: normal;
  font-size: 70%;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }
}
</style>

