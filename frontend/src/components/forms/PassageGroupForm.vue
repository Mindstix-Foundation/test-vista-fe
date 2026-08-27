<template>
  <div class="passage-group-form">
    <div class="alert alert-info py-2">
      <i class="bi bi-link-45deg me-1"></i>
      {{ isEditMode ? 'Edit' : 'Create' }} a shared passage with
      <strong>2 or more</strong> linked MCQs. They are selected and shown together in tests.
    </div>

    <div class="mb-3">
      <label class="form-label fw-semibold" for="sharedPassage">Shared Passage</label>
      <textarea
        id="sharedPassage"
        v-model="passageText"
        class="form-control"
        rows="6"
        placeholder="Paste the common paragraph / stimulus here…"
      />
      <div v-if="touched && !passageText.trim()" class="text-danger small mt-1">
        Passage text is required.
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Linked MCQs ({{ children.length }})</h6>
      <button type="button" class="btn btn-sm btn-outline-primary" @click="addChild">
        <i class="bi bi-plus-lg"></i> Add MCQ
      </button>
    </div>

    <div
      v-for="(child, index) in children"
      :key="child.key"
      class="card mb-3 child-card"
    >
      <div class="card-header d-flex justify-content-between align-items-center py-2">
        <strong>Question {{ index + 1 }}</strong>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          :disabled="children.length <= 2"
          @click="removeChild(index)"
        >
          Remove
        </button>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label" :for="`childQuestion-${index}`">Question text</label>
          <textarea :id="`childQuestion-${index}`" v-model="child.question_text" class="form-control" rows="3" />
        </div>
        <div
          v-for="(opt, optIndex) in child.options"
          :key="optIndex"
          class="input-group mb-2"
        >
          <span class="input-group-text">{{ String.fromCharCode(65 + optIndex) }}</span>
          <input v-model="opt.text" type="text" class="form-control" :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`" />
          <div class="input-group-text">
            <input
              class="form-check-input mt-0"
              type="radio"
              :name="`correct-${child.key}`"
              :checked="child.correctIndex === optIndex"
              @change="child.correctIndex = optIndex"
            />
            <span class="ms-1 small">Correct</span>
          </div>
        </div>
      </div>
    </div>

    <div class="form-check mb-3" v-if="showPyqToggle">
      <input id="isPyq" v-model="isPyq" class="form-check-input" type="checkbox" />
      <label class="form-check-label" for="isPyq">Previous year question (PYQ)</label>
    </div>

    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="submit">
        <output v-if="saving" class="spinner-border spinner-border-sm me-1"></output>
        {{ saving ? 'Saving…' : (isEditMode ? 'Update Passage Group' : 'Save Passage Group') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface ChildOption {
  text: string
}

interface ChildDraft {
  key: string
  question_text: string
  options: ChildOption[]
  correctIndex: number
}

export interface PassageGroupInitialChild {
  question_text: string
  options: { text: string; is_correct?: boolean }[]
  correctIndex?: number
}

const props = withDefaults(
  defineProps<{
    showPyqToggle?: boolean
    saving?: boolean
    isEditMode?: boolean
    initialPassageText?: string
    initialIsPyq?: boolean
    initialChildren?: PassageGroupInitialChild[]
  }>(),
  {
    showPyqToggle: true,
    saving: false,
    isEditMode: false,
    initialPassageText: '',
    initialIsPyq: false,
    initialChildren: () => [],
  },
)

const emit = defineEmits<{
  save: [
    payload: {
      passage_text: string
      is_pyq: boolean
      children: {
        question_text: string
        options: { text: string; is_correct: boolean }[]
        group_order: number
      }[]
    },
  ]
  cancel: []
}>()

let keySeq = 0
const makeChild = (seed?: PassageGroupInitialChild): ChildDraft => {
  const options = seed?.options?.length
    ? seed.options.map((o) => ({ text: o.text || '' }))
    : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
  while (options.length < 4) options.push({ text: '' })
  const correctIndex =
    typeof seed?.correctIndex === 'number'
      ? seed.correctIndex
      : Math.max(0, seed?.options?.findIndex((o) => o.is_correct) ?? 0)
  return {
    key: `c-${++keySeq}`,
    question_text: seed?.question_text || '',
    options: options.slice(0, 4),
    correctIndex: Math.max(0, correctIndex),
  }
}

const passageText = ref('')
const isPyq = ref(false)
const touched = ref(false)
const children = ref<ChildDraft[]>([makeChild(), makeChild()])

function hydrateFromProps() {
  passageText.value = props.initialPassageText || ''
  isPyq.value = !!props.initialIsPyq
  if (props.initialChildren?.length >= 2) {
    children.value = props.initialChildren.map((c) => makeChild(c))
  } else if (!props.isEditMode) {
    children.value = [makeChild(), makeChild()]
  }
}

watch(
  () => [props.initialPassageText, props.initialChildren, props.initialIsPyq],
  () => hydrateFromProps(),
  { immediate: true, deep: true },
)

const addChild = () => {
  children.value.push(makeChild())
}

const removeChild = (index: number) => {
  if (children.value.length <= 2) return
  children.value.splice(index, 1)
}

const submit = () => {
  touched.value = true
  if (!passageText.value.trim()) return
  if (children.value.length < 2) return

  for (const child of children.value) {
    if (!child.question_text.trim()) {
      alert('Each linked MCQ needs question text.')
      return
    }
    if (child.options.some((o) => !o.text.trim())) {
      alert('Fill all four options for every linked MCQ.')
      return
    }
  }

  emit('save', {
    passage_text: passageText.value.trim(),
    is_pyq: isPyq.value,
    children: children.value.map((child, index) => ({
      question_text: child.question_text.trim(),
      group_order: index + 1,
      options: child.options.map((opt, optIndex) => ({
        text: opt.text.trim(),
        is_correct: child.correctIndex === optIndex,
      })),
    })),
  })
}
</script>

<style scoped>
.child-card {
  border-left: 3px solid #0d6efd;
}
</style>
