<template>
  <ToastNotification />
  <RouterView v-slot="{ Component, route }">
    <keep-alive :include="['EditPattern', 'EditSection', 'EditExamPaperTemplate']">
      <component :is="Component" :key="routeViewKey(route)" />
    </keep-alive>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { onMounted } from 'vue'
import { useMobileScrollFix } from '@/utils/mobileScrollFix'

const QUERY_STABLE_ROUTE_NAMES = new Set([
  'patternDashboard',
  'questionBank',
  'questionDashboard',
  'SyllabusDashboard',
])

function routeViewKey(route: RouteLocationNormalizedLoaded) {
  if (route.name === 'editPattern' && route.query.from === 'editSection') {
    return `${route.name}-${route.params.id}`
  }
  if (route.name === 'editExamPattern') {
    return `${route.name}-${route.params.id}`
  }
  if (route.name && QUERY_STABLE_ROUTE_NAMES.has(String(route.name))) {
    return String(route.name)
  }
  return route.fullPath
}

// Fix for mobile scrolling issues - only apply on mobile devices
const { applyFixes, enableScrolling, isMobile } = useMobileScrollFix()

onMounted(() => {
  // Only apply fixes on mobile devices to avoid affecting desktop layout
  if (isMobile) {
    applyFixes()
    
    // Additional fix with delay to ensure DOM is ready
    setTimeout(() => {
      enableScrolling()
    }, 100)
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}

/* Mobile-specific app fixes - ONLY apply on mobile screens */
@media screen and (max-width: 768px) {
  #app {
    height: auto !important;
    min-height: 100vh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    position: relative !important;
    /* Ensure mobile layout overrides desktop constraints */
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    grid-template-columns: none !important;
  }
}
</style>
