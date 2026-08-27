<template>
  <div class="app-shell" :class="{ 'app-shell--collapsed': collapsed }">
    <AppSidebar
      :portal="portal"
      :collapsed="collapsed"
      @toggle-collapse="toggleCollapsed"
      @logout="showLogoutModal"
    />

    <div class="app-shell__main d-flex flex-column min-vh-100">
      <AppTopBar :portal="portal" :offcanvas-id="offcanvasId" />

      <AppBreadcrumb />

      <div class="app-shell__content flex-grow-1">
        <div class="container-fluid px-3 px-md-4 py-3">
          <slot>
            <router-view />
          </slot>
        </div>
      </div>
    </div>

    <!-- Mobile navigation offcanvas -->
    <div
      class="offcanvas offcanvas-start app-offcanvas"
      tabindex="-1"
      :id="offcanvasId"
      :aria-labelledby="`${offcanvasId}Label`"
    >
      <div class="offcanvas-header border-bottom border-secondary">
        <h5 class="offcanvas-title text-white" :id="`${offcanvasId}Label`">
          <img src="@/assets/Test.jpg" alt="" class="app-offcanvas__logo me-2" />
          Test Vista
        </h5>
        <button
          type="button"
          class="btn-close btn-close-white"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body d-flex flex-column p-0">
        <nav class="flex-grow-1 overflow-auto">
          <AppNavMenu :portal="portal" @navigate="closeOffcanvas" />
        </nav>
        <div class="p-3 border-top border-secondary">
          <button type="button" class="btn btn-outline-danger w-100" @click="onMobileLogout">
            <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Logout confirmation (mounted only while open so a11y tree stays clean) -->
    <div
      v-if="logoutDialogVisible"
      class="modal fade"
      :id="logoutModalId"
      tabindex="-1"
      :aria-labelledby="`${logoutModalId}Label`"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="`${logoutModalId}Label`">Confirm Logout</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Are you sure you want to logout?</p>
            <div class="form-check">
              <input
                id="skipLogoutConfirm"
                v-model="skipConfirmThisSession"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="skipLogoutConfirm">
                Don't ask again this session
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Offcanvas } from 'bootstrap'
import type { PortalId } from '@/config/portalNav'
import { useLogout } from '@/composables/useLogout'
import { useSidebarCollapse } from '@/composables/useSidebarCollapse'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import AppNavMenu from '@/components/layout/AppNavMenu.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'

const props = defineProps<{
  portal: PortalId
}>()

const offcanvasId = `appOffcanvas-${props.portal}`
const logoutModalId = `appLogoutModal-${props.portal}`
const logoutDialogVisible = ref(false)

const { collapsed, toggleCollapsed } = useSidebarCollapse(props.portal)
const { showLogoutModal, handleLogout, skipConfirmThisSession } = useLogout(logoutModalId, {
  dialogVisible: logoutDialogVisible,
})

let offcanvasInstance: Offcanvas | null = null

onMounted(() => {
  const el = document.getElementById(offcanvasId)
  if (el) {
    offcanvasInstance = Offcanvas.getOrCreateInstance(el)
  }
})

onBeforeUnmount(() => {
  offcanvasInstance?.hide()
  offcanvasInstance = null
  document.querySelector('.offcanvas-backdrop')?.remove()
})

const closeOffcanvas = () => {
  offcanvasInstance?.hide()
  document.querySelector('.offcanvas-backdrop')?.remove()
}

const onMobileLogout = () => {
  closeOffcanvas()
  showLogoutModal()
}
</script>

<style scoped>
.app-shell {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --topbar-height: 56px;
  display: flex;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  background: #f5f6f8;
}

.app-shell__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.app-shell__content {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Make portal pages use the full main column width beside the sidebar */
.app-shell__content :deep(.container) {
  max-width: 100%;
}

.app-offcanvas {
  background: #111 !important;
  width: min(300px, 85vw) !important;
}

.app-offcanvas__logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}
</style>

<!-- Unscoped layout lock: sidebar stays put; only main content scrolls -->
<style>
@media (min-width: 992px) {
  .app-shell > aside.app-sidebar {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    bottom: auto !important;
    flex: 0 0 var(--sidebar-width, 260px) !important;
    width: var(--sidebar-width, 260px) !important;
    height: 100% !important;
    max-height: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-self: stretch !important;
    z-index: 1030 !important;
  }

  .app-shell.app-shell--collapsed > aside.app-sidebar {
    flex-basis: var(--sidebar-collapsed-width, 72px) !important;
    width: var(--sidebar-collapsed-width, 72px) !important;
  }

  .app-shell > .app-shell__main {
    margin-left: 0 !important;
    width: auto !important;
    flex: 1 1 auto !important;
  }
}

@media (max-width: 991.98px) {
  .app-shell {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .app-shell > .app-shell__main {
    overflow: visible !important;
  }

  .app-shell .app-shell__content {
    overflow: visible !important;
  }
}
</style>
