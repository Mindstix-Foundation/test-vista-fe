<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="closeLink" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 ">
          <template v-if="isExamScope">
            <p class="text-muted text-start fs-5 m-0">
              {{ questionBankData.programLabel }}
              <span v-if="questionBankData.mediumName"> | {{ questionBankData.mediumName }}</span>
            </p>
            <h4 class="fw-bolder text-start text-dark m-0 ">
              {{ questionBankData.nodeName }}
              <span class="d-block text-start text-secondary">Competitive / Entrance syllabus</span>
            </h4>
          </template>
          <template v-else>
            <p class="text-muted text-start fs-5 m-0">
              <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
              <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
            </p>
            <h4 class="fw-bolder text-start text-dark m-0 ">
              Standard {{ questionBankData.standardName }}
              <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
            </h4>
          </template>
          <h4 class="text-left fw-bolder text-uppercase mb-2" id="pageHeader">Edit Translation</h4>
        </div>
      </div>
      <hr>
    </div>
    <div id="questionsSection" class="container">
      <!-- Loading spinner in content area -->
      <div v-if="isInitialLoading" class="row justify-content-center my-5">
        <div class="col-12 col-sm-10 text-center">
          <output
            class="spinner-border text-primary d-inline-block"
            style="width: 3rem; height: 3rem;"
          >
            <span class="visually-hidden">Loading translation data...</span>
          </output>
          <p class="mt-3 text-primary">Loading translation data...</p>
        </div>
      </div>

      <!-- Only show content when loading is complete -->
      <div v-if="!isInitialLoading">
      <!-- New Section: Language Selector for available translations -->
      <div class="container mb-4" v-if="availableTranslations.length > 0">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10">
            <div class="card border-light shadow-sm language-selector-container">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="m-0">Available Translations</h6>
                <span class="badge bg-primary">{{ availableTranslations.length }} languages</span>
              </div>
              <div class="card-body p-3">
                <div class="d-flex flex-wrap gap-2 translation-buttons">
                  <button
                    v-for="(translation, index) in availableTranslations"
                    :key="translation.id"
                    class="btn btn-sm translation-btn"
                    :class="[
                      selectedTranslationIndex === index ? 'btn-dark active' :
                      translation.translation_status === 'original' ? 'btn-outline-success' : 'btn-outline-info'
                    ]"
                    @click="changeTranslation(index)"
                  >
                    <span class="badge bg-light text-dark me-1 language-badge">{{ translation.medium.instruction_medium }}</span>
                    <i class="bi bi-translate"></i>
                    <span
                      v-if="translation.translation_status"
                      class="badge"
                      :class="translation.translation_status === 'original' ? 'bg-success ms-1' : 'bg-info ms-1'"
                    >
                      {{ translation.translation_status === 'original' ? 'Original' : 'Translated' }}
                    </span>
                  </button>
                </div>
                <div class="mt-3" v-if="selectedTranslationIndex >= 0">
                  <div class="alert alert-light border">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <span class="fw-bold">Currently viewing:</span>
                        <span class="badge bg-info text-dark">{{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}</span> version
                        <span
                          v-if="availableTranslations[selectedTranslationIndex].translation_status"
                          class="badge ms-2"
                          :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success' : 'bg-info'"
                        >
                          {{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state for when no other translations are available -->
      <div class="container mb-4" v-else>
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10">
            <div class="card border-light shadow-sm">
              <div class="card-body p-3 text-center">
                <i class="bi bi-translate text-muted fs-1"></i>
                <p class="mb-0 mt-2 text-muted">No other language translations are available for reference.</p>
                <p class="small text-muted">You are currently editing the {{ questionBankData.mediumName }} translation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Descriptive Questions Form (including Fill in the Blanks) -->
      <div class="container" id="descriptiveQuestion" v-show="questionType === 'True or False' ||
                                               questionType === 'Give Scientific Reasons' ||
                                               questionType === 'Short Answer Question' ||
                                               questionType === 'Complete and Identify Reaction' ||
                                               questionType === 'Short Note' ||
                                               questionType === 'Fill in the Blanks' ||
                                               questionType === 'Odd One Out' ||
                                               questionType === 'Complete the Correlation' ||
                                               questionType === 'One-Word Answer'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="updateTranslation">
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
                <textarea id="questionTranslate" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

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

                <!-- Preview of new image when selected (before upload) -->
                <div v-if="newImageSelected && questionImagePreview" class="question-image-container mb-3 mt-2">
                  <img
                    :src="questionImagePreview"
                    class="question-image"
                    alt="New Question Preview"
                  />
                  <div class="preview-indicator">
                    <span class="badge bg-info">Preview - Will be uploaded on save</span>
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="question" v-model="translatedQuestion.question" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
                  <label for="question" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
                </div>
                <!-- Only show image upload if the original question has an image -->
                <div class="input-group input-group-sm mb-3" v-if="questionImage">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                  <span class="input-group-text text-muted small">
                    <i class="bi bi-info-circle me-1"></i>
                    Original has image
                  </span>
                </div>

                  <!-- Only show Insert Blank button for Fill in the Blanks question type -->
                  <div class="col text-end" v-if="questionType === 'Fill in the Blanks'">
                    <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" @click="insertBlank">Insert Blank</button>
                  </div>
              </div>
              <div class="mt-5 text-center">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
                  {{ isSaving ? 'Updating...' : 'Update' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- MCQ Questions Form -->
      <div class="container" id="mcqQuestion" v-show="questionType === 'Multiple Choice Question (MCQ)'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="updateTranslation">
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
                <textarea id="mcqTextTranslate" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

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

                <!-- Preview of new image when selected (before upload) -->
                <div v-if="newImageSelected && questionImagePreview" class="question-image-container mb-3 mt-2">
                  <img
                    :src="questionImagePreview"
                    class="question-image"
                    alt="New Question Preview"
                  />
                  <div class="preview-indicator">
                    <span class="badge bg-info">Preview - Will be uploaded on save</span>
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="mcqText" v-model="translatedQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
                  <label for="mcqText" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
                </div>
                <!-- Only show image upload if the original question has an image -->
                <div class="input-group input-group-sm mb-3" v-if="questionImage">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                  <span class="input-group-text text-muted small">
                    <i class="bi bi-info-circle me-1"></i>
                    Original has image
                  </span>
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
                      <h6 class="text-muted">{{ questionBankData.mediumName }} Options (Translation)</h6>
                    </div>
                    <hr class="mt-0">
                  </div>
                  <div class="col-md-6" v-for="(option, index) in originalOptions" :key="index">
                    <!-- Original Option with Image (Left Side) -->
                    <div class="card mb-2 border-light">
                      <div class="card-body p-2">
                        <div class="form-floating mb-2">
                          <input type="text" :value="option" readonly class="form-control" :id="'option' + (index + 1) + 'Translate'">
                          <label :for="'option' + (index + 1) + 'Translate'" class="small">
                            Option {{ String.fromCodePoint(65 + index) }}
                            <span v-if="originalOptionIsCorrect[index]" class="badge bg-success ms-1">Correct</span>
                          </label>
                        </div>

                        <!-- Original Option Image -->
                        <div v-if="originalOptionImages && originalOptionImages[index]" class="option-image-container mb-2">
                          <div v-if="optionImageLoading[index]" class="image-loading-overlay">
                            <output class="spinner-border spinner-border-sm text-primary">
                              <span class="visually-hidden">Loading image...</span>
                            </output>
                          </div>
                          <img
                            :src="originalOptionImages[index]"
                            class="option-image"
                            alt="Option"
                            @load="handleOptionImageLoad(index)"
                            @error="handleOptionImageError(index)"
                          />
                          <div v-if="optionImageError[index]" class="image-error-message small">
                            <i class="bi bi-exclamation-triangle"></i>
                            Failed to load image
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Translated Option with Image Upload (Right Side) -->
                    <div class="form-floating mb-2">
                      <input type="text" v-model="translatedOptions[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                      <label :for="'option' + (index + 1)">
                        Option {{ String.fromCodePoint(65 + index) }}
                        <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                        <span v-if="originalOptionIsCorrect[index]" class="badge bg-success ms-1">Correct</span>
                      </label>
                    </div>
                    <!-- Only show image upload if there's an original image for this option -->
                    <div class="input-group input-group-sm mb-3" v-if="originalOptionImages && originalOptionImages[index]">
                      <input type="file" class="form-control" :id="'optionImage' + (index + 1)" accept="image/*" @change="e => handleOptionImageChange(e, index)">
                      <button v-if="optionImagePreviews && optionImagePreviews[index]" class="btn btn-outline-secondary" type="button" @click="clearOptionImage(index)">
                        <i class="bi bi-x-circle"></i>
                      </button>
                      <span v-else class="input-group-text text-muted small">
                        <i class="bi bi-info-circle me-1"></i>
                        Original image preserved
                      </span>
                    </div>

                    <!-- Preview of selected image for translation -->
                    <div v-if="optionImagePreviews && optionImagePreviews[index]" class="option-image-preview-container mb-3">
                      <img :src="optionImagePreviews[index]" class="option-image-preview" alt="Option Preview">
                      <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="clearOptionImage(index)">
                        <i class="bi bi-x"></i>
                      </button>
                      <div class="preview-indicator">
                        <span class="badge bg-info small">Preview - Will be uploaded on save</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
                  {{ isSaving ? 'Updating...' : 'Update' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Match the Pairs Questions Form -->
      <div class="container" id="matchPairQuestion" v-show="questionType === 'Match the Pairs'">
        <div class="row justify-content-center">
          <div class="col col-12 col-sm-10 ">
            <form @submit.prevent="updateTranslation">
              <div class="mb-3">
                <label for="translateMatchPairs" class="form-label">
                  Original Question
                  <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                        class="badge ms-2"
                        :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
                    {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                    ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
                  </span>
                </label>
                <textarea id="translateMatchPairs" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

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

                <!-- Preview of new image when selected (before upload) -->
                <div v-if="newImageSelected && questionImagePreview" class="question-image-container mb-3 mt-2">
                  <img
                    :src="questionImagePreview"
                    class="question-image"
                    alt="New Question Preview"
                  />
                  <div class="preview-indicator">
                    <span class="badge bg-info">Preview - Will be uploaded on save</span>
                  </div>
                </div>

                <div class="form-floating">
                  <textarea id="matchPairsQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                            placeholder="Type your Match the Pairs question here..." @input="autoResize" required></textarea>
                  <label for="matchPairsQuestion" class="form-label">
                    Translated Question
                    <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                  </label>
                </div>
                <!-- Only show image upload if the original question has an image -->
                <div class="input-group input-group-sm mb-3" v-if="questionImage">
                  <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                  <span class="input-group-text text-muted small">
                    <i class="bi bi-info-circle me-1"></i>
                    Original has image
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <h6 class="text-muted mb-3">Original Matching Pairs</h6>
                
                <!-- Display original match pairs in a more readable format -->
                <div v-for="(pair, index) in originalMatchPairs" :key="'original-pair-'+index" class="match-pair-row mb-3">
                  <div class="card border-light shadow-sm">
                    <div class="card-body p-3">
                <div class="row g-3">
                        <!-- Left Side Item -->
                        <div class="col-md-5">
                          <div class="d-flex align-items-center">
                            <div class="option-letter me-2">
                              {{ String.fromCodePoint(65 + index) }}
                    </div>
                            <div class="option-text flex-grow-1">
                              <strong>{{ pair.left_text || '' }}</strong>
                  </div>
                                </div>

                          <!-- Left image if available -->
                          <div v-if="originalMatchPairLeftImages[index]" class="pair-image-container mt-2">
                            <div v-if="pairLeftImageLoading[index]" class="image-loading-overlay">
                              <output class="spinner-border spinner-border-sm text-primary">
                                <span class="visually-hidden">Loading image...</span>
                              </output>
                                </div>
                            <img 
                              v-if="originalMatchPairLeftImages[index]"
                              :src="originalMatchPairLeftImages[index]"
                              class="pair-image"
                              alt="Left Item"
                              @load="() => handlePairLeftImageLoad(index)"
                              @error="() => handlePairLeftImageError(index)"
                            />
                            <div v-if="pairLeftImageError[index]" class="image-error-message small">
                              <i class="bi bi-exclamation-triangle"></i>
                              Failed to load image
                              </div>
                            </div>
                          </div>

                        <!-- Arrow between left and right -->
                        <div class="col-md-2 d-flex align-items-center justify-content-center">
                          <div class="match-arrow-circle">
                            <i class="bi bi-arrows-angle-expand"></i>
                        </div>
                      </div>

                        <!-- Right Side Item -->
                        <div class="col-md-5">
                          <div class="d-flex align-items-center">
                            <div class="option-text flex-grow-1">
                              <strong>{{ pair.right_text || '' }}</strong>
                            </div>
                          </div>

                          <!-- Right image if available -->
                          <div v-if="originalMatchPairRightImages[index]" class="pair-image-container mt-2">
                            <div v-if="pairRightImageLoading[index]" class="image-loading-overlay">
                              <output class="spinner-border spinner-border-sm text-primary">
                                <span class="visually-hidden">Loading image...</span>
                              </output>
                            </div>
                            <img 
                              v-if="originalMatchPairRightImages[index]"
                              :src="originalMatchPairRightImages[index]"
                              class="pair-image"
                              alt="Right Item"
                              @load="() => handlePairRightImageLoad(index)"
                              @error="() => handlePairRightImageError(index)"
                            />
                            <div v-if="pairRightImageError[index]" class="image-error-message small">
                              <i class="bi bi-exclamation-triangle"></i>
                              Failed to load image
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Translation section for match pairs -->
                <h6 class="text-muted mb-3 mt-4">Translation of Match Pairs</h6>
                <div v-for="(pair, index) in originalMatchPairs" :key="'translation-pair-'+index" class="match-pair-translation-row mb-4">
                  <div class="card border-light shadow-sm">
                    <div class="card-header bg-light">
                      <strong>Pair {{ index + 1 }}</strong>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-3" :class="{'justify-content-end': !pair.left_text}">
                        <!-- Left Side Translation - Only show if original has left text -->
                        <template v-if="pair.left_text">
                          <div class="col-md-5">
                            <label :for="'lhs-' + index" class="form-label">
                              Left Side {{ String.fromCodePoint(65 + index) }}
                                <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                              </label>
                            <textarea 
                              v-model="translatedMatchPairs[index].left_text" 
                              class="form-control" 
                              :id="'lhs-' + index" 
                              rows="2"
                              :placeholder="'Translate: ' + (pair.left_text || '')" 
                              required
                              @input="autoResize"
                            ></textarea>
                            
                            <!-- Left image upload if original has image -->
                            <div v-if="originalMatchPairLeftImages && originalMatchPairLeftImages[index]" class="mt-2">
                              <div class="input-group input-group-sm">
                                <input 
                                  type="file" 
                                  class="form-control" 
                                  :id="'leftPairImage' + index" 
                                  accept="image/*" 
                                  @change="e => handlePairLeftImageChange(e, index)"
                                >
                                <button 
                                  v-if="pairLeftImagePreviews[index]" 
                                  class="btn btn-outline-secondary" 
                                  type="button" 
                                  @click="clearPairLeftImage(index)"
                                >
                                  <i class="bi bi-x-circle"></i>
                                </button>
                              </div>
                              
                              <!-- Preview of selected image -->
                              <div v-if="pairLeftImagePreviews[index]" class="pair-image-preview-container mt-2">
                                <img :src="pairLeftImagePreviews[index]" class="pair-image-preview" alt="Left Item Preview">
                                <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="clearPairLeftImage(index)">
                                  <i class="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Arrow - Only show if there's a left text -->
                          <div class="col-md-2 d-flex align-items-center justify-content-center">
                            <div class="match-arrow-circle">
                              <i class="bi bi-arrows-angle-expand"></i>
                            </div>
                          </div>
                        </template>

                        <!-- Right Side Translation - Adjust column size based on whether there's a left text -->
                        <div :class="[
                          pair.left_text ? 'col-md-5' : 'col-md-5 ms-auto',
                          {'offset-md-5': !pair.left_text}
                        ]">
                          <label :for="'rhs-' + index" class="form-label">
                            Right Side {{ index + 1 }}
                                <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                              </label>
                          <textarea 
                            v-model="translatedMatchPairs[index].right_text" 
                            class="form-control" 
                            :id="'rhs-' + index" 
                            rows="2"
                            :placeholder="'Translate: ' + (pair.right_text || '')" 
                            required
                            @input="autoResize"
                          ></textarea>
                          
                          <!-- Right image upload if original has image -->
                          <div v-if="originalMatchPairRightImages && originalMatchPairRightImages[index]" class="mt-2">
                            <div class="input-group input-group-sm">
                              <input 
                                type="file" 
                                class="form-control" 
                                :id="'rightPairImage' + index" 
                                accept="image/*" 
                                @change="e => handlePairRightImageChange(e, index)"
                              >
                              <button 
                                v-if="pairRightImagePreviews[index]" 
                                class="btn btn-outline-secondary" 
                                type="button" 
                                @click="clearPairRightImage(index)"
                              >
                                <i class="bi bi-x-circle"></i>
                              </button>
                            </div>
                            
                            <!-- Preview of selected image -->
                            <div v-if="pairRightImagePreviews[index]" class="pair-image-preview-container mt-2">
                              <img :src="pairRightImagePreviews[index]" class="pair-image-preview" alt="Right Item Preview">
                              <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="clearPairRightImage(index)">
                                <i class="bi bi-x"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-3">
                <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                  <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
                  {{ isSaving ? 'Updating...' : 'Update' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Keep the fullscreen loading overlay only for saving operations -->
    <div v-if="isFullscreenLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <output class="spinner-border text-light" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Updating translation...</span>
      </output>
    </div>

    <!-- Image Upload Editor Modals -->
    <ImageUploadEditor
      :show="showQuestionImageModal"
      :imageType="'question'"
      :questionText="translatedQuestion.question"
      :questionNumber="1"
      @close="showQuestionImageModal = false"
      @image-uploaded="handleQuestionImageUploaded"
    />

    <ImageUploadEditor
      :show="showOptionImageModal"
      :imageType="'option'"
      :questionText="translatedQuestion.question"
      :questionNumber="1"
      @close="showOptionImageModal = false"
      @image-uploaded="handleOptionImageUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'
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

// Component name (for linter)
defineOptions({
  name: 'EditTranslation'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

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
  mediumStandardSubjectId: null as number | null,
  programId: '',
  programLabel: '',
  nodeId: '',
  nodeName: '',
})

const isExamScope = computed(() => {
  const data = questionBankData.value
  return data.scope === 'exam' || (!!data.programId && !!resolveExamChapterId(data))
})

function examDashboardQuery(extra: Record<string, string | undefined> = {}) {
  return {
    scope: 'exam',
    programId: String(questionBankData.value.programId),
    chapterId: String(
      questionBankData.value.chapterId || resolveExamChapterId(questionBankData.value) || '',
    ),
    ...(questionBankData.value.stageId ? { stageId: String(questionBankData.value.stageId) } : {}),
    ...(questionBankData.value.subjectId ? { subjectId: String(questionBankData.value.subjectId) } : {}),
    ...((questionBankData.value as { topicId?: string }).topicId
      ? { topicId: String((questionBankData.value as { topicId?: string }).topicId) }
      : {}),
    ...(questionBankData.value.mediumId
      ? {
          mediumId: String(questionBankData.value.mediumId),
          ...(questionBankData.value.mediumName
            ? { mediumName: questionBankData.value.mediumName }
            : {}),
        }
      : {}),
    ...extra,
  }
}

const closeLink = computed(() => {
  if (isExamScope.value) {
    return { name: 'questionDashboard', query: examDashboardQuery() }
  }
  return { name: 'questionDashboard' }
})

function questionDashboardQuery(extra: Record<string, string | undefined> = {}) {
  if (isExamScope.value) {
    return examDashboardQuery(extra)
  }
  return extra
}

function navigateToQuestionDashboard(extra: Record<string, string | undefined> = {}) {
  router.push({
    name: 'questionDashboard',
    query: questionDashboardQuery(extra),
  })
}

// Define interfaces for image handling
interface QuestionImage {
  id: number;
  presigned_url?: string;
  image_url?: string;
}

// Update interface for QuestionTranslation to include match_pairs
interface QuestionTranslation {
  id: number;
  question_text: string;
  image_id: number | null;
  image: QuestionImage | null;
  medium: {
    id: number;
    instruction_medium: string;
  };
  translation_status: string;
  mcq_options?: McqOption[];
  match_pairs?: MatchPair[];
  answer_text?: string; // For "Fill in the Blanks" and other question types with a specific answer
}

// Question data
const questionId = ref<number | null>(null)
const questionType = ref('')
const originalQuestion = ref('')
const originalOptions = ref<string[]>([])
const translatedQuestion = ref({
  question: '',
  type: '',
  id: null as number | null // Added for editing existing translation
})
const translatedOptions = ref<string[]>(['', '', '', ''])
const questionImage = ref<QuestionImage | null>(null)
const imageLoading = ref(false)
const imageError = ref(false)

// Add direct reference to the selected file for the main question
const selectedQuestionFile = ref<File | null>(null)
// Add references for option files
const selectedOptionFiles = ref<(File | null)[]>([])

// New data for multiple translations
const availableTranslations = ref<QuestionTranslation[]>([])
const selectedTranslationIndex = ref<number>(0)
// Track the translation we're editing
const editingTranslationIndex = ref<number>(-1)
const topicId = ref<number | null>(null)

// Track if a new image is selected and its preview
const newImageSelected = ref(false)
const questionImagePreview = ref<string | null>(null)

// Update the McqOption interface to include all fields we need
interface McqOption {
  id?: number;
  question_text_id?: number;
  option_text: string;
  is_correct: boolean;
  image_id?: number | null;
  image?: {
    id: number;
    presigned_url?: string;
    image_url?: string;
  } | null;
}

// Interface for matching pairs
interface MatchPair {
  id?: number;
  left_text: string;
  right_text: string;
  left_image_id?: number;
  right_image_id?: number;
  left_image?: {
    id: number;
    presigned_url?: string;
    image_url?: string;
  } | null;
  right_image?: {
    id: number;
    presigned_url?: string;
    image_url?: string;
  } | null;
}

// Add loading states
const isSaving = ref(false)
const isFullscreenLoading = ref(false)

// Add new state for matching pairs if we need to handle this question type
const originalMatchPairs = ref<Array<{ left_text: string; right_text: string }>>([])
const translatedMatchPairs = ref<Array<{ left_text: string; right_text: string }>>([])

// New states for option images
const originalOptionImages = ref<(string | null)[]>([])
const optionImageLoading = ref<boolean[]>([])
const optionImageError = ref<boolean[]>([])
const originalOptionIsCorrect = ref<boolean[]>([])
const optionImageIds = ref<(number | null)[]>([]) // To store original image IDs
const optionImagePreviews = ref<(string | null)[]>([]) // Add this for previewing selected images

// Add states for match pair images
const originalMatchPairLeftImages = ref<(string | null)[]>([])
const originalMatchPairRightImages = ref<(string | null)[]>([])
const pairLeftImageLoading = ref<boolean[]>([])
const pairLeftImageError = ref<boolean[]>([])
const pairRightImageLoading = ref<boolean[]>([])
const pairRightImageError = ref<boolean[]>([])
const pairLeftImagePreviews = ref<(string | null)[]>([])
const pairRightImagePreviews = ref<(string | null)[]>([])
const pairLeftImageIds = ref<(number | null)[]>([])
const pairRightImageIds = ref<(number | null)[]>([])
const selectedPairLeftFiles = ref<(File | null)[]>([])
const selectedPairRightFiles = ref<(File | null)[]>([])

// Add this near the top of the file, with other type definitions
const QUESTION_TYPES = {
  MCQ: 'Multiple Choice Question (MCQ)',
  ODD_ONE_OUT: 'Odd One Out',
  TRUE_FALSE: 'True or False',
  MATCH_PAIRS: 'Match the Pairs',
  COMPLETE_CORRELATION: 'Complete the Correlation'
} as const;

// Add loading state for initial data fetch
const isInitialLoading = ref(true)

// Modal states for ImageUploadEditor
const showQuestionImageModal = ref(false)
const showOptionImageModal = ref(false)
const currentOptionIndex = ref(0)

// Methods
function autoResize(event: Event) {
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

// Add image handling methods
function handleImageError() {
  imageLoading.value = false;
  imageError.value = true;
  console.error('Failed to load question image');
}

// Update handleImageChange to store the file reference
function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Store the actual file reference for later upload
    selectedQuestionFile.value = input.files[0];

    // Set flag that a new image is selected
    newImageSelected.value = true;

    // Create a preview URL for visual feedback
    const file = input.files[0];
    questionImagePreview.value = URL.createObjectURL(file);

    // Explicitly log image details to verify selection
    console.log(`New image selected: ${file.name} (${file.size} bytes, ${file.type})`);
    console.log('newImageSelected flag is now:', newImageSelected.value);
    console.log('File reference stored directly:', !!selectedQuestionFile.value);

    // Show a toast notification to indicate image is selected (not yet uploaded)
    toastStore.showToast({
      title: 'Image Selected',
      message: 'Image will be uploaded when you click Update',
      type: 'info'
    });
  } else {
    // Reset to show original image if file selection is canceled
    selectedQuestionFile.value = null;
    newImageSelected.value = false;
    questionImagePreview.value = null;
    console.log('Image selection was cleared');
  }
}

// Helper function to handle image upload
async function uploadImage(file, customWidth?: number, customHeight?: number) {
  const formData = new FormData();
  formData.append('file', file);

  // Add custom dimensions if provided
  if (customWidth !== undefined) {
    formData.append('width', customWidth.toString());
  }
  if (customHeight !== undefined) {
    formData.append('height', customHeight.toString());
  }
  
  // STEP 1: Upload the image to get the complete image data
  console.log("STEP 1: Calling /images/upload API...");
  const response = await axiosInstance.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000
  });
  
  if (!response?.data?.id) {
    throw new Error("Upload response is missing image id");
  }
  
  return response.data.id;
}

// Helper to process main question image
async function processMainQuestionImage(initialImageId) {
  let mainImageId = initialImageId;
  
  if (selectedQuestionFile.value) {
    console.log('New image file reference found. Starting upload process...');
    try {
      mainImageId = await uploadImage(selectedQuestionFile.value);
      console.log('NEW IMAGE ID CREATED:', mainImageId);
    } catch (uploadError) {
      handleImageUploadError(uploadError);
      return null; // Return null to indicate error
    }
  }
  
  return mainImageId;
}

// Separate function to handle image upload errors
function handleImageUploadError(error: unknown) {
  console.error('Error in image upload process:', error);
  const axiosError = error as AxiosErrorResponse;
  if (axiosError.response?.status === 400 && axiosError.response?.data?.message) {
    isSaving.value = false;
    isFullscreenLoading.value = false;
    toastStore.showToast({
      title: 'Image Upload Error',
      message: axiosError.response.data.message,
      type: 'error'
    });
  }
}

// Helper to generate MCQ options data
async function generateMcqOptionsData() {
  if (!(
    (questionType.value === QUESTION_TYPES.MCQ ||
     questionType.value === QUESTION_TYPES.ODD_ONE_OUT ||
     questionType.value === QUESTION_TYPES.TRUE_FALSE) &&
    translatedOptions.value.length > 0
  )) {
    return null;
  }
  
  const mcqOptions = [];
  
  // Find both the original translation and the translation we're editing
  const originalTranslation = availableTranslations.value[selectedTranslationIndex.value];
  const translationToEdit = availableTranslations.value.find(
    (text) => text.id === translatedQuestion.value.id
  );
  
  for (let i = 0; i < translatedOptions.value.length; i++) {
    if (!translatedOptions.value[i].trim()) continue;
    
    const originalOption = originalTranslation?.mcq_options?.[i];
    const existingOption = translationToEdit?.mcq_options?.[i];
    
    const optionData = await processMcqOption(i, originalOption, existingOption);
    mcqOptions.push(optionData);
  }
  
  return mcqOptions;
}

// Helper for processing individual MCQ options
async function processMcqOption(index, originalOption, existingOption) {
  const optionData = {
    option_text: translatedOptions.value[index],
    is_correct: originalOption ? originalOption.is_correct : false
  };
  
  // Use the ID from the translation we're editing if it exists
  if (existingOption?.id) {
    optionData.id = existingOption.id;
  }
  
  // Handle new option images
  if (selectedOptionFiles.value?.[index]) {
    try {
      const file = selectedOptionFiles.value[index]!;
      const imageId = await uploadImage(file);
      if (imageId) {
        optionData.image_id = imageId;
      }
    } catch (error) {
      console.error(`Error uploading image for option ${index + 1}:`, error);
    }
  } else if (existingOption?.image_id) {
    // Preserve existing image ID from the translation we're editing
    optionData.image_id = existingOption.image_id;
  }
  
  return optionData;
}

// Helper to generate match pairs data
async function generateMatchPairsData() {
  if (!(
    (questionType.value === QUESTION_TYPES.MATCH_PAIRS ||
     questionType.value === QUESTION_TYPES.COMPLETE_CORRELATION) &&
    translatedMatchPairs.value.length > 0
  )) {
    return null;
  }
  
  const matchPairs = [];
  
  // Find the translation we're editing
  const translationToEdit = availableTranslations.value.find(
    (text) => text.id === translatedQuestion.value.id
  );
  
  for (let i = 0; i < translatedMatchPairs.value.length; i++) {
    const pair = translatedMatchPairs.value[i];
    const existingPair = translationToEdit?.match_pairs?.[i];
    
    const pairData = await processMatchPair(i, pair, existingPair);
    matchPairs.push(pairData);
  }
  
  return matchPairs;
}

// Helper for processing individual match pairs
async function processMatchPair(index, pair, existingPair) {
  const pairData = {
    left_text: pair.left_text || '',
    right_text: pair.right_text || ''
  };
  
  // Add pair ID if it exists (for updating existing pairs)
  if (existingPair?.id) {
    pairData.id = existingPair.id;
  }
  
  // Process left image
  await processMatchPairImage(
    index, 
    pairData, 
    'left', 
    `leftPairImage${index}`,
    originalMatchPairLeftImages.value[index] !== null,
    pairLeftImageIds.value[index]
  );
  
  // Process right image
  await processMatchPairImage(
    index, 
    pairData, 
    'right', 
    `rightPairImage${index}`,
    originalMatchPairRightImages.value[index] !== null,
    pairRightImageIds.value[index]
  );
  
  return pairData;
}

// Helper for processing match pair images (left or right)
async function processMatchPairImage(index, pairData, side, inputId, originalHasImage, existingImageId) {
  const imageInput = document.getElementById(inputId) as HTMLInputElement;
  const hasNewImage = imageInput?.files && imageInput.files.length > 0;
  
  if (originalHasImage && existingImageId !== null) {
    if (hasNewImage && imageInput.files) {
      try {
        const imageId = await uploadImage(imageInput.files[0]);
        pairData[`${side}_image_id`] = imageId;
      } catch (error) {
        console.error(`Error uploading ${side} pair image:`, error);
        // If upload fails, use original image ID since we must maintain consistency
        pairData[`${side}_image_id`] = existingImageId;
      }
    } else {
      // No new image uploaded, use original image ID
      pairData[`${side}_image_id`] = existingImageId;
    }
  } else if (hasNewImage) {
    // Original has no image, warn user and skip image upload
    toastStore.showToast({
      title: 'Warning',
      message: `Cannot add ${side} image to pair ${index + 1} when original pair has no ${side} image`,
      type: 'warning'
    });
  }
}

// Helper to validate question data before saving
function validateQuestionData() {
  if (!questionId.value) {
    toastStore.showToast({
      title: 'Error',
      message: 'Question ID is missing',
      type: 'error'
    });
    return false;
  }

  if (!translatedQuestion.value.id) {
    toastStore.showToast({
      title: 'Error',
      message: 'Translation not found for editing',
      type: 'error'
    });
    return false;
  }
  
  return true;
}

// Helper to prepare question data object
function prepareQuestionTextData(mainImageId, mcqOptions, matchPairs) {
  const questionTextData = {
    question_text: translatedQuestion.value.question
  };

  // Add image ID if available
  if (mainImageId) {
    questionTextData.image_id = mainImageId;
  }
  
  // Add MCQ options if available
  if (mcqOptions) {
    questionTextData.mcq_options = mcqOptions;
  }
  
  // Add match pairs if available
  if (matchPairs) {
    questionTextData.match_pairs = matchPairs;
  }
  
  return questionTextData;
}

// Main method to update an existing translation - refactored for lower complexity
async function updateTranslation() {
  try {
    console.log("Starting updateTranslation method");
    
    // Step 1: Validate question data
    if (!validateQuestionData()) {
      return;
    }
    
    // Step 2: Set loading states
    isSaving.value = true;
    isFullscreenLoading.value = true;
    
    // Step 3: Process main question image
    let mainImageId = questionImage.value?.id ?? null;
    try {
      mainImageId = await processMainQuestionImage(mainImageId);
    } catch {
      return; // Error already handled in the function
    }
    
    // Step 4: Process MCQ options if needed
    const mcqOptions = await generateMcqOptionsData();
    
    // Step 5: Process match pairs if needed
    const matchPairs = await generateMatchPairsData();
    
    // Step 6: Prepare question text data
    const questionTextData = prepareQuestionTextData(mainImageId, mcqOptions, matchPairs);
    
    // Step 7: Prepare the final request payload
    const updatePayload = {
      board_question: false, // Since this is a translation, we don't modify board_question status
      question_text_id: translatedQuestion.value.id,
      question_text_data: questionTextData,
      question_topic_data: {
        topic_id: topicId.value
      }
    };
    
    console.log('Final update payload:', JSON.stringify(updatePayload));
    
    // Step 8: Make the API request
    const updateResponse = await axiosInstance.put(`/questions/edit/${questionId.value}`, updatePayload);
    console.log('Translation updated successfully:', updateResponse.data);
    
    // Step 9: Handle success
    if (updateResponse.data.translations_unverified > 0) {
      console.log(`${updateResponse.data.translations_unverified} translations were unverified due to this update`);
    }
    
    // Navigate back with success message
    navigateToQuestionDashboard({
      success: 'true',
      message: 'Translation updated successfully',
    });
  } catch (error: unknown) {
    console.error('Error updating translation:', error);
    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message ?? 'Failed to update translation',
      type: 'error'
    });
  } finally {
    // Disable both loading indicators
    isSaving.value = false;
    isFullscreenLoading.value = false;
  }
}

// Helper functions to reduce cognitive complexity in loadQuestionData

// Get question ID from route parameters
function getQuestionIdFromRoute() {
  const id = route.params.id || route.query.id;
  if (!id) {
    console.error('Question ID not provided');
    toastStore.showToast({
      title: 'Error',
      message: 'Question ID not provided',
      type: 'error'
    });
    navigateToQuestionDashboard();
    return null;
  }
  return Number(id);
}

// Validate question has topics and return topic ID
function validateAndGetTopicId(questionDetails: Record<string, unknown>) {
  if (!questionDetails.question_texts ||
      !Array.isArray(questionDetails.question_texts) ||
      !questionDetails?.question_texts[0]?.topic?.id) {
    console.error('Question has no associated topic');
    toastStore.showToast({
      title: 'Error',
      message: 'Question has no associated topic',
      type: 'error'
    });
    navigateToQuestionDashboard();
    return null;
  }
  
  return questionDetails.question_texts[0].topic.id;
}

// Find translation to edit for the target medium
function findTranslationToEdit(allQuestionTexts: QuestionTranslation[], targetMediumId: number) {
  interface QuestionTextTopic {
    instruction_medium_id: number;
    instruction_medium: {
      id: number;
      instruction_medium: string;
    };
  }

  interface QuestionTextWithTopics extends QuestionTranslation {
    question_text_topics: QuestionTextTopic[];
  }

  const translationToEdit = allQuestionTexts.find(
    (text: QuestionTextWithTopics) => text.question_text_topics &&
           text.question_text_topics.some((topic: QuestionTextTopic) => topic.instruction_medium_id === targetMediumId)
  );

  if (!translationToEdit) {
    console.log('No translation found to edit for medium ID:', targetMediumId);
    toastStore.showToast({
      title: 'Error',
      message: 'No translation found for this medium',
      type: 'error'
    });
    navigateToQuestionDashboard();
    return null;
  }

  console.log('Found translation to edit in question details:', translationToEdit);
  return translationToEdit;
}

// Process available translations
function processAvailableTranslations(questionData: Record<string, unknown>, targetMediumId: number) {
  if (!questionData.question_texts || !Array.isArray(questionData.question_texts) || questionData.question_texts.length === 0) {
    return { availableTranslations: [], originalTranslation: null, originalIndex: -1 };
  }

  // Save the original translation for reference before filtering
  const originalTranslation = questionData.question_texts.find(
    (text: QuestionTranslation) => text.translation_status === 'original'
  );

  // Filter out the current medium's translation from available translations
  const filteredTranslations = questionData.question_texts.filter((text: QuestionTranslation) => {
    // Only include translations that aren't for the current medium
    return text.medium.id !== targetMediumId;
  });

  console.log(`Filtered available translations. Removed current medium (ID: ${targetMediumId}) from list.`);
  console.log(`Available translations count: ${filteredTranslations.length}`);

  // Find the original translation for reference
  const originalIndex = filteredTranslations.findIndex(t => t.translation_status === 'original');
  
  return { 
    availableTranslations: filteredTranslations, 
    originalTranslation, 
    originalIndex: Math.max(0, originalIndex)
  };
}

// Setup translation to edit
function setupTranslationToEdit(translationToEdit: QuestionTranslation, translationMedium: Record<string, unknown>, questionType: string) {
  editingTranslationIndex.value = -1; // We're not editing from the verified list
  translatedQuestion.value = {
    question: translationToEdit.question_text,
    type: questionType,
    id: translationToEdit.id
  };

  // Get the translation's image if available
  if (translationToEdit.image_id && translationToEdit.image) {
    imageLoading.value = true;
    questionImage.value = {
      id: translationToEdit.image_id,
      presigned_url: translationToEdit.image.presigned_url,
      image_url: translationToEdit.image.image_url
    };
  }
}

// Set reference translation content
function setReferenceTranslation(referenceTranslation: QuestionTranslation | null) {
  if (!referenceTranslation) {
    console.warn('No reference translation available for content. Using minimal fallback.');
    // Provide minimal original content for reference
    originalQuestion.value = 'No reference translation available';
    return;
  }

  originalQuestion.value = referenceTranslation.question_text;

  // If original has an image, show it
  if (referenceTranslation.image_id && referenceTranslation.image && !questionImage.value) {
    imageLoading.value = true;
    questionImage.value = {
      id: referenceTranslation.image_id,
      presigned_url: referenceTranslation.image.presigned_url,
      image_url: referenceTranslation.image.image_url
    };
  }
}

// Process MCQ options for the reference translation
function processMcqOptions(referenceTranslation: QuestionTranslation, translationToEdit: QuestionTranslation) {
  if (!(questionType.value === QUESTION_TYPES.MCQ ||
        questionType.value === QUESTION_TYPES.ODD_ONE_OUT ||
        questionType.value === QUESTION_TYPES.TRUE_FALSE) ||
      !referenceTranslation.mcq_options) {
    return;
  }

  originalOptions.value = referenceTranslation.mcq_options.map((opt: McqOption) => opt.option_text);

  // Extract option images and correct answers
  originalOptionImages.value = new Array(originalOptions.value.length).fill(null);
  optionImageLoading.value = new Array(originalOptions.value.length).fill(false);
  optionImageError.value = new Array(originalOptions.value.length).fill(false);
  originalOptionIsCorrect.value = new Array(originalOptions.value.length).fill(false);
  optionImageIds.value = new Array(originalOptions.value.length).fill(null);

  // Process each option
  for (const [index, option] of referenceTranslation.mcq_options.entries()) {
    if (option.is_correct) {
      originalOptionIsCorrect.value[index] = true;
    }

    // Set option image if available
    if (option.image_id && option?.image?.presigned_url) {
      originalOptionImages.value[index] = option.image.presigned_url;
      optionImageLoading.value[index] = true;
      optionImageIds.value[index] = option.image_id;
    }
  }

  // Now load the translated options
  if (translationToEdit.mcq_options) {
    translatedOptions.value = new Array(originalOptions.value.length).fill('');
    for (const [index, option] of translationToEdit.mcq_options.entries()) {
      if (index < translatedOptions.value.length) {
        translatedOptions.value[index] = option.option_text;
      }
    }
  }
}

// Process match pairs for the reference translation
function processMatchPairs(referenceTranslation: QuestionTranslation, translationToEdit: QuestionTranslation) {
  if (!(questionType.value === QUESTION_TYPES.MATCH_PAIRS ||
        questionType.value === QUESTION_TYPES.COMPLETE_CORRELATION) ||
      !referenceTranslation.match_pairs ||
      referenceTranslation.match_pairs.length === 0) {
    return;
  }

  // Initialize match pair arrays
  originalMatchPairs.value = referenceTranslation.match_pairs.map(
    (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
  );
  
  initializeMatchPairArrays();
  processMatchPairImages(referenceTranslation);
  loadTranslatedMatchPairs(translationToEdit);
}

// Initialize arrays for match pair images
function initializeMatchPairArrays() {
  originalMatchPairLeftImages.value = new Array(originalMatchPairs.value.length).fill(null);
  originalMatchPairRightImages.value = new Array(originalMatchPairs.value.length).fill(null);
  pairLeftImageLoading.value = new Array(originalMatchPairs.value.length).fill(false);
  pairLeftImageError.value = new Array(originalMatchPairs.value.length).fill(false);
  pairRightImageLoading.value = new Array(originalMatchPairs.value.length).fill(false);
  pairRightImageError.value = new Array(originalMatchPairs.value.length).fill(false);
  pairLeftImagePreviews.value = new Array(originalMatchPairs.value.length).fill(null);
  pairRightImagePreviews.value = new Array(originalMatchPairs.value.length).fill(null);
  pairLeftImageIds.value = new Array(originalMatchPairs.value.length).fill(null);
  pairRightImageIds.value = new Array(originalMatchPairs.value.length).fill(null);
}

// Process images for match pairs
function processMatchPairImages(referenceTranslation: QuestionTranslation) {
  if (!referenceTranslation.match_pairs) return;
  
  for (const [index, pair] of referenceTranslation.match_pairs.entries()) {
    // Handle left image
    if (pair.left_image_id && pair.left_image) {
      const leftUrl = pair.left_image.presigned_url ?? pair.left_image.image_url;
      if (leftUrl) {
        originalMatchPairLeftImages.value[index] = leftUrl;
        pairLeftImageLoading.value[index] = true;
      }
      pairLeftImageIds.value[index] = pair.left_image_id;
    }
    
    // Handle right image
    if (pair.right_image_id && pair.right_image) {
      const rightUrl = pair.right_image.presigned_url ?? pair.right_image.image_url;
      if (rightUrl) {
        originalMatchPairRightImages.value[index] = rightUrl;
        pairRightImageLoading.value[index] = true;
      }
      pairRightImageIds.value[index] = pair.right_image_id;
    }
  }
}

// Load translated match pairs
function loadTranslatedMatchPairs(translationToEdit: QuestionTranslation) {
  if (translationToEdit.match_pairs && translationToEdit.match_pairs.length > 0) {
    translatedMatchPairs.value = translationToEdit.match_pairs.map(
      (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
    );
  } else {
    // Initialize empty pairs matching original length
    translatedMatchPairs.value = new Array(originalMatchPairs.value.length)
      .fill(0)
      .map(() => ({ left_text: '', right_text: '' }));
  }
}

// Update loadQuestionData to fetch and handle images
async function loadQuestionData() {
  try {
    // Set loading state
    isInitialLoading.value = true;

    // Record start time for minimum loading duration
    const minLoadingTime = 800; // Consistent with other pages
    const startTime = Date.now();

    // Get question ID from route params
    const id = getQuestionIdFromRoute();
    if (!id) return;
    
    questionId.value = id;

    // First, we need to fetch the question to get its associated topic ID
    const questionDetailsResponse = await axiosInstance.get(`/questions/${questionId.value}`);
    const questionDetails = questionDetailsResponse.data;

    // Check if question has any question_texts with topics
    const topicIdValue = validateAndGetTopicId(questionDetails);
    if (!topicIdValue) return;
    
    topicId.value = topicIdValue;
    console.log(`Using topic ID: ${topicId.value} for question ID: ${questionId.value}`);

    // Get target medium ID (the medium we're editing the translation for)
    const targetMediumId = Number.parseInt(questionBankData.value.mediumId.toString(), 10);

    // Find the translation for the target medium
    const allQuestionTexts = questionDetails.question_texts || [];
    const translationToEdit = findTranslationToEdit(allQuestionTexts, targetMediumId);
    if (!translationToEdit) return;

    // Now fetch ONLY verified texts for the available translations list
    const response = await axiosInstance.get(`/questions/${questionId.value}/topic/${topicId.value}/verified-texts`);
    const questionData = response.data;

    // Set question type
    questionType.value = questionData.question_type.type_name;
    console.log(`Question type: ${questionType.value}`);

    // Process available translations
    const { availableTranslations: filteredTranslations, originalTranslation, originalIndex } = 
      processAvailableTranslations(questionData, targetMediumId);
    
    availableTranslations.value = filteredTranslations;
    selectedTranslationIndex.value = originalIndex;

    // Get the translation medium
    const translationMedium = translationToEdit.question_text_topics.find(
      (topic: { instruction_medium_id: number; instruction_medium: { id: number; instruction_medium: string } }) => 
        topic.instruction_medium_id === targetMediumId
    )?.instruction_medium;

    if (translationMedium) {
      // Set up the translation to edit
      setupTranslationToEdit(translationToEdit, translationMedium, questionType.value);

      // Set reference translation for displaying original content
      const referenceTranslation = availableTranslations.value.length > 0 ?
        availableTranslations.value[selectedTranslationIndex.value] : originalTranslation;
      
      setReferenceTranslation(referenceTranslation);
      
      if (referenceTranslation) {
        // Process MCQ options if applicable
        processMcqOptions(referenceTranslation, translationToEdit);
        
        // Process match pairs if applicable
        processMatchPairs(referenceTranslation, translationToEdit);
      }
    }

    // Initialize textareas
    setTimeout(() => {
      for (const textarea of document.querySelectorAll('textarea')) {
        autoResize({ target: textarea } as unknown as Event);
      }
    }, 0);

    // Ensure minimum loading time to avoid flickering UI
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
    }

  } catch (error: unknown) {
    console.error('Error loading question data:', error);

    const axiosError = error as AxiosErrorResponse;
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message ?? 'Failed to load question data',
      type: 'error'
    });

    // Redirect back if we couldn't load the question
    navigateToQuestionDashboard();
  } finally {
    // Clear loading state when done
    isInitialLoading.value = false;
  }
}

// New function to handle changing the selected translation for reference
function changeTranslation(index: number) {
  if (index >= 0 && index < availableTranslations.value.length) {
    selectedTranslationIndex.value = index;
    const selectedTranslation = availableTranslations.value[index];

    // Update the displayed original question
    originalQuestion.value = selectedTranslation.question_text;

    // Update image if available
    updateQuestionImage(selectedTranslation);

    // Update options for MCQ, Odd One Out, and True/False with option images
    updateOptionsIfNeeded(selectedTranslation);

    // Resize textareas after update
    setTimeout(() => {
      for (const textarea of document.querySelectorAll('textarea')) {
        autoResize({ target: textarea } as unknown as Event);
      }
    }, 0);
  }
}

// Helper function to update question image
function updateQuestionImage(translation: {
  image_id?: string | number;
  image?: { presigned_url: string; image_url: string };
}) {
  if (translation.image_id && translation.image) {
    imageLoading.value = true;
    imageError.value = false;
    questionImage.value = {
      id: translation.image_id,
      presigned_url: translation.image.presigned_url,
      image_url: translation.image.image_url
    };
  } else {
    questionImage.value = null;
  }
}

// Helper function to update options for multiple choice questions
function updateOptionsIfNeeded(translation: {
  mcq_options?: McqOption[];
}) {
  const isMCQType = questionType.value === QUESTION_TYPES.MCQ ||
                    questionType.value === QUESTION_TYPES.ODD_ONE_OUT ||
                    questionType.value === QUESTION_TYPES.TRUE_FALSE;
                    
  if (isMCQType && translation.mcq_options) {
    // Extract option text
    originalOptions.value = translation.mcq_options.map((opt: McqOption) => opt.option_text);

    // Reset arrays for option images and correct status
    resetOptionArrays();

    // Loop through options to extract images and correct status
    updateOptionDetails(translation.mcq_options);
  }
}

// Helper function to reset option arrays
function resetOptionArrays() {
  const optionCount = originalOptions.value.length;
  originalOptionImages.value = new Array(optionCount).fill(null);
  optionImageLoading.value = new Array(optionCount).fill(false);
  optionImageError.value = new Array(optionCount).fill(false);
  originalOptionIsCorrect.value = new Array(optionCount).fill(false);
  optionImageIds.value = new Array(optionCount).fill(null);
}

// Helper function to update option details
function updateOptionDetails(options: McqOption[]) {
  for (const [index, option] of options.entries()) {
    // Set correct option
    if (option.is_correct) {
      originalOptionIsCorrect.value[index] = true;
    }

    // Set option image if available
    if (option.image_id && option?.image?.presigned_url) {
      originalOptionImages.value[index] = option.image.presigned_url;
      optionImageLoading.value[index] = true;
      optionImageIds.value[index] = option.image_id;
    }
  }
}

// Function to handle option image loading
function handleOptionImageLoad(index: number) {
  optionImageLoading.value[index] = false;
  optionImageError.value[index] = false;
}

// Function to handle option image error
function handleOptionImageError(index: number) {
  optionImageLoading.value[index] = false;
  optionImageError.value[index] = true;
  console.error('Failed to load option image for index:', index);
}

// Function to handle option image file selection - also store file reference
function handleOptionImageChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Initialize the array if needed
    if (!selectedOptionFiles.value) {
      selectedOptionFiles.value = new Array(originalOptions.value.length).fill(null);
    }

    // Store the file reference
    selectedOptionFiles.value[index] = file;
    console.log(`Option ${index + 1} file stored directly:`, !!selectedOptionFiles.value[index]);

    // Create URL for preview
    const imageURL = URL.createObjectURL(file);

    // Initialize optionImagePreviews array if it doesn't exist
    if (!optionImagePreviews.value) {
      optionImagePreviews.value = new Array(originalOptions.value.length).fill(null);
    }

    // Set the preview URL for this index
    optionImagePreviews.value[index] = imageURL;

    // Show a toast notification to provide feedback
    toastStore.showToast({
      title: 'Option Image Selected',
      message: `Image for Option ${String.fromCodePoint(65 + index)} will be uploaded when you click Update`,
      type: 'info'
    });

    console.log(`New image selected for option ${index + 1} (${file.name}). It will be uploaded when form is submitted.`);
  }
}

// Function to clear selected option image
function clearOptionImage(index: number) {
  if (optionImagePreviews?.value?.[index]) {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(optionImagePreviews.value[index] as string);
    optionImagePreviews.value[index] = null;
  }

  // Clear the file reference
  if (selectedOptionFiles?.value?.[index]) {
    selectedOptionFiles.value[index] = null;
  }

  // Clear file input
  const fileInput = document.getElementById('optionImage' + (index + 1)) as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

// Cleanup function to release all object URLs when component is unmounted
function revokePreviewUrls(urls: Array<string | null> | null | undefined) {
  if (!urls) return
  for (const url of urls) {
    if (url) URL.revokeObjectURL(url)
  }
}

function cleanupObjectURLs() {
  if (questionImagePreview.value) {
    URL.revokeObjectURL(questionImagePreview.value)
  }
  revokePreviewUrls(optionImagePreviews.value)
  revokePreviewUrls(pairLeftImagePreviews.value)
  revokePreviewUrls(pairRightImagePreviews.value)
}

// Function to insert blank in Fill in the Blanks questions
function insertBlank() {
  if (translatedQuestion.value.question) {
    // Get current cursor position
    const textarea = document.getElementById('question') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert blank at cursor position
    const textBefore = translatedQuestion.value.question.substring(0, start);
    const textAfter = translatedQuestion.value.question.substring(end);
    translatedQuestion.value.question = textBefore + '_____' + textAfter;

    // Set cursor position after the blank
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 5, start + 5);
    }, 0);
  } else {
    translatedQuestion.value.question = '_____';

    // Focus the textarea
    setTimeout(() => {
      const textarea = document.getElementById('question') as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(5, 5);
    }, 0);
  }
}
// Match pair image handling methods
function handlePairLeftImageLoad(index: number) {
  if (index >= 0 && index < pairLeftImageLoading.value.length) {
    pairLeftImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairLeftImageError.value.length) {
    pairLeftImageError.value[index] = false;
  }
}

