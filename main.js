/* =========================================
   SAKURA CHRONICLES - MAIN CONTROLLER
   App Initialization & Navigation Logic
   ========================================= */

let gameState = null;

const APP_NAVIGATION = [
    { id: 'battle',       label: 'Battle',      icon: 'fa-solid fa-khanda',              color: 'text-red-500' },
    { id: 'garden',       label: 'Garden',       icon: 'fa-solid fa-leaf',                color: 'text-green-500' },
    { id: 'forge',        label: 'Forge',        icon: 'fa-solid fa-hammer',              color: 'text-indigo-500' },
    { id: 'roster',       label: 'Heroes',       icon: 'fa-solid fa-users',               color: 'text-blue-500' },
    { id: 'gacha',        label: 'Summon',       icon: 'fa-solid fa-gem',                 color: 'text-pink-500' },
    { id: 'skill-tree',   label: 'Yggdrasil',    icon: 'fa-solid fa-tree',                color: 'text-emerald-600' },
    { id: 'expedition',   label: 'Expedition',   icon: 'fa-solid fa-map-location-dot',    color: 'text-amber-600' },
    { id: 'quests',       label: 'Quests',       icon: 'fa-solid fa-scroll',              color: 'text-yellow-600' },
    { id: 'achievements', label: 'Feats',        icon: 'fa-solid fa-trophy',              color: 'text-orange-500' },
    { id: 'settings',     label: 'Settings',     icon: 'fa-solid fa-gear',                color: 'text-slate-400' },
];

// Mobile-bottom-bar shows first 5 only; the rest are in the slide-out drawer
const MOBILE_PRIMARY_TABS = ['battle', 'garden', 'forge', 'roster', 'gacha'];

// ===========================
// INITIALIZATION
// ===========================

function initializeGame() {
    initializeLogging();
    createCherryBlossomPetals();

    const savedGame = loadGame();
    if (savedGame) {
        gameState = savedGame;
        showToast('Welcome back to Sakura Chronicles!', 'success');
    } else {
        gameState = new GameState();
        showToast('Welcome, Traveler! Starting new journey...', 'info');
    }

    window.gameState = gameState;

    buildMobileDrawer();
    renderNavigation();
    setupEventListeners();

    updateUI(gameState);
    startAutoSave(gameState);
    startUIUpdateLoop(gameState);

    switchView('battle');
    gameState.checkQuestReset();

    // First-time tutorial
    if (typeof checkAndLaunchTutorial === 'function') checkAndLaunchTutorial();
}

// ===========================
// NAVIGATION
// ===========================

function renderNavigation() {
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav  = document.getElementById('mobile-nav');
    if (!desktopNav || !mobileNav) return;

    desktopNav.innerHTML = '';
    mobileNav.innerHTML  = '';

    APP_NAVIGATION.forEach((nav, idx) => {
        // Desktop sidebar item
        const dItem = document.createElement('div');
        dItem.className = 'nav-item';
        dItem.dataset.target = nav.id;
        dItem.onclick = () => switchView(nav.id);
        dItem.innerHTML = `
            <i class="${nav.icon} w-6 text-center ${nav.color}"></i>
            <span>${nav.label}</span>
            ${idx < 9 ? `<span class="nav-shortcut">${idx + 1}</span>` : ''}
        `;
        desktopNav.appendChild(dItem);

        // Bottom mobile bar (primary tabs only)
        if (MOBILE_PRIMARY_TABS.includes(nav.id)) {
            const mItem = document.createElement('div');
            mItem.className = 'mobile-nav-item';
            mItem.dataset.target = nav.id;
            mItem.onclick = () => switchView(nav.id);
            mItem.innerHTML = `<i class="${nav.icon}"></i><span>${nav.label}</span>`;
            mobileNav.appendChild(mItem);
        }
    });
}

