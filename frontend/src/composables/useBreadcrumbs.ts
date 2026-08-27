import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveBreadcrumbs } from '@/config/breadcrumbs'

export function useBreadcrumbs() {
  const route = useRoute()

  const items = computed(() => resolveBreadcrumbs(route))

  return { items }
}
