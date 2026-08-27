<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <a class="btn btn-close" href="#" @click.prevent="handleCloseClick" aria-label="Close"></a>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 ">
          <template v-if="isExamScope">
            <p class="text-muted text-start fs-5 m-0">
              {{ questionBankData.programLabel }}
              <span v-if="questionBankData.mediumName"> | {{ questionBankData.mediumName }}</span>
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="fw-bolder text-start text-dark m-0">
                <span v-if="questionBankData.stageName">{{ questionBankData.stageName }} | </span>
                {{ questionBankData.subjectName || questionBankData.nodeName }}
                <span v-if="questionBankData.chapterName"> | {{ questionBankData.chapterName }}</span>
                <span v-if="questionBankData.topicName"> | {{ questionBankData.topicName }}</span>
                <span class="d-block text-start text-secondary small">Competitive / Entrance syllabus</span>
              </h4>
              <h4 class="fw-bolder text-uppercase mb-0" id="pageHeader">Edit Question</h4>
            </div>
          </template>
          <template v-else>
            <p class="text-muted text-start fs-5 m-0">
              <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
              <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="fw-bolder text-start text-dark m-0 ">
                Standard {{ questionBankData.standardName }}
                <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
              </h4>
              <h4 class="fw-bolder text-uppercase mb-0" id="pageHeader">Edit Question</h4>
            </div>
          </template>
        </div>
      </div>
      <hr>
    </div>
    <div id="questionsSection" class="container">
      <div v-if="isLoading" class="text-center my-5">
        <output
          class="spinner-border text-primary"
        >
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
      <PassageGroupForm
        v-else-if="isPassageGroup"
        :is-edit-mode="true"
        :saving="isSubmitting"
        :show-pyq-toggle="true"
        :initial-passage-text="passageInitial.passageText"
        :initial-is-pyq="passageInitial.isPyq"
        :initial-children="passageInitial.children"
        @save="handleUpdatePassageGroup"
        @cancel="handleCloseClick"
      />
      <QuestionFormComponent
        v-else
        :isEditMode="true"
        :questionId="questionId"
        :questionBankData="questionBankData"
        :initialOptions="initialOptions"
        :initialCorrectOption="initialCorrectOption"
        :initialOptionImages="initialOptionImages"
        :initialOptionImageIds="initialOptionImageIds"
        :useSearchableDropdown="true"
        :examMode="isExamScope"
        @update="handleUpdateQuestion"
        @openQuestionImageModal="openQuestionImageModal"
        @openOptionImageModal="openOptionImageModal"
        ref="questionFormComponent"
      />
    </div>

    <!-- Loading overlay shown during submission -->
    <div v-if="isSubmitting" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <output
        class="spinner-border text-light"
        style="width: 3rem; height: 3rem;"
      >
        <span class="visually-hidden">Saving...</span>
      </output>
    </div>

    <!-- Enhanced Image Upload Modals -->
    <ImageUploadEditor
      :isVisible="showQuestionImageModal"
      :questionText="currentQuestionData.questionText"
      :questionNumber="1"
      imageType="question"
      :questionType="currentQuestionData.questionType"
      :options="currentQuestionData.options"
      @close="() => showQuestionImageModal = false"
      @cancelled="handleQuestionImageCancelled"
      @imageUploaded="handleQuestionImageUploaded"
    />

    <ImageUploadEditor
      :isVisible="showOptionImageModal"
      :questionText="currentQuestionData.questionText"
      :questionNumber="1"
      imageType="option"
      :questionType="currentQuestionData.questionType"
      :options="currentQuestionData.options"
      :optionIndex="currentOptionIndex"
      @close="() => showOptionImageModal = false"
      @cancelled="handleOptionImageCancelled"
      @imageUploaded="handleOptionImageUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import QuestionFormComponent from '@/components/forms/QuestionFormComponent.vue'
