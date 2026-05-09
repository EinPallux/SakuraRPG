/* =========================================
   SAKURA CHRONICLES - UI MANAGER v2.0
   Hero Details, Equipment, Achievements, Roster
   ========================================= */

// ===========================
// GLOBAL UI
// ===========================

function updateUI(gameState) {
    if (!gameState) return;
    updateCurrencyDisplay(gameState);

    const nameEl  = document.getElementById('sidebar-username');
    const levelEl = document.getElementById('sidebar-level');
    if (nameEl) nameEl.textContent = gameState.username;
    if (levelEl) {
        const total = gameState.roster.reduce((s, h) => s + h.level, 0);
        levelEl.textContent = Math.max(1, Math.floor(Math.sqrt(total)));
    }
}

function updateCurrencyDisplay(gameState) {
    const goldEl   = document.getElementById('gold-display');
    const petalsEl = document.getElementById('petals-display');
    const orbsEl   = document.getElementById('orbs-display');
    if (goldEl)   goldEl.textContent   = formatNumber(gameState.gold);
    if (petalsEl) petalsEl.textContent = formatNumber(gameState.petals);
    if (orbsEl)   orbsEl.textContent   = formatNumber(gameState.spiritOrbs);
}

// ===========================
// HERO SELECTION MODAL (Team Slot)
// ===========================

function showHeroSelectionModal(slotIndex, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-6 min-h-[580px]';

    container.innerHTML = `
        <h3 class="text-xl font-heading font-bold text-slate-800 mb-5">
            Select Hero — Slot ${slotIndex + 1}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" id="hero-select-grid"></div>
    `;

    modalBody.innerHTML = '';
    modalBody.appendChild(container);

    const grid = container.querySelector('#hero-select-grid');

    // Clear slot option
    const clearCard = document.createElement('div');
    clearCard.className = 'hero-card border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 aspect-[3/4] rounded-xl transition-colors';
    clearCard.innerHTML = `<div class="text-center text-slate-400"><i class="fa-solid fa-xmark text-3xl mb-2"></i><div class="text-xs font-bold">Empty</div></div>`;
    clearCard.onclick = () => selectHeroForSlot(slotIndex, null);
    grid.appendChild(clearCard);

    // Hero list sorted by power
    const sorted = [...gameState.roster].sort((a, b) => b.getPower() - a.getPower());
    sorted.forEach(hero => {
        const assignedIdx = gameState.team.indexOf(hero.id);
        const inOtherSlot = assignedIdx !== -1 && assignedIdx !== slotIndex;
        const elColor = ELEMENT_COLORS[hero.element] || ELEMENT_COLORS['Fire'];

        const card = document.createElement('div');
        card.className = `hero-card relative rounded-xl overflow-hidden border ${inOtherSlot ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}`;
        if (!inOtherSlot) card.onclick = () => selectHeroForSlot(slotIndex, hero.id);

        card.innerHTML = `
            <div class="aspect-[3/4] relative overflow-hidden bg-slate-100">
                <img src="images/${hero.id}.jpg" class="w-full h-full object-cover"
                     onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-white text-2xl font-bold\'>${hero.name.substring(0,2).toUpperCase()}</div>'">

                <div class="absolute top-1 left-1 text-[10px] text-yellow-400 drop-shadow">${'⭐'.repeat(Math.min(hero.stars,5))}</div>
                <div class="absolute top-1 right-1 badge-${hero.rarity} text-white text-[9px] font-bold px-1 py-0.5 rounded">${hero.rarity}</div>

                ${inOtherSlot ? '<div class="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">IN TEAM</div>' : ''}

                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-1.5 px-1.5">
                    <div class="text-white text-xs font-bold truncate">${hero.name}</div>
                    <div class="text-slate-300 text-[9px]">Lv.${hero.level}</div>
                </div>
            </div>
            <div class="p-2 text-center bg-white">
                <div class="text-xs font-bold text-slate-700 truncate">${hero.class}</div>
                <div class="text-[10px] text-amber-600 font-bold">PW:${formatNumber(hero.getPower())}</div>
            </div>
        `;
        grid.appendChild(card);
    });

    openModal();
}

