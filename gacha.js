/* =========================================
   SAKURA CHRONICLES - GACHA SYSTEM v2.0
   Soft Pity, Better Animation, Expanded UI
   ========================================= */

// ===========================
// GACHA VIEW
// ===========================

function renderGacha(gameState) {
    const container = document.getElementById('gacha-tab');
    if (!container) return;

    const pityPct = (gameState.pityCounter / HARD_PITY) * 100;
    const softPityActive = gameState.pityCounter >= SOFT_PITY_START;
    const pullsLeft = HARD_PITY - gameState.pityCounter;

    // Latest UR hero for the banner art
    const featuredUR = HEROES_DATABASE.find(h => h.rarity === 'UR') || HEROES_DATABASE[HEROES_DATABASE.length - 1];
    const featuredEl = ELEMENT_COLORS[featuredUR.element] || ELEMENT_COLORS['Light'];

    container.innerHTML = `
        <div class="max-w-6xl mx-auto animate-entry space-y-6">

            <!-- Banner Hero -->
            <div class="relative h-72 rounded-2xl overflow-hidden shadow-xl group cursor-pointer" onclick="handleGachaPull(10)">
                <div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600"></div>
                <div class="absolute inset-0 opacity-20 bg-[url('images/h041.jpg')] bg-cover bg-top scale-110 group-hover:scale-105 transition-transform duration-700"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                <!-- Floating sparkles -->
                <div class="absolute inset-0 overflow-hidden pointer-events-none">
                    ${Array.from({length:8}).map(() => {
                        const x = Math.random() * 100;
                        const y = Math.random() * 100;
                        const d = (Math.random() * 3 + 1).toFixed(1);
                        return `<div class="absolute w-1 h-1 rounded-full bg-white/60 animate-pulse" style="left:${x}%;top:${y}%;animation-duration:${d}s"></div>`;
                    }).join('')}
                </div>

                <div class="absolute bottom-6 left-8 text-white z-10">
                    <div class="text-xs font-bold uppercase tracking-widest text-pink-300 mb-1">✨ Standard Banner</div>
                    <h2 class="text-5xl font-heading font-bold mb-2 drop-shadow-lg">Legends of Sakura</h2>
                    <p class="text-sm text-pink-100 max-w-md">Summon from 45 unique heroes. Guaranteed SSR at ${HARD_PITY} pulls.</p>
                </div>

                <div class="absolute top-4 right-4 bg-black/40 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                    Click for ×10 Pull →
                </div>
            </div>

            <!-- Pity + Actions Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                <!-- Pity Info -->
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-sm font-bold text-slate-500 uppercase tracking-wide">Pity Progress</span>
                        <span class="text-2xl font-heading font-bold ${softPityActive ? 'text-amber-500' : 'text-pink-500'}">
                            ${pullsLeft} <span class="text-sm font-normal text-slate-400">pulls left</span>
                        </span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                        <div class="h-full rounded-full transition-all duration-700 ${softPityActive ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-pink-400 to-pink-600'}"
                             style="width:${pityPct}%"></div>
                    </div>
                    ${softPityActive ? '<div class="text-xs text-amber-600 font-bold text-center bg-amber-50 rounded-lg py-1">🔥 Soft Pity Active! SSR rate boosted!</div>' : ''}
                    <div class="mt-3 grid grid-cols-3 gap-1 text-center text-[10px] text-slate-400">
                        <div><span class="font-bold text-pink-500">UR</span><br>0.5%</div>
                        <div><span class="font-bold text-amber-500">SSR</span><br>${softPityActive ? '4.5%+' : '4.5%'}</div>
                        <div><span class="font-bold text-purple-500">SR</span><br>10%</div>
                    </div>
                </div>

                <!-- Single Pull -->
                <button class="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-pink-300 hover:shadow-md transition-all group relative overflow-hidden"
                        onclick="handleGachaPull(1)">
                    <div class="absolute inset-0 bg-gradient-to-br from-pink-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10 flex flex-col items-center gap-3">
                        <div class="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center text-3xl border border-pink-100 group-hover:scale-110 transition-transform">🌸</div>
                        <span class="font-bold text-slate-700 text-lg group-hover:text-pink-600">Summon ×1</span>
                        <div class="flex items-center gap-1.5 bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 group-hover:bg-pink-100">
                            <i class="fa-solid fa-spa text-pink-500 text-sm"></i>
                            <span class="font-bold text-pink-600">10 Petals</span>
                        </div>
                    </div>
                </button>

                <!-- 10 Pull -->
                <button class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all group relative overflow-hidden"
                        onclick="handleGachaPull(10)">
                    <div class="absolute top-2 right-2 bg-amber-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</div>
                    <div class="relative z-10 flex flex-col items-center gap-3">
                        <div class="flex gap-1 text-2xl group-hover:scale-110 transition-transform">🌸🌸🌸</div>
                        <span class="font-bold text-amber-700 text-lg">Summon ×10</span>
                        <div class="flex items-center gap-1.5 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-200">
                            <i class="fa-solid fa-spa text-amber-600 text-sm"></i>
                            <span class="font-bold text-amber-700">100 Petals</span>
                        </div>
                    </div>
                </button>
            </div>

            <!-- Stats -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Summoning History</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="bg-slate-50 rounded-xl p-3">
                        <div class="text-xl font-bold text-slate-700">${formatNumber(gameState.stats.totalPulls || 0)}</div>
                        <div class="text-xs text-slate-400 mt-0.5">Total Pulls</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <div class="text-xl font-bold text-slate-700">${gameState.roster.length}</div>
                        <div class="text-xs text-slate-400 mt-0.5">Heroes Owned</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <div class="text-xl font-bold text-amber-500">${gameState.roster.filter(h => h.rarity === 'SSR' || h.rarity === 'UR').length}</div>
                        <div class="text-xs text-slate-400 mt-0.5">SSR+ Owned</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <div class="text-xl font-bold text-pink-500">${gameState.roster.filter(h => h.rarity === 'UR').length}</div>
                        <div class="text-xs text-slate-400 mt-0.5">UR Owned</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// PULL LOGIC
// ===========================

function handleGachaPull(count) {
    const cost = count * 10;

    if (window.gameState.petals < cost) {
        showToast(`Not enough Petals! Need ${cost} 🌸`, 'error');
        return;
    }

    window.gameState.petals -= cost;
    updateCurrencyDisplay(window.gameState);

    const results = performPullLogic(count);
    saveGame(window.gameState);
    playSummonAnimation(results);
}

function performPullLogic(count) {
    const results = [];

    for (let i = 0; i < count; i++) {
        let rarity;

        // Hard pity
        if (window.gameState.pityCounter >= HARD_PITY) {
            rarity = Math.random() < 0.4 ? 'UR' : 'SSR';
            window.gameState.pityCounter = 0;
        } else {
            rarity = rollRarity(window.gameState.pityCounter);
            if (rarity === 'SSR' || rarity === 'UR') window.gameState.pityCounter = 0;
            else window.gameState.pityCounter++;
        }

        const heroTemplate = getRandomHeroByRarity(rarity);
        if (heroTemplate) {
            const addResult = window.gameState.addHero(heroTemplate.id);
            results.push({
                hero: addResult.hero,
                isNew: !addResult.isDuplicate,
                shards: addResult.shards,
                rarity: rarity
            });
        }

        window.gameState.totalPulls++;
        window.gameState.stats.totalPulls++;
    }

    window.gameState.updateQuest('summon', count);
    window.gameState.checkAchievements();
    return results;
}

function rollRarity(pityCount) {
    const roll = Math.random() * 100;
    let cumulative = 0;

    // Soft pity: linearly increase SSR rate from pull 40 to 50
    let rates = { ...GACHA_RATES };
    if (pityCount >= SOFT_PITY_START) {
        const softBoost = (pityCount - SOFT_PITY_START + 1) * 2.0;
        rates['SSR'] = GACHA_RATES['SSR'] + softBoost;
        rates['N'] = Math.max(20, GACHA_RATES['N'] - softBoost);
    }

    for (const [rarity, rate] of Object.entries(rates)) {
        cumulative += rate;
        if (roll <= cumulative) return rarity;
    }
    return 'N';
}

function getRandomHeroByRarity(rarity) {
    const pool = HEROES_DATABASE.filter(h => h.rarity === rarity);
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : HEROES_DATABASE[0];
}

// ===========================
// SUMMON ANIMATION
// ===========================

function playSummonAnimation(results) {
    const modal    = document.getElementById('modal-overlay');
    const modalBody    = document.getElementById('modal-body');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalBody) return;

    const highestRarity = results.some(r => r.rarity === 'UR') ? 'UR' :
                          results.some(r => r.rarity === 'SSR') ? 'SSR' :
                          results.some(r => r.rarity === 'SR') ? 'SR' :
                          results.some(r => r.rarity === 'R') ? 'R' : 'N';

    const beamColors = { N:'#10B981', R:'#3B82F6', SR:'#8B5CF6', SSR:'#F59E0B', UR:'#EC4899' };
    const beamColor = beamColors[highestRarity];

    modalBody.innerHTML = `
        <div id="gacha-stage" class="h-[680px] flex items-center justify-center bg-slate-950 relative overflow-hidden select-none">
            <div class="absolute inset-0 bg-gradient-radial from-purple-900/30 via-slate-900 to-slate-950"></div>

            <div id="gacha-particles" class="absolute inset-0 z-10 pointer-events-none overflow-hidden"></div>

            <div id="shrine-gate" class="relative z-20 flex flex-col items-center justify-end">
                <div class="w-72 h-[22rem] bg-slate-800/80 border-4 border-slate-600/50 relative flex items-center justify-center shadow-2xl overflow-hidden rounded-t-2xl backdrop-blur">
                    <i class="fa-solid fa-torii-gate text-[8rem] text-slate-700/40"></i>
                    <div id="summon-beam" class="gacha-beam" style="background: linear-gradient(to top, ${beamColor}, white); box-shadow: 0 0 80px ${beamColor};"></div>
                </div>
                <div class="w-96 h-5 bg-slate-700 rounded-full shadow-2xl"></div>
            </div>

            <div id="gacha-flash" class="absolute inset-0 bg-white opacity-0 z-50 pointer-events-none"></div>

            <div class="absolute bottom-6 text-slate-500 text-sm font-medium animate-pulse">Summoning...</div>
        </div>
    `;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    });

    const closeBtn = document.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';

    // Phase 1: Shake & particles
    setTimeout(() => {
        const shrine = document.getElementById('shrine-gate');
        if (shrine) shrine.classList.add('animate-shake-charging');
        spawnSummonParticles(document.getElementById('gacha-particles'), beamColor);
    }, 400);

    // Phase 2: Beam
    setTimeout(() => {
        const beam = document.getElementById('summon-beam');
        if (beam) {
            beam.style.width = '20px';
            beam.style.height = '0%';
            beam.style.opacity = '1';
            beam.style.transition = 'none';
            void beam.offsetWidth;
            beam.style.transition = 'width 1.2s ease-out, height 0.6s ease-in';
            beam.style.height = '100%';
            beam.style.width = highestRarity === 'UR' ? '280px' : highestRarity === 'SSR' ? '200px' : '120px';
        }
    }, 1800);

    // Phase 3: Flash
    setTimeout(() => {
        const flash = document.getElementById('gacha-flash');
        if (!flash) return;
        if (highestRarity === 'UR') flash.style.background = 'linear-gradient(45deg, #ec4899, #8b5cf6, #f59e0b, #10b981)';
        else if (highestRarity === 'SSR') flash.style.background = '#FEF9C3';
        else flash.style.background = 'white';
        flash.style.animation = 'screen-flash-white 0.6s ease-out forwards';
    }, 3200);

    // Phase 4: Results
    setTimeout(() => {
        showGachaResults(results);
        if (closeBtn) closeBtn.style.display = 'flex';
    }, 3900);
}

function spawnSummonParticles(container, color) {
    if (!container) return;
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            const size = Math.random() * 8 + 3;
            p.style.cssText = `
                position: absolute;
                width: ${size}px; height: ${size}px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color};
                left: ${15 + Math.random() * 70}%;
                bottom: ${80 + Math.random() * 50}px;
                animation: float-up-fast ${1 + Math.random()}s ease-out forwards;
                opacity: 0.8;
            `;
            container.appendChild(p);
            setTimeout(() => p.remove(), 2000);
        }, Math.random() * 1500);
    }
}

// ===========================
// RESULTS DISPLAY
// ===========================

function showGachaResults(results) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'bg-gradient-to-b from-slate-900 to-slate-800 p-8 text-center min-h-[600px] flex flex-col';

    // Title
    const hasUR  = results.some(r => r.rarity === 'UR');
    const hasSSR = results.some(r => r.rarity === 'SSR');
    const titleEl = document.createElement('h3');
    titleEl.className = `text-3xl font-heading font-bold mb-6 ${hasUR ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-amber-400' : hasSSR ? 'text-amber-400' : 'text-white'}`;
    titleEl.textContent = hasUR ? '✨ ULTRA RARE OBTAINED! ✨' : hasSSR ? '⭐ SSR OBTAINED! ⭐' : 'Summoning Results';
    container.appendChild(titleEl);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 flex-1';

    results.forEach((r, idx) => {
        const elColor = ELEMENT_COLORS[r.hero.element] || ELEMENT_COLORS['Fire'];
        const rarityGlows = { UR:'ring-4 ring-pink-400 shadow-pink-400/50', SSR:'ring-2 ring-amber-400 shadow-amber-400/50', SR:'ring-1 ring-purple-400', R:'ring-1 ring-blue-400', N:'ring-1 ring-emerald-400' };

        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center animate-entry';
        wrapper.style.animationDelay = `${idx * 0.08}s`;

        const rarityGlow = rarityGlows[r.rarity] || '';

        wrapper.innerHTML = `
            <div class="w-full aspect-[3/4] relative rounded-xl overflow-hidden shadow-xl ${rarityGlow} group cursor-pointer mb-2">
                <img src="images/${r.hero.id}.jpg"
                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     onerror="this.parentElement.innerHTML='<div class=\'absolute inset-0 bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-white text-4xl font-bold\'>${r.hero.name.substring(0,2).toUpperCase()}</div>'">

                <div class="absolute top-2 left-2 right-2 flex justify-between">
                    ${r.isNew ? '<span class="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md animate-bounce">NEW!</span>' :
                               `<span class="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md">+${r.shards} ✨</span>`}
                    <span class="badge-${r.rarity} text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md">${r.rarity}</span>
                </div>

                ${r.rarity === 'UR' || r.rarity === 'SSR' ? `
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div class="absolute bottom-0 inset-x-0 p-2">
                        <div class="text-white text-xs font-bold truncate">${r.hero.name}</div>
                        <div class="text-[9px] ${elColor.text} font-bold">${elColor.emoji} ${r.hero.element}</div>
                    </div>
                </div>` : `
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div class="text-white text-xs font-bold truncate">${r.hero.name}</div>
                </div>`}
            </div>
            <div class="text-slate-300 text-xs font-medium">${r.hero.class}</div>
        `;

        grid.appendChild(wrapper);
    });

    container.appendChild(grid);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'flex gap-3 justify-center';

    const pullAgainBtn = document.createElement('button');
    pullAgainBtn.className = 'btn bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 text-base shadow-lg hover:scale-105 transition-transform';
    pullAgainBtn.innerHTML = '<i class="fa-solid fa-rotate-right mr-2"></i> Pull Again';
    pullAgainBtn.onclick = () => {
        closeModal();
        setTimeout(() => handleGachaPull(results.length), 100);
    };

    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn bg-slate-700 text-white px-8 py-3 text-base hover:bg-slate-600';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = () => {
        closeModal();
        renderGacha(window.gameState);
        updateUI(window.gameState);
    };

    btnRow.appendChild(pullAgainBtn);
    btnRow.appendChild(continueBtn);
    container.appendChild(btnRow);
    modalBody.appendChild(container);
}
