/* =========================================
   SAKURA CHRONICLES - TUTORIAL SYSTEM
   First-Time Onboarding & Interactive Guide
   ========================================= */

const TUTORIAL_STORAGE_KEY = 'sakura_tutorial_done';

// ===========================
// TUTORIAL STEP DEFINITIONS
// ===========================

const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: '🌸 Welcome to Sakura Chronicles!',
        text: 'You\'re about to embark on an epic anime-style RPG adventure! This quick guide will show you the ropes. Ready?',
        target: null,
        position: 'center',
        action: null,
        buttonText: 'Let\'s Go! ✨',
    },
    {
        id: 'navigation',
        title: '🗺️ Navigation',
        text: 'Use the sidebar (or the bottom bar on mobile) to switch between different sections of the game. Each section has unique content!',
        target: '#desktop-nav',
        position: 'right',
        action: null,
        buttonText: 'Got it!',
        mobileTarget: '#mobile-nav',
    },
    {
        id: 'heroes-intro',
        title: '👥 Your Hero Roster',
        text: 'Go to the <strong>Heroes</strong> page to manage your collection! Each hero has unique stats, elements, and skills.',
        target: '[data-target="roster"]',
        position: 'right',
        action: () => { if (typeof switchView === 'function') switchView('roster'); },
        buttonText: 'View Heroes',
        mobileTarget: '[data-target="roster"].mobile-nav-item',
    },
    {
        id: 'hero-card',
        title: '🃏 Hero Cards',
        text: 'Each hero card shows their rarity (N → R → SR → SSR → UR), element, class, and power level. Tap a card to see full details and equip items!',
        target: '#roster-grid',
        position: 'top',
        action: null,
        buttonText: 'Understood!',
    },
    {
        id: 'team-formation',
        title: '⚔️ Build Your Team',
        text: 'Head to <strong>Battle</strong> to set up your team. You can slot up to 5 heroes — mix classes for the best results! Healers, Tanks, and DPS work great together.',
        target: '[data-target="battle"]',
        position: 'right',
        action: () => { if (typeof switchView === 'function') switchView('battle'); },
        buttonText: 'Set Up Team',
        mobileTarget: '[data-target="battle"].mobile-nav-item',
    },
    {
        id: 'team-slots',
        title: '🧩 Team Slots',
        text: 'Click any empty slot to assign a hero. Your team composition matters — Tanks protect Healers, Buffers power up DPS, and DPS deals the damage!',
        target: '#pre-battle-team',
        position: 'top',
        action: null,
        buttonText: 'Nice!',
    },
    {
        id: 'start-battle',
        title: '🚀 Start a Run!',
        text: 'Once your team is ready, hit <strong>Start Run</strong> to begin wave-based combat. Enemies get harder each wave. How far can you go?',
        target: 'button[onclick="startRun(window.gameState)"]',
        position: 'top',
        action: null,
        buttonText: 'Ready to fight!',
    },
    {
        id: 'battle-explained',
        title: '💥 Auto Battle',
        text: 'Battle is automatic! Your heroes fight on their own each turn. Watch the <strong>Combat Log</strong> on the left for turn-by-turn details.',
        target: '#combat-log',
        position: 'right',
        action: null,
        buttonText: 'I see!',
        skipIfMissing: true,
    },
    {
        id: 'ultimates',
        title: '✨ Ultimates',
        text: 'As heroes take and deal damage, their <strong>MP</strong> charges. When full, use their <strong>Ultimate</strong> for devastating effects! Enable Auto to use them automatically.',
        target: '#ultimates-list',
        position: 'left',
        action: null,
        buttonText: 'Powerful!',
        skipIfMissing: true,
    },
    {
        id: 'battle-speed',
        title: '⚡ Battle Speed',
        text: 'Combat too slow? Toggle the <strong>Speed</strong> button to play at 2× or 3× speed. You can also toggle <strong>Auto</strong> to have heroes use ultimates automatically!',
        target: '#speed-btn',
        position: 'left',
        action: null,
        buttonText: 'Sweet!',
        skipIfMissing: true,
    },
    {
        id: 'gacha-intro',
        title: '🎰 Summon New Heroes',
        text: 'Visit the <strong>Summon</strong> tab to pull new heroes using Spirit Petals. There are 45 unique heroes to collect, including rare SSR and UR units!',
        target: '[data-target="gacha"]',
        position: 'right',
        action: () => { if (typeof switchView === 'function') switchView('gacha'); },
        buttonText: 'Let me summon!',
        mobileTarget: '[data-target="gacha"].mobile-nav-item',
    },
    {
        id: 'pity-system',
        title: '🎲 Pity System',
        text: 'Every pull increases your pity counter. After 40 pulls the SSR rate increases, and you\'re <strong>guaranteed</strong> an SSR/UR by pull 50. Never lose your luck!',
        target: '#gacha-pity-bar',
        position: 'bottom',
        action: null,
        buttonText: 'Great system!',
        skipIfMissing: true,
    },
    {
        id: 'progression',
        title: '📈 Progression Systems',
        text: 'Level up heroes with Gold, craft equipment in the <strong>Forge</strong>, grow herbs in the <strong>Garden</strong>, and invest Spirit Orbs in the <strong>Yggdrasil</strong> skill tree for permanent bonuses!',
        target: null,
        position: 'center',
        action: null,
        buttonText: 'I\'m ready!',
    },
    {
        id: 'finish',
        title: '🌸 You\'re All Set!',
        text: 'That\'s everything! Start your adventure, defeat powerful bosses, collect all 45 heroes, and write your own Sakura Chronicle. Good luck, Summoner! 🗡️',
        target: null,
        position: 'center',
        action: null,
        buttonText: 'Begin Adventure! 🌸',
        isLast: true,
    },
];

