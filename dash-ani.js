document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.innerWidth <= 700;

  // Ensure consistent 3D space for all cards
  gsap.set(".card", {
    transformPerspective: 1200,
    transformOrigin: "center center",
    transformStyle: "preserve-3d",
  });

  // ===== 🎬 Main 3D Entrance Animation =====
  const cards = gsap.utils.toArray(".card");
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  cards.forEach((card, i) => {
    const fromLeft = i % 2 === 0; // alternate rotation direction
    tl.from(card, {
      opacity: 0,
      y: isMobile ? 30 : 50,
      rotateY: fromLeft ? -55 : 55,
      scale: 0.92,
      duration: 1.2,
      delay: i * 0.1,
      ease: "power3.out",
      clearProps: "transform",
    }, i * 0.1);
  });

  // ===== 🌫️ Gentle Floating Effect =====
  gsap.utils.toArray(".card").forEach((card, i) => {
    gsap.to(card, {
      y: "+=3",
      duration: 3.5 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.2,
    });
  });

  // ===== 🌊 Sidebar & Header Smooth Entrance =====
  gsap.from(".sidebar, .dashboard-title, .header", {
    opacity: 0,
    x: -40,
    duration: 1,
    ease: "power2.out",
    delay: 0.3,
  });

  // ===== ✨ Right Panel Scroll Reveal =====
  gsap.utils.toArray(".right-panel .card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 30,
      rotateY: i % 2 === 0 ? -45 : 45,
      duration: 1.2,
      ease: "power3.out",
      clearProps: "transform",
    });
  });

  // ===== 🖱️ Hover Lift Effect =====
  if (!isMobile) {
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          scale: 1.05,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
          boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.inOut",
          boxShadow: "none",
        });
      });
    });
  }

  // ===== 👋 Greeting Animation =====
  gsap.from("#greeting", {
    opacity: 0,
    y: -25,
    duration: 1.1,
    ease: "back.out(1.6)",
  });




});
