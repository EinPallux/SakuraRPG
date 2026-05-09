/* =========================================
   SAKURA CHRONICLES - CORE CLASSES v2.0
   Status Effects, Equipment, Achievements
   ========================================= */

// ===========================
// STATUS EFFECTS SYSTEM
// ===========================

const STATUS_EFFECTS = {
    burn: {
        name: 'Burn', emoji: '🔥',
        onTurnEnd: (unit, battleState) => {
            const dmg = Math.floor(unit.maxHP * 0.06);
            unit.takeDamage(dmg);
            battleState.addLog(`${unit.name} burned for ${dmg}!`, 'fire');
            return dmg;
        }
    },
    poison: {
        name: 'Poison', emoji: '☠️',
        onTurnEnd: (unit, battleState) => {
            const dmg = Math.floor(unit.maxHP * 0.08);
            unit.takeDamage(dmg);
            battleState.addLog(`${unit.name} poisoned for ${dmg}!`, 'poison');
            return dmg;
        }
    },
    regen: {
        name: 'Regen', emoji: '💚',
        onTurnEnd: (unit, battleState) => {
            const amt = Math.floor(unit.maxHP * 0.05);
            unit.heal(amt);
            battleState.addLog(`${unit.name} regenerated ${amt} HP.`, 'heal');
            return amt;
        }
    },
    freeze: {
        name: 'Frozen', emoji: '❄️',
        onApply: (unit) => { unit._frozenThisTurn = true; },
        preventsAction: true
    },
    stun: {
        name: 'Stun', emoji: '⚡',
        preventsAction: true
    },
    shield: {
        name: 'Shield', emoji: '🛡️',
        isStatMod: true
    },
    atk_up: {
        name: 'ATK Up', emoji: '⬆️',
        isStatMod: true,
        statKey: 'atk',
        percent: true
    },
    def_up: {
        name: 'DEF Up', emoji: '🔵',
        isStatMod: true,
        statKey: 'def',
        percent: true
    },
    spd_up: {
        name: 'SPD Up', emoji: '💨',
        isStatMod: true,
        statKey: 'spd',
        percent: true
    },
    invincible: {
        name: 'Invincible', emoji: '⚜️',
        preventsAllDamage: true
    }
};

// Apply a status effect to a unit
function applyStatus(unit, type, duration, value = 0, battleState = null) {
    if (!unit.isAlive) return;

    // Check for existing stack of same type (refresh or stack)
    const existing = unit.statusEffects.find(s => s.type === type);
    if (existing) {
        existing.duration = Math.max(existing.duration, duration);
        if (value) existing.value = value;
        return;
    }

    const effect = { type, duration, value };
    unit.statusEffects.push(effect);

    const def = STATUS_EFFECTS[type];
    if (def && def.onApply) def.onApply(unit);
    if (battleState && def) {
        battleState.addLog(`${unit.name} is now ${def.name}!`, type === 'regen' ? 'heal' : 'special');
    }
}

// Process all status effects for one turn-end
function processStatusEffects(unit, battleState) {
    if (!unit.isAlive || unit.statusEffects.length === 0) return;

    const toRemove = [];
    unit.statusEffects.forEach((effect, i) => {
        const def = STATUS_EFFECTS[effect.type];
        if (def && def.onTurnEnd) {
            def.onTurnEnd(unit, battleState);
        }
        effect.duration--;
        if (effect.duration <= 0) toRemove.push(i);
    });

    for (let i = toRemove.length - 1; i >= 0; i--) {
        const removed = unit.statusEffects.splice(toRemove[i], 1)[0];
        const def = STATUS_EFFECTS[removed.type];
        if (def && battleState) battleState.addLog(`${unit.name}'s ${def.name} wore off.`, 'neutral');
    }
}

// ===========================
// HERO CLASS
// ===========================

