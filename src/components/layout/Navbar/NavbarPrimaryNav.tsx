import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/utils'

import type { NavItem } from './Navbar.constants'
import { NavbarMoreMenu } from './NavbarMoreMenu'
import { buildMoreGroups, type MoreNavGroup } from './Navbar.utils'

interface NavbarPrimaryNavProps {
  items: NavItem[]
}

export const NavbarPrimaryNav: React.FC<NavbarPrimaryNavProps> = ({ items }) => {
  const [hiddenCount, setHiddenCount] = useState(0)
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const cachedWidths = useRef<number[]>([])
  const visibleNavItems = items.filter((item) => item.placement === 'top')
  const staticMoreGroups = buildMoreGroups(items)
  const alwaysShowMore = staticMoreGroups.length > 0

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const measure = () => {
      const itemElements = itemRefs.current.slice(0, visibleNavItems.length)
      if (itemElements.some((element) => !element)) return

      itemElements.forEach((element, index) => {
        if (element && !element.classList.contains('hidden')) {
          cachedWidths.current[index] = element.getBoundingClientRect().width
        }
      })

      let usedWidth = 8 // p-1 padding both sides
      let firstHidden = visibleNavItems.length
      for (let index = 0; index < visibleNavItems.length; index++) {
        const itemWidth = (cachedWidths.current[index] ?? 80) + 4 // gap-1
        const reserveMore = alwaysShowMore || index < visibleNavItems.length - 1 ? 88 : 0
        if (usedWidth + itemWidth + reserveMore > nav.clientWidth) {
          firstHidden = index
          break
        }
        usedWidth += itemWidth
      }

      setHiddenCount(visibleNavItems.length - firstHidden)
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(nav)
    measure()
    return () => resizeObserver.disconnect()
  }, [alwaysShowMore, visibleNavItems.length])

  const overflowItems = hiddenCount > 0 ? visibleNavItems.slice(visibleNavItems.length - hiddenCount) : []
  const overflowGroup: MoreNavGroup | null = overflowItems.length > 0 ? { label: 'ניווט', items: overflowItems } : null
  const moreGroups = overflowGroup ? [overflowGroup, ...staticMoreGroups] : staticMoreGroups

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <nav ref={navRef} className="min-w-0 flex-1 overflow-hidden" aria-label="ניווט ראשי">
        <ul className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
          {visibleNavItems.map((item, index) => {
            const hidden = hiddenCount > 0 && index >= visibleNavItems.length - hiddenCount
            return (
              <li
                key={item.to}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                className={hidden ? 'priority-nav-hidden hidden' : undefined}
              >
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring inline-flex h-9 items-center whitespace-nowrap rounded-[10px] border px-3 text-sm font-medium transition',
                      isActive
                        ? 'border-gray-200 bg-white font-semibold text-gray-950 shadow-sm'
                        : 'border-transparent text-gray-600 hover:bg-white/80 hover:text-gray-950',
                    )
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      {moreGroups.length > 0 ? <NavbarMoreMenu groups={moreGroups} /> : null}
    </div>
  )
}
