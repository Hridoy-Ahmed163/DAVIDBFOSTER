/* ==========================================================================
   David B. Foster Ministries — interactions
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * CONFIG — edit these before launch
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Analytics (loads only after cookie consent)
    GA4_ID: "G-XXXXXXXXXX",          // replace with the GA4 measurement ID
    META_PIXEL_ID: "PIXEL_ID_HERE",  // replace with the Meta Pixel ID

    // Form delivery: point this at your form endpoint (Formspree, Netlify
    // Forms, a Worker, etc). While empty, forms fall back to a mailto draft
    // so no enquiry is silently lost.
    FORM_ENDPOINT: "",

    FALLBACK_EMAIL: "hello@davidbfoster.org",

    // YouTube: paste video IDs into the data-yt attributes in index.html.
    // Empty values are treated as placeholders and show a setup notice.
  };

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------ *
   * Header: condense on scroll, progress bar, scrollspy
   * ------------------------------------------------------------------ */
  const head = $("#siteHead");
  const progress = $("#scrollProgress");
  const nav = $("#siteNav");
  const navToggle = $("#navToggle");

  function onScroll() {
    const y = window.scrollY;
    head.classList.toggle("is-stuck", y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--p", max > 0 ? Math.min(y / max, 1) : 0);
    }
    setActiveLink(y);
  }

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (nav) {
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setNav(false);
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) {
      setNav(false);
      navToggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) setNav(false);
  });

  /* ------------------------------------------------------------------ *
   * Scrollspy — marks the section currently in view
   * ------------------------------------------------------------------ */
  const navLinks = $$(".site-nav__list a");
  const spySections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? document.getElementById(id.slice(1)) : null;
    })
    .filter(Boolean);

  let activeId = "";
  function setActiveLink() {
    if (!spySections.length) return;
    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = spySections[0].id;
    for (const section of spySections) {
      if (section.offsetTop <= probe) current = section.id;
    }
    if (current === activeId) return;
    activeId = current;
    navLinks.forEach((link) => {
      const match = link.getAttribute("href") === "#" + current;
      if (match) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  const revealEls = $$("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(() => el.classList.add("is-in"), delay);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * Countdown
   * ------------------------------------------------------------------ */
  const countdown = $("#countdown");
  if (countdown) {
    const target = new Date(countdown.dataset.countdown).getTime();
    const cells = {
      days: countdown.querySelector('[data-unit="days"]'),
      hours: countdown.querySelector('[data-unit="hours"]'),
      minutes: countdown.querySelector('[data-unit="minutes"]'),
      seconds: countdown.querySelector('[data-unit="seconds"]')
    };
    const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        Object.values(cells).forEach((el) => el && (el.textContent = "00"));
        countdown.setAttribute("aria-label", "The Nashville Healing Revival is underway or has concluded.");
        clearInterval(timer);
        return;
      }
      const s = Math.floor(diff / 1000);
      if (cells.days) cells.days.textContent = pad(Math.floor(s / 86400));
      if (cells.hours) cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      if (cells.minutes) cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      if (cells.seconds) cells.seconds.textContent = pad(s % 60);
    };

    tick();
    const timer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.hidden = true), 5200);
  }

  /* ------------------------------------------------------------------ *
   * Video facades — click to load YouTube (keeps first paint light)
   * ------------------------------------------------------------------ */
  const YT_PLACEHOLDER = "This message is being prepared. Subscribe on YouTube and you will see it first.";

  function playVideo(facade) {
    const id = (facade.dataset.yt || "").trim();
    if (!id) {
      toast(YT_PLACEHOLDER);
      console.info("[dbf] No video ID yet — add one to this element's data-yt attribute in index.html.", facade);
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    iframe.title = facade.getAttribute("aria-label") || "YouTube video player";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;";
    facade.replaceWith(iframe);
  }

  $$(".video-facade").forEach((facade) => {
    facade.addEventListener("click", () => playVideo(facade));
  });

  $$(".link-arrow[data-yt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".video-card");
      const facade = card && card.querySelector(".video-facade");
      if (facade) {
        facade.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        playVideo(facade);
      } else {
        toast(YT_PLACEHOLDER);
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * Teaching filters
   * ------------------------------------------------------------------ */
  const chips = $$(".chip[data-filter]");
  const cards = $$("#videoGrid .video-card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.topic === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Share
   * ------------------------------------------------------------------ */
  $$("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href.split("#")[0] + "#events";
      const data = {
        title: btn.dataset.shareTitle || document.title,
        text: btn.dataset.shareText || "",
        url
      };
      const msg = $("[data-share-msg]", btn.closest(".event-featured__info") || document);
      try {
        if (navigator.share) {
          await navigator.share(data);
          if (msg) msg.textContent = "Shared. Thank you for spreading the word.";
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.title + " — " + url);
          if (msg) msg.textContent = "Link copied to your clipboard.";
        } else {
          if (msg) msg.textContent = url;
        }
      } catch (err) {
        if (err && err.name !== "AbortError" && msg) msg.textContent = "Copy this link: " + url;
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * Forms
   * ------------------------------------------------------------------ */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setNote(note, message, state) {
    if (!note) return;
    note.textContent = message;
    note.classList.toggle("is-error", state === "error");
    note.classList.toggle("is-success", state === "success");
  }

  function formToObject(form) {
    const data = new FormData(form);
    const out = {};
    data.forEach((value, key) => {
      out[key] = typeof value === "string" ? value.trim() : value;
    });
    return out;
  }

  function validate(form, data) {
    if (form.dataset.form === "contact") {
      if (!data.name) return "Please add your name.";
      if (!data.email || !emailRe.test(data.email)) return "Please enter a valid email address.";
      if (!data.message || data.message.length < 8) return "Please add a short message (at least a few words).";
      return "";
    }
    if (!data.email || !emailRe.test(data.email)) return "Please enter a valid email address.";
    return "";
  }

  $$("form[data-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const note = $("[data-form-msg]", form);
      const data = formToObject(form);
      const error = validate(form, data);

      if (error) {
        setNote(note, error, "error");
        const firstBad = form.querySelector(":invalid") || form.querySelector("input, textarea, select");
        if (firstBad) firstBad.focus();
        return;
      }

      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      if (!CONFIG.FORM_ENDPOINT) {
        // Fallback: hand the message to the visitor's mail client.
        const subject = "Website enquiry — " + (data.type || form.dataset.form);
        const body = Object.entries(data)
          .map(([k, v]) => k + ": " + v)
          .join("\n");
        window.location.href =
          "mailto:" + CONFIG.FALLBACK_EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        setNote(note, "Your email app should open with the message ready to send. Prefer email? Write to " + CONFIG.FALLBACK_EMAIL + ".", "success");
        if (submit) submit.disabled = false;
        return;
      }

      try {
        const response = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Request failed with " + response.status);
        form.reset();
        setNote(note, "Thank you — we have your message and will be in touch.", "success");
        if (window.gtag) window.gtag("event", "generate_lead", { form: form.dataset.form });
      } catch (err) {
        setNote(note, "Something went wrong. Please email " + CONFIG.FALLBACK_EMAIL + " and we will pick it up there.", "error");
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  // Clear an error as soon as the visitor starts fixing it.
  $$("form[data-form] input, form[data-form] textarea").forEach((input) => {
    input.addEventListener("input", () => {
      const note = $("[data-form-msg]", input.closest("form"));
      if (note && note.classList.contains("is-error")) setNote(note, "", "");
    });
  });

  /* ------------------------------------------------------------------ *
   * Consent + analytics
   * ------------------------------------------------------------------ */
  const consent = $("#consent");
  const consentAccept = $("#consentAccept");
  const consentDecline = $("#consentDecline");
  const cookieSettings = $("#cookieSettings");
  const STORAGE_KEY = "dbf-consent";

  const analyticsReady = {
    ga: !CONFIG.GA4_ID.includes("X"),
    pixel: !CONFIG.META_PIXEL_ID.includes("HERE")
  };

  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    if (analyticsReady.ga) {
      const tag = document.createElement("script");
      tag.async = true;
      tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.GA4_ID);
      document.head.appendChild(tag);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", CONFIG.GA4_ID, { anonymize_ip: true });
    }

    if (analyticsReady.pixel) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CONFIG.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }
  }

  function storeConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked */ }
  }
  function readConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function hideConsent() {
    if (consent) consent.hidden = true;
    if (cookieSettings) cookieSettings.hidden = false;
  }

  function showConsent() {
    if (consent) consent.hidden = false;
    if (cookieSettings) cookieSettings.hidden = true;
  }

  const saved = readConsent();
  if (saved === "granted") {
    hideConsent();
    loadAnalytics();
  } else if (saved === "denied") {
    hideConsent();
  } else {
    setTimeout(showConsent, 1400);
  }

  consentAccept && consentAccept.addEventListener("click", () => {
    storeConsent("granted");
    hideConsent();
    loadAnalytics();
  });
  consentDecline && consentDecline.addEventListener("click", () => {
    storeConsent("denied");
    hideConsent();
  });
  cookieSettings && cookieSettings.addEventListener("click", showConsent);
  $("#consentPolicy")?.addEventListener("click", () => openPrivacy());

  /* ------------------------------------------------------------------ *
   * Privacy dialog
   * ------------------------------------------------------------------ */
  const privacyDialog = $("#privacyDialog");

  function openPrivacy() {
    if (!privacyDialog) return;
    if (typeof privacyDialog.showModal === "function") privacyDialog.showModal();
    else privacyDialog.setAttribute("open", "");
  }

  $("#privacyLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    openPrivacy();
  });
  $$("[data-close-dialog]").forEach((btn) =>
    btn.addEventListener("click", () => privacyDialog && privacyDialog.close())
  );
  privacyDialog?.addEventListener("click", (e) => {
    if (e.target === privacyDialog) privacyDialog.close();
  });
  if (location.hash === "#privacy") openPrivacy();

  /* ------------------------------------------------------------------ *
   * Small housekeeping
   * ------------------------------------------------------------------ */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Remove the reveal class from above-the-fold hero items immediately.
  $$(".hero [data-reveal]").forEach((el) => el.classList.add("is-in"));
})();
