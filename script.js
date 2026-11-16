(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------
     Mobile menu
     ------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const navLinks = menu.querySelectorAll("a");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after choosing a link
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

  // Close with Escape, and return focus to the button
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close when tapping outside the header
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open") && !header.contains(e.target)) {
      setMenu(false);
    }
  });

  // Reset when resizing up to the desktop layout
  window.matchMedia("(min-width: 860px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ------------------------------------------------------
     Navbar border once the page scrolls
     ------------------------------------------------------ */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ------------------------------------------------------
     Highlight the link for the section in view
     ------------------------------------------------------ */
  const sections = document.querySelectorAll("main section[id]");
  const linkById = new Map();
  navLinks.forEach((link) => linkById.set(link.getAttribute("href").slice(1), link));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((l) => {
            l.classList.remove("is-active");
            l.removeAttribute("aria-current");
          });
          const active = linkById.get(entry.target.id);
          if (active) {
            active.classList.add("is-active");
            active.setAttribute("aria-current", "true");
          }
        });
      },
      // A section counts as current while it crosses the middle band of the screen
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------
     Hero: rotating phrase
     ------------------------------------------------------ */
  const rotator = document.getElementById("rotator");
  const phrases = ["responsive web pages", "small web apps", "projects that solve little problems"];

  if (rotator && !prefersReducedMotion) {
    let index = 0;
    setInterval(() => {
      rotator.classList.add("is-hidden");
      setTimeout(() => {
        index = (index + 1) % phrases.length;
        rotator.textContent = phrases[index];
        rotator.classList.remove("is-hidden");
      }, 300);
    }, 2800);
  }

  /* ------------------------------------------------------
     Contact form
     ------------------------------------------------------ */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    name: (v) => (v.trim().length < 2 ? "Enter your name." : ""),
    email: (v) => (!emailPattern.test(v.trim()) ? "Enter a valid email address, like name@example.com." : ""),
    message: (v) => (v.trim().length < 10 ? "Write at least 10 characters so I know how to help." : ""),
  };

  function showError(field, message) {
    const wrapper = field.closest(".field");
    const output = wrapper.querySelector(".error");
    wrapper.classList.toggle("has-error", Boolean(message));
    output.textContent = message;
    if (message) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", output.id || (output.id = `${field.id}-error`));
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function validateField(field) {
    const message = rules[field.name](field.value);
    showError(field, message);
    return !message;
  }

  // Validate on blur, then live once a field has been flagged
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";

    const fields = Array.from(form.elements).filter((el) => rules[el.name]);
    const results = fields.map(validateField);

    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      return;
    }

    // No backend: open the visitor's email app with the message filled in.
    // Replace the address below with your own, or swap in a form service.
    const data = new FormData(form);
    const subject = encodeURIComponent(`Portfolio message from ${data.get("name").trim()}`);
    const body = encodeURIComponent(`${data.get("message").trim()}\n\n${data.get("name").trim()}\n${data.get("email").trim()}`);
    window.location.href = `mailto:your.email@example.com?subject=${subject}&body=${body}`;

    status.textContent = "Opening your email app. Send the message from there.";
    form.reset();
  });

  /* ------------------------------------------------------
     Footer year
     ------------------------------------------------------ */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();