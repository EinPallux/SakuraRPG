/* =========================================
   SAKURA CHRONICLES - GACHA SYSTEM v3.0
   Cinematic Summon Experience
   ========================================= */

// ── Rarity Cinema Themes ────────────────────────────────────────────────────
const GACHA_CINEMA_THEMES = {
    N:   { bgFrom:'#0b1829', bgTo:'#07111c', aura:'#10b981', beam:'#34d399', label:'Summoning…',      labelClass:'gc-label-n' },
    R:   { bgFrom:'#080f28', bgTo:'#050a1e', aura:'#3b82f6', beam:'#60a5fa', label:'Rare Summon!',    labelClass:'gc-label-r' },
    SR:  { bgFrom:'#100722', bgTo:'#080418', aura:'#8b5cf6', beam:'#a78bfa', label:'✦ Super Rare ✦',  labelClass:'gc-label-sr' },
    SSR: { bgFrom:'#221000', bgTo:'#160a00', aura:'#f59e0b', beam:'#fbbf24', label:'★ SSR Obtained ★', labelClass:'gc-label-ssr' },
    UR:  { bgFrom:'#180026', bgTo:'#0e001a', aura:'#ec4899', beam:'#f472b6', label:'✦ ULTRA RARE ✦', labelClass:'gc-label-ur' },
};
const _rarityColors = { N:'#10b981', R:'#3b82f6', SR:'#8b5cf6', SSR:'#f59e0b', UR:'#ec4899' };
const _rarityOrder  = ['N','R','SR','SSR','UR'];

// ── Skip-aware async wait ────────────────────────────────────────────────────
let _gcActive  = false;
let _gcSkipped = false;
let _gcSkipFns = [];

function _gcWait(ms) {
    if (_gcSkipped || ms <= 0) return Promise.resolve();
    return new Promise(res => {
        const t = setTimeout(res, ms);
        _gcSkipFns.push(() => { clearTimeout(t); res(); });
    });
}

function _gcSkipAll() {
    _gcSkipped = true;
    _gcSkipFns.forEach(fn => fn());
    _gcSkipFns = [];
}

window._gcSkipFn = _gcSkipAll;

// ── Helpers ──────────────────────────────────────────────────────────────────
function _gcGetHighest(results) {
    let best = 'N';
    results.forEach(r => {
        if (_rarityOrder.indexOf(r.rarity) > _rarityOrder.indexOf(best)) best = r.rarity;
    });
    return best;
}

// ─────────────────────────────────────────────────────────────────────────────
//   GACHA PAGE RENDER
// ─────────────────────────────────────────────────────────────────────────────

