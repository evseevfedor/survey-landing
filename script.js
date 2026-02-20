(() => {
  const FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfJ4-NmlYV9I-1a7-A3uTV-uy-0uFNdQ8Cezgleic2uIZfhIg/viewform?usp=preview";

  // Inject CSS needed for button effects only
  const css = `
  :root{
    --nb-stroke:#111;
    --nb-shadow-sm: 5px 5px 0 var(--nb-stroke);
    --nb-accent: #ff3d7f;
    --nb-accent2:#2d6bff;
  }

  .cta-btn{
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 18px;
    border: 3px solid var(--nb-stroke);
    border-radius: 14px;
    background: var(--nb-accent);
    color: #000;
    font-weight: 900;
    letter-spacing: .2px;
    text-decoration: none;
    box-shadow: var(--nb-shadow-sm);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transform: translate3d(0,0,0);
    transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
    overflow: hidden;
    isolation: isolate;
  }
  .cta-btn:hover{ filter: saturate(1.05) contrast(1.02); }
  .cta-btn:active{
    transform: translate3d(2px,2px,0);
    box-shadow: 0 0 0 var(--nb-stroke);
  }
  .cta-btn:focus-visible{
    outline: 3px solid var(--nb-accent2);
    outline-offset: 5px;
  }

  .cta-btn::before{
    content:"";
    position:absolute;
    inset:-40% -60%;
    background: linear-gradient(115deg,
      transparent 0%,
      rgba(255,255,255,.0) 35%,
      rgba(255,255,255,.55) 50%,
      rgba(255,255,255,.0) 65%,
      transparent 100%
    );
    transform: translateX(-40%) rotate(12deg);
    opacity: 0;
    pointer-events:none;
    z-index: 0;
  }
  .cta-btn.nb-shine::before{
    opacity: 1;
    animation: nbShine 650ms ease-out 1;
  }
  @keyframes nbShine{
    0%   { transform: translateX(-60%) rotate(12deg); }
    100% { transform: translateX(60%)  rotate(12deg); }
  }

  .nb-ripple{
    position:absolute;
    border-radius: 999px;
    transform: translate(-50%,-50%);
    pointer-events:none;
    z-index: 1;
    background: rgba(255,255,255,.55);
    mix-blend-mode: soft-light;
    animation: nbRipple 520ms ease-out 1;
  }
  @keyframes nbRipple{
    0%   { width: 0; height: 0; opacity: .85; }
    100% { width: 520px; height: 520px; opacity: 0; }
  }

  .cta-badge{
    display:inline-flex;
    align-items:center;
    padding: 6px 10px;
    border: 2px solid var(--nb-stroke);
    border-radius: 999px;
    background:#fff;
    box-shadow: 4px 4px 0 var(--nb-stroke);
    font-size: .92rem;
    font-weight: 800;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: no-preference){
    .cta-btn.nb-pulse{ animation: nbPulse 2600ms ease-in-out infinite; }
    @keyframes nbPulse{
      0%, 100% { transform: translate3d(0,0,0); }
      50%      { transform: translate3d(-1px,-1px,0); }
    }
  }

  @media (min-width: 760px){
    .cta-btn{ width: auto; min-width: 320px; }
  }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // Find CTA link (expects your "Vyplnit dotazník" <a>)
  const allLinks = [...document.querySelectorAll("a[href]")];
  const ctaLink =
    allLinks.find(a => (a.textContent || "").toLowerCase().includes("vyplnit dotazník")) ||
    allLinks.find(a => a.href && a.href.includes("docs.google.com/forms")) ||
    null;

  if (!ctaLink) return;

  // Force correct URL + attributes
  ctaLink.href = FORM_URL;
  ctaLink.target = "_blank";
  ctaLink.rel = "noopener noreferrer";

  // Upgrade CTA styling class
  ctaLink.classList.add("cta-btn");

  // Add badge inside button (if not already present)
  if (!ctaLink.querySelector(".cta-badge")) {
    const badge = document.createElement("span");
    badge.className = "cta-badge";
    badge.textContent = "cca 3–5 min";
    ctaLink.appendChild(badge);
  }

  // Motion safety
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Shine helper
  let shineTimeout = null;
  const triggerShine = () => {
    if (reduceMotion) return;
    ctaLink.classList.remove("nb-shine");
    void ctaLink.offsetWidth;
    ctaLink.classList.add("nb-shine");
    clearTimeout(shineTimeout);
    shineTimeout = setTimeout(() => ctaLink.classList.remove("nb-shine"), 900);
  };

  ctaLink.addEventListener("pointerenter", triggerShine);

  // Ripple on click
  ctaLink.addEventListener("pointerdown", (e) => {
    if (reduceMotion) return;

    const rect = ctaLink.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "nb-ripple";
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ctaLink.appendChild(ripple);

    triggerShine();
    window.setTimeout(() => ripple.remove(), 700);
  });

  // Magnetic hover + tilt
  let raf = null;
  let isInside = false;

  const onMove = (e) => {
    if (reduceMotion || !isInside) return;

    const rect = ctaLink.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const mx = clamp(dx, -1, 1);
    const my = clamp(dy, -1, 1);

    const translateX = mx * 6;
    const translateY = my * 6;
    const rotateX = my * -4;
    const rotateY = mx * 6;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      ctaLink.style.transform =
        `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      ctaLink.style.boxShadow = `7px 7px 0 var(--nb-stroke)`;
    });
  };

  const resetMagnet = () => {
    if (raf) cancelAnimationFrame(raf);
    ctaLink.style.transform = "translate3d(0,0,0)";
    ctaLink.style.boxShadow = "var(--nb-shadow-sm)";
  };

  ctaLink.addEventListener("pointerenter", () => {
    isInside = true;
    if (!reduceMotion) ctaLink.style.willChange = "transform";
  });
  ctaLink.addEventListener("pointerleave", () => {
    isInside = false;
    ctaLink.style.willChange = "auto";
    resetMagnet();
  });
  window.addEventListener("pointermove", onMove, { passive: true });

  // Gentle pulse
  if (!reduceMotion) ctaLink.classList.add("nb-pulse");

  // Keyboard shine
  ctaLink.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") triggerShine();
  });
})();
