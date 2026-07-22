import { useCallback, type RefObject } from 'react'

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])'

/**
 * Roving focus over the `[role="menuitem"]` elements inside `layerRef`.
 * Shared by the portal Menu overlay and CSS-positioned menus (NavbarMoreMenu).
 */
export const useMenuRovingFocus = (layerRef: RefObject<HTMLElement | null>) => {
  const getItems = useCallback(
    () => Array.from(layerRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []),
    [layerRef],
  )

  const focusItem = useCallback(
    (direction: 1 | -1, from?: HTMLElement | null) => {
      const items = getItems()
      if (items.length === 0) return

      const activeIndex = from ? items.indexOf(from) : -1
      const nextIndex =
        activeIndex < 0 ? (direction === 1 ? 0 : items.length - 1) : (activeIndex + direction + items.length) % items.length
      items[nextIndex]?.focus()
    },
    [getItems],
  )

  const focusBoundary = useCallback(
    (position: 'first' | 'last') => {
      const items = getItems()
      const item = position === 'first' ? items[0] : items[items.length - 1]
      item?.focus()
    },
    [getItems],
  )

  return { focusItem, focusBoundary }
}
