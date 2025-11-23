// Initialize LocomotiveScroll (keep as you had)
const scroll = new LocomotiveScroll({
  el: document.querySelector('#main'),
  smooth: true,
});

// Page intro animation
function firstPageAnim() {
  const tl = gsap.timeline();

  tl.from("#nav", {
    y: -10,
    opacity: 0,
    duration: 1.5, // fixed typo
    ease: "expo.inOut"
  })
    .to(".boundingelem", {
      y: 0,
      ease: "expo.inOut",
      duration: 2,
      delay: -1,
      stagger: 0.2
    })
    .from("#herofooter", {
      y: -10,
      opacity: 0,
      duration: 1,
      delay: -0.3,
      ease: "expo.inOut"
    });
}

/*
  Single efficient mouse follower:
  - Uses one mousemove listener
  - Computes delta-based scale values (clamped)
  - Uses requestAnimationFrame for smooth DOM updates
  - Adds a small idle reset after mouse stops
*/
(function setupCircleFollower() {
  const mini = document.querySelector("#minicircle");
  if (!mini) return;

  let lastX = 0;
  let lastY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentScaleX = 1;
  let currentScaleY = 1;
  let idleTimer = null;
  let rAF = null;

  // normalized clamp helper (min, max, rawDelta)
  const calcScale = (delta, maxDelta = 80, minS = 0.8, maxS = 1.2) => {
    const v = Math.max(-maxDelta, Math.min(maxDelta, delta)); // clamp delta
    // map delta (-maxDelta..maxDelta) to (minS..maxS)
    return ((v + maxDelta) / (2 * maxDelta)) * (maxS - minS) + minS;
  };

  function update() {
    // lerp current transforms for smoother motion
    const lerp = (a, b, n = 0.18) => a + (b - a) * n;

    const rect = mini.getBoundingClientRect(); // not strictly necessary, kept for future use

    // smoothly update scale and position
    currentScaleX = lerp(currentScaleX, currentScaleX, 0.2); // keep current; scales set on mouse
    currentScaleY = lerp(currentScaleY, currentScaleY, 0.2);

    mini.style.transform = translate(${targetX}px, ${targetY}px) scale(${currentScaleX}, ${currentScaleY});

    rAF = requestAnimationFrame(update);
  }

  // start RAF loop
  if (!rAF) rAF = requestAnimationFrame(update);

  window.addEventListener("mousemove", (e) => {
    clearTimeout(idleTimer);

    // compute deltas from previous mouse
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    // compute scales (clamped & normalized)
    const sx = calcScale(dx);
    const sy = calcScale(dy);

    // apply instantly (will be smoothed visually by RAF if you decide to lerp)
    currentScaleX = sx;
    currentScaleY = sy;

    // set target position (subtract half size if you want center alignment)
    targetX = e.clientX;
    targetY = e.clientY;

    // idle reset after mouse stops
    idleTimer = setTimeout(() => {
      // reset to default scale smoothly
      currentScaleX = 1;
      currentScaleY = 1;
      // do one immediate update to ensure transform reset
      mini.style.transform = translate(${targetX}px, ${targetY}px) scale(1,1);
    }, 100);
  });

  // optional: clean up on page hide/unload
  window.addEventListener("blur", () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = null;
  });
})();

// Hover-image follow for .elem elements
document.querySelectorAll(".elem").forEach(function (elem) {
  const img = elem.querySelector("img");
  if (!img) return;

  let lastRotateX = 0;

  elem.addEventListener("mousemove", function (dets) {
    const bounds = elem.getBoundingClientRect();
    const diffY = dets.clientY - bounds.top;

    // compute rotational difference based on movement (clamped)
    const diffrot = dets.clientX - lastRotateX;
    lastRotateX = dets.clientX;

    gsap.to(img, {
      opacity: 1,
      ease: "power3.out",
      top: diffY,
      left: dets.clientX,
      rotate: gsap.utils.clamp(-20, 20, diffrot * 0.8),
      duration: 0.2
    });
  });

  elem.addEventListener("mouseleave", function () {
    gsap.to(img, {
      opacity: 0,
      ease: "power3.out",
      duration: 0.5
    });
  });
});

// Run initial animation
firstPageAnim();