function renderGacha(gameState) {
    const container = document.getElementById('gacha-tab');
    if (!container) return;

    const pityPct       = Math.min(100, (gameState.pityCounter / HARD_PITY) * 100);
    const softPityActive = gameState.pityCounter >= SOFT_PITY_START;
    const pullsLeft     = HARD_PITY - gameState.pityCounter;
    const featuredUR    = HEROES_DATABASE.find(h => h.rarity === 'UR') || HEROES_DATABASE[HEROES_DATABASE.length - 1];
    const elColor       = ELEMENT_COLORS[featuredUR.element] || ELEMENT_COLORS['Light'];
    const totalPulls    = gameState.stats?.totalPulls || 0;
    const ownedSSRPlus  = gameState.roster.filter(h => h.rarity === 'SSR' || h.rarity === 'UR').length;
    const ownedUR       = gameState.roster.filter(h => h.rarity === 'UR').length;
    const petals        = gameState.petals || 0;

    const sparkles = Array.from({length:14}).map(() => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const s = (Math.random() * 0.5 + 0.3).toFixed(2);
        const d = (Math.random() * 4 + 2).toFixed(1);
        const size = (Math.random() * 4 + 2).toFixed(0);
        return `<div class="gch-sparkle" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;transform:scale(${s});animation-duration:${d}s;animation-delay:${(Math.random()*3).toFixed(1)}s"></div>`;
    }).join('');

    container.innerHTML = `
    <div class="gch-page">

        <!-- ── Banner ── -->
        <div class="gch-banner" onclick="handleGachaPull(10)" role="button" aria-label="×10 Summon">
            <div class="gch-banner-bg" style="background-image:url('images/${featuredUR.id}.jpg')"></div>
            <div class="gch-banner-overlay"></div>
            <div class="gch-sparkle-layer">${sparkles}</div>

            <div class="gch-banner-badge">✦ Standard Banner</div>

            <div class="gch-banner-info">
                <div class="gch-banner-subtitle">Legends of Sakura</div>
                <h2 class="gch-banner-title">SUMMON NOW</h2>
                <p class="gch-banner-desc">45 unique heroes · Guaranteed SSR at ${HARD_PITY} pulls</p>
            </div>

            <div class="gch-banner-cta">
                <i class="fa-solid fa-bolt-lightning"></i> ×10 Pull
            </div>
        </div>

        <!-- ── Action Row ── -->
        <div class="gch-action-row">

            <!-- Pity Card -->
            <div class="gch-pity-card ${softPityActive ? 'soft-pity-active' : ''}">
                <div class="gch-pity-header">
                    <span class="gch-pity-label">Pity Progress</span>
                    <span class="gch-pity-count ${softPityActive ? 'text-amber' : ''}">${pullsLeft} <em>left</em></span>
                </div>
                <div class="gch-pity-bar-track">
                    <div class="gch-pity-bar-fill ${softPityActive ? 'soft' : ''}" style="width:${pityPct}%"></div>
                    ${softPityActive ? '<div class="gch-soft-pulse"></div>' : ''}
                </div>
                ${softPityActive ? '<div class="gch-soft-badge">🔥 Soft Pity — SSR Rate Boosted!</div>' : ''}
                <div class="gch-rate-row">
                    <div class="gch-rate-item ur">UR <span>0.5%</span></div>
                    <div class="gch-rate-item ssr">SSR <span>${softPityActive ? '4.5%+' : '4.5%'}</span></div>
                    <div class="gch-rate-item sr">SR <span>10%</span></div>
                    <div class="gch-rate-item r">R <span>25%</span></div>
                </div>
            </div>

            <!-- ×1 Pull -->
            <button class="gch-pull-btn gch-pull-one" onclick="handleGachaPull(1)" aria-label="Single summon">
                <div class="gch-pull-orb">🌸</div>
                <div class="gch-pull-name">Summon ×1</div>
                <div class="gch-pull-cost">
                    <i class="fa-solid fa-spa"></i> 10 Petals
                </div>
                <div class="gch-pull-glow"></div>
            </button>

            <!-- ×10 Pull -->
            <button class="gch-pull-btn gch-pull-ten" onclick="handleGachaPull(10)" aria-label="Ten summon">
                <div class="gch-pull-badge">BEST VALUE</div>
                <div class="gch-pull-orb gch-pull-orb-trio">🌸🌸🌸</div>
                <div class="gch-pull-name">Summon ×10</div>
                <div class="gch-pull-cost gch-pull-cost-gold">
                    <i class="fa-solid fa-spa"></i> 100 Petals
                </div>
                <div class="gch-pull-glow gch-pull-glow-gold"></div>
            </button>

        </div>

        <!-- ── Stats Card ── -->
        <div class="gch-stats-card">
            <h3 class="gch-stats-title"><i class="fa-solid fa-chart-column"></i> Summoning History</h3>
            <div class="gch-stats-grid">
                <div class="gch-stat-item">
                    <div class="gch-stat-val">${formatNumber(totalPulls)}</div>
                    <div class="gch-stat-lbl">Total Pulls</div>
                </div>
                <div class="gch-stat-item">
                    <div class="gch-stat-val">${gameState.roster.length}</div>
                    <div class="gch-stat-lbl">Heroes Owned</div>
                </div>
                <div class="gch-stat-item ssr-col">
                    <div class="gch-stat-val">${ownedSSRPlus}</div>
                    <div class="gch-stat-lbl">SSR+ Owned</div>
                </div>
                <div class="gch-stat-item ur-col">
                    <div class="gch-stat-val">${ownedUR}</div>
                    <div class="gch-stat-lbl">UR Owned</div>
                </div>
            </div>
        </div>

    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//   PULL LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function handleGachaPull(count) {
    const cost = count * 10;
    if (window.gameState.petals < cost) {
        showToast(`Need ${cost} Petals — have ${window.gameState.petals} 🌸`, 'error');
        return;
    }
    window.gameState.petals -= cost;
    updateCurrencyDisplay(window.gameState);

    const results = performPullLogic(count);
    saveGame(window.gameState);
    playSummonCinema(results);
}

function performPullLogic(count) {
    const results = [];
    for (let i = 0; i < count; i++) {
        let rarity;
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
            results.push({ hero: addResult.hero, isNew: !addResult.isDuplicate, shards: addResult.shards, rarity });
        }
        window.gameState.totalPulls++;
        window.gameState.stats.totalPulls = (window.gameState.stats.totalPulls || 0) + 1;
    }
    window.gameState.updateQuest('summon', count);
    window.gameState.checkAchievements();
    return results;
}

function rollRarity(pityCount) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let rates = { ...GACHA_RATES };
    if (pityCount >= SOFT_PITY_START) {
        const softBoost = (pityCount - SOFT_PITY_START + 1) * 2.0;
        rates['SSR'] = GACHA_RATES['SSR'] + softBoost;
        rates['N']   = Math.max(20, GACHA_RATES['N'] - softBoost);
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

// ─────────────────────────────────────────────────────────────────────────────
//   CINEMA ENGINE
// ─────────────────────────────────────────────────────────────────────────────

async function playSummonCinema(results) {
    if (_gcActive) return;
    _gcActive  = true;
    _gcSkipped = false;
    _gcSkipFns = [];

    const best  = _gcGetHighest(results);
    const theme = GACHA_CINEMA_THEMES[best];
    const isSSRPlus = best === 'SSR' || best === 'UR';
    const isSingle  = results.length === 1;

    // ── Build root ───────────────────────────────────────────────────────────
    const root = document.createElement('div');
    root.id = 'gc-root';
    root.className = 'gc-root';
    root.style.background = `radial-gradient(ellipse at center, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)`;
    document.body.appendChild(root);

    root.innerHTML = `
        <div class="gc-starfield" id="gc-sf"></div>
        <div class="gc-nebula" id="gc-nb"></div>
        <div class="gc-summon-area" id="gc-sa">
            <div class="gc-ring gc-ring-outer" id="gc-ro" style="border-color:${theme.aura}30"></div>
            <div class="gc-ring gc-ring-inner" id="gc-ri" style="border-color:${theme.aura}55"></div>
            <div class="gc-orb" id="gc-ob" style="--orb-color:${theme.aura};--orb-glow:${theme.beam}"></div>
        </div>
        <div class="gc-beam" id="gc-bm" style="background:linear-gradient(to top, ${theme.aura}, ${theme.beam}, white);box-shadow:0 0 120px 40px ${theme.aura}80"></div>
        <div class="gc-ptcl" id="gc-pt"></div>
        <div class="gc-conv" id="gc-cv-ptcl"></div>
        <div class="gc-flash" id="gc-fl"></div>
        <div class="gc-canvas" id="gc-cv"></div>
        <div class="gc-hud">
            <div class="gc-hud-label ${theme.labelClass}" id="gc-lb">${theme.label}</div>
        </div>
        <button class="gc-skip" id="gc-skip-btn" onclick="window._gcSkipFn()">
            <i class="fa-solid fa-forward"></i> Skip
        </button>
    `;

    requestAnimationFrame(() => root.classList.add('gc-root-visible'));

    // ── Stars ─────────────────────────────────────────────────────────────────
    const sfEl = document.getElementById('gc-sf');
    for (let i = 0; i < 140; i++) {
        const s = document.createElement('div');
        s.className = 'gc-star';
        s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${Math.random()*2.5+0.5}px;height:${Math.random()*2.5+0.5}px;animation-delay:${(Math.random()*4).toFixed(2)}s;animation-duration:${(Math.random()*3+2).toFixed(2)}s`;
        sfEl.appendChild(s);
    }

    // ── Nebula blobs ──────────────────────────────────────────────────────────
    const nbEl = document.getElementById('gc-nb');
    const nbColors = [theme.aura, theme.beam, '#ffffff'];
    for (let i = 0; i < 4; i++) {
        const b = document.createElement('div');
        b.className = 'gc-nebula-blob';
        b.style.cssText = `background:radial-gradient(circle, ${nbColors[i%3]}22 0%, transparent 70%);width:${250+Math.random()*200}px;height:${250+Math.random()*200}px;left:${Math.random()*80}%;top:${Math.random()*80}%;animation-delay:${(Math.random()*3).toFixed(1)}s`;
        nbEl.appendChild(b);
    }

    const orbEl = document.getElementById('gc-ob');
    const riEl  = document.getElementById('gc-ri');
    const roEl  = document.getElementById('gc-ro');
    const lbEl  = document.getElementById('gc-lb');
    const bmEl  = document.getElementById('gc-bm');
    const flEl  = document.getElementById('gc-fl');
    const ptEl  = document.getElementById('gc-pt');
    const cvEl  = document.getElementById('gc-cv');
    const cvPtEl= document.getElementById('gc-cv-ptcl');

    // ── Phase 1: Ambient warm-up ──────────────────────────────────────────────
    await _gcWait(500);

    // ── Phase 2: Orb appears + rings spin ────────────────────────────────────
    orbEl.classList.add('gc-orb-appear');
    riEl.classList.add('gc-ring-spin-inner');
    roEl.classList.add('gc-ring-spin-outer');

    // converging particles
    _gcConvParticles(cvPtEl, theme.aura, 30);
    await _gcWait(900);

    // ── Phase 3: Anticipation (SSR/UR) ───────────────────────────────────────
    if (isSSRPlus) {
        lbEl.textContent = best === 'UR' ? '✦ Something Legendary Stirs…' : '⚡ A Powerful Presence…';
        orbEl.classList.add('gc-orb-charge');
        roEl.style.animation = 'gc-ring-spin-cw 0.4s linear infinite';
        riEl.style.animation = 'gc-ring-spin-ccw 0.4s linear infinite';
        await _gcWait(best === 'UR' ? 1400 : 900);
    }

    // ── Phase 4: UR Blackout ──────────────────────────────────────────────────
    if (best === 'UR' && !_gcSkipped) {
        const bo = document.createElement('div');
        bo.className = 'gc-blackout';
        root.appendChild(bo);
        requestAnimationFrame(() => bo.style.opacity = '0.92');
        await _gcWait(500);
        bo.style.opacity = '0';
        await _gcWait(600);
        bo.remove();
    }

    // ── Phase 5: Burst ────────────────────────────────────────────────────────
    lbEl.textContent = theme.label;
    lbEl.className   = `gc-hud-label ${theme.labelClass} gc-label-burst`;

    orbEl.classList.add('gc-orb-burst');
    roEl.classList.add('gc-ring-expand');
    riEl.classList.add('gc-ring-expand');

    _gcBurstParticles(ptEl, theme.aura, best);

    const beamWidth = { N:60, R:100, SR:150, SSR:230, UR:340 }[best] || 100;
    bmEl.style.width   = `${beamWidth}px`;
    bmEl.style.opacity = '1';
    bmEl.classList.add('gc-beam-fire');

    await _gcWait(400);

    // ── Phase 6: Flash ────────────────────────────────────────────────────────
    if (best === 'UR') {
        flEl.style.background = 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #f59e0b, #10b981, #3b82f6, #ec4899)';
    } else if (best === 'SSR') {
        flEl.style.background = `radial-gradient(circle, #fef3c7, ${theme.beam}, ${theme.aura})`;
    } else {
        flEl.style.background = `radial-gradient(circle, white, ${theme.beam})`;
    }
    flEl.classList.add('gc-flash-on');
    await _gcWait(180);
    flEl.classList.remove('gc-flash-on');
    flEl.classList.add('gc-flash-off');

    await _gcWait(220);

    // ── Phase 7: Reveal ───────────────────────────────────────────────────────
    // Fade out animation elements
    orbEl.style.opacity  = '0';
    bmEl.style.opacity   = '0';
    ptEl.style.opacity   = '0';
    cvPtEl.style.opacity = '0';

    if (isSingle) {
        await _gcRevealOne(cvEl, results[0], best, root, theme);
    } else {
        await _gcRevealGrid(cvEl, results, best, root, theme);
    }

    // ── Phase 8: Actions ──────────────────────────────────────────────────────
    const skipBtn = document.getElementById('gc-skip-btn');
    if (skipBtn) skipBtn.style.display = 'none';

    _gcActive  = false;
    _gcSkipped = false;
    _gcSkipFns = [];
}

