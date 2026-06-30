/* =========================================================================
   Navang Gandhi — Personal Website
   Theme · mobile nav · scroll progress · reveal · active link
   · 3D tilt · cursor spotlight · magnetic buttons
   ========================================================================= */

(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme (dark by default) ---------- */
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle.querySelector(".theme-toggle__icon");

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme || "dark");

  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  navToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  var navClickLock = 0;
  navMenu.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      // Underline the clicked tab immediately, and hold it through the smooth scroll.
      navMenu.querySelectorAll(".nav__link").forEach(function (l) {
        l.classList.toggle("active", l === link);
      });
      navClickLock = Date.now();
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Navbar shadow + scroll progress ---------- */
  const navbar = document.getElementById("navbar");
  const progress = document.getElementById("scroll-progress");

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 10);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Active nav link ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        if (Date.now() - navClickLock < 900) return; // don't fight a fresh click
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      // A thin detection band near mid-viewport — reliably tracks even tall sections.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Cursor spotlight ---------- */
  document.querySelectorAll(".spotlight").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- 3D tilt (skipped when reduced motion / touch) ---------- */
  const isTouch = window.matchMedia("(hover: none)").matches;
  if (!prefersReduced && !isTouch) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      const MAX = 7; // degrees
      el.addEventListener("mousemove", function (e) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateX(" + (-py * MAX).toFixed(2) +
          "deg) rotateY(" + (px * MAX).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });

    /* ---------- Magnetic buttons ---------- */
    document.querySelectorAll(".btn--magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.25 + "px, " + (y * 0.25 - 3) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- AI insights: category menu + filter ---------- */
  (function () {
    const feed = document.getElementById("insights-feed");
    const catNav = document.getElementById("insights-cats");
    if (!feed || !catNav) return;
    // Known taxonomy (slug -> label) controls order and naming; unknown slugs
    // found on articles still appear (title-cased) so categories grow on their own.
    const LABELS = {
      "agentic-ai": "Agentic AI",
      "ai-security": "AI Security",
      "identity-access": "Identity & Access",
      "governance-risk": "Governance & Risk",
      "financial-services": "Financial Services",
      "llms-models": "LLMs & Models"
    };
    const ORDER = Object.keys(LABELS);
    const articles = Array.prototype.slice.call(feed.querySelectorAll(".insight-card"));
    const counts = {};
    articles.forEach(function (a) {
      (a.getAttribute("data-categories") || "").split(/\s+/).filter(Boolean).forEach(function (c) {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    const known = ORDER.filter(function (s) { return counts[s]; });
    const unknown = Object.keys(counts).filter(function (s) { return ORDER.indexOf(s) === -1; }).sort();
    const cats = known.concat(unknown);
    function label(slug) {
      return LABELS[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, function (m) { return m.toUpperCase(); });
    }
    function row(cat, text, count, active) {
      return '<li><button type="button" class="cat-btn' + (active ? " active" : "") +
        '" data-cat="' + cat + '">' + text +
        '<span class="cat-btn__count">' + count + "</span></button></li>";
    }
    const list = catNav.querySelector(".insights-cats__list");
    list.innerHTML = row("all", "All", articles.length, true) +
      cats.map(function (slug) { return row(slug, label(slug), counts[slug], false); }).join("");

    list.addEventListener("click", function (e) {
      const btn = e.target.closest(".cat-btn");
      if (!btn) return;
      const cat = btn.getAttribute("data-cat");
      list.querySelectorAll(".cat-btn").forEach(function (b) { b.classList.toggle("active", b === btn); });
      articles.forEach(function (a) {
        const cs = (a.getAttribute("data-categories") || "").split(/\s+/);
        a.style.display = (cat === "all" || cs.indexOf(cat) !== -1) ? "" : "none";
      });
    });
  })();

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
