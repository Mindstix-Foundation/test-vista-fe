<template>
  <div class="container">
    <div class="container mb-4">
      <div class="row g-2 mb-2 justify-content-center">
        <div v-if="!examMode" class="col-md-5">
          <SearchableDropdown
            v-if="useSearchableDropdown"
            id="filterTopic"
            label="Topic"
            placeholder="Select Topic"
            :items="topicItems"
            v-model="selectedTopicObject"
            @change="handleTopicChange"
            required
          />
          <div v-else class="form-floating">
            <select id="filterTopic" class="form-select" v-model="selectedTopic">
              <option value="">Select Topic</option>
              <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
            </select>
            <label for="filterTopic" class="form-label">Topic</label>
          </div>
        </div>
        <div :class="examMode ? 'col-md-10' : 'col-md-5'">
          <SearchableDropdown
            v-if="useSearchableDropdown"
            id="filterType"
            label="Type"
            placeholder="Select Type"
            :items="questionTypeItems"
            v-model="selectedTypeObject"
            @change="handleTypeChange"
            :disabled="(!examMode && !selectedTopic) || isEditMode"
            required
          />
          <div v-else class="form-floating">
            <select id="filterType" class="form-select" v-model="selectedType" @change="toggleQuestionContainer" :disabled="(!examMode && !selectedTopic) || isEditMode">
              <option value="">Select Type</option>
              <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <label for="filterType" class="form-label">Type</label>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedType === 'Multiple Choice Question (MCQ)' && !isEditMode"
      class="container mb-4"
    >
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="form-check form-switch passage-link-toggle">
            <input
              id="passageLinked"
              class="form-check-input"
              type="checkbox"
              role="switch"
              aria-checked="false"
              :aria-checked="passageLinked ? 'true' : 'false'"
              :checked="passageLinked"
              @change="handlePassageLinkedChange"
            />
            <label class="form-check-label fw-semibold" for="passageLinked">
              Passage linked
            </label>
            <div class="form-text">
              Use one shared passage for two or more MCQs. The linked questions remain
              consecutive whenever they are selected for a test.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container" id="descriptiveQuestion" v-show="selectedType === 'True or False' ||
                                               selectedType === 'Give Scientific Reasons' ||
                                               selectedType === 'Short Answer Question' ||
                                               selectedType === 'Complete and Identify Reaction' ||
                                               selectedType === 'Short Note' ||
                                               selectedType === 'One-Word Answer' ||
                                               selectedType === 'Odd One Out' ||
                                               selectedType === 'Complete the Correlation' ||
                                               selectedType === '2 Marks Questions' ||
                                               selectedType === '3 Marks Questions' ||
                                               selectedType === '4 Marks Questions' ||
                                               selectedType === '5 Marks Questions'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="question" v-model="descriptiveQuestion.question" class="form-control" rows="5"
                :placeholder="getPlaceholderText"
                @input="autoResize" required></textarea>
              <label for="question" class="form-label">{{ getLabelText }}</label>
              <!-- Question Image Upload Section for Descriptive -->
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              
              <!-- Show uploaded image from store if exists -->
              <div v-else-if="imageUploadStore.getQuestionImage()" class="uploaded-image-preview mb-2">
                <img :src="imageUploadStore.getQuestionImage()?.url" alt="Uploaded question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Uploaded: {{ imageUploadStore.getQuestionImage()?.file.name }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeUploadedQuestionImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              
              <div class="input-group input-group-sm mb-3">
                <button 
                  v-if="!imageUploadStore.getQuestionImage() && !existingImageUrl"
                  type="button" 
                  class="btn btn-outline-primary d-flex align-items-center"
                  @click="$emit('openQuestionImageModal', { questionText: descriptiveQuestion.question, questionType: selectedType })"
                >
                  <i class="bi bi-image me-2"></i>
                  Upload with A4 Preview
                </button>
                <input type="file" class="form-control" id="inputGroupFile01" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp" style="display: none;">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="descriptiveQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isDescriptiveValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
      class="container"
      id="mcqQuestion"
      v-show="selectedType === 'Multiple Choice Question (MCQ)' && !passageLinked"
    >
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="mcqText" v-model="mcqQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
              <label for="mcqText" class="form-label">Question</label>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div v-else-if="imageUploadStore.getQuestionImage()" class="uploaded-image-preview mb-2">
                <img :src="imageUploadStore.getQuestionImage()?.url" alt="Uploaded question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Uploaded: {{ imageUploadStore.getQuestionImage()?.file.name }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeUploadedQuestionImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <button 
                  v-if="!imageUploadStore.getQuestionImage() && !existingImageUrl"
                  type="button" 
                  class="btn btn-outline-primary d-flex align-items-center"
                  @click="$emit('openQuestionImageModal', { questionText: mcqQuestion.question, questionType: selectedType, options: mcqQuestion.options })"
                >
                  <i class="bi bi-image me-2"></i>
                  Upload with A4 Preview
                </button>
                <input type="file" class="form-control" id="mcqImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp" style="display: none;">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>

            <div class="mb-3">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[0]" class="form-control" id="option1" placeholder="Option 1" required>
                    <label for="option1">Option A</label>
                  </div>
                  <div id="optionAImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary d-flex align-items-center"
                      @click="$emit('openOptionImageModal', { questionText: mcqQuestion.question, questionType: selectedType, options: mcqQuestion.options, optionIndex: 0 })"
                    >
                      <i class="bi bi-image me-2"></i>
                      Upload Option A
                    </button>
                    <input type="file" class="form-control" id="optionAImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 0)" accept=".jpg,.jpeg,.webp" style="display: none;">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[1]" class="form-control" id="option2" placeholder="Option 2" required>
                    <label for="option2">Option B</label>
                  </div>
                  <div id="optionBImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary d-flex align-items-center"
                      @click="$emit('openOptionImageModal', { questionText: mcqQuestion.question, questionType: selectedType, options: mcqQuestion.options, optionIndex: 1 })"
                    >
                      <i class="bi bi-image me-2"></i>
                      Upload Option B
                    </button>
                    <input type="file" class="form-control" id="optionBImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 1)" accept=".jpg,.jpeg,.webp" style="display: none;">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[2]" class="form-control" id="option3" placeholder="Option 3">
                    <label for="option3">Option C</label>
                  </div>
                  <div id="optionCImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary d-flex align-items-center"
                      @click="$emit('openOptionImageModal', { questionText: mcqQuestion.question, questionType: selectedType, options: mcqQuestion.options, optionIndex: 2 })"
                    >
                      <i class="bi bi-image me-2"></i>
                      Upload Option C
                    </button>
                    <input type="file" class="form-control" id="optionCImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 2)" accept=".jpg,.jpeg,.webp" style="display: none;">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" v-model="mcqQuestion.options[3]" class="form-control" id="option4" placeholder="Option 4">
                    <label for="option4">Option D</label>
                  </div>
                  <div id="optionDImagePreview" class="mb-2"></div>
                  <div class="input-group input-group-sm mb-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary d-flex align-items-center"
                      @click="$emit('openOptionImageModal', { questionText: mcqQuestion.question, questionType: selectedType, options: mcqQuestion.options, optionIndex: 3 })"
                    >
                      <i class="bi bi-image me-2"></i>
                      Upload Option D
                    </button>
                    <input type="file" class="form-control" id="optionDImageFile" @change="(e) => handleQuestionImageUpload(e, 'option', 3)" accept=".jpg,.jpeg,.webp" style="display: none;">
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3 form-floating">
              <select id="correctOption" v-model="mcqQuestion.correctOption" class="form-select" required>
                <option value="">Select the correct option</option>
                <option value="1">Option A</option>
                <option value="2">Option B</option>
                <option value="3">Option C</option>
                <option value="4">Option D</option>
              </select>
              <label for="correctOption" class="form-label">Correct Option</label>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="mcqQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMcqValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container" id="fillBlankQuestion" v-show="selectedType === 'Fill in the Blanks'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3 form-floating">
              <textarea id="fillInTheBlankQuestion" v-model="fillBlankQuestion.question" class="form-control" rows="3"
                        placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
              <label for="fillInTheBlankQuestion" class="form-label">Question</label>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div v-else-if="imageUploadStore.getQuestionImage()" class="uploaded-image-preview mb-2">
                <img :src="imageUploadStore.getQuestionImage()?.url" alt="Uploaded question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Uploaded: {{ imageUploadStore.getQuestionImage()?.file.name }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeUploadedQuestionImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <button 
                  v-if="!imageUploadStore.getQuestionImage() && !existingImageUrl"
                  type="button" 
                  class="btn btn-outline-primary d-flex align-items-center"
                  @click="$emit('openQuestionImageModal', { questionText: fillBlankQuestion.question, questionType: selectedType })"
                >
                  <i class="bi bi-image me-2"></i>
                  Upload with A4 Preview
                </button>
                <input type="file" class="form-control" id="fillInTheBlankImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp" style="display: none;">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
              <div class="col text-end">
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
              </div>
            </div>

            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" v-model="fillBlankQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isFillBlankValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container" id="matchPairQuestion" v-show="selectedType === 'Match the Pairs'">
      <div class="row justify-content-center">
        <div class="col col-12 col-sm-10 ">
          <form @submit.prevent="saveQuestion">
            <div class="mb-3">
              <label for="pairQuestion" class="form-label">Question</label>
              <textarea id="pairQuestion" v-model="matchPairQuestion.question" class="form-control" rows="3" placeholder="Enter the question (e.g., Match the terms with their definitions)" @input="autoResize" required></textarea>
              <div v-if="existingImageUrl && !shouldDeleteImage" class="image-preview mb-2">
                <img :src="existingImageUrl" alt="Existing Question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Current Image: {{ existingImageName }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeExistingImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div v-else-if="imageUploadStore.getQuestionImage()" class="uploaded-image-preview mb-2">
                <img :src="imageUploadStore.getQuestionImage()?.url" alt="Uploaded question" class="img-fluid mb-2" style="max-height: 200px; border-radius: 5px;"/>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="text-muted mb-0"><small>Uploaded: {{ imageUploadStore.getQuestionImage()?.file.name }}</small></p>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeUploadedQuestionImage">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
              <div class="input-group input-group-sm mb-3">
                <button 
                  v-if="!imageUploadStore.getQuestionImage() && !existingImageUrl"
                  type="button" 
                  class="btn btn-outline-primary d-flex align-items-center"
                  @click="$emit('openQuestionImageModal', { questionText: matchPairQuestion.question, questionType: selectedType })"
                >
                  <i class="bi bi-image me-2"></i>
                  Upload with A4 Preview
                </button>
                <input type="file" class="form-control" id="matchPairsImageFile" @change="(e) => handleQuestionImageUpload(e, 'question')" accept=".jpg,.jpeg,.webp" style="display: none;">
              </div>
              <div v-if="imageUploadError" class="alert alert-danger py-1">
                {{ imageUploadError }}
              </div>
            </div>

            <div class="row g-3 justify-content-between mb-4">
              <!-- Left-hand side (LHS) -->
              <div class="col-md-5">
                <label for="lhs" class="form-label">Left Side</label>
                <div id="lhsInputs">
                  <div v-for="(item, index) in matchPairQuestion.lhs.filter(item => item !== null)" :key="'lhs-'+index" class="input-group mb-2" :id="'lhsInput'+(index+1)">
                    <input type="text" v-model="matchPairQuestion.lhs[matchPairQuestion.lhs.indexOf(item)]" class="form-control" placeholder="LHS" required>
                    <button type="button" class="btn btn-custom" @click="removeInput('lhs', matchPairQuestion.lhs.indexOf(item))" :disabled="matchPairQuestion.lhs.filter(item => item !== null).length <= 1">Remove</button>
                    <div class="input-group input-group-sm mt-1 mb-3">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary d-flex align-items-center"
                        @click="$emit('openOptionImageModal', { questionText: matchPairQuestion.question, questionType: selectedType, options: [...matchPairQuestion.lhs, ...matchPairQuestion.rhs], optionIndex: index })"
                      >
                        <i class="bi bi-image me-2"></i>
                        Upload Option
                      </button>
                      <input type="file" class="form-control" :id="'lhsImageFile'+matchPairQuestion.lhs.indexOf(item)" @change="(e) => handleQuestionImageUpload(e, 'option', matchPairQuestion.lhs.indexOf(item))" accept=".jpg,.jpeg,.webp" style="display: none;">
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('lhs')">Add</button>
              </div>

              <!-- Right-hand side (RHS) -->
              <div class="col-md-5">
                <label for="rhs" class="form-label">Right Side</label>
                <div id="rhsInputs">
                  <div v-for="(item, index) in matchPairQuestion.rhs.filter(item => item !== null)" :key="'rhs-'+index" class="input-group mb-2" :id="'rhsInput'+(index+1)">
                    <input type="text" v-model="matchPairQuestion.rhs[matchPairQuestion.rhs.indexOf(item)]" class="form-control" placeholder="RHS" required>
                    <button type="button" class="btn btn-custom" @click="removeInput('rhs', matchPairQuestion.rhs.indexOf(item))" :disabled="matchPairQuestion.rhs.filter(item => item !== null).length <= 1">Remove</button>
                    <div class="input-group input-group-sm mt-1 mb-3">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary d-flex align-items-center"
                        @click="$emit('openOptionImageModal', { questionText: matchPairQuestion.question, questionType: selectedType, options: [...matchPairQuestion.lhs, ...matchPairQuestion.rhs], optionIndex: index + matchPairQuestion.lhs.length })"
                      >
                        <i class="bi bi-image me-2"></i>
                        Upload Option
                      </button>
                      <input type="file" class="form-control" :id="'rhsImageFile'+matchPairQuestion.rhs.indexOf(item)" @change="(e) => handleQuestionImageUpload(e, 'option', matchPairQuestion.rhs.indexOf(item) + matchPairQuestion.lhs.length)" accept=".jpg,.jpeg,.webp" style="display: none;">
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="addInput('rhs')">Add</button>
              </div>
            </div>

            <div class="form-check mt-4 ">
              <input class="form-check-input" type="checkbox" v-model="matchPairQuestion.isPreviousExam" id="flexCheckDefault">
              <label class="form-check-label fw-bold" for="flexCheckDefault">
                Question appeared in a previous board exam.
              </label>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-dark" id="saveButton" :disabled="!isMatchPairValid">{{ isEditMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import axiosInstance from '@/config/axios'
