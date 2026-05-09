/* =========================================
   SAKURA CHRONICLES - FORGE SYSTEM v2
   Crafting, Materials, Equipment Management
   ========================================= */

let _forgeActiveTab = 'craft';

// ===========================
// RENDER FORGE VIEW
// ===========================

function renderForge(gameState) {
    const container = document.getElementById('forge-tab');
    if (!container) return;

    const matCount  = Object.values(gameState.inventory.materials || {}).reduce((s, n) => s + n, 0);
    const equipOwned = Object.values(gameState.inventory.equipment || {}).reduce((s, n) => s + n, 0);

    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-5 animate-entry">

            <!-- Header -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200">
                        <i class="fa-solid fa-hammer"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">The Forge</h2>
                        <p class="text-slate-500 text-sm">Craft and upgrade powerful equipment from battle spoils.</p>
                    </div>
                </div>
                <div class="flex gap-4 text-center">
                    <div class="bg-slate-50 rounded-xl px-5 py-2.5">
                        <div class="text-xl font-bold text-indigo-500">${matCount}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Materials</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl px-5 py-2.5">
                        <div class="text-xl font-bold text-violet-500">${equipOwned}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Equipment</div>
                    </div>
                </div>
            </div>

            <!-- Tab bar -->
            <div class="forge-tab-bar">
                <button class="forge-tab-btn ${_forgeActiveTab === 'craft' ? 'active' : ''}"
                        onclick="switchForgeTab('craft')">
                    <i class="fa-solid fa-hammer mr-1"></i> Craft
                </button>
                <button class="forge-tab-btn ${_forgeActiveTab === 'materials' ? 'active' : ''}"
                        onclick="switchForgeTab('materials')">
                    <i class="fa-solid fa-cubes mr-1"></i> Materials
                </button>
                <button class="forge-tab-btn ${_forgeActiveTab === 'owned' ? 'active' : ''}"
                        onclick="switchForgeTab('owned')">
                    <i class="fa-solid fa-box-open mr-1"></i> Owned Equipment
                </button>
            </div>

            <!-- Tab content -->
            <div id="forge-tab-content"></div>
        </div>
    `;

    renderForgeTabContent(gameState);
}

window.switchForgeTab = function(tab) {
    _forgeActiveTab = tab;
    document.querySelectorAll('.forge-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.forge-tab-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tab === 'craft' ? 'craft' : tab === 'materials' ? 'material' : 'owned')) {
            btn.classList.add('active');
        }
    });
    renderForgeTabContent(window.gameState);
};

function renderForgeTabContent(gameState) {
    const content = document.getElementById('forge-tab-content');
    if (!content) return;

    switch (_forgeActiveTab) {
        case 'craft':     content.innerHTML = _buildCraftTab(gameState);     break;
        case 'materials': content.innerHTML = _buildMaterialsTab(gameState); break;
        case 'owned':     content.innerHTML = _buildOwnedTab(gameState);     break;
    }
}

// ===========================
// CRAFT TAB
// ===========================

function _buildCraftTab(gameState) {
    const rarityColors = { N: '#10b981', R: '#3b82f6', SR: '#8b5cf6', SSR: '#f59e0b', UR: '#ec4899' };
    const rarityBg     = { N: '#f0fdf4', R: '#eff6ff', SR: '#faf5ff', SSR: '#fffbeb', UR: '#fdf2f8' };

    const cards = FORGE_DATABASE.recipes.map(recipe => {
        const resultItem = _findEquipById(recipe.resultId);
        const rarity     = resultItem?.rarity || 'N';
        const rc         = rarityColors[rarity] || '#94a3b8';
        const rbg        = rarityBg[rarity]     || '#f8fafc';
        const emoji      = resultItem?.emoji    || _slotEmoji(resultItem?.slot || '');
        const ownedCount = gameState.inventory.equipment?.[recipe.resultId] || 0;

        let canCraft = gameState.gold >= recipe.cost;
        let matRows  = '';
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            const matData = FORGE_DATABASE.materials.find(m => m.id === matId);
            const owned   = gameState.inventory.materials?.[matId] || 0;
            if (owned < qty) canCraft = false;
            const cls = owned >= qty ? 'have' : 'need';
            matRows += `<span class="forge-mat-tag ${cls}">${matData?.emoji || '📦'} ${matData?.name || matId} ${owned}/${qty}</span>`;
        }

        const goldOk = gameState.gold >= recipe.cost;

        return `
            <div class="forge-recipe-card">
                <div class="forge-rarity-bar forge-rarity-${rarity}"></div>
                <div class="forge-recipe-header" style="background:${rbg};">
                    <div class="forge-recipe-icon" style="background:white; border:1.5px solid ${rc}22;">
                        ${emoji}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-bold text-slate-800 truncate">${resultItem?.name || recipe.name}</h4>
                            ${ownedCount > 0 ? `<span class="text-[10px] bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">×${ownedCount} owned</span>` : ''}
                        </div>
                        <div class="text-xs font-bold capitalize mt-0.5" style="color:${rc};">${rarity} · ${resultItem?.slot || 'equipment'}</div>
                        ${resultItem?.stats ? `<div class="text-[10px] text-slate-500 mt-0.5">${_formatEquipStats(resultItem.stats)}</div>` : ''}
                    </div>
                </div>

                <div class="px-4 py-3">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Materials Required</div>
                    <div class="flex flex-wrap gap-1.5 mb-3">${matRows}</div>

                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-slate-500">Gold Cost</span>
                        <span class="font-bold ${goldOk ? 'text-yellow-600' : 'text-red-500'}">
                            💰 ${formatNumber(recipe.cost)}
                        </span>
                    </div>
                </div>

                <button class="forge-craft-btn ${canCraft ? 'craftable' : 'not-craftable'}"
                        id="forge-btn-${recipe.id}"
                        onclick="${canCraft ? `craftItem('${recipe.id}', this)` : ''}"
                        ${!canCraft ? 'disabled' : ''}>
                    ${canCraft ? '<i class="fa-solid fa-hammer mr-2"></i> Craft' : '<i class="fa-solid fa-lock mr-2"></i> Missing Resources'}
                </button>
            </div>
        `;
    }).join('');

    return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>`;
}

