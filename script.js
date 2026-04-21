// ------------------------------------------------------------
// Game class data
// ------------------------------------------------------------
// This object stores every playable class shown in the "天下流派" section.
// Each key, such as "sword" or "blade", matches the data-class value in index.html.
// The renderClassPanel() function reads this data and updates the large class card.
const classes = {
  sword: {
    mark: "剑",
    name: "剑宗",
    meta: "近战•爆发•突进",
    tags: ["近战", "爆发", "突进"],
    difficulty: 4,
    quote: "「十步杀一人，千里不留行。」",
    body: "剑宗弟子修习无上剑意，剑法轻灵飘逸，动若脱兔。以极致的爆发和身法斩敌于瞬息之间，是战场上最锐利的锋芒。",
    image: "assets/images/home-background.webp"
  },
  blade: {
    mark: "刀",
    name: "霸刀",
    meta: "近战•生存•破阵",
    tags: ["近战", "生存", "破阵"],
    difficulty: 2,
    quote: "「力拔山兮气盖世。」",
    body: "霸刀门人行事磊落，大开大合，霸道无双。擅长正面硬撼，以狂暴的刀气撕裂一切防御，万军丛中如入无人之境。",
    image: "https://images.unsplash.com/photo-1535581252515-e2303cbdff6b?w=1200&auto=format&fit=crop"
  },
  spear: {
    mark: "枪",
    name: "神机",
    meta: "近战•持续•牵制",
    tags: ["近战", "持续", "牵制"],
    difficulty: 3,
    quote: "「一点寒芒先到，随后枪出如龙。」",
    body: "神机营传承武将之风，攻守兼备，攻击范围极广。枪法连绵不绝，于百万军中取敌将首级若探囊取物。",
    image: "https://images.unsplash.com/photo-1542587222-f9172e5efa63?q=80&w=1200&auto=format&fit=crop"
  },
  fist: {
    mark: "拳",
    name: "罗汉",
    meta: "近战•坦克•控制",
    tags: ["近战", "坦克", "控制"],
    difficulty: 3,
    quote: "「天下武功出少林。」",
    body: "罗汉堂武僧舍弃兵刃，将肉身淬炼至极致。近身肉搏，拳拳到肉，金刚不坏之躯更能为同伴抵挡致命的威胁。",
    image: "https://images.unsplash.com/photo-1590608826509-66c5d115e85c?q=80&w=1200&auto=format&fit=crop"
  },
  bow: {
    mark: "弓",
    name: "飞羽",
    meta: "远程•消耗•机动",
    tags: ["远程", "消耗", "机动"],
    difficulty: 4,
    quote: "「会挽雕弓如满月，西北望，射天狼。」",
    body: "飞羽身法灵动，百步穿杨。善于在极远的距离外点杀目标，利用陷阱与走位将敌人戏弄于股掌之间。",
    image: "https://images.unsplash.com/photo-1620259228303-a8f0835b5958?q=80&w=1200&auto=format&fit=crop"
  },
  dagger: {
    mark: "刺",
    name: "暗影",
    meta: "远程•毒伤•爆发",
    tags: ["远程", "毒伤", "爆发"],
    difficulty: 5,
    quote: "「十殿阎罗，无影无形。」",
    body: "暗影楼精通淬毒与奇门暗器，杀人于无形。平时隐匿于黑暗之中，一旦出手，便是最致命的绝杀。",
    image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1200&auto=format&fit=crop"
  }
};

