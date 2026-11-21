(() => {
  const nav = document.querySelector(".site-nav");
  const backToTop = document.querySelector(".back-to-top");
  const navCollapse = document.querySelector("#mainNavigation");
  const scrollTargets = document.querySelectorAll('a[href^="#"]');

  const updateScrollUI = () => {
    const scrolled = window.scrollY > 40;
    nav?.classList.toggle("scrolled", scrolled);
    backToTop?.classList.toggle("visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  scrollTargets.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (link.dataset.enquiryType) {
        const enquiryType = document.querySelector("#enquiry-type");
        if (enquiryType) enquiryType.value = link.dataset.enquiryType;
      }
      if (navCollapse?.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const phonePattern = /^[+]?[0-9\s()-]{7,20}$/;
  const setupForm = (form, successMessage, options = {}) => {
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const phone = form.querySelector('input[type="tel"]');
      const file = form.querySelector('input[type="file"]');
      if (phone) {
        const digitCount = (phone.value.match(/[0-9]/g) || []).length;
        const validPhone = phonePattern.test(phone.value.trim()) && digitCount >= 7 && digitCount <= 15;
        phone.setCustomValidity(validPhone ? "" : "Enter a valid phone number.");
      }
      if (options.validateAge) {
        const age = form.querySelector('input[name="age"]');
        age?.setCustomValidity(Number(age.value) >= 16 && Number(age.value) <= 99 ? "" : "Age must be between 16 and 99.");
      }
      if (file) {
        const validFile = !file.files?.[0] || file.files[0].size <= 5 * 1024 * 1024;
        file.setCustomValidity(validFile ? "" : "Please choose a file no larger than 5 MB.");
      }

      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        status.textContent = "Please check the highlighted fields and try again.";
        status.classList.add("text-danger");
        form.querySelector(":invalid")?.focus();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonContent = submitButton?.innerHTML;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      status.classList.remove("text-danger");
      status.textContent = "Sending your message…";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "We could not send your message. Please try again.");
          }
          status.textContent = result.message || successMessage;
          form.reset();
          form.classList.remove("was-validated");
        })
        .catch((error) => {
          status.classList.add("text-danger");
          status.textContent = error.message || "Unable to reach the server. Please try again later.";
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.innerHTML = originalButtonContent;
          }
        });
    });

    form?.querySelectorAll('input[type="tel"]').forEach((phone) => {
      phone.addEventListener("input", () => phone.setCustomValidity(""));
    });
    form?.querySelectorAll('input[type="file"]').forEach((file) => {
      file.addEventListener("change", () => file.setCustomValidity(""));
    });
  };

  setupForm(document.querySelector("#enquiry"), "Thank you for your enquiry.");
  setupForm(document.querySelector("#stall-enquiry"), "Thank you for your stall enquiry.");
  setupForm(document.querySelector("#model-form"), "Thank you for your model registration.", { validateAge: true });

  const countdown = document.querySelector(".countdown-wrap");
  const eventDate = countdown?.dataset.eventDate;
  if (eventDate) {
    const targetTime = new Date(eventDate).getTime();
    const units = {
      days: 24 * 60 * 60 * 1000,
      hours: 60 * 60 * 1000,
      minutes: 60 * 1000,
      seconds: 1000
    };
    const updateCountdown = () => {
      let remaining = targetTime - Date.now();
      if (remaining <= 0) {
        countdown.querySelector(".countdown-label").textContent = "The ADA Fashion Event is here.";
        Object.keys(units).forEach((unit) => {
          countdown.querySelector(`[data-count="${unit}"]`).textContent = "00";
        });
        return;
      }
      Object.entries(units).forEach(([unit, milliseconds]) => {
        const value = unit === "days" ? Math.floor(remaining / milliseconds) : Math.floor(remaining / milliseconds) % (unit === "hours" ? 24 : 60);
        countdown.querySelector(`[data-count="${unit}"]`).textContent = String(value).padStart(2, "0");
        remaining %= milliseconds;
      });
    };
    if (!Number.isNaN(targetTime)) {
      updateCountdown();
      window.setInterval(updateCountdown, 1000);
    }
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const lightbox = document.querySelector("#gallery-lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeLightbox = () => {
    lightbox?.classList.remove("open");
    lightbox?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  document.querySelectorAll("[data-gallery-image]").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.galleryImage;
      lightboxImage.alt = item.querySelector("img")?.alt || "Fashion gallery image";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    });
  });
  lightbox?.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox?.classList.contains("open")) closeLightbox();
  });
})();
