/**
 * Lightweight scroll reveals + counters + form. Native scroll for speed.
 */

function animateCount(el) {
  const target = parseFloat(el.dataset.count || "0");
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    el.textContent =
      prefix +
      (decimals ? value.toFixed(decimals) : Math.round(value).toString()) +
      suffix;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

export function initMotion(onScrollProgress) {
  const revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        entry.target.querySelectorAll("[data-count]").forEach((el) => {
          if (el.dataset.done) return;
          el.dataset.done = "1";
          animateCount(el);
        });
        revealIo.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => revealIo.observe(el));

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      onScrollProgress?.(Math.min(1, (window.scrollY / max) * 2.2));
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const form = document.getElementById("launch-form");
  const status = document.getElementById("launch-status");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) status.hidden = false;
    form.reset();
  });
}
