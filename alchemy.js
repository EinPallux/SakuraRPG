/* =========================================
   SAKURA CHRONICLES - ALCHEMY LAB
   Material transmutation system
   ========================================= */

const ALCHEMY_RECIPES = [
    {
        id: 'al001', name: 'Spirit Extraction', emoji: '✨',
        duration: 600000,       // 10 min
        input: [{ id: 'm001', qty: 8 }],
        output: { id: 'm002', qty: 2 },
        desc: 'Extract spirit essence from raw iron ore.',
        waveReq: 1
    },
    {
        id: 'al002', name: 'Bone Distillation', emoji: '🦴',
        duration: 900000,       // 15 min
        input: [{ id: 'm011', qty: 8 }],
        output: { id: 'm002', qty: 3 },
        desc: 'Render spirit dust from concentrated monster bones.',
        waveReq: 1
    },
    {
        id: 'al003', name: 'Elemental Fusion', emoji: '⚗️',
        duration: 1800000,      // 30 min
        input: [{ id: 'm006', qty: 3 }, { id: 'm007', qty: 3 }],
        output: { id: 'm003', qty: 1 },
        desc: 'Fuse opposing fire and water crystals into pure mithril.',
        waveReq: 1
    },
    {
        id: 'al004', name: 'Light Distillation', emoji: '⭐',
        duration: 1200000,      // 20 min
        input: [{ id: 'm008', qty: 3 }, { id: 'm009', qty: 3 }],
        output: { id: 'm010', qty: 2 },
        desc: 'Distill dark essence from wind feathers and light shards.',
        waveReq: 5
    },
    {
        id: 'al005', name: 'Draconic Synthesis', emoji: '🐉',
        duration: 3600000,      // 1 hr
        input: [{ id: 'm002', qty: 10 }, { id: 'm003', qty: 3 }],
        output: { id: 'm005', qty: 1 },
        desc: 'Synthesize dragon scales from refined magical materials.',
        waveReq: 10
    },
    {
        id: 'al006', name: 'Star Condensation', emoji: '🌟',
        duration: 5400000,      // 1.5 hr
        input: [{ id: 'm003', qty: 6 }, { id: 'm013', qty: 4 }],
        output: { id: 'm004', qty: 1 },
        desc: 'Condense a star fragment from mithril and enhancement stones.',
        waveReq: 20
    },
    {
        id: 'al007', name: 'Core Crystallization', emoji: '💠',
        duration: 7200000,      // 2 hr
        input: [{ id: 'm004', qty: 3 }, { id: 'm005', qty: 4 }],
        output: { id: 'm012', qty: 1 },
        desc: 'Crystallize a boss core from star fragments and dragon scales.',
        waveReq: 30
    },
    {
        id: 'al008', name: 'Void Weaving', emoji: '🔮',
        duration: 14400000,     // 4 hr
        input: [{ id: 'm012', qty: 4 }, { id: 'm004', qty: 6 }],
        output: { id: 'm014', qty: 1 },
        desc: 'Weave a void crystal from boss cores and star fragments.',
        waveReq: 45
    },
];

const ALCHEMY_SLOTS = 3;

let _alchemyTimer = null;

// ===========================
// MAIN RENDER
// ===========================