import SearchableDropdown, { type Item } from '@/components/common/SearchableDropdown.vue'
import { useImageUploadStore } from '@/stores/imageUpload'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isEditMode?: boolean
  examMode?: boolean
  questionId?: number
  chapterId?: string | number
  useSearchableDropdown?: boolean
  initialOptions?: string[]
  initialCorrectOption?: number
  initialOptionImages?: string[]
  initialOptionImageIds?: (number | null)[]
  passageLinked?: boolean
  questionBankData?: {
    boardId: string
    boardName: string
    mediumId: string
    mediumName: string
    standardId: string
    standardName: string
    subjectId: string
    subjectName: string
    chapterId: string
    chapterName: string
    mediumStandardSubjectId: number | null
  }
}>()

const emit = defineEmits<{
  (e: 'save', data: {
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    optionImages?: (File | null)[]
    deleteImage?: boolean
    existingImageId?: number | null
    optionImageIds?: (number | null)[]
    optionImageDeleteFlags?: boolean[]
  }): void
  (e: 'update', data: {
    questionId?: number
    questionTypeId: number
    topicId: number
    isPreviousExam: boolean
    isVerified: boolean
    questionText: string
    additionalData: {
      options?: string[]
      correctOption?: number
      correctAnswer?: string
      lhs?: string[]
      rhs?: string[]
    }
    imageFile?: File
    optionImages?: (File | null)[]
    deleteImage?: boolean
    existingImageId?: number | null
    optionImageIds?: (number | null)[]
    optionImageDeleteFlags?: boolean[]
  }): void
  (e: 'openQuestionImageModal', data: {
    questionText: string
    questionType: string
    options?: string[]
  }): void
  (e: 'openOptionImageModal', data: {
    questionText: string
    questionType: string
    options?: string[]
    optionIndex: number
  }): void
  (e: 'questionImageCancelled'): void
  (e: 'optionImageCancelled', optionIndex: number): void
  (e: 'typeChanged', questionType: string): void
  (e: 'update:passageLinked', value: boolean): void
}>()