class Hero {
    constructor(heroData) {
        this.id = heroData.id;
        this.name = heroData.name;
        this.rarity = heroData.rarity;
        this.element = heroData.element;
        this.class = heroData.class;
        this.gender = heroData.gender;
        this.ultimate = heroData.ultimate;

        this.level = 1;
        this.exp = 0;
        this.stars = 1;
        this.awakeningShards = 0;
        this.bond = 0;

        this.baseStats = { ...heroData.baseStats };

        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        // Battle state
        this.currentHP = 0;
        this.maxHP = 0;
        this.atk = 0;
        this.def = 0;
        this.spd = 0;
        this.critChance = 0.15;
        this.mana = 0;
        this.maxMana = 100;
        this.isAlive = true;
        this.statusEffects = [];
        this.shieldHP = 0;

        this.calculateStats();
        this.fullHeal();
    }

    calculateStats(skillTreeBonuses = {}) {
        const levelMult = 1 + (this.level - 1) * 0.10;
        const starMult  = 1 + (this.stars - 1) * 0.15;

        let totalHP  = Math.floor(this.baseStats.hp  * levelMult * starMult);
        let totalATK = Math.floor(this.baseStats.atk * levelMult * starMult);
        let totalDEF = Math.floor(this.baseStats.def * levelMult * starMult);
        let totalSPD = Math.floor(this.baseStats.spd * levelMult * starMult);
        let critBonus = 0;

        // Equipment bonuses
        const slots = ['weapon', 'armor', 'accessory'];
        slots.forEach(slot => {
            const eqId = this.equipment[slot];
            if (!eqId) return;
            const eqList = EQUIPMENT_DATABASE[slot === 'weapon' ? 'weapons' : slot === 'armor' ? 'armors' : 'accessories'];
            const eq = eqList ? eqList.find(e => e.id === eqId) : null;
            if (!eq) return;
            totalATK += eq.stats.atk || 0;
            totalDEF += eq.stats.def || 0;
            totalHP  += eq.stats.hp  || 0;
            totalSPD += eq.stats.spd || 0;
            critBonus += (eq.stats.crit || 0) / 100;
        });

        // Skill tree bonuses
        if (skillTreeBonuses.allStatsPercent) {
            const f = 1 + skillTreeBonuses.allStatsPercent / 100;
            totalHP  = Math.floor(totalHP  * f);
            totalATK = Math.floor(totalATK * f);
            totalDEF = Math.floor(totalDEF * f);
        }
        if (skillTreeBonuses.hpPercent) {
            totalHP = Math.floor(totalHP * (1 + skillTreeBonuses.hpPercent / 100));
        }
        if (skillTreeBonuses.atkPercent) {
            totalATK = Math.floor(totalATK * (1 + skillTreeBonuses.atkPercent / 100));
        }
        if (skillTreeBonuses.spdBonus) {
            totalSPD += skillTreeBonuses.spdBonus;
        }
        if (skillTreeBonuses.critBonus) {
            critBonus += skillTreeBonuses.critBonus / 100;
        }

        const elKey = `${this.element.toLowerCase()}Bonus`;
        if (skillTreeBonuses[elKey]) {
            totalATK = Math.floor(totalATK * (1 + skillTreeBonuses[elKey] / 100));
        }

        // Bond bonus (+1% all stats per 10 bond)
        if (this.bond > 0) {
            const bondMult = 1 + Math.floor(this.bond / 10) * 0.01;
            totalHP  = Math.floor(totalHP  * bondMult);
            totalATK = Math.floor(totalATK * bondMult);
            totalDEF = Math.floor(totalDEF * bondMult);
        }

        this.maxHP = totalHP;
        this.atk   = totalATK;
        this.def   = totalDEF;
        this.spd   = totalSPD;
        this.critChance = Math.min(0.70, 0.15 + critBonus);

        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
        this.isAlive = this.currentHP > 0;
    }

    getEffectiveStat(stat) {
        let base = this[stat];
        if (!this.isAlive) return base;
        this.statusEffects.forEach(eff => {
            const def = STATUS_EFFECTS[eff.type];
            if (def && def.isStatMod && def.statKey === stat && def.percent) {
                base = Math.floor(base * (1 + eff.value / 100));
            }
        });
        return base;
    }

    isInvincible() {
        return this.statusEffects.some(e => e.type === 'invincible');
    }