import PassageGroupForm from '@/components/forms/PassageGroupForm.vue'
import { useToastStore } from '@/store/toast'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'
import imageService from '@/services/imageService'
import examCatalogService from '@/services/examCatalogService'
import { resolveExamChapterId } from '@/utils/examSyllabus'

// Define custom error type for Axios errors
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// Define type aliases for common union types
type NullableId = number | null | undefined;

// Define interfaces for the data structures
interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
  image: null | {
    id: number;
    presigned_url: string;
    original_filename?: string;
  };
}

interface MatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  created_at?: string;
  updated_at?: string;
}

// Additional interfaces to replace 'any' types
interface UpdateQuestionRequest {
  board_question: boolean;
  question_text_id: number;
  question_text_data: {
    question_text: string;
    image_id?: number | null;
    match_pairs?: MatchPairData[];
    mcq_options?: MCQOptionData[];
    answer_text?: string;
  };
  question_topic_data: {
    topic_id: number;
  };
}

interface AdditionalData {
  options?: string[];
  correctOption?: number;
  correctAnswer?: string;
  lhs?: string[];
  rhs?: string[];
}

interface MCQOptionData {
  id?: number;
  option_text: string;
  is_correct: boolean;
  image_id: number | null;
}

interface ExistingMCQOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
}

interface MatchPairData {
  id?: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
}

interface QuestionResponse {
  data: {
    question_type?: {
      id: number;
    };
    question_texts?: Array<{
      id: number;
      mcq_options?: McqOption[];
      match_pairs?: MatchPair[];
    }>;
  };
}

