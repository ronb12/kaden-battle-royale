(() => {
  const key = "kaden-battle-royale-v2";
  const state = JSON.parse(localStorage.getItem(key) || "null") || {
    hp: 100,
    shield: 50,
    players: 12,
    storm: 120,
    wood: 120,
    brick: 60,
    placementBest: 12,
    drop: "None",
    matches: 0,
    passXp: 0,
    lockerSkin: "Neon Scout",
    glider: "Bubble Wing",
    activeTab: "island",
    log: ["Ready for the next bot royale drop."],
  };
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  const zones = ["Loot Lake", "Blaster Bay", "Build Barn", "Coin Ridge"];

  const toast = document.querySelector("#toast");
  const hp = document.querySelector("#hp");
  const shield = document.querySelector("#shield");
  const players = document.querySelector("#players");
  const stormTimer = document.querySelector("#stormTimer");
  const pin = document.querySelector("#pin");
  const quickbar = document.querySelector(".quickbar");
  const app = document.querySelector("#app");
  const tabs = [...document.querySelectorAll("[data-tab]")];

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function formatStorm() {
    const minutes = String(Math.floor(state.storm / 60)).padStart(2, "0");
    const seconds = String(state.storm % 60).padStart(2, "0");
    return `Storm ${minutes}:${seconds}`;
  }

  function log(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 6);
  }

  function renderIsland() {
    return `
      <div class="panel-grid">
        <article class="panel-card mission">
          <h2>Island Briefing</h2>
          <ol>
            <li>Ride the battle bus and mark the drop.</li>
            <li>Loot chests for shield pops and building mats.</li>
            <li>Build quick cover around the safe zone.</li>
            <li>Win kid-safe bot duels to climb placement.</li>
          </ol>
        </article>
        <article class="panel-card">
          <h2>Drop Intel</h2>
          <div class="stat-list">
            ${zones.map((zone) => `<div class="stat-entry"><strong>${zone}</strong><span>${zone === state.drop ? "Marked drop" : "Available"}</span></div>`).join("")}
          </div>
        </article>
        <article class="panel-card">
          <h2>Kid-Safe Combat</h2>
          <p>Foam blasters, bounce pads, shields, silly knockback, and practice-respawn energy keep the battle playful instead of harsh.</p>
        </article>
      </div>
    `;
  }

  function renderMatch() {
    return `
      <div class="panel-grid match-grid">
        <article class="panel-card">
          <h2>Playable Match Controls</h2>
          <div class="action-stack">
            <button id="lootBtn" type="button">Loot Chest</button>
            <button id="buildBtn" type="button">Build Cover</button>
            <button id="duelBtn" type="button">Take Bot Duel</button>
            <button id="healBtn" type="button">Use Shield Pop</button>
          </div>
        </article>
        <article class="panel-card">
          <h2>Match Log</h2>
          <div id="matchLog" class="log-stack"></div>
        </article>
        <article class="panel-card">
          <h2>Round Snapshot</h2>
          <div class="stat-list">
            <div class="stat-entry"><strong>Best Placement</strong><span>#${state.placementBest}</span></div>
            <div class="stat-entry"><strong>Current Drop</strong><span>${state.drop}</span></div>
            <div class="stat-entry"><strong>Wood / Brick</strong><span>${state.wood} / ${state.brick}</span></div>
          </div>
        </article>
      </div>
    `;
  }

  function renderLocker() {
    return `
      <div class="panel-grid">
        <article class="panel-card">
          <h2>Locker Loadout</h2>
          <div class="stat-list">
            <div class="stat-entry"><strong>Skin</strong><span>${state.lockerSkin}</span></div>
            <div class="stat-entry"><strong>Glider</strong><span>${state.glider}</span></div>
            <div class="stat-entry"><strong>Wrap</strong><span>Foam Burst Blue</span></div>
          </div>
          <div class="action-stack locker-actions">
            <button type="button" data-locker="skin">Cycle Skin</button>
            <button type="button" data-locker="glider">Cycle Glider</button>
            <button id="equipLocker" class="ghost-action" type="button">Equip Locker</button>
          </div>
        </article>
        <article class="panel-card">
          <h2>Cosmetic Notes</h2>
          <p>Unlock astronaut helmets, neon sneakers, glider trails, dance emotes, backpack charms, and goofy island flags through a separate locker flow.</p>
        </article>
      </div>
    `;
  }

  function renderPass() {
    const tier = Math.floor(state.passXp / 100) + 1;
    return `
      <div class="panel-grid">
        <article class="panel-card">
          <h2>Battle Pass Track</h2>
          <div class="xp-meter"><span style="width:${Math.min(100, state.passXp % 100)}%"></span></div>
          <div class="stat-list">
            <div class="stat-entry"><strong>Current Tier</strong><span>${tier}</span></div>
            <div class="stat-entry"><strong>Pass XP</strong><span>${state.passXp}</span></div>
            <div class="stat-entry"><strong>Matches Played</strong><span>${state.matches}</span></div>
          </div>
        </article>
        <article class="panel-card">
          <h2>Next Rewards</h2>
          <div class="stat-list">
            <div class="stat-entry"><strong>Tier ${tier}</strong><span>Sticker spray</span></div>
            <div class="stat-entry"><strong>Tier ${tier + 1}</strong><span>Rocket trail</span></div>
            <div class="stat-entry"><strong>Tier ${tier + 2}</strong><span>Moonwalk emote</span></div>
          </div>
        </article>
      </div>
    `;
  }

  function renderApp() {
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.activeTab));
    if (state.activeTab === "island") app.innerHTML = renderIsland();
    if (state.activeTab === "match") app.innerHTML = renderMatch();
    if (state.activeTab === "locker") app.innerHTML = renderLocker();
    if (state.activeTab === "pass") app.innerHTML = renderPass();

    const logRoot = document.querySelector("#matchLog");
    if (logRoot) {
      logRoot.innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("");
    }

    const actions = {
      lootBtn: lootChest,
      buildBtn: buildCover,
      duelBtn: duelBot,
      healBtn: healUp,
      equipLocker: applyLocker,
    };
    Object.entries(actions).forEach(([id, handler]) => {
      const node = document.querySelector(`#${id}`);
      if (node) node.addEventListener("click", handler);
    });

    document.querySelectorAll("[data-locker]").forEach((button) => {
      button.addEventListener("click", () => cycleLocker(button.dataset.locker));
    });
  }

  function sync() {
    hp.textContent = `HP ${state.hp}`;
    shield.textContent = `Shield ${state.shield}`;
    players.textContent = `Players ${state.players}`;
    stormTimer.textContent = formatStorm();
    pin.classList.toggle("show", state.drop !== "None");
    quickbar.innerHTML = `
      <span>Foam Blaster</span>
      <span>Shield Pop</span>
      <span>Drop: ${state.drop}</span>
      <span>Wood ${state.wood}</span>
      <span>Brick ${state.brick}</span>
    `;
    renderApp();
    save();
  }

  function softenStorm() {
    state.storm = Math.max(15, state.storm - 15);
  }

  function awardXp(amount) {
    state.passXp += amount;
  }

  function startMatch() {
    state.hp = 100;
    state.shield = 50;
    state.players = 12;
    state.storm = 120;
    state.wood = 120;
    state.brick = 60;
    state.drop = "None";
    state.matches += 1;
    state.activeTab = "match";
    awardXp(20);
    log("Battle bus launched. Pick a drop zone and start looting.");
    sync();
    showToast("New match started.");
  }

  function markDrop() {
    state.drop = zones[state.matches % zones.length];
    state.players = Math.max(10, state.players - 1);
    softenStorm();
    awardXp(10);
    log(`Drop marker placed at ${state.drop}. You beat one bot to the landing route.`);
    sync();
    showToast(`Drop zone set: ${state.drop}`);
  }

  function applyLocker() {
    state.shield = Math.min(100, state.shield + 25);
    log("Locker equipped neon glider, moonwalk emote, and a brighter foam-blaster wrap.");
    sync();
    showToast("Locker loadout applied.");
  }

  function lootChest() {
    const loot = [
      { shield: 15, wood: 40, brick: 20, text: "Found a chest with minis and fresh mats." },
      { shield: 0, wood: 60, brick: 35, text: "Collected stacks of wood and brick near the barn." },
      { shield: 30, wood: 25, brick: 10, text: "Rare chest: big shield and bounce pad." },
    ][state.players % 3];
    state.shield = Math.min(100, state.shield + loot.shield);
    state.wood += loot.wood;
    state.brick += loot.brick;
    softenStorm();
    awardXp(15);
    log(loot.text);
    sync();
    showToast("Loot collected.");
  }

  function buildCover() {
    if (state.wood < 20) {
      showToast("Need at least 20 wood to build cover.");
      return;
    }
    state.wood -= 20;
    state.brick = Math.max(0, state.brick - 10);
    softenStorm();
    awardXp(10);
    log("Built quick cover and blocked a bot push near the safe zone.");
    sync();
    showToast("Cover built.");
  }

  function healUp() {
    state.shield = Math.min(100, state.shield + 20);
    state.hp = Math.min(100, state.hp + 10);
    log("Used a shield pop and patched back up before the next storm ring.");
    sync();
    showToast("Recovered health and shield.");
  }

  function duelBot() {
    state.players = Math.max(1, state.players - 1);
    state.hp = Math.max(40, state.hp - 10);
    state.shield = Math.max(0, state.shield - 8);
    state.placementBest = Math.min(state.placementBest, state.players);
    softenStorm();
    awardXp(state.players === 1 ? 60 : 25);
    state.activeTab = state.players === 1 ? "pass" : "match";
    log(state.players === 1 ? "Victory royale! Last bot knocked back off the final ridge." : `Won a bot duel. ${state.players - 1} opponents remain.`);
    sync();
    showToast(state.players === 1 ? "Victory royale!" : "Bot duel won.");
  }

  function cycleLocker(type) {
    if (type === "skin") {
      const skins = ["Neon Scout", "Galaxy Hoodie", "Crown Crawler"];
      state.lockerSkin = skins[(skins.indexOf(state.lockerSkin) + 1) % skins.length];
    }
    if (type === "glider") {
      const gliders = ["Bubble Wing", "Pixel Kite", "Thunder Board"];
      state.glider = gliders[(gliders.indexOf(state.glider) + 1) % gliders.length];
    }
    state.activeTab = "locker";
    sync();
  }

  document.querySelector("#startMatch").addEventListener("click", startMatch);
  document.querySelector("#dropZone").addEventListener("click", markDrop);
  document.querySelector("#openLocker").addEventListener("click", () => {
    state.activeTab = "locker";
    sync();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      sync();
    });
  });

  log(`Best placement so far: #${state.placementBest}.`);
  sync();
})();
