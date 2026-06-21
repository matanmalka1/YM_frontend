import { createContext, use } from 'react'

/**
 * Exposes the overlay's guarded close handler to any descendant rendered inside
 * a Modal / DetailDrawer (footer actions, in-body cancel buttons). Going through
 * this handler routes the close through the UnsavedChangesGuard, so footer
 * "Cancel" buttons honour the dirty-state prompt instead of bypassing it.
 */
export const OverlayDismissContext = createContext<(() => void) | undefined>(undefined)

/** Returns the guarded close handler, or undefined when used outside an overlay. */
export const useOverlayDismiss = (): (() => void) | undefined => use(OverlayDismissContext)
