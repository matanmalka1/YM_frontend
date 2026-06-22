/* nav.js — scroll-spy: highlight the docs-index item for the section in view. */
(function () {
  const links = Array.from(document.querySelectorAll('.idx-item'));
  const byId = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        byId.get(entry.target.id)?.classList.add('active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
})();
