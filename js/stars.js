const STAR_COUNT = 10;
const STAR_MIN_DURATION_SECONDS = 10;
const STAR_DURATION_RANGE_SECONDS = 40;
const STAR_DELAY_RANGE_SECONDS = 15;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

document.addEventListener("DOMContentLoaded", () => {
  const supportsMatchMedia = typeof window.matchMedia === "function";
  const prefersReducedMotion =
    supportsMatchMedia &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (prefersReducedMotion) {
    return;
  }

  const starsContainer = document.createDocumentFragment();

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.setAttribute("aria-hidden", "true");
    star.style.left = `${Math.random() * 100}vw`;
    star.style.animationDuration = `${
      Math.random() * STAR_DURATION_RANGE_SECONDS + STAR_MIN_DURATION_SECONDS
    }s`;
    star.style.animationDelay = `${Math.random() * STAR_DELAY_RANGE_SECONDS}s`;
    starsContainer.appendChild(star);
  }

  document.body.appendChild(starsContainer);
});