const router = useRouter()
const isSubmitting = ref(false)
const imageUploadStore = useImageUploadStore()

// Provide default values for props
const isEditMode = ref(props.isEditMode || false)

// Form data
const selectedType = ref('')
const selectedTopic = ref('')
const topics = ref<string[]>([])
const questionTypes = ref<string[]>([])

// Add objects for SearchableDropdown
const selectedTopicObject = ref<Item | null>(null)
const selectedTypeObject = ref<Item | null>(null)

// Compute items for SearchableDropdown
const topicItems = computed(() => {
  return topics.value.map(topicName => {
    return {
      id: topicMap.value.get(topicName) ?? 0,
      name: topicName
    } as Item
  })
})

const questionTypeItems = computed(() => {
  return questionTypes.value.map(typeName => {
    return {
      id: questionTypeMap.value.get(typeName) ?? 0,
      name: typeName
    } as Item
  })
})

// Handle SearchableDropdown changes
function handleTopicChange(item: Item | null) {
  if (item) {
    selectedTopic.value = item.name as string
  } else {
    selectedTopic.value = ''
  }
}

function handleTypeChange(item: Item | null) {
  if (item) {
    selectedType.value = item.name as string
    if (selectedType.value !== 'Multiple Choice Question (MCQ)' && props.passageLinked) {
      emit('update:passageLinked', false)
    }
    toggleQuestionContainer()
    emit('typeChanged', selectedType.value)
  } else {
    selectedType.value = ''
    if (props.passageLinked) emit('update:passageLinked', false)
    emit('typeChanged', '')
  }
}

function handlePassageLinkedChange(event: Event) {
  emit('update:passageLinked', (event.target as HTMLInputElement).checked)
}

// Question models
const descriptiveQuestion = ref({
  question: '',
  type: 'Descriptive',
  isPreviousExam: false
})

const mcqQuestion = ref({
  question: '',
  type: 'MCQ',
  options: ['', '', '', ''],
  correctOption: '',
  isPreviousExam: false
})

const fillBlankQuestion = ref({
  question: '',
  type: 'Fill in the Blanks',
  isPreviousExam: false
})

const matchPairQuestion = ref({
  question: '',
  type: 'Match the Pairs',
  lhs: [''],
  rhs: ['', ''],
  isPreviousExam: false
})

// Add computed properties to check if forms are valid
const isDescriptiveValid = computed(() => {
  return selectedTopic.value && selectedType.value && descriptiveQuestion.value.question.trim() !== '';
});

const isMcqValid = computed(() => {
  return mcqQuestion.value.question.trim() !== '' &&
         mcqQuestion.value.options[0].trim() !== '' &&
         mcqQuestion.value.options[1].trim() !== '' &&
         mcqQuestion.value.correctOption !== ''
})

const isFillBlankValid = computed(() => {
  return fillBlankQuestion.value.question.trim() !== '' &&
         fillBlankQuestion.value.question.includes('_____')
})

const isMatchPairValid = computed(() => {
  // Check if question is filled
  if (matchPairQuestion.value.question.trim() === '') return false;
  
  // Check if at least one LHS and one RHS item is filled
  const hasValidLhs = matchPairQuestion.value.lhs.some(item => item.trim() !== '');
  const hasValidRhs = matchPairQuestion.value.rhs.some(item => item.trim() !== '');
  
  return hasValidLhs && hasValidRhs;
})

// Add maps to store question type and topic IDs
const questionTypeMap = ref<Map<string, number>>(new Map())
const topicMap = ref<Map<string, number>>(new Map())

// Add interfaces for API data types
interface QuestionType {
  id: number
  type_name: string
  subsection_que?: boolean
}

interface Topic {
  id: number
  name: string
  chapter_id: number
  sequential_topic_number: number
  created_at: string
  updated_at: string
  chapter?: {
    id: number
    medium_standard_subject_id: number
    sequential_chapter_number: number
    name: string
    created_at: string
    updated_at: string
  }
}

// Update the SavePayload interface to include isVerified and option image related fields
interface SavePayload {
  questionId?: number;
  questionTypeId: number;
  topicId: number;
  isPreviousExam: boolean;
  isVerified: boolean;
  questionText: string;
  additionalData: {
    options?: string[];
    correctOption?: number;
    correctAnswer?: string;
    lhs?: string[];
    rhs?: string[];
  };
  imageFile?: File;
  optionImages?: (File | null)[];
  deleteImage?: boolean;
  existingImageId?: number | null;
  optionImageIds?: (number | null)[];
  optionImageDeleteFlags?: boolean[];
}

