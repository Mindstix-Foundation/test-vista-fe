<template>
  <header class="app-topbar">
    <div class="app-topbar__inner d-flex align-items-center justify-content-between px-3">
      <div class="d-flex align-items-center gap-2">
        <!-- Mobile: open offcanvas -->
        <button
          class="btn btn-link text-white p-1 d-lg-none"
          type="button"
          :data-bs-toggle="'offcanvas'"
          :data-bs-target="`#${offcanvasId}`"
          :aria-controls="offcanvasId"
          aria-label="Open navigation menu"
        >
          <i class="bi bi-list fs-3" aria-hidden="true"></i>
        </button>

        <!-- Mobile logo (desktop logo lives in sidebar) -->
        <router-link
          :to="homeRoute"
          class="app-topbar__brand d-flex d-lg-none align-items-center text-decoration-none"
        >
          <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="app-topbar__logo" />
          <span class="text-white fw-semibold ms-2">Test Vista</span>
        </router-link>
      </div>

      <div class="d-flex align-items-center gap-2 text-white-50 small">
        <i class="bi bi-person-circle fs-5 text-white" aria-hidden="true"></i>
        <span class="d-none d-sm-inline text-white text-uppercase">{{ portalLabel }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { portalHomeRoutes, type PortalId } from '@/config/portalNav'

const props = defineProps<{
  portal: PortalId
  offcanvasId: string
}>()

const homeRoute = computed(() => portalHomeRoutes[props.portal])

const portalLabel = computed(() => {
  const labels: Record<PortalId, string> = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
  }
  return labels[props.portal]
})
</script>

<style scoped>
.app-topbar {
  height: var(--topbar-height, 56px);
  background: #111;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1020;
  flex-shrink: 0;
}

.app-topbar__inner {
  height: 100%;
}

.app-topbar__logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.btn-link:focus {
  box-shadow: none;
}
</style>