function handlePairLeftImageError(index: number) {
  if (index >= 0 && index < pairLeftImageLoading.value.length) {
    pairLeftImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairLeftImageError.value.length) {
    pairLeftImageError.value[index] = true;
  }
  console.error(`Failed to load left image for pair ${index + 1}`);
}

function handlePairRightImageLoad(index: number) {
  if (index >= 0 && index < pairRightImageLoading.value.length) {
    pairRightImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairRightImageError.value.length) {
    pairRightImageError.value[index] = false;
  }
}

function handlePairRightImageError(index: number) {
  if (index >= 0 && index < pairRightImageLoading.value.length) {
    pairRightImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairRightImageError.value.length) {
    pairRightImageError.value[index] = true;
  }
  console.error(`Failed to load right image for pair ${index + 1}`);
}

function handlePairLeftImageChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Store file for upload later
    if (!selectedPairLeftFiles.value) {
      selectedPairLeftFiles.value = new Array(originalMatchPairs.value.length).fill(null);
    }
    selectedPairLeftFiles.value[index] = input.files[0];
    
    // Create preview
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        // Create a new array with the updated preview URL for this index
        const updatedPreviews = [...pairLeftImagePreviews.value];
        updatedPreviews[index] = e.target.result as string;
        pairLeftImagePreviews.value = updatedPreviews;
      }
    };

    reader.readAsDataURL(file);
    
    // Show toast notification
    toastStore.showToast({
      title: 'Left Image Selected',
      message: `Image for left item ${index + 1} will be uploaded when you click Update`,
      type: 'info'
    });
  } else {
    // If no file selected, remove the preview
    clearPairLeftImage(index);
  }
}

function handlePairRightImageChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Store file for upload later
    if (!selectedPairRightFiles.value) {
      selectedPairRightFiles.value = new Array(originalMatchPairs.value.length).fill(null);
    }
    selectedPairRightFiles.value[index] = input.files[0];
    
    // Create preview
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        // Create a new array with the updated preview URL for this index
        const updatedPreviews = [...pairRightImagePreviews.value];
        updatedPreviews[index] = e.target.result as string;
        pairRightImagePreviews.value = updatedPreviews;
      }
    };

    reader.readAsDataURL(file);
    
    // Show toast notification
    toastStore.showToast({
      title: 'Right Image Selected',
      message: `Image for right item ${index + 1} will be uploaded when you click Update`,
      type: 'info'
    });
  } else {
    // If no file selected, remove the preview
    clearPairRightImage(index);
  }
}

function clearPairLeftImage(index: number) {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...pairLeftImagePreviews.value];
  updatedPreviews[index] = null;
  pairLeftImagePreviews.value = updatedPreviews;

  // Clear the file reference
  if (selectedPairLeftFiles?.value?.[index]) {
    selectedPairLeftFiles.value[index] = null;
  }

  // Reset the file input
  const imageInput = document.getElementById(`leftPairImage${index}`) as HTMLInputElement;
  if (imageInput) {
    imageInput.value = '';
  }
}