// Add interface for question response to include image details
interface QuestionResponse {
  id: number
  question_type_id: number
  board_question: boolean
  is_verified: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_texts: Array<{
    id: number
    question_id: number
    question_text: string
    image_id: number | null
    image?: {
      id: number
      presigned_url: string
      original_filename: string
    } | null
    match_pairs?: Array<{
      left_text: string
      right_text: string
      left_image?: {
        id: number
        presigned_url: string
        original_filename: string
      }
      right_image?: {
        id: number
        presigned_url: string
        original_filename: string
      }
    }>
  }>
  question_topics: Array<{
    id: number
    question_id: number
    topic_id: number
  }>
  question_options?: Array<{
    id: number
    question_id: number
    option_text: string
    is_correct: boolean
  }>
  question_answers?: Array<{
    id: number
    question_id: number
    answer_text: string
  }>
  matching_pairs?: Array<{
    id: number
    question_id: number
    left_text: string
    right_text: string
  }>
}

// Add a ref for the question image file
const questionImageFile = ref<File | null>(null);

// Add refs for the current image
const existingImageUrl = ref<string | null>(null);
const existingImageName = ref<string | null>(null);
const existingImageId = ref<number | null>(null);
const shouldDeleteImage = ref<boolean>(false);
const imageUploadError = ref<string | null>(null);

// Add refs to track each option image (MCQ options + match pairs)
const mcqOptionImages = ref<(File | null)[]>(new Array(20).fill(null)); // Increased size to handle all option types

// Add refs to track option image IDs and deletion status
const optionImageIds = ref<(number | null)[]>(new Array(20).fill(null));
const optionImageDeleteFlags = ref<boolean[]>(new Array(20).fill(false));

// Add computed properties for placeholder and label text
const getPlaceholderText = computed(() => {
  switch (selectedType.value) {
    case 'True or False':
      return 'Type your True/False statement here...';
    case 'Fill in the Blanks':
      return 'Type your sentence with blanks indicated by underscores (___)...';
    default:
      return 'Type your question here...';
  }
});

const getLabelText = computed(() => {
  switch (selectedType.value) {
    case 'True or False':
      return 'Statement';
    case 'Fill in the Blanks':
      return 'Sentence with Blanks';
    default:
      return 'Question';
  }
});

// Methods
async function fetchQuestionTypes() {
  try {
    const response = await axiosInstance.get('/question-types')
      .catch(() => ({ data: [] })) // Fallback to empty array if API fails

    if (response.data && Array.isArray(response.data)) {
      // Extract specifically the type_name property from each question type object
      questionTypes.value = response.data.map((type: QuestionType) => type.type_name || '')

      // Store the mapping of type names to IDs
      for (const type of response.data) {
        if (type.type_name && type.id) {
          questionTypeMap.value.set(type.type_name, type.id)
        }
      }
    } else {
      // Fallback to default question types if API fails
      questionTypes.value = [
        'Multiple Choice Question (MCQ)',
        'Odd One Out',
        'Complete the Correlation',
        'True or False',
        'Match the Pairs',
        'Fill in the Blanks',
        'One-Word Answer',
        'Give Scientific Reasons',
        'Short Answer Question',
        'Complete and Identify Reaction',
        'Short Note',
        '2 Marks Questions',
        '3 Marks Questions',
        '4 Marks Questions',
        '5 Marks Questions'
      ]
    }
  } catch (error) {
    console.error('Error fetching question types:', error)
    // Fallback to default question types if API fails
    questionTypes.value = [
      'Multiple Choice Question (MCQ)',
      'Odd One Out',
      'Complete the Correlation',
      'True or False',
      'Match the Pairs',
      'Fill in the Blanks',
      'One-Word Answer',
      'Give Scientific Reasons',
      'Short Answer Question',
      'Complete and Identify Reaction',
      'Short Note'
    ]
  }
}

const examMode = computed(() => props.examMode === true)

async function fetchTopics() {
  if (examMode.value) return
  try {
    // Get chapter ID from props or from questionBankData
    const chapterId = props.chapterId ?? (props.questionBankData?.chapterId ?? null);

    if (!chapterId) {
      setErrorTopic('Error: Chapter ID is missing. Please go back and select a chapter.');
      return;
    }

    // Try API first, then fallback to localStorage if needed
    await fetchTopicsFromApi(chapterId);
    
    // If no valid topics found, try localStorage fallback
    if (needsLocalStorageFallback()) {
      tryLocalStorageFallback();
    }
  } catch {
    setErrorTopic('Error: Could not load topics');
  }
}

function setErrorTopic(errorMessage) {
  topics.value = [errorMessage];
  selectedTopic.value = topics.value[0];
}

function needsLocalStorageFallback() {
  return topics.value.length === 0 || topics.value[0].startsWith('Error:');
}

async function fetchTopicsFromApi(chapterId) {
  // Fetch topics from API based on chapterId
  const response = await axiosInstance.get('/topics', {
    params: {
      chapterId: chapterId
    }
  }).catch(() => ({ data: [] })); // Fallback to empty array if API fails

  processApiResponse(response);
}

function processApiResponse(response) {
  // Transform the API response to extract topic names
  if (response.data && Array.isArray(response.data)) {
    topics.value = response.data.map((topic: Topic) => topic.name);
    mapTopicIdsToNames(response.data);
  } else {
    topics.value = ['Error: Invalid response from API'];
  }
}

function mapTopicIdsToNames(topicsData) {
  // Store the mapping of topic names to IDs
  for (const topic of topicsData) {
    if (topic.name && topic.id) {
      topicMap.value.set(topic.name, topic.id);
    }
  }
}

function tryLocalStorageFallback() {
  const storedQuestions = localStorage.getItem('questions');
  
  if (!storedQuestions) {
    if (topics.value.length === 0) {
      topics.value = ['No topics found. Please create topics first.'];
    }
    return;
  }
  
  try {
    extractTopicsFromLocalStorage(storedQuestions);
  } catch {
    if (needsLocalStorageFallback()) {
      topics.value = ['Error: Could not load topics'];
    }
  }
}

function extractTopicsFromLocalStorage(storedQuestions) {
  const questions = JSON.parse(storedQuestions);
  const uniqueTopics = new Set<string>();

  // Extract topics from questions
  for (const q of questions as { topic?: string; topics?: { topic: string }[] }[]) {
    if (q.topic) uniqueTopics.add(q.topic);
    if (q.topics) {
      for (const t of q.topics) uniqueTopics.add(t.topic);
    }
  }

  const localTopics = Array.from(uniqueTopics);
  
  if (localTopics.length > 0) {
    topics.value = localTopics;
  } else if (needsLocalStorageFallback()) {
    topics.value = ['No topics found. Please create topics first.'];
  }
}

async function fetchQuestionData() {
  if (!isEditMode.value || !props.questionId) return

  try {
    const response = await axiosInstance.get<QuestionResponse>(`/questions/${props.questionId}`)
    const questionData: QuestionResponse = response.data

    setTopicAndType(questionData)
    processQuestionTexts(questionData)
  } catch (error) {
    console.error('Error fetching question data:', error)
  }
}

