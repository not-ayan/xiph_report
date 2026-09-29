/* Xiph report site — behaviors
   scrollspy · mobile drawer · reveal on load · code copy · reading progress */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- polite live region for async updates ---------- */
  var live = document.createElement("p");
  live.className = "visually-hidden";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);

  /* ---------- reading progress ---------- */
  var bar = document.getElementById("progress-bar");
  function paintBar() {
    if (!bar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
  }

  /* ---------- sidebar scrollspy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[data-spy]'));
  var targets = tocLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  var current = null;
  function spy() {
    var probe = window.innerHeight * 0.28;
    var best = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].getBoundingClientRect().top <= probe) best = targets[i];
      else break;
    }
    var id = best ? best.id : null;
    if (id === current) return;
    current = id;
    tocLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on && a.scrollIntoView) {
        a.scrollIntoView({ block: "nearest" });
      }
    });
  }

  /* ---------- mobile drawer ---------- */
  var sidebar = document.getElementById("sidebar");
  var menuBtn = document.getElementById("menu-btn");
  var backdrop = document.getElementById("backdrop");

  function openDrawer() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    document.body.classList.add("drawer-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.classList.remove("drawer-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && sidebar) {
    menuBtn.hidden = false;
    menuBtn.addEventListener("click", function () {
      sidebar.classList.contains("open") ? closeDrawer() : openDrawer();
    });
    if (backdrop) {
      backdrop.addEventListener("click", closeDrawer);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
    sidebar.addEventListener("click", function (e) {
      if (e.target instanceof Element && e.target.closest("a")) closeDrawer();
    });
  }

  /* ---------- code copy ---------- */
  document.querySelectorAll(".code .copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fig = btn.closest(".code");
      var pre = fig ? fig.querySelector("pre") : null;
      var text = pre ? pre.textContent : "";
      var done = function () {
        btn.textContent = "Copied";
        btn.dataset.copied = "true";
        if (live) live.textContent = "Copied to clipboard";
        setTimeout(function () {
          btn.textContent = "Copy";
          delete btn.dataset.copied;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
  });

  /* ---------- reveal: hero immediately, sections via IntersectionObserver ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function show(el) { el.classList.add("in"); }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(show);
  } else {
    var hero = document.querySelector(".hero");
    if (hero && hero.classList.contains("reveal")) show(hero);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.02 });
    revealEls.forEach(function (el) {
      if (el === hero) return;
      io.observe(el);
    });
  }

  /* ---------- scroll listeners ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      paintBar();
      spy();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  paintBar();
  spy();
})();
