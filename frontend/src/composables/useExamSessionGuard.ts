import { ref, type Ref } from 'vue'

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element
  msFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void> | void
  msExitFullscreen?: () => Promise<void> | void
}

export function detectIOSDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipod/.test(userAgent) && !(globalThis as { MSStream?: unknown }).MSStream
}

export function exitFullscreenIfNeeded(isIOSDevice: boolean): void {
  if (isIOSDevice) {
    console.log('Fullscreen not supported on iOS device')
    return
  }

  const doc = document as FullscreenDocument
  if (
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    }
  }
}

export function blockBackNavigation(showLeaveConfirmation: Ref<boolean>): void {
  globalThis.history.pushState(null, '', globalThis.location.href)

  globalThis.addEventListener('popstate', () => {
    globalThis.history.pushState(null, '', globalThis.location.href)
    showLeaveConfirmation.value = true
  })

  globalThis.addEventListener('keydown', (e) => {
    if (
      (e.altKey && e.key === 'ArrowLeft') ||
      (e.altKey && e.key === 'ArrowRight') ||
      e.key === 'F5' ||
      (e.ctrlKey && e.key === 'r')
    ) {
      e.preventDefault()
    }
  })

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

export function useExamSessionGuard() {
  const isIOSDevice = ref(false)
  const showLeaveConfirmation = ref(false)

  const detectDevice = () => {
    isIOSDevice.value = detectIOSDevice()
  }

  const exitFullscreen = () => {
    exitFullscreenIfNeeded(isIOSDevice.value)
  }

  const enableBackNavigationBlock = () => {
    blockBackNavigation(showLeaveConfirmation)
  }

  return {
    isIOSDevice,
    showLeaveConfirmation,
    detectDevice,
    exitFullscreen,
    blockBackNavigation: enableBackNavigationBlock,
  }
}
