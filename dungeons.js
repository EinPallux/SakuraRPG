/* =========================================
   SAKURA CHRONICLES - ELEMENTAL DUNGEONS
   Fixed-floor dungeon runs with headless simulation
   ========================================= */

let _currentDungeonRun = null;

// ===========================
// RENDER DUNGEON SELECTION
// ===========================

function renderDungeons(gameState) {
    const container = document.getElementById('dungeons-tab');
    if (!container) return;

    if (_currentDungeonRun) {
        container.innerHTML = `<div class="max-w-2xl mx-auto animate-entry" id="dungeon-run-area"></div>`;
        _renderDungeonRun(gameState);
        return;
    }

    const today = _todayStr();
    const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
    const diffBg    = { Easy: '#f0fdf4', Medium: '#fffbeb', Hard: '#fef2f2' };

    const cards = DUNGEONS_DATABASE.map(d => {
        const usage   = gameState.dungeonData?.[d.id];
        const used    = (usage && usage.date === today) ? (usage.used || 0) : 0;
        const left    = d.dailyAttempts - used;
        const elColor = _dungeonElColor(d.element);
        const dc      = diffColor[d.difficulty] || '#94a3b8';
        const dbg     = diffBg[d.difficulty]    || '#f8fafc';
        const btnOnclick = left > 0 ? "enterDungeon('" + d.id + "')" : '';

        return `
            <div class="dungeon-card" style="--el-accent:${elColor.accent};">
                <div class="dungeon-card-banner" style="background:${elColor.bg};">
                    <div class="text-4xl">${d.icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="font-bold text-slate-800 text-lg leading-tight">${d.name}</h3>
                            <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:${dbg};color:${dc};">${d.difficulty}</span>
                        </div>
                        <div class="text-xs font-bold mt-0.5" style="color:${elColor.accent};">${d.element} Element · 3 Floors</div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <div class="text-sm font-bold" style="color:${left > 0 ? elColor.accent : '#94a3b8'};">${left}/${d.dailyAttempts}</div>
                        <div class="text-[10px] text-slate-400 font-medium">attempts left</div>
                    </div>
                </div>

                <div class="px-4 py-3 text-sm text-slate-500 leading-relaxed">${d.desc}</div>

                <div class="px-4 pb-3">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rewards</div>
                    <div class="flex flex-wrap gap-1.5">
                        <span class="dungeon-reward-tag gold">💰 ${formatNumber(d.rewards.gold)}</span>
                        ${d.rewards.materials.map(m => {
                            const mat = FORGE_DATABASE.materials.find(x => x.id === m.id);
                            return `<span class="dungeon-reward-tag mat">${mat?.emoji || '📦'} ${mat?.name || m.id} ×${m.qty}</span>`;
                        }).join('')}
                        ${d.rewards.bonusMaterial ? (() => {
                            const bm = FORGE_DATABASE.materials.find(x => x.id === d.rewards.bonusMaterial.id);
                            return `<span class="dungeon-reward-tag bonus">${bm?.emoji || '📦'} ${bm?.name || d.rewards.bonusMaterial.id} ×${d.rewards.bonusMaterial.qty} <span class="opacity-60">(${Math.round(d.rewards.bonusMaterial.chance * 100)}%)</span></span>`;
                        })() : ''}
                    </div>
                </div>

                <button class="dungeon-enter-btn ${left > 0 ? 'available' : 'exhausted'}"
                        onclick="${btnOnclick}"
                        ${left <= 0 ? 'disabled' : ''}>
                    ${left > 0 ? '<i class="fa-solid fa-dungeon mr-2"></i> Enter Dungeon' : '<i class="fa-solid fa-moon mr-2"></i> Resets Tomorrow'}
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-5 animate-entry">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-200">
                        <i class="fa-solid fa-dungeon"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">Elemental Dungeons</h2>
                        <p class="text-slate-500 text-sm">Fixed 3-floor challenges. Heroes carry HP between floors.</p>
                    </div>
                </div>
                <div class="bg-violet-50 rounded-xl px-5 py-2.5 text-center">
                    <div class="text-xl font-bold text-violet-500">${DUNGEONS_DATABASE.length}</div>
                    <div class="text-xs text-slate-400 font-bold uppercase">Dungeons</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>

            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                <i class="fa-solid fa-circle-info mr-2"></i>
                Dungeons refresh daily. Your heroes keep their current HP across floors — no mid-dungeon healing!
            </div>
        </div>
    `;
}

// ===========================
// ENTER DUNGEON
// ===========================

window.enterDungeon = function(dungeonId) {
    const gs      = window.gameState;
    const dungeon = DUNGEONS_DATABASE.find(d => d.id === dungeonId);
    if (!dungeon || !gs) return;

    const team = gs.getTeamHeroes().filter(h => h.isAlive);
    if (team.length === 0) {
        showToast('You need alive heroes in your team!', 'error');
        return;
    }

    const heroClones = team.map(h => {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(h)), h);
        clone.statusEffects = [...(h.statusEffects || [])];
        clone.currentHP = h.currentHP;
        clone.maxHP = h.maxHP;
        clone.mana = h.mana || 0;
        return clone;
    });

    _currentDungeonRun = {
        dungeonId,
        dungeon,
        heroes: heroClones,
        currentFloor: 0,
        phase: 'pre',
        floorResults: [],
        rewards: null
    };

    renderDungeons(gs);
};

