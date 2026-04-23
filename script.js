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
    image: "assets/images/sword.webp"
  },
  blade: {
    mark: "刀",
    name: "霸刀",
    meta: "近战•生存•破阵",
    tags: ["近战", "生存", "破阵"],
    difficulty: 2,
    quote: "「力拔山兮气盖世。」",
    body: "霸刀门人行事磊落，大开大合，霸道无双。擅长正面硬撼，以狂暴的刀气撕裂一切防御，万军丛中如入无人之境。",
    image: "assets/images/knife.webp"
  },
  spear: {
    mark: "枪",
    name: "神机",
    meta: "近战•持续•牵制",
    tags: ["近战", "持续", "牵制"],
    difficulty: 3,
    quote: "「一点寒芒先到，随后枪出如龙。」",
    body: "神机营传承武将之风，攻守兼备，攻击范围极广。枪法连绵不绝，于百万军中取敌将首级若探囊取物。",
    image: "assets/images/gun.webp"
  },
  fist: {
    mark: "拳",
    name: "罗汉",
    meta: "近战•坦克•控制",
    tags: ["近战", "坦克", "控制"],
    difficulty: 3,
    quote: "「天下武功出少林。」",
    body: "罗汉堂武僧舍弃兵刃，将肉身淬炼至极致。近身肉搏，拳拳到肉，金刚不坏之躯更能为同伴抵挡致命的威胁。",
    image: "assets/images/fist.webp"
  },
  bow: {
    mark: "弓",
    name: "飞羽",
    meta: "远程•消耗•机动",
    tags: ["远程", "消耗", "机动"],
    difficulty: 4,
    quote: "「会挽雕弓如满月，西北望，射天狼。」",
    body: "飞羽身法灵动，百步穿杨。善于在极远的距离外点杀目标，利用陷阱与走位将敌人戏弄于股掌之间。",
    image: "assets/images/arrow.webp"
  },
  dagger: {
    mark: "刺",
    name: "暗影",
    meta: "远程•毒伤•爆发",
    tags: ["远程", "毒伤", "爆发"],
    difficulty: 5,
    quote: "「十殿阎罗，无影无形。」",
    body: "暗影楼精通淬毒与奇门暗器，杀人于无形。平时隐匿于黑暗之中，一旦出手，便是最致命的绝杀。",
    image: "assets/images/prick.webp"
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
const staticActiveSection = document.body.dataset.currentSection || "";

// Home sections are normal anchor-scroll sections inside the main homepage.
const homeSections = new Set(["home", "features", "rank", "classes", "gallery", "news", "community"]);

// Page routes are hash-based views that replace the homepage content.
const pageRoutes = new Set([]);

// Text shown in the auth modal for each modal mode.
const authCopy = {
  login: ["账号", "进入江湖"],
  register: ["注册", "初入江湖"],
  forgot: ["寻回密语", "忘记密码"]
};
const authSecurityMessage = "安全验证加载超时，请检查网络连接";

// Replays the layered title logo entrance whenever the hero scrolls back in.
function initHeroLogoAnimation() {
  const hero = document.querySelector("#home");
  const logo = document.querySelector("[data-hero-logo]");
  if (!hero || !logo) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  function play(delay = 0) {
    window.setTimeout(() => {
      logo.classList.remove("is-animating");
      void logo.offsetWidth;
      logo.classList.add("is-animating");
    }, delay);
  }

  if (!("IntersectionObserver" in window)) {
    play(900);
    return;
  }

  let wasVisible = false;
  let isFirstEntry = true;

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;

    if (isVisible && !wasVisible) {
      play(isFirstEntry ? 900 : 0);
      isFirstEntry = false;
    }

    if (!isVisible && wasVisible) {
      logo.classList.remove("is-animating");
    }

    wasVisible = isVisible;
  }, { threshold: [0, 0.35, 0.65] });

  observer.observe(hero);
}

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
  header?.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

// Shows exactly one page-view section based on its data-page value.
function setActivePage(pageName) {
  pages.forEach((page) => page.classList.toggle("is-active", page.dataset.page === pageName));
}

