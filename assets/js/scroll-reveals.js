gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  if (document.documentElement.classList.contains('no-gpu')) return;

  document.querySelectorAll('[data-reveal]').forEach(el => {
    el.style.willChange = 'transform, opacity';
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete() { el.style.willChange = 'auto'; }
      }
    );
  });
});
