<template>
  <form @submit.prevent="handleSubmit">
    <div class="row g-3 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="mb-3 form-floating">
          <input
            type="text"
            class="form-control"
            id="examItemName"
            :placeholder="placeholder"
            v-model="name"
            required
          />
          <label for="examItemName">{{ label }}</label>
        </div>
      </div>
      <div class="col-12 col-sm-10 col-md-8 mt-2">
        <div class="text-center">
          <button type="submit" class="btn btn-dark" :disabled="!name.trim() || submitting">
            <output v-if="submitting" class="spinner-border spinner-border-sm me-1"></output>
            Save
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    submitting?: boolean
  }>(),
  {
    label: 'Name',
    placeholder: 'Enter name',
    submitting: false,
  },
)

const emit = defineEmits<(e: 'submit', name: string) => void>()

const name = ref('')

function handleSubmit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('submit', trimmed)
}
</script>