function setTopicAndType(questionData: QuestionResponse) {
  // Set topic if available
  if (questionData.question_topics && questionData.question_topics.length > 0) {
    setTopicFromId(questionData.question_topics[0].topic_id)
  }
  
  // Set question type if available
  if (questionData.question_type) {
    selectedType.value = questionData.question_type.type_name
  }
}

async function setTopicFromId(topicId: number) {
  try {
    const topicResponse = await axiosInstance.get(`/topics/${topicId}`)
    selectedTopic.value = topicResponse.data.name
  } catch (error) {
    console.error('Error fetching topic:', error)
  }
}

function processQuestionTexts(questionData: QuestionResponse) {
  if (!questionData.question_texts || questionData.question_texts.length === 0) return
  
  const questionText = questionData.question_texts[0].question_text
  
  // Check for image
  processQuestionImage(questionData.question_texts[0])
  
  // Process based on question type
  processQuestionByType(questionData, questionText)
}

function processQuestionImage(questionTextData: QuestionResponse['question_texts'][0]) {
  if (questionTextData?.image_id && questionTextData?.image) {
    existingImageUrl.value = questionTextData.image.presigned_url
    existingImageName.value = questionTextData.image.original_filename || 'question_image'
    existingImageId.value = questionTextData.image.id
  }
}

function processQuestionByType(questionData: QuestionResponse, questionText: string) {
  // Group question types by their processing requirements
  if (isDescriptiveType()) {
    processDescriptiveQuestion(questionData, questionText)
  } else if (selectedType.value === 'Multiple Choice Question (MCQ)') {
    processMCQQuestion(questionData, questionText)
  } else if (selectedType.value === 'Fill in the Blanks') {
    processFillInBlanksQuestion(questionData, questionText)
  } else if (selectedType.value === 'Match the Pairs') {
    processMatchPairsQuestion(questionData, questionText)
  }
}

function isDescriptiveType() {
  return ['True or False', 'Give Scientific Reasons', 'Short Answer Question', 
         'Complete and Identify Reaction', 'Short Note', 'One-Word Answer', 
         'Odd One Out', 'Complete the Correlation'].includes(selectedType.value)
}

function processDescriptiveQuestion(questionData: QuestionResponse, questionText: string) {
  descriptiveQuestion.value.question = questionText
  descriptiveQuestion.value.isPreviousExam = questionData.board_question

  // Additional processing for specific types
  if (selectedType.value === 'Odd One Out') {
    addOddOneOutInfo(questionData)
  } else if (selectedType.value === 'Complete the Correlation') {
    addCorrelationNotes(questionData)
  }
}

function addOddOneOutInfo(questionData: QuestionResponse) {
  if (questionData.question_answers && questionData.question_answers.length > 0) {
    descriptiveQuestion.value.question += '\n\nOdd One Out: ' + questionData.question_answers[0].answer_text
  }
}

function addCorrelationNotes(questionData: QuestionResponse) {
  if (questionData.question_answers && questionData.question_answers.length > 0) {
    descriptiveQuestion.value.question += '\n\nCorrelation Notes: ' + questionData.question_answers[0].answer_text
  }
}

function processMCQQuestion(questionData: QuestionResponse, questionText: string) {
  mcqQuestion.value.question = questionText
  mcqQuestion.value.isPreviousExam = questionData.board_question

  // Process MCQ options
  if (questionData.question_options) {
    processMCQOptions(questionData.question_options)
  }
}

function processMCQOptions(options: QuestionResponse['question_options']) {
  for (const [index, option] of options.entries()) {
    if (index < 4) {
      mcqQuestion.value.options[index] = option.option_text
      if (option.is_correct) {
        mcqQuestion.value.correctOption = (index + 1).toString()
      }
    }
  }
}

function processFillInBlanksQuestion(questionData: QuestionResponse, questionText: string) {
  fillBlankQuestion.value.question = questionText
  fillBlankQuestion.value.isPreviousExam = questionData.board_question
}

function processMatchPairsQuestion(questionData: QuestionResponse, questionText: string) {
  matchPairQuestion.value.question = questionText
  matchPairQuestion.value.isPreviousExam = questionData.board_question
  
  processMatchPairs(questionData)
  ensureMinimumPairs()
}

function processMatchPairs(questionData: QuestionResponse) {
  if (!questionData.question_texts?.[0]?.match_pairs) {
    resetMatchPairs()
    return
  }
  
  const matchPairs = questionData.question_texts[0].match_pairs
  
  if (matchPairs.length > 0) {
    setMatchPairsData(matchPairs)
    processMatchPairsImages(matchPairs)
  } else {
    resetMatchPairs()
  }
}

// Define an interface for match pair item
interface MatchPair {
  left_text: string
  right_text: string
  left_image?: {
    id: number
    presigned_url: string
    original_filename: string
  }
  right_image?: {
    id: number
    presigned_url: string
    original_filename: string
  }
}

function setMatchPairsData(matchPairs: MatchPair[]) {
  matchPairQuestion.value.lhs = matchPairs.map(pair => pair.left_text)
  matchPairQuestion.value.rhs = matchPairs.map(pair => pair.right_text)
}

function resetMatchPairs() {
  matchPairQuestion.value.lhs = ['']
  matchPairQuestion.value.rhs = ['', '']
}

function processMatchPairsImages(matchPairs: MatchPair[]) {
  for (const [index, pair] of matchPairs.entries()) {
    processLeftImage(pair, index)
    processRightImage(pair, index)
  }
}

function processLeftImage(pair: MatchPair, index: number) {
  if (pair.left_image) {
    optionImageIds.value[index] = pair.left_image.id
    const optionImageContainer = document.getElementById(`lhsInput${index + 1}`)
    if (optionImageContainer) {
      createImagePreview(optionImageContainer, pair.left_image.presigned_url, index)
    }
  }
}

function processRightImage(pair: MatchPair, index: number) {
  if (pair.right_image) {
    optionImageIds.value[index + matchPairQuestion.value.lhs.length] = pair.right_image.id
    const optionImageContainer = document.getElementById(`rhsInput${index + 1}`)
    if (optionImageContainer) {
      createImagePreview(optionImageContainer, pair.right_image.presigned_url, index + matchPairQuestion.value.lhs.length)
    }
  }
}

function ensureMinimumPairs() {
  // Ensure we have at least one LHS item
  if (matchPairQuestion.value.lhs.length === 0) {
    matchPairQuestion.value.lhs = ['']
  }
  
  // Ensure we have at least two RHS items
  while (matchPairQuestion.value.rhs.length < 2) {
    matchPairQuestion.value.rhs.push('')
  }
}

function toggleQuestionContainer() {
  // The v-show directives will handle showing/hiding the appropriate container based on selectedType
  // Container mapping:
  // - descriptiveQuestion: True or False, Give Scientific Reasons, Short Answer Question, Complete and Identify Reaction, Short Note, One-Word Answer, Odd One Out, Complete the Correlation
  // - mcqQuestion: Multiple Choice Question (MCQ)
  // - fillBlankQuestion: Fill in the Blanks
  // - matchPairQuestion: Match the Pairs
  
  // Emit the type change event
  emit('typeChanged', selectedType.value)
}

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = ''
  textarea.style.height = textarea.scrollHeight + 'px'
}