// Define component name
defineOptions({
  name: 'EditQuestion'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const isLoading = ref(true)
const isSubmitting = ref(false)
const questionId = ref<number | undefined>(undefined)
const initialOptions = ref<string[]>([])
const initialCorrectOption = ref<number>(-1)
const initialOptionImages = ref<string[]>([])
const initialOptionImageIds = ref<(number | null)[]>([])
const isPassageGroup = ref(false)
const passageGroupId = ref<number | null>(null)
const passageInitial = ref<{
  passageText: string
  isPyq: boolean
  children: {
    question_text: string
    options: { text: string; is_correct?: boolean }[]
    correctIndex?: number
  }[]
}>({
  passageText: '',
  isPyq: false,
  children: [],
})

// Add new state for image upload modals
const showQuestionImageModal = ref(false)
const showOptionImageModal = ref(false)
const currentOptionIndex = ref<number>(-1)
const questionFormComponent = ref<any>(null)
const currentQuestionData = ref<{
  questionText: string
  questionType: string
  options?: string[]
}>({
  questionText: '',
  questionType: '',
  options: []
})

// Data from localStorage
const questionBankData = ref({
  scope: 'board' as 'board' | 'exam',
  boardId: '',
  boardName: '',
  mediumId: '',
  mediumName: '',
  standardId: '',
  standardName: '',
  subjectId: '',
  subjectName: '',
  chapterId: '',
  chapterName: '',
  topicId: '',
  topicName: '',
  mediumStandardSubjectId: null as number | null,
  programId: '',
  programLabel: '',
  stageId: '',
  stageName: '',
  nodeId: '',
  nodeName: '',
})

const isExamScope = computed(() => {
  const data = questionBankData.value
  return data.scope === 'exam' || (!!data.programId && !!resolveExamChapterId(data))
})

function examDashboardQuery(extra: Record<string, string> = {}): Record<string, string> {
  const q: Record<string, string> = {
    scope: 'exam',
    programId: String(questionBankData.value.programId),
    chapterId: String(questionBankData.value.chapterId || resolveExamChapterId(questionBankData.value) || ''),
    ...extra,
  }
  if (questionBankData.value.stageId) q.stageId = String(questionBankData.value.stageId)
  if (questionBankData.value.subjectId) q.subjectId = String(questionBankData.value.subjectId)
  if (questionBankData.value.topicId) q.topicId = String(questionBankData.value.topicId)
  if (questionBankData.value.mediumId) {
    q.mediumId = String(questionBankData.value.mediumId)
    if (questionBankData.value.mediumName) q.mediumName = questionBankData.value.mediumName
  }
  return q
}

// Add a ref to store the existing MCQ options and match pairs to avoid unnecessary API calls
const existingMcqOptions = ref<ExistingMCQOption[]>([])

// Add a ref to store the existing match pairs
const existingMatchPairs = ref<MatchPairData[]>([])

// Add helper functions for image handling
async function uploadImage(file: File, customWidth?: number, customHeight?: number): Promise<number | null> {
  try {
    // Use the imageService which now supports custom dimensions
    const response = await imageService.uploadImage(file, customWidth, customHeight);
    return response.id;
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    const axiosError = error as AxiosErrorResponse;
    
    if (axiosError.response?.status === 400 && axiosError.response?.data?.message) {
      toastStore.showToast({
        title: 'Image Upload Error',
        message: axiosError.response.data.message,
        type: 'error'
      });
    }
    
    return null;
  }
}

async function deleteImageById(imageId: number): Promise<boolean> {
  try {
    await axiosInstance.delete(`/images/${imageId}`);
    console.log(`Image ${imageId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting image ${imageId}:`, error);
    return false;
  }
}

async function processQuestionImage(
  deleteImageFlag: boolean | undefined, 
  existingImageId: NullableId, 
  imageFile: File | undefined
): Promise<number | null> {
  console.log('=== DEBUG: processQuestionImage ===');
  console.log('deleteImageFlag:', deleteImageFlag);
  console.log('existingImageId:', existingImageId);
  console.log('imageFile:', imageFile);
  
  // Handle image deletion if requested
  if (deleteImageFlag && existingImageId) {
    console.log('Deleting existing image:', existingImageId);
    await deleteImageById(existingImageId);
    return null;
  } 
  
  // Handle image replacement
  if (imageFile) {
    console.log('Processing new image file:', imageFile.name);
    // Delete old image if exists
    if (existingImageId) {
      console.log('Deleting old image before upload:', existingImageId);
      await deleteImageById(existingImageId);
    }
    
    // Upload new image
    console.log('Uploading new image...');
    const newImageId = await uploadImage(imageFile);
    console.log('New image uploaded with ID:', newImageId);
    return newImageId;
  } 
  
  // Keep existing image
  if (existingImageId) {
    console.log('Keeping existing image:', existingImageId);
    return existingImageId;
  }
  
  console.log('No image to process, returning null');
  return null;
}

// Process MCQ options for question type 1
async function processMCQOptions(
  updateQuestionRequest: UpdateQuestionRequest,
  additionalData: AdditionalData,
  existingOptions: ExistingMCQOption[],
  optionImages?: (File | null)[],
  optionImageIds?: (number | null)[],
  optionImageDeleteFlags?: boolean[]
): Promise<void> {
  if (!additionalData.options || !additionalData.correctOption) {
    return;
  }
  
  const options = additionalData.options;
  const correctOption = additionalData.correctOption;
  const mcqOptions = [];

  for (let i = 0; i < options.length; i++) {
    if (!options[i]) continue; // Skip empty options
    
    const option = await createMCQOption(
      i, options[i], i === correctOption,
      existingOptions, optionImages, 
      optionImageIds, optionImageDeleteFlags
    );
    
    mcqOptions.push(option);
  }

  // Assign MCQ options to the request
  updateQuestionRequest.question_text_data.mcq_options = mcqOptions;
}

async function createMCQOption(
  index: number,
  optionText: string,
  isCorrect: boolean,
  existingOptions: ExistingMCQOption[],
  optionImages?: (File | null)[],
  optionImageIds?: (number | null)[],
  optionImageDeleteFlags?: boolean[]
): Promise<MCQOptionData> {
  // Create option object
  const option: MCQOptionData = {
    option_text: optionText,
    is_correct: isCorrect,
    image_id: null
  };

  // If we have an existing option at this index, use its ID
  if (index < existingOptions.length) {
    option.id = existingOptions[index].id;
    
    // Preserve existing image ID if any
    if (existingOptions[index].image_id) {
      option.image_id = existingOptions[index].image_id;
    }
  }

  // Process option image
  option.image_id = await processOptionImage(
    optionImages?.[index],
    existingOptions[index]?.image_id ?? optionImageIds?.[index],
    optionImageDeleteFlags?.[index]
  );

  return option;
}

async function processOptionImage(
  newImage: File | null | undefined,
  existingImageId: NullableId,
  shouldDelete: boolean | undefined
): Promise<number | null> {
  // Delete image if flag is set
  if (shouldDelete) {
    return null;
  }
  
  // Upload new image if provided
  if (newImage) {
    // Delete existing image if any
    if (existingImageId) {
      await deleteImageById(existingImageId);
    }
    
    // Upload new image
    return await uploadImage(newImage);
  }
  
  // Keep existing image ID
  return existingImageId ?? null;
}

function buildUpdateRequest({
  questionTextId, 
  questionText, 
  isPreviousExam, 
  topicId, 
  imageId,
  questionTypeId,
  additionalData
}: {
  questionTextId: number; 
  questionText: string; 
  isPreviousExam: boolean; 
  topicId: number; 
  imageId: number | null;
  questionTypeId: number;
  additionalData: {
    options?: string[];
    correctOption?: number;
    correctAnswer?: string;
    lhs?: string[];
    rhs?: string[];
  };
}): {
  board_question: boolean;
  question_text_id: number;
  question_text_data: {
    question_text: string;
    image_id?: number | null;
    match_pairs?: MatchPairData[];
    mcq_options?: MCQOptionData[];
    answer_text?: string;
  };
  question_topic_data: {
    topic_id: number;
  };
} {
  // Prepare the consolidated update request
  const updateQuestionRequest = {
    board_question: isPreviousExam,
    question_text_id: questionTextId,
    question_text_data: {
      question_text: questionText
    },
    question_topic_data: {
      topic_id: topicId
    }
  };

  // Set image ID if available or explicitly set to null for deletion
  if (imageId !== undefined) {
    updateQuestionRequest.question_text_data.image_id = imageId;
  }

  // Add match pairs if applicable (question types 3 or 5)
  if (additionalData.lhs && additionalData.rhs &&
      (questionTypeId === 5 || questionTypeId === 3)) {
    updateQuestionRequest.question_text_data.match_pairs = [];
  }
  
  // Add MCQ options if applicable (question type 1)
  if (additionalData.options && questionTypeId === 1) {
    updateQuestionRequest.question_text_data.mcq_options = [];
  }
  
  // Add answer text for subjective questions
  if (additionalData.correctAnswer) {
    updateQuestionRequest.question_text_data.answer_text = additionalData.correctAnswer;
  }

  return updateQuestionRequest;
}

// Process match pairs for match question types (3 or 5)
async function processMatchPairs(
  updateQuestionRequest: UpdateQuestionRequest,
  additionalData: AdditionalData,
  existingPairs: MatchPairData[],
  optionImages?: (File | null)[],
  optionImageDeleteFlags?: boolean[]
): Promise<void> {
  if (!additionalData.lhs || !additionalData.rhs) {
    return;
  }
  
  const lhs = additionalData.lhs;
  const rhs = additionalData.rhs;
  const matchPairs = [];

  // Process each pair and any associated images
  const maxLength = Math.max(lhs.length, rhs.length);
  
  for (let i = 0; i < maxLength; i++) {
    // Only create a pair if either left or right text exists
    if (i < lhs.length || i < rhs.length) {
      const pair = await createMatchPair(
        i, lhs, rhs, existingPairs, 
        optionImages, optionImageDeleteFlags
      );
      matchPairs.push(pair);
    }
  }

  // Assign match pairs to the request
  updateQuestionRequest.question_text_data.match_pairs = matchPairs;
}

async function createMatchPair(
  index: number,
  lhs: string[],
  rhs: string[],
  existingPairs: MatchPairData[],
  optionImages?: (File | null)[],
  optionImageDeleteFlags?: boolean[]
): Promise<MatchPairData> {
  const leftText = index < lhs.length ? lhs[index] : '';
  const rightText = index < rhs.length ? rhs[index] : '';
  
  // Create pair object with existing ID if available
  const pair: MatchPairData = {
    left_text: leftText,
    right_text: rightText,
    left_image_id: null,
    right_image_id: null
  };

  // If we have an existing pair at this index, use its ID and images
  if (index < existingPairs.length) {
    pair.id = existingPairs[index].id;
    
    // Preserve existing image IDs
    if (existingPairs[index].left_image_id) {
      pair.left_image_id = existingPairs[index].left_image_id;
    }
    
    if (existingPairs[index].right_image_id) {
      pair.right_image_id = existingPairs[index].right_image_id;
    }
  }

  // Process left image
  pair.left_image_id = await processMatchPairSideImage(
    optionImages?.[index], 
    existingPairs[index]?.left_image_id,
    optionImageDeleteFlags?.[index]
  );

  // Process right image (at index + 10)
  pair.right_image_id = await processMatchPairSideImage(
    optionImages?.[index + 10], 
    existingPairs[index]?.right_image_id,
    optionImageDeleteFlags?.[index + 10]
  );

  return pair;
}

async function processMatchPairSideImage(
  newImage: File | null | undefined,
  existingImageId: NullableId,
  shouldDelete: boolean | undefined
): Promise<number | null> {
  // Early return if delete flag is set or no changes needed
  if (shouldDelete) {
    return null;
  }
  
  // Handle image update case
  if (newImage) {
    try {
      // Only delete the existing image if there is one and a new image is provided
      if (existingImageId) {
        await deleteImageById(existingImageId);
      }
      
      // Upload and return new image ID
      const newImageId = await uploadImage(newImage);
      console.log(`Match pair image uploaded with ID: ${newImageId}`);
      return newImageId;
    } catch (error) {
      console.error('Error processing match pair image:', error);
      // Return existing image ID as fallback in case of upload error
      return existingImageId ?? null;
    }
  }
  
  // No changes - keep existing image
  return existingImageId ?? null;
}

// Handle updating the question
async function handleUpdateQuestion(payload: {
  questionId?: number;
  questionTypeId: number;
  isPreviousExam: boolean;
  topicId: number;
  questionText: string;
  additionalData: AdditionalData;
  imageFile?: File;
  optionImages?: (File | null)[];
  deleteImage?: boolean;
  existingImageId?: number | null;
  optionImageIds?: (number | null)[];
  optionImageDeleteFlags?: boolean[];
}) {
  try {
    // Show loading overlay
    isSubmitting.value = true;

    console.log('=== DEBUG: handleUpdateQuestion payload ===');
    console.log('imageFile:', payload.imageFile);
    console.log('deleteImage:', payload.deleteImage);
    console.log('existingImageId:', payload.existingImageId);

    // Validate question ID
    if (!payload.questionId) {
      toastStore.showToast({
        title: 'Error',
        message: 'Question ID is missing',
        type: 'error'
      });
      isSubmitting.value = false;
      return;
    }

    // First, fetch the question data once to get all associated IDs
    const questionResponse = await axiosInstance.get(`/questions/${payload.questionId}`);
    const questionData = questionResponse.data;

    // Extract the question text ID
    let questionTextId: number | null = null;
    if (questionData.question_texts && questionData.question_texts.length > 0) {
      questionTextId = questionData.question_texts[0].id;
    }

    if (!questionTextId) {
      toastStore.showToast({
        title: 'Error',
        message: 'Question text ID not found',
        type: 'error'
      });
      isSubmitting.value = false;
      return;
    }

    // Process main question image
    console.log('=== DEBUG: Before processQuestionImage ===');
    console.log('deleteImage:', payload.deleteImage);
    console.log('existingImageId:', payload.existingImageId);
    console.log('imageFile:', payload.imageFile);
    
    const imageId = await processQuestionImage(
      payload.deleteImage, 
      payload.existingImageId, 
      payload.imageFile
    );
    
    console.log('=== DEBUG: After processQuestionImage ===');
    console.log('imageId result:', imageId);
    
    if (imageId === null && payload.imageFile) {
      // Critical error in image upload
      console.error('Critical error: imageId is null but imageFile was provided');
      isSubmitting.value = false;
      return;
    }

    // Build update request with basic data
    const updateQuestionRequest = buildUpdateRequest({
      questionTextId,
      questionText: payload.questionText,
      isPreviousExam: payload.isPreviousExam,
      topicId: payload.topicId,
      imageId,
      questionTypeId: payload.questionTypeId,
      additionalData: payload.additionalData
    });

    console.log('=== DEBUG: Final update request ===');
    console.log('updateQuestionRequest:', JSON.stringify(updateQuestionRequest, null, 2));

    // Process MCQ options if applicable
    if (payload.additionalData.options && 
        payload.questionTypeId === 1) {
      
      await processMCQOptions(
        updateQuestionRequest,
        payload.additionalData,
        existingMcqOptions.value ?? [],
        payload.optionImages,
        payload.optionImageIds,
        payload.optionImageDeleteFlags
      );
    }

    // Process match pairs if applicable
    if (payload.additionalData.lhs && 
        payload.additionalData.rhs &&
        (payload.questionTypeId === 5 || payload.questionTypeId === 3)) {
      
      await processMatchPairs(
        updateQuestionRequest,
        payload.additionalData,
        existingMatchPairs.value ?? [],
        payload.optionImages,
        payload.optionImageDeleteFlags
      );
    }

    console.log('=== DEBUG: Final request being sent ===');
    console.log('PUT /questions/edit/' + payload.questionId);
    console.log('Request body:', JSON.stringify(updateQuestionRequest, null, 2));

    // Make a single API call to update the question and all related data
    await axiosInstance.put(`/questions/edit/${payload.questionId}`, updateQuestionRequest);

    // Store the sort option in localStorage to ensure it persists
    localStorage.setItem('questionDashboardSort', 'updated_at_desc');

    // Navigate back to question dashboard with success query param
    router.push({
      name: 'questionDashboard',
      query: isExamScope.value
        ? examDashboardQuery({
            success: 'true',
            message: 'Question updated successfully',
          })
        : {
            success: 'true',
            message: 'Question updated successfully',
            unverified: 'true',
          },
    });
  } catch (error: unknown) {
    // Hide loading overlay
    isSubmitting.value = false;

    // Show error toast using toast store
    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message ?? 'Failed to update question',
      type: 'error'
    });
  }
}