function clearPairRightImage(index: number) {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...pairRightImagePreviews.value];
  updatedPreviews[index] = null;
  pairRightImagePreviews.value = updatedPreviews;

  // Clear the file reference
  if (selectedPairRightFiles?.value?.[index]) {
    selectedPairRightFiles.value[index] = null;
  }

  // Reset the file input
  const imageInput = document.getElementById(`rightPairImage${index}`) as HTMLInputElement;
  if (imageInput) {
    imageInput.value = '';
  }
}

// Lifecycle hooks
onMounted(() => {
  // Set initial loading state
  isInitialLoading.value = true;

  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  if (storedData) {
    questionBankData.value = JSON.parse(storedData);
    loadQuestionData();
  } else {
    // Redirect to question bank selection if no data
    isInitialLoading.value = false;
    toastStore.showToast({
      title: 'Error',
      message: 'Question bank data not found',
      type: 'error'
    });
    router.push({ name: 'questionBank' });
  }

  // Check for success message in route query params (if coming back from another page)
  if (route.query.success === 'true') {
    const message = route.query.message as string || 'Operation completed successfully';

    toastStore.showToast({
      title: 'Success',
      message: message,
      type: 'success'
    });

    // Remove query parameters without page reload
    router.replace({ query: {} }).catch(() => {
      // Ignore navigation errors
    });
  }
});