window.selectHeroForSlot = function(slotIndex, heroId) {
    window.gameState.setTeamMember(slotIndex, heroId);
    saveGame(window.gameState);
    closeModal();
    showToast(heroId ? 'Hero assigned!' : 'Slot cleared.', 'success');
    if (typeof renderBattleDashboard === 'function') {
        renderBattleDashboard(window.gameState);
    }
};

// ===========================
// HERO DETAILS MODAL
// ===========================

function showHeroDetails(hero, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    const xpCost = hero.getUpgradeCost();
    const canAfford = gameState.gold >= xpCost && hero.level < 100;
    const maxStars = 5;
    const isMaxStars = hero.stars >= maxStars;
    const shardsReq = hero.stars * 10;
    const canAwaken = !isMaxStars && hero.awakeningShards >= shardsReq;
    const shardPct = isMaxStars ? 100 : Math.min(100, (hero.awakeningShards / shardsReq) * 100);

    const elColor = ELEMENT_COLORS[hero.element] || ELEMENT_COLORS['Fire'];

    // Equipment panel
    const slots = [
        { key: 'weapon',    label: 'Weapon',    icon: 'fa-sword', dbKey: 'weapons' },
        { key: 'armor',     label: 'Armor',     icon: 'fa-shield', dbKey: 'armors' },
        { key: 'accessory', label: 'Accessory', icon: 'fa-ring', dbKey: 'accessories' }
    ];

    const equipmentHTML = slots.map(slot => {
        const eqId = hero.equipment[slot.key];
        const eq   = eqId ? EQUIPMENT_DATABASE[slot.dbKey]?.find(e => e.id === eqId) : null;
        return `
            <div class="equipment-slot border border-slate-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                 onclick="showEquipmentSelector('${hero.id}', '${slot.key}', '${slot.dbKey}')">
                <div class="w-10 h-10 rounded-lg ${eq ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center text-lg border ${eq ? 'border-amber-200' : 'border-slate-200'}">
                    ${eq ? eq.emoji : `<i class="fa-solid ${slot.icon} text-sm"></i>`}
                </div>
                <div class="flex-1 overflow-hidden">
                    <div class="text-xs text-slate-400 uppercase font-bold tracking-wide">${slot.label}</div>
                    ${eq ? `
                        <div class="text-sm font-bold text-slate-700 truncate">${eq.name}</div>
                        <div class="text-[10px] text-slate-400">${Object.entries(eq.stats).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(' · ')}</div>
                    ` : `<div class="text-sm text-slate-400">Empty — Click to equip</div>`}
                </div>
                ${eq ? `<button class="text-slate-300 hover:text-red-400 transition-colors" onclick="event.stopPropagation(); unequipItem('${hero.id}', '${slot.key}'); return false;"><i class="fa-solid fa-xmark"></i></button>` : ''}
            </div>
        `;
    }).join('');

    modalBody.innerHTML = `
        <div class="flex flex-col md:flex-row min-h-[600px] md:h-[700px]">
            <!-- Hero Art Panel -->
            <div class="w-full md:w-5/12 relative bg-slate-900 overflow-hidden group shrink-0">
                <img src="images/${hero.id}.jpg"
                     class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                     onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-br ${elColor.from} ${elColor.to} opacity-30"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                <div class="absolute bottom-6 left-6 z-10">
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="badge-${hero.rarity} px-2 py-0.5 rounded text-xs font-bold text-white">${hero.rarity}</span>
                        <span class="bg-black/50 text-white px-2 py-0.5 rounded text-xs backdrop-blur border border-white/20">
                            ${elColor.emoji} ${hero.element}
                        </span>
                        <span class="bg-black/50 text-white px-2 py-0.5 rounded text-xs backdrop-blur border border-white/20">
                            ${hero.class}
                        </span>
                    </div>
                    <h2 class="text-4xl font-heading font-bold text-white mb-1 drop-shadow-lg">${hero.name}</h2>
                    <div class="flex gap-0.5 text-yellow-400 text-lg">${'⭐'.repeat(hero.stars)}</div>
                    <div class="mt-2 text-xs text-slate-400">Bond: ${hero.bond}/100 · PW: ${formatNumber(hero.getPower())}</div>
                </div>
            </div>

            <!-- Details Panel -->
            <div class="w-full md:w-7/12 bg-white overflow-y-auto">
                <div class="p-6 space-y-5">

                    <!-- Stats -->
                    <div>
                        <h3 class="section-label">Combat Stats</h3>
                        <div class="grid grid-cols-4 gap-3">
                            ${[['HP', formatNumber(hero.maxHP), 'text-green-600'],
                               ['ATK', formatNumber(hero.atk), 'text-red-600'],
                               ['DEF', formatNumber(hero.def), 'text-blue-600'],
                               ['SPD', hero.spd, 'text-teal-600']].map(([label, val, cls]) => `
                                <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                    <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">${label}</div>
                                    <div class="text-lg font-bold ${cls}">${val}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Level Up -->
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div class="flex justify-between items-center mb-3">
                            <div>
                                <h4 class="font-bold text-slate-700">Level ${hero.level} / 100</h4>
                                <div class="text-xs text-slate-400">Bond Level: ${hero.bond}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-sm ${canAfford ? 'text-slate-700' : 'text-red-500'}">${formatNumber(xpCost)} 💰</div>
                                <div class="text-[10px] text-slate-400">Cost to level</div>
                            </div>
                        </div>
                        <button id="modal-levelup-btn" class="w-full btn py-2.5 ${canAfford ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" ${!canAfford ? 'disabled' : ''}>
                            ${hero.level >= 100 ? 'Max Level Reached' : 'Level Up'}
                        </button>
                    </div>

                    <!-- Awakening -->
                    <div class="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-bold text-amber-800 flex items-center gap-2"><i class="fa-solid fa-star text-amber-500"></i> Ascension</h4>
                            ${isMaxStars ? '<span class="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">MAX</span>'
                                        : `<span class="text-xs font-bold text-amber-700">${hero.awakeningShards}/${shardsReq} Shards</span>`}
                        </div>
                        ${!isMaxStars ? `<div class="w-full bg-white/60 rounded-full h-1.5 mb-3 overflow-hidden border border-amber-100"><div class="bg-amber-400 h-full" style="width:${shardPct}%"></div></div>` : ''}
                        <button id="modal-awaken-btn" class="w-full btn ${canAwaken ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-100 text-amber-400 cursor-not-allowed'}" ${!canAwaken ? 'disabled' : ''}>
                            ${isMaxStars ? '✨ Max Ascension' : canAwaken ? 'Awaken ★' : 'Need More Shards'}
                        </button>
                    </div>

                    <!-- Equipment -->
                    <div>
                        <h3 class="section-label">Equipment</h3>
                        <div class="space-y-2">${equipmentHTML}</div>
                    </div>

                    <!-- Ultimate -->
                    <div>
                        <h3 class="section-label">Ultimate Skill</h3>
                        <div class="flex gap-3 p-4 rounded-xl border border-purple-100 bg-purple-50/40">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 text-xl border border-purple-200 shrink-0">
                                <i class="fa-solid fa-bolt"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-bold text-slate-700">${hero.ultimate.name}</h4>
                                    <span class="text-[9px] font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded">${hero.ultimate.manaReq} MP</span>
                                </div>
                                <p class="text-sm text-slate-600 leading-relaxed">${hero.ultimate.desc}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Level up button handler
    const lvlBtn = document.getElementById('modal-levelup-btn');
    if (lvlBtn && canAfford) {
        lvlBtn.onclick = () => {
            gameState.gold -= xpCost;
            hero.levelUp();
            gameState.updateQuest('levelUp', 1);
            saveGame(gameState);
            updateUI(gameState);
            showHeroDetails(hero, gameState);
            showToast(`${hero.name} is now Lv.${hero.level}!`, 'success');
        };
    }

    // Awaken button
    const awakenBtn = document.getElementById('modal-awaken-btn');
    if (awakenBtn && canAwaken) {
        awakenBtn.onclick = () => {
            hero.awakeningShards -= shardsReq;
            hero.stars++;
            hero.calculateStats(gameState.getSkillTreeBonuses());
            playParticleEffect(awakenBtn);
            saveGame(gameState);
            updateUI(gameState);
            showHeroDetails(hero, gameState);
            showToast(`${hero.name} ascended to ${hero.stars}★!`, 'special');
        };
    }

    openModal();
}