// Add a function to handle the close button click
function handleCloseClick() {
  // Store the sort option in localStorage to ensure it persists
  localStorage.setItem('questionDashboardSort', 'updated_at_desc');

  // Navigate with query parameters
  router.push({
    name: 'questionDashboard',
    query: isExamScope.value ? examDashboardQuery() : { unverified: 'true' },
  });
}

// Extract MCQ data from response
function processMcqQuestionData(response: QuestionResponse) {
  if (!response?.data?.question_type || 
      response.data.question_type.id !== 1 || 
      !response.data.question_texts || 
      response.data.question_texts.length === 0 || 
      !response.data.question_texts[0].mcq_options) {
    return;
  }

  const options = response.data.question_texts[0].mcq_options;

  // Store the existing MCQ options for later use when updating
  existingMcqOptions.value = options.map(opt => ({
    id: opt.id,
    question_text_id: opt.question_text_id,
    option_text: opt.option_text,
    image_id: opt.image_id,
    is_correct: opt.is_correct
  }));

  // Extract option texts
  initialOptions.value = options.map(opt => opt.option_text);

  // Find the correct option index
  const correctIndex = options.findIndex(opt => opt.is_correct === true);
  initialCorrectOption.value = correctIndex;

  // Extract option image URLs and IDs
  initialOptionImages.value = new Array(options.length).fill('');
  initialOptionImageIds.value = new Array(options.length).fill(null);

  // Process each option to extract image data
  for (const [index, option] of options.entries()) {
    if (option?.image?.presigned_url) {
      initialOptionImages.value[index] = option.image.presigned_url;
      initialOptionImageIds.value[index] = option.image.id;
    }
  }

  console.log('Initialized MCQ options:', initialOptions.value);
  console.log('Correct option index:', initialCorrectOption.value);
  console.log('Option images:', initialOptionImages.value);
  console.log('Option image IDs:', initialOptionImageIds.value);
}