// ===========================
// TUTORIAL STATE
// ===========================

let _tutorialActive = false;
let _tutorialStep   = 0;
let _spotlightEl    = null;

// ===========================
// PUBLIC API
// ===========================

function startTutorial(force = false) {
    if (!force && localStorage.getItem(TUTORIAL_STORAGE_KEY)) return;
    _tutorialStep  = 0;
    _tutorialActive = true;
    _buildTutorialDOM();
    _showStep(_tutorialStep);
}

function skipTutorial() {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
    _destroyTutorialDOM();
    _tutorialActive = false;
}

window.tutorialNext = function() {
    _tutorialStep++;
    if (_tutorialStep >= TUTORIAL_STEPS.length) {
        skipTutorial();
        return;
    }
    _showStep(_tutorialStep);
};

window.tutorialSkip = skipTutorial;
window.startTutorial = startTutorial;

// ===========================
// DOM BUILDER
// ===========================

function _buildTutorialDOM() {
    // Remove any existing tutorial UI
    _destroyTutorialDOM();

    // Dark overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) {} }; // block clicks through
    document.body.appendChild(overlay);

    // Spotlight hole (transparent cutout that tracks target element)
    const spot = document.createElement('div');
    spot.id = 'tutorial-spotlight';
    spot.className = 'tutorial-spotlight';
    document.body.appendChild(spot);
    _spotlightEl = spot;

    // Dialog box
    const dialog = document.createElement('div');
    dialog.id = 'tutorial-dialog';
    dialog.className = 'tutorial-dialog';
    dialog.innerHTML = `
        <div class="tutorial-dialog-header">
            <div class="tutorial-guide-avatar">🌸</div>
            <div class="tutorial-progress-dots" id="tutorial-dots"></div>
            <button class="tutorial-skip-btn" onclick="tutorialSkip()">Skip</button>
        </div>
        <div class="tutorial-dialog-body">
            <h3 class="tutorial-title" id="tutorial-title"></h3>
            <p class="tutorial-text"  id="tutorial-text"></p>
        </div>
        <div class="tutorial-dialog-footer">
            <div class="tutorial-step-counter" id="tutorial-counter"></div>
            <button class="tutorial-next-btn" id="tutorial-next-btn" onclick="tutorialNext()">Next</button>
        </div>
    `;
    document.body.appendChild(dialog);
}