// ===========================
// EQUIPMENT SELECTOR
// ===========================

window.showEquipmentSelector = function(heroId, slot, dbKey) {
    const gameState = window.gameState;
    const hero = gameState.roster.find(h => h.id === heroId);
    if (!hero) return;

    const inventoryEquip = gameState.inventory.equipment || {};
    const allEquip = EQUIPMENT_DATABASE[dbKey] || [];
    const ownedEquip = allEquip.filter(eq => (inventoryEquip[eq.id] || 0) > 0);

    const modalBody = document.getElementById('modal-body');
    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-6 min-h-[400px]';

    container.innerHTML = `
        <div class="flex items-center gap-3 mb-5">
            <button class="btn btn-secondary text-sm" onclick="showHeroDetails(window.gameState.roster.find(h=>h.id==='${heroId}'), window.gameState)">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h3 class="text-xl font-bold text-slate-800">Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}</h3>
        </div>
        ${ownedEquip.length === 0 ? `
            <div class="text-center py-12 text-slate-400">
                <i class="fa-solid fa-box-open text-5xl mb-3 opacity-30"></i>
                <p>No ${slot}s in inventory.</p>
                <p class="text-sm mt-1">Craft them in the Forge or find them in boss battles!</p>
            </div>
        ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ownedEquip.map(eq => `
                    <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                         onclick="equipItem('${heroId}', '${slot}', '${eq.id}')">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl border border-amber-100 group-hover:scale-110 transition-transform">${eq.emoji}</div>
                        <div class="flex-1">
                            <div class="font-bold text-slate-700">${eq.name}</div>
                            <div class="text-xs text-slate-400">${eq.desc}</div>
                            <div class="flex gap-2 mt-1 flex-wrap">
                                ${Object.entries(eq.stats).map(([k,v]) => `<span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">+${v} ${k.toUpperCase()}</span>`).join('')}
                            </div>
                        </div>
                        <div class="text-xs text-slate-400">×${inventoryEquip[eq.id] || 0}</div>
                    </div>
                `).join('')}
            </div>
        `}
    `;

    modalBody.innerHTML = '';
    modalBody.appendChild(container);
};

window.equipItem = function(heroId, slot, equipId) {
    const gameState = window.gameState;
    const hero = gameState.roster.find(h => h.id === heroId);
    if (!hero) return;

    // Remove the old equipment back to inventory if there was one
    if (hero.equipment[slot]) {
        gameState.addEquipmentItem(hero.equipment[slot]);
    }

    // Equip new item
    hero.equipment[slot] = equipId;
    gameState.removeItem('equipment', equipId, 1);
    hero.calculateStats(gameState.getSkillTreeBonuses());

    saveGame(gameState);
    showToast('Equipment updated!', 'success');
    showHeroDetails(hero, gameState);
};

window.unequipItem = function(heroId, slot) {
    const gameState = window.gameState;
    const hero = gameState.roster.find(h => h.id === heroId);
    if (!hero || !hero.equipment[slot]) return;

    gameState.addEquipmentItem(hero.equipment[slot]);
    hero.equipment[slot] = null;
    hero.calculateStats(gameState.getSkillTreeBonuses());

    saveGame(gameState);
    showToast('Equipment removed.', 'info');
    showHeroDetails(hero, gameState);
};

// ===========================
// ROSTER TAB
// ===========================

function renderRoster(gameState) {
    const container = document.getElementById('roster-tab');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 animate-entry">
            <h2 class="text-2xl font-heading font-bold text-slate-800">
                Hero Roster <span class="text-slate-400 text-lg font-normal">(${gameState.roster.length})</span>
            </h2>
            <div class="flex gap-2 flex-wrap">
                <select id="roster-filter-rarity" class="form-select text-sm" onchange="renderRosterGrid(window.gameStateRef)">
                    <option value="all">All Rarities</option>
                    <option value="N">Normal</option>
                    <option value="R">Rare</option>
                    <option value="SR">Super Rare</option>
                    <option value="SSR">SSR</option>
                    <option value="UR">Ultra Rare</option>
                </select>
                <select id="roster-filter-element" class="form-select text-sm" onchange="renderRosterGrid(window.gameStateRef)">
                    <option value="all">All Elements</option>
                    <option value="Fire">🔥 Fire</option>
                    <option value="Water">💧 Water</option>
                    <option value="Wind">🌪️ Wind</option>
                    <option value="Light">✨ Light</option>
                    <option value="Dark">🌑 Dark</option>
                </select>
                <select id="roster-sort" class="form-select text-sm" onchange="renderRosterGrid(window.gameStateRef)">
                    <option value="rarity">Sort: Rarity</option>
                    <option value="level">Sort: Level</option>
                    <option value="power">Sort: Power</option>
                </select>
            </div>
        </div>
        <div id="roster-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-entry"></div>
    `;

    window.gameStateRef = gameState;
    renderRosterGrid(gameState);
}