// Event handlers for ImageUploadEditor
function handleQuestionImageUploaded(uploadedImage: any) {
  // Handle uploaded question image
  if (uploadedImage && uploadedImage.image_url) {
    questionImage.value = uploadedImage;
    questionImagePreview.value = uploadedImage.image_url;
    newImageSelected.value = true;
    showQuestionImageModal.value = false;
  }
}

function handleOptionImageUploaded(uploadedImage: any) {
  // Handle uploaded option image
  if (uploadedImage && uploadedImage.image_url && currentOptionIndex.value >= 0) {
    // Update the option image preview
    if (!optionImagePreviews.value) {
      optionImagePreviews.value = [];
    }
    optionImagePreviews.value[currentOptionIndex.value] = uploadedImage.image_url;
    
    // Update the option file reference if needed
    if (!selectedOptionFiles.value) {
      selectedOptionFiles.value = [];
    }
    
    showOptionImageModal.value = false;
    currentOptionIndex.value = 0;
  }
}

// Clean up any object URLs when component is unmounted
onBeforeUnmount(() => {
  cleanupObjectURLs();
});
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

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
  background-color: rgba(255, 255, 250, 0.9);
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

/* New styles for translation language selection */
.language-selector-container {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.language-badge {
  font-size: 0.8rem;
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}

.translation-btn {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.translation-btn:hover {
  transform: translateY(-2px);
}

.translation-btn.active {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.translation-btn.btn-outline-success {
  border-width: 1.5px;
}

.translation-btn.btn-outline-info {
  border-width: 1.5px;
}

.medium-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  display: inline-block;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }

  /* Mobile styles for translation selector */
  .translation-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .translation-btn {
    margin-bottom: 0.5rem;
  }
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

.option-image-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.option-image-preview-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8f9fa;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #ced4da;
}

.option-image-preview {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* Add styles for the image preview indicator */
.preview-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.option-image-preview-container .preview-indicator {
  bottom: 5px;
  right: 5px;
  padding: 3px;
  font-size: 0.7rem;
}

/* Add at the end of the style section */
/* Match the pairs specific styles */
.match-pair-row,
.match-pair-translation-row {
  margin-bottom: 1.5rem;
}

.match-arrow-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.option-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #212529;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 8px;
}

.pair-image-container {
  position: relative;
  max-width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.pair-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.pair-image-preview-container {
  position: relative;
  max-width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.pair-image-preview {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}
</style>
