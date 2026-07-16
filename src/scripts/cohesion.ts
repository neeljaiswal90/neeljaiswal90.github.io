const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-reveal]'));
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = new Map(
  Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-coh-nav]'))
    .map((link) => [link.dataset.cohNav ?? '', link] as const),
);
const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-section]'));
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = (visible.target as HTMLElement).dataset.cohSection;
    sectionLinks.forEach((link, key) => link.classList.toggle('is-active', key === id));
  }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-15% 0px -55% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

let ticking = false;
const updateScroll = () => {
  const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  root.style.setProperty('--coh-scroll', String(Math.min(1, Math.max(0, window.scrollY / range))));
  ticking = false;
};
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

const hero = document.querySelector<HTMLElement>('.coh-hero');
if (hero && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', String((event.clientX - rect.left) / rect.width - 0.5));
    hero.style.setProperty('--pointer-y', String((event.clientY - rect.top) / rect.height - 0.5));
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0');
    hero.style.setProperty('--pointer-y', '0');
  });
}

const roleTarget = document.querySelector<HTMLElement>('[data-role-cycle]');
const roles = ['growth systems', 'production AI', 'commerce products', 'platform systems'];
if (roleTarget && !reducedMotion) {
  let roleIndex = 0;
  window.setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleTarget.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-0.5em)' }],
      { duration: 180, fill: 'forwards' },
    ).finished.then(() => {
      roleTarget.textContent = roles[roleIndex] ?? roles[0] ?? '';
      roleTarget.animate(
        [{ opacity: 0, transform: 'translateY(0.5em)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 260, fill: 'forwards' },
      );
    }).catch(() => undefined);
  }, 2400);
}

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-coh-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}