function renderAlchemy(gameState) {
    const container = document.getElementById('alchemy-tab');
    if (!container) return;

    if (!gameState.alchemySlots) gameState.alchemySlots = Array(ALCHEMY_SLOTS).fill(null);

    const wave = gameState.highestWave || 0;
    const mats = gameState.inventory?.materials || {};

    const slotsHTML = gameState.alchemySlots.map((slot, i) => _buildSlot(slot, i)).join('');

    const recipesHTML = ALCHEMY_RECIPES.map(r => {
        const locked = wave < r.waveReq;
        const hasSlot = gameState.alchemySlots.some(s => s === null);
        const affordable = !locked && _canAfford(mats, r);
        const canStart = affordable && hasSlot;

        const inputTags = r.input.map(m => {
            const def = FORGE_DATABASE.materials.find(x => x.id === m.id);
            const owned = mats[m.id] || 0;
            const ok = owned >= m.qty;
            return `<span class="al-mat-tag ${ok ? 'have' : 'need'}">${def?.emoji || '?'} ${def?.name || m.id} ×${m.qty}<span class="al-mat-owned">${owned}</span></span>`;
        }).join('');

        const outDef = FORGE_DATABASE.materials.find(x => x.id === r.output.id);
        const timeStr = _fmtDuration(r.duration);

        const btnText = locked
            ? `<i class="fa-solid fa-lock mr-1"></i> Wave ${r.waveReq} Required`
            : !affordable
                ? '<i class="fa-solid fa-times mr-1"></i> Need Materials'
                : !hasSlot
                    ? '<i class="fa-solid fa-hourglass mr-1"></i> No Free Slots'
                    : '<i class="fa-solid fa-flask-vial mr-1"></i> Transmute';

        const onclick = canStart ? "startAlchemy(window.gameState, '" + r.id + "')" : '';

        return `
            <div class="al-recipe-card ${locked ? 'al-locked' : canStart ? 'al-ready' : ''}">
                <div class="al-recipe-top">
                    <div class="al-recipe-emoji">${r.emoji}</div>
                    <div class="al-recipe-info">
                        <div class="al-recipe-name">${r.name}</div>
                        <div class="al-recipe-desc">${locked ? '<i class="fa-solid fa-lock text-slate-400 mr-1"></i>Reach Wave ' + r.waveReq + ' to unlock' : r.desc}</div>
                    </div>
                    <div class="al-recipe-time"><i class="fa-solid fa-clock"></i> ${timeStr}</div>
                </div>
                ${!locked ? `
                <div class="al-recipe-mats">
                    ${inputTags}
                    <span class="al-arrow"><i class="fa-solid fa-arrow-right"></i></span>
                    <span class="al-mat-out">${outDef?.emoji || '?'} ${outDef?.name || r.output.id} ×${r.output.qty}</span>
                </div>
                <button class="al-start-btn ${canStart ? 'al-can-start' : 'al-cant-start'}" onclick="${onclick}">
                    ${btnText}
                </button>` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="animate-entry space-y-6 max-w-4xl">

            <div>
                <h2 class="text-xl font-heading font-bold text-slate-800 mb-0.5">⚗️ Alchemy Lab</h2>
                <p class="text-sm text-slate-500">Transmute lower-tier materials into rarer ones over time. ${ALCHEMY_SLOTS} concurrent slots available.</p>
            </div>

            <div>
                <div class="section-label">Active Transmutations</div>
                <div class="al-slots-row">${slotsHTML}</div>
            </div>

            <div>
                <div class="section-label">Recipes</div>
                <div class="al-recipes-grid">${recipesHTML}</div>
            </div>

        </div>
    `;

    _startAlchemyRefresh(gameState);
}

function _buildSlot(slot, index) {
    if (!slot) {
        return `
            <div class="al-slot al-slot-empty">
                <div class="al-slot-icon"><i class="fa-solid fa-flask text-slate-300 text-3xl"></i></div>
                <div class="al-slot-name text-slate-400 text-sm font-semibold mt-2">Empty Slot</div>
                <div class="text-xs text-slate-300 mt-1">Start a recipe below</div>
            </div>`;
    }

    const recipe = ALCHEMY_RECIPES.find(r => r.id === slot.recipeId);
    if (!recipe) return '';

    const elapsed = Date.now() - slot.startTime;
    const done = elapsed >= recipe.duration;
    const pct = done ? 100 : Math.min(99, Math.floor((elapsed / recipe.duration) * 100));
    const remaining = done ? 0 : recipe.duration - elapsed;
    const outDef = FORGE_DATABASE.materials.find(x => x.id === recipe.output.id);

    if (done) {
        return `
            <div class="al-slot al-slot-done">
                <div class="al-slot-icon text-3xl">${recipe.emoji}</div>
                <div class="al-slot-name">${recipe.name}</div>
                <div class="al-slot-ready">✅ Ready!</div>
                <div class="al-slot-yield">${outDef?.emoji} ${outDef?.name} ×${recipe.output.qty}</div>
                <button class="al-collect-btn" onclick="collectAlchemy(window.gameState, ${index})">
                    <i class="fa-solid fa-hand-sparkles mr-1"></i> Collect
                </button>
            </div>`;
    }

    return `
        <div class="al-slot al-slot-active">
            <div class="al-slot-icon text-3xl">${recipe.emoji}</div>
            <div class="al-slot-name">${recipe.name}</div>
            <div class="al-slot-timer">${_fmtDuration(remaining)}</div>
            <div class="al-slot-bar-track">
                <div class="al-slot-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="text-xs text-slate-400 mt-1">${pct}% complete</div>
        </div>`;
}

// ===========================
// ACTIONS
// ===========================

window.startAlchemy = function(gameState, recipeId) {
    const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    if (!gameState.alchemySlots) gameState.alchemySlots = Array(ALCHEMY_SLOTS).fill(null);

    const slotIdx = gameState.alchemySlots.findIndex(s => s === null);
    if (slotIdx === -1) { showToast('No free alchemy slots!', 'warning'); return; }

    const mats = gameState.inventory?.materials || {};
    if (!_canAfford(mats, recipe)) { showToast('Not enough materials!', 'error'); return; }

    recipe.input.forEach(m => {
        gameState.inventory.materials[m.id] = (mats[m.id] || 0) - m.qty;
    });
    gameState.alchemySlots[slotIdx] = { recipeId, startTime: Date.now() };

    saveGame(gameState);
    showToast(`Transmutation started: ${recipe.name}`, 'success');
    renderAlchemy(gameState);
};

window.collectAlchemy = function(gameState, slotIndex) {
    const slot = gameState.alchemySlots?.[slotIndex];
    if (!slot) return;

    const recipe = ALCHEMY_RECIPES.find(r => r.id === slot.recipeId);
    if (!recipe) return;

    if (Date.now() - slot.startTime < recipe.duration) {
        showToast('Transmutation not complete yet!', 'warning');
        return;
    }

    if (!gameState.inventory.materials) gameState.inventory.materials = {};
    gameState.inventory.materials[recipe.output.id] =
        (gameState.inventory.materials[recipe.output.id] || 0) + recipe.output.qty;

    gameState.alchemySlots[slotIndex] = null;

    const outDef = FORGE_DATABASE.materials.find(x => x.id === recipe.output.id);
    saveGame(gameState);
    showToast(`Collected: ${outDef?.emoji || ''} ${outDef?.name || recipe.output.id} ×${recipe.output.qty}!`, 'success');
    renderAlchemy(gameState);
};

// ===========================
// HELPERS
// ===========================

function _canAfford(mats, recipe) {
    return recipe.input.every(m => (mats[m.id] || 0) >= m.qty);
}

function _fmtDuration(ms) {
    if (ms <= 0) return 'Complete';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
}

function _startAlchemyRefresh(gameState) {
    if (_alchemyTimer) clearInterval(_alchemyTimer);
    const hasActive = gameState.alchemySlots?.some(s => s !== null && !_isSlotDone(s));
    if (!hasActive) return;

    _alchemyTimer = setInterval(() => {
        const tab = document.getElementById('alchemy-tab');
        if (!tab || tab.classList.contains('hidden')) {
            clearInterval(_alchemyTimer);
            _alchemyTimer = null;
            return;
        }
        // Refresh just the slots row without full re-render
        const slotsRow = tab.querySelector('.al-slots-row');
        if (slotsRow && gameState.alchemySlots) {
            slotsRow.innerHTML = gameState.alchemySlots.map((slot, i) => _buildSlot(slot, i)).join('');
        }
    }, 3000);
}

function _isSlotDone(slot) {
    if (!slot) return false;
    const recipe = ALCHEMY_RECIPES.find(r => r.id === slot.recipeId);
    return recipe ? (Date.now() - slot.startTime) >= recipe.duration : false;
}