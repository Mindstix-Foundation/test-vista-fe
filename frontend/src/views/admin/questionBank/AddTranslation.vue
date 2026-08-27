<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <!-- Update the router-link to preserve query parameters -->
        <button 
          class="btn btn-close" 
          @click="navigateToTranslationPending"
          aria-label="Close">
        </button>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10">
          <template v-if="isExamScope">
            <p class="text-muted text-start fs-5 m-0">
              {{ questionBankData.programLabel }}
              <span v-if="questionBankData.mediumName"> | {{ questionBankData.mediumName }}</span>
            </p>
            <h4 class="fw-bolder text-start text-dark m-0">
              {{ questionBankData.nodeName }}
              <span class="d-block text-start text-secondary">Competitive / Entrance syllabus</span>
            </h4>
          </template>
          <template v-else>
            <p class="text-muted text-start fs-5 m-0">
              <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
              <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
            </p>
            <h4 class="fw-bolder text-start text-dark m-0">
              Standard {{ questionBankData.standardName }}
              <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
            </h4>
          </template>
          <h4 class="text-left fw-bolder text-uppercase mb-2" id="pageHeader">Add Translation</h4>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <!-- Loading spinner in content area -->
      <div v-if="isLoading" class="row justify-content-center my-5">
        <div class="col-12 col-sm-10 text-center">
          <output class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading translation data...</span>
          </output>
          <p class="mt-3 text-primary">Loading translation data...</p>
        </div>
      </div>

      <div v-else>
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

        <!-- Message when no translations are available -->
        <div class="container mb-4" v-if="availableTranslations.length === 0">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>No translations available.</strong> You are creating the first translation for this question.
                <span class="d-block mt-2 small">
                  Since there are no existing translations, your translation will become the first version in
                  <span class="badge bg-primary">{{ questionBankData.mediumName }}</span> language.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="container" id="descriptiveQuestion" v-show="questionType === 'True or False' ||
                                                 questionType === 'Give Scientific Reasons' ||
                                                 questionType === 'Short Answer Question' ||
                                                 questionType === 'Complete and Identify Reaction' ||
                                                 questionType === 'Short Note' ||
                                                 questionType === 'Odd One Out' ||
                                                 questionType === 'Complete the Correlation' ||
                                                 questionType === 'One-Word Answer'">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10 ">
              <form @submit.prevent="saveTranslation">
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

                  <div class="form-floating">
                    <textarea id="question" v-model="translatedQuestion.question" class="form-control" rows="5" placeholder="Type your question here..." @input="autoResize" required></textarea>
                    <label for="question" class="form-label">
                      Translated Question
                      <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                    </label>
                  </div>
                  <!-- Only enable image upload if the original question has an image -->
                  <div class="input-group input-group-sm mb-3" v-if="questionImage">
                    <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                    <span class="input-group-text text-muted small">
                      <i class="bi bi-info-circle me-1"></i>
                      Original has image
                    </span>
                  </div>
                  <!-- Disabled image upload with explanation if original has no image -->
                  <div class="input-group input-group-sm mb-3" v-else>
                    <input type="file" class="form-control" disabled title="Original question does not have an image. You can only upload images when the original question has an image.">
                    <span class="input-group-text text-muted small">
                      <i class="bi bi-info-circle me-1"></i>
                      No original image
                    </span>
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
        </div>

        <div class="container" id="mcqQuestion" v-show="questionType === 'Multiple Choice Question (MCQ)'">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10 ">
              <form @submit.prevent="saveTranslation">
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

                  <div class="form-floating">
                    <textarea id="mcqText" v-model="translatedQuestion.question" class="form-control" rows="3" placeholder="Type your MCQ question here..." @input="autoResize" required></textarea>
                    <label for="mcqText" class="form-label">
                      Translated Question
                      <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                    </label>
                  </div>
                  <!-- Only enable image upload if the original question has an image -->
                  <div class="input-group input-group-sm mb-3" v-if="questionImage">
                    <input type="file" class="form-control" id="inputGroupFile01" accept="image/*" ref="questionImageInput" @change="handleImageChange">
                    <span class="input-group-text text-muted small">
                      <i class="bi bi-info-circle me-1"></i>
                      Original has image
                    </span>
                  </div>
                  <!-- Disabled image upload with explanation if original has no image -->
                  <div class="input-group input-group-sm mb-3" v-else>
                    <input type="file" class="form-control" disabled title="Original question does not have an image. You can only upload images when the original question has an image.">
                    <span class="input-group-text text-muted small">
                      <i class="bi bi-info-circle me-1"></i>
                      No original image
                    </span>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="row g-3">
                    <div class="col-md-6" v-for="(option, index) in originalOptions" :key="index">
                      <!-- Original Option -->
                      <div class="form-floating mb-2">
                        <input type="text" :value="option" readonly class="form-control" :id="'option' + (index + 1) + 'Translate'">
                        <label :for="'option' + (index + 1) + 'Translate'" class="small">
                          Option {{ String.fromCharCode(65 + index) }}
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

                      <!-- Translated Option -->
                      <div class="form-floating mb-2">
                        <input type="text" v-model="translatedOptions[index]" class="form-control" :id="'option' + (index + 1)" :placeholder="'Option ' + (index + 1)">
                        <label :for="'option' + (index + 1)">
                          Option {{ String.fromCharCode(65 + index) }}
                          <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                          <span v-if="originalOptionIsCorrect[index]" class="badge bg-success ms-1">Correct</span>
                        </label>
                      </div>
                      
                      <!-- Image Upload Section -->
                      <!-- Only show image upload if there's an original image for this option -->
                      <div v-if="originalOptionImages && originalOptionImages[index]" class="mb-2">
                        <div class="input-group input-group-sm">
                          <input type="file" class="form-control" :id="'optionImage' + (index + 1)" accept="image/*" @change="e => handleOptionImageChange(e, index)">
                          <button v-if="optionImagePreviews[index]" class="btn btn-outline-secondary" type="button" @click="clearOptionImage(index)">
                            <i class="bi bi-x-circle"></i>
                          </button>
                        </div>

                        <!-- Preview of selected image for translation -->
                        <div v-if="optionImagePreviews[index]" class="option-image-preview-container mt-2">
                          <img :src="optionImagePreviews[index]" class="option-image-preview" alt="Option Preview">
                          <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="clearOptionImage(index)">
                            <i class="bi bi-x"></i>
                          </button>
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
          </div>
        </div>

        <div class="container" id="fillBlankQuestion" v-show="questionType === 'Fill in the Blanks'">
          <div class="row justify-content-center">
            <div class="col col-12 col-sm-10 ">
              <form @submit.prevent="saveTranslation">
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
                  <textarea id="translateFillBlank" v-model="originalQuestion" readonly class="form-control" @input="autoResize" rows="3"></textarea>

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
                    <textarea id="fillInTheBlankQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                              placeholder="Type your question here, use '_____' for blanks." @input="autoResize" required></textarea>
                    <label for="fillInTheBlankQuestion" class="form-label">
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
          </div>
        </div>

        <div class="container" id="matchPairQuestion" v-show="questionType === 'Match the Pairs'">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-10">
              <form @submit.prevent="saveTranslation">
                <!-- Question section -->
                <div class="mb-4">
                  <label for="matchPairTranslate" class="form-label">
                    Original Question
                    <span v-if="selectedTranslationIndex >= 0 && availableTranslations.length > 0"
                          class="badge ms-2"
                          :class="availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'bg-success language-badge' : 'bg-info language-badge'">
                      {{ availableTranslations[selectedTranslationIndex].medium.instruction_medium }}
                      ({{ availableTranslations[selectedTranslationIndex].translation_status === 'original' ? 'Original' : 'Translated' }})
                    </span>
                  </label>
                  <textarea id="matchPairTranslate" v-model="originalQuestion" readonly class="form-control mb-3" @input="autoResize" rows="3"></textarea>
                  
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
                  
                  <div class="form-floating mb-3">
                    <textarea id="matchPairQuestion" v-model="translatedQuestion.question" class="form-control" rows="3"
                            placeholder="Type your Match the Pairs question here..." @input="autoResize" required></textarea>
                    <label for="matchPairQuestion" class="form-label">
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

                <!-- Match Pairs section -->
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
                                {{ String.fromCharCode(65 + index) }}
                              </div>
                              <div class="option-text flex-grow-1">
                                <strong>{{ pair.left_text || '' }}</strong>
                              </div>
                  </div>

                            <!-- Left image if available -->
                            <div v-if="originalMatchPairLeftImages && originalMatchPairLeftImages[index]" class="pair-image-container mt-2">
                              <div v-if="pairLeftImageLoading[index]" class="image-loading-overlay">
                                <output class="spinner-border spinner-border-sm text-primary">
                                  <span class="visually-hidden">Loading image...</span>
                                </output>
                              </div>
                              <img
                                :src="originalMatchPairLeftImages[index]"
                                class="pair-image"
                                alt="Left Item"
                                @load="handlePairLeftImageLoad(index)"
                                @error="handlePairLeftImageError(index)"
                              />
                              <div v-if="pairLeftImageError[index]" class="image-error-message small">
                                <i class="bi bi-exclamation-triangle"></i>
                                <span>Failed to load image</span>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Arrow -->
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
                            <div v-if="originalMatchPairRightImages && originalMatchPairRightImages[index]" class="pair-image-container mt-2">
                              <div v-if="pairRightImageLoading[index]" class="image-loading-overlay">
                                <output class="spinner-border spinner-border-sm text-primary">
                                  <span class="visually-hidden">Loading image...</span>
                                </output>
                              </div>
                              <img
                                :src="originalMatchPairRightImages[index]"
                                class="pair-image"
                                alt="Right Item"
                                @load="handlePairRightImageLoad(index)"
                                @error="handlePairRightImageError(index)"
                              />
                              <div v-if="pairRightImageError[index]" class="image-error-message small">
                                <i class="bi bi-exclamation-triangle"></i>
                                <span>Failed to load image</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h6 class="fw-bold mb-3 mt-4">Match Pairs Translation</h6>
                  
                  <!-- Translation input section with improved layout -->
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
                                Left Side {{ String.fromCharCode(65 + index) }}
                                <span class="badge bg-primary language-badge">{{ questionBankData.mediumName }}</span>
                              </label>
                              <textarea 
                                v-model="translatedMatchPairs[index].left_text" 
                                class="form-control" 
                                :id="'lhs-' + index" 
                                rows="2"
                                :placeholder="'Translate: ' + (pair.left_text || '')" 
                                required
                                @input="(e) => autoResizeElement(e.target as HTMLTextAreaElement)"
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
                              @input="(e) => autoResizeElement(e.target as HTMLTextAreaElement)"
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

                <div class="text-center">
                  <button type="submit" class="btn btn-dark" id="saveButton" :disabled="isSaving">
                    <output v-if="isSaving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
                    {{ isSaving ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay shown during submission -->
    <div v-if="isFullscreenLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <output
        class="spinner-border text-light"
        style="width: 3rem; height: 3rem;"
      >
        <span class="visually-hidden">Saving translation...</span>
      </output>
    </div>

    <!-- Enhanced Image Upload Modals -->
    <ImageUploadEditor
      v-if="showQuestionImageModal"
      :questionText="originalQuestion"
      :questionNumber="1"
      imageType="question"
      @close="closeQuestionImageModal"
      @upload="handleQuestionImageUploaded"
    />

    <ImageUploadEditor
      v-if="showOptionImageModal"
      :questionText="originalQuestion"
      :questionNumber="1"
      imageType="option"
      @close="closeOptionImageModal"
      @upload="handleOptionImageUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  name: 'AddTranslation'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Add loading state to prevent warning from showing before data loads
const isLoading = ref(true)

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

function translationPendingQuery(extra: Record<string, string | undefined> = {}) {
  const currentRoute = router.currentRoute.value
  const query: Record<string, string | undefined> = {
    page: currentRoute.query.returnPage?.toString(),
    sort: currentRoute.query.returnSort?.toString(),
    topic: currentRoute.query.returnTopic?.toString(),
    type: currentRoute.query.returnType?.toString(),
    search: currentRoute.query.returnSearch?.toString(),
    ...extra,
  }
  if (isExamScope.value) {
    query.scope = 'exam'
    query.programId = String(questionBankData.value.programId)
    query.chapterId = String(
      questionBankData.value.chapterId || resolveExamChapterId(questionBankData.value) || '',
    )
    if (questionBankData.value.stageId) query.stageId = String(questionBankData.value.stageId)
    if (questionBankData.value.subjectId) query.subjectId = String(questionBankData.value.subjectId)
    if ((questionBankData.value as { topicId?: string }).topicId) {
      query.topicId = String((questionBankData.value as { topicId?: string }).topicId)
    }
    if (questionBankData.value.mediumId) {
      query.mediumId = String(questionBankData.value.mediumId)
      if (questionBankData.value.mediumName) query.mediumName = questionBankData.value.mediumName
    }
  }
  return query
}

function navigateToTranslationPending(extra: Record<string, string | undefined> = {}) {
  router.push({
    name: 'translationPending',
    query: translationPendingQuery(extra),
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
  type: ''
})
const translatedOptions = ref<string[]>(['', '', '', ''])
const questionImage = ref<QuestionImage | null>(null)
const imageLoading = ref(false)
const imageError = ref(false)

// New data for multiple translations
const availableTranslations = ref<QuestionTranslation[]>([])
const selectedTranslationIndex = ref<number>(0)
const topicId = ref<number | null>(null)

// Track if a new image is selected
const newImageSelected = ref(false)

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

// Update the MatchPair interface to include image properties
interface MatchPair {
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

// New variables for match pairs images
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

// New states for option images
const originalOptionImages = ref<(string | null)[]>([])
const optionImageLoading = ref<boolean[]>([])
const optionImageError = ref<boolean[]>([])
const optionImagePreviews = ref<(string | null)[]>([])
const originalOptionIsCorrect = ref<boolean[]>([])
const optionImageIds = ref<(number | null)[]>([]) // To store original image IDs

// Add new state for image upload modals
const showQuestionImageModal = ref(false)
const showOptionImageModal = ref(false)
const currentOptionIndex = ref<number>(-1)

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

// Add a function to auto-resize any textarea element
function autoResizeElement(element: HTMLTextAreaElement | null) {
  if (!element) return;
  
  if (element.readOnly) {
    // Temporarily remove readonly to calculate height
    element.readOnly = false
    element.style.height = ''
    element.style.height = element.scrollHeight + 'px'
    element.readOnly = true
  } else {
    element.style.height = ''
    element.style.height = element.scrollHeight + 'px'
  }
}

function insertBlank() {
  translatedQuestion.value.question += '_____'
}

// Add image handling methods
function handleImageError() {
  imageLoading.value = false;
  imageError.value = true;
  console.error('Failed to load question image');
}

// Simplified function to just track if a new image is selected
function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Simply flag that a new image is selected
    newImageSelected.value = true;
  } else {
    // Reset to show original image if file selection is canceled
    newImageSelected.value = false;
  }
}

// Add new methods for ImageUploadEditor
function openQuestionImageModal() {
  showQuestionImageModal.value = true;
}

function closeQuestionImageModal() {
  showQuestionImageModal.value = false;
}

function handleQuestionImageUploaded(imageData: any) {
  // Handle the uploaded question image
  newImageSelected.value = true;
  // Store the image file for later upload during save
  const questionImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
  if (questionImageInput && imageData.file) {
    // Create a new FileList with the uploaded file
    const dt = new DataTransfer();
    dt.items.add(imageData.file);
    questionImageInput.files = dt.files;
  }
  closeQuestionImageModal();
}

function openOptionImageModal(optionIndex: number) {
  currentOptionIndex.value = optionIndex;
  showOptionImageModal.value = true;
}

function closeOptionImageModal() {
  showOptionImageModal.value = false;
  currentOptionIndex.value = -1;
}

function handleOptionImageUploaded(imageData: any) {
  // Handle the uploaded option image
  if (currentOptionIndex.value >= 0) {
    const optionImageInput = document.getElementById(`optionImage${currentOptionIndex.value + 1}`) as HTMLInputElement;
    if (optionImageInput && imageData.file) {
      // Create a new FileList with the uploaded file
      const dt = new DataTransfer();
      dt.items.add(imageData.file);
      optionImageInput.files = dt.files;
      
      // Trigger the existing change handler
      handleOptionImageChange({ target: optionImageInput } as Event, currentOptionIndex.value);
    }
  }
  closeOptionImageModal();
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

  const response = await axiosInstance.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.id;
}

// Helper function to handle image processing logic
async function processImage(inputElement, originalImageId, originalHasImage, warningMessage) {
  const hasNewImage = inputElement?.files && inputElement.files.length > 0;
  
  if (!originalHasImage) {
    if (hasNewImage) {
      showToast('Warning', warningMessage, 'warning');
    }
    return null;
  }
  
  if (!hasNewImage) {
    return originalImageId;
  }
  
  try {
    return await uploadImage(inputElement.files[0]);
  } catch (error) {
    console.error('Error uploading image:', error);
    return originalImageId;
  }
}

// Helper function to process MCQ options
async function processMcqOptions(translationRequest) {
  if (!['Multiple Choice Question (MCQ)', 'Odd One Out', 'True or False'].includes(questionType.value) || 
      translatedOptions.value.length === 0) {
    return;
  }

  translationRequest.mcq_options = [];

  for (let i = 0; i < translatedOptions.value.length; i++) {
    if (translatedOptions.value[i].trim() === '') continue;
    
    const optionObj = {
      option_text: translatedOptions.value[i],
      is_correct: originalOptionIsCorrect.value[i]
    };

    const originalHasOptionImage = originalOptionImages.value[i] !== null;
    const optionImageInput = document.getElementById(`optionImage${i + 1}`) as HTMLInputElement;
    
    const imageId = await processImage(
      optionImageInput,
      optionImageIds.value[i] as number,
      originalHasOptionImage && optionImageIds.value[i] !== null,
      `Cannot add image to option ${i + 1} when original option has no image`
    );
    
    if (imageId) {
      optionObj.image_id = imageId;
    }

    translationRequest.mcq_options.push(optionObj);
  }
}

// Helper function to process match pairs
async function processMatchPairs(translationRequest) {
  if (!['Match the Pairs', 'Complete the Correlation'].includes(questionType.value) || 
      translatedMatchPairs.value.length === 0) {
    return;
  }

  translationRequest.match_pairs = [];

  for (let i = 0; i < translatedMatchPairs.value.length; i++) {
    const pair = translatedMatchPairs.value[i];
    const pairObj = {
      left_text: pair.left_text || '',
      right_text: pair.right_text || ''
    };

    // Process left image
    const originalHasLeftImage = originalMatchPairLeftImages.value[i] !== null;
    const leftImageInput = document.getElementById(`leftPairImage${i}`) as HTMLInputElement;
    
    const leftImageId = await processImage(
      leftImageInput,
      pairLeftImageIds.value[i] as number,
      originalHasLeftImage && pairLeftImageIds.value[i] !== null,
      `Cannot add left image to pair ${i + 1} when original pair has no left image`
    );
    
    if (leftImageId) {
      pairObj.left_image_id = leftImageId;
    }

    // Process right image
    const originalHasRightImage = originalMatchPairRightImages.value[i] !== null;
    const rightImageInput = document.getElementById(`rightPairImage${i}`) as HTMLInputElement;
    
    const rightImageId = await processImage(
      rightImageInput,
      pairRightImageIds.value[i] as number,
      originalHasRightImage && pairRightImageIds.value[i] !== null,
      `Cannot add right image to pair ${i + 1} when original pair has no right image`
    );
    
    if (rightImageId) {
      pairObj.right_image_id = rightImageId;
    }

    translationRequest.match_pairs.push(pairObj);
  }
}

function processFillInTheBlanks(translationRequest) {
  if (questionType.value !== 'Fill in the Blanks') {
    return;
  }
  
  if (availableTranslations.value.length > 0 && 
      availableTranslations.value[selectedTranslationIndex.value].answer_text) {
    translationRequest.answer_text = availableTranslations.value[selectedTranslationIndex.value].answer_text;
  }
}

// Get query parameters for navigation
function getQueryParams() {
  return translationPendingQuery({
    success: 'true',
    message: 'Translation added successfully',
  })
}

async function saveTranslation() {
  try {
    if (!questionId.value) {
      showToast('Error', 'Question ID is missing', 'error');
      return;
    }

    // Enable loading indicators
    isSaving.value = true;
    isFullscreenLoading.value = true;

    // Prepare the translation request
    const targetMediumId = Number.parseInt(questionBankData.value.mediumId.toString(), 10);
    const translationRequest = {
      question_text: translatedQuestion.value.question,
      instruction_medium_id: targetMediumId
    };

    // Process question image
    const questionImageInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
    const imageId = await processImage(
      questionImageInput,
      questionImage.value?.id,
      questionImage.value !== null,
      'Cannot add image to translation when original question has no image'
    );
    
    if (imageId) {
      translationRequest.image_id = imageId;
    }

    // Process different question types
    await processMcqOptions(translationRequest);
    await processMatchPairs(translationRequest);
    processFillInTheBlanks(translationRequest);

    // Submit the translation
    await axiosInstance.post(`/questions/${questionId.value}/translate`, translationRequest);

    // Navigate back with appropriate query params
    router.push({
      name: 'translationPending',
      query: getQueryParams()
    });
  } catch (error) {
    console.error('Error saving translation:', error);
    
    const axiosError = error as AxiosErrorResponse;
    showToast(
      'Error',
      axiosError.response?.data?.message ?? 'Failed to save translation',
      'error'
    );
  } finally {
    // Disable loading indicators
    isSaving.value = false;
    isFullscreenLoading.value = false;
  }
}

// Update loadQuestionData to fetch and handle images
async function loadQuestionData() {
  try {
    // Set loading state to true
    isLoading.value = true;

    // Record the start time for minimum loading duration
    const minLoadingTime = 800; // Increased to 800ms for smoother experience
    const startTime = Date.now();

    const id = getQuestionIdFromRoute();
    if (!id) return;

    questionId.value = Number(id);
    
    // Fetch question details and verify it has a topic
    if (!await fetchQuestionDetails()) return;
    
    // Now fetch verified texts using the correct topic ID
    const questionData = await fetchVerifiedTexts();
    
    // Set question type
    questionType.value = questionData.question_type.type_name;
    console.log(`Question type: ${questionType.value}`);

    // Process all available translations
    processAvailableTranslations(questionData);

    // Initialize textareas
    initializeTextareas();

    // Ensure minimum loading time to avoid flickering UI
    await ensureMinimumLoadingTime(startTime, minLoadingTime);

  } catch (error: unknown) {
    handleLoadError(error);
  } finally {
    // Clear loading state when done
    isLoading.value = false;
  }
}

// Helper functions to reduce complexity

function getQuestionIdFromRoute() {
  const id = route.params.id || route.query.id;
  if (!id) {
    console.error('Question ID not provided');
    toastStore.showToast({
      title: 'Error',
      message: 'Question ID not provided',
      type: 'error'
    });
    navigateToTranslationPending();
    return null;
  }
  return id;
}

async function fetchQuestionDetails() {
  const questionDetailsResponse = await axiosInstance.get(`/questions/${questionId.value}`);
  const questionDetails = questionDetailsResponse.data;

  if (isExamScope.value) {
    if (!questionDetails?.question_texts?.length) {
      console.error('Question has no text content');
      toastStore.showToast({
        title: 'Error',
        message: 'Question has no text content',
        type: 'error'
      });
      navigateToTranslationPending();
      return false;
    }

    const topicFromQuestion =
      questionDetails.question_topics?.[0]?.topic_id ??
      questionDetails.question_texts?.[0]?.topic?.id ??
      null;
    topicId.value = topicFromQuestion;
    return true;
  }

  // Check if question has any question_texts with topics
  if (!questionDetails?.question_texts?.[0]?.topic?.id) {
    console.error('Question has no associated topic');
    toastStore.showToast({
      title: 'Error',
      message: 'Question has no associated topic',
      type: 'error'
    });
    navigateToTranslationPending();
    return false;
  }

  // Get the topic ID from the question details
  topicId.value = questionDetails.question_texts[0].topic.id;
  console.log(`Using topic ID: ${topicId.value} for question ID: ${questionId.value}`);
  return true;
}

async function fetchVerifiedTexts() {
  if (isExamScope.value && !topicId.value) {
    const response = await axiosInstance.get(`/questions/${questionId.value}`);
    return response.data;
  }
  const response = await axiosInstance.get(`/questions/${questionId.value}/topic/${topicId.value}/verified-texts`);
  return response.data;
}

function processAvailableTranslations(questionData) {
  if (!questionData.question_texts || questionData.question_texts.length === 0) return;
  
  availableTranslations.value = questionData.question_texts;

  // Find the original translation if it exists
  const originalIndex = availableTranslations.value.findIndex(t => t.translation_status === 'original');
  // Set default translation to the original one if available, otherwise use the first one
  selectedTranslationIndex.value = Math.max(0, originalIndex);

  // Process selected translation if available
  if (availableTranslations.value.length > 0) {
    processSelectedTranslation(availableTranslations.value[selectedTranslationIndex.value]);
  }
}

function processSelectedTranslation(selectedTranslation) {
  originalQuestion.value = selectedTranslation.question_text;
  translatedQuestion.value.type = questionType.value;

  // Process question image
  processQuestionImage(selectedTranslation);
  
  // Process options based on question type
  processQuestionOptions(selectedTranslation);
}

function processQuestionImage(selectedTranslation) {
  if (selectedTranslation?.image_id && selectedTranslation?.image) {
    imageLoading.value = true;
    questionImage.value = {
      id: selectedTranslation.image_id,
      presigned_url: selectedTranslation.image.presigned_url,
      image_url: selectedTranslation.image.image_url
    };
  }
}

function processQuestionOptions(selectedTranslation) {
  const isMcqType = questionType.value === 'Multiple Choice Question (MCQ)' || 
                   questionType.value === 'Odd One Out' ||
                   questionType.value === 'True or False';
                   
  if (isMcqType && selectedTranslation.mcq_options) {
    loadMcqOptions(selectedTranslation);
  }
  
  const isMatchPairsType = (questionType.value === 'Match the Pairs' || 
                          questionType.value === 'Complete the Correlation') &&
                          selectedTranslation.match_pairs &&
                          selectedTranslation.match_pairs.length > 0;
                          
  if (isMatchPairsType) {
    loadMatchPairs(selectedTranslation);
  }
}

function loadMcqOptions(selectedTranslation) {
  originalOptions.value = selectedTranslation.mcq_options.map((opt: McqOption) => opt.option_text);
  // Initialize translated options array with the same length
  translatedOptions.value = new Array(originalOptions.value.length).fill('');

  // Initialize arrays for option images and correct status
  initializeMcqArrays(originalOptions.value.length);
  
  // Process each option
  for (const [index, option] of selectedTranslation.mcq_options.entries()) {
    processOptionDetails(option, index);
  }
}

function initializeMcqArrays(length) {
  originalOptionImages.value = new Array(length).fill(null);
  optionImageLoading.value = new Array(length).fill(false);
  optionImageError.value = new Array(length).fill(false);
  originalOptionIsCorrect.value = new Array(length).fill(false);
  optionImageIds.value = new Array(length).fill(null);
  optionImagePreviews.value = new Array(length).fill(null);
}

function processOptionDetails(option, index) {
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

function initializeTextareas() {
  setTimeout(() => {
    for (const textarea of document.querySelectorAll('textarea')) {
      autoResize({ target: textarea } as unknown as Event);
    }
  }, 0);
}

async function ensureMinimumLoadingTime(startTime, minLoadingTime) {
  const elapsedTime = Date.now() - startTime;
  if (elapsedTime < minLoadingTime) {
    await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
  }
}

function handleLoadError(error) {
  console.error('Error loading question data:', error);

  const axiosError = error as AxiosErrorResponse;
  toastStore.showToast({
    title: 'Error',
    message: axiosError.response?.data?.message ?? 'Failed to load question data',
    type: 'error'
  });

  // Redirect back if we couldn't load the question
  navigateToTranslationPending();
}

// New function to handle changing the selected translation
function changeTranslation(index: number) {
  if (index < 0 || index >= availableTranslations.value.length) {
    return;
  }
  
  selectedTranslationIndex.value = index;
  const selectedTranslation = availableTranslations.value[index];

  // Update the displayed original question
  originalQuestion.value = selectedTranslation.question_text;

  // Update image if available
  updateQuestionImage(selectedTranslation);
  
  // Update options for specific question types
  updateQuestionOptions(selectedTranslation);

  // Reset translated options to empty for the new translation
  translatedOptions.value = new Array(originalOptions.value.length).fill('');

  // Reset preview images
  optionImagePreviews.value = new Array(originalOptions.value.length).fill(null);

  // Resize textareas after update
  resizeTextareas();
}

// Helper function to update the question image
function updateQuestionImage(translation) {
  if (translation?.image_id && translation?.image) {
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

// Helper function to update question options
function updateQuestionOptions(translation) {
  const isOptionBasedQuestion = isOptionTypeQuestion(questionType.value);
  
  if (isOptionBasedQuestion && translation.mcq_options) {
    // Extract option text
    originalOptions.value = translation.mcq_options.map((opt) => opt.option_text);

    // Reset arrays for option images and correct status
    resetOptionArrays(originalOptions.value.length);

    // Process each option
    processOptions(translation.mcq_options);
  }
}

// Helper function to check if question type uses options
function isOptionTypeQuestion(type) {
  return type === 'Multiple Choice Question (MCQ)' ||
         type === 'Odd One Out' ||
         type === 'True or False';
}

// Helper function to reset option arrays
function resetOptionArrays(optionsCount) {
  originalOptionImages.value = new Array(optionsCount).fill(null);
  optionImageLoading.value = new Array(optionsCount).fill(false);
  optionImageError.value = new Array(optionsCount).fill(false);
  originalOptionIsCorrect.value = new Array(optionsCount).fill(false);
  optionImageIds.value = new Array(optionsCount).fill(null);
}

// Helper function to process options
function processOptions(options) {
  for (const [index, option] of options.entries()) {
    // Set correct option
    if (option.is_correct) {
      originalOptionIsCorrect.value[index] = true;
    }

    // Set option image if available
    processOptionImage(option, index);
  }
}

// Helper function to process option image
function processOptionImage(option, index) {
  if (option.image_id && option?.image?.presigned_url) {
    originalOptionImages.value[index] = option.image.presigned_url;
    optionImageLoading.value[index] = true;
    optionImageIds.value[index] = option.image_id;
  }
}

// Helper function to resize textareas
function resizeTextareas() {
  // Use a different approach than the one in initializeTextareas
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length > 0) {
    // Process each textarea with a small delay between them
    for (const [index, textarea] of textareas.entries()) {
      // Stagger the resize operations slightly
      setTimeout(() => {
        autoResizeElement(textarea);
      }, index * 5); // 5ms delay between each textarea resize
    }
  }
}

// Methods for handling match pair images
function handlePairLeftImageLoad(index: number): void {
  if (index >= 0 && index < pairLeftImageLoading.value.length) {
    pairLeftImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairLeftImageError.value.length) {
    pairLeftImageError.value[index] = false;
  }
}

function handlePairLeftImageError(index: number): void {
  if (index >= 0 && index < pairLeftImageLoading.value.length) {
    pairLeftImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairLeftImageError.value.length) {
    pairLeftImageError.value[index] = true;
  }
  console.error(`Failed to load left image for pair ${index + 1}`);
}

function handlePairRightImageLoad(index: number): void {
  if (index >= 0 && index < pairRightImageLoading.value.length) {
    pairRightImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairRightImageError.value.length) {
    pairRightImageError.value[index] = false;
  }
}

function handlePairRightImageError(index: number): void {
  if (index >= 0 && index < pairRightImageLoading.value.length) {
    pairRightImageLoading.value[index] = false;
  }
  if (index >= 0 && index < pairRightImageError.value.length) {
    pairRightImageError.value[index] = true;
  }
  console.error(`Failed to load right image for pair ${index + 1}`);
}

function handlePairLeftImageChange(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Create URL for preview
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
  } else {
    // If no file selected, remove the preview
    clearPairLeftImage(index);
  }
}

function handlePairRightImageChange(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Create URL for preview
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
  } else {
    // If no file selected, remove the preview
    clearPairRightImage(index);
  }
}

function clearPairLeftImage(index: number): void {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...pairLeftImagePreviews.value];
  updatedPreviews[index] = null;
  pairLeftImagePreviews.value = updatedPreviews;

  // Reset the file input
  const imageInput = document.getElementById(`leftPairImage${index}`) as HTMLInputElement;
  if (imageInput) {
    imageInput.value = '';
  }
}

function clearPairRightImage(index: number): void {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...pairRightImagePreviews.value];
  updatedPreviews[index] = null;
  pairRightImagePreviews.value = updatedPreviews;

  // Reset the file input
  const imageInput = document.getElementById(`rightPairImage${index}`) as HTMLInputElement;
  if (imageInput) {
    imageInput.value = '';
  }
}