    isPrevented() {
        return this.statusEffects.some(e => {
            const d = STATUS_EFFECTS[e.type];
            return d && d.preventsAction;
        });
    }

    getPower() {
        return Math.floor(this.maxHP / 10 + this.atk * 2 + this.def + this.spd);
    }

    getUpgradeCost() {
        return Math.floor(100 * Math.pow(1.08, this.level - 1));
    }

    levelUp() {
        if (this.level >= 100) return false;
        this.level++;
        const prevMax = this.maxHP;
        this.calculateStats();
        this.currentHP = Math.min(this.currentHP + (this.maxHP - prevMax), this.maxHP);
        return true;
    }

    fullHeal(startingManaBonus = 0) {
        this.currentHP = this.maxHP;
        this.isAlive = true;
        this.mana = Math.min(this.maxMana, startingManaBonus);
        this.statusEffects = [];
        this.shieldHP = 0;
    }

    resetForBattle(skillTreeBonuses = {}) {
        this.calculateStats(skillTreeBonuses);
        this.statusEffects = [];
        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.isAlive = false;
        } else {
            this.isAlive = true;
        }
    }

    takeDamage(amount) {
        if (!this.isAlive) return 0;
        if (this.isInvincible()) return 0;

        // Shield absorbs first
        if (this.shieldHP > 0) {
            const absorbed = Math.min(this.shieldHP, amount);
            this.shieldHP -= absorbed;
            amount -= absorbed;
        }

        const actual = Math.min(amount, this.currentHP);
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) {
            this.isAlive = false;
            this.statusEffects = [];
        }
        return actual;
    }

    heal(amount) {
        if (!this.isAlive) return 0;
        const missing = this.maxHP - this.currentHP;
        const actual = Math.min(amount, missing);
        this.currentHP += actual;
        return actual;
    }

    gainMana(amount) {
        if (!this.isAlive) return;
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }

    canUseUltimate() {
        return this.isAlive && this.mana >= this.ultimate.manaReq;
    }

    useUltimate() {
        if (this.canUseUltimate()) {
            this.mana = 0;
            this.bond = Math.min(100, this.bond + 1);
            return true;
        }
        return false;
    }

    getHPPercent() {
        if (this.maxHP === 0) return 0;
        return Math.max(0, Math.min(100, (this.currentHP / this.maxHP) * 100));
    }

    getManaPercent() {
        return Math.max(0, Math.min(100, (this.mana / this.maxMana) * 100));
    }

    getShieldPercent() {
        if (this.maxHP === 0) return 0;
        return Math.max(0, Math.min(100, (this.shieldHP / this.maxHP) * 100));
    }

    toJSON() {
        return {
            id: this.id,
            level: this.level,
            exp: this.exp,
            stars: this.stars,
            awakeningShards: this.awakeningShards,
            bond: this.bond,
            equipment: this.equipment,
            currentHP: this.currentHP,
            mana: this.mana
        };
    }

    static fromJSON(data) {
        const template = HEROES_DATABASE.find(h => h.id === data.id);
        if (!template) return null;
        const hero = new Hero(template);
        hero.level = data.level || 1;
        hero.exp   = data.exp   || 0;
        hero.stars = data.stars || 1;
        hero.awakeningShards = data.awakeningShards || 0;
        hero.bond  = data.bond  || 0;
        if (data.equipment) hero.equipment = data.equipment;
        hero.calculateStats();
        if (data.currentHP !== undefined) {
            hero.currentHP = Math.min(data.currentHP, hero.maxHP);
            hero.isAlive = hero.currentHP > 0;
        }
        if (data.mana !== undefined) hero.mana = data.mana;
        return hero;
    }
}

// ===========================
// ENEMY CLASS
// ===========================

