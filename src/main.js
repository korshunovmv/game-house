import "./style.css";

const PHASES = ["Утро", "День", "Вечер", "Ночь"];
const MAX_DAYS = 60;
const SAVE_KEY = "house-last-safe-home-save-v2";
const AUTO_HERO_DELAY_MS = 1400;

const WEATHER_TYPES = [
  { name: "Ясно", riskMod: 0.9 },
  { name: "Туман", riskMod: 1.1 },
  { name: "Дождь", riskMod: 1.25 },
  { name: "Кислотный дождь", riskMod: 1.45 }
];

const TRANSPORTS = [
  { id: "bike", name: "Велосипед", fuelUse: 0, cargo: 35, breakRisk: 1.1 },
  { id: "scooter", name: "Скутер", fuelUse: 8, cargo: 50, breakRisk: 1.0 },
  { id: "car", name: "Машина", fuelUse: 14, cargo: 80, breakRisk: 0.9 }
];

const NODE_CONNECTIONS = {
  home: ["suburb"],
  suburb: ["home", "market", "gas", "farm"],
  market: ["suburb", "station"],
  gas: ["suburb", "factory"],
  farm: ["suburb", "forest"],
  station: ["market", "cityCenter", "lab"],
  factory: ["gas", "rail"],
  forest: ["farm", "rail"],
  cityCenter: ["station"],
  rail: ["factory", "forest", "lab"],
  lab: ["station", "rail"]
};

const FIXED_LOCATIONS = [
  { id: "home", name: "Дом", risk: 0.2, tags: ["food"] },
  { id: "suburb", name: "Пригород", risk: 0.9, tags: ["food", "materials"] },
  { id: "market", name: "Супермаркет", risk: 1.0, tags: ["food", "meds"] },
  { id: "gas", name: "Бензоколонка", risk: 1.1, tags: ["fuel", "parts"] },
  { id: "farm", name: "Ферма", risk: 1.25, tags: ["food", "materials"] },
  { id: "station", name: "Ж/д узел", risk: 1.35, tags: ["parts", "electronics"] },
  { id: "factory", name: "Завод", risk: 1.55, tags: ["materials", "parts"] },
  { id: "forest", name: "Лесная зона", risk: 1.2, tags: ["food", "materials"] },
  { id: "cityCenter", name: "Центр города", risk: 1.7, tags: ["meds", "electronics"] },
  { id: "rail", name: "Заброшенный узел", risk: 1.45, tags: ["parts", "fuel"] },
  { id: "lab", name: "Лаборатория", risk: 1.8, tags: ["meds", "electronics"] }
];

const UPGRADE_DEFS = [
  {
    id: "fortifiedDoor",
    name: "Укрепленная дверь",
    desc: "+15 к прочности двери, волны наносят меньше урона",
    cost: { materials: 20, parts: 8 },
    apply: (s) => {
      s.base.door = Math.min(100, s.base.door + 15);
      s.modifiers.waveDamage *= 0.88;
    }
  },
  {
    id: "workshop",
    name: "Мастерская",
    desc: "Ремонт дешевле, шанс поломки транспорта ниже",
    cost: { materials: 16, parts: 12, fuel: 4 },
    apply: (s) => {
      s.modifiers.repairEfficiency += 0.3;
      s.modifiers.breakRisk *= 0.85;
    }
  },
  {
    id: "greenhouse",
    name: "Теплица",
    desc: "Каждый вечер +4 еды (зимой +2)",
    cost: { materials: 24, parts: 6, electronics: 4 },
    apply: (s) => {
      s.modifiers.greenhouse = true;
    }
  },
  {
    id: "generator",
    name: "Генератор + батареи",
    desc: "Снижает ночной урон и усталость",
    cost: { materials: 18, parts: 14, fuel: 10 },
    apply: (s) => {
      s.modifiers.generator = true;
      s.base.power = Math.min(100, s.base.power + 30);
      s.modifiers.waveDamage *= 0.9;
    }
  },
  {
    id: "watchtower",
    name: "Охранная вышка",
    desc: "Охранники эффективнее, шанс отбить волну выше",
    cost: { materials: 25, parts: 12, electronics: 5 },
    apply: (s) => {
      s.modifiers.watchtower = true;
      s.modifiers.defenseBonus += 0.2;
    }
  },
  {
    id: "radio",
    name: "Радиосвязь",
    desc: "Открывает главную линию и события эвакуации",
    cost: { materials: 10, electronics: 14, parts: 6 },
    apply: (s) => {
      s.modifiers.radio = true;
      s.story.radioOnline = true;
    }
  }
];

const NPC_POOL = [
  { id: "engineer", name: "Инженер", bonus: "Ремонт +25%" },
  { id: "guard", name: "Охранник", bonus: "Ночные волны слабее" },
  { id: "gardener", name: "Садовник", bonus: "Теплица даёт +2 еды" },
  { id: "medic", name: "Фельдшер", bonus: "Меньше штрафов от заражения" },
  { id: "trader", name: "Торговец", bonus: "Иногда обменивает хлам на медикаменты" }
];

const NPC_ROLE_DEFS = {
  guard: { name: "Охрана" },
  scavenger: { name: "Снабжение" },
  medic: { name: "Медицина" },
  mechanic: { name: "Техник" }
};

const RADIO_LINES = [
  "Радио: \"...если кто-то слышит, безопасный коридор может открыться на севере...\"",
  "Радио: \"Передаём штормовое предупреждение. Избегайте низин и каналов.\"",
  "Радио: \"Сигнал лагеря беженцев прервался три часа назад.\"",
  "Радио: \"На частоте 91.2 остались выжившие, им нужен фильтр воды.\"",
  "Радио: \"Ночная активность мутантов выросла после кислотного дождя.\""
];

const GARAGE_UPGRADES = [
  {
    id: "garageEngine",
    name: "Тюнинг двигателя",
    desc: "-20% расход топлива у транспорта",
    cost: { parts: 16, fuel: 6, electronics: 4 }
  },
  {
    id: "garageHull",
    name: "Усиленный корпус",
    desc: "Шанс поломки в экспедиции заметно ниже",
    cost: { materials: 18, parts: 12 }
  },
  {
    id: "garageTrunk",
    name: "Расширенный багажник",
    desc: "+8 слотов и +45 кг к лимиту инвентаря",
    cost: { materials: 14, parts: 10, electronics: 3 }
  },
  {
    id: "garageLights",
    name: "Прожекторы и радар",
    desc: "Ниже риск засады и выше точность в бою",
    cost: { parts: 12, electronics: 8, fuel: 3 }
  }
];

const RESOURCE_INFO = {
  food: { label: "Еда", weight: 1.0 },
  fuel: { label: "Топливо", weight: 1.4 },
  meds: { label: "Медикаменты", weight: 0.6 },
  ammo9: { label: "Патроны 9mm", weight: 0.2 },
  ammo12: { label: "Патроны 12g", weight: 0.25 },
  ammo556: { label: "Патроны 5.56", weight: 0.22 },
  materials: { label: "Материалы", weight: 2.0 },
  parts: { label: "Запчасти", weight: 1.2 },
  electronics: { label: "Электроника", weight: 0.7 }
};

const WEAPONS = [
  {
    id: "knife",
    name: "Нож выжившего",
    damageMin: 4,
    damageMax: 7,
    hitBonus: 0.05,
    aimedBonus: 0.02,
    noise: 0.1,
    ammoUse: 0,
    ammoType: null,
    maxDurability: 100,
    durabilityLoss: 0.4,
    cost: null
  },
  {
    id: "pistol",
    name: "Пистолет",
    damageMin: 7,
    damageMax: 11,
    hitBonus: 0.09,
    aimedBonus: 0.08,
    noise: 1.0,
    ammoUse: 1,
    ammoType: "ammo9",
    maxDurability: 95,
    durabilityLoss: 1.4,
    cost: { parts: 10, materials: 6, fuel: 2 }
  },
  {
    id: "shotgun",
    name: "Дробовик",
    damageMin: 10,
    damageMax: 15,
    hitBonus: 0.04,
    aimedBonus: 0.04,
    noise: 1.45,
    ammoUse: 1,
    ammoType: "ammo12",
    maxDurability: 90,
    durabilityLoss: 2.1,
    cost: { parts: 16, materials: 10, fuel: 4 }
  },
  {
    id: "rifle",
    name: "Карабин",
    damageMin: 9,
    damageMax: 14,
    hitBonus: 0.12,
    aimedBonus: 0.14,
    noise: 0.85,
    ammoUse: 1,
    ammoType: "ammo556",
    maxDurability: 105,
    durabilityLoss: 1.2,
    cost: { parts: 20, materials: 12, electronics: 5 }
  }
];

const ARMORS = [
  {
    id: "jacket",
    name: "Куртка с накладками",
    hpBonus: 0,
    damageReduction: 0.07,
    dodgeBonus: 0.03,
    cost: null
  },
  {
    id: "leather",
    name: "Кожаная броня",
    hpBonus: 3,
    damageReduction: 0.12,
    dodgeBonus: 0.04,
    cost: { materials: 12, parts: 6 }
  },
  {
    id: "kevlar",
    name: "Кевларовый жилет",
    hpBonus: 6,
    damageReduction: 0.2,
    dodgeBonus: 0.02,
    cost: { parts: 14, materials: 10, electronics: 2 }
  },
  {
    id: "riot",
    name: "Штурмовая броня",
    hpBonus: 9,
    damageReduction: 0.26,
    dodgeBonus: 0.0,
    cost: { parts: 22, materials: 14, electronics: 4, fuel: 3 }
  }
];

const app = document.querySelector("#app");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function createInitialState() {
  return {
    day: 1,
    phase: 0,
    weather: WEATHER_TYPES[0],
    seasonIndex: 0,
    gameOver: false,
    logs: [],
    map: {
      currentNodeId: "home",
      discovered: ["home", "suburb", "market", "gas"],
      selectedNodeId: "market"
    },
    pendingEncounter: null,
    combat: null,
    flow: {
      mode: "idle"
    },
    selectedTransportId: "car",
    resources: {
      food: 26,
      fuel: 24,
      meds: 8,
      ammo9: 18,
      ammo12: 10,
      ammo556: 14,
      materials: 20,
      parts: 12,
      electronics: 5
    },
    inventory: {
      items: [],
      baseSlots: 12,
      baseWeight: 55
    },
    base: {
      wall: 72,
      door: 70,
      power: 38,
      fatigue: 26,
      stress: 24,
      infection: 8
    },
    modifiers: {
      waveDamage: 1,
      repairEfficiency: 1,
      breakRisk: 1,
      defenseBonus: 0,
      greenhouse: false,
      generator: false,
      watchtower: false,
      radio: false,
      infectionResist: 1
    },
    upgradesBuilt: [],
    garage: {
      built: []
    },
    hero: {
      ownedWeapons: ["knife"],
      ownedArmors: ["jacket"],
      equippedWeaponId: "knife",
      equippedArmorId: "jacket",
      injuries: {
        arm: 0,
        leg: 0,
        torso: 0
      },
      weaponDurability: {
        knife: 100,
        pistol: 95,
        shotgun: 90,
        rifle: 105
      }
    },
    worldThreat: Object.fromEntries(FIXED_LOCATIONS.map((l) => [l.id, 0])),
    npcManagement: {
      fatigue: 12,
      morale: 62,
      shifts: {
        guard: 1,
        scavenger: 1,
        medic: 1,
        mechanic: 1
      }
    },
    npcs: [],
    story: {
      introDone: false,
      radioOnline: false,
      antennaParts: 0,
      endingReady: false
    },
    dayStats: {
      gained: { food: 0, fuel: 0, meds: 0, ammo9: 0, ammo12: 0, ammo556: 0, materials: 0, parts: 0, electronics: 0 },
      spent: { food: 0, fuel: 0, meds: 0, ammo9: 0, ammo12: 0, ammo556: 0, materials: 0, parts: 0, electronics: 0 }
    },
    ui: {
      upgradesCollapsed: true,
      garageCollapsed: true,
      heroGearCollapsed: true,
      defaultsApplied: true
    },
    gameplay: {
      arcadeMode: true
    },
    ai: {
      autoHeroEnabled: true,
      intent: "Оценка обстановки",
      defaultsApplied: true
    },
    dayPlan: {
      generatedForDay: 0,
      goals: []
    },
    economyHistory: []
  };
}