// Methods for option image handling
function handleOptionImageLoad(index: number): void {
  if (index >= 0 && index < optionImageLoading.value.length) {
    optionImageLoading.value[index] = false;
  }
  if (index >= 0 && index < optionImageError.value.length) {
    optionImageError.value[index] = false;
  }
}

function handleOptionImageError(index: number): void {
  if (index >= 0 && index < optionImageLoading.value.length) {
    optionImageLoading.value[index] = false;
  }
  if (index >= 0 && index < optionImageError.value.length) {
    optionImageError.value[index] = true;
  }
  console.error(`Failed to load image for option ${index + 1}`);
}

function handleOptionImageChange(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Create URL for preview
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        // Create a new array with the updated preview URL for this index
        const updatedPreviews = [...optionImagePreviews.value];
        updatedPreviews[index] = e.target.result as string;
        optionImagePreviews.value = updatedPreviews;
      }
    };

    reader.readAsDataURL(file);
  } else {
    // If no file selected, remove the preview
    clearOptionImage(index);
  }
}

function clearOptionImage(index: number): void {
  // Create a new array with the cleared preview for this index
  const updatedPreviews = [...optionImagePreviews.value];
  updatedPreviews[index] = null;
  optionImagePreviews.value = updatedPreviews;

  // Reset the file input
  const optionImageInput = document.getElementById(`optionImage${index + 1}`) as HTMLInputElement;
  if (optionImageInput) {
    optionImageInput.value = '';
  }
}

