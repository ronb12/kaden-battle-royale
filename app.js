(() => {
  const key = "kaden-battle-royale-v1";
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
    log: ["Ready for the next bot royale drop."],
  };
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  const toast = document.querySelector("#toast");
  const hp = document.querySelector("#hp");
  const shield = document.querySelector("#shield");
  const players = document.querySelector("#players");
  const stormTimer = document.querySelector("#stormTimer");
  const pin = document.querySelector("#pin");
  const quickbar = document.querySelector(".quickbar");
  const panel = document.querySelector(".battle-panel");

  document.head.insertAdjacentHTML("beforeend", `<style>
    .sim-panel{background:rgba(10,22,54,.7);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px}
    .sim-actions,.sim-log{display:grid;gap:10px}.sim-actions button{width:100%}.sim-grid{display:grid;gap:16px;grid-template-columns:1fr 1fr}.sim-list{display:grid;gap:8px}
    .sim-entry{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.08)}.sim-meta{color:#bcd0ff}
    @media (max-width:800px){.sim-grid{grid-template-columns:1fr}}
  </style>`);

  panel.insertAdjacentHTML("beforeend", `
    <article class="sim-panel">
      <h2>Playable Match Controls</h2>
      <div class="sim-grid">
        <div class="sim-actions">
          <button id="lootBtn" type="button">Loot Chest</button>
          <button id="buildBtn" type="button">Build Cover</button>
          <button id="duelBtn" type="button">Take Bot Duel</button>
          <button id="healBtn" type="button">Use Shield Pop</button>
        </div>
        <div>
          <h3>Match Log</h3>
          <div id="matchLog" class="sim-log"></div>
        </div>
      </div>
    </article>`);

  const zones = ["Loot Lake", "Blaster Bay", "Build Barn", "Coin Ridge"];

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
    document.querySelector("#matchLog").innerHTML = state.log.map((entry) => `<div class="sim-entry">${entry}</div>`).join("");
    save();
  }

  function softenStorm() {
    state.storm = Math.max(15, state.storm - 15);
  }

  document.querySelector("#startMatch").addEventListener("click", () => {
    state.hp = 100;
    state.shield = 50;
    state.players = 12;
    state.storm = 120;
    state.wood = 120;
    state.brick = 60;
    state.drop = "None";
    state.matches += 1;
    log("Battle bus launched. Pick a drop zone and start looting.");
    sync();
    showToast("New match started.");
  });

  document.querySelector("#dropZone").addEventListener("click", () => {
    state.drop = zones[state.matches % zones.length];
    state.players = Math.max(10, state.players - 1);
    softenStorm();
    log(`Drop marker placed at ${state.drop}. You beat one bot to the landing route.`);
    sync();
    showToast(`Drop zone set: ${state.drop}`);
  });

  document.querySelector("#openLocker").addEventListener("click", () => {
    state.shield = Math.min(100, state.shield + 25);
    log("Locker equipped neon glider, moonwalk emote, and a brighter foam-blaster wrap.");
    sync();
    showToast("Locker loadout applied.");
  });

  document.querySelector("#lootBtn").addEventListener("click", () => {
    const loot = [
      { shield: 15, wood: 40, brick: 20, text: "Found a chest with minis and fresh mats." },
      { shield: 0, wood: 60, brick: 35, text: "Collected stacks of wood and brick near the barn." },
      { shield: 30, wood: 25, brick: 10, text: "Rare chest: big shield and bounce pad." },
    ][state.players % 3];
    state.shield = Math.min(100, state.shield + loot.shield);
    state.wood += loot.wood;
    state.brick += loot.brick;
    softenStorm();
    log(loot.text);
    sync();
    showToast("Loot collected.");
  });

  document.querySelector("#buildBtn").addEventListener("click", () => {
    if (state.wood < 20) {
      showToast("Need at least 20 wood to build cover.");
      return;
    }
    state.wood -= 20;
    state.brick = Math.max(0, state.brick - 10);
    softenStorm();
    log("Built quick cover and blocked a bot push near the safe zone.");
    sync();
    showToast("Cover built.");
  });

  document.querySelector("#healBtn").addEventListener("click", () => {
    state.shield = Math.min(100, state.shield + 20);
    state.hp = Math.min(100, state.hp + 10);
    log("Used a shield pop and patched back up before the next storm ring.");
    sync();
    showToast("Recovered health and shield.");
  });

  document.querySelector("#duelBtn").addEventListener("click", () => {
    state.players = Math.max(1, state.players - 1);
    state.hp = Math.max(40, state.hp - 10);
    state.shield = Math.max(0, state.shield - 8);
    state.placementBest = Math.min(state.placementBest, state.players);
    softenStorm();
    log(state.players === 1 ? "Victory royale! Last bot knocked back off the final ridge." : `Won a bot duel. ${state.players - 1} opponents remain.`);
    sync();
    showToast(state.players === 1 ? "Victory royale!" : "Bot duel won.");
  });

  log(`Best placement so far: #${state.placementBest}.`);
  sync();
})();