class Enemy {
    constructor(template, waveNumber) {
        this.id = template.id;
        this.name = template.name;
        this.element = template.element;

        // Non-linear scaling: flattens at high waves
        const waveScale = Math.pow(waveNumber, 0.85);
        const multiplier = 1 + (waveScale - 1) * 0.12;

        const isBossTemplate = template.isBoss;
        const bossMult = isBossTemplate ? 2.5 : 1;

        this.maxHP = Math.floor(template.baseStats.hp * multiplier * bossMult);
        this.currentHP = this.maxHP;
        this.atk = Math.floor(template.baseStats.atk * multiplier * (isBossTemplate ? 1.5 : 1));
        this.def = Math.floor(template.baseStats.def * multiplier * (isBossTemplate ? 1.5 : 1));
        this.spd = Math.floor(template.baseStats.spd * (1 + (waveNumber - 1) * 0.02));

        this.maxMana = 100;
        this.mana = 0;
        this.isAlive = true;
        this.isBoss = waveNumber % 10 === 0 || isBossTemplate;
        this.statusEffects = [];
        this.shieldHP = 0;
        this.reward = template.reward || { gold: Math.floor(30 + waveNumber * 5) };
        this.emoji    = template.emoji    || '';
        this.behavior = template.behavior || 'aggressive';
        this.special  = template.special  || [];
    }

    isInvincible() {
        return this.statusEffects.some(e => e.type === 'invincible');
    }

    isPrevented() {
        return this.statusEffects.some(e => {
            const d = STATUS_EFFECTS[e.type];
            return d && d.preventsAction;
        });
    }

    takeDamage(amount) {
        if (!this.isAlive) return 0;
        if (this.isInvincible()) return 0;

        if (this.shieldHP > 0) {
            const absorbed = Math.min(this.shieldHP, amount);
            this.shieldHP -= absorbed;
            amount -= absorbed;
        }

        const actual = Math.min(amount, this.currentHP);
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) {
            this.isAlive = false;
            this.statusEffects = [];
        }
        return actual;
    }

    gainMana(amount) {
        if (!this.isAlive) return;
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }

    getHPPercent() {
        if (this.maxHP === 0) return 0;
        return Math.max(0, Math.min(100, (this.currentHP / this.maxHP) * 100));
    }
}

// ===========================
// GARDEN CLASS
// ===========================

class Garden {
    constructor() {
        this.plots = Array(6).fill(null).map((_, i) => ({
            id: i,
            unlocked: i < 2,
            plant: null
        }));
    }

    unlockPlot(id) {
        const plot = this.plots.find(p => p.id === id);
        if (plot && !plot.unlocked) { plot.unlocked = true; return true; }
        return false;
    }

    plantSeed(plotId, seedId) {
        const plot = this.plots.find(p => p.id === plotId);
        const seed = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === seedId);
        if (plot && plot.unlocked && !plot.plant && seed) {
            plot.plant = { seedId, plantedAt: Date.now(), growthTime: seed.growthTime, ready: false };
            return true;
        }
        return false;
    }

    checkGrowth() {
        let changed = false;
        const now = Date.now();
        this.plots.forEach(p => {
            if (p.plant && !p.plant.ready && (now - p.plant.plantedAt >= p.plant.growthTime)) {
                p.plant.ready = true;
                changed = true;
            }
        });
        return changed;
    }

    harvest(plotId) {
        const plot = this.plots.find(p => p.id === plotId);
        if (plot && plot.plant && plot.plant.ready) {
            const seed = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
            plot.plant = null;
            return seed ? seed.resultId : null;
        }
        return null;
    }

    toJSON() { return { plots: this.plots }; }

    static fromJSON(data) {
        const g = new Garden();
        if (data && data.plots) g.plots = data.plots;
        return g;
    }
}

// ===========================
// GAME STATE
// ===========================

class GameState {
    constructor() {
        this.username = 'Traveler';
        this.gold = 500;
        this.petals = 150;
        this.spiritOrbs = 5;
        this.roster = [];
        this.team = [null, null, null, null, null];
        this.inventory = {
            seeds: { 's001': 3 },
            teas: {},
            materials: {},
            equipment: {}
        };
        this.garden = new Garden();
        this.skillTree = this._initSkillTree();
        this.currentWave = 1;
        this.highestWave = 0;
        this.enemiesDefeated = 0;
        this.totalKills = 0;
        this.isBattleActive = false;
        this.autoCast = true;
        this.pityCounter = 0;
        this.totalPulls = 0;
        this.stats = { totalBattles: 0, totalPulls: 0, playTime: 0 };
        this.quests = [];
        this.lastQuestReset = 0;
        this.expedition = { isActive: true, startTime: Date.now(), lastClaimTime: Date.now() };
        this.achievements = {};
        this._startTime = Date.now();
    }