// ===========================
// MATERIALS TAB
// ===========================

function _buildMaterialsTab(gameState) {
    const userMats   = gameState.inventory.materials || {};
    const rarityColor = { N: '#10b981', R: '#3b82f6', SR: '#8b5cf6', SSR: '#f59e0b', UR: '#ec4899' };
    const rarityLabel = { N: 'Common', R: 'Rare', SR: 'Super Rare', SSR: 'SSR', UR: 'Ultra Rare' };

    // Group by rarity
    const groups = { N: [], R: [], SR: [], SSR: [], UR: [] };
    FORGE_DATABASE.materials.forEach(mat => {
        const r = mat.rarity || 'N';
        if (groups[r]) groups[r].push(mat);
    });

    let html = '<div class="space-y-6">';
    for (const [rarity, mats] of Object.entries(groups)) {
        if (mats.length === 0) continue;
        const rc = rarityColor[rarity];
        html += `
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <div class="h-0.5 flex-1" style="background:${rc};opacity:0.3;"></div>
                    <span class="text-xs font-bold uppercase tracking-wider" style="color:${rc};">${rarityLabel[rarity]}</span>
                    <div class="h-0.5 flex-1" style="background:${rc};opacity:0.3;"></div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        `;
        mats.forEach(mat => {
            const count   = userMats[mat.id] || 0;
            const hasSome = count > 0;
            html += `
                <div class="material-card ${hasSome ? 'has-stock' : ''}">
                    <div class="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
                        ${mat.emoji || '📦'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-bold text-slate-700 truncate">${mat.name}</div>
                        <div class="text-[10px] text-slate-400 leading-tight">${mat.desc}</div>
                    </div>
                    <div class="font-mono font-bold text-sm ml-1 ${hasSome ? '' : 'text-slate-300'}"
                         style="${hasSome ? `color:${rc};` : ''}">
                        ×${count}
                    </div>
                </div>
            `;
        });
        html += '</div></div>';
    }
    html += '</div>';

    // Add hint about dropping
    html += `
        <div class="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <i class="fa-solid fa-circle-info mr-2"></i>
            Materials drop from enemies during battle. Higher waves drop rarer materials. Boss waves guarantee Boss Cores and Star Fragments.
        </div>
    `;

    return html;
}

// ===========================
// OWNED EQUIPMENT TAB
// ===========================

