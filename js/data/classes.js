// ------------------------------------------------------------
// Game class data
// ------------------------------------------------------------
// This object stores every playable class shown in the "天下流派" section.
// Each key, such as "sword" or "blade", matches the data-class value in index.html.
// The renderClassPanel() function reads this data and updates the large class card.
export const classes = {
  sword: {
    mark: "剑",
    name: "剑宗",
    meta: "近战•爆发•突进",
    tags: ["近战", "爆发", "突进"],
    difficulty: 4,
    quote: "「十步杀一人，千里不留行。」",
    body: "剑宗弟子修习无上剑意，剑法轻灵飘逸，动若脱兔。以极致的爆发和身法斩敌于瞬息之间，是战场上最锐利的锋芒。",
    image: "../assets/images/sword.webp"
  },
  blade: {
    mark: "刀",
    name: "霸刀",
    meta: "近战•生存•破阵",
    tags: ["近战", "生存", "破阵"],
    difficulty: 2,
    quote: "「力拔山兮气盖世。」",
    body: "霸刀门人行事磊落，大开大合，霸道无双。擅长正面硬撼，以狂暴的刀气撕裂一切防御，万军丛中如入无人之境。",
    image: "../assets/images/knife.webp"
  },
  spear: {
    mark: "枪",
    name: "神机",
    meta: "近战•持续•牵制",
    tags: ["近战", "持续", "牵制"],
    difficulty: 3,
    quote: "「一点寒芒先到，随后枪出如龙。」",
    body: "神机营传承武将之风，攻守兼备，攻击范围极广。枪法连绵不绝，于百万军中取敌将首级若探囊取物。",
    image: "../assets/images/gun.webp"
  },
  fist: {
    mark: "拳",
    name: "罗汉",
    meta: "近战•坦克•控制",
    tags: ["近战", "坦克", "控制"],
    difficulty: 3,
    quote: "「天下武功出少林。」",
    body: "罗汉堂武僧舍弃兵刃，将肉身淬炼至极致。近身肉搏，拳拳到肉，金刚不坏之躯更能为同伴抵挡致命的威胁。",
    image: "../assets/images/fist.webp"
  },
  bow: {
    mark: "弓",
    name: "飞羽",
    meta: "远程•消耗•机动",
    tags: ["远程", "消耗", "机动"],
    difficulty: 4,
    quote: "「会挽雕弓如满月，西北望，射天狼。」",
    body: "飞羽身法灵动，百步穿杨。善于在极远的距离外点杀目标，利用陷阱与走位将敌人戏弄于股掌之间。",
    image: "../assets/images/arrow.webp"
  },
  dagger: {
    mark: "刺",
    name: "暗影",
    meta: "远程•毒伤•爆发",
    tags: ["远程", "毒伤", "爆发"],
    difficulty: 5,
    quote: "「十殿阎罗，无影无形。」",
    body: "暗影楼精通淬毒与奇门暗器，杀人于无形。平时隐匿于黑暗之中，一旦出手，便是最致命的绝杀。",
    image: "../assets/images/prick.webp"
  }
};