// Helper function to load match pairs from selected translation
async function loadMatchPairs(selectedTranslation) {
  originalMatchPairs.value = selectedTranslation.match_pairs.map(
    (pair: MatchPair) => ({ left_text: pair.left_text, right_text: pair.right_text })
  );

  // Initialize translatedMatchPairs with empty strings for each pair
  translatedMatchPairs.value = new Array(originalMatchPairs.value.length)
    .fill(0)
    .map(() => ({ left_text: '', right_text: '' }));
    
  // Initialize arrays for match pair images
  initializeMatchPairArrays(originalMatchPairs.value.length);
  
  // Process each match pair
  for (const [index, pair] of selectedTranslation.match_pairs.entries()) {
    processMatchPairImages(pair, index);
  }
}

function initializeMatchPairArrays(length) {
  originalMatchPairLeftImages.value = new Array(length).fill(null);
  originalMatchPairRightImages.value = new Array(length).fill(null);
  pairLeftImageLoading.value = new Array(length).fill(false);
  pairLeftImageError.value = new Array(length).fill(false);
  pairRightImageLoading.value = new Array(length).fill(false);
  pairRightImageError.value = new Array(length).fill(false);
  pairLeftImagePreviews.value = new Array(length).fill(null);
  pairRightImagePreviews.value = new Array(length).fill(null);
  pairLeftImageIds.value = new Array(length).fill(null);
  pairRightImageIds.value = new Array(length).fill(null);
}