function normalizeState(raw) {
  const defaults = createInitialState();
  const s = raw || defaults;
  const mergedUi = { ...defaults.ui, ...(s.ui || {}) };
  // One-time migration for existing saves: collapse optional panels by default.
  if (!mergedUi.defaultsApplied) {
    mergedUi.upgradesCollapsed = true;
    mergedUi.garageCollapsed = true;
    mergedUi.heroGearCollapsed = true;
    mergedUi.defaultsApplied = true;
  }
  return {
    ...defaults,
    ...s,
    map: { ...defaults.map, ...(s.map || {}) },
    flow: { ...defaults.flow, ...(s.flow || {}) },
    resources: { ...defaults.resources, ...(s.resources || {}) },
    inventory: { ...defaults.inventory, ...(s.inventory || {}) },
    base: { ...defaults.base, ...(s.base || {}) },
    modifiers: { ...defaults.modifiers, ...(s.modifiers || {}) },
    story: { ...defaults.story, ...(s.story || {}) },
    dayStats: {
      gained: { ...defaults.dayStats.gained, ...(s.dayStats?.gained || {}) },
      spent: { ...defaults.dayStats.spent, ...(s.dayStats?.spent || {}) }
    },
    ui: mergedUi,
    ai: (() => {
      const merged = { ...defaults.ai, ...(s.ai || {}) };
      if (!merged.defaultsApplied) {
        merged.autoHeroEnabled = true;
        merged.defaultsApplied = true;
      }
      return merged;
    })(),
    hero: {
      ...defaults.hero,
      ...(s.hero || {}),
      injuries: {
        ...defaults.hero.injuries,
        ...(s.hero?.injuries || {})
      },
      weaponDurability: {
        ...defaults.hero.weaponDurability,
        ...(s.hero?.weaponDurability || {})
      }
    },
    worldThreat: { ...defaults.worldThreat, ...(s.worldThreat || {}) },
    npcManagement: {
      ...defaults.npcManagement,
      ...(s.npcManagement || {}),
      shifts: { ...defaults.npcManagement.shifts, ...(s.npcManagement?.shifts || {}) }
    },
    dayPlan: {
      ...defaults.dayPlan,
      ...(s.dayPlan || {})
    },
    economyHistory: Array.isArray(s.economyHistory) ? s.economyHistory : defaults.economyHistory,
    gameplay: {
      ...defaults.gameplay,
      ...(s.gameplay || {})
    },
    garage: { ...defaults.garage, ...(s.garage || {}) },
    upgradesBuilt: [...new Set(s.upgradesBuilt || defaults.upgradesBuilt)],
    npcs: s.npcs || [],
    logs: s.logs || [],
    pendingEncounter: s.pendingEncounter || null,
    combat: s.combat || null
  };
}

let state = normalizeState(loadGame());
let autoHeroTimer = null;
let lastLogFingerprint = "";
let repeatedLogCount = 0;

function sanitizeResourceObject(resourceObj) {
  const allowed = ["food", "fuel", "meds", "ammo9", "ammo12", "ammo556", "materials", "parts", "electronics"];
  const clean = {};
  allowed.forEach((k) => {
    clean[k] = Number.isFinite(resourceObj?.[k]) ? resourceObj[k] : 0;
  });
  return clean;
}

function sanitizeDayStats(dayStatsObj) {
  return {
    gained: sanitizeResourceObject(dayStatsObj?.gained || {}),
    spent: sanitizeResourceObject(dayStatsObj?.spent || {})
  };
}

// Migrate potentially stale saves (e.g. legacy "ammo" key).
state.resources = sanitizeResourceObject(state.resources);
state.dayStats = sanitizeDayStats(state.dayStats);

state.hero.ownedWeapons = [...new Set(state.hero.ownedWeapons)].filter((id) => WEAPONS.some((w) => w.id === id));
state.hero.ownedArmors = [...new Set(state.hero.ownedArmors)].filter((id) => ARMORS.some((a) => a.id === id));
if (!state.hero.ownedWeapons.length) state.hero.ownedWeapons = ["knife"];
if (!state.hero.ownedArmors.length) state.hero.ownedArmors = ["jacket"];
if (!state.hero.ownedWeapons.includes(state.hero.equippedWeaponId)) {
  state.hero.equippedWeaponId = state.hero.ownedWeapons[0];
}
if (!state.hero.ownedArmors.includes(state.hero.equippedArmorId)) {
  state.hero.equippedArmorId = state.hero.ownedArmors[0];
}

function getSeasonName() {
  const seasons = ["Весна", "Лето", "Осень", "Зима"];
  return seasons[state.seasonIndex];
}

function recalcSeason() {
  state.seasonIndex = Math.floor((state.day - 1) / 15) % 4;
}

function getTransport(id = state.selectedTransportId) {
  return TRANSPORTS.find((t) => t.id === id) || TRANSPORTS[0];
}

function getLocationById(id) {
  return FIXED_LOCATIONS.find((l) => l.id === id);
}

function hasGarageUpgrade(id) {
  return state.garage.built.includes(id);
}

function getTransportStats(id = state.selectedTransportId) {
  const base = getTransport(id);
  return {
    ...base,
    fuelUse: Math.max(0, Math.round(base.fuelUse * (hasGarageUpgrade("garageEngine") ? 0.8 : 1))),
    breakRisk: base.breakRisk * (hasGarageUpgrade("garageHull") ? 0.72 : 1)
  };
}

function getBestAffordableTransportId(distance) {
  const options = TRANSPORTS
    .map((t) => {
      const stats = getTransportStats(t.id);
      return { id: t.id, fuelNeed: stats.fuelUse * distance, cargo: stats.cargo };
    })
    .filter((o) => state.resources.fuel >= o.fuelNeed);
  if (!options.length) return null;
  options.sort((a, b) => b.cargo - a.cargo);
  return options[0].id;
}

function getWeaponById(id) {
  return WEAPONS.find((w) => w.id === id) || WEAPONS[0];
}

function getArmorById(id) {
  return ARMORS.find((a) => a.id === id) || ARMORS[0];
}

function getEquippedWeapon() {
  return getWeaponById(state.hero.equippedWeaponId);
}

function getEquippedArmor() {
  return getArmorById(state.hero.equippedArmorId);
}

function getWeaponDurability(id) {
  return clamp(state.hero.weaponDurability[id] ?? getWeaponById(id).maxDurability, 0, 140);
}

function applyWeaponWear(id, amount) {
  state.hero.weaponDurability[id] = clamp(getWeaponDurability(id) - amount, 0, 140);
}

function getWeaponDurabilityFactor(id) {
  const w = getWeaponById(id);
  const durability = getWeaponDurability(id);
  const ratio = durability / w.maxDurability;
  if (ratio >= 0.75) return 1;
  if (ratio >= 0.5) return 0.92;
  if (ratio >= 0.25) return 0.82;
  return 0.68;
}