function renderRosterGrid(gameState) {
    const grid = document.getElementById('roster-grid');
    if (!grid) return;

    const rarityFilter   = document.getElementById('roster-filter-rarity')?.value  || 'all';
    const elementFilter  = document.getElementById('roster-filter-element')?.value || 'all';
    const sortFilter     = document.getElementById('roster-sort')?.value            || 'rarity';
    const rarityOrder    = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };

    let heroes = [...gameState.roster];
    if (rarityFilter  !== 'all') heroes = heroes.filter(h => h.rarity   === rarityFilter);
    if (elementFilter !== 'all') heroes = heroes.filter(h => h.element  === elementFilter);

    heroes.sort((a, b) => {
        if (sortFilter === 'level') return b.level - a.level;
        if (sortFilter === 'power') return b.getPower() - a.getPower();
        const rd = rarityOrder[b.rarity] - rarityOrder[a.rarity];
        return rd !== 0 ? rd : b.level - a.level;
    });

    if (heroes.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-slate-400">
            <i class="fa-solid fa-user-slash text-5xl mb-3 opacity-30"></i>
            <p>No heroes match your filters.</p>
        </div>`;
        return;
    }

    grid.innerHTML = '';
    heroes.forEach(hero => {
        const card = createHeroCard(hero);
        card.onclick = () => showHeroDetails(hero, gameState);
        grid.appendChild(card);
    });
}

function createHeroCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card cursor-pointer group';
    card.setAttribute('data-rarity', hero.rarity);

    const elColor = ELEMENT_COLORS[hero.element] || ELEMENT_COLORS['Fire'];
    const pw = hero.getPower();

    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative overflow-hidden aspect-[3/4]';

    const img = document.createElement('img');
    img.src = `images/${hero.id}.jpg`;
    img.className = 'hero-card-image transition-transform duration-500 group-hover:scale-110';
    img.alt = hero.name;
    img.onerror = function() {
        const ph = document.createElement('div');
        ph.className = `w-full h-full aspect-[3/4] bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-white text-4xl font-heading font-bold opacity-90 group-hover:scale-110 transition-transform duration-500`;
        ph.textContent = hero.name.substring(0, 2).toUpperCase();
        this.replaceWith(ph);
    };
    imgContainer.appendChild(img);

    const starBadge = document.createElement('div');
    starBadge.className = 'absolute top-1.5 left-1.5 text-[10px] text-yellow-400 font-bold drop-shadow';
    starBadge.textContent = '⭐'.repeat(Math.min(hero.stars, 5));
    imgContainer.appendChild(starBadge);

    const rarBadge = document.createElement('div');
    rarBadge.className = `absolute top-1.5 right-1.5 badge-${hero.rarity} text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow`;
    rarBadge.textContent = hero.rarity;
    imgContainer.appendChild(rarBadge);

    // Equipment indicator
    const hasEquip = Object.values(hero.equipment).some(Boolean);
    if (hasEquip) {
        const equip = document.createElement('div');
        equip.className = 'absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded';
        equip.innerHTML = '⚔️';
        imgContainer.appendChild(equip);
    }

    card.appendChild(imgContainer);

    const info = document.createElement('div');
    info.className = 'p-2.5 bg-white';
    info.innerHTML = `
        <div class="font-bold text-slate-800 text-sm truncate">${hero.name}</div>
        <div class="flex justify-between items-center mt-1">
            <div class="text-[10px] text-slate-500">Lv.${hero.level} · ${hero.class}</div>
            <div class="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">PW:${formatNumber(pw)}</div>
        </div>
    `;
    card.appendChild(info);

    return card;
}

// ===========================
// QUESTS
// ===========================

function renderQuests(gameState) {
    const container = document.getElementById('quests-tab');
    if (!container) return;
    gameState.checkQuestReset();

    const diffColors = {
        Easy: 'bg-green-100 text-green-600',
        Medium: 'bg-blue-100 text-blue-600',
        Hard: 'bg-orange-100 text-orange-600',
        Insane: 'bg-purple-100 text-purple-600'
    };

    const now = Date.now();
    const resetIn = Math.max(0, 24 * 60 * 60 * 1000 - (now - gameState.lastQuestReset));
    const hours = Math.floor(resetIn / 3600000);
    const mins  = Math.floor((resetIn % 3600000) / 60000);

    container.innerHTML = `
        <div class="animate-entry max-w-4xl mx-auto">
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-2xl font-heading font-bold text-slate-800">Daily Quests</h2>
                <div class="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1">
                    Resets in <span class="font-bold text-slate-600">${hours}h ${mins}m</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${gameState.quests.map(q => {
                    const progress = Math.min(100, (q.current / q.target) * 100);
                    const diffCls = diffColors[q.difficulty] || diffColors.Easy;
                    const done = q.current >= q.target;

                    const rewardHTML = Object.entries(q.reward || {}).map(([k, v]) => {
                        if (k === 'gold')       return `<span class="reward-tag">💰 ${v}</span>`;
                        if (k === 'petals')     return `<span class="reward-tag">🌸 ${v}</span>`;
                        if (k === 'spiritOrbs') return `<span class="reward-tag">🔮 ${v}</span>`;
                        if (k === 'seeds')      return `<span class="reward-tag">🌱 Seeds</span>`;
                        return '';
                    }).join('');

                    return `
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
                            ${done && !q.claimed ? '<div class="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full m-3 shadow-sm shadow-green-300"></div>' : ''}

                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="text-[10px] font-bold uppercase tracking-wide ${diffCls} px-2 py-0.5 rounded-full">${q.difficulty}</span>
                                    <h3 class="font-bold text-slate-700 mt-1">${q.desc}</h3>
                                </div>
                                ${q.claimed ? '<span class="text-xs text-green-500 font-bold bg-green-50 border border-green-100 px-2 py-1 rounded-lg">✓ Claimed</span>' : ''}
                            </div>

                            <div class="flex flex-wrap gap-1.5">${rewardHTML}</div>

                            <div>
                                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width:${progress}%"></div>
                                </div>
                                <div class="text-[10px] text-slate-500 text-right mt-1 font-mono">${q.current}/${q.target}</div>
                            </div>

                            ${done && !q.claimed ? `
                                <button class="btn btn-primary w-full py-2 text-sm" onclick="claimQuest('${q.id}')">
                                    <i class="fa-solid fa-gift"></i> Claim Rewards
                                </button>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    window.claimQuest = (qid) => {
        const r = gameState.claimQuest(qid);
        if (r) {
            showToast('Quest rewards claimed!', 'success');
            updateUI(gameState);
            renderQuests(gameState);
            saveGame(gameState);
        }
    };
}

// ===========================
// EXPEDITION
// ===========================

function updateExpeditionUI(gameState) {
    const container = document.getElementById('expedition-tab');
    if (!container) return;

    const rewards   = gameState.calculateExpeditionRewards();
    const teamPower = gameState.getTeamHeroes().reduce((s, h) => s + h.getPower(), 0);
    const hoursNum  = parseFloat(rewards.hours);
    const pct       = Math.min(100, (hoursNum / 8) * 100);

    container.innerHTML = `
        <div class="max-w-2xl mx-auto animate-entry">
            <h2 class="text-2xl font-heading font-bold text-slate-800 mb-5">Resource Expedition</h2>
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                <div class="h-36 bg-gradient-to-br from-amber-50 to-orange-100 relative flex items-center justify-center">
                    <i class="fa-solid fa-map-location-dot text-7xl text-amber-200"></i>
                    <div class="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-5">Your heroes gather resources while you're away. Team power boosts the yield!</p>

                    <div class="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
                        <div class="flex justify-between text-sm text-amber-800 font-bold mb-2">
                            <span>Expedition Progress</span>
                            <span>${rewards.hours}h</span>
                        </div>
                        <div class="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-amber-400 h-2.5 rounded-full transition-all" style="width:${pct}%"></div>
                        </div>
                        <div class="text-[10px] text-amber-600 mt-1 text-right">Max efficiency at 8h</div>
                    </div>

                    <div class="grid grid-cols-3 gap-3 mb-5 text-center">
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div class="text-2xl font-bold text-yellow-600">${formatNumber(rewards.gold)}</div>
                            <div class="text-xs text-slate-400">Gold</div>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div class="text-2xl font-bold text-pink-500">${formatNumber(rewards.petals)}</div>
                            <div class="text-xs text-slate-400">Petals</div>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div class="text-2xl font-bold text-purple-600">${formatNumber(teamPower)}</div>
                            <div class="text-xs text-slate-400">Team Power</div>
                        </div>
                    </div>

                    <button class="btn btn-primary w-full py-3 text-base" onclick="claimExpedition()">
                        <i class="fa-solid fa-hand-holding-dollar mr-2"></i>
                        Claim & Restart
                    </button>
                </div>
            </div>
        </div>
    `;

    window.claimExpedition = () => {
        const claimed = gameState.claimExpeditionRewards();
        if (claimed) {
            showToast(`Claimed ${formatNumber(claimed.gold)} 💰 & ${formatNumber(claimed.petals)} 🌸!`, 'success');
            updateUI(gameState);
            updateExpeditionUI(gameState);
            saveGame(gameState);
        } else {
            showToast('Expedition just started — check back later!', 'info');
        }
    };
}

// ===========================
// ACHIEVEMENTS
// ===========================

function renderAchievements(gameState) {
    const container = document.getElementById('achievements-tab');
    if (!container) return;

    const unlocked = gameState.getUnlockedAchievements();
    const total    = ACHIEVEMENTS_DATABASE.length;

    container.innerHTML = `
        <div class="max-w-4xl mx-auto animate-entry">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-heading font-bold text-slate-800">Achievements</h2>
                <div class="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm font-bold text-slate-600">
                    ${unlocked.length} / ${total} Unlocked
                </div>
            </div>

            <div class="mb-5">
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-gradient-to-r from-primary to-primaryDark h-full rounded-full transition-all duration-700"
                         style="width:${(unlocked.length/total)*100}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${ACHIEVEMENTS_DATABASE.map(ach => {
                    const done = !!gameState.achievements[ach.id];
                    const val  = getAchievementCurrentValue(ach, gameState);
                    const pct  = Math.min(100, (val / ach.target) * 100);

                    const rewardStr = Object.entries(ach.reward || {}).map(([k,v]) => {
                        if (k === 'gold')       return `💰${formatNumber(v)}`;
                        if (k === 'petals')     return `🌸${v}`;
                        if (k === 'spiritOrbs') return `🔮${v}`;
                        return `${k}:${v}`;
                    }).join(' ');

                    return `
                        <div class="bg-white rounded-xl p-4 border ${done ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'} shadow-sm flex gap-4 items-center">
                            <div class="w-14 h-14 rounded-xl ${done ? 'bg-amber-100' : 'bg-slate-100'} flex items-center justify-center text-3xl shrink-0 border ${done ? 'border-amber-200' : 'border-slate-200'}">
                                ${done ? ach.icon : '🔒'}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-0.5">
                                    <h3 class="font-bold text-slate-800 text-sm">${ach.name}</h3>
                                    ${done ? '<span class="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">DONE</span>' : ''}
                                </div>
                                <p class="text-xs text-slate-500 mb-1.5">${ach.desc}</p>
                                ${!done ? `
                                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-primary h-full rounded-full" style="width:${pct}%"></div>
                                </div>
                                <div class="text-[9px] text-slate-400 mt-0.5">${Math.min(val, ach.target)} / ${ach.target}</div>
                                ` : `<div class="text-[10px] text-amber-600 font-bold">${rewardStr}</div>`}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function getAchievementCurrentValue(ach, gameState) {
    const map = {
        totalBattles: gameState.stats.totalBattles || 0,
        highestWave:  gameState.highestWave || 0,
        rosterSize:   gameState.roster.length,
        ownSSR:  gameState.roster.filter(h => h.rarity === 'SSR' || h.rarity === 'UR').length,
        ownUR:   gameState.roster.filter(h => h.rarity === 'UR').length,
        totalKills: gameState.totalKills || 0,
        totalPulls: gameState.stats.totalPulls || 0
    };
    return map[ach.type] || 0;
}

// ===========================
// SETTINGS / PROFILE
// ===========================

function renderProfile(gameState) {
    const container = document.getElementById('settings-tab');
    if (!container) return;

    container.innerHTML = `
        <div class="max-w-xl mx-auto animate-entry space-y-5">
            <h2 class="text-2xl font-heading font-bold text-slate-800">Settings & Profile</h2>

            <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Player Profile</h3>
                <div class="flex gap-3 mb-4">
                    <input type="text" id="settings-username" value="${gameState.username}"
                           class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-primary transition-colors text-sm">
                    <button class="btn btn-secondary text-sm" onclick="saveUsername()">Update</button>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    ${[
                        ['Battles', gameState.stats.totalBattles],
                        ['Best Wave', gameState.highestWave],
                        ['Total Pulls', gameState.stats.totalPulls],
                        ['Total Kills', formatNumber(gameState.totalKills)],
                        ['Heroes', gameState.roster.length],
                        ['Play Time', Math.floor((gameState.stats.playTime||0)/3600)+'h']
                    ].map(([label, val]) => `
                        <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div class="text-[10px] text-slate-400 uppercase font-bold">${label}</div>
                            <div class="font-bold text-slate-700">${val}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Save Data</h3>
                <div class="flex gap-3 flex-wrap">
                    <button class="btn btn-secondary text-sm flex-1" onclick="exportSave()">
                        <i class="fa-solid fa-download"></i> Export Save
                    </button>
                    <label class="btn btn-secondary text-sm flex-1 cursor-pointer">
                        <i class="fa-solid fa-upload"></i> Import Save
                        <input type="file" accept=".json" class="hidden" onchange="importSave(this)">
                    </label>
                </div>
            </div>

            <div class="bg-red-50 rounded-xl border border-red-100 p-5">
                <h3 class="font-bold text-red-700 mb-2 text-sm uppercase tracking-wide">Danger Zone</h3>
                <p class="text-xs text-red-600/80 mb-4">Reset is permanent. All progress will be lost.</p>
                <button class="btn bg-red-500 text-white hover:bg-red-600 w-full text-sm" onclick="debug.reset()">
                    <i class="fa-solid fa-trash"></i> Reset All Data
                </button>
            </div>
        </div>
    `;

    window.saveUsername = () => {
        const input = document.getElementById('settings-username');
        if (input?.value.trim()) {
            gameState.username = input.value.trim();
            updateUI(gameState);
            saveGame(gameState);
            showToast('Username updated!', 'success');
        }
    };
}

// ===========================
// MODAL HELPERS
// ===========================

function openModal() {
    const modal = document.getElementById('modal-overlay');
    if (!modal) return;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        const content = document.getElementById('modal-content');
        if (content) content.classList.replace('scale-95', 'scale-100');
    });
}