function processMatchPairImages(pair, index) {
  // Handle left side image
  if (pair.left_image_id) {
    const leftImage = pair.left_image;
    if (leftImage?.presigned_url) {
      originalMatchPairLeftImages.value[index] = leftImage.presigned_url;
      pairLeftImageLoading.value[index] = true;
      pairLeftImageIds.value[index] = pair.left_image_id;
    }
  }
  
  // Handle right side image
  if (pair.right_image_id) {
    const rightImage = pair.right_image;
    if (rightImage?.presigned_url) {
      originalMatchPairRightImages.value[index] = rightImage.presigned_url;
      pairRightImageLoading.value[index] = true;
      pairRightImageIds.value[index] = pair.right_image_id;
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  if (storedData) {
    questionBankData.value = JSON.parse(storedData);
    loadQuestionData();
  } else {
    // Redirect to question bank selection if no data
    toastStore.showToast({
      title: 'Error',
      message: 'Question bank data not found',
      type: 'error'
    });
    router.push({ name: 'questionBank' });
  }

  // Check for success message in route query params (if coming back from another page)
  if (route.query.success === 'true') {
    const message = route.query.message ?? 'Operation completed successfully';

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

// Clean up resources when component is unmounted
onUnmounted(() => {
  // No need for cleanup since we're not using object URLs anymore
});
</script>

<style scoped>
/* General styles */
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

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

/* Image loading overlay */
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

/* Question image container */
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

.language-badge {
  font-weight: normal;
  font-size: 0.75rem;
}

/* Option image containers and preview styling */
.option-image-container {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f8f9fa;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #dee2e6;
}

.option-image-preview-container {
  border: 1px dashed #ced4da;
}

.option-image,
.option-image-preview {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }

  .pair-image,
  .pair-image-preview {
    max-height: 120px;
  }
  
  .pair-image-container,
  .pair-image-preview-container {
    min-height: 80px;
  }
  
  .option-image {
    max-height: 120px;
  }
  
  .option-image-container,
  .option-image-preview-container {
    min-height: 80px;
  }
}

.form-floating {
  margin-bottom: 0;
}

.card {
  overflow: hidden;
}

.card-body {
  padding: 0;
}

.border-bottom {
  border-bottom: 1px solid rgba(0,0,0,.125) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .option-image,
  .option-image-preview {
    max-height: 100px;
  }
  
  .option-image-container,
  .option-image-preview-container {
    min-height: 80px;
  }
}
</style>