function buildMobileDrawer() {
    // Inject the slide-out drawer DOM once
    if (document.getElementById('mobile-drawer')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobile-drawer-overlay';
    overlay.className = 'mobile-drawer-overlay';
    overlay.onclick = closeMobileDrawer;

    const drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';

    // Drawer header
    drawer.innerHTML = `
        <div class="p-5 flex items-center justify-between border-b border-slate-100">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-white text-lg shadow-md shadow-pink-200">
                    🌸
                </div>
                <div>
                    <div class="font-heading font-bold text-slate-800">SakuraRPG</div>
                    <div class="text-xs text-slate-400">CHRONICLES</div>
                </div>
            </div>
            <button class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center" onclick="closeMobileDrawer()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-1" id="drawer-nav"></nav>
        <div class="p-4 border-t border-slate-100">
            <div class="bg-slate-50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors" onclick="closeMobileDrawer(); switchView('settings');">
                <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div>
                    <div class="font-bold text-sm" id="drawer-username">Player</div>
                    <div class="text-xs text-slate-500">Tap to view profile</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Populate drawer nav with ALL tabs
    const drawerNav = document.getElementById('drawer-nav');
    APP_NAVIGATION.forEach((nav, idx) => {
        const item = document.createElement('div');
        item.className = 'nav-item';
        item.dataset.drawerTarget = nav.id;
        item.onclick = () => { closeMobileDrawer(); switchView(nav.id); };
        item.innerHTML = `
            <i class="${nav.icon} w-6 text-center ${nav.color}"></i>
            <span>${nav.label}</span>
        `;
        drawerNav.appendChild(item);
    });
}

window.openMobileDrawer = function() {
    const overlay = document.getElementById('mobile-drawer-overlay');
    const drawer  = document.getElementById('mobile-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeMobileDrawer = function() {
    const overlay = document.getElementById('mobile-drawer-overlay');
    const drawer  = document.getElementById('mobile-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
};

function switchView(viewId) {
    // Sync active state on all nav surfaces
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
        const target = el.dataset.target || el.dataset.drawerTarget;
        el.classList.toggle('active', target === viewId);
    });

    document.querySelectorAll('.view-content').forEach(el => {
        el.classList.add('hidden', 'opacity-0');
        el.classList.remove('active', 'animate-entry');
    });

    const target = document.getElementById(`${viewId}-tab`);
    if (target) {
        target.classList.remove('hidden');
        requestAnimationFrame(() => {
            target.classList.remove('opacity-0');
            target.classList.add('active', 'animate-entry');
        });
        refreshViewContent(viewId);
    }

    const contentArea = document.getElementById('content-area');
    if (contentArea) contentArea.scrollTop = 0;
}

function refreshViewContent(viewId) {
    if (!gameState) return;
    switch (viewId) {
        case 'battle':       if (typeof renderBattleDashboard  === 'function') renderBattleDashboard(gameState);  break;
        case 'roster':       if (typeof renderRoster           === 'function') renderRoster(gameState);           break;
        case 'garden':       if (typeof renderGarden           === 'function') renderGarden(gameState);           break;
        case 'gacha':        if (typeof renderGacha            === 'function') renderGacha(gameState);            break;
        case 'forge':        if (typeof renderForge            === 'function') renderForge(gameState);            break;
        case 'skill-tree':   if (typeof renderSkillTree        === 'function') renderSkillTree(gameState);        break;
        case 'expedition':   if (typeof updateExpeditionUI     === 'function') updateExpeditionUI(gameState);     break;
        case 'quests':       if (typeof renderQuests           === 'function') renderQuests(gameState);           break;
        case 'achievements': if (typeof renderAchievements     === 'function') renderAchievements(gameState);     break;
        case 'settings':     if (typeof renderProfile          === 'function') renderProfile(gameState);          break;
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Mobile hamburger
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) mobileMenuBtn.onclick = openMobileDrawer;

    // Desktop sidebar profile
    const profileBtn = document.getElementById('sidebar-profile-btn');
    if (profileBtn) profileBtn.onclick = () => switchView('settings');

    // Save on hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState) saveGame(gameState);
    });

    // Keyboard: Escape closes modals/drawer, 1-9/0 switch tabs
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'Escape') {
            const drawer = document.getElementById('mobile-drawer');
            if (drawer && drawer.classList.contains('active')) {
                closeMobileDrawer();
            } else {
                closeModal();
            }
            return;
        }

        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
            const nav = APP_NAVIGATION[num - 1];
            if (nav) switchView(nav.id);
        }
        if (e.key === '0' && APP_NAVIGATION[9]) {
            switchView(APP_NAVIGATION[9].id);
        }
    });
}

// ===========================
// UTILITIES & LOOPS
// ===========================

function startUIUpdateLoop(gameState) {
    setInterval(() => {
        if (gameState && typeof updateCurrencyDisplay === 'function') {
            updateCurrencyDisplay(gameState);
        }
        // Keep drawer username in sync
        const drawerUser = document.getElementById('drawer-username');
        const sidebarUser = document.getElementById('sidebar-username');
        const name = gameState?.playerName || 'Player';
        if (drawerUser) drawerUser.textContent = name;
        if (sidebarUser) sidebarUser.textContent = name;
    }, 500);
}

function showToast(message, type = 'info') {
    if (typeof showNotification === 'function') showNotification(message, type);
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

// ===========================
// DEBUG & BOOTSTRAP
// ===========================

window.debug = {
    help: () => console.table({
        'addGold(n)':   'Add Gold',
        'addPetals(n)': 'Add Petals',
        'addOrbs(n)':   'Add Spirit Orbs',
        'tutorial()':   'Replay Tutorial',
        'reset()':      'Wipe Save',
    }),
    addGold:   (n) => { gameState.gold += n;       updateUI(gameState); },
    addPetals: (n) => { gameState.petals += n;     updateUI(gameState); },
    addOrbs:   (n) => { gameState.spiritOrbs += n; updateUI(gameState); },
    tutorial:  ()  => { if (typeof startTutorial === 'function') startTutorial(true); },
    reset: () => {
        deleteSave();
        window.gameState = null;
        gameState = null;
        location.reload();
    },
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
