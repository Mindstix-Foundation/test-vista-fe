<template>
  <div class="container mt-4 mb-5">
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-start m-0 fw-bolder text-uppercase">Exam Catalog</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link
            class="btn btn-success"
            id="addExamButton"
            :to="{ name: 'addExam', query: { tab: catalogTab } }"
          >
            Add Exam
          </router-link>
        </div>
      </div>
      <hr />
    </div>

    <div class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10 col-md-10">
        <ul class="nav nav-tabs category-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: catalogTab === 'ENTRANCE' }"
              @click="setCatalogTab('ENTRANCE')"
            >
              Entrance Exams
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: catalogTab === 'COMPETITIVE' }"
              @click="setCatalogTab('COMPETITIVE')"
            >
              Competitive Exams
            </button>
          </li>
        </ul>
      </div>
    </div>

    <ExamCatalogSection :category="catalogTab" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ExamCategoryCode } from '@/types/exam'
import ExamCatalogSection from './ExamCatalogSection.vue'

const router = useRouter()
const route = useRoute()

const catalogTab = ref<ExamCategoryCode>('COMPETITIVE')

function setCatalogTab(tab: ExamCategoryCode) {
  catalogTab.value = tab
  router.replace({ query: { tab } })
}

onMounted(() => {
  const tab = route.query.tab as string
  if (tab === 'ENTRANCE' || tab === 'COMPETITIVE') {
    catalogTab.value = tab
  }
})
</script>

<style scoped>
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addExamButton {
    width: 100% !important;
  }

  .container.mt-4.mb-5 {
    padding-bottom: 30px !important;
  }
}

.category-tabs {
  border-bottom: 2px solid #dee2e6;
}

.category-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background: transparent;
}

.category-tabs .nav-link:hover {
  color: #212529;
  border-bottom-color: #adb5bd;
}

.category-tabs .nav-link.active {
  color: #212529;
  font-weight: 600;
  border-bottom-color: #212529;
  background: transparent;
}
</style>
