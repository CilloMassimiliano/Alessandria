/* ============================================================
   Rete del Dono — clone demo · interazioni
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.getElementById("site-header");

  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("burger");
  var navMenu = document.getElementById("nav-menu");
  var burgerIcon = document.querySelector("#burger-icon use");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Apri il menu");
    burgerIcon.setAttribute("href", "#i-menu");
    document.body.classList.remove("no-scroll");
    document.querySelectorAll(".has-menu.is-open").forEach(function (el) {
      el.classList.remove("is-open");
      var btn = el.querySelector(".nav-link");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  burger.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Chiudi il menu" : "Apri il menu");
    burgerIcon.setAttribute("href", isOpen ? "#i-close" : "#i-menu");
    document.body.classList.toggle("no-scroll", isOpen);
  });

  /* ---------- Dropdown (tap su mobile / click su desktop) ---------- */
  document.querySelectorAll(".has-menu > .nav-link").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      var parent = btn.parentElement;
      var isMobile = window.matchMedia("(max-width: 991px)").matches;

      if (!isMobile) return; // su desktop apre l'hover/focus

      event.preventDefault();
      var open = parent.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));

      document.querySelectorAll(".has-menu").forEach(function (other) {
        if (other !== parent) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".nav-link");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  // Chiudi il menu quando si clicca una voce
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 991px)").matches) closeMenu();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 991) closeMenu();
  });

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 3, 2) * 80 + "ms";
      revealObserver.observe(el);
    });
  }

  /* ---------- Accordion FAQ ---------- */
  var accordion = document.getElementById("accordion");

  function setPanel(item, open) {
    var trigger = item.querySelector(".accordion-trigger");
    var panel = item.querySelector(".accordion-panel");
    var use = item.querySelector(".accordion-icon use");

    trigger.setAttribute("aria-expanded", String(open));
    use.setAttribute("href", open ? "#i-minus" : "#i-plus");

    if (open) {
      panel.style.height = panel.scrollHeight + "px";
      panel.addEventListener("transitionend", function handler(e) {
        if (e.propertyName !== "height") return;
        panel.style.height = "auto";
        panel.removeEventListener("transitionend", handler);
      });
    } else {
      panel.style.height = panel.scrollHeight + "px";
      void panel.offsetHeight; // forza il reflow
      panel.style.height = "0px";
    }
  }

  if (accordion) {
    var items = accordion.querySelectorAll(".accordion-item");

    items.forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      var panel = item.querySelector(".accordion-panel");

      // stato iniziale
      if (trigger.getAttribute("aria-expanded") === "true") {
        panel.style.height = "auto";
      } else {
        panel.style.height = "0px";
      }

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        items.forEach(function (other) {
          if (other === item) return;
          if (other.querySelector(".accordion-trigger").getAttribute("aria-expanded") === "true") {
            setPanel(other, false);
          }
        });

        setPanel(item, !isOpen);
      });
    });

    window.addEventListener("resize", function () {
      items.forEach(function (item) {
        var panel = item.querySelector(".accordion-panel");
        if (panel.style.height !== "auto" && panel.style.height !== "0px") {
          panel.style.height = "auto";
        }
      });
    });
  }

  /* ---------- Carosello testimonianze ---------- */
  var track = document.getElementById("testimonial-track");
  var dotsWrap = document.getElementById("dots");
  var prevBtn = document.getElementById("prev-slide");
  var nextBtn = document.getElementById("next-slide");

  if (track && dotsWrap) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Testimonianza " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-selected", String(i === current));
      });
      slides.forEach(function (slide, i) {
        slide.setAttribute("aria-hidden", String(i !== current));
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(function () { goTo(current + 1); }, 9000);
    }

    prevBtn.addEventListener("click", function () { goTo(current - 1); restart(); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); restart(); });

    var region = document.getElementById("testimonial");
    region.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    region.addEventListener("mouseleave", restart);
    region.addEventListener("focusin", function () { if (timer) clearInterval(timer); });
    region.addEventListener("focusout", restart);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    });

    goTo(0);
    restart();
  }

  /* ---------- Form contatti ---------- */
  var form = document.getElementById("contact-form");
  var feedback = document.getElementById("form-feedback");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      feedback.classList.remove("is-error");
      feedback.textContent = "";

      var required = ["nome", "email", "messaggio", "privacy"];
      var firstInvalid = null;

      required.forEach(function (id) {
        var el = document.getElementById(id);
        var invalid = el.type === "checkbox" ? !el.checked : !String(el.value).trim();
        el.classList.toggle("is-invalid", invalid);
        if (invalid && !firstInvalid) firstInvalid = el;
      });

      var email = document.getElementById("email");
      if (!firstInvalid && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) {
        email.classList.add("is-invalid");
        firstInvalid = email;
      }

      if (firstInvalid) {
        feedback.classList.add("is-error");
        feedback.textContent = "Controlla i campi evidenziati per inviare la richiesta.";
        firstInvalid.focus();
        return;
      }

      var nome = document.getElementById("nome").value.trim().split(" ")[0];
      feedback.textContent = "Grazie " + nome + "! Richiesta inviata: ti ricontatteremo entro 2 giorni lavorativi.";
      form.reset();
      form.querySelectorAll(".is-invalid").forEach(function (el) { el.classList.remove("is-invalid"); });
    });

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("is-invalid");
      });
    });
  }

  /* ---------- Torna in alto ---------- */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