function _buildOwnedTab(gameState) {
    const owned    = gameState.inventory.equipment || {};
    const allEquip = [
        ...EQUIPMENT_DATABASE.weapons,
        ...EQUIPMENT_DATABASE.armors,
        ...EQUIPMENT_DATABASE.accessories
    ];

    const ownedItems = allEquip.filter(e => owned[e.id] > 0);
    if (ownedItems.length === 0) {
        return `
            <div class="text-center py-16 text-slate-400">
                <i class="fa-solid fa-box-open text-4xl mb-4 block opacity-30"></i>
                <p class="font-bold">No equipment owned yet</p>
                <p class="text-sm mt-1">Craft equipment in the Craft tab or defeat bosses!</p>
            </div>
        `;
    }

    const rarityColor = { N: '#10b981', R: '#3b82f6', SR: '#8b5cf6', SSR: '#f59e0b', UR: '#ec4899' };
    const rarityBg    = { N: '#f0fdf4', R: '#eff6ff', SR: '#faf5ff', SSR: '#fffbeb', UR: '#fdf2f8' };

    const cards = ownedItems.map(eq => {
        const rc  = rarityColor[eq.rarity] || '#94a3b8';
        const rbg = rarityBg[eq.rarity]    || '#f8fafc';
        const qty = owned[eq.id];

        // Check if equipped by any hero
        const equippedBy = (window.gameState?.roster || []).filter(h =>
            h.equipment && Object.values(h.equipment).includes(eq.id)
        );

        return `
            <div class="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="forge-rarity-bar forge-rarity-${eq.rarity}"></div>
                <div class="p-4" style="background:${rbg}10;">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="text-3xl w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                            ${eq.emoji || _slotEmoji(eq.slot)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-slate-800">${eq.name}</div>
                            <div class="text-xs font-bold capitalize" style="color:${rc};">${eq.rarity} · ${eq.slot}</div>
                        </div>
                        <div class="font-mono font-bold text-lg" style="color:${rc};">×${qty}</div>
                    </div>
                    <div class="text-xs text-slate-500 bg-white rounded-lg px-3 py-2 mb-3">
                        ${_formatEquipStats(eq.stats)}
                    </div>
                    ${equippedBy.length > 0 ? `
                        <div class="text-[10px] text-blue-600 bg-blue-50 rounded-lg px-2 py-1">
                            <i class="fa-solid fa-check-circle mr-1"></i>
                            Equipped by: ${equippedBy.map(h => h.name).join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${cards}</div>`;
}

// ===========================
// HELPERS
// ===========================

function _findEquipById(id) {
    const allEquip = [
        ...EQUIPMENT_DATABASE.weapons,
        ...EQUIPMENT_DATABASE.armors,
        ...EQUIPMENT_DATABASE.accessories
    ];
    return allEquip.find(e => e.id === id) || null;
}

function _slotEmoji(slot) {
    const map = { weapon: '⚔️', armor: '🛡️', accessory: '💍' };
    return map[slot] || '📦';
}

function _formatEquipStats(stats) {
    const labels = { atk: '⚔️ ATK', def: '🛡️ DEF', hp: '❤️ HP', spd: '💨 SPD', crit: '🎯 CRIT' };
    return Object.entries(stats)
        .map(([k, v]) => `<span class="inline-block mr-2 font-bold text-indigo-600">${labels[k] || k.toUpperCase()} +${v}${k === 'crit' ? '%' : ''}</span>`)
        .join('');
}

// ===========================
// CRAFTING LOGIC
// ===========================

window.craftItem = function(recipeId, btnEl) {
    const gs     = window.gameState;
    const recipe = FORGE_DATABASE.recipes.find(r => r.id === recipeId);
    if (!recipe || !gs) return;

    if (gs.gold < recipe.cost) { showToast('Not enough Gold!', 'error'); return; }
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        if ((gs.inventory.materials?.[matId] || 0) < qty) {
            showToast('Missing materials!', 'error');
            return;
        }
    }

    gs.gold -= recipe.cost;
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        gs.removeItem('materials', matId, qty);
    }

    gs.addEquipmentItem(recipe.resultId);

    if (typeof gs.checkAchievements === 'function') {
        gs.checkAchievements().forEach(a => showToast(`Achievement: ${a.name}! 🏆`, 'success'));
    }

    const resultItem = _findEquipById(recipe.resultId);
    showToast(`✨ Crafted ${resultItem?.name || recipe.name}!`, 'success');

    if (btnEl) {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Crafted!';
        btnEl.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        setTimeout(() => renderForge(gs), 900);
    }

    saveGame(gs);
    updateUI(gs);
};