// Extract matching pairs data from response 
function processMatchPairsData(response: QuestionResponse) {
  if (!response?.data?.question_type || 
      (response.data.question_type.id !== 3 && response.data.question_type.id !== 5) || 
      !response.data.question_texts || 
      response.data.question_texts.length === 0 || 
      !response.data.question_texts[0].match_pairs) {
    return;
  }

  // Store the match pairs for later use
  existingMatchPairs.value = response.data.question_texts[0].match_pairs.map((pair: MatchPair) => ({
    id: pair.id,
    question_text_id: pair.question_text_id,
    left_text: pair.left_text,
    right_text: pair.right_text,
    left_image_id: pair.left_image_id,
    right_image_id: pair.right_image_id
  }));

  console.log('Stored match pairs:', existingMatchPairs.value);
}

async function loadPassageGroup(groupId: number) {
  const group = await examCatalogService.getPassageGroup(groupId)
  passageGroupId.value = group.id
  isPassageGroup.value = true
  passageInitial.value = {
    passageText: group.passage_text || '',
    isPyq: !!(group.children?.[0]?.board_question),
    children: (group.children || []).map((child: any) => {
      const qt = child.question_texts?.[0]
      const options = (qt?.mcq_options || []).map((opt: any) => ({
        text: opt.option_text || '',
        is_correct: !!opt.is_correct,
      }))
      return {
        question_text: qt?.question_text || '',
        options,
        correctIndex: Math.max(0, options.findIndex((o: { is_correct?: boolean }) => o.is_correct)),
      }
    }),
  }
}

