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
export function initGuidesPage() {
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
