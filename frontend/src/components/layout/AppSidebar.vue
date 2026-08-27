<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--collapsed': collapsed }"
    aria-label="Main navigation"
  >
    <div class="app-sidebar__brand">
      <router-link :to="homeRoute" class="app-sidebar__logo-link" :title="'Test Vista'">
        <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="app-sidebar__logo" />
      </router-link>
    </div>

    <nav class="app-sidebar__nav flex-grow-1">
      <AppNavMenu :portal="portal" :collapsed="collapsed" />
    </nav>

    <div class="app-sidebar__footer">
      <button
        type="button"
        class="btn app-sidebar__toggle"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-pressed="collapsed"
        @click="$emit('toggle-collapse')"
      >
        <i
          class="bi fs-5"
          :class="collapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'"
          aria-hidden="true"
        ></i>
        <span v-if="!collapsed" class="ms-2">{{ collapsed ? 'Expand' : 'Collapse' }}</span>
      </button>

      <button
        type="button"
        class="btn app-sidebar__logout"
        :title="collapsed ? 'Logout' : undefined"
        @click="$emit('logout')"
      >
        <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span v-if="!collapsed" class="ms-2">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { portalHomeRoutes, type PortalId } from '@/config/portalNav'
import AppNavMenu from '@/components/layout/AppNavMenu.vue'

const props = defineProps<{
  portal: PortalId
  collapsed: boolean
}>()

defineEmits<{
  logout: []
  'toggle-collapse': []
}>()

const homeRoute = computed(() => portalHomeRoutes[props.portal])
</script>

<style scoped>
.app-sidebar {
  --sidebar-bg: #111;
  width: var(--sidebar-width, 260px);
  height: 100%;
  display: none;
  flex-direction: column;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: width 0.2s ease;
  z-index: 1030;
}

@media (min-width: 992px) {
  .app-sidebar {
    display: flex;
  }
}

.app-sidebar--collapsed {
  width: var(--sidebar-collapsed-width, 72px);
}

.app-sidebar__brand {
  height: var(--topbar-height, 56px);
  display: flex;
  align-items: center;
  padding: 0 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.app-sidebar__logo-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: #fff;
  min-width: 0;
  overflow: hidden;
}

.app-sidebar__logo {
  height: 32px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.app-sidebar__nav {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.app-sidebar__nav:hover,
.app-sidebar__nav:focus-within {
  scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
}

.app-sidebar__nav::-webkit-scrollbar {
  width: 6px;
}

.app-sidebar__nav::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}

.app-sidebar__nav:hover::-webkit-scrollbar-thumb,
.app-sidebar__nav:focus-within::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
}

.app-sidebar__footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.app-sidebar__toggle,
.app-sidebar__logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  padding: 0.55rem 0.75rem;
}

.app-sidebar__toggle {
  margin-bottom: 0.5rem;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.app-sidebar__toggle:hover {
  color: #111;
  background: #fff;
  border-color: #fff;
}

.app-sidebar__logout {
  color: #ff6b6b;
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.35);
}

.app-sidebar--collapsed .app-sidebar__toggle,
.app-sidebar--collapsed .app-sidebar__logout {
  padding: 0.55rem;
}

.app-sidebar__logout:hover {
  color: #fff;
  background: rgba(220, 53, 69, 0.85);
  border-color: transparent;
}
</style>
