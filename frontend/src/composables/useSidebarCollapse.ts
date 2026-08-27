import { onMounted, ref, watch } from 'vue'
import type { PortalId } from '@/config/portalNav'

const STORAGE_KEY = 'testvista.sidebar.collapsed'

/**
 * Persist sidebar collapsed state per portal in localStorage.
 */
export function useSidebarCollapse(portal: PortalId) {
  const collapsed = ref(false)

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const map = JSON.parse(raw) as Record<string, boolean>
        if (typeof map[portal] === 'boolean') {
          collapsed.value = map[portal]
        }
      }
    } catch {
      // ignore corrupt storage
    }
  })

  watch(collapsed, (value) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
      map[portal] = value
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    } catch {
      // ignore quota / private mode
    }
  })

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  return { collapsed, toggleCollapsed }
}