function insertBlank() {
  fillBlankQuestion.value.question += '_____'
}

function addInput(side: 'lhs' | 'rhs') {
  if (side === 'lhs') {
    matchPairQuestion.value.lhs.push('');
  } else {
    matchPairQuestion.value.rhs.push('');
  }
}

function removeInput(side: 'lhs' | 'rhs', index: number) {
  if (side === 'lhs') {
    // Allow removing LHS items as long as there's at least one non-null item
    const nonNullItems = matchPairQuestion.value.lhs.filter(item => item !== null);
    if (nonNullItems.length > 1) {
      matchPairQuestion.value.lhs.splice(index, 1);
      // Remove corresponding image if exists
      if (optionImageIds.value[index]) {
        optionImageDeleteFlags.value[index] = true;
      }
    }
  } else {
    // Allow removing RHS items as long as there's at least one non-null item
    const nonNullItems = matchPairQuestion.value.rhs.filter(item => item !== null);
    if (nonNullItems.length > 1) {
      matchPairQuestion.value.rhs.splice(index, 1);
      // Remove corresponding image if exists
      if (optionImageIds.value[index + matchPairQuestion.value.lhs.length]) {
        optionImageDeleteFlags.value[index + matchPairQuestion.value.lhs.length] = true;
      }
    }
  }
}

function validateBasicFields(): boolean {
  if (!examMode.value && selectedTopic.value === '') {
    alert('Please select a topic')
    return false
  }

  if (selectedType.value === '') {
    alert('Please select a question type')
    return false
  }
  
  return true
}

function validateQuestionTypeFields(): { isValid: boolean, errorMessages: string[] } {
  let isValid = true
  const errorMessages: string[] = []

  // Type-specific validation
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
    case 'Odd One Out':
    case 'Complete the Correlation':
      if (!isDescriptiveValid.value) {
        isValid = false
        errorMessages.push('Please enter the question text')
      }
      break
    case 'Multiple Choice Question (MCQ)':
      if (!isMcqValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question, at least two options, and select the correct answer')
      }
      break
    case 'Fill in the Blanks':
      if (!isFillBlankValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question with blanks')
      }
      break
    case 'Match the Pairs':
      if (!isMatchPairValid.value) {
        isValid = false
        errorMessages.push('Please fill in the question, left-hand items, and right-hand items')
      }
      break
  }

  return { isValid, errorMessages }
}

function createBasePayload(): SavePayload {
  return {
    questionTypeId: getQuestionTypeId(),
    topicId: getTopicId(),
    isPreviousExam: getIsPreviousExam(),
    isVerified: false,
    questionText: '',
    additionalData: {},
    imageFile: questionImageFile.value ?? undefined,
    optionImages: [...mcqOptionImages.value].map(img => img === undefined ? null : img) as (File | null)[],
    deleteImage: shouldDeleteImage.value,
    existingImageId: existingImageId.value,
    optionImageIds: [...optionImageIds.value],
    optionImageDeleteFlags: [...optionImageDeleteFlags.value]
  }
}

function addQuestionTypeSpecificData(payload: SavePayload): void {
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
    case 'Odd One Out':
    case 'Complete the Correlation':
      payload.questionText = descriptiveQuestion.value.question
      break
    case 'Multiple Choice Question (MCQ)':
      payload.questionText = mcqQuestion.value.question
      payload.additionalData = {
        options: mcqQuestion.value.options,
        correctOption: Number.parseInt(mcqQuestion.value.correctOption, 10) - 1
      }
      break
    case 'Fill in the Blanks':
      payload.questionText = fillBlankQuestion.value.question
      break
    case 'Match the Pairs':
      payload.questionText = matchPairQuestion.value.question
      payload.additionalData = {
        lhs: matchPairQuestion.value.lhs,
        rhs: matchPairQuestion.value.rhs
      }
      break
  }
}

function emitSaveOrUpdate(payload: SavePayload): void {
  if (isEditMode.value) {
    emit('update', {
      questionId: props.questionId,
      questionTypeId: payload.questionTypeId,
      topicId: payload.topicId,
      isPreviousExam: payload.isPreviousExam,
      isVerified: payload.isVerified,
      questionText: payload.questionText,
      additionalData: payload.additionalData,
      imageFile: payload.imageFile,
      optionImages: payload.optionImages,
      deleteImage: payload.deleteImage,
      existingImageId: payload.existingImageId,
      optionImageIds: payload.optionImageIds,
      optionImageDeleteFlags: payload.optionImageDeleteFlags
    })
  } else {
    emit('save', payload)
  }
}

function saveQuestion() {
  // Validate basic fields
  if (!validateBasicFields()) return

  // Validate question type fields
  const { isValid, errorMessages } = validateQuestionTypeFields()
  if (!isValid) {
    alert(errorMessages.join('\n'))
    return
  }

  // Create and prepare payload
  const payload = createBasePayload()
  addQuestionTypeSpecificData(payload)
  
  // Emit event
  emitSaveOrUpdate(payload)
}

function getQuestionTypeId(): number {
  // If a type ID map is available, use it
  if (questionTypeMap.value.has(selectedType.value)) {
    return questionTypeMap.value.get(selectedType.value) ?? 0
  }

  // Otherwise use hardcoded values
  switch (selectedType.value) {
    case 'Multiple Choice Question (MCQ)':
      return 1
    case 'Odd One Out':
      return 2
    case 'Complete the Correlation':
      return 3
    case 'True or False':
      return 4
    case 'Match the Pairs':
      return 5
    case 'Fill in the Blanks':
      return 6
    case 'One-Word Answer':
      return 7
    case 'Give Scientific Reasons':
      return 8
    case 'Short Answer Question':
      return 9
    case 'Complete and Identify Reaction':
      return 10
    case 'Short Note':
      return 11
    case '2 Marks Questions':
      return 12
    case '3 Marks Questions':
      return 13
    case '4 Marks Questions':
      return 14
    case '5 Marks Questions':
      return 15
    default:
      return 0 // Default to 0, which should trigger a validation error
  }
}

function getIsPreviousExam(): boolean {
  switch (selectedType.value) {
    case 'True or False':
    case 'Give Scientific Reasons':
    case 'Short Answer Question':
    case 'Complete and Identify Reaction':
    case 'Short Note':
    case 'One-Word Answer':
    case '2 Marks Questions':
    case '3 Marks Questions':
    case '4 Marks Questions':
    case '5 Marks Questions':
      return descriptiveQuestion.value.isPreviousExam
    case 'Multiple Choice Question (MCQ)':
      return mcqQuestion.value.isPreviousExam
    case 'Fill in the Blanks':
      return fillBlankQuestion.value.isPreviousExam
    case 'Match the Pairs':
    case 'Complete the Correlation':
      return matchPairQuestion.value.isPreviousExam
    default:
      return false
  }
}

