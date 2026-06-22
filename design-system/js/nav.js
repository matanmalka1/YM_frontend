/* nav.js — demo interactivity: scroll-spy, section numbering, tabs, accordions,
   toggle menus, modal/drawer open-close, and click-to-copy color tokens. */
;(function () {
  'use strict'

  /* ---- section auto-numbering (CSS renders h2::before from data-n) ---- */
  document.querySelectorAll('section[id] .sec-head h2').forEach((h, i) => {
    h.setAttribute('data-n', String(i + 1).padStart(2, '0'))
  })

  /* ---- scroll-spy: highlight the docs-index item in view ---- */
  const links = Array.from(document.querySelectorAll('.idx-item'))
  const byId = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]))
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        links.forEach((l) => l.classList.remove('active'))
        byId.get(e.target.id)?.classList.add('active')
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('section[id]').forEach((s) => spy.observe(s))

  /* ---- tabs: click to activate within a .tabs group ---- */
  document.querySelectorAll('.tabs').forEach((group) => {
    group.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab')
      if (!tab) return
      group.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
    })
  })

  /* ---- accordion: click the head to collapse/expand its panel ---- */
  document.querySelectorAll('.acc-head[data-acc]').forEach((head) => {
    head.addEventListener('click', () => {
      const panel = head.nextElementSibling
      const open = head.classList.toggle('open')
      if (panel && panel.classList.contains('acc-panel')) panel.hidden = !open
    })
  })

  /* ---- toggle menus: [data-toggle="#id"] flips .open on the target ---- */
  const closeAllMenus = (except) => {
    document.querySelectorAll('.js-menu.open').forEach((m) => {
      if (m !== except) m.classList.remove('open')
    })
  }
  document.querySelectorAll('[data-toggle]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      const menu = document.querySelector(trigger.getAttribute('data-toggle'))
      if (!menu) return
      const willOpen = !menu.classList.contains('open')
      closeAllMenus(menu)
      menu.classList.toggle('open', willOpen)
    })
  })
  document.addEventListener('click', () => closeAllMenus())

  /* ---- overlays: [data-open="#backdrop"] shows it; backdrop/close/Esc hide ---- */
  const openOverlay = (sel) => document.querySelector(sel)?.classList.add('show')
  const closeOverlays = () => document.querySelectorAll('.backdrop.show').forEach((b) => b.classList.remove('show'))
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openOverlay(btn.getAttribute('data-open')))
  })
  document.querySelectorAll('.backdrop').forEach((bd) => {
    bd.addEventListener('click', (e) => {
      if (e.target === bd || e.target.closest('[data-close]')) closeOverlays()
    })
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlays()
      closeAllMenus()
    }
  })

  /* ---- click-to-copy color tokens (swatch / ramp step) ---- */
  let toast
  const showToast = (msg) => {
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'toast'
      document.body.appendChild(toast)
    }
    toast.textContent = msg
    toast.classList.add('show')
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1400)
  }
  const rgbToHex = (rgb) => {
    const m = rgb.match(/\d+/g)
    if (!m || m.length < 3) return null
    return (
      '#' +
      m
        .slice(0, 3)
        .map((n) => Number(n).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    )
  }
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-copy], .swatch, .ramp > span')
    if (!el) return
    let val = el.getAttribute('data-copy') || el.querySelector?.('.hex')?.textContent?.trim()
    if (!val && el.matches('.ramp > span')) val = rgbToHex(getComputedStyle(el).backgroundColor)
    if (!val) return
    navigator.clipboard
      ?.writeText(val)
      .then(() => showToast('הועתק: ' + val))
      .catch(() => showToast('הועתק: ' + val))
  })
})()