    // ===========================
    // HERO MANAGEMENT
    // ===========================

    addHero(id) {
        const existing = this.roster.find(h => h.id === id);
        if (existing) {
            const shards = { N: 5, R: 10, SR: 15, SSR: 25, UR: 50 }[existing.rarity] || 5;
            existing.awakeningShards += shards;
            return { isDuplicate: true, hero: existing, shards };
        }
        const template = HEROES_DATABASE.find(h => h.id === id);
        if (template) {
            const hero = new Hero(template);
            this.roster.push(hero);
            this.checkAchievements();
            return { isDuplicate: false, hero, shards: 0 };
        }
        return { isDuplicate: false, hero: null, shards: 0 };
    }

    getTeamHeroes() {
        return this.team
            .map(id => id ? this.roster.find(h => h.id === id) : null)
            .filter(h => h != null);
    }

    setTeamMember(slotIndex, heroId) {
        if (slotIndex >= 0 && slotIndex < 5) this.team[slotIndex] = heroId;
    }

    recoverTeam() {
        const bonuses = this.getSkillTreeBonuses();
        const startMana = bonuses.startingMana || 0;
        this.roster.forEach(h => h.fullHeal(startMana));
    }

    // ===========================
    // INVENTORY
    // ===========================

    addItem(type, id, amt = 1) {
        if (!this.inventory[type]) this.inventory[type] = {};
        this.inventory[type][id] = (this.inventory[type][id] || 0) + amt;
    }

    removeItem(type, id, amt = 1) {
        if (!this.inventory[type]?.[id]) return false;
        if (this.inventory[type][id] < amt) return false;
        this.inventory[type][id] -= amt;
        if (this.inventory[type][id] <= 0) delete this.inventory[type][id];
        return true;
    }

    getItemCount(type, id) {
        return this.inventory[type]?.[id] || 0;
    }

    addEquipmentItem(equipId) {
        if (!this.inventory.equipment) this.inventory.equipment = {};
        this.inventory.equipment[equipId] = (this.inventory.equipment[equipId] || 0) + 1;
    }

    getEquipmentItem(equipId) {
        const allEquip = [
            ...EQUIPMENT_DATABASE.weapons,
            ...EQUIPMENT_DATABASE.armors,
            ...EQUIPMENT_DATABASE.accessories
        ];
        return allEquip.find(e => e.id === equipId) || null;
    }

    // ===========================
    // SKILL TREE
    // ===========================