// Highlights the matching navigation link.
// Links may point to an in-page hash or to standalone pages like news.html.
function getNavTarget(link) {
  const href = link.getAttribute("href") || "";
  const hashIndex = href.indexOf("#");

  if (href.endsWith("news.html")) return "news";
  if (href.endsWith("guides.html")) return "guides";
  if (href.endsWith("download.html")) return "download";
  if (hashIndex >= 0) return href.slice(hashIndex + 1);
  return href.replace(/\.html$/, "");
}

function setActiveNav(hash) {
  const activeHash = staticActiveSection || hash;
  navLinks.forEach((link) => {
    const target = getNavTarget(link);
    link.classList.toggle("is-active", target === activeHash);
  });
}

// Handles hash-based navigation.
// Homepage hashes scroll to sections, while subpages switch the visible page.
function navigate() {
  const hash = window.location.hash.replace("#", "") || "home";
  const pageName = pageRoutes.has(hash) ? hash : "home";

  if (staticActiveSection && !pages.length) {
    setActiveNav(staticActiveSection);
    closeNav();
    return;
  }

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
function getAuthAlert(form) {
  return form?.querySelector("[data-auth-alert]");
}

function setAuthAlert(form, message, state = "warning") {
  const alert = getAuthAlert(form);
  if (!alert) return;

  alert.textContent = message;
  alert.classList.remove("is-hidden", "is-error", "is-success");
  if (state === "error") alert.classList.add("is-error");
  if (state === "success") alert.classList.add("is-success");
  if (!message) alert.classList.add("is-hidden");
}

function setInputInvalid(input, isInvalid) {
  if (!input) return;
  input.classList.toggle("is-invalid", isInvalid);
  input.setAttribute("aria-invalid", String(isInvalid));
}

function resetAuthFeedback(form) {
  if (!form) return;

  form.querySelectorAll("input").forEach((input) => setInputInvalid(input, false));
  setAuthAlert(form, "");
}

function getNamedInput(form, name) {
  return form.elements.namedItem(name);
}

function validateAuthForm(form) {
  const mode = form.dataset.authForm;
  const invalid = [];

  form.querySelectorAll("input").forEach((input) => setInputInvalid(input, false));

  if (mode === "login") {
    const username = getNamedInput(form, "username");
    const password = getNamedInput(form, "password");

    if (!username.value.trim()) invalid.push([username, "请输入账号"]);
    if (password.value.length < 8) invalid.push([password, "请输入至少8位密码"]);
  }

  if (mode === "register") {
    const username = getNamedInput(form, "username");
    const password = getNamedInput(form, "password");
    const confirmPassword = getNamedInput(form, "confirmPassword");
    const email = getNamedInput(form, "email");
    const phone = getNamedInput(form, "phone");
    const secondaryPassword = getNamedInput(form, "secondaryPassword");

    if (!/^[A-Za-z0-9]{4,20}$/.test(username.value.trim())) {
      invalid.push([username, "账号需为4-20位字母或数字"]);
    }

    if (password.value.length < 8) {
      invalid.push([password, "通关密语至少8位"]);
    }

    if (confirmPassword.value !== password.value || !confirmPassword.value) {
      invalid.push([confirmPassword, "两次输入的通关密语不一致"]);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      invalid.push([email, "请输入有效电子邮箱"]);
    }

    if (!/^\+?[0-9\s-]{7,20}$/.test(phone.value.trim())) {
      invalid.push([phone, "请输入有效手机号码"]);
    }

    if (!/^\d{4}$/.test(secondaryPassword.value.trim())) {
      invalid.push([secondaryPassword, "二级密码必须为4位数字"]);
    }
  }

  if (mode === "forgot") {
    const identifier = getNamedInput(form, "identifier");
    if (!identifier.value.trim()) invalid.push([identifier, "请输入账号或手机号"]);
  }

  if (invalid.length) {
    invalid.forEach(([input]) => setInputInvalid(input, true));
    return { valid: false, input: invalid[0][0], message: invalid[0][1] };
  }

  return { valid: true };
}

// Opens the login/register/forgot-password modal and switches to the right form.
function openAuth(mode = "login") {
  if (!authModal) return;

  const nextMode = authCopy[mode] ? mode : "login";
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.classList.toggle("is-active", form.dataset.authForm === nextMode);
    resetAuthFeedback(form);
  });
  authModal.dataset.authMode = nextMode;

  if (authEyebrow) {
    authEyebrow.textContent = authCopy[nextMode][0];
  }

  if (authTitle) {
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
    ".gallery-slide",
    ".guide-card",
    ".download-client-card",
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
navToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("nav-open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Clicking a nav link closes the mobile menu after navigation begins.
nav?.addEventListener("click", (event) => {
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

const newsArticleBodies = {
  "《鸿禧墨魂+30》V1.2.5版本更新维护公告": `
    <h3>亲爱的大侠：</h3>
    <p>为了给您带来更好的游戏体验，我们将于 <strong>2026年3月29日 06:00-08:00</strong> 对全服进行停机更新维护。预计维护时间为2小时，如遇特殊情况，开服时间将顺延。请各位大侠相互转告，并提前做好下线准备，以免造成不必要的损失。</p>
    <h4>【更新内容】</h4>
    <ul>
      <li>新增“华山之巅”1v1竞技场赛季。</li>
      <li>修复了“流云剑法”第三式伤害异常的问题。</li>
      <li>优化了背包整理功能。</li>
    </ul>
    <p>感谢您的支持与理解！</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "“龙争虎斗”天下第一武道会火热报名中！": `
    <h3>各位少侠：</h3>
    <p>天下第一武道会“龙争虎斗”报名现已开启。所有达到指定等级的大侠均可前往主城武道使者处完成登记，与各路高手一决高下。</p>
    <h4>【活动安排】</h4>
    <ul>
      <li>报名时间：2026年3月25日 10:00 至 2026年3月31日 23:59。</li>
      <li>赛事分为海选、晋级、决赛三个阶段。</li>
      <li>优胜者将获得限定称号、坐骑外观与珍稀强化材料。</li>
    </ul>
    <p>请参赛大侠提前调整装备与心法配置，切勿错过入场时辰。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "关于近期利用游戏BUG非法获利账号的处罚公告": `
    <h3>亲爱的大侠：</h3>
    <p>近期我们发现部分账号通过异常机制重复获取游戏资源，严重破坏了江湖公平环境。运营团队已完成核查，并对相关账号进行处理。</p>
    <h4>【处理说明】</h4>
    <ul>
      <li>对确认违规账号扣除异常所得。</li>
      <li>视违规程度进行临时封停或永久封禁。</li>
      <li>对主动反馈问题且未扩散利用的玩家给予感谢奖励。</li>
    </ul>
    <p>维护公平江湖需要每一位大侠共同参与，感谢大家的理解与监督。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "清明踏青活动上线，限定时装“青团”等你来拿": `
    <h3>春风入江湖：</h3>
    <p>清明踏青限时活动正式开启。活动期间完成踏青委托、收集春令信物，即可兑换限定时装“青团”与节日头像框。</p>
    <h4>【活动内容】</h4>
    <ul>
      <li>每日完成踏青任务可获得“青叶令”。</li>
      <li>组队挑战节日首领有机会掉落限定挂饰。</li>
      <li>活动商店将于活动结束后保留三日。</li>
    </ul>
    <p>愿各位大侠在山水之间遇见好景，也遇见好运。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "服务器例行维护公告 [每周二]": `
    <h3>亲爱的大侠：</h3>
    <p>为保障服务器稳定运行，我们将在每周二清晨进行例行维护。维护期间无法登录游戏，请大家提前安排在线时间。</p>
    <h4>【维护说明】</h4>
    <ul>
      <li>维护时间：每周二 06:00-07:00。</li>
      <li>维护范围：全区全服。</li>
      <li>如维护提前完成，服务器将提前开放。</li>
    </ul>
    <p>感谢各位大侠一直以来的支持。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "【防沉迷】关于实名认证及系统升级的公告": `
    <h3>亲爱的大侠：</h3>
    <p>根据相关要求，防沉迷与实名认证系统将进行升级。请尚未完成实名认证的玩家尽快补全信息，以免影响后续登录与游玩。</p>
    <h4>【升级重点】</h4>
    <ul>
      <li>优化实名信息校验流程。</li>
      <li>完善未成年人游戏时长提示。</li>
      <li>修复部分账号认证状态显示延迟的问题。</li>
    </ul>
    <p>我们将持续为大家提供健康、稳定的游戏环境。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "神兵重现！“干将莫邪”寻宝活动限时开启": `
    <h3>神兵有灵，择主而鸣：</h3>
    <p>“干将莫邪”限时寻宝活动开启。活动期间参与寻宝可获得神兵碎片、铸魂石与限定武器外观。</p>
    <h4>【活动奖励】</h4>
    <ul>
      <li>累计寻宝达到指定次数可领取保底奖励。</li>
      <li>神兵碎片可在活动商店兑换珍稀道具。</li>
      <li>限定外观将在活动结束后暂不加入常驻池。</li>
    </ul>
    <p>愿各位大侠剑出有名，锋芒不负。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "合服公告：【仗剑天涯】与【笑傲江湖】合服安排": `
    <h3>亲爱的大侠：</h3>
    <p>为提升服务器活跃度与江湖互动体验，【仗剑天涯】与【笑傲江湖】将进行合服。合服期间相关服务器将暂时关闭入口。</p>
    <h4>【合服安排】</h4>
    <ul>
      <li>合服时间：2026年3月10日 06:00-10:00。</li>
      <li>角色、背包、邮件与帮会数据将完整保留。</li>
      <li>重名角色将获得一次免费改名机会。</li>
    </ul>
    <p>合服完成后，我们将发放补偿礼包至游戏邮箱。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "飞鸽传书系统升级与驿站服务时间调整说明": `
    <h3>亲爱的大侠：</h3>
    <p>飞鸽传书系统将进行升级，驿站服务时间也将同步调整。升级后邮件投递速度与附件领取体验将进一步优化。</p>
    <h4>【调整内容】</h4>
    <ul>
      <li>优化跨服邮件投递延迟。</li>
      <li>增加过期附件领取提醒。</li>
      <li>驿站每日结算时间调整为 05:30。</li>
    </ul>
    <p>请各位大侠及时领取邮件附件，避免过期损失。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "门派闯关大挑战，绝世心法等你拿！": `
    <h3>各位少侠：</h3>
    <p>门派闯关大挑战限时开放。组队挑战不同门派试炼，即有机会获得绝世心法残页与门派声望。</p>
    <h4>【挑战规则】</h4>
    <ul>
      <li>每日可获得三次奖励次数。</li>
      <li>通关时间越短，评价奖励越高。</li>
      <li>跨门派组队可触发额外协力奖励。</li>
    </ul>
    <p>山门已开，且看诸位大侠如何破阵扬名。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "关于跨服战场卡顿问题的修复进度说明": `
    <h3>亲爱的大侠：</h3>
    <p>我们已关注到部分玩家在跨服战场中遇到卡顿与技能延迟问题。技术团队正在分阶段完成定位、优化与灰度验证。</p>
    <h4>【当前进度】</h4>
    <ul>
      <li>已修复部分场景单位同步异常。</li>
      <li>正在优化大型团战中的特效加载策略。</li>
      <li>后续将继续观察高峰时段服务器表现。</li>
    </ul>
    <p>给大家带来的不便，我们深表歉意。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "严厉打击第三方违规钱庄代充行为的声明": `
    <h3>郑重声明：</h3>
    <p>近期出现第三方违规钱庄代充、虚假折扣与账号交易信息。此类行为存在账号安全与财产风险，也违反游戏服务协议。</p>
    <h4>【安全提醒】</h4>
    <ul>
      <li>请通过官方渠道进行充值。</li>
      <li>不要向他人提供账号、密码或验证码。</li>
      <li>发现违规信息可通过客服入口举报。</li>
    </ul>
    <p>我们将持续打击相关违规行为，保护玩家权益。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "元宵佳节，登录即领“踏雪寻梅”限时披风！": `
    <h3>灯火照江湖：</h3>
    <p>元宵佳节活动开启。活动期间每日登录即可领取节日礼盒，累计登录更可获得“踏雪寻梅”限时披风。</p>
    <h4>【节日福利】</h4>
    <ul>
      <li>登录领取元宵礼盒与绑定元宝。</li>
      <li>完成猜灯谜任务可兑换烟花道具。</li>
      <li>累计登录五日领取限时披风。</li>
    </ul>
    <p>愿各位大侠团圆有时，江湖有光。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "世界频道不良信息净化行动成果公示": `
    <h3>亲爱的大侠：</h3>
    <p>为维护健康交流环境，运营团队近期对世界频道不良信息进行了集中治理，并对多批违规账号进行了禁言或封停处理。</p>
    <h4>【治理成果】</h4>
    <ul>
      <li>拦截违规广告与刷屏信息。</li>
      <li>处理恶意引战与辱骂行为。</li>
      <li>优化聊天举报后的反馈流程。</li>
    </ul>
    <p>清朗江湖，离不开每一位大侠的共同守护。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `,
  "【主策信笺】谈谈新版本“决战光明顶”的设计初衷": `
    <h3>各位大侠：</h3>
    <p>“决战光明顶”版本希望让更多玩家体验到阵营对抗、团队协作与临场策略带来的张力。我们也在持续收集大家的反馈。</p>
    <h4>【设计方向】</h4>
    <ul>
      <li>降低入门门槛，让更多玩家参与大型战场。</li>
      <li>强化据点争夺与战术分工。</li>
      <li>让不同流派都能在战场中找到定位。</li>
    </ul>
    <p>感谢大家一路同行，后续调整也会尽快同步给各位。</p>
    <p class="news-signature">《无界墨香》运营团队</p>
  `
};

// News category tabs and pagination on the full news page.
// Filtering always returns to page one, then the pager slices the matching cards.
function initNewsPage() {
  const tabs = Array.from(document.querySelectorAll("[data-news-tabs] button"));
  const indexView = document.querySelector("[data-news-index]");
  const detailView = document.querySelector("[data-news-detail]");
  const detailBack = document.querySelector("[data-news-detail-back]");
  const detailCategory = document.querySelector("[data-news-detail-category]");
  const detailTitle = document.querySelector("[data-news-detail-title]");
  const detailDate = document.querySelector("[data-news-detail-date]");
  const detailBody = document.querySelector("[data-news-detail-body]");
  const list = document.querySelector("[data-news-list]");
  const pager = document.querySelector("[data-news-pager]");
  const cards = Array.from(list?.querySelectorAll("[data-news-card]") || []);
  if (!list || !pager || cards.length === 0) return;

  const prevButton = pager.querySelector('[data-news-page="prev"]');
  const nextButton = pager.querySelector('[data-news-page="next"]');
  const status = pager.querySelector("[data-news-page-status]");
  const pageSize = Math.max(1, Number(pager.dataset.pageSize) || 4);
  const state = {
    filter: tabs.find((tab) => tab.classList.contains("is-active"))?.dataset.filter || "全部",
    page: 1
  };

  function matchingCards() {
    return cards.filter((card) => state.filter === "全部" || card.dataset.category === state.filter);
  }

  function renderNewsPage() {
    const visibleCards = matchingCards();
    const totalPages = Math.max(1, Math.ceil(visibleCards.length / pageSize));
    state.page = Math.min(Math.max(state.page, 1), totalPages);

    const pageStart = (state.page - 1) * pageSize;
    const currentPageCards = new Set(visibleCards.slice(pageStart, pageStart + pageSize));

    cards.forEach((card) => {
      const shouldHide = !currentPageCards.has(card);
      card.classList.toggle("is-hidden", shouldHide);
      card.hidden = shouldHide;
    });

    if (status) status.textContent = `${state.page} / ${totalPages}`;
    if (prevButton) prevButton.disabled = state.page === 1;
    if (nextButton) nextButton.disabled = state.page === totalPages;
  }

  function getCardData(card) {
    const title = card.querySelector("h2")?.textContent.trim() || "";
    const time = card.querySelector("time");
    return {
      category: card.dataset.category || "公告",
      title,
      date: time?.textContent.trim() || "",
      datetime: time?.getAttribute("datetime") || ""
    };
  }

  function setDetailCategory(category) {
    if (!detailCategory) return;
    detailCategory.textContent = category;
    detailCategory.dataset.category = category;
  }

  function openNewsDetail(card) {
    if (!indexView || !detailView || !detailTitle || !detailDate || !detailBody) return;

    const article = getCardData(card);
    setDetailCategory(article.category);
    detailTitle.textContent = article.title;
    detailDate.textContent = article.date;
    detailDate.setAttribute("datetime", article.datetime);
    detailBody.innerHTML = newsArticleBodies[article.title] || `
      <h3>亲爱的大侠：</h3>
      <p>${article.title} 的详细内容正在整理中，请关注后续官方公告。</p>
      <p class="news-signature">《无界墨香》运营团队</p>
    `;

    indexView.hidden = true;
    detailView.hidden = false;
    document.title = `【${article.category}】${article.title} - 无界墨香`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeNewsDetail() {
    if (!indexView || !detailView) return;
    detailView.hidden = true;
    indexView.hidden = false;
    document.title = "江湖快报 - 无界墨香";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.addEventListener("click", () => openNewsDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openNewsDetail(card);
    });
  });

  detailBack?.addEventListener("click", closeNewsDetail);

  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      tabs.forEach((tab) => {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");

      state.filter = button.dataset.filter || "全部";
      state.page = 1;
      renderNewsPage();
    });
  });

  prevButton?.addEventListener("click", () => {
    state.page -= 1;
    renderNewsPage();
  });

  nextButton?.addEventListener("click", () => {
    state.page += 1;
    renderNewsPage();
  });

  renderNewsPage();
}

initNewsPage();

const guideArticleBodies = {
  map: `
    <h3>少侠须知：</h3>
    <p>此处应有详细的【地图总览】攻略内容，后续将补充主城、野外场景、秘境入口与资源刷新点。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>核心机制介绍</li>
      <li>关键技巧与注意事项</li>
      <li>常见问题解答 FAQ</li>
      <li>高手进阶心得</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  beginner: `
    <h3>初入江湖：</h3>
    <p>此处应有详细的【新手指南】攻略内容，帮助新角色更快理解基础系统与前期成长节奏。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>角色创建、门派选择与初期任务路线</li>
      <li>背包、技能、装备、坐骑等基础系统说明</li>
      <li>前期资源优先级与每日必做事项</li>
      <li>新手常见问题解答 FAQ</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  advanced: `
    <h3>修为精进：</h3>
    <p>此处应有详细的【进阶指南】攻略内容，覆盖中后期培养、属性选择与战斗细节。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>经脉、心法、套装搭配的成长路线</li>
      <li>不同流派的属性收益与培养顺序</li>
      <li>副本、活动、战场中的进阶操作细节</li>
      <li>高手进阶心得与误区提醒</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  pvp: `
    <h3>锋刃相见：</h3>
    <p>此处应有详细的【PVP玩法】攻略内容，帮助大侠掌握竞技、战场与帮会对抗节奏。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>华山论剑、跨服战场、帮会争霸规则</li>
      <li>控制、解控、爆发窗口与走位技巧</li>
      <li>不同流派之间的克制关系</li>
      <li>组队分工与战场沟通常见策略</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  equipment: `
    <h3>神兵有灵：</h3>
    <p>此处应有详细的【装备指南】攻略内容，整理装备获取、强化养成与阶段替换思路。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>神兵、宝甲、饰品的主要获取途径</li>
      <li>强化、镶嵌、传承与洗炼优先级</li>
      <li>不同阶段装备替换建议</li>
      <li>资源投入与保底机制注意事项</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  pet: `
    <h3>异兽相随：</h3>
    <p>此处应有详细的【宠物资料】攻略内容，汇总捕获地点、资质培养与出战搭配。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>珍奇异兽捕获地点与出现条件</li>
      <li>资质、技能、成长方向解析</li>
      <li>培养、进化、出战搭配建议</li>
      <li>宠物常见问题解答 FAQ</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  life: `
    <h3>江湖百工：</h3>
    <p>此处应有详细的【生活技能】攻略内容，说明采集、制造、熟练度与资源收益路线。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>采药、挖矿、锻造、烹饪的解锁方式</li>
      <li>材料刷新点、产物用途与熟练度提升</li>
      <li>适合新手与高阶玩家的收益路线</li>
      <li>市场交易与资源储备建议</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `,
  other: `
    <h3>疑难杂录：</h3>
    <p>此处应有详细的【其他】攻略内容，收纳奇遇、隐藏成就、彩蛋线索与综合问题。</p>
    <h4>【重点内容】</h4>
    <ul>
      <li>奇遇任务、隐藏成就与江湖传闻</li>
      <li>特殊道具、彩蛋事件与探索线索</li>
      <li>疑难杂症与异常情况处理方式</li>
      <li>后续补充的综合攻略索引</li>
    </ul>
    <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
  `
};

// Guide list/detail interactions on guides.html.
function initGuidesPage() {
  const indexView = document.querySelector("[data-guide-index]");
  const detailView = document.querySelector("[data-guide-detail]");
  const detailBack = document.querySelector("[data-guide-detail-back]");
  const detailTitle = document.querySelector("[data-guide-detail-title]");
  const detailDescription = document.querySelector("[data-guide-detail-description]");
  const detailBody = document.querySelector("[data-guide-detail-body]");
  const cards = Array.from(document.querySelectorAll("[data-guide-card]"));
  if (!indexView || !detailView || !detailTitle || !detailDescription || !detailBody || cards.length === 0) return;

  function getGuideData(card) {
    const title = card.querySelector("h2")?.textContent.trim() || "武功秘籍";
    const description = card.querySelector("p")?.textContent.trim() || "";
    return {
      key: card.dataset.guideKey || "",
      title,
      description
    };
  }

  function openGuideDetail(card) {
    const guide = getGuideData(card);
    detailTitle.textContent = guide.title;
    detailDescription.textContent = guide.description;
    detailBody.innerHTML = guideArticleBodies[guide.key] || `
      <h3>少侠须知：</h3>
      <p>此处应有详细的【${guide.title}】攻略内容。</p>
      <p class="guide-signature">具体的图文攻略正在由百晓生紧急撰写中，敬请期待后续更新！</p>
    `;

    indexView.hidden = true;
    detailView.hidden = false;
    document.body.classList.add("guide-detail-open");
    document.title = `${guide.title} - 武功秘籍 - 鸿禧墨魂+30`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    detailBack?.focus({ preventScroll: true });
  }

  function closeGuideDetail() {
    detailView.hidden = true;
    indexView.hidden = false;
    document.body.classList.remove("guide-detail-open");
    document.title = "武功秘籍 - 鸿禧墨魂+30";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.addEventListener("click", () => openGuideDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openGuideDetail(card);
    });
  });

  detailBack?.addEventListener("click", closeGuideDetail);
}

initGuidesPage();

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

document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = validateAuthForm(form);
    if (!result.valid) {
      setAuthAlert(form, result.message, "error");
      result.input?.focus();
      return;
    }

    setAuthAlert(form, authSecurityMessage, "error");
  });

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      setInputInvalid(input, false);
    });
  });
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.closest(".password-field")?.querySelector("input");
    if (!input) return;

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.setAttribute("aria-label", shouldShow ? "隐藏密码" : "显示密码");
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
// 7. initialize the layered hero logo entrance
// 8. start leaf animation
window.addEventListener("DOMContentLoaded", () => {
  navigate();
  renderRank();
  renderClassPanel();
  initGallery();
  initFeatureReveal();
  initRunningBorders();
  initHeroLogoAnimation();
  initLeafCanvas();
});
