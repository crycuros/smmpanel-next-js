import * as React from 'react'

// Breakpoint for mobile detection (in pixels)
const MOBILE_BREAKPOINT = 768

// Additional breakpoints for different mobile scenarios
const TABLET_BREAKPOINT = 1024
const LARGE_MOBILE_BREAKPOINT = 480

interface DeviceMetrics {
  width: number
  height: number
  pixelRatio: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isSmallMobile: boolean
  isLargeMobile: boolean
}

function getDeviceMetrics(): DeviceMetrics {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      pixelRatio: 1,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isSmallMobile: false,
      isLargeMobile: false,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1

  // Check for touch capability
  const isTouchDevice = 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0

  // Determine device type based on viewport width
  const isMobile = width < MOBILE_BREAKPOINT
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
  const isDesktop = width >= TABLET_BREAKPOINT
  
  // Additional mobile size detection
  const isSmallMobile = width < LARGE_MOBILE_BREAKPOINT
  const isLargeMobile = width >= LARGE_MOBILE_BREAKPOINT && width < MOBILE_BREAKPOINT

  return {
    width,
    height,
    pixelRatio,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isSmallMobile,
    isLargeMobile,
  }
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [deviceMetrics, setDeviceMetrics] = React.useState<DeviceMetrics>(getDeviceMetrics())

  React.useEffect(() => {
    const onChange = () => {
      const metrics = getDeviceMetrics()
      setDeviceMetrics(metrics)
      setIsMobile(metrics.isMobile)
    }

    // Create media query list
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Listen for media query changes
    mql.addEventListener('change', onChange)
    
    // Also listen for resize and orientation changes
    window.addEventListener('resize', onChange)
    window.addEventListener('orientationchange', onChange)

    // Initial check
    onChange()

    return () => {
      mql.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    metrics: deviceMetrics,
  }
}

// Hook specifically for sidebar trigger detection
export function useSidebarBreakpoint() {
  const [shouldShowSidebar, setShouldShowSidebar] = React.useState(false)
  const [deviceMetrics, setDeviceMetrics] = React.useState<DeviceMetrics>(getDeviceMetrics())

  React.useEffect(() => {
    const checkSidebar = () => {
      const metrics = getDeviceMetrics()
      setDeviceMetrics(metrics)
      
      // Show sidebar when:
      // 1. Width is below mobile breakpoint (768px)
      // 2. OR device is a touch device with width below tablet breakpoint (1024px)
      // 3. OR pixel ratio suggests a small screen (high DPI on small screen)
      const shouldShow = 
        metrics.width < MOBILE_BREAKPOINT ||
        (metrics.isTouchDevice && metrics.width < TABLET_BREAKPOINT) ||
        (metrics.width < 900 && metrics.pixelRatio > 1.5)
      
      setShouldShowSidebar(shouldShow)
    }

    checkSidebar()

    window.addEventListener('resize', checkSidebar)
    window.addEventListener('orientationchange', checkSidebar)
    
    // Also check when pixel ratio changes (e.g., moving between displays)
    const pixelRatioHandler = () => checkSidebar()
    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener('change', pixelRatioHandler)

    return () => {
      window.removeEventListener('resize', checkSidebar)
      window.removeEventListener('orientationchange', checkSidebar)
    }
  }, [])

  return {
    shouldShowSidebar,
    deviceMetrics,
  }
}