function getTopicId(): number {
  if (topicMap.value.has(selectedTopic.value)) {
    return topicMap.value.get(selectedTopic.value) ?? 0
  }
  return 0 // Default to 0 if topic is not found
}

// Watch for changes in selectedTopic
watch(selectedTopic, (newTopic) => {
  // Reset selectedType when topic changes
  if (!newTopic) {
    selectedType.value = ''
  }
})

// Add a watcher for questionImageFile to debug
watch(questionImageFile, (newValue) => {
  console.log('questionImageFile changed:', newValue);
}, { immediate: true });

// Helper functions for image upload validation and processing
function validateImageType(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only .jpg, .jpeg, and .webp files are allowed';
  }
  return null;
}

function validateImageSize(file: File): string | null {
  const minSize = 10 * 1024; // 10KB in bytes
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes

  if (file.size < minSize) {
    return 'Image size must be at least 10KB';
  }
  if (file.size > maxSize) {
    return 'Image size must not exceed 5MB';
  }
  return null;
}

function clearQuestionImageIfNeeded(type: 'question' | 'option') {
  if (type === 'question') {
    questionImageFile.value = null;
  }
}

function setQuestionImage(file: File) {
  console.log('Setting question image file:', file.name);
  questionImageFile.value = file;
  shouldDeleteImage.value = false; // Reset deletion flag since we're adding a new image
}

// New methods to handle images uploaded through ImageUploadEditor modal
function setUploadedQuestionImage(file: File, imageId: string, imageUrl: string) {
  console.log('Setting uploaded question image:', file.name, 'with ID:', imageId);
  
  // Explicitly clear the old system to prevent dual UI
  questionImageFile.value = null;
  existingImageUrl.value = null;
  existingImageName.value = null;
  
  // Reset flags
  shouldDeleteImage.value = false;
  imageUploadError.value = null;
  
  // The Pinia store will handle the new uploaded images
}

function setUploadedOptionImage(file: File, optionIndex: number, imageId: string, imageUrl: string) {
  console.log('Setting uploaded option image:', file.name, 'for index:', optionIndex, 'with ID:', imageId);
  const newOptionImages = [...mcqOptionImages.value];
  newOptionImages[optionIndex] = file;
  mcqOptionImages.value = newOptionImages;
  
  // Create preview for the option image
  nextTick(() => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    if (optionIndex < optionLabels.length) {
      const previewContainer = document.getElementById(`option${optionLabels[optionIndex]}ImagePreview`);
      if (previewContainer) {
        previewContainer.innerHTML = ''; // Clear existing content
        createImagePreview(previewContainer, imageUrl, optionIndex);
      }
    }
  });
}

function setOptionImage(file: File, index: number) {
  const newOptionImages = [...mcqOptionImages.value];
  newOptionImages[index] = file;
  mcqOptionImages.value = newOptionImages;
}

function clearOptionImage(optionIndex: number) {
  const newOptionImages = [...mcqOptionImages.value]
  newOptionImages[optionIndex] = null
  mcqOptionImages.value = newOptionImages
  
  // Find and clear the specific option file input
  const optionLabels = ['A', 'B', 'C', 'D']
  if (optionIndex < optionLabels.length) {
    const optionFileInput = document.getElementById(`option${optionLabels[optionIndex]}ImageFile`) as HTMLInputElement
    if (optionFileInput) {
      optionFileInput.value = ''
    }
  }
  
  // For match pairs, clear the appropriate input
  const lhsInput = document.getElementById(`lhsImageFile${optionIndex}`) as HTMLInputElement
  const rhsInput = document.getElementById(`rhsImageFile${optionIndex}`) as HTMLInputElement
  if (lhsInput) lhsInput.value = ''
  if (rhsInput) rhsInput.value = ''
}

// Main image upload handler with reduced complexity
function handleQuestionImageUpload(event: Event, type: 'question' | 'option' = 'question', optionIndex?: number) {
  const input = event.target as HTMLInputElement;
  imageUploadError.value = null; // Reset error message

  // No file selected case
  if (!input.files || input.files.length === 0) {
    handleNoFileSelected(type, optionIndex);
    return;
  }

  const file = input.files[0];
  
  // Validate file and handle any errors
  const validationError = validateImageFile(file);
  if (validationError) {
    handleImageValidationError(validationError, input, type);
    return;
  }

  // File passed all validations, process it based on type
  processValidImage(file, type, optionIndex);
}

function handleNoFileSelected(type: 'question' | 'option', optionIndex?: number) {
  if (type === 'question') {
    questionImageFile.value = null;
  } else if (type === 'option' && optionIndex !== undefined) {
    clearOptionImage(optionIndex);
  }
}

function validateImageFile(file: File): string | null {
  // Check file type first
  const typeError = validateImageType(file);
  if (typeError) return typeError;
  
  // Then check file size
  const sizeError = validateImageSize(file);
  if (sizeError) return sizeError;
  
  return null; // No errors
}

function handleImageValidationError(errorMessage: string, input: HTMLInputElement, type: 'question' | 'option') {
  imageUploadError.value = errorMessage;
  input.value = ''; // Clear the input
  clearQuestionImageIfNeeded(type);
}

function processValidImage(file: File, type: 'question' | 'option', optionIndex?: number) {
  if (type === 'question') {
    setQuestionImage(file);
  } else if (type === 'option' && optionIndex !== undefined) {
    setOptionImage(file, optionIndex);
  }
}

// Update the removeUploadedImage function
function removeUploadedImage(event: Event, type: 'question' | 'option' = 'question', optionIndex?: number) {
  event.preventDefault(); // Prevent any default behavior

  const button = event.currentTarget as HTMLButtonElement;
  const fileInput = button.closest('.input-group')?.querySelector('input[type="file"]') as HTMLInputElement;

  if (fileInput) {
    fileInput.value = ''; // Clear the file input

    if (type === 'question') {
      questionImageFile.value = null; // Clear the file reference
    } else if (type === 'option' && optionIndex !== undefined) {
      // Set the specific index to null
      const newOptionImages = [...mcqOptionImages.value];
      newOptionImages[optionIndex] = null;
      mcqOptionImages.value = newOptionImages;
    }

    imageUploadError.value = null; // Clear any error message
  }
}

// Function to handle removing the existing image
function removeExistingImage() {
  shouldDeleteImage.value = true;
  existingImageUrl.value = null;
  existingImageName.value = null;
  imageUploadError.value = null; // Clear any error message
  // Keep the existingImageId value for sending the delete request
}

// Function to handle removing uploaded question image from store
function removeUploadedQuestionImage() {
  imageUploadStore.removeQuestionImage();
  // Don't clear questionImageFile, existingImageUrl, or existingImageName here
  // These should only be used for existing images from the database
  // Only clear the error state
  imageUploadError.value = null;
}

