import * as React from "react"

const MOBILE_BREAKPOINT = 768

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  // Initialise from the current viewport on the client so the effect only
  // needs to subscribe to later changes.
  const [isMobile, setIsMobile] = React.useState(isMobileViewport)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(isMobileViewport())
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