    _initSkillTree() {
        return [
            { id: 'st01', name: 'All Stats I',    icon: '⚔️',  desc: '+5% All Stats',      cost: 10, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 5 },
            { id: 'st02', name: 'HP Mastery',     icon: '❤️',  desc: '+8% Max HP',         cost: 12, maxLevel: 5, level: 0, bonus: 'hpPercent', value: 8 },
            { id: 'st03', name: 'Attack Mastery', icon: '🗡️',  desc: '+8% ATK',            cost: 12, maxLevel: 5, level: 0, bonus: 'atkPercent', value: 8 },
            { id: 'st04', name: 'Starting Mana',  icon: '⚡',  desc: '+20 Starting Mana',  cost: 25, maxLevel: 3, level: 0, bonus: 'startingMana', value: 20 },
            { id: 'st05', name: 'Gold Rush',       icon: '💰',  desc: '+12% Gold Gain',     cost: 15, maxLevel: 5, level: 0, bonus: 'goldBonus', value: 12 },
            { id: 'st06', name: 'Petal Harvest',   icon: '🌸',  desc: '+15% Petal Drop',    cost: 15, maxLevel: 3, level: 0, bonus: 'petalBonus', value: 15 },
            { id: 'st07', name: 'Critical Eye',    icon: '🎯',  desc: '+3% Crit Chance',    cost: 20, maxLevel: 5, level: 0, bonus: 'critBonus', value: 3 },
            { id: 'st08', name: 'Swift Feet',      icon: '💨',  desc: '+5 Speed',            cost: 18, maxLevel: 3, level: 0, bonus: 'spdBonus', value: 5 },
            { id: 'st09', name: 'Fire Mastery',    icon: '🔥',  desc: '+12% Fire ATK',      cost: 20, maxLevel: 3, level: 0, bonus: 'fireBonus', value: 12 },
            { id: 'st10', name: 'Water Mastery',   icon: '💧',  desc: '+12% Water ATK',     cost: 20, maxLevel: 3, level: 0, bonus: 'waterBonus', value: 12 },
            { id: 'st11', name: 'Wind Mastery',    icon: '🌪️',  desc: '+12% Wind ATK',      cost: 20, maxLevel: 3, level: 0, bonus: 'windBonus', value: 12 },
            { id: 'st12', name: 'Light Mastery',   icon: '✨',  desc: '+12% Light ATK',     cost: 20, maxLevel: 3, level: 0, bonus: 'lightBonus', value: 12 },
            { id: 'st13', name: 'Dark Mastery',    icon: '🌑',  desc: '+12% Dark ATK',      cost: 20, maxLevel: 3, level: 0, bonus: 'darkBonus', value: 12 },
            { id: 'st14', name: 'Orb Seeker',      icon: '🔮',  desc: '+10% Orb Drop',      cost: 25, maxLevel: 3, level: 0, bonus: 'orbBonus', value: 10 },
            { id: 'st15', name: 'Bond Accelerator',icon: '💞',  desc: '+50% Bond Gain',     cost: 30, maxLevel: 3, level: 0, bonus: 'bondBonus', value: 50 },
            { id: 'st16', name: 'Iron Skin',       icon: '🛡️',  desc: '+6% DEF',            cost: 14, maxLevel: 5, level: 0, bonus: 'defPercent', value: 6 }
        ];
    }

    getSkillTreeBonuses() {
        const bonuses = {};
        this.skillTree.forEach(node => {
            if (node.level > 0) {
                bonuses[node.bonus] = (bonuses[node.bonus] || 0) + node.value * node.level;
            }
        });
        return bonuses;
    }

    upgradeSkillNode(id) {
        const node = this.skillTree.find(n => n.id === id);
        if (!node || node.level >= node.maxLevel) return false;
        const cost = node.cost * (node.level + 1);
        if (this.spiritOrbs >= cost) {
            this.spiritOrbs -= cost;
            node.level++;
            return true;
        }
        return false;
    }

    // ===========================
    // QUESTS
    // ===========================