// ===========================
// RENDER DUNGEON RUN UI
// ===========================

function _renderDungeonRun(gameState) {
    const area = document.getElementById('dungeon-run-area');
    if (!area || !_currentDungeonRun) return;

    const run     = _currentDungeonRun;
    const dungeon = run.dungeon;
    const elColor = _dungeonElColor(dungeon.element);
    const floor   = run.currentFloor;
    const total   = dungeon.floors.length;

    const heroCards = run.heroes.map(h => {
        const pct = Math.max(0, Math.min(100, (h.currentHP / h.maxHP) * 100));
        const barColor = pct > 60 ? '#10b981' : pct > 30 ? '#f59e0b' : '#ef4444';
        return `
            <div class="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-slate-100 shadow-sm">
                <div class="text-2xl flex-shrink-0">${h.emoji || '🌸'}</div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-slate-700 truncate">${h.name}</div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" style="width:${pct}%;background:${barColor};"></div>
                        </div>
                        <span class="text-[10px] font-mono text-slate-400 flex-shrink-0">${h.currentHP}/${h.maxHP}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const floorDots = dungeon.floors.map((_, i) => {
        let cls = 'dungeon-floor-dot';
        if (i < floor) cls += ' done';
        else if (i === floor) cls += ' current';
        return `<div class="${cls}">
            ${i < floor ? '<i class="fa-solid fa-check text-[10px]"></i>' : (i + 1)}
        </div>`;
    }).join('<div class="dungeon-floor-connector"></div>');

    let actionBox = '';

    if (run.phase === 'pre') {
        const floorConf = dungeon.floors[floor];
        const enemyNames = floorConf.enemies.map(eid => {
            const tpl = ENEMIES_DATABASE.find(e => e.id === eid);
            return tpl ? `${tpl.emoji || '👾'} ${tpl.name}` : eid;
        }).join(', ');

        actionBox = `
            <div class="dungeon-action-box" style="border-color:${elColor.accent}22;">
                <div class="text-sm font-bold text-slate-700 mb-1">Floor ${floor + 1} of ${total}</div>
                <div class="text-xs text-slate-500 mb-3">Enemies: <span class="font-medium text-slate-700">${enemyNames}</span> · Wave scaling: ${floorConf.wave}</div>
                <button class="dungeon-fight-btn" style="background:linear-gradient(135deg,${elColor.accent},${elColor.glow});"
                        onclick="fightDungeonFloor()">
                    <i class="fa-solid fa-sword mr-2"></i> Fight Floor ${floor + 1}
                </button>
            </div>
        `;
    } else if (run.phase === 'fighting') {
        actionBox = `
            <div class="dungeon-action-box" style="border-color:${elColor.accent}22;">
                <div class="flex items-center justify-center gap-3 py-4">
                    <div class="dungeon-pulse-ring" style="--ring-color:${elColor.accent};"></div>
                    <span class="text-slate-600 font-bold">Battling Floor ${floor + 1}…</span>
                    <div class="dungeon-pulse-ring" style="--ring-color:${elColor.accent};"></div>
                </div>
            </div>
        `;
    } else if (run.phase === 'between') {
        const lastResult = run.floorResults[run.floorResults.length - 1];
        actionBox = `
            <div class="dungeon-action-box" style="border-color:#10b98122;">
                <div class="flex items-center gap-2 mb-3">
                    <i class="fa-solid fa-circle-check text-emerald-500"></i>
                    <span class="font-bold text-emerald-700">Floor ${floor} cleared!</span>
                    <span class="text-xs text-slate-400">(${lastResult?.turns || '?'} turns)</span>
                </div>
                ${floor < total ? `
                <button class="dungeon-fight-btn" style="background:linear-gradient(135deg,${elColor.accent},${elColor.glow});"
                        onclick="fightDungeonFloor()">
                    <i class="fa-solid fa-chevron-right mr-2"></i> Continue to Floor ${floor + 1}
                </button>` : ''}
            </div>
        `;
    } else if (run.phase === 'complete') {
        const rw = run.rewards;
        const rwRows = [
            `<span class="dungeon-reward-tag gold">💰 +${formatNumber(rw.gold)}</span>`,
            ...rw.materials.map(m => {
                const mat = FORGE_DATABASE.materials.find(x => x.id === m.id);
                return `<span class="dungeon-reward-tag mat">${mat?.emoji || '📦'} ${mat?.name || m.id} ×${m.qty}</span>`;
            })
        ].join('');

        actionBox = `
            <div class="dungeon-action-box" style="border-color:#f59e0b22;background:#fffbeb;">
                <div class="text-center mb-4">
                    <div class="text-4xl mb-2">🏆</div>
                    <div class="text-lg font-bold text-amber-700">Dungeon Cleared!</div>
                    <div class="text-sm text-slate-500 mt-1">${dungeon.name} conquered</div>
                </div>
                <div class="flex flex-wrap gap-2 justify-center mb-4">${rwRows}</div>
                <button class="dungeon-fight-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);"
                        onclick="claimDungeonRewards()">
                    <i class="fa-solid fa-gift mr-2"></i> Claim Rewards
                </button>
            </div>
        `;
    } else if (run.phase === 'defeat') {
        actionBox = `
            <div class="dungeon-action-box" style="border-color:#ef444422;background:#fef2f2;">
                <div class="text-center mb-4">
                    <div class="text-4xl mb-2">💀</div>
                    <div class="text-lg font-bold text-red-700">Party Defeated</div>
                    <div class="text-sm text-slate-500 mt-1">All heroes fell on Floor ${floor + 1}</div>
                </div>
                <button class="dungeon-fight-btn" style="background:linear-gradient(135deg,#ef4444,#dc2626);"
                        onclick="exitDungeon()">
                    <i class="fa-solid fa-rotate-left mr-2"></i> Return to Dungeons
                </button>
            </div>
        `;
    }

    area.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <button class="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        onclick="exitDungeon()">
                    <i class="fa-solid fa-arrow-left text-lg"></i>
                </button>
                <div class="flex items-center gap-3 flex-1">
                    <span class="text-3xl">${dungeon.icon}</span>
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg leading-tight">${dungeon.name}</h3>
                        <div class="text-xs font-bold" style="color:${elColor.accent};">${dungeon.element} Dungeon · ${dungeon.difficulty}</div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Floor Progress</div>
                <div class="flex items-center justify-center gap-0">${floorDots}</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Party</div>
                <div class="grid grid-cols-1 gap-2">${heroCards}</div>
            </div>

            ${actionBox}
        </div>
    `;
}

// ===========================
// FIGHT A FLOOR
// ===========================

window.fightDungeonFloor = function() {
    if (!_currentDungeonRun) return;

    _currentDungeonRun.phase = 'fighting';
    _renderDungeonRun(window.gameState);

    setTimeout(() => {
        const run   = _currentDungeonRun;
        if (!run) return;

        const floor = run.dungeon.floors[run.currentFloor];
        const result = _simulateDungeonFloor(run.heroes, floor);

        run.floorResults.push(result);

        if (result.victory) {
            run.heroes = result.survivingHeroes;
            run.currentFloor++;

            if (run.currentFloor >= run.dungeon.floors.length) {
                run.phase = 'complete';
                run.rewards = _buildDungeonRewards(run.dungeon);
            } else {
                run.phase = 'between';
            }
        } else {
            run.phase = 'defeat';
            _consumeDungeonAttempt(window.gameState, run.dungeonId);
            saveGame(window.gameState);
        }

        _renderDungeonRun(window.gameState);
    }, 1800);
};

// ===========================
// HEADLESS BATTLE SIMULATION
// ===========================

function _simulateDungeonFloor(heroes, floorConfig) {
    const enemies = floorConfig.enemies.map((eid, i) => {
        const template = ENEMIES_DATABASE.find(e => e.id === eid);
        if (!template) return null;
        const enemy = new Enemy(template, floorConfig.wave);
        enemy.instanceId = `${eid}_floor_${Date.now()}_${i}`;
        return enemy;
    }).filter(Boolean);

    const heroCopies = heroes.map(h => {
        const c = Object.assign(Object.create(Object.getPrototypeOf(h)), h);
        c.statusEffects = [...(h.statusEffects || [])];
        c.currentHP = h.currentHP;
        c.maxHP = h.maxHP;
        c.atk = h.atk;
        c.def = h.def;
        c.spd = h.spd;
        c.mana = h.mana || 0;
        return c;
    });

    let turnCount = 0;
    const MAX_TURNS = 300;

    while (turnCount < MAX_TURNS) {
        turnCount++;

        const aliveHeroes  = heroCopies.filter(h => h.isAlive);
        const aliveEnemies = enemies.filter(e => e.isAlive);

        if (aliveHeroes.length === 0) break;
        if (aliveEnemies.length === 0) break;

        const turnOrder = [
            ...aliveHeroes.map(u => ({ unit: u, isHero: true })),
            ...aliveEnemies.map(u => ({ unit: u, isHero: false }))
        ].sort((a, b) => b.unit.spd - a.unit.spd);

        for (const { unit, isHero } of turnOrder) {
            if (!unit.isAlive) continue;

            const currentAliveHeroes  = heroCopies.filter(h => h.isAlive);
            const currentAliveEnemies = enemies.filter(e => e.isAlive);
            if (currentAliveHeroes.length === 0 || currentAliveEnemies.length === 0) break;

            if (isHero) {
                _simulateHeroTurn(unit, currentAliveEnemies, currentAliveHeroes);
            } else {
                _simulateEnemyTurn(unit, currentAliveHeroes);
            }
        }
    }

    const survivingHeroes = heroCopies.filter(h => h.isAlive);
    return { victory: survivingHeroes.length > 0, survivingHeroes, turns: turnCount };
}

function _simulateHeroTurn(hero, aliveEnemies, aliveHeroes) {
    hero.mana = (hero.mana || 0) + 12;

    if (hero.canUseUltimate && hero.canUseUltimate()) {
        hero.mana = 0;
        _headlessUltimate(hero, aliveEnemies, aliveHeroes);
        return;
    }

    if (hero.class === 'Healer') {
        const hurt = aliveHeroes.filter(h => h.getHPPercent() < 50)
                                .sort((a, b) => a.currentHP - b.currentHP);
        if (hurt.length > 0 && Math.random() < 0.5) {
            const heal = Math.floor((hero.atk || 50) * 1.4);
            hurt[0].currentHP = Math.min(hurt[0].maxHP, hurt[0].currentHP + heal);
            return;
        }
    }

    if (hero.class === 'DPS (AoE)' && aliveEnemies.length >= 2 && Math.random() < 0.4) {
        const dmg = Math.max(1, Math.floor((hero.atk || 50) * 0.65));
        aliveEnemies.forEach(e => e.takeDamage(dmg));
        return;
    }

    const target = aliveEnemies[0];
    if (target) {
        const baseDmg = Math.max(1, (hero.atk || 50) - Math.floor((target.def || 0) * 0.4));
        const crit    = Math.random() < 0.15 ? 1.6 : 1;
        target.takeDamage(Math.floor(baseDmg * crit));
    }
}

function _simulateEnemyTurn(enemy, aliveHeroes) {
    enemy.mana = (enemy.mana || 0) + 10;
    const target = aliveHeroes.sort((a, b) => a.currentHP - b.currentHP)[0];
    if (!target) return;
    const rawDmg = Math.max(1, (enemy.atk || 30) - Math.floor((target.def || 0) * 0.3));
    const dmg    = Math.floor(rawDmg * (0.85 + Math.random() * 0.3));
    target.takeDamage(dmg);
}

function _headlessUltimate(hero, aliveEnemies, aliveHeroes) {
    switch (hero.class) {
        case 'Healer': {
            const healAmt = Math.floor(hero.maxHP * 0.30);
            aliveHeroes.forEach(h => { h.currentHP = Math.min(h.maxHP, h.currentHP + healAmt); });
            break;
        }
        case 'Tank': {
            aliveHeroes.forEach(h => { h.shieldHP = (h.shieldHP || 0) + Math.floor(hero.maxHP * 0.20); });
            break;
        }
        case 'Buffer': {
            aliveHeroes.forEach(h => {
                if (!h.statusEffects) h.statusEffects = [];
                h.statusEffects = h.statusEffects.filter(e => e.type !== 'atk_up');
                h.statusEffects.push({ type: 'atk_up', duration: 3, value: 25 });
            });
            break;
        }
        case 'DPS (AoE)': {
            const dmg = Math.floor(hero.atk * 1.8);
            aliveEnemies.forEach(e => e.takeDamage(dmg));
            break;
        }
        default: {
            if (aliveEnemies.length > 0) aliveEnemies[0].takeDamage(Math.floor(hero.atk * 3.2));
        }
    }
}

// ===========================
// REWARDS
// ===========================

function _buildDungeonRewards(dungeon) {
    const mats = dungeon.rewards.materials.map(m => ({ ...m }));
    if (dungeon.rewards.bonusMaterial && Math.random() < dungeon.rewards.bonusMaterial.chance) {
        mats.push({ ...dungeon.rewards.bonusMaterial });
    }
    return { gold: dungeon.rewards.gold, materials: mats };
}

window.claimDungeonRewards = function() {
    const gs  = window.gameState;
    const run = _currentDungeonRun;
    if (!run || !run.rewards || !gs) return;

    gs.gold += run.rewards.gold;
    run.rewards.materials.forEach(m => {
        if (!gs.inventory.materials) gs.inventory.materials = {};
        gs.inventory.materials[m.id] = (gs.inventory.materials[m.id] || 0) + m.qty;
    });

    _consumeDungeonAttempt(gs, run.dungeonId);

    if (typeof gs.checkAchievements === 'function') {
        gs.checkAchievements().forEach(a => showToast(`Achievement: ${a.name}! 🏆`, 'success'));
    }

    showToast(`✨ ${run.dungeon.name} complete! +${formatNumber(run.rewards.gold)} Gold`, 'success');
    saveGame(gs);
    updateUI(gs);

    _currentDungeonRun = null;
    renderDungeons(gs);
};

window.exitDungeon = function() {
    _currentDungeonRun = null;
    renderDungeons(window.gameState);
};

// ===========================
// DAILY ATTEMPT TRACKING
// ===========================

function _consumeDungeonAttempt(gs, dungeonId) {
    if (!gs.dungeonData) gs.dungeonData = {};
    const today   = _todayStr();
    const prev    = gs.dungeonData[dungeonId];
    const curUsed = (prev && prev.date === today) ? (prev.used || 0) : 0;
    gs.dungeonData[dungeonId] = { date: today, used: curUsed + 1 };
}

function _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ===========================
// ELEMENT COLOR SCHEME
// ===========================

function _dungeonElColor(element) {
    const map = {
        Fire:  { bg: 'linear-gradient(135deg,#fff1f0,#ffe4e1)', accent: '#ef4444', glow: '#dc2626' },
        Water: { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', accent: '#3b82f6', glow: '#2563eb' },
        Wind:  { bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', accent: '#10b981', glow: '#059669' },
        Light: { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', accent: '#f59e0b', glow: '#d97706' },
        Dark:  { bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', accent: '#8b5cf6', glow: '#7c3aed' },
    };
    return map[element] || { bg: '#f8fafc', accent: '#94a3b8', glow: '#64748b' };
}