// Add this helper function for creating image previews
function createImagePreview(container: HTMLElement, imageUrl: string, index: number) {
  const previewDiv = document.createElement('div');
  previewDiv.className = 'image-preview mb-2';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = `Option Image ${index + 1}`;
  img.className = 'img-fluid mb-2';
  img.style.maxHeight = '100px';
  img.style.borderRadius = '5px';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'd-flex justify-content-between align-items-center';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger btn-sm';
  removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remove';
  removeBtn.onclick = (e) => {
    e.preventDefault();
    previewDiv.remove();
    // Remove from store
    imageUploadStore.removeOptionImage(index);
    // Clear from component state
    clearOptionImage(index);
  };

  infoContainer.appendChild(removeBtn);
  previewDiv.appendChild(img);
  previewDiv.appendChild(infoContainer);
  container.appendChild(previewDiv);
}

function handleClearOptionImageEvent(event: Event) {
  const customEvent = event as CustomEvent
  const optionIndex = customEvent.detail?.optionIndex
  if (typeof optionIndex === 'number') {
    clearOptionImage(optionIndex)
    // Also clear from store
    imageUploadStore.removeOptionImage(optionIndex)
  }
}

// New helper functions to reduce complexity in onMounted
function initializeImageRefs() {
  questionImageFile.value = null;
  mcqOptionImages.value = new Array(20).fill(null);
  optionImageIds.value = new Array(20).fill(null);
  optionImageDeleteFlags.value = new Array(20).fill(false);
  imageUploadError.value = null;
}

function initializeSearchableDropdownValues() {
  if (!props.useSearchableDropdown) return;
  
  if (selectedTopic.value) {
    const topicId = topicMap.value.get(selectedTopic.value) ?? 0;
    selectedTopicObject.value = {
      id: topicId,
      name: selectedTopic.value
    } as Item;
  }

  if (selectedType.value) {
    const typeId = questionTypeMap.value.get(selectedType.value) ?? 0;
    selectedTypeObject.value = {
      id: typeId,
      name: selectedType.value
    } as Item;
  }
}

function initializeMcqOptions() {
  if (!props.initialOptions || props.initialOptions.length === 0) return;
  
  mcqQuestion.value.options = [...props.initialOptions];
  while (mcqQuestion.value.options.length < 4) {
    mcqQuestion.value.options.push('');
  }
  
  if (props.initialCorrectOption !== undefined && props.initialCorrectOption >= 0) {
    mcqQuestion.value.correctOption = (props.initialCorrectOption + 1).toString();
  }
}

function setupOptionImagePreview(optionIndex: number) {
  if (!props.initialOptionImages?.[optionIndex]) return;
  
  // Store the image IDs for later use
  if (props.initialOptionImageIds?.[optionIndex]) {
    optionImageIds.value[optionIndex] = props.initialOptionImageIds[optionIndex];
  }

  // Display existing option images in the UI
  const optionImageContainer = document.getElementById(`option${String.fromCodePoint(65 + optionIndex)}ImagePreview`);
  if (!optionImageContainer) return;
  
  // Clear any existing content
  optionImageContainer.innerHTML = '';
  
  // Create the image preview
  createOptionImagePreview(optionImageContainer, props.initialOptionImages[optionIndex], optionIndex);
}

function createOptionImagePreview(container: HTMLElement, imageUrl: string, optionIndex: number) {
  const imagePreview = document.createElement('div');
  imagePreview.className = 'image-preview mb-2';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = `Option ${String.fromCodePoint(65 + optionIndex)}`;
  img.className = 'img-fluid mb-2';
  img.style.maxHeight = '100px';
  img.style.borderRadius = '5px';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'd-flex justify-content-between align-items-center';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger btn-sm';
  removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remove';
  removeBtn.onclick = (e) => {
    e.preventDefault();
    // Remove the image preview
    imagePreview.remove();

    // Mark this option image for deletion when form is submitted
    if (props.initialOptionImageIds?.[optionIndex]) {
      console.log(`Marking option image ${optionIndex} for deletion`);
      optionImageDeleteFlags.value[optionIndex] = true;
    }
  };

  infoContainer.appendChild(removeBtn);
  imagePreview.appendChild(img);
  imagePreview.appendChild(infoContainer);
  container.appendChild(imagePreview);
}

function initializeOptionImages() {
  if (!props.initialOptionImages || props.initialOptionImages.length === 0) return;
  
  console.log('Setting up option images from props:', props.initialOptionImages);
  
  // Create image preview elements for each option that has an image
  for (let i = 0; i < props.initialOptionImages.length; i++) {
    setupOptionImagePreview(i);
  }
}

function initializeTextareas() {
  setTimeout(() => {
    for (const textarea of document.querySelectorAll('textarea')) {
      (textarea as HTMLTextAreaElement).style.height = textarea.scrollHeight + 'px';
    }
  }, 0);
}

// Refactored onMounted function with reduced complexity
onMounted(() => {
  initializeImageRefs();
  fetchQuestionTypes();
  fetchTopics();

  if (isEditMode.value && props.questionId) {
    fetchQuestionData().then(() => {
      initializeSearchableDropdownValues();
      initializeMcqOptions();
      initializeOptionImages();
    });
  }

  initializeTextareas();
  
  // Add event listeners for image cancellation
  globalThis.addEventListener('clearQuestionImage', clearQuestionImage);
  globalThis.addEventListener('clearOptionImage', handleClearOptionImageEvent);
});

// Add onUnmounted to clean up event listeners
onUnmounted(() => {
  globalThis.removeEventListener('clearQuestionImage', clearQuestionImage);
  globalThis.removeEventListener('clearOptionImage', handleClearOptionImageEvent);
});

// Functions to handle cancellation of image uploads
function clearQuestionImage() {
  questionImageFile.value = null
  imageUploadError.value = null
  // Clear from store
  imageUploadStore.removeQuestionImage()
  // Clear existing image preview
  existingImageUrl.value = null
  existingImageName.value = null
  // Find and clear the file input
  const questionFileInputs = document.querySelectorAll('input[type="file"][accept*="image"]')
  for (const input of questionFileInputs) {
    if (input.id.includes('question') || input.id.includes('mcq') || input.id.includes('fillInTheBlank') || input.id.includes('matchPairs')) {
      (input as HTMLInputElement).value = ''
    }
  }
}

// Method to get selected topic ID for CSV upload
function getSelectedTopicId(): number | null {
  if (selectedTopic.value && topicMap.value.has(selectedTopic.value)) {
    return topicMap.value.get(selectedTopic.value) ?? null
  }
  return null
}

// Expose methods for parent component to call
defineExpose({
  setUploadedQuestionImage,
  setUploadedOptionImage,
  getSelectedTopicId
})
</script>

<style scoped>
/* For screen size "sm" or smaller */
@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545;
    color: white;
  }
}

/* For larger screen sizes */
@media (min-width: 577px) {
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa; /* Matches btn-light */
    color: black;
    transition: background-color 0.3s ease, color 0.3s ease; /* Smooth hover effect */
    border-radius: 1%;
  }
  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545;
    color: white;
  }
}

/* Add styles at the end of the style section */
.form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.75;
  cursor: not-allowed;
}

/* Style for error options in select lists */
option[value^="Error:"], option[value^="No topics"] {
  color: #dc3545;
  font-weight: bold;
  font-style: italic;
}

/* Add style for image preview */
.image-preview {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f8f9fa;
}

.image-preview img {
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
