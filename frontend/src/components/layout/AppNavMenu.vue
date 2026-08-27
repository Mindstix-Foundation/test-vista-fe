<template>
  <ul class="nav flex-column app-nav-menu" :class="{ 'app-nav-menu--collapsed': collapsed }">
    <li v-for="item in items" :key="item.id" class="nav-item">
      <!-- Parent with submenu (e.g. Organization → Create / Join) -->
      <template v-if="item.children?.length">
        <button
          type="button"
          class="nav-link app-nav-link app-nav-link--toggle w-100 text-start border-0"
          :class="{ active: isActive(item) }"
          :title="collapsed ? item.label : undefined"
          :aria-expanded="isExpanded(item)"
          @click="toggleGroup(item.id)"
        >
          <i v-if="item.icon" :class="['bi', item.icon, 'app-nav-icon']" aria-hidden="true"></i>
          <span class="app-nav-label flex-grow-1">{{ item.label }}</span>
          <i
            v-if="!collapsed"
            class="bi app-nav-chevron"
            :class="isExpanded(item) ? 'bi-chevron-up' : 'bi-chevron-down'"
            aria-hidden="true"
          ></i>
        </button>
        <ul v-show="isExpanded(item)" class="nav flex-column app-nav-submenu">
          <li v-for="child in item.children" :key="child.id" class="nav-item">
            <router-link
              v-if="child.to"
              :id="child.id"
              :to="child.to"
              class="nav-link app-nav-link app-nav-link--child"
              active-class=""
              exact-active-class=""
              :class="{ active: isActive(child) }"
              :title="collapsed ? child.label : undefined"
              @click="onNavigate"
            >
              <i
                v-if="child.icon"
                :class="['bi', child.icon, 'app-nav-icon']"
                aria-hidden="true"
              ></i>
              <span class="app-nav-label">{{ child.label }}</span>
            </router-link>
          </li>
        </ul>
      </template>

      <!-- Leaf link -->
      <router-link
        v-else-if="item.to"
        :id="item.id"
        :to="item.to"
        class="nav-link app-nav-link"
        active-class=""
        exact-active-class=""
        :class="{ active: isActive(item) }"
        :title="collapsed ? item.label : undefined"
        @click="onNavigate"
      >
        <i v-if="item.icon" :class="['bi', item.icon, 'app-nav-icon']" aria-hidden="true"></i>
        <span class="app-nav-label">{{ item.label }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getVisibleNavItems,
  isNavItemActive,
  type PortalId,
  type PortalNavItem,
} from '@/config/portalNav'

const props = withDefaults(
  defineProps<{
    portal: PortalId
    collapsed?: boolean
  }>(),
  { collapsed: false },
)

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const items = computed(() => getVisibleNavItems(props.portal))
const expandedGroups = reactive<Record<string, boolean>>({})

const isActive = (item: PortalNavItem) => isNavItemActive(item, route.path)

const isExpanded = (item: PortalNavItem) => {
  if (expandedGroups[item.id] !== undefined) return expandedGroups[item.id]
  // Auto-open when a child route is active
  return isActive(item)
}

const toggleGroup = (id: string) => {
  const item = items.value.find((i) => i.id === id)
  const currentlyOpen = item ? isExpanded(item) : !!expandedGroups[id]
  expandedGroups[id] = !currentlyOpen
}

const onNavigate = () => {
  emit('navigate')
}

// Keep org group open when navigating between Create / Join
watch(
  () => route.path,
  () => {
    for (const item of items.value) {
      if (item.children?.length && isNavItemActive(item, route.path)) {
        expandedGroups[item.id] = true
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.app-nav-menu {
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
}

.app-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.85) !important;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  border-radius: 0.375rem;
  padding: 0.65rem 0.85rem;
  white-space: nowrap;
  background: transparent;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.app-nav-link:hover {
  color: #ffc107 !important;
  background-color: rgba(255, 255, 255, 0.08);
}

.app-nav-link.active {
  color: #fff !important;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 3px 0 0 #ffc107;
}

.app-nav-link--toggle {
  cursor: pointer;
}

.app-nav-chevron {
  font-size: 0.75rem;
  opacity: 0.7;
  flex-shrink: 0;
}

.app-nav-submenu {
  gap: 0.1rem;
  padding: 0.15rem 0 0.35rem 0.35rem;
  list-style: none;
  margin: 0;
}

.app-nav-link--child {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem 0.5rem 1.1rem;
  text-transform: none;
  letter-spacing: 0;
}

.app-nav-link--child.active {
  box-shadow: inset 3px 0 0 #ffc107;
}

.app-nav-icon {
  font-size: 1.1rem;
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
}

.app-nav-menu--collapsed .app-nav-link {
  justify-content: center;
  padding: 0.7rem 0.5rem;
}

.app-nav-menu--collapsed .app-nav-label,
.app-nav-menu--collapsed .app-nav-chevron {
  display: none;
}

.app-nav-menu--collapsed .app-nav-submenu {
  padding-left: 0;
}

.app-nav-menu--collapsed .app-nav-link--child {
  padding: 0.55rem 0.5rem;
  justify-content: center;
}

.app-nav-menu--collapsed .app-nav-link.active {
  box-shadow: none;
  background-color: rgba(255, 193, 7, 0.2);
}
</style>