    checkQuestReset() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        const QUEST_POOL = [
            { id: 'q_e1', desc: 'Defeat 10 Enemies', target: 10, current: 0, reward: { gold: 200, petals: 5 }, type: 'killEnemies', difficulty: 'Easy' },
            { id: 'q_e2', desc: 'Summon 1 Hero', target: 1, current: 0, reward: { petals: 10, gold: 100 }, type: 'summon', difficulty: 'Easy' },
            { id: 'q_e3', desc: 'Use 3 Ultimates', target: 3, current: 0, reward: { spiritOrbs: 1, gold: 150 }, type: 'useUltimates', difficulty: 'Easy' },
            { id: 'q_e4', desc: 'Level Up a Hero', target: 1, current: 0, reward: { gold: 300 }, type: 'levelUp', difficulty: 'Easy' },
            { id: 'q_e5', desc: 'Clear 1 Wave', target: 1, current: 0, reward: { gold: 200 }, type: 'clearWaves', difficulty: 'Easy' },
            { id: 'q_m1', desc: 'Defeat 30 Enemies', target: 30, current: 0, reward: { gold: 500, petals: 20 }, type: 'killEnemies', difficulty: 'Medium' },
            { id: 'q_m2', desc: 'Clear 5 Waves', target: 5, current: 0, reward: { gold: 600, spiritOrbs: 2 }, type: 'clearWaves', difficulty: 'Medium' },
            { id: 'q_m3', desc: 'Use 10 Ultimates', target: 10, current: 0, reward: { petals: 30, gold: 300 }, type: 'useUltimates', difficulty: 'Medium' },
            { id: 'q_m4', desc: 'Summon 5 Heroes', target: 5, current: 0, reward: { petals: 20, spiritOrbs: 1 }, type: 'summon', difficulty: 'Medium' },
            { id: 'q_m5', desc: 'Harvest a Plant', target: 1, current: 0, reward: { gold: 500 }, type: 'harvest', difficulty: 'Medium' },
            { id: 'q_h1', desc: 'Defeat 100 Enemies', target: 100, current: 0, reward: { gold: 1500, petals: 50, spiritOrbs: 5 }, type: 'killEnemies', difficulty: 'Hard' },
            { id: 'q_h2', desc: 'Clear 15 Waves', target: 15, current: 0, reward: { gold: 1200, spiritOrbs: 5 }, type: 'clearWaves', difficulty: 'Hard' },
            { id: 'q_h3', desc: 'Perform 20 Summons', target: 20, current: 0, reward: { petals: 100, gold: 1000 }, type: 'summon', difficulty: 'Hard' },
            { id: 'q_h4', desc: 'Harvest 3 Plants', target: 3, current: 0, reward: { seeds: { 's003': 1 }, gold: 500 }, type: 'harvest', difficulty: 'Hard' },
            { id: 'q_i1', desc: 'Defeat 300 Enemies', target: 300, current: 0, reward: { gold: 5000, petals: 200, spiritOrbs: 20 }, type: 'killEnemies', difficulty: 'Insane' },
            { id: 'q_i2', desc: 'Clear 30 Waves', target: 30, current: 0, reward: { gold: 4000, spiritOrbs: 25 }, type: 'clearWaves', difficulty: 'Insane' },
            { id: 'q_i3', desc: 'Use 50 Ultimates', target: 50, current: 0, reward: { spiritOrbs: 10, petals: 50 }, type: 'useUltimates', difficulty: 'Insane' }
        ];