// ------------------------------------------------------------
// Ranking data
// ------------------------------------------------------------
// These arrays power the "风云龙虎榜" section.
// Format for each row: [player or guild name, class/faction, score].
// The keys match the text in each data-rank-tab button.
const rankData = {
  世界头目: [
    ["龙傲天", "剑宗", "158,200"],
    ["风清扬", "气宗", "149,500"],
    ["夜无痕", "暗影", "145,000"],
    ["柳如是", "百药", "138,000"],
    ["独孤剑", "剑宗", "132,000"],
    ["西门吹雪", "剑宗", "128,500"],
    ["花满楼", "百药", "121,000"],
    ["陆小凤", "暗影", "115,300"],
    ["楚留香", "气宗", "110,000"],
    ["李寻欢", "暗影", "105,000"]
  ],
  副本榜单: [
    ["沈惊鸿", "神机", "98,400"],
    ["白玉京", "剑宗", "96,800"],
    ["叶孤城", "霸刀", "94,900"],
    ["苏梦枕", "百药", "91,500"],
    ["温晚照", "飞羽", "88,730"],
    ["顾惜朝", "气宗", "86,200"],
    ["萧秋水", "罗汉", "82,900"],
    ["洛青衣", "暗影", "79,450"]
  ],
  杀戮战场: [
    ["燕十三", "暗影", "2,486"],
    ["方应看", "霸刀", "2,319"],
    ["傅红雪", "剑宗", "2,240"],
    ["周翡", "飞羽", "2,108"],
    ["谢晓峰", "剑宗", "1,986"],
    ["阿飞", "暗影", "1,872"],
    ["霍青桐", "神机", "1,744"],
    ["铁中棠", "罗汉", "1,690"]
  ],
  攻城争霸: [
    ["长风盟", "盟会", "32,800"],
    ["听雪楼", "盟会", "30,450"],
    ["墨隐阁", "盟会", "29,900"],
    ["惊鸿殿", "盟会", "28,760"],
    ["天机府", "盟会", "26,380"],
    ["落霞庄", "盟会", "24,930"]
  ]
};

// ------------------------------------------------------------
// Cached DOM elements
// ------------------------------------------------------------
// These querySelector calls find important HTML elements once, so the rest of
// the script can reuse them without searching the page again and again.
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const pages = document.querySelectorAll("[data-page]");
const navLinks = document.querySelectorAll(".site-nav a");
const backTop = document.querySelector("[data-back-top]");
const authModal = document.querySelector("[data-auth-modal]");
const authTitle = document.querySelector("[data-auth-title]");
const authEyebrow = document.querySelector("[data-auth-eyebrow]");

// Home sections are normal anchor-scroll sections inside the main homepage.
const homeSections = new Set(["home", "features", "rank", "classes", "gallery", "news", "community"]);

// Page routes are separate full-page views that replace the homepage content.
const pageRoutes = new Set(["guides", "download", "news-page"]);

// Text shown in the auth modal for each modal mode.
const authCopy = {
  login: ["账号", "登录江湖"],
  register: ["注册", "初入江湖"],
  forgot: ["寻回密语", "忘记密码"]
};

