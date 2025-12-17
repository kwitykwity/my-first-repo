/* Optional enhancements layer — safe to remove anytime */
(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1) Smooth scroll for in-page links (no layout change) ----------
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    // Only handle same-page anchors like "#about"
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });

    // Move focus for accessibility (without weird jumps)
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute("tabindex"), 300);
  });

  // ---------- 2) Back to top button injected (no HTML edits needed) ----------
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.textContent = "↑";
  backToTop.style.display = "none";

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  document.body.appendChild(backToTop);

  const toggleBackToTop = () => {
    backToTop.style.display = window.scrollY > 500 ? "inline-flex" : "none";
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  // ---------- 3) Scrollspy: highlight nav link for visible section ----------
  const nav = document.querySelector("nav");
  if (!nav) return;

  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter(Boolean)
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length === 0) return;

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isMatch = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", isMatch);
      if (isMatch) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  // Use IntersectionObserver for performance
  const observer = new IntersectionObserver(
    (entries) => {
      // Find the most visible intersecting section
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    },
    {
      root: null,
      threshold: [0.25, 0.4, 0.6],
      rootMargin: "0px 0px -55% 0px" // helps activate earlier as you scroll down
    }
  );

  sections.forEach((sec) => observer.observe(sec));
})();