function _destroyTutorialDOM() {
    ['tutorial-overlay','tutorial-spotlight','tutorial-dialog'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    _spotlightEl = null;
}

// ===========================
// STEP RENDERER
// ===========================

function _showStep(idx) {
    const step   = TUTORIAL_STEPS[idx];
    if (!step) { skipTutorial(); return; }

    // Run step action (e.g. navigate to a tab)
    if (step.action) {
        try { step.action(); } catch(e) {}
    }

    // Allow DOM to settle before positioning
    setTimeout(() => {
        const titleEl   = document.getElementById('tutorial-title');
        const textEl    = document.getElementById('tutorial-text');
        const nextBtn   = document.getElementById('tutorial-next-btn');
        const counterEl = document.getElementById('tutorial-counter');
        const dotsEl    = document.getElementById('tutorial-dots');

        if (titleEl)   titleEl.textContent = step.title;
        if (textEl)    textEl.innerHTML    = step.text;
        if (nextBtn)   nextBtn.textContent = step.buttonText || 'Next';
        if (counterEl) counterEl.textContent = `${idx + 1} / ${TUTORIAL_STEPS.length}`;

        // Progress dots
        if (dotsEl) {
            dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) =>
                `<div class="tut-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}"></div>`
            ).join('');
        }

        // Spotlight target
        let targetEl = step.target ? document.querySelector(step.target) : null;
        if (!targetEl && step.mobileTarget) targetEl = document.querySelector(step.mobileTarget);
        if (!targetEl && step.skipIfMissing) { window.tutorialNext(); return; }

        _positionSpotlight(targetEl);
        _positionDialog(targetEl, step.position);
    }, step.action ? 350 : 50);
}

function _positionSpotlight(el) {
    const spot = document.getElementById('tutorial-spotlight');
    if (!spot) return;

    if (!el) {
        spot.style.cssText = 'display:none';
        return;
    }

    const r = el.getBoundingClientRect();
    const pad = 8;
    spot.style.cssText = `
        display: block;
        top: ${r.top - pad + window.scrollY}px;
        left: ${r.left - pad}px;
        width: ${r.width + pad * 2}px;
        height: ${r.height + pad * 2}px;
    `;
}

function _positionDialog(targetEl, position) {
    const dialog = document.getElementById('tutorial-dialog');
    if (!dialog) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dw = Math.min(360, vw - 32);

    if (!targetEl || position === 'center') {
        // Centered
        dialog.style.cssText = `
            width: ${dw}px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;
        return;
    }

    const r = targetEl.getBoundingClientRect();
    let top, left;

    switch (position) {
        case 'right':
            top  = Math.min(r.top, vh - 260);
            left = Math.min(r.right + 16, vw - dw - 16);
            break;
        case 'left':
            top  = Math.min(r.top, vh - 260);
            left = Math.max(r.left - dw - 16, 16);
            break;
        case 'bottom':
            top  = r.bottom + 16;
            left = Math.max(16, Math.min(r.left + r.width / 2 - dw / 2, vw - dw - 16));
            break;
        case 'top':
        default:
            top  = Math.max(r.top - 240, 16);
            left = Math.max(16, Math.min(r.left + r.width / 2 - dw / 2, vw - dw - 16));
    }

    // Clamp to viewport
    top  = Math.max(8, Math.min(top, vh - 260));
    left = Math.max(8, Math.min(left, vw - dw - 8));

    dialog.style.cssText = `
        width: ${dw}px;
        left: ${left}px;
        top: ${top}px;
        transform: none;
    `;
}

// ===========================
// AUTO-TRIGGER ON FIRST LAUNCH
// ===========================

// Called from main.js after game init
function checkAndLaunchTutorial() {
    if (!localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
        // Wait a bit for the UI to render fully
        setTimeout(() => startTutorial(), 1200);
    }
}

window.checkAndLaunchTutorial = checkAndLaunchTutorial;
