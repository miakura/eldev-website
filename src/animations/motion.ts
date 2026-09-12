import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initMotion(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-in");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
        onStart: () => {
          el.classList.add("is-in");
        },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>(".case-card").forEach((card) => {
    const media = card.querySelector(".case-media");
    if (!media) {
      return;
    }
    gsap.to(media, {
      y: -18,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}
