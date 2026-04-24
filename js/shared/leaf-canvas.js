// ------------------------------------------------------------
// Falling leaves canvas
// ------------------------------------------------------------
// Creates the animated leaves floating above the fixed background image.
// It also lets the user's mouse slightly affect the leaves, giving the page
// a more alive wuxia atmosphere.
export function initLeafCanvas() {
  const canvas = document.querySelector("[data-leaf-canvas]");
  if (!canvas) return;

  // Canvas state and animation state.
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let animationFrame = null;
  let lastFrame = 0;
  let lastPointerMove = Date.now();
  let pointerX = -1000;
  let pointerY = -1000;
  const leaves = [];

  // Resize the canvas to match the browser window and device pixel ratio.
  // This keeps the leaves sharp on high-DPI screens.
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // Build one leaf object with random position, speed, color, and rotation.
  // isInitial=true scatters leaves across the screen on first load.
  function createLeaf(isInitial = false) {
    const size = 6 + Math.random() * 15;
    const x = Math.random() * width;
    const y = isInitial ? Math.random() * height * 0.95 - 40 : -(Math.random() * 220 + 30);

    return {
      x,
      y,
      baseX: x,
      size,
      vx: 0,
      vy: 0,
      baseVy: 1 + Math.random() * 3.1,
      life: Math.random() * Math.PI * 2,
      driftRange: Math.random() * 150 - 75,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.05,
      opacity: isInitial ? 0.25 + Math.random() * 0.58 : 0,
      fadeState: "in",
      brightness: 1,
      attractFrames: 0,
      immuneFrames: 0,
      colorA: ["#d97706", "#b45309", "#c66a16"][Math.floor(Math.random() * 3)],
      colorB: ["#78350f", "#6b2f0b", "#92400e"][Math.floor(Math.random() * 3)]
    };
  }

  // Fill the canvas with a responsive number of leaves.
  // Mobile gets fewer leaves to keep performance lighter.
  function seedLeaves() {
    leaves.length = 0;
    const total = window.innerWidth < 768 ? 50 : 74;
    for (let index = 0; index < total; index += 1) {
      leaves.push(createLeaf(true));
    }
  }

  // Recycle a leaf after it leaves the screen instead of creating a new object.
  function resetLeaf(leaf) {
    const fresh = createLeaf(false);
    Object.assign(leaf, fresh);
  }

  // Draws a single stylized leaf using canvas curves and a small vein line.
  function drawLeaf(leaf) {
    context.save();
    context.translate(leaf.x, leaf.y);
    context.rotate(leaf.angle);
    context.scale(1, 0.58 + leaf.size / 42);
    context.globalAlpha = Math.max(0, Math.min(1, leaf.opacity));

    const half = leaf.size / 2;
    const gradient = context.createLinearGradient(-half, -half, half, half);
    gradient.addColorStop(0, leaf.colorA);
    gradient.addColorStop(0.54, "#a45513");
    gradient.addColorStop(1, leaf.colorB);

    context.beginPath();
    context.moveTo(-half, 0);
    context.bezierCurveTo(-half * 0.1, -half * 1.15, half * 1.22, -half * 0.28, half, half * 0.12);
    context.bezierCurveTo(half * 0.18, half * 1.05, -half * 0.95, half * 0.55, -half, 0);
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    context.moveTo(-half * 0.7, 0);
    context.quadraticCurveTo(0, -half * 0.08, half * 0.72, half * 0.08);
    context.strokeStyle = "rgba(88, 39, 8, 0.32)";
    context.lineWidth = Math.max(0.5, leaf.size / 18);
    context.stroke();
    context.restore();
  }

  // Main animation loop. It updates each leaf's motion, fade, and mouse reaction,
  // then draws the leaf at its new position.
  function animate(now = 0) {
    // Pause heavy drawing work when the browser tab is hidden.
    if (document.hidden) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    // If the mouse has not moved for a while, stop attracting leaves.
    if (Date.now() - lastPointerMove > 30000) {
      pointerX = -1000;
      pointerY = -1000;
    }

    // Roughly cap animation work near 60fps.
    if (now - lastFrame < 16) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    lastFrame = now;
    context.clearRect(0, 0, width, height);

    for (const leaf of leaves) {
      // Natural side-to-side drifting.
      leaf.life += 0.015;
      const drift = Math.sin(leaf.life) * leaf.driftRange;
      const targetX = leaf.baseX + drift;
      const distanceX = leaf.x - pointerX;
      const distanceY = leaf.y - pointerY;
      const distance = Math.hypot(distanceX, distanceY);
      const radius = 90;
      let brightnessTarget = 1;

      // Temporary immunity prevents one leaf from getting trapped near the cursor.
      if (leaf.immuneFrames > 0) {
        leaf.immuneFrames -= 1;
      }

      // When the cursor is close, the leaf reacts with a light swirl/repel force.
      if (leaf.immuneFrames <= 0 && distance < radius && pointerX > -1) {
        leaf.attractFrames += 1;
        if (leaf.attractFrames >= 600) {
          leaf.immuneFrames = 300;
          leaf.attractFrames = 0;
        }

        const force = 3 / Math.max(distance, 10);
        const angle = Math.atan2(distanceY, distanceX);
        leaf.vx -= Math.cos(angle) * force;
        leaf.vy -= Math.sin(angle) * force;
        leaf.vx += Math.sin(angle) * 0.15;
        leaf.vy -= Math.cos(angle) * 0.15;
        leaf.vx += (targetX - leaf.x) * 0.01;
        leaf.vy += (leaf.baseVy - leaf.vy) * 0.01;
        brightnessTarget = 1 + 2.5 * Math.pow(1 - distance / radius, 1.5);
      } else {
        // Normal drifting motion when the cursor is far away.
        leaf.attractFrames = Math.max(0, leaf.attractFrames - 2);
        leaf.vx += (targetX - leaf.x) * 0.03;
        leaf.vy += (leaf.baseVy - leaf.vy) * 0.03;
      }

      // Smooth velocity, position, brightness, and rotation.
      leaf.vx *= 0.92;
      leaf.vy *= 0.92;
      leaf.x += leaf.vx;
      leaf.y += leaf.vy;
      leaf.brightness += (brightnessTarget - leaf.brightness) * 0.15;
      leaf.angle += leaf.spinSpeed;

      // Fade in new leaves and fade out leaves near the bottom of the viewport.
      if (leaf.fadeState === "in") {
        leaf.opacity += 0.01;
        if (leaf.opacity >= 0.82) leaf.fadeState = "stable";
      } else if (leaf.fadeState === "out") {
        leaf.opacity -= 0.01;
      }

      if (leaf.y > height * 0.9) leaf.fadeState = "out";
      drawLeaf(leaf);

      // Once a leaf is off-screen or invisible, recycle it at the top.
      if (leaf.y > height + 25 || leaf.opacity <= 0 || leaf.x < -80 || leaf.x > width + 80) {
        resetLeaf(leaf);
      }
    }

    animationFrame = requestAnimationFrame(animate);
  }

  // Saves the latest pointer position so leaves can react to the mouse.
  function updatePointer(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerMove = Date.now();
  }

  // Initialize canvas size, create leaves, and start the animation.
  resize();
  seedLeaves();
  window.addEventListener("resize", () => {
    resize();
    seedLeaves();
  });
  window.addEventListener("mousemove", updatePointer);
  window.addEventListener("pointermove", updatePointer);
  animationFrame = requestAnimationFrame(animate);

  // Stop the animation frame when the page is being unloaded.
  window.addEventListener("pagehide", () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
}
