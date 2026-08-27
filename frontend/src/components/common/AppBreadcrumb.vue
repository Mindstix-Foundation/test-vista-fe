<template>
  <nav v-if="items.length" aria-label="breadcrumb" class="app-breadcrumb">
    <div class="container-fluid px-4">
      <ol class="breadcrumb mb-0 py-2">
        <li
          v-for="(item, index) in items"
          :key="`${item.label}-${index}`"
          class="breadcrumb-item"
          :class="{ active: index === items.length - 1 }"
        >
          <router-link v-if="item.to && index < items.length - 1" :to="item.to">
            {{ item.label }}
          </router-link>
          <span v-else>{{ item.label }}</span>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const { items } = useBreadcrumbs()
</script>

<style scoped>
.app-breadcrumb {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.breadcrumb {
  font-size: 0.875rem;
}

.breadcrumb-item a {
  color: #212529;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}
</style>