        if (now - this.lastQuestReset > oneDay || this.quests.length === 0) {
            this.quests = [];
            const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
            const difficulties = ['Easy', 'Medium', 'Hard', 'Insane'];
            difficulties.forEach(diff => {
                if (this.quests.length < 4) {
                    const q = shuffled.find(q => q.difficulty === diff && !this.quests.some(e => e.id === q.id));
                    if (q) this.quests.push({ ...q });
                }
            });
            while (this.quests.length < 4) {
                const q = shuffled.find(q => !this.quests.some(e => e.id === q.id));
                if (!q) break;
                this.quests.push({ ...q });
            }
            this.lastQuestReset = now;
        }
    }

    updateQuest(type, amt = 1) {
        this.quests.forEach(q => {
            if (q.type === type && !q.completed) {
                q.current = Math.min(q.target, q.current + amt);
                if (q.current >= q.target) q.completed = true;
            }
        });
    }

    claimQuest(id) {
        const q = this.quests.find(q => q.id === id);
        if (q && q.completed && !q.claimed) {
            q.claimed = true;
            if (q.reward.gold) this.gold += q.reward.gold;
            if (q.reward.petals) this.petals += q.reward.petals;
            if (q.reward.spiritOrbs) this.spiritOrbs += q.reward.spiritOrbs;
            if (q.reward.seeds) {
                for (const [sid, qty] of Object.entries(q.reward.seeds)) {
                    this.addItem('seeds', sid, qty);
                }
            }
            return q.reward;
        }
        return null;
    }

    // ===========================
    // EXPEDITION
    // ===========================

    calculateExpeditionRewards() {
        const now = Date.now();
        const hours = (now - this.expedition.lastClaimTime) / (1000 * 60 * 60);
        const bonuses = this.getSkillTreeBonuses();
        const goldMult = 1 + (bonuses.goldBonus || 0) / 100;
        const petalMult = 1 + (bonuses.petalBonus || 0) / 100;

        // Team power boosts expedition
        const teamPower = this.getTeamHeroes().reduce((sum, h) => sum + h.getPower(), 0);
        const powerBonus = Math.min(3, 1 + teamPower / 5000);

        return {
            gold: Math.floor(hours * 120 * goldMult * powerBonus),
            petals: Math.floor(hours * 6 * petalMult),
            hours: hours.toFixed(2)
        };
    }

    claimExpeditionRewards() {
        const r = this.calculateExpeditionRewards();
        if (parseFloat(r.hours) >= 0.1) {
            this.gold += r.gold;
            this.petals += r.petals;
            this.expedition.lastClaimTime = Date.now();
            return r;
        }
        return null;
    }

    // ===========================
    // ACHIEVEMENTS
    // ===========================

    checkAchievements() {
        const checks = {
            totalBattles: this.stats.totalBattles,
            highestWave: this.highestWave,
            rosterSize: this.roster.length,
            ownSSR: this.roster.filter(h => h.rarity === 'SSR' || h.rarity === 'UR').length,
            ownUR: this.roster.filter(h => h.rarity === 'UR').length,
            totalKills: this.totalKills,
            totalPulls: this.stats.totalPulls
        };

        const newlyUnlocked = [];
        ACHIEVEMENTS_DATABASE.forEach(ach => {
            if (this.achievements[ach.id]) return;
            const val = checks[ach.type] || 0;
            if (val >= ach.target) {
                this.achievements[ach.id] = { unlockedAt: Date.now() };
                // Grant reward
                if (ach.reward.gold) this.gold += ach.reward.gold;
                if (ach.reward.petals) this.petals += ach.reward.petals;
                if (ach.reward.spiritOrbs) this.spiritOrbs += ach.reward.spiritOrbs;
                newlyUnlocked.push(ach);
            }
        });
        return newlyUnlocked;
    }

    getUnlockedAchievements() {
        return ACHIEVEMENTS_DATABASE.filter(a => this.achievements[a.id]);
    }

    // ===========================
    // SERIALIZATION
    // ===========================

    toJSON() {
        this.stats.playTime = (this.stats.playTime || 0) + (Date.now() - this._startTime) / 1000;
        this._startTime = Date.now();
        return {
            version: '2.0',
            username: this.username,
            gold: this.gold,
            petals: this.petals,
            spiritOrbs: this.spiritOrbs,
            roster: this.roster.map(h => h.toJSON()),
            team: this.team,
            inventory: this.inventory,
            garden: this.garden.toJSON(),
            skillTree: this.skillTree,
            stats: this.stats,
            pityCounter: this.pityCounter,
            totalPulls: this.totalPulls,
            highestWave: this.highestWave,
            totalKills: this.totalKills,
            expedition: this.expedition,
            quests: this.quests,
            lastQuestReset: this.lastQuestReset,
            achievements: this.achievements,
            autoCast: this.autoCast
        };
    }

    static fromJSON(data) {
        const s = new GameState();
        s.username = data.username || 'Traveler';
        s.gold = data.gold || 0;
        s.petals = data.petals || 0;
        s.spiritOrbs = data.spiritOrbs || 0;
        if (data.roster) s.roster = data.roster.map(h => Hero.fromJSON(h)).filter(Boolean);
        if (data.team) s.team = data.team;
        if (data.inventory) {
            s.inventory = { seeds: {}, teas: {}, materials: {}, equipment: {}, ...data.inventory };
        }
        if (data.garden) s.garden = Garden.fromJSON(data.garden);
        if (data.skillTree) {
            data.skillTree.forEach(saved => {
                const node = s.skillTree.find(n => n.id === saved.id);
                if (node) node.level = saved.level || 0;
            });
        }
        if (data.stats) s.stats = { ...s.stats, ...data.stats };
        s.pityCounter = data.pityCounter || 0;
        s.totalPulls = data.totalPulls || 0;
        s.highestWave = data.highestWave || 0;
        s.totalKills = data.totalKills || 0;
        s.autoCast = data.autoCast !== undefined ? data.autoCast : true;
        if (data.expedition) s.expedition = data.expedition;
        if (data.quests) { s.quests = data.quests; s.lastQuestReset = data.lastQuestReset || 0; }
        if (data.achievements) s.achievements = data.achievements;
        return s;
    }
}
