<template>
  <ul class="list-unstyled mb-0 syllabus-node-list">
    <li class="mb-1">
      <div
        class="d-flex align-items-center node-row py-1 px-2 rounded"
        :class="{ 'node-selected': selectedId === node.id }"
        @click="$emit('select-node', node)"
      >
        <button
          v-if="node.children?.length"
          class="btn btn-sm btn-link p-0 me-1 text-dark"
          @click.stop="expanded = !expanded"
        >
          <i :class="expanded ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
        </button>
        <span v-else class="me-3"></span>
        <span class="badge me-2" :class="typeBadgeClass">{{ node.node_type }}</span>
        <span class="node-name">{{ node.name }}</span>
        <span v-if="node._count?.question_links" class="badge bg-light text-dark border ms-2">
          {{ node._count.question_links }} Q
        </span>
        <div class="ms-auto d-flex gap-1 node-actions">
          <button class="btn btn-sm btn-outline-dark py-0" title="Add child" @click.stop="$emit('add-child', node)">
            <i class="bi bi-plus"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger py-0" title="Delete" @click.stop="$emit('delete-node', node)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <template v-if="expanded && node.children?.length">
        <SyllabusNodeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          @select-node="$emit('select-node', $event)"
          @add-child="$emit('add-child', $event)"
          @delete-node="$emit('delete-node', $event)"
        />
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SyllabusNode } from '@/types/exam'

const props = defineProps<{ node: SyllabusNode; selectedId?: number | null }>()
defineEmits<{
  (e: 'select-node', node: SyllabusNode): void
  (e: 'add-child', node: SyllabusNode): void
  (e: 'delete-node', node: SyllabusNode): void
}>()

const expanded = ref(false)

const typeBadgeClass = computed(() => {
  return {
    SECTION: 'bg-dark',
    SUBJECT: 'bg-secondary',
    CHAPTER: 'bg-light text-dark border',
    TOPIC: 'bg-white text-muted border',
  }[props.node.node_type]
})
</script>

<style scoped>
.syllabus-node-list :deep(.syllabus-node-list) {
  margin-left: 1.5rem;
  margin-top: 0.25rem;
}

.node-row:hover {
  background: #f8f9fa;
}

.node-selected {
  background: #e9ecef;
}

.node-name {
  overflow-wrap: anywhere;
}
</style>
