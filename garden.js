/* =========================================
   SAKURA CHRONICLES - SPIRIT GARDEN v2
   Planting, Growing, Harvesting & Progression
   ========================================= */

let _selectedSeedId      = null;
let _selectedFertId      = null;
let _gardenActiveTab     = 'plots';
let _gardenIntervalId    = null;

const RARITY_COLOR = { N: '#10b981', R: '#3b82f6', SR: '#8b5cf6', SSR: '#f59e0b', UR: '#ec4899' };
const RARITY_BG    = { N: '#f0fdf4', R: '#eff6ff', SR: '#faf5ff', SSR: '#fffbeb', UR: '#fdf2f8' };
const ELEMENT_COLOR = { fire: '#ef4444', water: '#3b82f6', wind: '#10b981', light: '#f59e0b', dark: '#8b5cf6' };
const STAGE_EMOJI  = ['🌱', '🌿', '🌺', '✨'];
const STAGE_LABEL  = ['Sprouting', 'Growing', 'Blooming', 'Ready!'];

// ===========================
// MAIN RENDER
// ===========================

function renderGarden(gameState) {
    const container = document.getElementById('garden-tab');
    if (!container) return;

    if (_gardenIntervalId !== null) {
        clearInterval(_gardenIntervalId);
        _gardenIntervalId = null;
    }

    const g = gameState.garden;

    // Auto-harvest on enter if upgrade owned
    if (g.hasUpgrade('gu003')) {
        const autoHarvested = g.autoHarvest();
        autoHarvested.forEach(reward => _applyReward(gameState, reward));
        if (autoHarvested.length > 0) {
            showToast(`🤖 Auto-harvested ${autoHarvested.length} plant${autoHarvested.length > 1 ? 's' : ''}!`, 'success');
            saveGame(gameState);
        }
    }

    g.checkGrowth();

    const xpPct      = g.level >= 10 ? 100 : Math.floor((g.xp / g.xpToNextLevel) * 100);
    const waterPct   = Math.round(g.waterLevel);
    const plotsOwned = g.getUnlockedPlotCount();
    const totalReady = g.plots.filter(p => p.unlocked && p.plant?.ready).length;
    const activeCount = g.plots.filter(p => p.unlocked && p.plant && !p.plant.ready).length;

    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-5 animate-entry">

            <!-- Garden Header -->
            <div class="gdn-header">
                <div class="flex items-center gap-4">
                    <div class="gdn-icon-wrap">
                        <i class="fa-solid fa-seedling text-2xl text-green-500"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <h2 class="text-2xl font-heading font-bold text-slate-800">Spirit Garden</h2>
                            <span class="gdn-level-badge">Lv.${g.level}</span>
                            ${totalReady > 0 ? `<span class="gdn-ready-badge">${totalReady} Ready!</span>` : ''}
                        </div>
                        <p class="text-slate-500 text-sm">Grow magical plants for forge materials, teas, and rare resources.</p>
                    </div>
                </div>
                <div class="flex flex-col gap-2 min-w-[200px]">
                    <!-- XP Bar -->
                    <div>
                        <div class="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span class="font-bold">Garden XP</span>
                            <span>${g.level >= 10 ? 'MAX' : `${g.xp} / ${g.xpToNextLevel}`}</span>
                        </div>
                        <div class="gdn-xp-track">
                            <div class="gdn-xp-fill" style="width:${xpPct}%"></div>
                        </div>
                    </div>
                    <!-- Water Gauge -->
                    <div>
                        <div class="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span class="font-bold">💧 Water Supply</span>
                            <span>${waterPct}/100</span>
                        </div>
                        <div class="gdn-water-track">
                            <div class="gdn-water-fill" style="width:${waterPct}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-3 gap-3">
                <div class="gdn-stat-card">
                    <div class="text-xl font-bold text-green-600">${plotsOwned}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase">Plots</div>
                </div>
                <div class="gdn-stat-card">
                    <div class="text-xl font-bold text-indigo-500">${activeCount}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase">Growing</div>
                </div>
                <div class="gdn-stat-card">
                    <div class="text-xl font-bold text-amber-500">${g.totalHarvests}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase">Harvests</div>
                </div>
            </div>

            <!-- Tab Bar -->
            <div class="gdn-tab-bar">
                <button class="gdn-tab-btn ${_gardenActiveTab === 'plots' ? 'active' : ''}" onclick="switchGardenTab('plots')">
                    <i class="fa-solid fa-grip mr-1.5"></i>Garden Plots
                    ${totalReady > 0 ? `<span class="gdn-tab-badge">${totalReady}</span>` : ''}
                </button>
                <button class="gdn-tab-btn ${_gardenActiveTab === 'inventory' ? 'active' : ''}" onclick="switchGardenTab('inventory')">
                    <i class="fa-solid fa-bag-shopping mr-1.5"></i>Seeds & Items
                </button>
                <button class="gdn-tab-btn ${_gardenActiveTab === 'shop' ? 'active' : ''}" onclick="switchGardenTab('shop')">
                    <i class="fa-solid fa-store mr-1.5"></i>Garden Shop
                </button>
            </div>

            <!-- Tab Content -->
            <div id="gdn-content"></div>
        </div>
    `;

    _renderGardenContent(gameState);
    _startGardenTimer(gameState);
}

window.switchGardenTab = function(tab) {
    _gardenActiveTab = tab;
    document.querySelectorAll('.gdn-tab-btn').forEach(b => b.classList.remove('active'));
    const idx = { plots: 0, inventory: 1, shop: 2 }[tab];
    document.querySelectorAll('.gdn-tab-btn')[idx]?.classList.add('active');
    _renderGardenContent(window.gameState);
};

function _renderGardenContent(gameState) {
    const el = document.getElementById('gdn-content');
    if (!el) return;
    switch (_gardenActiveTab) {
        case 'plots':     el.innerHTML = _buildPlotsTab(gameState);     break;
        case 'inventory': el.innerHTML = _buildInventoryTab(gameState); break;
        case 'shop':      el.innerHTML = _buildShopTab(gameState);      break;
    }
}

// ===========================
// PLOTS TAB
// ===========================

function _buildPlotsTab(gameState) {
    const g = gameState.garden;
    const hasFert = Object.values(g.fertilizers).some(v => v > 0);
    const hasSeeds = Object.keys(gameState.inventory.seeds || {}).some(k => (gameState.inventory.seeds[k] || 0) > 0);
    const anyReady = g.plots.some(p => p.unlocked && p.plant?.ready);
    const anyWaterable = g.plots.some(p => p.unlocked && p.plant && !p.plant.ready && !p.plant.watered && g.waterLevel >= 10);

    // Mode hint
    let modeHint = '';
    if (_selectedSeedId) {
        const sd = GARDEN_DATABASE.seeds.find(s => s.id === _selectedSeedId);
        modeHint = `<div class="gdn-mode-hint seed-mode"><i class="fa-solid fa-seedling mr-1.5"></i>Planting: <strong>${sd?.name}</strong> — tap an empty plot</div>`;
    } else if (_selectedFertId) {
        const fd = GARDEN_DATABASE.fertilizers.find(f => f.id === _selectedFertId);
        modeHint = `<div class="gdn-mode-hint fert-mode"><i class="fa-solid fa-flask mr-1.5"></i>Applying: <strong>${fd?.name}</strong> — tap a growing plot</div>`;
    } else if (!hasSeeds && !anyReady) {
        modeHint = `<div class="gdn-mode-hint"><i class="fa-solid fa-info-circle mr-1.5"></i>Win battles to find seeds, then visit the <strong>Seeds & Items</strong> tab to select one.</div>`;
    }

    const plotCards = g.plots.map(plot => _buildPlotCard(plot, g, gameState.highestWave)).join('');

    return `
        <div class="space-y-4">
            ${modeHint}

            <!-- Actions -->
            <div class="flex flex-wrap gap-2">
                ${anyReady ? `
                    <button class="gdn-action-btn harvest" onclick="gardenCollectAll()">
                        <i class="fa-solid fa-basket-shopping mr-1.5"></i>Collect All Ready
                    </button>
                ` : ''}
                ${anyWaterable ? `
                    <button class="gdn-action-btn water" onclick="gardenWaterAll()">
                        <i class="fa-solid fa-droplet mr-1.5"></i>Water All (${g.waterLevel >= 10 ? 'Available' : 'No Water'})
                    </button>
                ` : ''}
                ${_selectedSeedId || _selectedFertId ? `
                    <button class="gdn-action-btn cancel" onclick="gardenClearSelection()">
                        <i class="fa-solid fa-xmark mr-1.5"></i>Cancel Selection
                    </button>
                ` : ''}
            </div>

            <!-- Plot Grid -->
            <div class="gdn-plot-grid">
                ${plotCards}
            </div>

            <!-- Upgrade badges -->
            ${g.purchasedUpgrades.length > 0 ? `
                <div class="flex flex-wrap gap-2 mt-2">
                    ${g.purchasedUpgrades.map(uid => {
                        const u = GARDEN_DATABASE.upgrades.find(x => x.id === uid);
                        return u ? `<span class="gdn-upgrade-badge">${u.emoji} ${u.name}</span>` : '';
                    }).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function _buildPlotCard(plot, garden, highestWave) {
    if (!plot.unlocked) {
        const cost = GARDEN_DATABASE.plotUnlockCosts[plot.id];
        const maxPlots = garden.hasUpgrade('gu005') ? 12 : 10;
        if (plot.id >= maxPlots) {
            return `
                <div class="gdn-plot locked greenhouse-locked">
                    <div class="text-2xl opacity-20">🏡</div>
                    <div class="text-[10px] text-slate-400 font-bold mt-1 text-center">Greenhouse<br>Required</div>
                </div>
            `;
        }
        return `
            <div class="gdn-plot locked" onclick="gardenUnlockPlot(${plot.id})">
                <i class="fa-solid fa-lock text-xl text-slate-300 mb-1"></i>
                <div class="text-[10px] text-slate-400 font-bold text-center">${cost ? `${formatNumber(cost)}g` : 'Locked'}</div>
            </div>
        `;
    }

    if (!plot.plant) {
        const clickable = !!_selectedSeedId;
        return `
            <div class="gdn-plot empty ${clickable ? 'plantable' : ''}" onclick="gardenPlotClick(${plot.id})">
                <div class="text-3xl text-slate-200 mb-1">${clickable ? '🌱' : '+'}</div>
                <div class="text-[10px] text-slate-400 font-bold">${clickable ? 'Plant here' : 'Empty'}</div>
            </div>
        `;
    }

    const seedDef = GARDEN_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
    if (!seedDef) return '';

    const { stage, watered, fertilizerId, ready } = plot.plant;
    const elapsed  = Date.now() - plot.plant.plantedAt;
    const pct      = ready ? 100 : Math.min(99, Math.floor((elapsed / plot.plant.growthTime) * 100));
    const remaining = ready ? 0 : Math.max(0, plot.plant.growthTime - elapsed);
    const rc       = RARITY_COLOR[seedDef.rarity] || '#94a3b8';
    const elColor  = seedDef.element ? ELEMENT_COLOR[seedDef.element] : null;
    const fertDef  = fertilizerId ? GARDEN_DATABASE.fertilizers.find(f => f.id === fertilizerId) : null;
    const canFert  = !ready && !fertilizerId && _selectedFertId && Object.values(garden.fertilizers).some(v => v > 0);
    const canWater = !ready && !watered && !_selectedSeedId && !_selectedFertId && garden.waterLevel >= 10;

    if (ready) {
        return `
            <div class="gdn-plot ready ${seedDef.element ? 'elemental-glow' : ''}"
                 style="${elColor ? `--el-color:${elColor};` : ''}"
                 onclick="gardenHarvestPlot(${plot.id})">
                <div class="text-3xl animate-bounce mb-1">${seedDef.emoji}</div>
                <div class="text-[10px] font-bold text-amber-600 uppercase">${seedDef.name}</div>
                <div class="gdn-ready-shine">✨ Tap to Harvest</div>
                ${watered ? '<div class="gdn-plot-badge water-badge">💧</div>' : ''}
                ${fertDef ? `<div class="gdn-plot-badge fert-badge">${fertDef.emoji}</div>` : ''}
            </div>
        `;
    }

    return `
        <div class="gdn-plot growing ${seedDef.element ? 'has-element' : ''} ${canWater ? 'waterable' : ''} ${canFert ? 'fertilizable' : ''}"
             style="${elColor ? `--el-color:${elColor};` : ''}"
             onclick="gardenPlotClick(${plot.id})">
            <div class="text-2xl mb-1">${STAGE_EMOJI[stage]}</div>
            <div class="text-[10px] font-bold text-slate-600 truncate w-full text-center">${seedDef.name}</div>
            <div class="gdn-progress-track mt-1.5 mb-1">
                <div class="gdn-progress-fill" style="width:${pct}%;background:${rc};"></div>
            </div>
            <div class="text-[9px] text-slate-400 font-mono" id="gdn-timer-${plot.id}">${_fmtGardenTime(remaining)}</div>
            <div class="flex gap-1 mt-1">
                ${watered ? '<span class="gdn-pip water">💧</span>' : (canWater ? '<span class="gdn-pip water-hint">💧?</span>' : '')}
                ${fertDef ? `<span class="gdn-pip fert">${fertDef.emoji}</span>` : (canFert ? '<span class="gdn-pip fert-hint">+?</span>' : '')}
            </div>
        </div>
    `;
}

// ===========================
// INVENTORY TAB
// ===========================

function _buildInventoryTab(gameState) {
    const seeds     = gameState.inventory.seeds || {};
    const wave      = gameState.highestWave || 0;
    const garden    = gameState.garden;

    // Seeds grid (all seeds in database, show owned count or 0)
    const seedGroups = {};
    GARDEN_DATABASE.seeds.forEach(s => {
        const r = s.rarity;
        if (!seedGroups[r]) seedGroups[r] = [];
        seedGroups[r].push(s);
    });

    let seedsHTML = '';
    for (const rarity of ['N', 'R', 'SR', 'SSR', 'UR']) {
        const group = seedGroups[rarity];
        if (!group) continue;
        const rc = RARITY_COLOR[rarity];
        seedsHTML += `
            <div class="mb-4">
                <div class="gdn-rarity-divider" style="--rc:${rc};">${rarity === 'N' ? 'Common' : rarity === 'R' ? 'Rare' : rarity === 'SR' ? 'Super Rare' : rarity === 'SSR' ? 'SSR' : 'Ultra Rare'}</div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    ${group.map(s => {
                        const qty     = seeds[s.id] || 0;
                        const locked  = s.waveReq > wave;
                        const selected = _selectedSeedId === s.id;
                        const hasStock = qty > 0;
                        const elC     = s.element ? ELEMENT_COLOR[s.element] : rc;
                        const rewardLabel = _rewardLabel(s.reward);

                        return `
                            <div class="gdn-seed-card ${locked ? 'locked' : ''} ${selected ? 'selected' : ''} ${hasStock ? 'has-stock' : ''}"
                                 style="--rc:${elC};"
                                 onclick="${locked ? '' : `gardenSelectSeed('${s.id}')`}">
                                <div class="gdn-seed-emoji">${s.emoji}</div>
                                <div class="gdn-seed-info">
                                    <div class="gdn-seed-name">${s.name}</div>
                                    <div class="gdn-seed-yield">${rewardLabel}</div>
                                    <div class="gdn-seed-time">${_fmtGardenTime(s.growthTime)}</div>
                                </div>
                                ${locked
                                    ? `<div class="gdn-seed-lock"><i class="fa-solid fa-lock"></i> Wave ${s.waveReq}</div>`
                                    : `<div class="gdn-seed-qty ${hasStock ? 'has' : 'empty'}">${qty > 0 ? `×${qty}` : '0'}</div>`
                                }
                                ${s.waterBonus ? '<div class="gdn-water-hint-tag">💧+1</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Fertilizers
    const fertHTML = GARDEN_DATABASE.fertilizers.map(f => {
        const owned = garden.fertilizers[f.id] || 0;
        const selected = _selectedFertId === f.id;
        const rc = RARITY_COLOR[f.rarity];
        return `
            <div class="gdn-fert-card ${selected ? 'selected' : ''} ${owned > 0 ? 'has-stock' : ''}"
                 style="--rc:${rc};"
                 onclick="gardenSelectFert('${f.id}')">
                <div class="text-2xl">${f.emoji}</div>
                <div class="flex-1">
                    <div class="font-bold text-sm text-slate-700">${f.name}</div>
                    <div class="text-[10px] text-slate-400">${f.desc}</div>
                </div>
                <div class="gdn-seed-qty ${owned > 0 ? 'has' : 'empty'}">×${owned}</div>
            </div>
        `;
    }).join('');

    // Teas
    const teas = gameState.inventory.teas || {};
    const ownedTeas = GARDEN_DATABASE.teas.filter(t => (teas[t.id] || 0) > 0);
    const teasHTML = ownedTeas.length === 0
        ? `<div class="text-slate-400 text-sm text-center py-4">No teas brewed yet. Harvest Sakura Herb, Spirit Grass, Iron Fern, or Moon Bloom plants.</div>`
        : ownedTeas.map(t => `
            <div class="gdn-tea-card">
                <div class="text-2xl">${t.emoji}</div>
                <div class="flex-1">
                    <div class="font-bold text-sm text-slate-700">${t.name}</div>
                    <div class="text-[10px] text-slate-400">${t.desc}</div>
                </div>
                <div class="gdn-seed-qty has">×${teas[t.id]}</div>
            </div>
        `).join('');

    return `
        <div class="space-y-6">
            <div>
                <div class="section-label mb-3">🌱 Seeds — Tap to Select for Planting</div>
                ${seedsHTML}
            </div>

            <div>
                <div class="section-label mb-3">🌾 Fertilizers</div>
                ${garden.fertilizers && Object.keys(garden.fertilizers).length > 0 || true ? `
                    <div class="space-y-2">${fertHTML}</div>
                ` : `<div class="text-slate-400 text-sm">No fertilizers. Buy them from the Garden Shop.</div>`}
                <div class="mt-2 text-[11px] text-slate-400">
                    <i class="fa-solid fa-circle-info mr-1"></i>
                    Select a fertilizer then tap a <em>growing</em> plot to apply it.
                </div>
            </div>

            <div>
                <div class="section-label mb-3">🍵 Brewed Teas</div>
                <div class="space-y-2">${teasHTML}</div>
                ${ownedTeas.length > 0 ? `<div class="mt-2 text-[11px] text-slate-400"><i class="fa-solid fa-circle-info mr-1"></i>Use teas from the Battle screen before starting a wave.</div>` : ''}
            </div>
        </div>
    `;
}

// ===========================
// SHOP TAB
// ===========================

function _buildShopTab(gameState) {
    const g = gameState.garden;
    const gold = gameState.gold;

    // Plot unlock
    const nextUnlockCost = g.getNextUnlockCost();
    const maxPlots = g.hasUpgrade('gu005') ? 12 : 10;
    const plotSection = nextUnlockCost !== null ? `
        <div class="gdn-shop-card unlock-card">
            <div class="text-3xl">🌿</div>
            <div class="flex-1">
                <div class="font-bold text-slate-800">Unlock New Plot</div>
                <div class="text-sm text-slate-500">Plot ${g.getUnlockedPlotCount() + 1} of ${maxPlots} — grow more plants at once!</div>
            </div>
            <button class="gdn-buy-btn ${gold >= nextUnlockCost ? '' : 'disabled'}"
                    onclick="gardenUnlockNext()"
                    ${gold < nextUnlockCost ? 'disabled' : ''}>
                💰 ${formatNumber(nextUnlockCost)}g
            </button>
        </div>
    ` : `
        <div class="gdn-shop-card">
            <div class="text-3xl">🌿</div>
            <div class="flex-1">
                <div class="font-bold text-slate-800">All Plots Unlocked!</div>
                <div class="text-sm text-slate-500">${g.getUnlockedPlotCount()} plots available.</div>
            </div>
        </div>
    `;

    // Fertilizers
    const fertCards = GARDEN_DATABASE.fertilizers.map(f => {
        const rc = RARITY_COLOR[f.rarity];
        const owned = g.fertilizers[f.id] || 0;
        const canBuy = gold >= f.cost;
        return `
            <div class="gdn-shop-card">
                <div class="text-3xl">${f.emoji}</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800">${f.name}</span>
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style="background:${RARITY_BG[f.rarity]};color:${rc};">${f.rarity}</span>
                        ${owned > 0 ? `<span class="text-[10px] bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded-full">×${owned} owned</span>` : ''}
                    </div>
                    <div class="text-sm text-slate-500 mt-0.5">${f.desc}</div>
                </div>
                <button class="gdn-buy-btn ${canBuy ? '' : 'disabled'}"
                        onclick="gardenBuyFert('${f.id}')"
                        ${!canBuy ? 'disabled' : ''}>
                    💰 ${formatNumber(f.cost)}g
                </button>
            </div>
        `;
    }).join('');

    // Upgrades
    const upgradeCards = GARDEN_DATABASE.upgrades.map(u => {
        const owned = g.hasUpgrade(u.id);
        const canBuy = !owned && gold >= u.cost;
        const lockedByGreenhouse = u.id === 'gu005' && g.getUnlockedPlotCount() < 10;
        return `
            <div class="gdn-shop-card ${owned ? 'owned' : ''}">
                <div class="text-3xl">${u.emoji}</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="font-bold text-slate-800">${u.name}</span>
                        ${owned ? '<span class="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">✓ Owned</span>' : ''}
                    </div>
                    <div class="text-sm text-slate-500">${u.desc}</div>
                </div>
                ${owned
                    ? '<div class="text-green-500 text-lg font-bold">✓</div>'
                    : `<button class="gdn-buy-btn ${canBuy && !lockedByGreenhouse ? '' : 'disabled'}"
                               onclick="gardenBuyUpgrade('${u.id}')"
                               ${(!canBuy || lockedByGreenhouse) ? 'disabled' : ''}>
                           💰 ${formatNumber(u.cost)}g
                       </button>`
                }
            </div>
        `;
    }).join('');

    return `
        <div class="space-y-5">
            <div>
                <div class="section-label mb-3">🌿 Plot Unlocks</div>
                ${plotSection}
            </div>

            <div>
                <div class="section-label mb-3">🌾 Fertilizers</div>
                <div class="space-y-2">${fertCards}</div>
            </div>

            <div>
                <div class="section-label mb-3">⚙️ Garden Upgrades</div>
                <div class="space-y-2">${upgradeCards}</div>
            </div>
        </div>
    `;
}

// ===========================
// ACTIONS (window-exposed)
// ===========================

window.gardenSelectSeed = function(seedId) {
    const qty = (window.gameState?.inventory.seeds || {})[seedId] || 0;
    if (qty <= 0) { showToast('No seeds of that type!', 'warning'); return; }
    _selectedSeedId = _selectedSeedId === seedId ? null : seedId;
    _selectedFertId = null;
    _renderGardenContent(window.gameState);
    if (_selectedSeedId) switchGardenTab('plots');
};

window.gardenSelectFert = function(fertId) {
    const owned = window.gameState?.garden.fertilizers[fertId] || 0;
    if (owned <= 0) { showToast('No fertilizer of that type!', 'warning'); return; }
    _selectedFertId = _selectedFertId === fertId ? null : fertId;
    _selectedSeedId = null;
    _renderGardenContent(window.gameState);
    if (_selectedFertId) switchGardenTab('plots');
};

window.gardenClearSelection = function() {
    _selectedSeedId = null;
    _selectedFertId = null;
    _renderGardenContent(window.gameState);
};

window.gardenPlotClick = function(plotId) {
    const gs = window.gameState;
    if (!gs) return;
    const g = gs.garden;
    const plot = g.plots.find(p => p.id === plotId);
    if (!plot || !plot.unlocked) return;

    if (!plot.plant) {
        // Plant a seed
        if (!_selectedSeedId) { showToast('Select a seed from the Seeds & Items tab first!', 'info'); return; }
        const wave = gs.highestWave || 0;
        if (!g.plantSeed(plotId, _selectedSeedId, wave)) {
            const sd = GARDEN_DATABASE.seeds.find(s => s.id === _selectedSeedId);
            if (sd && sd.waveReq > wave) {
                showToast(`Reach Wave ${sd.waveReq} to plant ${sd.name}!`, 'warning');
            } else {
                showToast('Cannot plant here!', 'error');
            }
            return;
        }
        gs.removeItem('seeds', _selectedSeedId, 1);
        const seedDef = GARDEN_DATABASE.seeds.find(s => s.id === _selectedSeedId);
        showToast(`${seedDef?.emoji || '🌱'} ${seedDef?.name || 'Seed'} planted!`, 'success');
        if ((gs.getItemCount('seeds', _selectedSeedId) || 0) <= 0) _selectedSeedId = null;
        saveGame(gs);
        _renderGardenContent(gs);

    } else if (plot.plant && !plot.plant.ready) {
        // Fertilize or water
        if (_selectedFertId) {
            if (plot.plant.fertilizerId) { showToast('Already fertilized!', 'warning'); return; }
            if (!g.fertilizePlot(plotId, _selectedFertId)) { showToast('Cannot fertilize this plot!', 'error'); return; }
            const fd = GARDEN_DATABASE.fertilizers.find(f => f.id === _selectedFertId);
            showToast(`${fd?.emoji} ${fd?.name} applied!`, 'success');
            if ((g.fertilizers[_selectedFertId] || 0) <= 0) _selectedFertId = null;
            saveGame(gs);
            _renderGardenContent(gs);
        } else if (!plot.plant.watered) {
            if (g.waterLevel < 10) { showToast('Not enough water! Water refills naturally over time.', 'warning'); return; }
            if (g.waterPlant(plotId)) {
                const seedDef = GARDEN_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
                const msg = seedDef?.waterBonus ? '💧 Watered! This plant gains +1 bonus yield.' : '💧 Watered!';
                showToast(msg, 'success');
                saveGame(gs);
                _renderGardenContent(gs);
            }
        }
    }
};

window.gardenHarvestPlot = function(plotId) {
    const gs = window.gameState;
    if (!gs) return;
    const reward = gs.garden.harvest(plotId);
    if (!reward) return;
    _applyReward(gs, reward);
    const rewardStr = _rewardToast(reward);
    showToast(`✨ Harvested: ${rewardStr}`, 'success');
    gs.updateQuest('harvest', 1);
    if (typeof gs.checkAchievements === 'function') {
        gs.checkAchievements().forEach(a => showToast(`Achievement: ${a.name}! 🏆`, 'success'));
    }
    saveGame(gs);
    updateUI(gs);
    _renderGardenContent(gs);
    // Refresh header stats
    renderGarden(gs);
};

window.gardenCollectAll = function() {
    const gs = window.gameState;
    if (!gs) return;
    const plots = gs.garden.plots.filter(p => p.unlocked && p.plant?.ready);
    if (plots.length === 0) return;
    plots.forEach(p => {
        const reward = gs.garden.harvest(p.id);
        if (reward) {
            _applyReward(gs, reward);
            gs.updateQuest('harvest', 1);
        }
    });
    showToast(`✨ Collected ${plots.length} plant${plots.length > 1 ? 's' : ''}!`, 'success');
    if (typeof gs.checkAchievements === 'function') {
        gs.checkAchievements().forEach(a => showToast(`Achievement: ${a.name}! 🏆`, 'success'));
    }
    saveGame(gs);
    updateUI(gs);
    renderGarden(gs);
};

window.gardenWaterAll = function() {
    const gs = window.gameState;
    if (!gs) return;
    const count = gs.garden.waterAll();
    if (count > 0) {
        showToast(`💧 Watered ${count} plant${count > 1 ? 's' : ''}!`, 'success');
        saveGame(gs);
        _renderGardenContent(gs);
    } else {
        showToast('Nothing to water or not enough water supply!', 'warning');
    }
};

window.gardenUnlockPlot = function(plotId) {
    const gs = window.gameState;
    if (!gs) return;
    const cost = GARDEN_DATABASE.plotUnlockCosts[plotId];
    if (cost === undefined) return;
    if (gs.gold < cost) { showToast(`Need ${formatNumber(cost)} gold to unlock this plot!`, 'error'); return; }
    gs.gold -= cost;
    gs.garden.unlockPlot(plotId);
    showToast('🌿 New plot unlocked!', 'success');
    saveGame(gs);
    updateUI(gs);
    renderGarden(gs);
};

window.gardenUnlockNext = function() {
    const gs = window.gameState;
    if (!gs) return;
    const cost = gs.garden.getNextUnlockCost();
    if (cost === null) { showToast('All plots unlocked!', 'info'); return; }
    if (gs.gold < cost) { showToast(`Need ${formatNumber(cost)} gold!`, 'error'); return; }
    const nextLocked = gs.garden.plots.find(p => !p.unlocked);
    if (!nextLocked) return;
    gs.gold -= cost;
    gs.garden.unlockPlot(nextLocked.id);
    showToast('🌿 New garden plot unlocked!', 'success');
    saveGame(gs);
    updateUI(gs);
    renderGarden(gs);
};

window.gardenBuyFert = function(fertId) {
    const gs = window.gameState;
    if (!gs) return;
    const result = gs.garden.buyFertilizer(fertId, gs.gold);
    if (!result.success) {
        showToast(result.reason === 'no_gold' ? 'Not enough Gold!' : 'Invalid fertilizer!', 'error');
        return;
    }
    gs.gold -= result.cost;
    const fd = GARDEN_DATABASE.fertilizers.find(f => f.id === fertId);
    showToast(`${fd?.emoji} ${fd?.name} purchased!`, 'success');
    saveGame(gs);
    updateUI(gs);
    _renderGardenContent(gs);
};

window.gardenBuyUpgrade = function(upgradeId) {
    const gs = window.gameState;
    if (!gs) return;
    const result = gs.garden.purchaseUpgrade(upgradeId, gs.gold);
    if (!result.success) {
        if (result.reason === 'already_owned') { showToast('Already owned!', 'warning'); return; }
        showToast('Not enough Gold!', 'error');
        return;
    }
    gs.gold -= result.cost;
    const ud = GARDEN_DATABASE.upgrades.find(u => u.id === upgradeId);
    showToast(`${ud?.emoji} ${ud?.name} purchased!`, 'success');
    saveGame(gs);
    updateUI(gs);
    renderGarden(gs);
};

// ===========================
// HELPERS
// ===========================

function _applyReward(gameState, reward) {
    switch (reward.type) {
        case 'tea':      gameState.addItem('teas', reward.id, reward.qty);      break;
        case 'material': gameState.addItem('materials', reward.id, reward.qty); break;
        case 'gold':     gameState.gold += reward.qty;                          break;
        case 'petals':   gameState.petals += reward.qty;                        break;
        case 'orbs':     gameState.spiritOrbs += reward.qty;                    break;
    }
}

function _rewardToast(reward) {
    switch (reward.type) {
        case 'tea': {
            const t = GARDEN_DATABASE.teas.find(x => x.id === reward.id);
            return `${t?.emoji || '🍵'} ${t?.name || 'Tea'} ×${reward.qty}`;
        }
        case 'material': {
            const m = FORGE_DATABASE.materials.find(x => x.id === reward.id);
            return `${m?.emoji || '📦'} ${m?.name || reward.id} ×${reward.qty}`;
        }
        case 'gold':   return `💰 ${formatNumber(reward.qty)} Gold`;
        case 'petals': return `🌸 ${reward.qty} Petals`;
        case 'orbs':   return `🔮 ${reward.qty} Spirit Orb${reward.qty > 1 ? 's' : ''}`;
        default:       return `×${reward.qty}`;
    }
}

function _rewardLabel(reward) {
    switch (reward.type) {
        case 'tea': {
            const t = GARDEN_DATABASE.teas.find(x => x.id === reward.id);
            return `${t?.emoji || '🍵'} ${t?.name || 'Tea'}`;
        }
        case 'material': {
            const m = FORGE_DATABASE.materials.find(x => x.id === reward.id);
            return `${m?.emoji || '📦'} ${m?.name || reward.id}`;
        }
        case 'gold':   return `💰 Gold ×${reward.qty}`;
        case 'petals': return `🌸 Petals ×${reward.qty}`;
        case 'orbs':   return `🔮 Spirit Orb`;
        default:       return `×${reward.qty}`;
    }
}

function _fmtGardenTime(ms) {
    if (ms <= 0) return 'Done';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sc = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sc}s`;
    return `${sc}s`;
}

// ===========================
// GROWTH TIMER
// ===========================

function _startGardenTimer(gameState) {
    if (_gardenIntervalId) clearInterval(_gardenIntervalId);
    const hasActive = gameState.garden.plots.some(p => p.unlocked && p.plant && !p.plant.ready);
    if (!hasActive) return;

    _gardenIntervalId = setInterval(() => {
        const tab = document.getElementById('garden-tab');
        if (!tab || tab.classList.contains('hidden')) {
            clearInterval(_gardenIntervalId);
            _gardenIntervalId = null;
            return;
        }

        const changed = gameState.garden.checkGrowth();
        if (changed) {
            showToast('🌺 A plant is ready to harvest!', 'success');
            _renderGardenContent(gameState);
            // Refresh header badge
            const readyBadge = document.querySelector('.gdn-ready-badge');
            const totalReady = gameState.garden.plots.filter(p => p.unlocked && p.plant?.ready).length;
            if (readyBadge) readyBadge.textContent = totalReady > 0 ? `${totalReady} Ready!` : '';
        } else {
            // Update timers in-place without full re-render
            const now = Date.now();
            gameState.garden.plots.forEach(p => {
                if (!p.unlocked || !p.plant || p.plant.ready) return;
                const el = document.getElementById(`gdn-timer-${p.id}`);
                if (!el) return;
                const remaining = Math.max(0, p.plant.growthTime - (now - p.plant.plantedAt));
                el.textContent = _fmtGardenTime(remaining);
            });
        }
    }, 1000);
}