async function handleUpdatePassageGroup(payload: {
  passage_text: string
  is_pyq: boolean
  children: {
    question_text: string
    options: { text: string; is_correct: boolean }[]
    group_order: number
  }[]
}) {
  if (!passageGroupId.value) return
  try {
    isSubmitting.value = true
    const nodeId = Number(
      questionBankData.value.nodeId ||
        questionBankData.value.topicId ||
        questionBankData.value.chapterId ||
        resolveExamChapterId(questionBankData.value) ||
        0,
    )
    const topicId = Number(questionBankData.value.topicId || 0)
    await examCatalogService.updatePassageGroup(passageGroupId.value, {
      passage_text: payload.passage_text,
      board_question: payload.is_pyq,
      ...(isExamScope.value && nodeId ? { syllabus_node_id: nodeId } : {}),
      ...(!isExamScope.value && topicId ? { question_topic_data: { topic_id: topicId } } : {}),
      children: payload.children.map((child) => ({
        question_text: child.question_text,
        group_order: child.group_order,
        mcq_options: child.options.map((opt) => ({
          option_text: opt.text,
          is_correct: opt.is_correct,
        })),
      })),
    })
    localStorage.setItem('questionDashboardSort', 'updated_at_desc')
    toastStore.showToast({
      title: 'Success',
      message: 'Passage group updated successfully',
      type: 'success',
    })
    router.push({
      name: 'questionDashboard',
      query: isExamScope.value
        ? examDashboardQuery({
            success: 'true',
            message: 'Passage group updated successfully',
          })
        : {
            success: 'true',
            message: 'Passage group updated successfully',
            unverified: 'true',
          },
    })
  } catch (error: unknown) {
    const axiosError = error as AxiosErrorResponse
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message ?? 'Failed to update passage group',
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Handle question data fetching
async function fetchQuestionData(id: number) {
  try {
    // Fetch question data to initialize the form
    const response = await axiosInstance.get(`/questions/${id}`);
    console.log('Question data:', response.data);
    const data = response.data?.data ?? response.data
    const groupId = data?.question_group_id ?? data?.question_group?.id ?? null

    if (groupId) {
      await loadPassageGroup(Number(groupId))
      isLoading.value = false
      return
    }

    // Process different question types
    processMcqQuestionData(response);
    processMatchPairsData(response);

    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching question data:', error);
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load question data',
      type: 'error'
    });
    // Redirect back to dashboard if error
    router.push({ name: 'questionDashboard' });
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  
  if (!storedData) {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' });
    return;
  }
  
  questionBankData.value = JSON.parse(storedData);

  // Get the question ID from the route params
  if (route.params.id) {
    questionId.value = Number.parseInt(route.params.id as string, 10);
    await fetchQuestionData(questionId.value);
  } else {
    // Redirect back to dashboard if no question ID
    router.push({ name: 'questionDashboard' });
  }
});

