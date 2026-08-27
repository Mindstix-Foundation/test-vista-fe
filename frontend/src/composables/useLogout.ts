import { Modal } from 'bootstrap'
import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const SKIP_LOGOUT_CONFIRM_KEY = 'skipLogoutConfirm'

/**
 * Bootstrap logout confirmation modal bound to a unique element id.
 * Supports session skip via sessionStorage.
 */
export function useLogout(modalId: string, options?: { dialogVisible?: Ref<boolean> }) {
  const router = useRouter()
  const authStore = useAuthStore()
  const modalRef: Ref<Modal | null> = ref(null)
  const skipConfirmThisSession = ref(sessionStorage.getItem(SKIP_LOGOUT_CONFIRM_KEY) === '1')

  onBeforeUnmount(() => {
    modalRef.value?.hide()
    modalRef.value = null
  })

  const ensureModal = async () => {
    if (options?.dialogVisible) {
      options.dialogVisible.value = true
      await nextTick()
    }
    const el = document.getElementById(modalId)
    if (!el) return null
    modalRef.value = Modal.getOrCreateInstance(el)
    el.addEventListener(
      'hidden.bs.modal',
      () => {
        if (options?.dialogVisible) options.dialogVisible.value = false
      },
      { once: true },
    )
    return modalRef.value
  }

  const showLogoutModal = async () => {
    if (sessionStorage.getItem(SKIP_LOGOUT_CONFIRM_KEY) === '1') {
      await handleLogout()
      return
    }
    const modal = await ensureModal()
    modal?.show()
  }

  const handleLogout = async () => {
    try {
      if (skipConfirmThisSession.value) {
        sessionStorage.setItem(SKIP_LOGOUT_CONFIRM_KEY, '1')
      }
      modalRef.value?.hide()
      await authStore.logout()
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/login')
    }
  }

  return {
    showLogoutModal,
    handleLogout,
    skipConfirmThisSession,
  }
}