function addLog(msg, cssClass = "") {
  const fingerprint = `${cssClass}|${msg}`;
  if (lastLogFingerprint === fingerprint) {
    repeatedLogCount += 1;
    if (repeatedLogCount > 1) {
      return;
    }
  } else {
    lastLogFingerprint = fingerprint;
    repeatedLogCount = 0;
  }
  state.logs.unshift({ msg, cssClass });
  state.logs = state.logs.slice(0, 220);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function resetGame() {
  state = createInitialState();
  addLog("Новая сессия начата.");
  state.weather = WEATHER_TYPES[randomInt(0, WEATHER_TYPES.length - 1)];
  saveGame();
  ensureAutoHeroLoop();
  render();
}

function hasCost(cost) {
  return Object.entries(cost).every(([k, v]) => state.resources[k] >= v);
}

function spend(cost) {
  Object.entries(cost).forEach(([k, v]) => {
    state.resources[k] -= v;
    if (state.dayStats?.spent?.[k] !== undefined) {
      state.dayStats.spent[k] += v;
    }
  });
}

function gainResource(type, amount) {
  if (state.resources[type] === undefined || amount <= 0) return;
  state.resources[type] += amount;
  if (state.dayStats?.gained?.[type] !== undefined) {
    state.dayStats.gained[type] += amount;
  }
}

function getInventoryLimits() {
  return {
    slots: state.inventory.baseSlots + (hasGarageUpgrade("garageTrunk") ? 8 : 0),
    weight: state.inventory.baseWeight + (hasGarageUpgrade("garageTrunk") ? 45 : 0)
  };
}

function getCurrentInventoryWeight() {
  return state.inventory.items.reduce((sum, item) => {
    return sum + item.qty * (RESOURCE_INFO[item.type]?.weight || 1);
  }, 0);
}

function getCurrentInventorySlots() {
  return state.inventory.items.length;
}

function addToInventory(type, qty) {
  if (!RESOURCE_INFO[type] || qty <= 0) return 0;
  const limits = getInventoryLimits();
  const unitWeight = RESOURCE_INFO[type].weight;
  const existing = state.inventory.items.find((x) => x.type === type);

  const currentWeight = getCurrentInventoryWeight();
  const canByWeight = Math.floor((limits.weight - currentWeight) / unitWeight);
  const needsNewSlot = !existing;
  const freeSlots = limits.slots - getCurrentInventorySlots();
  const canBySlots = needsNewSlot && freeSlots <= 0 ? 0 : qty;
  const accepted = Math.max(0, Math.min(qty, canByWeight, canBySlots));

  if (accepted <= 0) return 0;
  if (existing) {
    existing.qty += accepted;
  } else {
    state.inventory.items.push({ type, qty: accepted });
  }
  return accepted;
}

function addLootToInventory(found) {
  const dropped = {};
  Object.entries(found).forEach(([type, qty]) => {
    const accepted = addToInventory(type, qty);
    const lost = qty - accepted;
    if (lost > 0) dropped[type] = lost;
  });
  return dropped;
}

function reportDaySummary() {
  const fmt = (obj) =>
    Object.entries(obj)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${RESOURCE_INFO[k].label}: ${v}`)
      .join(", ");

  const gained = fmt(state.dayStats.gained);
  const spent = fmt(state.dayStats.spent);
  if (gained || spent) {
    addLog(
      `Итог дня — добыто: ${gained || "нет"}; израсходовано: ${spent || "нет"}.`,
      "good"
    );
  }
  state.economyHistory.push({
    day: state.day,
    gained: { ...state.dayStats.gained },
    spent: { ...state.dayStats.spent }
  });
  if (state.economyHistory.length > 7) {
    state.economyHistory = state.economyHistory.slice(-7);
  }
  state.dayStats.gained = { food: 0, fuel: 0, meds: 0, ammo9: 0, ammo12: 0, ammo556: 0, materials: 0, parts: 0, electronics: 0 };
  state.dayStats.spent = { food: 0, fuel: 0, meds: 0, ammo9: 0, ammo12: 0, ammo556: 0, materials: 0, parts: 0, electronics: 0 };
}

function updateIntent(text) {
  state.ai.intent = text;
}

function generateDayPlan() {
  const goals = [];
  if (state.resources.food < 10) goals.push("Добыть еду и вернуться до вечера");
  if (state.resources.fuel < 12) goals.push("Найти топливо и не рисковать лишний раз");
  if (state.resources.meds < 3 || state.base.infection > 35) goals.push("Приоритет: медикаменты и снижение заражения");
  if (state.base.wall < 50 || state.base.door < 50) goals.push("Укрепить дом перед ночью");
  if (!state.story.radioOnline) goals.push("Искать компоненты для радиосвязи");
  if (!goals.length) goals.push("Поддерживать запасы и избегать лишнего риска");
  state.dayPlan = {
    generatedForDay: state.day,
    goals: goals.slice(0, 3)
  };
}

function healInjuriesOnRest() {
  state.hero.injuries.arm = Math.max(0, state.hero.injuries.arm - 4);
  state.hero.injuries.leg = Math.max(0, state.hero.injuries.leg - 4);
  state.hero.injuries.torso = Math.max(0, state.hero.injuries.torso - 4);
}

function applyNpcShiftEffects() {
  const shifts = state.npcManagement.shifts;
  const staffed = Math.max(1, state.npcs.length);
  const fatigueGain = 2 + Math.max(0, (shifts.guard + shifts.scavenger + shifts.medic + shifts.mechanic) - staffed);
  state.npcManagement.fatigue = clamp(state.npcManagement.fatigue + fatigueGain - (PHASES[state.phase] === "Ночь" ? 0 : 1), 0, 100);

  if (shifts.medic > 0 && state.resources.meds > 0 && state.base.infection > 18) {
    state.base.infection = clamp(state.base.infection - 2, 0, 100);
    state.resources.meds -= 1;
    state.dayStats.spent.meds += 1;
  }

  if (shifts.mechanic > 0 && state.resources.parts > 0 && Math.random() < 0.4) {
    state.resources.parts -= 1;
    state.dayStats.spent.parts += 1;
    const wId = state.hero.equippedWeaponId;
    state.hero.weaponDurability[wId] = clamp(getWeaponDurability(wId) + 2, 0, 140);
  }

  if (shifts.scavenger > 0 && PHASES[state.phase] === "День" && Math.random() < 0.35) {
    const gainMap = [
      ["food", randomInt(1, 3)],
      ["materials", randomInt(1, 2)],
      ["ammo9", randomInt(1, 3)]
    ];
    const picked = gainMap[randomInt(0, gainMap.length - 1)];
    gainResource(picked[0], picked[1]);
  }

  const moraleDelta = (shifts.guard > 0 ? 1 : -1) - (state.npcManagement.fatigue > 70 ? 2 : 0);
  state.npcManagement.morale = clamp(state.npcManagement.morale + moraleDelta, 0, 100);
}

function decayThreatMap() {
  Object.keys(state.worldThreat).forEach((id) => {
    const decay = PHASES[state.phase] === "Ночь" ? 1 : 2;
    state.worldThreat[id] = clamp(state.worldThreat[id] - decay, 0, 100);
  });
}

function unloadInventory() {
  if (!state.inventory.items.length) {
    addLog("Инвентарь пуст.", "bad");
    render();
    return;
  }
  state.inventory.items.forEach((item) => {
    if (state.resources[item.type] !== undefined) {
      state.resources[item.type] += item.qty;
    }
  });
  state.inventory.items = [];
  addLog("Груз разгружен на склад базы.", "good");
  saveGame();
  render();
}

function distanceBetween(fromId, toId) {
  if (fromId === toId) return 0;
  const visited = new Set([fromId]);
  const queue = [{ id: fromId, d: 0 }];
  while (queue.length) {
    const { id, d } = queue.shift();
    const neighbors = NODE_CONNECTIONS[id] || [];
    for (const n of neighbors) {
      if (n === toId) return d + 1;
      if (!visited.has(n)) {
        visited.add(n);
        queue.push({ id: n, d: d + 1 });
      }
    }
  }
  return 99;
}

function getReachableNodes() {
  const from = state.map.currentNodeId;
  return state.map.discovered.filter((nodeId) => distanceBetween(from, nodeId) <= 3);
}

function getPath(fromId, toId) {
  if (fromId === toId) return [fromId];
  const queue = [[fromId]];
  const visited = new Set([fromId]);

  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    const neighbors = NODE_CONNECTIONS[last] || [];
    for (const n of neighbors) {
      if (!state.map.discovered.includes(n) || visited.has(n)) continue;
      const nextPath = [...path, n];
      if (n === toId) return nextPath;
      visited.add(n);
      queue.push(nextPath);
    }
  }
  return null;
}

function getNextHopTowards(targetId, maxDistance = 3) {
  const from = state.map.currentNodeId;
  const path = getPath(from, targetId);
  if (!path || path.length <= 1) return null;
  const hopIndex = Math.min(maxDistance, path.length - 1);
  return path[hopIndex];
}

function ensureSelectedNodeReachable() {
  const reachable = getReachableNodes();
  if (!reachable.length) return;
  if (!reachable.includes(state.map.selectedNodeId)) {
    state.map.selectedNodeId = reachable.includes(state.map.currentNodeId)
      ? state.map.currentNodeId
      : reachable[0];
  }
}

function pickZombieClass(risk) {
  if (risk < 1.1) return "обычные";
  if (risk < 1.35) return Math.random() < 0.5 ? "быстрые" : "обычные";
  if (risk < 1.6) return Math.random() < 0.45 ? "устойчивые" : "быстрые";
  return Math.random() < 0.55 ? "мутанты" : "устойчивые";
}

function revealConnectedNode(sourceId) {
  const neighbors = NODE_CONNECTIONS[sourceId] || [];
  const hidden = neighbors.filter((n) => !state.map.discovered.includes(n));
  if (!hidden.length) return;
  const found = hidden[randomInt(0, hidden.length - 1)];
  state.map.discovered.push(found);
  addLog(`Разведка: обнаружен новый узел карты — ${getLocationById(found).name}.`, "good");
}

function maybeRecruitNpc(risk) {
  if (state.npcs.length >= 5) return;
  const chance = clamp(0.14 + risk * 0.04, 0.1, 0.42);
  if (Math.random() > chance) return;
  const candidates = NPC_POOL.filter((n) => !state.npcs.some((x) => x.id === n.id));
  if (!candidates.length) return;
  const npc = candidates[randomInt(0, candidates.length - 1)];
  state.npcs.push(npc);
  applyNpcBonus(npc);
  addLog(`Вы встретили NPC: ${npc.name}. Он присоединился к базе (${npc.bonus}).`, "good");
}

function applyNpcBonus(npc) {
  if (npc.id === "engineer") {
    state.modifiers.repairEfficiency += 0.25;
  } else if (npc.id === "guard") {
    state.modifiers.defenseBonus += 0.18;
  } else if (npc.id === "gardener") {
    state.modifiers.greenhouse = true;
  } else if (npc.id === "medic") {
    state.modifiers.infectionResist = 0.75;
  } else if (npc.id === "trader") {
    if (state.resources.parts >= 6) {
      state.resources.parts -= 6;
      state.resources.meds += 4;
      addLog("Торговец обменял 6 запчастей на 4 медикамента.");
    }
  }
}

function maybeStoryProgress(targetLocId) {
  if (!state.story.introDone) {
    state.story.introDone = true;
    addLog("Задача: починить дом, пережить первую волну и подготовить радиосвязь.");
  }

  if (targetLocId === "station" && Math.random() < 0.4) {
    state.story.antennaParts += 1;
    addLog(`Найдены элементы антенны (${state.story.antennaParts}/3).`, "good");
  }

  if (state.story.radioOnline && state.story.antennaParts >= 3 && state.day >= 18) {
    state.story.endingReady = true;
  }
}

function getSecondStopCandidates(currentTargetId) {
  const neighbors = NODE_CONNECTIONS[currentTargetId] || [];
  return neighbors.filter((id) => id !== state.map.currentNodeId && state.map.discovered.includes(id));
}

function consumePhaseTime() {
  state.phase += 1;
  if (state.phase > 3) {
    reportDaySummary();
    state.phase = 0;
    state.day += 1;
    recalcSeason();
    state.weather = WEATHER_TYPES[randomInt(0, WEATHER_TYPES.length - 1)];
    addLog(`Новый день: ${state.day}. Погода: ${state.weather.name}.`);
    generateDayPlan();
  }
}

function runNightWave() {
  const baseLevel = (100 - state.base.wall) * 0.01 + (100 - state.base.door) * 0.01;
  const weatherFactor = state.weather.riskMod;
  const shiftGuardBonus = state.npcManagement.shifts.guard * 0.08;
  const npcDefense = state.modifiers.defenseBonus + state.npcs.length * 0.03 + shiftGuardBonus;
  const difficulty = clamp(0.9 + baseLevel + weatherFactor - npcDefense, 0.7, 2.2);

  const arcadeDamageScale = state.gameplay.arcadeMode ? 0.62 : 1;
  const rawDamage = randomInt(5, 14) * difficulty * state.modifiers.waveDamage * arcadeDamageScale;
  const wallDmg = Math.round(rawDamage * 0.65);
  const doorDmg = Math.round(rawDamage * 0.35);

  state.base.wall = clamp(state.base.wall - wallDmg, 0, 100);
  state.base.door = clamp(state.base.door - doorDmg, 0, 100);
  state.base.fatigue = clamp(state.base.fatigue + randomInt(4, 8), 0, 100);
  state.base.stress = clamp(state.base.stress + randomInt(3, 9), 0, 100);

  addLog(`Ночная волна: урон базе - стены ${wallDmg}, дверь ${doorDmg}.`, "bad");
  if (state.modifiers.watchtower && Math.random() < 0.3) {
    state.resources.parts += 2;
    addLog("Охранная вышка помогла отбить волну и собрать трофеи (+2 запчасти).", "good");
  }
}

function applyPassive() {
  state.resources.food = Math.max(0, state.resources.food - (2 + Math.floor(state.npcs.length / 2)));
  if (state.modifiers.generator) {
    state.resources.fuel = Math.max(0, state.resources.fuel - 1);
    state.base.power = clamp(state.base.power + 2, 0, 100);
  } else {
    state.base.power = clamp(state.base.power - 2, 0, 100);
  }

  if (state.modifiers.greenhouse && PHASES[state.phase] === "Вечер") {
    const foodGain = getSeasonName() === "Зима" ? 2 : 4;
    state.resources.food += foodGain;
    addLog(`Теплица принесла +${foodGain} еды.`, "good");
  }

  if (state.resources.food === 0) {
    state.base.stress = clamp(state.base.stress + 6, 0, 100);
    state.base.fatigue = clamp(state.base.fatigue + 8, 0, 100);
    addLog("Голод подрывает силы и мораль.", "bad");
  }

  if (state.resources.meds > 0 && state.base.infection > 25) {
    state.resources.meds -= 1;
    state.dayStats.spent.meds += 1;
    const reduction = state.modifiers.infectionResist < 1 ? 7 : 5;
    state.base.infection = clamp(state.base.infection - reduction, 0, 100);
    addLog(`Использованы медикаменты. Заражение -${reduction}.`, "good");
  }

  if (PHASES[state.phase] === "Ночь") {
    runNightWave();
  }

  if (state.gameplay.arcadeMode && PHASES[state.phase] === "Утро") {
    const wallRegen = 3 + Math.floor(state.npcManagement.shifts.mechanic * 1.2);
    const doorRegen = 2 + Math.floor(state.npcManagement.shifts.guard * 0.8);
    state.base.wall = clamp(state.base.wall + wallRegen, 0, 100);
    state.base.door = clamp(state.base.door + doorRegen, 0, 100);
    addLog(`Аркада: база стабилизируется за ночь (стены +${wallRegen}, дверь +${doorRegen}).`, "good");
  }

  if (state.story.radioOnline && Math.random() < 0.38) {
    addLog(RADIO_LINES[randomInt(0, RADIO_LINES.length - 1)]);
  }

  applyNpcShiftEffects();
  decayThreatMap();
}

function checkGameOver() {
  if (state.day > MAX_DAYS && !state.story.endingReady) {
    state.gameOver = true;
    addLog("Ресурсы региона истощились. Вы не успели наладить связь вовремя.", "bad");
  }
  const failThreshold = state.gameplay.arcadeMode ? -18 : 0;
  if (state.base.wall <= failThreshold || state.base.door <= failThreshold) {
    state.gameOver = true;
    addLog("База пала под напором зараженных.", "bad");
  }
  if (state.base.infection >= 100) {
    state.gameOver = true;
    addLog("Инфекция взяла верх.", "bad");
  }
  if (state.story.endingReady && state.day >= 24) {
    state.gameOver = true;
    addLog("Финал: вы наладили радиоканал и подготовили коридор эвакуации для общины.", "good");
  }
}

function prepareExpedition(isScout = false) {
  if (state.gameOver || state.flow.mode !== "idle" || state.pendingEncounter || state.combat) return;
  if (PHASES[state.phase] === "Ночь") {
    addLog("Ночью выезд слишком опасен. Дождитесь утра.", "bad");
    render();
    return;
  }

  const from = state.map.currentNodeId;
  const to = state.map.selectedNodeId;
  const loc = getLocationById(to);
  const tr = getTransportStats();
  const legPenalty = state.hero.injuries.leg > 35 ? 1 : 0;
  const maxTravel = 3 - legPenalty;
  const distance = distanceBetween(from, to);
  if (!loc || distance > 3) {
    const hop = getNextHopTowards(to);
    if (loc && hop) {
      state.map.selectedNodeId = hop;
      addLog(`Маршрут скорректирован: промежуточная точка ${getLocationById(hop).name}.`);
      render();
      return prepareExpedition(isScout);
    }
    addLog("Маршрут недоступен для текущего выезда.", "bad");
    render();
    return;
  }
  if (distance > maxTravel) {
    addLog("Травма ноги ограничивает дальние поездки. Нужен отдых или лечение.", "bad");
    render();
    return;
  }
  const fuelCost = tr.fuelUse * distance;
  if (state.resources.fuel < fuelCost) {
    addLog("Недостаточно топлива для выбранной поездки.", "bad");
    render();
    return;
  }

  state.resources.fuel -= fuelCost;
  const weatherRisk = state.weather.riskMod;
  const timeRisk = PHASES[state.phase] === "Вечер" ? 1.25 : 1;
  const localThreat = (state.worldThreat[to] || 0) * 0.01;
  const globalRisk = (loc.risk + localThreat * 0.6) * weatherRisk * timeRisk;
  const zombieClass = pickZombieClass(globalRisk);

  state.pendingEncounter = {
    isScout,
    from,
    to,
    distance,
    transportId: tr.id,
    globalRisk,
    zombieClass
  };
  state.flow.mode = "encounter";

  addLog(`Выезд в ${loc.name}. На маршруте замечены зараженные (${zombieClass}).`);
  render();
}

function finalizeExpeditionOutcome(opts) {
  const p = state.pendingEncounter;
  if (!p) return;
  const tr = getTransportStats(p.transportId);
  const loc = getLocationById(p.to);
  const action = opts?.action || "stealth";
  const forceReturn = Boolean(opts?.forceReturn);

  const baseBreak = clamp(0.08 * p.globalRisk * tr.breakRisk * state.modifiers.breakRisk, 0.03, 0.45);
  const baseInfection = clamp(0.07 * p.globalRisk, 0.02, 0.5);
  const baseCombat = clamp(0.28 * p.globalRisk, 0.1, 0.9);

  let lootFactor = p.isScout ? 0.45 : 1;
  let breakChance = baseBreak;
  let infectionChance = baseInfection;
  let combatChance = baseCombat;

  const threatRaiseBase = action === "fightWin" || action === "fightLose" ? 18 : 8;
  state.worldThreat[p.to] = clamp((state.worldThreat[p.to] || 0) + threatRaiseBase, 0, 100);

  if (action === "stealth") {
    lootFactor *= 0.78;
    breakChance *= 0.7;
    infectionChance *= 0.65;
    combatChance *= 0.45;
    addLog("Вы выбрали стелс-подход: меньше риска, но и меньше добычи.");
  } else if (action === "fightWin") {
    lootFactor *= 1.2;
    breakChance *= 0.92;
    infectionChance *= 0.9;
    combatChance = 1;
    addLog("После победы в бою вы зачистили зону и собрали больше лута.", "good");
  } else if (action === "fightLose") {
    lootFactor *= 0.35;
    breakChance *= 1.35;
    infectionChance *= 1.3;
    combatChance = 1;
    addLog("Поражение в бою. Эвакуация под давлением врага.", "bad");
  }

  const cargoCap = tr.cargo;
  const lootBudget = Math.round(cargoCap * (0.35 + Math.random() * 0.4) * lootFactor);
  const found = {};
  for (const tag of loc.tags) {
    const chunk = Math.max(2, Math.round((lootBudget / loc.tags.length) * (0.7 + Math.random() * 0.7)));
    found[tag] = (found[tag] || 0) + chunk;
  }
  if (!p.isScout && Math.random() < 0.32) {
    const bonusTag = ["electronics", "parts", "meds"][randomInt(0, 2)];
    found[bonusTag] = (found[bonusTag] || 0) + randomInt(2, 6);
  }

  const dropped = addLootToInventory(found);
  addLog(`Экспедиция: ${loc.name}. Лут загружен в инвентарь.`, "good");
  if (Object.keys(dropped).length) {
    const droppedText = Object.entries(dropped)
      .map(([k, v]) => `${RESOURCE_INFO[k].label} ${v}`)
      .join(", ");
    addLog(`Часть трофеев потеряна из-за лимита веса/слотов: ${droppedText}.`, "bad");
  }

  const weaponNoise = getEquippedWeapon().noise || 0;
  if (Math.random() < combatChance) {
    const hit = randomInt(2, 6);
    state.base.stress = clamp(state.base.stress + randomInt(3, 7), 0, 100);
    state.base.fatigue = clamp(state.base.fatigue + randomInt(4, 8), 0, 100);
    state.base.door = clamp(state.base.door - hit, 0, 100);
    addLog(`Столкновение (${p.zombieClass}). Повреждение техники/двери: -${hit}.`, "bad");
  } else {
    addLog(`Удалось пройти участок с зараженными (${p.zombieClass}) без боя.`);
  }

  if (action === "fightWin" || action === "fightLose") {
    const noiseRisk = clamp(0.12 * weaponNoise * p.globalRisk, 0.02, 0.3);
    if (Math.random() < noiseRisk) {
      const extraStress = randomInt(2, 6);
      state.base.stress = clamp(state.base.stress + extraStress, 0, 100);
      addLog(`Шум боя привлек новых зараженных. Стресс +${extraStress}.`, "bad");
    }
  }

  if (Math.random() < breakChance) {
    const penaltyFuel = randomInt(2, 8);
    state.resources.fuel = Math.max(0, state.resources.fuel - penaltyFuel);
    addLog(`Поломка транспорта в пути. Потеря топлива: ${penaltyFuel}.`, "bad");
  }

  if (Math.random() < infectionChance) {
    const inc = randomInt(4, 10);
    state.base.infection = clamp(state.base.infection + inc, 0, 100);
    addLog(`Контакт с зараженной средой. Рост заражения: +${inc}.`, "bad");
    state.hero.injuries.torso = clamp(state.hero.injuries.torso + randomInt(2, 5), 0, 100);
  }

  if (p.isScout && Math.random() < 0.65) revealConnectedNode(p.to);
  state.map.currentNodeId = p.to;
  maybeRecruitNpc(p.globalRisk);
  maybeStoryProgress(p.to);
  const nextCandidates = getSecondStopCandidates(p.to);
  if (!forceReturn && !p.isScout && (p.secondStop || 0) < 2 && nextCandidates.length) {
    state.pendingEncounter = {
      ...p,
      from: p.from,
      secondStop: p.secondStop || 0,
      awaitingRouteDecision: true
    };
    state.flow.mode = "routeDecision";
    addLog("Точка зачищена. Решайте: идти дальше или возвращаться.");
    saveGame();
    render();
    return;
  }
  state.pendingEncounter = null;
  state.flow.mode = "idle";
  consumePhaseTime();
  applyPassive();
  checkGameOver();
  saveGame();
  render();
}

function startCombat() {
  if (!state.pendingEncounter) return;
  const p = state.pendingEncounter;
  const weapon = getEquippedWeapon();
  const armor = getEquippedArmor();
  const durabilityFactor = getWeaponDurabilityFactor(weapon.id);
  const armPenalty = state.hero.injuries.arm >= 40 ? 0.12 : 0;
  const legPenalty = state.hero.injuries.leg >= 40 ? 0.08 : 0;
  state.combat = {
    playerHp: 26 + (hasGarageUpgrade("garageHull") ? 4 : 0) + armor.hpBonus,
    enemyHp: Math.round(20 + p.globalRisk * 7),
    round: 1,
    enemyType: p.zombieClass,
    defend: false,
    precisionBonus: ((hasGarageUpgrade("garageLights") ? 0.15 : 0) + weapon.aimedBonus - armPenalty) * durabilityFactor,
    dodgeBonus: (hasGarageUpgrade("garageLights") ? 0.18 : 0) + armor.dodgeBonus - legPenalty,
    damageReduction: armor.damageReduction,
    weaponId: weapon.id,
    durabilityFactor
  };
  state.flow.mode = "combat";
  addLog("Бой начался. Используйте действия боевой сцены.");
  render();
}

function applyEnemyHit() {
  if (!state.combat) return;
  const c = state.combat;
  let enemyDmg = randomInt(4, 8);
  if (c.defend) enemyDmg = Math.floor(enemyDmg * 0.45);
  if (Math.random() < c.dodgeBonus) enemyDmg = Math.floor(enemyDmg * 0.5);
  enemyDmg = Math.max(1, Math.round(enemyDmg * (1 - c.damageReduction)));
  c.playerHp = Math.max(0, c.playerHp - enemyDmg);
  addLog(`Зараженный наносит ${enemyDmg} урона.`, enemyDmg >= 6 ? "bad" : "");
  if (enemyDmg >= 5 && Math.random() < 0.45) {
    const hitPart = ["arm", "leg", "torso"][randomInt(0, 2)];
    const delta = randomInt(3, 8);
    state.hero.injuries[hitPart] = clamp(state.hero.injuries[hitPart] + delta, 0, 100);
    const labels = { arm: "рука", leg: "нога", torso: "корпус" };
    addLog(`Травма: повреждена ${labels[hitPart]} (+${delta}).`, "bad");
  }
}

function combatTurn(action) {
  if (!state.combat || state.gameOver) return;
  const c = state.combat;
  const weapon = getWeaponById(c.weaponId || state.hero.equippedWeaponId);
  const wearPerUse = weapon.durabilityLoss || 0.6;
  c.defend = false;

  if (action === "attack") {
    if (weapon.ammoUse > 0 && weapon.ammoType && state.resources[weapon.ammoType] < weapon.ammoUse) {
      addLog("Недостаточно патронов, используйте защиту или отступайте.", "bad");
      applyEnemyHit();
      if (c.playerHp <= 0) {
        addLog("Вы ранены и выбиты из боя. Пришлось срочно отступить.", "bad");
        state.base.infection = clamp(state.base.infection + randomInt(6, 12), 0, 100);
        state.base.stress = clamp(state.base.stress + randomInt(6, 12), 0, 100);
        state.base.fatigue = clamp(state.base.fatigue + randomInt(8, 14), 0, 100);
        state.combat = null;
        finalizeExpeditionOutcome({ action: "fightLose" });
      } else {
        c.round += 1;
        saveGame();
        render();
      }
      return;
    }
    if (weapon.ammoUse > 0 && weapon.ammoType) {
      state.resources[weapon.ammoType] -= weapon.ammoUse;
      state.dayStats.spent[weapon.ammoType] += weapon.ammoUse;
    }
    applyWeaponWear(weapon.id, wearPerUse);
    const durabilityFactor = getWeaponDurabilityFactor(weapon.id);
    const hitChance = 0.78 + weapon.hitBonus;
    if (Math.random() <= hitChance) {
      const dmg = Math.max(1, Math.round(randomInt(weapon.damageMin, weapon.damageMax) * durabilityFactor));
      c.enemyHp = Math.max(0, c.enemyHp - dmg);
      addLog(`Вы атакуете (${weapon.name}) и наносите ${dmg} урона.`, "good");
    } else {
      addLog(`Атака (${weapon.name}) не попала в цель.`, "bad");
    }
  } else if (action === "aimed") {
    if (weapon.ammoUse > 0 && weapon.ammoType && state.resources[weapon.ammoType] < weapon.ammoUse) {
      addLog("Недостаточно патронов для точного выстрела.", "bad");
      applyEnemyHit();
      if (c.playerHp <= 0) {
        addLog("Вы ранены и выбиты из боя. Пришлось срочно отступить.", "bad");
        state.base.infection = clamp(state.base.infection + randomInt(6, 12), 0, 100);
        state.base.stress = clamp(state.base.stress + randomInt(6, 12), 0, 100);
        state.base.fatigue = clamp(state.base.fatigue + randomInt(8, 14), 0, 100);
        state.combat = null;
        finalizeExpeditionOutcome({ action: "fightLose" });
      } else {
        c.round += 1;
        saveGame();
        render();
      }
      return;
    }
    if (weapon.ammoUse > 0 && weapon.ammoType) {
      state.resources[weapon.ammoType] -= weapon.ammoUse;
      state.dayStats.spent[weapon.ammoType] += weapon.ammoUse;
    }
    applyWeaponWear(weapon.id, wearPerUse + 0.3);
    const durabilityFactor = getWeaponDurabilityFactor(weapon.id);
    const hitChance = 0.66 + c.precisionBonus;
    if (Math.random() <= hitChance) {
      const dmg = Math.max(1, Math.round(randomInt(weapon.damageMin + 2, weapon.damageMax + 3) * durabilityFactor));
      c.enemyHp = Math.max(0, c.enemyHp - dmg);
      addLog(`Точный выстрел (${weapon.name}): ${dmg} урона.`, "good");
    } else {
      addLog("Точный выстрел мимо.", "bad");
    }
  } else if (action === "defend") {
    c.defend = true;
    const dmg = randomInt(2, 4);
    c.enemyHp = Math.max(0, c.enemyHp - dmg);
    addLog(`Вы держите оборону и контратакуете на ${dmg}.`);
  } else if (action === "medkit") {
    if (state.resources.meds > 0) {
      state.resources.meds -= 1;
      const heal = randomInt(7, 11);
      c.playerHp = Math.min(34, c.playerHp + heal);
      addLog(`Использована аптечка. Восстановление: +${heal} HP.`, "good");
    } else {
      addLog("Аптечек нет.", "bad");
    }
  } else if (action === "flee") {
    if (Math.random() < 0.5) {
      addLog("Удалось оторваться от врага и отступить.", "good");
      const tr = getTransportStats(state.pendingEncounter.transportId);
      const extraFuel = Math.ceil(tr.fuelUse * state.pendingEncounter.distance * 0.5);
      state.resources.fuel = Math.max(0, state.resources.fuel - extraFuel);
      state.base.stress = clamp(state.base.stress + 4, 0, 100);
      state.combat = null;
      state.flow.mode = "encounter";
      finalizeExpeditionOutcome({ action: "fightLose" });
      return;
    }
    addLog("Попытка бегства провалилась.", "bad");
  }

  if (c.enemyHp <= 0) {
    addLog("Враг повержен.", "good");
    state.combat = null;
    state.flow.mode = "encounter";
    finalizeExpeditionOutcome({ action: "fightWin" });
    return;
  }

  applyEnemyHit();
  if (c.playerHp <= 0) {
    addLog("Вы ранены и выбиты из боя. Пришлось срочно отступить.", "bad");
    state.base.infection = clamp(state.base.infection + randomInt(6, 12), 0, 100);
    state.base.stress = clamp(state.base.stress + randomInt(6, 12), 0, 100);
    state.base.fatigue = clamp(state.base.fatigue + randomInt(8, 14), 0, 100);
    state.combat = null;
    state.flow.mode = "encounter";
    finalizeExpeditionOutcome({ action: "fightLose" });
    return;
  }

  c.round += 1;
  saveGame();
  render();
}

function resolveEncounter(action) {
  if (!state.pendingEncounter || state.gameOver || state.combat || state.flow.mode !== "encounter") return;
  if (state.pendingEncounter.awaitingRouteDecision) {
    const candidates = getSecondStopCandidates(state.pendingEncounter.to);
    if (!candidates.length) {
      addLog("Маршрутная развилка сброшена: недоступна следующая точка, выполняется возврат.");
      continueRaidToSecondStop(false);
      return;
    }
    addLog("Сначала решите: идти на следующую точку или возвращаться.");
    render();
    return;
  }
  if (action === "stealth") {
    finalizeExpeditionOutcome({ action: "stealth" });
  } else if (action === "fight") {
    addLog("Вы выбрали бой. Переход в боевую сцену.");
    startCombat();
  } else if (action === "retreat") {
    const tr = getTransportStats(state.pendingEncounter.transportId);
    const fuelBack = Math.ceil(tr.fuelUse * state.pendingEncounter.distance * 0.5);
    state.resources.fuel = Math.max(0, state.resources.fuel - fuelBack);
    state.base.stress = clamp(state.base.stress + 3, 0, 100);
    addLog(`Вы отступили. Доп. расход топлива: ${fuelBack}.`, "bad");
    state.pendingEncounter = null;
    state.flow.mode = "idle";
    consumePhaseTime();
    applyPassive();
    checkGameOver();
    saveGame();
    render();
  }
}

function continueRaidToSecondStop(goFurther) {
  const p = state.pendingEncounter;
  if (!p || state.gameOver || state.combat || state.flow.mode !== "routeDecision") return;
  if (!p.awaitingRouteDecision) return;

  if (!goFurther) {
    addLog("Решение: возвращаемся домой с текущей добычей.");
    state.pendingEncounter.awaitingRouteDecision = false;
    state.flow.mode = "encounter";
    finalizeExpeditionOutcome({ action: "stealth", forceReturn: true });
    return;
  }

  const candidates = getSecondStopCandidates(p.to);
  if (!candidates.length) {
    addLog("Вторая точка недоступна, рейд завершен на текущей локации.");
    state.pendingEncounter.awaitingRouteDecision = false;
    state.flow.mode = "encounter";
    finalizeExpeditionOutcome({ action: "stealth", forceReturn: true });
    return;
  }

  const choice = candidates[randomInt(0, candidates.length - 1)];
  const nextDistance = Math.max(1, distanceBetween(p.to, choice));
  const tr = getTransportStats(p.transportId);
  const extraFuel = tr.fuelUse * nextDistance;
  if (state.resources.fuel < extraFuel) {
    addLog("На вторую точку не хватает топлива, рейд завершен.", "bad");
    state.pendingEncounter.awaitingRouteDecision = false;
    state.flow.mode = "encounter";
    finalizeExpeditionOutcome({ action: "stealth", forceReturn: true });
    return;
  }

  state.resources.fuel -= extraFuel;
  state.dayStats.spent.fuel += extraFuel;
  const nextLoc = getLocationById(choice);
  const newRisk = clamp(p.globalRisk * 1.18 + 0.12, 0.9, 2.4);
  state.pendingEncounter = {
    ...p,
    from: p.to,
    to: choice,
    distance: nextDistance,
    globalRisk: newRisk,
    zombieClass: pickZombieClass(newRisk),
    secondStop: (p.secondStop || 0) + 1,
    awaitingRouteDecision: false
  };
  state.flow.mode = "encounter";
  addLog(`Рейд продолжается: вторая точка ${nextLoc.name}. Риск повышен.`, "bad");
  render();
}

function advancePhase() {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  consumePhaseTime();
  applyPassive();
  checkGameOver();
  saveGame();
  render();
}

function doRest() {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  if (PHASES[state.phase] !== "Вечер" && PHASES[state.phase] !== "Ночь") {
    addLog("Лучше отдыхать вечером или ночью.");
    render();
    return;
  }
  state.base.fatigue = clamp(state.base.fatigue - 18, 0, 100);
  state.base.stress = clamp(state.base.stress - 10, 0, 100);
  healInjuriesOnRest();
  addLog("Вы отдохнули и немного восстановились.", "good");
  saveGame();
  render();
}

function doRepair() {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const costMaterials = state.gameplay.arcadeMode ? 6 : 8;
  if (state.resources.materials < costMaterials) {
    addLog("Недостаточно материалов для ремонта.", "bad");
    render();
    return;
  }
  state.resources.materials -= costMaterials;
  const baseGain = state.gameplay.arcadeMode ? 14 : 10;
  const gain = Math.round(baseGain * state.modifiers.repairEfficiency);
  state.base.wall = clamp(state.base.wall + gain, 0, 100);
  state.base.door = clamp(state.base.door + Math.round(gain * 0.7), 0, 100);
  addLog(`База отремонтирована: стены +${gain}.`, "good");
  saveGame();
  render();
}

function doCraftMeal() {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  if (state.resources.food < 4) {
    addLog("Недостаточно еды для приготовления.", "bad");
    render();
    return;
  }
  state.resources.food -= 4;
  state.base.fatigue = clamp(state.base.fatigue - 8, 0, 100);
  state.base.stress = clamp(state.base.stress - 6, 0, 100);
  addLog("Приготовлена горячая еда. Мораль поднялась.", "good");
  saveGame();
  render();
}

function treatInjury(part) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  if (!["arm", "leg", "torso"].includes(part)) return;
  const current = state.hero.injuries[part];
  if (current <= 0) {
    addLog("Серьезных повреждений в этой зоне нет.");
    render();
    return;
  }
  if (state.resources.meds <= 0) {
    addLog("Недостаточно медикаментов для лечения.", "bad");
    render();
    return;
  }
  state.resources.meds -= 1;
  state.dayStats.spent.meds += 1;
  const reduction = part === "torso" ? randomInt(10, 16) : randomInt(12, 18);
  state.hero.injuries[part] = clamp(current - reduction, 0, 100);
  const labels = { arm: "рука", leg: "нога", torso: "корпус" };
  addLog(`Медосмотр: обработана зона "${labels[part]}". Травма -${reduction}.`, "good");
  saveGame();
  render();
}

function buildUpgrade(id) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const u = UPGRADE_DEFS.find((x) => x.id === id);
  if (!u || state.upgradesBuilt.includes(id)) return;
  if (!hasCost(u.cost)) {
    addLog(`Недостаточно ресурсов для улучшения "${u.name}".`, "bad");
    render();
    return;
  }
  spend(u.cost);
  state.upgradesBuilt.push(id);
  u.apply(state);
  addLog(`Построено: ${u.name}.`, "good");
  if (id === "radio") {
    addLog("В эфире появились сюжетные сигналы и запросы о помощи.");
  }
  saveGame();
  render();
}

function buildGarageUpgrade(id) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const upgrade = GARAGE_UPGRADES.find((x) => x.id === id);
  if (!upgrade || hasGarageUpgrade(id)) return;
  if (!hasCost(upgrade.cost)) {
    addLog(`Недостаточно ресурсов для апгрейда гаража "${upgrade.name}".`, "bad");
    render();
    return;
  }
  spend(upgrade.cost);
  state.garage.built.push(id);
  addLog(`Гараж улучшен: ${upgrade.name}.`, "good");
  saveGame();
  render();
}

function craftWeapon(id) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const weapon = getWeaponById(id);
  if (!weapon || !weapon.cost || state.hero.ownedWeapons.includes(id)) return;
  if (!hasCost(weapon.cost)) {
    addLog(`Недостаточно ресурсов для создания "${weapon.name}".`, "bad");
    render();
    return;
  }
  spend(weapon.cost);
  state.hero.ownedWeapons.push(id);
  state.hero.weaponDurability[id] = weapon.maxDurability;
  addLog(`Создано оружие: ${weapon.name}.`, "good");
  saveGame();
  render();
}

function craftArmor(id) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const armor = getArmorById(id);
  if (!armor || !armor.cost || state.hero.ownedArmors.includes(id)) return;
  if (!hasCost(armor.cost)) {
    addLog(`Недостаточно ресурсов для создания "${armor.name}".`, "bad");
    render();
    return;
  }
  spend(armor.cost);
  state.hero.ownedArmors.push(id);
  addLog(`Создана броня: ${armor.name}.`, "good");
  saveGame();
  render();
}

function craftAmmo(type) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const recipes = {
    ammo9: { amount: 8, cost: { parts: 3, materials: 2 } },
    ammo12: { amount: 6, cost: { parts: 4, materials: 2 } },
    ammo556: { amount: 7, cost: { parts: 4, materials: 3, electronics: 1 } }
  };
  const recipe = recipes[type];
  if (!recipe) return;
  if (!hasCost(recipe.cost)) {
    addLog("Недостаточно ресурсов для крафта боеприпасов.", "bad");
    render();
    return;
  }
  spend(recipe.cost);
  gainResource(type, recipe.amount);
  addLog(`Собраны боеприпасы: +${recipe.amount} (${RESOURCE_INFO[type].label}).`, "good");
  saveGame();
  render();
}

function repairWeapon(id) {
  if (state.gameOver || state.pendingEncounter || state.combat) return;
  const weapon = getWeaponById(id);
  const current = getWeaponDurability(id);
  if (current >= weapon.maxDurability) {
    addLog("Оружие не требует ремонта.");
    render();
    return;
  }
  const cost = { parts: 2, materials: 2 };
  if (!hasCost(cost)) {
    addLog("Недостаточно ресурсов для ремонта оружия.", "bad");
    render();
    return;
  }
  spend(cost);
  state.hero.weaponDurability[id] = clamp(current + 18, 0, 140);
  addLog(`Оружие "${weapon.name}" отремонтировано (+18 прочности).`, "good");
  saveGame();
  render();
}

function equipWeapon(id) {
  if (!state.hero.ownedWeapons.includes(id)) return;
  state.hero.equippedWeaponId = id;
  addLog(`Экипировано оружие: ${getWeaponById(id).name}.`);
  saveGame();
  render();
}

function equipArmor(id) {
  if (!state.hero.ownedArmors.includes(id)) return;
  state.hero.equippedArmorId = id;
  addLog(`Экипирована броня: ${getArmorById(id).name}.`);
  saveGame();
  render();
}

function toggleUpgradesPanel() {
  state.ui.upgradesCollapsed = !state.ui.upgradesCollapsed;
  saveGame();
  render();
}

function toggleGaragePanel() {
  state.ui.garageCollapsed = !state.ui.garageCollapsed;
  saveGame();
  render();
}

function toggleHeroGearPanel() {
  state.ui.heroGearCollapsed = !state.ui.heroGearCollapsed;
  saveGame();
  render();
}

function toggleAutoHeroMode() {
  state.ai.autoHeroEnabled = !state.ai.autoHeroEnabled;
  addLog(
    state.ai.autoHeroEnabled
      ? "Автопилот героя включен: приоритет — выживание, осторожные решения и ранний отход."
      : "Автопилот героя выключен.",
    state.ai.autoHeroEnabled ? "good" : ""
  );
  saveGame();
  ensureAutoHeroLoop();
  render();
}

function toggleArcadeMode() {
  state.gameplay.arcadeMode = !state.gameplay.arcadeMode;
  addLog(
    state.gameplay.arcadeMode
      ? "Режим Аркада включен: дом прочнее и быстрее восстанавливается."
      : "Режим Аркада выключен: стандартная выживаемость.",
    state.gameplay.arcadeMode ? "good" : ""
  );
  saveGame();
  render();
}

function pickAutoCombatAction() {
  const c = state.combat;
  if (!c) return "attack";
  const lowHp = c.playerHp <= 12;
  const criticalHp = c.playerHp <= 7;

  if (criticalHp && Math.random() < 0.65) return "flee";
  if (lowHp && state.resources.meds > 0) return "medkit";
  if (lowHp && Math.random() < 0.35) return "defend";
  if (c.enemyHp <= 7) return "aimed";
  if (c.playerHp <= 16 && Math.random() < 0.25) return "defend";
  return Math.random() < 0.65 ? "aimed" : "attack";
}

function pickAutoEncounterAction() {
  const p = state.pendingEncounter;
  if (!p) return "stealth";
  const survivalDanger =
    state.base.infection > 60 ||
    state.base.stress > 75 ||
    state.base.fatigue > 78 ||
    state.resources.meds < 2;

  if (survivalDanger && p.globalRisk > 1.15) return "retreat";
  if (state.base.wall < 35 || state.base.door < 35) return "retreat";
  if (p.globalRisk > 1.45) return "stealth";
  if (p.globalRisk < 1.2 && state.resources.meds >= 3 && state.base.fatigue < 70) return "fight";
  return "stealth";
}

function pickAutoSecondStopDecision() {
  const p = state.pendingEncounter;
  if (!p || p.secondStop >= 2) return false;
  const danger =
    p.globalRisk > 1.5 ||
    state.base.infection > 45 ||
    state.base.fatigue > 68 ||
    state.resources.meds < 2;
  if (danger) return false;
  return state.resources.fuel > 10 && Math.random() < 0.45;
}

function pickAutoTargetNode() {
  const reachable = getReachableNodes().filter((id) => id !== state.map.currentNodeId);
  if (!reachable.length) return null;
  const needsFood = state.resources.food < 10;
  const needsFuel = state.resources.fuel < 12;
  const needsMeds = state.resources.meds < 4;

  const scored = reachable.map((id) => {
    const loc = getLocationById(id);
    const threat = (state.worldThreat[id] || 0) * 0.01;
    let score = 1.05 - (loc.risk + threat * 0.6) * 0.45;
    if (needsFood && loc.tags.includes("food")) score += 0.85;
    if (needsFuel && loc.tags.includes("fuel")) score += 0.85;
    if (needsMeds && loc.tags.includes("meds")) score += 0.75;
    if (loc.tags.includes("electronics") && !state.story.radioOnline) score += 0.35;
    if (state.base.infection > 50 || state.base.fatigue > 70) score -= loc.risk * 0.5;
    score += Math.random() * 0.25;
    return { id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.id || null;
}

function autoHeroStep() {
  if (!state.ai.autoHeroEnabled || state.gameOver) return;
  if (state.flow.mode === "combat" && state.combat) {
    updateIntent("Бой: защитить себя и выжить");
    combatTurn(pickAutoCombatAction());
    return;
  }
  if (state.flow.mode === "routeDecision" && state.pendingEncounter) {
    if (state.pendingEncounter.awaitingRouteDecision) {
      if (!getSecondStopCandidates(state.pendingEncounter.to).length) {
        updateIntent("Рейд: принудительный возврат, следующая точка недоступна");
        continueRaidToSecondStop(false);
        return;
      }
      updateIntent("Рейд: оценка, идти на следующую точку или возвращаться");
      continueRaidToSecondStop(pickAutoSecondStopDecision());
      return;
    }
  }
  if (state.flow.mode === "encounter" && state.pendingEncounter) {
    updateIntent("Экспедиция: снизить риск столкновения");
    resolveEncounter(pickAutoEncounterAction());
    return;
  }
  if (state.flow.mode !== "idle") {
    // Safety fallback for inconsistent state.
    state.flow.mode = "idle";
  }

  if (PHASES[state.phase] === "Ночь") {
    updateIntent("Ночь: переждать и восстановиться");
    if (state.base.fatigue > 45 || state.base.stress > 55) {
      doRest();
    } else {
      advancePhase();
    }
    return;
  }

  if (state.inventory.items.length && state.map.currentNodeId === "home") {
    updateIntent("База: разгрузка добычи");
    unloadInventory();
    return;
  }

  const survivalMode =
    state.base.infection > 55 ||
    state.base.stress > 70 ||
    state.base.fatigue > 72 ||
    state.resources.food < 7 ||
    state.resources.meds < 2;

  if ((state.base.wall < 45 || state.base.door < 45) && state.resources.materials >= 8) {
    updateIntent("База: срочный ремонт защиты");
    doRepair();
    return;
  }

  if (state.resources.food >= 4 && (state.base.fatigue > 65 || state.base.stress > 65)) {
    updateIntent("База: восстановить силы едой");
    doCraftMeal();
    return;
  }

  if ((PHASES[state.phase] === "Вечер" || PHASES[state.phase] === "Ночь") && state.base.fatigue > 55) {
    updateIntent("База: отдых перед ночью");
    doRest();
    return;
  }

  if (survivalMode && state.map.currentNodeId === "home") {
    if (state.resources.meds > 0) {
      const injuries = state.hero.injuries;
      const worst = Object.entries(injuries).sort((a, b) => b[1] - a[1])[0];
      if (worst && worst[1] >= 18) {
        updateIntent("Выживание: приоритетное лечение травм");
        treatInjury(worst[0]);
        return;
      }
    }
    if (state.resources.food >= 4 && (state.base.fatigue > 55 || state.base.stress > 55)) {
      updateIntent("Выживание: питание и снижение стресса");
      doCraftMeal();
      return;
    }
    if (state.base.infection > 45 && state.resources.meds > 0) {
      updateIntent("Выживание: лечение и стабилизация");
      advancePhase();
      return;
    }
  }

  if (!survivalMode) {
    const equipped = getEquippedWeapon();
    const currentDurability = getWeaponDurability(equipped.id);
    if (currentDurability < equipped.maxDurability * 0.45 && state.map.currentNodeId === "home") {
      updateIntent("Поддержка: ремонт оружия");
      repairWeapon(equipped.id);
      return;
    }

    const lowAmmo =
      (state.resources.ammo9 < 6 && state.resources.ammo12 < 4 && state.resources.ammo556 < 5);
    if (lowAmmo && state.map.currentNodeId === "home") {
      updateIntent("Поддержка: сборка боеприпасов");
      const type = state.resources.ammo9 < 6 ? "ammo9" : state.resources.ammo556 < 5 ? "ammo556" : "ammo12";
      craftAmmo(type);
      return;
    }

    const nextUpgrade = UPGRADE_DEFS.find((u) => !state.upgradesBuilt.includes(u.id) && hasCost(u.cost));
    if (nextUpgrade) {
      updateIntent("Развитие: улучшение базы");
      buildUpgrade(nextUpgrade.id);
      return;
    }

    const nextGarageUpgrade = GARAGE_UPGRADES.find((u) => !hasGarageUpgrade(u.id) && hasCost(u.cost));
    if (nextGarageUpgrade) {
      updateIntent("Развитие: апгрейд транспорта");
      buildGarageUpgrade(nextGarageUpgrade.id);
      return;
    }
  }

  const invLimits = getInventoryLimits();
  const invWeight = getCurrentInventoryWeight();
  const shouldReturnHome =
    state.map.currentNodeId !== "home" &&
    (
      invWeight >= invLimits.weight * 0.65 ||
      state.inventory.items.length >= invLimits.slots * 0.65 ||
      PHASES[state.phase] === "Вечер" ||
      survivalMode
    );

  if (shouldReturnHome && getReachableNodes().includes("home")) {
    const distance = distanceBetween(state.map.currentNodeId, "home");
    const transportId = getBestAffordableTransportId(distance);
    if (!transportId) {
      advancePhase();
      return;
    }
    state.selectedTransportId = transportId;
    state.map.selectedNodeId = "home";
    updateIntent("Экспедиция: вернуться домой с добычей");
    prepareExpedition(false);
    return;
  } else if (shouldReturnHome) {
    const nextHopHome = getNextHopTowards("home");
    if (nextHopHome) {
      const distance = distanceBetween(state.map.currentNodeId, nextHopHome);
      const transportId = getBestAffordableTransportId(distance);
      if (!transportId) {
        advancePhase();
        return;
      }
      state.selectedTransportId = transportId;
      state.map.selectedNodeId = nextHopHome;
      updateIntent("Экспедиция: этапный возврат домой");
      prepareExpedition(false);
      return;
    }
  }

  if (PHASES[state.phase] !== "Ночь") {
    const nextNode = pickAutoTargetNode();
    if (nextNode) {
      const distance = distanceBetween(state.map.currentNodeId, nextNode);
      const transportId = getBestAffordableTransportId(distance);
      if (!transportId) {
        if (state.resources.fuel < 4) {
          addLog("Автогерой: мало топлива, делаю паузу до следующей фазы.");
        }
        advancePhase();
        return;
      }
      state.selectedTransportId = transportId;
      state.map.selectedNodeId = nextNode;
      const scout = state.map.discovered.length < FIXED_LOCATIONS.length && Math.random() < 0.35;
      updateIntent(scout ? "Экспедиция: разведка безопасного маршрута" : "Экспедиция: добыча ресурсов");
      prepareExpedition(scout);
      return;
    }
  }

  updateIntent("Ожидание: экономия сил и ресурсов");
  advancePhase();
}

function ensureAutoHeroLoop() {
  if (autoHeroTimer) {
    clearInterval(autoHeroTimer);
    autoHeroTimer = null;
  }
  if (state.ai.autoHeroEnabled) {
    autoHeroTimer = setInterval(autoHeroStep, AUTO_HERO_DELAY_MS);
  }
}

function resourceTiles() {
  return Object.entries(state.resources)
    .filter(([key]) => Boolean(RESOURCE_INFO[key]))
    .map(([key, val]) => `<div class="res"><span>${RESOURCE_INFO[key].label}</span><strong>${val}</strong></div>`)
    .join("");
}

function bar(label, val, color, invert = false) {
  const shown = invert ? 100 - val : val;
  return `
    <div class="stat">
      <div class="stat-top"><span>${label}</span><span>${val}/100</span></div>
      <div class="bar"><div class="fill" style="width:${shown}%; background:${color}"></div></div>
    </div>
  `;
}

function mapNodesMarkup() {
  const reachable = getReachableNodes();
  return state.map.discovered
    .map((nodeId) => {
      const loc = getLocationById(nodeId);
      const isCurrent = nodeId === state.map.currentNodeId;
      const isSelected = nodeId === state.map.selectedNodeId;
      const isReachable = reachable.includes(nodeId);
      return `
        <button
          class="map-node ${isCurrent ? "current-node" : ""} ${isSelected ? "selected-node" : ""}"
          data-node-id="${nodeId}"
          ${isReachable ? "" : "disabled"}
        >
          ${loc.name}${isCurrent ? " (вы здесь)" : ""}
        </button>
      `;
    })
    .join("");
}

function upgradeCardsMarkup() {
  return UPGRADE_DEFS.map((u) => {
    const built = state.upgradesBuilt.includes(u.id);
    const costTxt = Object.entries(u.cost).map(([k, v]) => `${k}:${v}`).join(", ");
    return `
      <div class="upgrade-card">
        <div class="upgrade-title">${u.name}</div>
        <div class="muted">${u.desc}</div>
        <div class="muted">Цена: ${costTxt}</div>
        <button ${built ? "disabled" : ""} data-upgrade-id="${u.id}">
          ${built ? "Построено" : "Построить"}
        </button>
      </div>
    `;
  }).join("");
}

function npcMarkup() {
  if (!state.npcs.length) return `<div class="muted">Пока никто не присоединился.</div>`;
  const shifts = state.npcManagement.shifts;
  const shiftBlock = `
    <div class="npc-card">
      <strong>Смены базы</strong>
      <div class="muted">Охрана: ${shifts.guard} | Снабжение: ${shifts.scavenger} | Медицина: ${shifts.medic} | Техник: ${shifts.mechanic}</div>
      <div class="muted">Усталость NPC: ${state.npcManagement.fatigue}/100 | Мораль: ${state.npcManagement.morale}/100</div>
    </div>
  `;
  return state.npcs
    .map((n) => `<div class="npc-card"><strong>${n.name}</strong><div class="muted">${n.bonus}</div></div>`)
    .join("") + shiftBlock;
}

function encounterMarkup() {
  if (!state.pendingEncounter) return "";
  const secondStopCandidates = (state.pendingEncounter.secondStop || 0) < 2
    ? getSecondStopCandidates(state.pendingEncounter.to)
    : [];
  const routeDecision = Boolean(state.pendingEncounter.awaitingRouteDecision);
  return `
    <div class="encounter">
      <h2>Контакт с угрозой</h2>
      <div class="muted">На маршруте замечены зараженные (${state.pendingEncounter.zombieClass}). Выбери подход:</div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-encounter="stealth" ${routeDecision ? "disabled" : ""}>Стелс</button>
        <button data-encounter="fight" ${routeDecision ? "disabled" : ""}>Бой</button>
      </div>
      <button data-encounter="retreat" style="margin-top:8px;" ${routeDecision ? "disabled" : ""}>Отступить</button>
      ${
        routeDecision && !secondStopCandidates.length
          ? `
        <div class="muted" style="margin-top:8px;">Следующая точка недоступна. Завершите рейд возвратом.</div>
        <button data-raid-next="no" style="margin-top:6px;">Возврат домой</button>
      `
          : secondStopCandidates.length
            ? `
        <div class="muted" style="margin-top:8px;">Рейд можно продолжить: +риск, +награда (${state.pendingEncounter.secondStop || 0}/2).</div>
        <div class="btn-row" style="margin-top:6px;">
          <button data-raid-next="yes" ${routeDecision ? "" : "disabled"}>Идти дальше</button>
          <button data-raid-next="no" ${routeDecision ? "" : "disabled"}>Возврат домой</button>
        </div>
      `
            : ""
      }
    </div>
  `;
}

function combatMarkup() {
  if (!state.combat) return "";
  return `
    <div class="encounter combat-scene">
      <h2>Боевая сцена</h2>
      <div class="muted">Раунд ${state.combat.round} | Противник: ${state.combat.enemyType}</div>
      <div class="combat-bars">
        <div>Вы: <strong>${state.combat.playerHp} HP</strong></div>
        <div>Враг: <strong>${state.combat.enemyHp} HP</strong></div>
      </div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-combat-action="attack">Атака</button>
        <button data-combat-action="aimed">Точный выстрел</button>
      </div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-combat-action="defend">Защита</button>
        <button data-combat-action="medkit">Аптечка</button>
      </div>
      <button style="margin-top:8px;" data-combat-action="flee">Попытка бегства</button>
    </div>
  `;
}

function transportOptionsMarkup() {
  return TRANSPORTS.map((t) => {
    const stats = getTransportStats(t.id);
    const selected = t.id === state.selectedTransportId ? "selected" : "";
    return `<option value="${t.id}" ${selected}>${t.name} | топливо ${stats.fuelUse}/узел | груз ${stats.cargo}</option>`;
  }).join("");
}

function gameOverMarkup() {
  if (!state.gameOver) return "";
  return `
    <div class="game-over">
      Игра завершена. Можно начать заново кнопкой "Новая игра".
    </div>
  `;
}

function housePixelMarkup() {
  const builtCount = state.upgradesBuilt.length;
  const houseTier = builtCount >= 5 ? 3 : builtCount >= 3 ? 2 : builtCount >= 1 ? 1 : 0;
  const tierTitle = ["Укрытие", "Укрепленный дом", "Форпост", "Крепость"][houseTier];
  const wallState = state.base.wall > 65 ? "good" : state.base.wall > 35 ? "warn" : "bad";
  const doorState = state.base.door > 65 ? "good" : state.base.door > 35 ? "warn" : "bad";
  const powerOn = state.base.power > 30 || state.modifiers.generator;
  const night = PHASES[state.phase] === "Ночь";
  const rainy = state.weather.name === "Дождь" || state.weather.name === "Кислотный дождь";
  const raidActive = night && !state.gameOver && (state.base.wall < 95 || state.base.door < 95);
  const severeDamage = state.base.wall < 35 || state.base.door < 35;
  const tierClass = `tier-${houseTier}`;
  const zombieCountBase = night ? 3 : 1;
  const weatherExtra = rainy ? 1 : 0;
  const stressExtra = state.base.stress > 65 ? 1 : 0;
  const zombieCount = Math.min(6, zombieCountBase + weatherExtra + stressExtra);
  const smokeOn = powerOn || houseTier >= 2;
  const hasFortifiedDoor = state.upgradesBuilt.includes("fortifiedDoor");
  const hasWorkshop = state.upgradesBuilt.includes("workshop");
  const hasGenerator = state.modifiers.generator;
  const hasWatchtower = state.modifiers.watchtower;
  const hasGreenhouse = state.modifiers.greenhouse;
  const hasRadio = state.modifiers.radio;
  const nowSeconds = Date.now() / 1000;

  const zombieSprites = Array.from({ length: zombieCount }).map((_, idx) => {
    const lane = idx % 3;
    const speed = 9 + idx * 1.2;
    const delay = ((nowSeconds % speed) + idx * 1.35).toFixed(2);
    const className = lane === 0 ? "z-lane-front" : lane === 1 ? "z-lane-mid" : "z-lane-back";
    const typeClass = idx % 3 === 0 ? "z-runner" : idx % 3 === 1 ? "z-walker" : "z-brute";
    return `<span class="px zombie ${className} ${typeClass}" style="animation-delay:-${delay}s;animation-duration:${speed.toFixed(2)}s;"><span class="limb arm"></span><span class="limb leg"></span></span>`;
  }).join("");

  const raiderLane = houseTier >= 3 ? "gate" : "door";

  return `
    <div class="pixel-house-scene ${tierClass} ${night ? "night-scene" : ""} ${rainy ? "rain-scene" : ""} ${raidActive ? "raid-active" : ""} ${severeDamage ? "severe-damage" : ""}">
      <div class="pixel-house-wrap">
        <span class="px haze"></span>
        <span class="px celestial ${night ? "moon" : "sun"}"></span>
        <span class="px cloud c1"></span>
        <span class="px cloud c2"></span>
        <span class="px fence-line"></span>
        <span class="px bush left"></span>
        <span class="px bush right"></span>
        <span class="px ground-shadow"></span>
        <div class="pixel-house ${tierClass} ${hasFortifiedDoor ? "steel-door" : ""} ${hasWorkshop ? "workshop-on" : ""} ${raidActive ? "under-raid" : ""} ${severeDamage ? "damaged" : ""}">
          ${houseTier >= 1 ? `<span class="px barricade left"></span><span class="px barricade right"></span>` : ""}
          <span class="px roof"></span>
          <span class="px roof-shadow"></span>
          <span class="px eave"></span>
          <span class="px body ${wallState}"></span>
          <span class="px porch"></span>
          <span class="px door ${doorState}"></span>
          <span class="px win left ${powerOn ? "lit" : "dim"}"></span>
          <span class="px win right ${powerOn ? "lit" : "dim"}"></span>
          <span class="px frame left"></span>
          <span class="px frame right"></span>
          <span class="px chimney"></span>
          ${hasWorkshop ? `<span class="px workshop-sign"></span>` : ""}
          ${hasFortifiedDoor ? `<span class="px spike-trap"></span>` : ""}
          ${hasGenerator ? `<span class="px battery-pack"></span>` : ""}
          ${smokeOn ? `<span class="px smoke s1"></span><span class="px smoke s2"></span><span class="px smoke s3"></span>` : ""}
          ${hasWatchtower ? `<span class="px tower"></span>` : ""}
          ${hasGreenhouse ? `<span class="px greenhouse"></span>` : ""}
          ${hasRadio ? `<span class="px antenna"></span>` : ""}
          ${hasGenerator ? `<span class="px cable"></span>` : ""}
          ${houseTier >= 2 ? `<span class="px wall-plate left"></span><span class="px wall-plate right"></span>` : ""}
          ${houseTier >= 3 ? `<span class="px gate"></span><span class="px flood-light ${powerOn ? "on" : "off"}"></span><span class="px flood-beam ${powerOn ? "on" : "off"}"></span>` : ""}
          ${raidActive ? `<span class="px impact ${raiderLane}"></span>` : ""}
          ${raidActive ? `<span class="px zombie raider z-brute ${raiderLane}"></span>` : ""}
        </div>
        ${zombieSprites}
      </div>
      <div class="pixel-legend muted">
        ${raidActive ? "НАЛЕТ: активная атака базы | " : ""}
        Стадия: ${tierTitle} (${houseTier}/3) | Стены: ${state.base.wall}/100 | Дверь: ${state.base.door}/100 | Энергия: ${state.base.power}/100
      </div>
    </div>
  `;
}

function inventoryMarkup() {
  const limits = getInventoryLimits();
  const weight = getCurrentInventoryWeight();
  const slots = getCurrentInventorySlots();
  if (!state.inventory.items.length) {
    return `
      <div class="muted">Инвентарь пуст.</div>
      <div class="muted">Слоты: ${slots}/${limits.slots} | Вес: ${weight.toFixed(1)}/${limits.weight} кг</div>
    `;
  }
  return `
    <div class="muted">Слоты: ${slots}/${limits.slots} | Вес: ${weight.toFixed(1)}/${limits.weight} кг</div>
    ${state.inventory.items
      .map((item) => {
        const info = RESOURCE_INFO[item.type];
        const w = (item.qty * info.weight).toFixed(1);
        return `<div class="res"><span>${info.label} x${item.qty}</span><strong>${w} кг</strong></div>`;
      })
      .join("")}
  `;
}

function economy7DaysMarkup() {
  if (!state.economyHistory.length) {
    return `<div class="muted">Сводка за 7 дней появится после завершения первых суток.</div>`;
  }
  const sum = { gained: {}, spent: {} };
  Object.keys(RESOURCE_INFO).forEach((k) => {
    sum.gained[k] = 0;
    sum.spent[k] = 0;
  });

  state.economyHistory.forEach((d) => {
    Object.keys(RESOURCE_INFO).forEach((k) => {
      sum.gained[k] += d.gained?.[k] || 0;
      sum.spent[k] += d.spent?.[k] || 0;
    });
  });

  const lines = Object.keys(RESOURCE_INFO)
    .map((k) => ({ k, delta: sum.gained[k] - sum.spent[k], inVal: sum.gained[k], outVal: sum.spent[k] }))
    .filter((x) => x.inVal > 0 || x.outVal > 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 6);

  return lines
    .map((x) => `<div class="res"><span>${RESOURCE_INFO[x.k].label}</span><strong>${x.inVal}/${x.outVal} (${x.delta >= 0 ? "+" : ""}${x.delta})</strong></div>`)
    .join("");
}

function heroLoadoutMarkup() {
  const weapon = getEquippedWeapon();
  const armor = getEquippedArmor();
  const injuries = state.hero.injuries;
  const durability = getWeaponDurability(weapon.id);
  return `
    <div class="npc-card">
      <strong>Оружие:</strong> ${weapon.name}
      <div class="muted">Урон ${weapon.damageMin}-${weapon.damageMax} | Точность +${Math.round(weapon.hitBonus * 100)}% | Шум x${weapon.noise.toFixed(2)} | Патроны ${weapon.ammoUse ? weapon.ammoUse + "/выстрел" : "не нужны"} | Износ ${durability.toFixed(0)}/${weapon.maxDurability}</div>
    </div>
    <div class="npc-card">
      <strong>Броня:</strong> ${armor.name}
      <div class="muted">Снижение урона ${Math.round(armor.damageReduction * 100)}% | HP +${armor.hpBonus}</div>
    </div>
    <div class="npc-card">
      <strong>Травмы:</strong>
      <div class="muted">Рука ${injuries.arm}/100 | Нога ${injuries.leg}/100 | Корпус ${injuries.torso}/100</div>
    </div>
  `;
}

function heroGearCardsMarkup() {
  const weaponCards = WEAPONS.map((w) => {
    const owned = state.hero.ownedWeapons.includes(w.id);
    const equipped = state.hero.equippedWeaponId === w.id;
    const cost = w.cost ? Object.entries(w.cost).map(([k, v]) => `${k}:${v}`).join(", ") : "Стартовое";
    return `
      <div class="upgrade-card">
        <div class="upgrade-title">${w.name}</div>
        <div class="muted">Урон: ${w.damageMin}-${w.damageMax}, точность +${Math.round(w.hitBonus * 100)}%, шум x${w.noise.toFixed(2)}, износ ${getWeaponDurability(w.id).toFixed(0)}/${w.maxDurability}</div>
        <div class="muted">Цена: ${cost}</div>
        ${
          owned
            ? `<button data-equip-weapon="${w.id}" ${equipped ? "disabled" : ""}>${equipped ? "Экипировано" : "Экипировать"}</button>
               <button data-repair-weapon="${w.id}" style="margin-top:6px;">Ремонтировать</button>`
            : `<button data-craft-weapon="${w.id}">Создать</button>`
        }
      </div>
    `;
  }).join("");

  const armorCards = ARMORS.map((a) => {
    const owned = state.hero.ownedArmors.includes(a.id);
    const equipped = state.hero.equippedArmorId === a.id;
    const cost = a.cost ? Object.entries(a.cost).map(([k, v]) => `${k}:${v}`).join(", ") : "Стартовое";
    return `
      <div class="upgrade-card">
        <div class="upgrade-title">${a.name}</div>
        <div class="muted">Броня: -${Math.round(a.damageReduction * 100)}% урона, HP +${a.hpBonus}</div>
        <div class="muted">Цена: ${cost}</div>
        ${
          owned
            ? `<button data-equip-armor="${a.id}" ${equipped ? "disabled" : ""}>${equipped ? "Экипировано" : "Экипировать"}</button>`
            : `<button data-craft-armor="${a.id}">Создать</button>`
        }
      </div>
    `;
  }).join("");

  return `
    <h2 style="margin-top:14px;">Оружие</h2>
    <div class="grid">${weaponCards}</div>
    <h2 style="margin-top:14px;">Броня</h2>
    <div class="grid">${armorCards}</div>
  `;
}

function medicalPanelMarkup() {
  const inj = state.hero.injuries;
  const button = (part, label, val) => {
    const disabled = val <= 0 || state.resources.meds <= 0;
    return `<button data-treat="${part}" ${disabled ? "disabled" : ""}>${label} (${val})</button>`;
  };
  return `
    <h2 style="margin-top:14px;">Медосмотр</h2>
    <div class="muted">Медикаменты: ${state.resources.meds}. Лечение тратит 1 ед. медикаментов.</div>
    <div class="btn-row" style="margin-top:8px;">
      ${button("arm", "Лечить руку", inj.arm)}
      ${button("leg", "Лечить ногу", inj.leg)}
    </div>
    <button data-treat="torso" style="margin-top:8px;" ${inj.torso <= 0 || state.resources.meds <= 0 ? "disabled" : ""}>
      Лечить корпус (${inj.torso})
    </button>
  `;
}

function ammoCraftMarkup() {
  return `
    <h2 style="margin-top:14px;">Боеприпасы</h2>
    <div class="muted">Текущие запасы: 9mm ${state.resources.ammo9}, 12g ${state.resources.ammo12}, 5.56 ${state.resources.ammo556}</div>
    <div class="btn-row" style="margin-top:8px;">
      <button data-craft-ammo="ammo9">Собрать 9mm (+8)</button>
      <button data-craft-ammo="ammo12">Собрать 12g (+6)</button>
    </div>
    <button data-craft-ammo="ammo556" style="margin-top:8px;">Собрать 5.56 (+7)</button>
  `;
}

function garageMarkup() {
  return GARAGE_UPGRADES.map((g) => {
    const built = hasGarageUpgrade(g.id);
    const costTxt = Object.entries(g.cost)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    return `
      <div class="upgrade-card">
        <div class="upgrade-title">${g.name}</div>
        <div class="muted">${g.desc}</div>
        <div class="muted">Цена: ${costTxt}</div>
        <button data-garage-id="${g.id}" ${built ? "disabled" : ""}>
          ${built ? "Установлено" : "Установить"}
        </button>
      </div>
    `;
  }).join("");
}

function render() {
  ensureSelectedNodeReachable();
  if (state.dayPlan.generatedForDay !== state.day) {
    generateDayPlan();
  }
  const disabled = state.gameOver || Boolean(state.pendingEncounter) || Boolean(state.combat);
  const currentLoc = getLocationById(state.map.currentNodeId);
  const upgradesCollapsed = state.ui.upgradesCollapsed;
  const garageCollapsed = state.ui.garageCollapsed;
  const heroGearCollapsed = state.ui.heroGearCollapsed;
  app.innerHTML = `
    <main class="app">
      <section class="card header">
        <div>
          <h1>House: Last Safe Home</h1>
          <div class="subline">Выживи, укрепи дом и собери общину.</div>
        </div>
        <div class="header-right">
          <span class="status-pill">День ${state.day} / ${MAX_DAYS}</span>
          <span class="status-pill phase">${PHASES[state.phase]}</span>
          <span class="status-pill weather">${state.weather.name}</span>
          <span class="status-pill ${state.gameplay.arcadeMode ? "good-pill" : ""}">
            ${state.gameplay.arcadeMode ? "Аркада" : "Хардкор"}
          </span>
          <span class="status-pill ${state.ai.autoHeroEnabled ? "good-pill" : ""}">
            Герой: ${state.ai.autoHeroEnabled ? "Авто" : "Ручной"}
          </span>
          <button id="arcadeBtn" class="small-btn">${state.gameplay.arcadeMode ? "Хардкор" : "Аркада"}</button>
          <button id="autoHeroBtn" class="small-btn">${state.ai.autoHeroEnabled ? "Стоп авто" : "Авто-герой"}</button>
          <button id="saveBtn" class="small-btn">Сохранить</button>
          <button id="resetBtn" class="small-btn">Новая игра</button>
        </div>
      </section>

      <section class="card">
        <h2>Состояние базы</h2>
        <h2 style="margin-top:4px;">Пиксельный дом</h2>
        ${housePixelMarkup()}
        <div class="stats">
          ${bar("Стены", state.base.wall, "#69b8ff")}
          ${bar("Дверь", state.base.door, "#52d3bc")}
          ${bar("Энергия", state.base.power, "#f2b14a")}
          ${bar("Усталость", state.base.fatigue, "#cc8df7", true)}
          ${bar("Стресс", state.base.stress, "#f18f8f", true)}
          ${bar("Заражение", state.base.infection, "#ff6868", true)}
        </div>
        <h2 style="margin-top:12px;">Ресурсы</h2>
        <div class="resources">${resourceTiles()}</div>
        <h2 style="margin-top:12px;">Инвентарь (вес/слоты)</h2>
        <div class="grid">${inventoryMarkup()}</div>
        <button id="unloadBtn" style="margin-top:8px;" ${disabled ? "disabled" : ""}>Разгрузить в склад</button>
        <h2 style="margin-top:12px;">Статус</h2>
        <div class="grid muted">
          <div>Сезон: <strong>${getSeasonName()}</strong></div>
          <div>Текущая позиция: <strong>${currentLoc.name}</strong></div>
          <div>NPC на базе: <strong>${state.npcs.length}</strong></div>
          <div>Угроза локации: <strong>${Math.round(state.worldThreat[state.map.currentNodeId] || 0)}/100</strong></div>
          <div>Антенна: <strong>${state.story.antennaParts}/3</strong></div>
          <div>Радио: <strong>${state.story.radioOnline ? "Включено" : "Отключено"}</strong></div>
          <div>Намерение героя: <strong>${state.ai.intent}</strong></div>
          <div>План дня:</div>
          ${state.dayPlan.goals.map((g) => `<div>- ${g}</div>`).join("")}
          <div>Состояние потока: <strong>${state.flow.mode}</strong></div>
        </div>
        <h2 style="margin-top:12px;">Экономика за 7 дней</h2>
        <div class="grid">${economy7DaysMarkup()}</div>
        ${gameOverMarkup()}
      </section>

      <section class="card">
        <h2>Карта узлов</h2>
        <div class="map-grid">${mapNodesMarkup()}</div>

        <h2 style="margin-top:14px;">Экспедиция</h2>
        <div class="grid">
          <label class="muted" for="transportSelect">Транспорт</label>
          <select id="transportSelect" ${disabled ? "disabled" : ""}>${transportOptionsMarkup()}</select>
          <div class="btn-row">
            <button id="expeditionBtn" ${disabled ? "disabled" : ""}>Выехать</button>
            <button id="scoutBtn" ${disabled ? "disabled" : ""}>Разведка</button>
          </div>
        </div>

        ${encounterMarkup()}
        ${combatMarkup()}

        <div class="section-row" style="margin-top:14px;">
          <h2>Гараж и транспорт</h2>
          <button id="toggleGarageBtn" class="small-btn">
            ${garageCollapsed ? "Развернуть" : "Свернуть"}
          </button>
        </div>
        ${garageCollapsed ? `<div class="muted">Панель гаража скрыта.</div>` : `<div class="grid">${garageMarkup()}</div>`}

        <div class="section-row" style="margin-top:14px;">
          <h2>Улучшения дома</h2>
          <button id="toggleUpgradesBtn" class="small-btn">
            ${upgradesCollapsed ? "Развернуть" : "Свернуть"}
          </button>
        </div>
        ${upgradesCollapsed ? `<div class="muted">Панель улучшений скрыта.</div>` : `<div class="grid">${upgradeCardsMarkup()}</div>`}

        <h2 style="margin-top:14px;">Действия дома</h2>
        <div class="btn-row">
          <button id="craftMealBtn" ${disabled ? "disabled" : ""}>Приготовить еду</button>
          <button id="repairBtn" ${disabled ? "disabled" : ""}>Ремонт стен</button>
        </div>
        <div class="btn-row" style="margin-top:8px;">
          <button id="restBtn" ${disabled ? "disabled" : ""}>Отдохнуть</button>
          <button id="advanceBtn" ${disabled ? "disabled" : ""}>Следующая фаза</button>
        </div>
      </section>

      <section class="card">
        <h2>Жители базы</h2>
        <div class="grid">${npcMarkup()}</div>
        <div class="section-row" style="margin-top:14px;">
          <h2>Снаряжение героя</h2>
          <button id="toggleHeroGearBtn" class="small-btn">
            ${heroGearCollapsed ? "Развернуть" : "Свернуть"}
          </button>
        </div>
        ${
          heroGearCollapsed
            ? `<div class="muted">Панель оружия и брони скрыта.</div>`
            : `<div class="grid">${heroLoadoutMarkup()}</div>${medicalPanelMarkup()}${ammoCraftMarkup()}${heroGearCardsMarkup()}`
        }
        <h2 style="margin-top:14px;">Радио и события</h2>
        <div class="log">
          ${state.logs.map((item) => `<div class="log-item ${item.cssClass || ""}">${item.msg}</div>`).join("")}
        </div>
      </section>
    </main>
  `;
  bindEvents();
}

function bindEvents() {
  app.querySelector("#saveBtn")?.addEventListener("click", () => {
    saveGame();
    addLog("Состояние игры сохранено.");
    render();
  });

  app.querySelector("#resetBtn")?.addEventListener("click", resetGame);
  app.querySelector("#autoHeroBtn")?.addEventListener("click", toggleAutoHeroMode);
  app.querySelector("#arcadeBtn")?.addEventListener("click", toggleArcadeMode);

  app.querySelector("#transportSelect")?.addEventListener("change", (e) => {
    state.selectedTransportId = e.target.value;
    saveGame();
    render();
  });

  app.querySelector("#unloadBtn")?.addEventListener("click", unloadInventory);
  app.querySelector("#toggleUpgradesBtn")?.addEventListener("click", toggleUpgradesPanel);
  app.querySelector("#toggleGarageBtn")?.addEventListener("click", toggleGaragePanel);
  app.querySelector("#toggleHeroGearBtn")?.addEventListener("click", toggleHeroGearPanel);

  app.querySelectorAll("[data-node-id]").forEach((nodeBtn) => {
    nodeBtn.addEventListener("click", () => {
      state.map.selectedNodeId = nodeBtn.dataset.nodeId;
      saveGame();
      render();
    });
  });

  app.querySelector("#expeditionBtn")?.addEventListener("click", () => prepareExpedition(false));
  app.querySelector("#scoutBtn")?.addEventListener("click", () => prepareExpedition(true));
  app.querySelector("#craftMealBtn")?.addEventListener("click", doCraftMeal);
  app.querySelector("#repairBtn")?.addEventListener("click", doRepair);
  app.querySelector("#restBtn")?.addEventListener("click", doRest);
  app.querySelector("#advanceBtn")?.addEventListener("click", advancePhase);

  app.querySelectorAll("[data-upgrade-id]").forEach((btn) => {
    btn.addEventListener("click", () => buildUpgrade(btn.dataset.upgradeId));
  });

  app.querySelectorAll("[data-garage-id]").forEach((btn) => {
    btn.addEventListener("click", () => buildGarageUpgrade(btn.dataset.garageId));
  });

  app.querySelectorAll("[data-encounter]").forEach((btn) => {
    btn.addEventListener("click", () => resolveEncounter(btn.dataset.encounter));
  });

  app.querySelectorAll("[data-raid-next]").forEach((btn) => {
    btn.addEventListener("click", () => continueRaidToSecondStop(btn.dataset.raidNext === "yes"));
  });

  app.querySelectorAll("[data-combat-action]").forEach((btn) => {
    btn.addEventListener("click", () => combatTurn(btn.dataset.combatAction));
  });

  app.querySelectorAll("[data-craft-weapon]").forEach((btn) => {
    btn.addEventListener("click", () => craftWeapon(btn.dataset.craftWeapon));
  });
  app.querySelectorAll("[data-craft-ammo]").forEach((btn) => {
    btn.addEventListener("click", () => craftAmmo(btn.dataset.craftAmmo));
  });
  app.querySelectorAll("[data-craft-armor]").forEach((btn) => {
    btn.addEventListener("click", () => craftArmor(btn.dataset.craftArmor));
  });
  app.querySelectorAll("[data-equip-weapon]").forEach((btn) => {
    btn.addEventListener("click", () => equipWeapon(btn.dataset.equipWeapon));
  });
  app.querySelectorAll("[data-repair-weapon]").forEach((btn) => {
    btn.addEventListener("click", () => repairWeapon(btn.dataset.repairWeapon));
  });
  app.querySelectorAll("[data-equip-armor]").forEach((btn) => {
    btn.addEventListener("click", () => equipArmor(btn.dataset.equipArmor));
  });
  app.querySelectorAll("[data-treat]").forEach((btn) => {
    btn.addEventListener("click", () => treatInjury(btn.dataset.treat));
  });
}

if (!state.logs.length) {
  state.weather = WEATHER_TYPES[randomInt(0, WEATHER_TYPES.length - 1)];
  addLog("Вы укрылись в доме на окраине. Первая цель: продержаться 7 дней.");
  addLog("Подсказка: разведывай узлы карты и готовь базу к ночным волнам.");
  saveGame();
}

ensureAutoHeroLoop();
render();
