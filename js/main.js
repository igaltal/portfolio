/* Igal Talmerom · portfolio behaviors
   theme · blueprint mode · nav state · reveals · filters · toc · prototype */

(() => {
  const doc = document.documentElement;

  /* QA screenshot mode */
  if (location.search.includes("shot")) {
    doc.classList.add("shotmode");
    const y = new URLSearchParams(location.search).get("shotY");
    if (y) document.body.style.marginTop = -Number(y) + "px";
  }

  /* ---------- Theme ---------- */
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (t) => {
    doc.setAttribute("data-theme", t);
    themeBtn?.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  };
  applyTheme(storedTheme || (prefersDark.matches ? "dark" : "light"));
  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
  });
  themeBtn?.addEventListener("click", () => {
    const next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });

  /* ---------- Blueprint mode ---------- */
  const bpBtn = document.querySelector("[data-blueprint-toggle]");
  const applyBp = (on) => {
    doc.setAttribute("data-blueprint", on ? "on" : "off");
    bpBtn?.setAttribute("aria-pressed", String(on));
  };
  applyBp(sessionStorage.getItem("blueprint") === "on");
  bpBtn?.addEventListener("click", () => {
    const on = doc.getAttribute("data-blueprint") !== "on";
    sessionStorage.setItem("blueprint", on ? "on" : "off");
    applyBp(on);
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Project filters ---------- */
  const filterBtns = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".work-grid .card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const tag = btn.dataset.filter;
      cards.forEach((card) => {
        const show = tag === "all" || (card.dataset.tags || "").split(" ").includes(tag);
        if (show) {
          card.classList.remove("is-gone");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => card.classList.remove("is-hidden"))
          );
        } else {
          card.classList.add("is-hidden");
          setTimeout(() => {
            if (card.classList.contains("is-hidden")) card.classList.add("is-gone");
          }, 340);
        }
      });
    });
  });

  /* ---------- Case study: progress + TOC spy ---------- */
  const progress = document.querySelector(".progress");
  if (progress) {
    const onScroll = () => {
      const h = doc.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (sec) map.set(sec, a);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tocLinks.forEach((a) => a.classList.remove("active"));
            map.get(e.target)?.classList.add("active");
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }

  /* ---------- Interactive prototype ---------- */
  const proto = document.querySelector("[data-proto]");
  if (proto) {
    const screens = proto.querySelectorAll(".proto-screen");
    const steps = document.querySelectorAll(".proto-steps button");
    let idx = 0;

    const go = (next) => {
      next = ((next % screens.length) + screens.length) % screens.length;
      screens.forEach((s, i) => {
        s.classList.toggle("active", i === next);
        s.classList.toggle("exit-left", i < next);
      });
      steps.forEach((b, i) =>
        i === next ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")
      );
      idx = next;
    };

    steps.forEach((b, i) => b.addEventListener("click", () => go(i)));
    proto.querySelectorAll("[data-goto]").forEach((el) => {
      el.addEventListener("click", () => go(Number(el.dataset.goto)));
    });
    document.addEventListener("keydown", (e) => {
      if (!proto.closest("section")?.matches(":hover") &&
          document.activeElement?.closest(".proto-steps, [data-proto]") == null) return;
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    });
    go(0);
  }

  /* ---------- Footer year ---------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
