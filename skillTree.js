/* =========================================
   SAKURA CHRONICLES - YGGDRASIL SYSTEM
   Skill Tree & Passive Upgrades
   ========================================= */

function renderSkillTree(gameState) {
    const container = document.getElementById('skill-tree-tab');
    if (!container) return;

    const bonuses    = gameState.getSkillTreeBonuses();
    const totalSpent = _calcTotalSpent(gameState);

    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 animate-entry">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
                        <i class="fa-solid fa-tree"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">Yggdrasil</h2>
                        <p class="text-slate-500 text-sm">Invest Spirit Orbs to unlock permanent passive bonuses.</p>
                    </div>
                </div>

                <div class="flex gap-8 text-center">
                    <div>
                        <div class="text-2xl font-bold text-purple-600">${formatNumber(gameState.spiritOrbs)}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Available Orbs</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-700">${formatNumber(totalSpent)}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Invested</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                        <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                            Active Bonuses
                        </h3>
                        <div class="space-y-2">
                            ${_renderBonusSummary(bonuses)}
                        </div>

                        <div class="mt-6 pt-4 border-t border-slate-100">
                            <button class="w-full btn bg-red-50 text-red-500 hover:bg-red-100 text-sm" onclick="resetSkillTree()">
                                <i class="fa-solid fa-rotate-left"></i> Reset Tree
                            </button>
                            <p class="text-[10px] text-slate-400 text-center mt-2">Refunds all Spirit Orbs</p>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-3">
                    <div id="skill-tree-grid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        ${_renderNodes(gameState)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// NODE RENDERING
// ===========================

function _renderNodes(gameState) {
    return gameState.skillTree.map(node => {
        const isMaxed   = node.level >= node.maxLevel;
        const nextCost  = node.cost * (node.level + 1);
        const canAfford = !isMaxed && gameState.spiritOrbs >= nextCost;

        let cardClass = 'bg-white border-slate-200';
        let iconClass = 'bg-slate-50 text-slate-400';
        let btnClass  = 'bg-slate-100 text-slate-400 cursor-not-allowed';

        if (isMaxed) {
            cardClass = 'bg-amber-50 border-amber-300 ring-1 ring-amber-200';
            iconClass = 'bg-amber-100 text-amber-600';
            btnClass  = 'bg-amber-500 text-white cursor-default';
        } else if (canAfford) {
            cardClass = 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer';
            iconClass = 'bg-emerald-50 text-emerald-600';
            btnClass  = 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer';
        } else if (node.level > 0) {
            iconClass = 'bg-slate-50 text-slate-600';
        }

        const curBonus  = node.value * node.level;
        const nextBonus = node.value * (node.level + 1);
        const unit      = node.isFlat ? '' : '%';

        return `
            <div class="relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center group ${cardClass}"
                 onclick="${!isMaxed && canAfford ? `handleSkillUpgrade('${node.id}')` : ''}">

                <div class="w-12 h-12 rounded-lg ${iconClass} flex items-center justify-center text-2xl mb-3 transition-colors group-hover:scale-110 duration-200">
                    ${node.icon}
                </div>

                <h4 class="font-bold text-slate-700 text-sm mb-1">${node.name}</h4>
                <p class="text-xs text-slate-500 mb-3 leading-tight">${node.desc}</p>

                <div class="flex gap-1 mb-3">
                    ${_renderLevelDots(node.level, node.maxLevel, isMaxed)}
                </div>

                <div class="mt-auto w-full">
                    ${isMaxed
                        ? `<div class="text-xs font-bold text-amber-600 bg-amber-100 py-1.5 rounded">MAXED (+${curBonus}${unit})</div>`
                        : `<button class="w-full py-1.5 rounded text-xs font-bold transition-colors ${btnClass}">
                               🔮 ${nextCost} Orbs
                           </button>`
                    }
                </div>

                ${!isMaxed && node.level > 0
                    ? `<div class="mt-1 text-[10px] text-slate-400">Current: +${curBonus}${unit} → +${nextBonus}${unit}</div>`
                    : !isMaxed
                        ? `<div class="mt-1 text-[10px] text-slate-400">+${nextBonus}${unit} on upgrade</div>`
                        : ''
                }
            </div>
        `;
    }).join('');
}

function _renderLevelDots(current, max, isMaxed) {
    let html = '';
    for (let i = 0; i < max; i++) {
        const active = i < current;
        const color  = isMaxed ? 'bg-amber-400' : active ? 'bg-emerald-400' : 'bg-slate-200';
        html += `<div class="w-2 h-2 rounded-full ${color}"></div>`;
    }
    return html;
}

// ===========================
// BONUS SUMMARY
// ===========================

const _BONUS_META = {
    allStatsPercent: { name: 'All Stats',    icon: '⭐' },
    hpPercent:       { name: 'Max HP',       icon: '❤️' },
    atkPercent:      { name: 'ATK',          icon: '⚔️' },
    defPercent:      { name: 'DEF',          icon: '🛡️' },
    critBonus:       { name: 'Crit Rate',    icon: '🎯' },
    spdBonus:        { name: 'Speed',        icon: '💨' },
    bondBonus:       { name: 'Bond Gain',    icon: '💞' },
    orbBonus:        { name: 'Orb Drop',     icon: '🔮' },
    petalBonus:      { name: 'Petal Drop',   icon: '🌸' },
    goldBonus:       { name: 'Gold Gain',    icon: '🪙' },
    startingMana:    { name: 'Start Mana',   icon: '⚡' },
    fireBonus:       { name: 'Fire ATK',     icon: '🔥' },
    waterBonus:      { name: 'Water ATK',    icon: '💧' },
    windBonus:       { name: 'Wind ATK',     icon: '🌪️' },
    lightBonus:      { name: 'Light ATK',    icon: '☀️' },
    darkBonus:       { name: 'Dark ATK',     icon: '🌙' },
};

function _renderBonusSummary(bonuses) {
    const entries = Object.entries(bonuses).filter(([, v]) => v > 0);
    if (entries.length === 0) {
        return `<div class="text-sm text-slate-400 italic text-center py-4">No active bonuses.<br>Start upgrading!</div>`;
    }
    return entries.map(([key, val]) => {
        const meta = _BONUS_META[key] || { name: key, icon: '✅' };
        const unit = key === 'startingMana' ? '' : '%';
        return `
            <div class="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1.5">
                <span class="text-slate-600 flex items-center gap-2">
                    <span>${meta.icon}</span> ${meta.name}
                </span>
                <span class="font-bold text-emerald-600">+${val}${unit}</span>
            </div>
        `;
    }).join('');
}

function _calcTotalSpent(gameState) {
    let total = 0;
    gameState.skillTree.forEach(node => {
        for (let i = 1; i <= node.level; i++) total += node.cost * i;
    });
    return total;
}

// ===========================
// ACTIONS
// ===========================

window.handleSkillUpgrade = function(nodeId) {
    const gs = window.gameState;
    if (!gs.upgradeSkillNode(nodeId)) {
        showToast('Not enough Spirit Orbs!', 'error');
        return;
    }
    const node = gs.skillTree.find(n => n.id === nodeId);
    showToast(`Upgraded ${node.name}! 🌿`, 'success');

    gs.roster.forEach(hero => hero.calculateStats(gs.getSkillTreeBonuses()));
    saveGame(gs);
    updateUI(gs);
    renderSkillTree(gs);
};

window.resetSkillTree = function() {
    if (!confirm('Reset Yggdrasil? All Spirit Orbs will be refunded.')) return;

    const gs = window.gameState;
    let refund = 0;
    gs.skillTree.forEach(node => {
        for (let i = 1; i <= node.level; i++) refund += node.cost * i;
        node.level = 0;
    });
    gs.spiritOrbs += refund;

    gs.roster.forEach(hero => hero.calculateStats({}));
    showToast(`Refunded ${formatNumber(refund)} Spirit Orbs`, 'success');
    saveGame(gs);
    updateUI(gs);
    renderSkillTree(gs);
};
