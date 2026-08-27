/**
 * Mobile Scroll Fix Utilities
 * Provides functions to fix common mobile scrolling issues
 * These fixes are applied ONLY on mobile devices to preserve desktop layout
 */

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (globalThis.innerWidth <= 768 && 'ontouchstart' in globalThis)
}

export const enableMobileScrolling = (): void => {
  if (!isMobileDevice()) return

  // Force enable scrolling only on mobile
  document.body.style.overflowY = 'auto';
  (document.body.style as any).webkitOverflowScrolling = 'touch'
  document.documentElement.style.overflowY = 'auto';
  (document.documentElement.style as any).webkitOverflowScrolling = 'touch'
  
  // Ensure proper height only on mobile
  document.body.style.height = 'auto'
  document.body.style.minHeight = '100vh'
  document.documentElement.style.height = 'auto'
  document.documentElement.style.minHeight = '100vh'
  
  // Add mobile-specific touch properties
  document.body.style.touchAction = 'manipulation'
  document.documentElement.style.touchAction = 'manipulation'
}

export const fixViewportHeight = (): void => {
  if (!isMobileDevice()) return

  const setVH = () => {
    const vh = globalThis.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  
  setVH()
  globalThis.addEventListener('resize', setVH)
  globalThis.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100)
  })
}

export const preventModalScrollIssues = (): void => {
  if (!isMobileDevice()) return

  // Store original body styles when modal opens
  const originalBodyOverflow = document.body.style.overflow
  const originalBodyHeight = document.body.style.height
  
  // Listen for modal events
  document.addEventListener('show.bs.modal', () => {
    // Store current values
    document.body.dataset.originalOverflow = originalBodyOverflow
    document.body.dataset.originalHeight = originalBodyHeight
    
    // Set modal styles
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
  })
  
  document.addEventListener('hidden.bs.modal', () => {
    // Restore original values and ensure scrolling works
    const storedOverflow = document.body.dataset.originalOverflow || 'auto'
    const storedHeight = document.body.dataset.originalHeight || 'auto'
    
    document.body.style.overflow = storedOverflow
    document.body.style.height = storedHeight;
    (document.body.style as any).webkitOverflowScrolling = 'touch'
    
    // Clean up attributes
    delete document.body.dataset.originalOverflow
    delete document.body.dataset.originalHeight
    
    // Force re-enable scrolling after modal closes
    setTimeout(() => {
      enableMobileScrolling()
    }, 50)
  })
}

export const initMobileScrollFixes = (): void => {
  if (!isMobileDevice()) return

  console.log('Applying mobile scroll fixes...')
  
  enableMobileScrolling()
  fixViewportHeight()
  preventModalScrollIssues()
  
  // Additional touch event fixes for mobile only
  document.addEventListener('touchstart', (e) => {
    // Prevent zoom on double tap while allowing scrolling
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })
  
  // Force a reflow to ensure styles are applied
  setTimeout(() => {
    enableMobileScrolling()
    console.log('Mobile scroll fixes applied successfully')
  }, 100)
}

// Vue 3 Composable
export const useMobileScrollFix = () => {
  const applyFixes = () => {
    if (isMobileDevice()) {
      initMobileScrollFixes()
    }
  }
  
  const enableScrolling = () => {
    if (isMobileDevice()) {
      enableMobileScrolling()
    }
  }
  
  const isMobile = isMobileDevice()
  
  return {
    applyFixes,
    enableScrolling,
    isMobile
  }
} 