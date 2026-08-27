<template>
  <div class="form-layout">
    <AppBreadcrumb />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
</script>

<style scoped>
.form-layout {
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 768px) {
  .form-layout {
    height: 100vh;
    overflow-y: scroll !important;
  }
}
</style>
