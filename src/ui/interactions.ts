export function initNavigation(): void {
  const toggle = document.getElementById("navToggle");
  const mobile = document.getElementById("navMobile");
  if (!toggle || !mobile) {
    return;
  }

  const setOpen = (open: boolean): void => {
    mobile.classList.toggle("is-open", open);
    mobile.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => {
    setOpen(!mobile.classList.contains("is-open"));
  });

  mobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setOpen(false);
    });
  });

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main section[id], #top"),
  );
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".nav-desktop a[href^='#']"),
  );

  const onScroll = (): void => {
    const y = window.scrollY + 120;
    let current = "top";
    sections.forEach((section) => {
      if (section.offsetTop <= y) {
        current = section.id || "top";
      }
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.replace("#", "") || "";
      link.classList.toggle("is-active", href === current || (current === "top" && href === "top"));
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

export function initReveal(): void {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => {
      item.classList.add("is-in");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  items.forEach((item) => {
    observer.observe(item);
  });
}