// ------------------------------------------------------------
// Falling leaves canvas
// ------------------------------------------------------------
// Creates the animated leaves floating above the fixed background image.
// It also lets the user's mouse slightly affect the leaves, giving the page
// a more alive wuxia atmosphere.
function initLeafCanvas() {
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

// ------------------------------------------------------------
// Navigation helpers
// ------------------------------------------------------------
// Closes the mobile navigation menu and resets its aria-expanded state.
function closeNav() {
  document.body.classList.remove("nav-open");
  header.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

// Shows exactly one page-view section based on its data-page value.
function setActivePage(pageName) {
  pages.forEach((page) => page.classList.toggle("is-active", page.dataset.page === pageName));
}

// Highlights the matching navigation link.
// The news-page route maps back to the normal "风云" nav item.
function setActiveNav(hash) {
  const activeHash = hash === "news-page" ? "news" : hash;
  navLinks.forEach((link) => {
    const target = link.getAttribute("href").slice(1);
    link.classList.toggle("is-active", target === activeHash);
  });
}

// Handles hash-based navigation.
// Homepage hashes scroll to sections, while subpages switch the visible page.
function navigate() {
  const hash = window.location.hash.replace("#", "") || "home";
  const pageName = pageRoutes.has(hash) ? hash : "home";

  setActivePage(pageName);
  setActiveNav(hash);
  closeNav();

  if (homeSections.has(hash)) {
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

// ------------------------------------------------------------
// Auth modal helpers
// ------------------------------------------------------------
// Opens the login/register/forgot-password modal and switches to the right form.
function openAuth(mode = "login") {
  if (!authModal) return;

  const nextMode = authCopy[mode] ? mode : "login";
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.classList.toggle("is-active", form.dataset.authForm === nextMode);
  });

  if (authEyebrow && authTitle) {
    authEyebrow.textContent = authCopy[nextMode][0];
    authTitle.textContent = authCopy[nextMode][1];
  }

  authModal.classList.add("is-open");
  authModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  authModal.querySelector(`[data-auth-form="${nextMode}"] input`)?.focus();
}

// Closes the auth modal and restores page scrolling.
function closeAuth() {
  if (!authModal) return;
  authModal.classList.remove("is-open");
  authModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

// ------------------------------------------------------------
// Ranking render helpers
// ------------------------------------------------------------
// Returns the small crown SVG used for the top three ranking rows.
function crownIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5Zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z"></path>
    </svg>
  `;
}

// Renders ranking rows for the selected tab/category.
// It also adds special classes to the top three rows for gold/silver/bronze styling.
function renderRank(category = "世界头目") {
  const body = document.getElementById("rank-body");
  if (!body) return;

  const rows = rankData[category] || [];
  const list = body.closest(".rank-list");
  list?.classList.toggle("has-rows", rows.length > 0);

  body.innerHTML = rows.map(([name, school, score], index) => {
    const place = index + 1;
    const medalClass = place === 1 ? " rank-row--gold" : place === 2 ? " rank-row--silver" : place === 3 ? " rank-row--bronze" : "";
    const icon = place <= 3 ? crownIcon() : "";

    return `
      <div class="rank-row${medalClass}" role="row">
        <span class="rank-place">${place}</span>
        <span class="rank-player">${icon}${name}</span>
        <span class="rank-school">${school}</span>
        <span class="rank-score">${score}</span>
      </div>
    `;
  }).join("");
}

// ------------------------------------------------------------
// Class panel render helpers
// ------------------------------------------------------------
// Converts a number from 1 to 5 into star characters.
// Filled stars are plain text; empty stars are wrapped in <i> for dim styling.
function renderStars(difficulty) {
  const active = "★".repeat(difficulty);
  const inactive = "★".repeat(Math.max(0, 5 - difficulty));
  return `${active}<i>${inactive}</i>`;
}

// Renders the large "天下流派" panel from the selected class data.
// This updates the background image, class name, tags, quote, and description.
function renderClassPanel(classKey = "sword") {
  const selected = classes[classKey] || classes.sword;
  const panel = document.querySelector("[data-class-panel]");
  if (!panel) return;

  panel.dataset.cursor = classKey;
  panel.style.setProperty("--class-image", `url("${selected.image}")`);
  panel.innerHTML = `
    <div class="class-backdrop" aria-hidden="true"></div>
    <div class="class-watermark">${selected.name}</div>
    <div class="class-content">
      <div class="class-title-row">
        <h3>${selected.name}</h3>
        <span>【 ${selected.mark} 】</span>
      </div>
      <div class="class-tags">
        ${selected.tags.map((tag) => `<span>${tag}</span>`).join("")}
        <span class="class-stars" aria-label="上手难度${selected.difficulty}星">${renderStars(selected.difficulty)}</span>
      </div>
      <blockquote>${selected.quote}</blockquote>
      <p>${selected.body}</p>
    </div>
  `;
}

// ------------------------------------------------------------
// Feature scroll reveal
// ------------------------------------------------------------
// Adds slide/fade animation to the feature image and text when each feature
// panel enters the viewport. It also resets when the panel leaves, so scrolling
// back to it can replay the same animation.
function initFeatureReveal() {
  const featureItems = document.querySelectorAll(".feature-item");
  if (!featureItems.length) return;

  document.body.classList.add("feature-reveal-ready");

  if (!("IntersectionObserver" in window)) {
    featureItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, {
    threshold: 0.22,
    rootMargin: "-8% 0px -18% 0px"
  });

  featureItems.forEach((item) => observer.observe(item));
}

// ------------------------------------------------------------
// One-shot running borders
// ------------------------------------------------------------
// Triggers the amber/gold border stroke once when a dark container scrolls
// into view, and again when focus moves into that container.
function initRunningBorders() {
  const borderPanels = Array.from(document.querySelectorAll([
    ".feature-showcase .section-heading",
    ".feature-item",
    ".framed-section",
    ".download-panel",
    ".auth-dialog"
  ].join(",")));

  if (!borderPanels.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const visiblePanels = new WeakSet();
  const strokeTimers = new WeakMap();

  function runBorderStroke(panel) {
    window.clearTimeout(strokeTimers.get(panel));
    panel.classList.remove("border-stroke-run");

    // Force a style flush so re-adding the class restarts the one-shot animation.
    void panel.offsetWidth;

    panel.classList.add("border-stroke-run");
    strokeTimers.set(panel, window.setTimeout(() => {
      panel.classList.remove("border-stroke-run");
      strokeTimers.delete(panel);
    }, 4600));
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!visiblePanels.has(entry.target)) {
            visiblePanels.add(entry.target);
            runBorderStroke(entry.target);
          }
        } else {
          visiblePanels.delete(entry.target);
        }
      });
    }, {
      threshold: 0.24,
      rootMargin: "-8% 0px -18% 0px"
    });

    borderPanels.forEach((panel) => observer.observe(panel));
  }

  borderPanels.forEach((panel) => {
    panel.addEventListener("focusin", () => runBorderStroke(panel));
  });
}

// ------------------------------------------------------------
// Gallery controls
// ------------------------------------------------------------
// Turns the "水墨绘卷" slides into a simple coverflow-style gallery.
// The CSS reads the is-active/is-prev/is-next/is-far classes to position slides.
function initGallery() {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
  const dots = gallery.querySelector("[data-gallery-dots]");
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  if (!slides.length) return;

  // Applies the right visual class to each slide based on activeIndex.
  function updateGallery() {
    slides.forEach((slide, index) => {
      const distance = (index - activeIndex + slides.length) % slides.length;
      slide.classList.toggle("is-active", distance === 0);
      slide.classList.toggle("is-next", distance === 1);
      slide.classList.toggle("is-prev", distance === slides.length - 1);
      slide.classList.toggle("is-far", distance > 1 && distance < slides.length - 1);
    });

    dots?.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  // Build dot buttons dynamically so the dots always match the number of slides.
  if (dots) {
    dots.innerHTML = slides.map((_, index) => `<button type="button" aria-label="查看第${index + 1}张"></button>`).join("");
    dots.querySelectorAll("button").forEach((dot, index) => {
      dot.addEventListener("click", () => {
        activeIndex = index;
        updateGallery();
      });
    });
  }

  // Move one slide backward.
  prev?.addEventListener("click", () => {
    activeIndex = (activeIndex - 1 + slides.length) % slides.length;
    updateGallery();
  });

  // Move one slide forward.
  next?.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % slides.length;
    updateGallery();
  });

  updateGallery();
}

// ------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------
// Mobile menu button: toggles the full-screen mobile navigation.
navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Clicking a nav link closes the mobile menu after navigation begins.
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeNav();
  }
});

// Ranking tabs: update active button and re-render the rank list.
document.querySelectorAll("[data-rank-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-rank-tab]").forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");
    renderRank(button.dataset.rankTab);
  });
});

// News category tabs on the full news page.
// Cards that do not match the selected category are hidden with a CSS class.
document.querySelectorAll("[data-news-tabs] button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-news-tabs] button").forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");

    const filter = button.dataset.filter || "全部";
    document.querySelectorAll(".news-list--page [data-news-card]").forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "全部" && card.dataset.category !== filter);
    });
  });
});

// Class/weapon tabs: update active button and re-render the class showcase panel.
document.querySelectorAll("[data-class]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-class]").forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");
    renderClassPanel(button.dataset.class);
  });
});

// Any button with data-auth-open can open the auth modal in a chosen mode.
document.querySelectorAll("[data-auth-open]").forEach((button) => {
  button.addEventListener("click", () => openAuth(button.dataset.authOpen));
});

// Modal close button.
document.querySelector("[data-auth-close]")?.addEventListener("click", closeAuth);

// Clicking the dark backdrop outside the auth dialog closes the modal.
authModal?.addEventListener("click", (event) => {
  if (event.target === authModal) closeAuth();
});

// Auth forms are visual/demo forms for now, so prevent page refresh on submit.
document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

// Back-to-top floating button.
backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Show the back-to-top button after the user scrolls down.
window.addEventListener("scroll", () => {
  backTop?.classList.toggle("is-visible", window.scrollY > 520);
}, { passive: true });

// Escape key closes the auth modal.
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAuth();
});

// Re-run routing when the URL hash changes.
window.addEventListener("hashchange", navigate);

// Page boot sequence:
// 1. route to the correct page/section
// 2. render initial ranking data
// 3. render initial class panel
// 4. initialize gallery controls
// 5. initialize feature scroll reveal
// 6. initialize one-shot running borders
// 7. start leaf animation
window.addEventListener("DOMContentLoaded", () => {
  navigate();
  renderRank();
  renderClassPanel();
  initGallery();
  initFeatureReveal();
  initRunningBorders();
  initLeafCanvas();
});
