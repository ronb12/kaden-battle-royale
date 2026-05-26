(() => {
  const key = "kaden-battle-royale-premium-systems-v1";
  const defaultState = {
    rank: "Island Rookie",
    tactics: 18,
    aim: 22,
    build: 16,
    passStars: 0,
    squadTrust: 34,
    lootIndex: 1,
    stormPhase: "Warmup",
    squadMode: "Solo",
    serviceStatus: "Offline squad queue ready",
    drills: [
      "Win one duel without dropping shield",
      "Place two cover pieces before storm phase two",
      "Mark a low-risk drop before launching",
    ],
  };
  const state = JSON.parse(localStorage.getItem(key) || "null") || defaultState;
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  function scoreRank() {
    const total = state.tactics + state.aim + state.build + state.squadTrust;
    if (total >= 330) return "Arena Legend";
    if (total >= 240) return "Storm Captain";
    if (total >= 150) return "Drop Leader";
    return "Island Rookie";
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function train(type) {
    state[type] = clamp(state[type] + 12);
    state.passStars += 1;
    state.lootIndex = (state.lootIndex % 5) + 1;
    state.stormPhase = ["Warmup", "First Circle", "Storm Surge", "Final Ring"][state.passStars % 4];
    state.squadMode = ["Solo", "Duo", "Squad"][state.passStars % 3];
    state.serviceStatus = `Queued ${state.squadMode} progress for future /api/battle-royale/progress sync`;
    state.rank = scoreRank();
    save();
    render();
  }

  function render() {
    const host = document.querySelector("#app");
    if (!host) return;
    let premium = document.querySelector("#premiumCommand");
    if (!premium) {
      premium = document.createElement("section");
      premium.id = "premiumCommand";
      premium.className = "premium-command";
      host.insertAdjacentElement("afterend", premium);
    }

    premium.innerHTML = `
      <div class="premium-command__head">
        <div>
          <h2>Elite Arena Systems</h2>
          <p>Advanced progression layer for smarter bot practice, cleaner match goals, and a battle-pass loop that feels like a real product.</p>
        </div>
        <span class="premium-badge">${state.rank} · ${state.passStars} Stars</span>
      </div>
      <div class="premium-grid">
        <article class="premium-card">
          <h3>Combat Academy</h3>
          <p>Build aim, cover timing, and storm decisions through short kid-safe drills.</p>
          <div class="premium-meter"><span style="width:${state.aim}%"></span></div>
          <div class="premium-actions"><button data-train="aim">Aim Drill</button><button data-train="build">Build Drill</button></div>
        </article>
        <article class="premium-card">
          <h3>Smart Bot Director</h3>
          <p>Bot pressure now has a design target: teach drop safety, shield timing, and rotation choices.</p>
          <div class="premium-meter"><span style="width:${state.tactics}%"></span></div>
          <div class="premium-actions"><button data-train="tactics">Run Scenario</button></div>
        </article>
        <article class="premium-card">
          <h3>Daily Quest Board</h3>
          <p>${state.drills[state.passStars % state.drills.length]}</p>
          <div class="premium-meter"><span style="width:${state.squadTrust}%"></span></div>
          <div class="premium-actions"><button data-train="squadTrust">Claim Progress</button></div>
        </article>
        <article class="premium-card">
          <h3>Drop Map & Storm Loop</h3>
          <p>${state.squadMode} route · ${state.stormPhase}. Teaches safe drops, rotations, and endgame pressure.</p>
          <div class="premium-meter"><span style="width:${clamp(state.tactics + 10)}%"></span></div>
          <div class="premium-actions"><button data-train="tactics">Plan Drop</button></div>
        </article>
        <article class="premium-card">
          <h3>Loot Rarity Track</h3>
          <p>Tier ${state.lootIndex} loadout path with cosmetic rewards, kid-safe pass goals, and no pay-to-win stats.</p>
          <div class="premium-meter"><span style="width:${clamp(state.aim + state.build / 2)}%"></span></div>
          <div class="premium-actions"><button data-train="aim">Roll Loot</button></div>
        </article>
        <article class="premium-card">
          <h3>Creator Island Hooks</h3>
          <p>Room for custom arenas, rotating modifiers, and future community challenge codes.</p>
          <div class="premium-meter"><span style="width:${clamp(state.squadTrust + 8)}%"></span></div>
          <div class="premium-actions"><button data-train="build">Build Island</button></div>
        </article>
        <article class="premium-card">
          <h3>Backend Contract</h3>
          <p>${state.serviceStatus}. Tracks pass stars, squad mode, loot tier, storm phase, and safe leaderboard state.</p>
          <div class="premium-meter"><span style="width:${clamp(35 + state.passStars * 5)}%"></span></div>
          <div class="premium-actions"><button data-train="squadTrust">Queue Sync</button></div>
        </article>
      </div>
    `;

    premium.querySelectorAll("[data-train]").forEach((button) => {
      button.addEventListener("click", () => train(button.dataset.train));
    });
  }

  render();
})();
