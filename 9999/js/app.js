(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const THEME_KEY = "portfolio-theme";

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getSupabaseClient() {
    const url = cfg.supabaseUrl;
    const key = cfg.supabaseAnonKey;
    if (
      !url ||
      !key ||
      url === "YOUR_SUPABASE_URL" ||
      key === "YOUR_SUPABASE_ANON_KEY" ||
      typeof window.supabase === "undefined"
    ) {
      return null;
    }
    return window.supabase.createClient(url, key);
  }

  function toast(message, variant) {
    const host = document.querySelector("[data-toast-host]");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "toast toast--" + (variant === "error" ? "err" : "ok");
    el.textContent = message;
    host.appendChild(el);
    window.setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity 0.35s, transform 0.35s";
      window.setTimeout(() => el.remove(), 380);
    }, 3200);
  }

  function initTheme() {
    const root = document.documentElement;
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", theme);

    document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;

    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const p = scrollable <= 0 ? 0 : Math.round((window.scrollY / scrollable) * 100);
      bar.style.width = p + "%";
      bar.setAttribute("aria-valuenow", String(p));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("is-open")) return;
      if (toggle.contains(e.target) || menu.contains(e.target)) return;
      setOpen(false);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    els.forEach((el) => io.observe(el));
  }

  function initYear() {
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initSpotlight() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll("[data-spotlight]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", x + "%");
        el.style.setProperty("--my", y + "%");
      });
    });
  }

  function initTilt() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (-py * 10).toFixed(2);
        const ry = (px * 12).toFixed(2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        });
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  function initTyping() {
    const out = document.querySelector("[data-typing]");
    if (!out) return;

    const lines = [
      "Platforma va ma’lumot oqimlari",
      "Ko‘p ijarachi SaaS",
      "Dizayn tizimi va DX",
      "Ishlash tezligi va kuzatuv",
    ];

    if (prefersReducedMotion()) {
      out.textContent = lines[0];
      return;
    }

    let li = 0;
    let ch = 0;
    let deleting = false;

    const tick = () => {
      const full = lines[li];
      if (!deleting) {
        ch += 1;
        out.textContent = full.slice(0, ch);
        if (ch === full.length) {
          window.setTimeout(() => {
            deleting = true;
            tick();
          }, 1600);
          return;
        }
      } else {
        ch -= 1;
        out.textContent = full.slice(0, Math.max(0, ch));
        if (ch <= 0) {
          deleting = false;
          li = (li + 1) % lines.length;
        }
      }
      const delay = deleting ? 45 : 52;
      window.setTimeout(tick, delay);
    };

    tick();
  }

  function initCounters() {
    const root = document.querySelector("[data-count-root]");
    if (!root) return;

    const run = () => {
      root.querySelectorAll("[data-count]").forEach((span) => {
        const target = Number(span.getAttribute("data-count") || "0");
        const suffix = span.getAttribute("data-suffix") || "";
        const dur = 1100;
        const t0 = performance.now();

        const step = (now) => {
          const t = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = Math.round(target * eased);
          span.textContent = val + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    if (prefersReducedMotion()) {
      root.querySelectorAll("[data-count]").forEach((span) => {
        span.textContent = (span.getAttribute("data-count") || "0") + (span.getAttribute("data-suffix") || "");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(root);
  }

  function initProjectFilter() {
    const bar = document.querySelector("[data-project-filter]");
    const tiles = document.querySelectorAll("[data-category]");
    if (!bar || !tiles.length) return;

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      const f = btn.getAttribute("data-filter") || "all";
      bar.querySelectorAll(".filter__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      tiles.forEach((tile) => {
        const cat = tile.getAttribute("data-category") || "";
        const show = f === "all" || cat === f;
        tile.classList.toggle("is-hidden", !show);
      });
    });
  }

  const CMD_NAV = [
    { href: "#top", title: "Bosh sahifa", hint: "Hero" },
    { href: "#work", title: "Loyihalar", hint: "Portfolio" },
    { href: "#stack", title: "Stack", hint: "Texnologiyalar" },
    { href: "#experience", title: "Tajriba", hint: "Timeline" },
    { href: "#contact", title: "Aloqa", hint: "Forma" },
  ];

  function initCommandPalette() {
    const dialog = document.querySelector("[data-cmd-dialog]");
    const openBtn = document.querySelector("[data-cmd-open]");
    const input = document.querySelector("[data-cmd-input]");
    const list = document.querySelector("[data-cmd-results]");
    if (!dialog || !input || !list) return;

    let active = 0;
    let filtered = CMD_NAV.slice();

    const render = () => {
      list.innerHTML = "";
      if (!filtered.length) {
        const empty = document.createElement("li");
        empty.className = "cmd__empty";
        empty.textContent = "Hech narsa topilmadi.";
        list.appendChild(empty);
        return;
      }
      filtered.forEach((item, i) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cmd__item" + (i === active ? " is-active" : "");
        btn.innerHTML = "<span>" + item.title + "</span><small>" + item.hint + "</small>";
        btn.addEventListener("click", () => {
          navigate(item.href);
          dialog.close();
        });
        li.appendChild(btn);
        list.appendChild(li);
      });
    };

    const navigate = (href) => {
      const t = document.querySelector(href);
      if (t) {
        t.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", href);
      }
    };

    const filter = (q) => {
      const s = q.trim().toLowerCase();
      filtered = CMD_NAV.filter(
        (x) =>
          !s ||
          x.title.toLowerCase().includes(s) ||
          x.hint.toLowerCase().includes(s) ||
          x.href.includes(s)
      );
      active = 0;
      render();
    };

    const open = () => {
      if (typeof dialog.showModal !== "function") return;
      dialog.showModal();
      input.value = "";
      filter("");
      window.setTimeout(() => input.focus(), 10);
    };

    openBtn?.addEventListener("click", open);

    window.addEventListener("keydown", (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dialog.open ? dialog.close() : open();
        return;
      }
      if (e.key === "/" && !isTypingContext(e.target)) {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && dialog.open) {
        dialog.close();
      }
    });

    function isTypingContext(t) {
      const tag = (t && t.tagName) || "";
      return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
    }

    input.addEventListener("input", () => filter(input.value));

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = (active + 1) % Math.max(1, filtered.length);
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = (active - 1 + filtered.length) % Math.max(1, filtered.length);
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[active];
        if (item) {
          navigate(item.href);
          dialog.close();
        }
      }
    });

    render();
  }

  function initCopyEmail() {
    document.querySelectorAll("[data-copy-email]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const email = btn.getAttribute("data-email") || "";
        if (!email || email === "you@example.com") {
          toast("js/config.js yoki HTML da haqiqiy email qo‘ying.", "error");
          return;
        }
        try {
          await navigator.clipboard.writeText(email);
          toast("Email buferga nusxalandi: " + email, "ok");
        } catch {
          toast("Brauzer nusxalashga ruxsat bermadi.", "error");
        }
      });
    });
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".field-error").forEach((n) => {
      n.textContent = "";
    });
  }

  function validateContact(form) {
    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");
    let ok = true;

    const setErr = (id, text) => {
      const el = form.querySelector('[data-error-for="' + id + '"]');
      if (el) el.textContent = text;
      ok = false;
    };

    if (!name.value.trim()) setErr("name", "Ismingizni kiriting.");
    if (!email.value.trim()) {
      setErr("email", "Email manzilingizni kiriting.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setErr("email", "To‘g‘ri email formatini kiriting.");
    }
    if (!message.value.trim()) setErr("message", "Qisqacha vazifani yozing.");

    return ok;
  }

  function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const status = form.querySelector("[data-form-status]");
    const submitBtn = form.querySelector("[data-submit]");
    const client = getSupabaseClient();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFieldErrors(form);
      if (!validateContact(form)) return;

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim() || null,
        message: form.message.value.trim(),
      };

      if (!client) {
        if (status) {
          status.textContent =
            "Supabase sozlanmagan. js/config.js ga URL va anon kalit qo‘ying, sql/supabase_schema.sql ni Supabase da ishga tushiring.";
          status.classList.remove("is-success");
          status.classList.add("is-error");
        }
        toast("Supabase ulanishi yo‘q — config ni to‘ldiring.", "error");
        return;
      }

      submitBtn.disabled = true;
      if (status) {
        status.textContent = "Yuborilmoqda…";
        status.classList.remove("is-success", "is-error");
      }

      const { error } = await client.from("contact_messages").insert([payload]);

      submitBtn.disabled = false;

      if (error) {
        if (status) {
          status.textContent =
            error.message || "Yuborib bo‘lmadi. Jadval nomi, RLS va kalitlarni tekshiring.";
          status.classList.add("is-error");
          status.classList.remove("is-success");
        }
        toast("Xabar saqlanmadi.", "error");
        return;
      }

      form.reset();
      if (status) {
        status.textContent = "Rahmat! Xabaringiz saqlandi — tez orada aloqaga chiqaman.";
        status.classList.add("is-success");
        status.classList.remove("is-error");
      }
      toast("Xabar muvaffaqiyatli yuborildi.", "ok");
    });
  }

  function initSmoothNavHash() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
        history.pushState(null, "", id);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollProgress();
    initHeader();
    initNav();
    initReveal();
    initYear();
    initSpotlight();
    initTilt();
    initTyping();
    initCounters();
    initProjectFilter();
    initCommandPalette();
    initCopyEmail();
    initContactForm();
    initSmoothNavHash();
  });
})();
