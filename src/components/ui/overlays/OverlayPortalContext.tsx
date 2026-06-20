import { createContext, use } from 'react'

const OverlayPortalContext = createContext<HTMLElement | null | undefined>(undefined)

export const OverlayPortalProvider = OverlayPortalContext.Provider

export const useOverlayPortalContainer = (): HTMLElement | null => {
  const container = use(OverlayPortalContext)
  if (container !== undefined) return container
  return typeof document === 'undefined' ? null : document.body
}

export const getOverlayPortalOffset = (container: HTMLElement | null): { left: number; top: number } => {
  if (!container || container === document.body) return { left: 0, top: 0 }
  const rect = container.getBoundingClientRect()
  return { left: rect.left, top: rect.top }
}