// ─────────────────────────────────────────────────────────────────────────────
//   PARTICLE SYSTEMS
// ─────────────────────────────────────────────────────────────────────────────

function _gcConvParticles(container, color, count) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'gc-conv-particle';
        const edge = Math.floor(Math.random() * 4);
        let sx, sy;
        if (edge === 0) { sx = Math.random() * 100; sy = -5; }
        else if (edge === 1) { sx = 105; sy = Math.random() * 100; }
        else if (edge === 2) { sx = Math.random() * 100; sy = 105; }
        else { sx = -5; sy = Math.random() * 100; }
        p.style.cssText = `left:${sx}%;top:${sy}%;background:${color};box-shadow:0 0 6px ${color};transition:transform ${(1.5+Math.random()).toFixed(2)}s ease-in;transition-delay:${(Math.random()*0.8).toFixed(2)}s`;
        container.appendChild(p);
        requestAnimationFrame(() => {
            const dx = 50 - sx;
            const dy = 50 - sy;
            p.style.transform = `translate(${dx * 4}px, ${dy * 4}px) scale(0)`;
        });
        setTimeout(() => p.remove(), 2500);
    }
}

function _gcBurstParticles(container, color, rarity) {
    if (!container) return;
    const n = { N:28, R:40, SR:55, SSR:70, UR:100 }[rarity] || 40;
    for (let i = 0; i < n; i++) {
        const p = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const dist  = 80 + Math.random() * 350;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const size = Math.random() * 8 + 3;
        const dur  = (0.6 + Math.random() * 0.8).toFixed(2);
        const colors = rarity === 'UR'
            ? ['#ec4899','#8b5cf6','#f59e0b','#f472b6','#c084fc','#fbbf24']
            : [color, color + 'cc', '#ffffff'];
        const c = colors[Math.floor(Math.random() * colors.length)];
        p.className = 'gc-burst-particle';
        p.style.cssText = `width:${size}px;height:${size}px;background:${c};box-shadow:0 0 ${size*2}px ${c};--x:${x}px;--y:${y}px;animation-duration:${dur}s;animation-delay:${(Math.random()*0.2).toFixed(2)}s`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//   CARD REVEALS
// ─────────────────────────────────────────────────────────────────────────────

async function _gcRevealOne(container, result, best, root, theme) {
    const elColor = ELEMENT_COLORS[result.hero.element] || ELEMENT_COLORS['Fire'];
    const shine   = (best === 'SSR' || best === 'UR') ? '<div class="gc-card-shine"></div>' : '';
    const stars   = _gcRarityStars(result.rarity);

    container.innerHTML = `
        <div class="gc-reveal-single">
            <div class="gc-card-wrap" id="gc-cw">
                <div class="gc-flip-inner" id="gc-fi">
                    <div class="gc-face gc-face-back">
                        <div class="gc-back-orb" style="background:radial-gradient(circle, ${theme.beam}44, ${theme.aura}22, transparent);box-shadow:0 0 60px 20px ${theme.aura}55"></div>
                        <div class="gc-back-rune"></div>
                    </div>
                    <div class="gc-face gc-face-front gc-rarity-${result.rarity}">
                        <img class="gc-hero-img" src="images/${result.hero.id}.jpg"
                             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="gc-hero-fallback" style="background:linear-gradient(135deg, ${elColor.from.replace('from-','')}, ${elColor.to.replace('to-','')})">
                            <span>${result.hero.name.substring(0,2).toUpperCase()}</span>
                        </div>
                        ${shine}
                        <div class="gc-hero-overlay">
                            <div class="gc-hero-rarity-badge gc-rb-${result.rarity}">${result.rarity}</div>
                            <div class="gc-hero-stars">${stars}</div>
                            <div class="gc-hero-name">${result.hero.name}</div>
                            <div class="gc-hero-meta">
                                <span class="gc-hero-class">${result.hero.class}</span>
                                <span class="gc-hero-element ${elColor.text}">${elColor.emoji} ${result.hero.element}</span>
                            </div>
                            ${result.isNew
                                ? '<div class="gc-hero-new-badge">✦ NEW HERO ✦</div>'
                                : `<div class="gc-hero-shard-badge">+${result.shards} ✨ Shards</div>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    await _gcWait(200);
    const fi = document.getElementById('gc-fi');
    if (fi) fi.classList.add('gc-flipped');

    await _gcWait(800);
    _gcShowSingleActions(container, result, root);
}

async function _gcRevealGrid(container, results, best, root, theme) {
    const cols = results.length <= 5 ? results.length : Math.ceil(results.length / 2);

    container.innerHTML = `
        <div class="gc-reveal-grid" style="--gc-cols:${Math.min(cols, 5)}">
            ${results.map((r, i) => {
                const elColor = ELEMENT_COLORS[r.hero.element] || ELEMENT_COLORS['Fire'];
                return `
                <div class="gc-mini-wrap" id="gc-mw-${i}">
                    <div class="gc-mini-inner" id="gc-mi-${i}">
                        <div class="gc-mini-back" style="border-color:${theme.aura}44">
                            <div class="gc-mini-back-glow" style="background:${theme.aura}33"></div>
                        </div>
                        <div class="gc-mini-front gc-rarity-${r.rarity}">
                            <img class="gc-mini-img" src="images/${r.hero.id}.jpg"
                                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                            <div class="gc-mini-fallback" style="background:linear-gradient(135deg,${elColor.from.replace('from-','')},${elColor.to.replace('to-','')})">
                                <span>${r.hero.name.substring(0,2).toUpperCase()}</span>
                            </div>
                            <div class="gc-mini-overlay">
                                <div class="gc-mini-rb gc-rb-${r.rarity}">${r.rarity}</div>
                                <div class="gc-mini-name">${r.hero.name}</div>
                                ${r.isNew ? '<div class="gc-mini-new">NEW!</div>' : `<div class="gc-mini-shards">+${r.shards}✨</div>`}
                            </div>
                            ${r.rarity === 'SSR' || r.rarity === 'UR' ? '<div class="gc-mini-shine"></div>' : ''}
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;

    // Staggered flips
    for (let i = 0; i < results.length; i++) {
        await _gcWait(_gcSkipped ? 0 : 120);
        const mi = document.getElementById(`gc-mi-${i}`);
        if (mi) {
            mi.classList.add('gc-mini-flipped');
            // Particle flash on high rarity
            if (results[i].rarity === 'SSR' || results[i].rarity === 'UR') {
                _gcMiniFlash(document.getElementById(`gc-mw-${i}`), _rarityColors[results[i].rarity]);
            }
        }
    }

    await _gcWait(600);
    _gcShowGridActions(container, results, root);
}

function _gcMiniFlash(wrapper, color) {
    if (!wrapper) return;
    const f = document.createElement('div');
    f.className = 'gc-mini-fl';
    f.style.background = color;
    wrapper.appendChild(f);
    setTimeout(() => f.remove(), 500);
}

function _gcShowSingleActions(container, result, root) {
    const existing = root.querySelector('.gc-actions');
    if (existing) existing.remove();

    const actions = document.createElement('div');
    actions.className = 'gc-actions';
    actions.innerHTML = `
        <button class="gc-act-btn gc-act-collect" onclick="_gcClose()">
            <i class="fa-solid fa-check"></i> Collect
        </button>
        <button class="gc-act-btn gc-act-again" onclick="_gcPullAgain(${result.rarity === 'UR' ? 10 : 1})">
            <i class="fa-solid fa-rotate-right"></i> Pull Again
        </button>
    `;
    root.appendChild(actions);
    requestAnimationFrame(() => actions.classList.add('gc-actions-show'));
}

function _gcShowGridActions(container, results, root) {
    const existing = root.querySelector('.gc-actions');
    if (existing) existing.remove();

    const actions = document.createElement('div');
    actions.className = 'gc-actions';
    actions.innerHTML = `
        <button class="gc-act-btn gc-act-collect" onclick="_gcClose()">
            <i class="fa-solid fa-check"></i> Collect All
        </button>
        <button class="gc-act-btn gc-act-again" onclick="_gcPullAgain(${results.length})">
            <i class="fa-solid fa-rotate-right"></i> Pull ×${results.length}
        </button>
    `;
    root.appendChild(actions);
    requestAnimationFrame(() => actions.classList.add('gc-actions-show'));
}

window._gcClose = function() {
    const root = document.getElementById('gc-root');
    if (root) {
        root.classList.remove('gc-root-visible');
        setTimeout(() => { root.remove(); }, 500);
    }
    renderGacha(window.gameState);
    updateUI(window.gameState);
};

window._gcPullAgain = function(count) {
    const root = document.getElementById('gc-root');
    if (root) root.remove();
    _gcActive  = false;
    _gcSkipped = false;
    setTimeout(() => handleGachaPull(count), 80);
};

// ─────────────────────────────────────────────────────────────────────────────
//   UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function _gcRarityStars(rarity) {
    const counts = { N:1, R:2, SR:3, SSR:4, UR:5 };
    const n = counts[rarity] || 1;
    const colors = { N:'#10b981', R:'#3b82f6', SR:'#8b5cf6', SSR:'#f59e0b', UR:'#ec4899' };
    const c = colors[rarity] || '#fff';
    return Array.from({length:n}).map(() => `<i class="fa-solid fa-star" style="color:${c};filter:drop-shadow(0 0 4px ${c})"></i>`).join('');
}