// Add methods for ImageUploadEditor
function openQuestionImageModal(data: { questionText: string; questionType: string; options?: string[] }) {
  currentQuestionData.value = data
  showQuestionImageModal.value = true
}

function openOptionImageModal(data: { questionText: string; questionType: string; options?: string[]; optionIndex: number }) {
  currentQuestionData.value = data
  currentOptionIndex.value = data.optionIndex
  showOptionImageModal.value = true
}

function handleQuestionImageUploaded(imageData: any) {
  // Handle uploaded question image
  console.log('Question image uploaded:', imageData);
  showQuestionImageModal.value = false;
  
  // Pass the uploaded image file to the QuestionFormComponent
  if (questionFormComponent.value && imageData.file) {
    // Call a method on the QuestionFormComponent to set the image
    questionFormComponent.value.setUploadedQuestionImage(imageData.file, imageData.id, imageData.url);
  }
}

function handleOptionImageUploaded(imageData: any) {
  // Handle uploaded option image
  console.log('Option image uploaded for index:', currentOptionIndex.value, imageData);
  showOptionImageModal.value = false;
  
  // Pass the uploaded image file to the QuestionFormComponent
  if (questionFormComponent.value && imageData.file && currentOptionIndex.value >= 0) {
    // Call a method on the QuestionFormComponent to set the option image
    questionFormComponent.value.setUploadedOptionImage(imageData.file, currentOptionIndex.value, imageData.id, imageData.url);
  }
}

function handleQuestionImageCancelled() {
  // Handle cancelled question image
  console.log('Question image cancelled')
  showQuestionImageModal.value = false
  
  // Emit a custom event that the QuestionFormComponent can listen to
  globalThis.dispatchEvent(new CustomEvent('clearQuestionImage'))
}

function handleOptionImageCancelled() {
  console.log('Option image upload cancelled');
  showOptionImageModal.value = false;
  // Emit custom event with optionIndex
  const event = new CustomEvent('clearOptionImage', { 
    detail: { optionIndex: currentOptionIndex.value } 
  });
  globalThis.dispatchEvent(event);
}
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}
</style>
