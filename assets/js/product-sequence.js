gsap.registerPlugin(ScrollTrigger);

function pad(n) {
  return String(n).padStart(3, '0');
}

function draw(ctx, img) {
  ctx.drawImage(img, 0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.documentElement.classList.contains('no-gpu')) return;

  document.querySelectorAll('[data-sequence]').forEach(canvas => {
    const key        = canvas.dataset.sequence;
    const frameCount = parseInt(canvas.dataset.frameCount, 10) || 20;
    const ctx        = canvas.getContext('2d');
    const frames     = [];

    // Preload all frames
    const promises = Array.from({ length: frameCount }, (_, i) => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = `${window.__asset_baseurl || ''}/assets/images/home/frames/${key}/frame_${pad(i + 1)}.webp`;
        img.onload  = () => { frames[i] = img; resolve(); };
        img.onerror = resolve;
      });
    });

    Promise.all(promises).then(() => {
      const first = frames.find(Boolean);
      if (!first) return;

      // Size canvas to actual image dimensions — CSS (w-full h-auto) handles display scaling
      canvas.width  = first.naturalWidth;
      canvas.height = first.naturalHeight;
      draw(ctx, first);

      let lastIdx = -1;
      ScrollTrigger.create({
        trigger: canvas,
        start: 'top 90%',
        end: 'bottom 50%',
        scrub: true,
        onUpdate(self) {
          const idx = Math.round(self.progress * (frameCount - 1));
          if (idx !== lastIdx && frames[idx]) {
            lastIdx = idx;
            draw(ctx, frames[idx]);
          }
        }
      });
    });
  });
});
