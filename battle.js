/* =========================================
   SAKURA CHRONICLES - BATTLE ENGINE v2.0
   Fixed timing, class differentiation, status effects, speed toggle
   ========================================= */

let battleInterval = null;
let currentBattleState = null;
let battleSpeed = 1; // 1 = normal, 2 = fast, 3 = ultra
const BASE_TURN_DELAY = 1800; // ms between full-turn cycles

// ===========================
// BATTLE STATE
// ===========================

class BattleState {
    constructor(heroes, waveNumber, skillTreeBonuses) {
        this.heroes = heroes;
        heroes.forEach(h => h.resetForBattle(skillTreeBonuses));

        this.enemies = [];
        this.waveNumber = waveNumber;
        this.isActive = true;
        this.turnCounter = 0;
        this.skillTreeBonuses = skillTreeBonuses;
        this.combatLog = [];
        this.waveComplete = false;
        this.focusedEnemyId = null;
        this.processingTurn = false;

        this.spawnEnemies();
    }

    spawnEnemies() {
        const wave = this.waveNumber;
        const isBossWave = wave % 10 === 0;

        if (isBossWave) {
            // Boss wave: pick an appropriate boss
            const bossPool = ENEMIES_DATABASE.filter(e => e.isBoss);
            const bossIdx = Math.min(Math.floor((wave - 10) / 10), bossPool.length - 1);
            const boss = bossPool[Math.max(0, bossIdx)];
            const enemy = new Enemy(boss, wave);
            enemy.instanceId = `${boss.id}_boss_${Date.now()}`;
            this.enemies = [enemy];

            // Optional minion at high waves
            if (wave >= 20 && Math.random() < 0.5) {
                const tierPool = this._getTierPool(wave);
                const minionTemplate = tierPool[Math.floor(Math.random() * tierPool.length)];
                const minion = new Enemy(minionTemplate, Math.max(1, wave - 5));
                minion.instanceId = `${minionTemplate.id}_minion_${Date.now()}`;
                this.enemies.push(minion);
            }
            return;
        }

        // Normal wave: 1-4 enemies depending on wave
        let count = 1;
        if (wave >= 3)  count = 2;
        if (wave >= 8)  count = 3;
        if (wave >= 15) count = 4;
        count = Math.min(4, count + (Math.random() < 0.4 ? 1 : 0));

        const tierPool = this._getTierPool(wave);
        this.enemies = [];
        for (let i = 0; i < count; i++) {
            const template = tierPool[Math.floor(Math.random() * tierPool.length)];
            const enemy = new Enemy(template, wave);
            enemy.instanceId = `${template.id}_${Date.now()}_${i}`;
            this.enemies.push(enemy);
        }
    }

    _getTierPool(wave) {
        const all = ENEMIES_DATABASE.filter(e => !e.isBoss);
        // Enemies are tagged by their natural tier via id ranges
        const tier1 = all.filter(e => ['e001','e002','e003','e004','e005','e028','e050','e051','e052','e053','e054','e055'].includes(e.id));
        const tier2 = all.filter(e => ['e006','e007','e009','e021','e022','e023','e056','e057','e058','e059','e060','e061','e062','e063'].includes(e.id));
        const tier3 = all.filter(e => ['e011','e012','e024','e025','e026','e027','e064','e065','e066','e067','e068','e069','e070','e071','e072'].includes(e.id));
        const tier4 = all.filter(e => ['e030','e031','e032','e033','e073','e074','e075','e076'].includes(e.id));
        const tier5 = all.filter(e => ['e077','e078','e079'].includes(e.id));

        if (wave <= 5)   return tier1;
        if (wave <= 10)  return [...tier1, ...tier2.slice(0, 4)];
        if (wave <= 18)  return [...tier1.slice(3), ...tier2];
        if (wave <= 25)  return [...tier2, ...tier3.slice(0, 5)];
        if (wave <= 35)  return [...tier2.slice(4), ...tier3];
        if (wave <= 45)  return [...tier3, ...tier4.slice(0, 4)];
        if (wave <= 60)  return [...tier3.slice(4), ...tier4];
        return [...tier4, ...tier5];
    }

    addLog(message, type = 'neutral') {
        this.combatLog.unshift({ message, type, id: Date.now() + Math.random() });
        if (this.combatLog.length > 25) this.combatLog.pop();
    }

    get aliveHeroes() { return this.heroes.filter(h => h.isAlive); }
    get aliveEnemies() { return this.enemies.filter(e => e.isAlive); }
}

// ===========================
// BATTLE CONTROLS
// ===========================

function startRun(gameState) {
    const team = gameState.getTeamHeroes();
    if (team.length === 0) {
        showToast('Add heroes to your team first!', 'error');
        return;
    }

    gameState.recoverTeam();
    gameState.currentWave = 1;
    gameState.enemiesDefeated = 0;
    gameState.isBattleActive = true;
    gameState.stats.totalBattles++;

    renderBattleDashboard(gameState);
    startWave(gameState);
}

function startWave(gameState) {
    const team = gameState.getTeamHeroes();
    if (team.filter(h => h.isAlive).length === 0) {
        handleRunDefeat(gameState);
        return;
    }

    const bonuses = gameState.getSkillTreeBonuses();
    currentBattleState = new BattleState(team, gameState.currentWave, bonuses);
    currentBattleState.addLog(`⚔️ Wave ${gameState.currentWave} — ${currentBattleState.enemies.length} enemies!`, 'info');
    if (currentBattleState.enemies.some(e => e.isBoss)) {
        currentBattleState.addLog('🔴 BOSS WAVE! Prepare yourself!', 'special');
    }

    const nextBtn = document.getElementById('next-wave-container');
    if (nextBtn) nextBtn.classList.add('hidden');

    renderBattleArena(gameState, currentBattleState);

    if (battleInterval) clearInterval(battleInterval);
    scheduleTurn(gameState);
}

function scheduleTurn(gameState) {
    if (battleInterval) clearInterval(battleInterval);
    const delay = Math.floor(BASE_TURN_DELAY / battleSpeed);
    battleInterval = setInterval(() => {
        if (currentBattleState && !currentBattleState.processingTurn && !currentBattleState.waveComplete) {
            processBattleTurn(gameState, currentBattleState);
        }
    }, delay);
}

function stopBattle(gameState) {
    if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }
    gameState.isBattleActive = false;
    currentBattleState = null;
    renderBattleDashboard(gameState);
}

window.setBattleFocus = function(enemyInstanceId) {
    if (!currentBattleState) return;
    currentBattleState.focusedEnemyId =
        currentBattleState.focusedEnemyId === enemyInstanceId ? null : enemyInstanceId;
    updateBattleUI(window.gameState, currentBattleState);
};

window.toggleBattleSpeed = function() {
    battleSpeed = battleSpeed >= 3 ? 1 : battleSpeed + 1;
    const btn = document.getElementById('speed-btn');
    if (btn) btn.textContent = `${battleSpeed}x Speed`;
    if (currentBattleState && !currentBattleState.waveComplete) {
        scheduleTurn(window.gameState);
    }
};

// ===========================
// TURN PROCESSING (no race conditions)
// ===========================

function processBattleTurn(gameState, battleState) {
    if (!battleState.isActive || battleState.waveComplete || battleState.processingTurn) return;
    battleState.processingTurn = true;
    battleState.turnCounter++;

    if (battleState.aliveHeroes.length === 0) {
        handleRunDefeat(gameState);
        return;
    }
    if (battleState.aliveEnemies.length === 0) {
        handleWaveVictory(gameState, battleState);
        return;
    }

    // Build turn order by speed (descending)
    const turnOrder = [
        ...battleState.aliveHeroes.map(u => ({ unit: u, isHero: true })),
        ...battleState.aliveEnemies.map(u => ({ unit: u, isHero: false }))
    ].sort((a, b) => b.unit.spd - a.unit.spd);

    const unitDelay = Math.floor(600 / battleSpeed);
    let totalDelay = 0;

    turnOrder.forEach(({ unit, isHero }, i) => {
        setTimeout(() => {
            if (!battleState.isActive || battleState.waveComplete) return;
            if (!unit.isAlive) return;
            if (battleState.aliveHeroes.length === 0 || battleState.aliveEnemies.length === 0) return;

            // Check if unit is prevented from acting (stun/freeze)
            if (unit.isPrevented()) {
                const eff = unit.statusEffects.find(e => {
                    const d = STATUS_EFFECTS[e.type];
                    return d && d.preventsAction;
                });
                if (eff) {
                    eff.duration--;
                    if (eff.duration <= 0) {
                        const idx = unit.statusEffects.indexOf(eff);
                        unit.statusEffects.splice(idx, 1);
                        battleState.addLog(`${unit.name} broke free!`, 'neutral');
                    } else {
                        battleState.addLog(`${unit.name} is ${STATUS_EFFECTS[eff.type].name}!`, 'neutral');
                    }
                    updateBattleUI(gameState, battleState);
                    return;
                }
            }

            highlightActiveUnit(unit);

            if (isHero) {
                executeHeroAction(unit, battleState, gameState);
            } else {
                executeEnemyAction(unit, battleState, gameState);
            }

        }, i * unitDelay);
        totalDelay = (i + 1) * unitDelay;
    });

    // After all actions: process status effects + check win/loss
    setTimeout(() => {
        removeActiveHighlights();
        processEndOfTurnEffects(battleState, gameState);

        if (!battleState.waveComplete) {
            if (battleState.aliveHeroes.length === 0) {
                handleRunDefeat(gameState);
            } else if (battleState.aliveEnemies.length === 0) {
                handleWaveVictory(gameState, battleState);
            } else {
                battleState.processingTurn = false;
            }
        }
    }, totalDelay + 200);
}

function processEndOfTurnEffects(battleState, gameState) {
    const allUnits = [...battleState.heroes, ...battleState.enemies];
    allUnits.forEach(unit => {
        if (!unit.isAlive || unit.statusEffects.length === 0) return;
        processStatusEffects(unit, battleState);
        if (!unit.isAlive && !unit.isHero) {
            gameState.updateQuest('killEnemies', 1);
            gameState.totalKills++;
        }
        updateBattleUI(gameState, battleState);
    });
}

// ===========================
// HERO ACTIONS (Class Differentiation)
// ===========================

function executeHeroAction(hero, battleState, gameState) {
    // Auto-cast ultimate if ready
    if (gameState.autoCast && hero.canUseUltimate()) {
        performHeroUltimate(hero, battleState, gameState);
        return;
    }

    // Class-specific behavior
    switch (hero.class) {
        case 'Healer':
            executeHealerAction(hero, battleState);
            break;
        case 'Buffer':
            executeBufferAction(hero, battleState);
            break;
        case 'Tank':
            executeTankAction(hero, battleState);
            break;
        default:
            // DPS classes
            executeDPSAction(hero, battleState, gameState);
    }
}

function executeHealerAction(hero, battleState) {
    // Healers auto-heal the most injured ally if someone is below 50%
    const injured = battleState.aliveHeroes
        .filter(h => h.getHPPercent() < 50)
        .sort((a, b) => a.currentHP - b.currentHP);

    if (injured.length > 0 && Math.random() < 0.4) {
        const target = injured[0];
        const heal = Math.floor(hero.atk * 1.2);
        target.heal(heal);
        playCastAnimation(hero);
        showFloatingText(target, `+${heal}`, 'heal');
        hero.gainMana(10);
        battleState.addLog(`${hero.name} healed ${target.name} for ${heal} HP.`, 'heal');
        updateBattleUI(window.gameState, battleState);
        return;
    }
    // Otherwise attack
    const target = getSmartTarget(hero, battleState.enemies, battleState.focusedEnemyId);
    if (target) performAttack(hero, target, battleState, true);
}

function executeBufferAction(hero, battleState) {
    // Check if allies need buffs
    const needsATKBuff = battleState.aliveHeroes.some(h =>
        !h.statusEffects.some(e => e.type === 'atk_up')
    );
    if (needsATKBuff && Math.random() < 0.3) {
        battleState.aliveHeroes.forEach(h => {
            applyStatus(h, 'atk_up', 3, 20, battleState);
        });
        playCastAnimation(hero);
        hero.gainMana(10);
        battleState.addLog(`${hero.name} rallied the team! ATK Up!`, 'special');
        updateBattleUI(window.gameState, battleState);
        return;
    }
    const target = getSmartTarget(hero, battleState.enemies, battleState.focusedEnemyId);
    if (target) performAttack(hero, target, battleState, true);
}

function executeTankAction(hero, battleState) {
    // Tanks taunt: force enemies to target them next action by marking focus
    if (Math.random() < 0.25) {
        battleState.addLog(`${hero.name} taunts the enemies!`, 'neutral');
        hero.gainMana(15);
        // Give tank a small shield
        hero.shieldHP += Math.floor(hero.maxHP * 0.05);
        showFloatingText(hero, 'TAUNT!', 'heal');
        playCastAnimation(hero);
        updateBattleUI(window.gameState, battleState);
        return;
    }
    const target = getSmartTarget(hero, battleState.enemies, battleState.focusedEnemyId);
    if (target) performAttack(hero, target, battleState, true);
}

function executeDPSAction(hero, battleState, gameState) {
    if (hero.class === 'DPS (AoE)' && battleState.aliveEnemies.length >= 2 && Math.random() < 0.35) {
        // AoE splash: hit all enemies for reduced damage
        const dmg = Math.floor(hero.getEffectiveStat('atk') * 0.6);
        battleState.aliveEnemies.forEach(e => {
            e.takeDamage(dmg);
            playHitAnimation(e);
            showFloatingText(e, `-${dmg}`, 'damage');
            if (!e.isAlive) {
                gameState.updateQuest('killEnemies', 1);
                gameState.totalKills++;
                if (battleState.focusedEnemyId === e.instanceId) battleState.focusedEnemyId = null;
            }
        });
        hero.gainMana(20);
        playAttackAnimation(hero, 'right');
        battleState.addLog(`${hero.name} attacks all enemies for ${dmg}!`, 'success');
        updateBattleUI(window.gameState, battleState);
        return;
    }
    const target = getSmartTarget(hero, battleState.enemies, battleState.focusedEnemyId);
    if (target) performAttack(hero, target, battleState, true);
}

// ===========================
// ENEMY ACTIONS (Smarter AI)
// ===========================

function executeEnemyAction(enemy, battleState, gameState) {
    const aliveHeroes = battleState.aliveHeroes;
    if (aliveHeroes.length === 0) return;

    const behavior = enemy.behavior || 'aggressive';
    const specials  = enemy.special || [];

    // ── Behavior-based targeting ────────────────────────────────
    let target = null;
    switch (behavior) {
        case 'aggressive':
            // Attack lowest-HP hero to secure kills
            target = Math.random() < 0.6
                ? aliveHeroes.slice().sort((a, b) => a.currentHP - b.currentHP)[0]
                : getRandomTarget(aliveHeroes);
            break;
        case 'defensive':
            // Prefer highest-DEF hero (tank) to not be exploited; fallback random
            target = Math.random() < 0.5
                ? aliveHeroes.slice().sort((a, b) => b.def - a.def)[0]
                : getRandomTarget(aliveHeroes);
            break;
        case 'evasive':
            // Target lowest-SPD hero (easier to hit)
            target = Math.random() < 0.4
                ? aliveHeroes.slice().sort((a, b) => a.spd - b.spd)[0]
                : getRandomTarget(aliveHeroes);
            break;
        case 'berserker':
            // Always target lowest HP; bonus damage when own HP < 50% handled below
            target = aliveHeroes.slice().sort((a, b) => a.currentHP - b.currentHP)[0];
            break;
        case 'technical':
            // Prefer heroes without status effects (fresh targets for debuffs)
            {
                const clean = aliveHeroes.filter(h => h.statusEffects.length === 0);
                target = clean.length > 0 ? clean[Math.floor(Math.random() * clean.length)] : getRandomTarget(aliveHeroes);
            }
            break;
        case 'support':
            // Healers try to heal allies first, then attack
            {
                const injured = battleState.enemies.filter(e => e.isAlive && e.currentHP < e.maxHP * 0.5);
                if (injured.length > 0 && specials.includes('healer') && Math.random() < 0.5) {
                    const healTarget = injured[Math.floor(Math.random() * injured.length)];
                    const healAmt = Math.floor(enemy.atk * 0.8);
                    healTarget.heal(healAmt);
                    showFloatingText(healTarget, `+${healAmt}`, 'heal');
                    battleState.addLog(`${enemy.name} healed ${healTarget.name}!`, 'heal');
                    updateBattleUI(gameState, battleState);
                    return;
                }
                target = getRandomTarget(aliveHeroes);
            }
            break;
        default:
            target = getRandomTarget(aliveHeroes);
    }

    if (!target) return;

    // ── Berserker bonus damage at low HP ──────────────────────
    const hpPct = enemy.currentHP / enemy.maxHP;
    if (behavior === 'berserker' && hpPct < 0.5 && Math.random() < 0.3) {
        battleState.addLog(`${enemy.name} enters a frenzy!`, 'warning');
        // Temporarily boost atk for this hit (handled via 1.5× in performAttack below)
        enemy._berserkActive = true;
    }

    performAttack(enemy, target, battleState, false);
    enemy._berserkActive = false;

    // ── Special abilities (post-attack) ──────────────────────
    const abilityRoll = Math.random();

    if (specials.includes('poisoner') && abilityRoll < 0.22) {
        const pt = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        applyStatus(pt, 'poison', 2, 0, battleState);
        battleState.addLog(`☠️ ${enemy.name} poisoned ${pt.name}!`, 'warning');
    } else if (specials.includes('stunner') && abilityRoll < 0.15) {
        const pt = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        applyStatus(pt, 'stun', 1, 0, battleState);
        battleState.addLog(`⚡ ${enemy.name} stunned ${pt.name}!`, 'warning');
    } else if (specials.includes('shielder') && enemy.currentHP < enemy.maxHP * 0.4 && abilityRoll < 0.25) {
        enemy.shieldHP += Math.floor(enemy.maxHP * 0.1);
        showFloatingText(enemy, '🛡️SHIELD', 'heal');
        battleState.addLog(`🛡️ ${enemy.name} raised a shield!`, 'special');
    } else if (specials.includes('healer') && abilityRoll < 0.18) {
        const healAmt = Math.floor(enemy.maxHP * 0.08);
        enemy.heal(healAmt);
        showFloatingText(enemy, `+${healAmt}`, 'heal');
        battleState.addLog(`💚 ${enemy.name} regenerated!`, 'heal');
    }

    // Boss extra ability
    if (enemy.isBoss && Math.random() < 0.20) {
        const bossTarget = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        const bossAbility = specials[Math.floor(Math.random() * specials.length)] || 'poisoner';
        if (bossAbility === 'poisoner') {
            applyStatus(bossTarget, 'poison', 3, 0, battleState);
            battleState.addLog(`💀 ${enemy.name} unleashed Dark Miasma!`, 'special');
        } else if (bossAbility === 'stunner') {
            applyStatus(bossTarget, 'stun', 1, 0, battleState);
            battleState.addLog(`⚡ ${enemy.name} used Paralyzing Roar!`, 'special');
        } else if (bossAbility === 'shielder') {
            enemy.shieldHP += Math.floor(enemy.maxHP * 0.15);
            battleState.addLog(`🛡️ ${enemy.name} conjured a barrier!`, 'special');
        } else if (bossAbility === 'healer') {
            const hAmt = Math.floor(enemy.maxHP * 0.12);
            enemy.heal(hAmt);
            showFloatingText(enemy, `+${hAmt}`, 'heal');
            battleState.addLog(`💚 ${enemy.name} regenerated power!`, 'heal');
        }
        updateBattleUI(gameState, battleState);
    }
}

// ===========================
// TARGETING
// ===========================

function getSmartTarget(hero, enemies, focusedId) {
    const alive = enemies.filter(e => e.isAlive);
    if (alive.length === 0) return null;

    if (focusedId) {
        const focused = alive.find(e => e.instanceId === focusedId);
        if (focused) return focused;
    }

    // Prefer elemental advantage
    if (hero.element && ELEMENT_ADVANTAGE[hero.element]) {
        const adv = ELEMENT_ADVANTAGE[hero.element];
        const weak = alive.filter(e => e.element === adv.strong);
        if (weak.length > 0) return weak[Math.floor(Math.random() * weak.length)];
    }

    // Prefer lowest HP (finish them off)
    if (Math.random() < 0.4) {
        return alive.reduce((a, b) => a.currentHP < b.currentHP ? a : b);
    }

    return alive[Math.floor(Math.random() * alive.length)];
}

function getRandomTarget(units) {
    const alive = units.filter(u => u.isAlive);
    return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
}

// ===========================
// ATTACK RESOLUTION
// ===========================

function performAttack(attacker, defender, battleState, isHero) {
    if (!attacker.isAlive || !defender.isAlive) return;

    let atkStat = isHero ? attacker.getEffectiveStat('atk') : attacker.atk;
    // Berserker bonus
    if (!isHero && attacker._berserkActive) atkStat = Math.floor(atkStat * 1.5);
    const defStat = defender.def;

    let damage = Math.max(1, atkStat - defStat * 0.45);
    let isEffective = false;
    let isResisted = false;

    // Element calculation
    if (attacker.element && defender.element && ELEMENT_ADVANTAGE[attacker.element]) {
        const adv = ELEMENT_ADVANTAGE[attacker.element];
        if (adv.strong === defender.element) { damage *= 1.5; isEffective = true; }
        else if (adv.weak === defender.element) { damage *= 0.7; isResisted = true; }
    }

    // Crit calculation
    const critChance = isHero ? (attacker.critChance || 0.15) : 0.10;
    const isCrit = Math.random() < critChance;
    if (isCrit) damage *= 1.75;

    damage = Math.floor(damage);

    // Animations
    playAttackAnimation(attacker, isHero ? 'right' : 'left');
    setTimeout(() => {
        playHitAnimation(defender);
        const actualDmg = defender.takeDamage(damage);

        // Mana gain
        if (isHero) {
            attacker.gainMana(15);
            if (!defender.isAlive) {
                // Apply on-kill status effects based on element
                if (attacker.element === 'Fire') applyStatus(defender, 'burn', 2, 0, null);
            }
        } else {
            defender.gainMana(8);
        }

        // Log
        let msg = `${attacker.name} → ${defender.name}: ${damage} dmg`;
        if (isCrit)      msg += ' 💥CRIT!';
        if (isEffective) msg += ' ✨Effective!';
        if (isResisted)  msg += ' 🔰Resisted';
        battleState.addLog(msg, isHero ? 'success' : 'warning');

        // Apply on-hit status effects
        if (isHero && attacker.element === 'Fire' && Math.random() < 0.25) {
            applyStatus(defender, 'burn', 2, 0, battleState);
        }
        if (isHero && attacker.element === 'Water' && Math.random() < 0.15) {
            applyStatus(defender, 'freeze', 1, 0, battleState);
        }
        if (isHero && attacker.element === 'Dark' && Math.random() < 0.20) {
            applyStatus(defender, 'poison', 2, 0, battleState);
        }

        // Floating text
        const floatType = isCrit ? 'crit' : isHero ? 'damage' : 'enemy-damage';
        showFloatingText(defender, isCrit ? `💥${damage}` : `-${damage}`, floatType);

        if (!isHero && !defender.isAlive) {
            // Hero died — nothing extra needed, checked in main loop
        }
        if (isHero && !defender.isAlive) {
            gameState.updateQuest('killEnemies', 1);
            gameState.totalKills++;
            if (battleState.focusedEnemyId === defender.instanceId) battleState.focusedEnemyId = null;
        }

        updateBattleUI(window.gameState, battleState);
    }, Math.floor(250 / battleSpeed));
}

// ===========================
// ULTIMATE ABILITIES
// ===========================

function performHeroUltimate(hero, battleState, gameState) {
    if (!hero.canUseUltimate()) return;
    hero.useUltimate();
    playCastAnimation(hero);
    battleState.addLog(`✨ ${hero.name} unleashed ${hero.ultimate.name}!`, 'special');
    showFloatingText(hero, '✨ULTIMATE!', 'heal');
    gameState.updateQuest('useUltimates', 1);

    const aHeroes = battleState.aliveHeroes;
    const aEnemies = battleState.aliveEnemies;

    setTimeout(() => {
        switch (hero.class) {
            case 'Healer':
                // Full team heal + regen
                aHeroes.forEach(h => {
                    const amt = Math.floor(hero.atk * 2.5);
                    h.heal(amt);
                    applyStatus(h, 'regen', 3);
                    showFloatingText(h, `+${amt}`, 'heal');
                    playCastAnimation(h);
                });
                battleState.addLog(`${hero.name} healed the team!`, 'heal');
                break;

            case 'Buffer':
                // Buff all stats
                aHeroes.forEach(h => {
                    applyStatus(h, 'atk_up', 3, 30, battleState);
                    applyStatus(h, 'def_up', 3, 20, battleState);
                    applyStatus(h, 'spd_up', 3, 20, battleState);
                    showFloatingText(h, '⬆️ALL UP!', 'heal');
                    playCastAnimation(h);
                });
                battleState.addLog(`${hero.name} buffed the entire team!`, 'special');
                break;

            case 'Tank':
                // Invincible + team shield
                applyStatus(hero, 'invincible', 1, 0, battleState);
                aHeroes.forEach(h => {
                    h.shieldHP += Math.floor(h.maxHP * 0.20);
                    showFloatingText(h, '🛡️SHIELD!', 'heal');
                    playCastAnimation(h);
                });
                battleState.addLog(`${hero.name} shields the team!`, 'special');
                break;

            case 'DPS (AoE)':
                // Massive AoE
                aEnemies.forEach(e => {
                    const dmg = Math.floor(hero.atk * 2.0);
                    e.takeDamage(dmg);
                    playHitAnimation(e);
                    showFloatingText(e, `-${dmg}`, 'crit');
                    // Element status on ult
                    if (hero.element === 'Fire')  applyStatus(e, 'burn',   3, 0, battleState);
                    if (hero.element === 'Water') applyStatus(e, 'freeze', 2, 0, battleState);
                    if (hero.element === 'Dark')  applyStatus(e, 'poison', 3, 0, battleState);
                    if (!e.isAlive) {
                        gameState.updateQuest('killEnemies', 1);
                        gameState.totalKills++;
                        if (battleState.focusedEnemyId === e.instanceId) battleState.focusedEnemyId = null;
                    }
                });
                battleState.addLog(`${hero.name} devastated all enemies!`, 'success');
                break;

            default: {
                // DPS Single: massive single-target hit
                const target = getSmartTarget(hero, battleState.enemies, battleState.focusedEnemyId);
                if (target) {
                    let dmg;
                    if (hero.ultimate.name === 'Void Reaper' && target.getHPPercent() <= 30) {
                        dmg = target.currentHP; // Execute
                        battleState.addLog(`${hero.name} executed ${target.name}!`, 'special');
                    } else if (hero.ultimate.name === 'Soul Shatter') {
                        const missing = target.maxHP - target.currentHP;
                        dmg = Math.floor(hero.atk * 2 + missing * 0.5);
                    } else {
                        dmg = Math.floor(hero.atk * 4.5);
                    }
                    target.takeDamage(dmg);
                    playHitAnimation(target);
                    showFloatingText(target, `-${dmg}`, 'crit');
                    if (hero.element === 'Dark')  applyStatus(target, 'stun', 1, 0, battleState);
                    if (!target.isAlive) {
                        gameState.updateQuest('killEnemies', 1);
                        gameState.totalKills++;
                        if (battleState.focusedEnemyId === target.instanceId) battleState.focusedEnemyId = null;
                    }
                }
                battleState.addLog(`${hero.name} unleashed ${hero.ultimate.name}!`, 'success');
                break;
            }
        }

        updateBattleUI(gameState, battleState);

        if (battleState.aliveEnemies.length === 0) {
            setTimeout(() => handleWaveVictory(gameState, battleState), 300);
        }
    }, Math.floor(400 / battleSpeed));
}

// ===========================
// MANUAL ULTIMATE (onclick)
// ===========================

window.manualUltimate = function(heroId) {
    if (!currentBattleState || currentBattleState.waveComplete) return;
    const hero = currentBattleState.heroes.find(h => h.id === heroId);
    if (hero && hero.canUseUltimate()) {
        performHeroUltimate(hero, currentBattleState, window.gameState);
    }
};

window.useTea = function(id, gameState) {
    if (gameState.getItemCount('teas', id) <= 0) return;
    const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
    if (!data || !currentBattleState) return;

    const heroes = currentBattleState.aliveHeroes;
    if (heroes.length === 0) return;

    if (data.effectType === 'heal') {
        heroes.forEach(h => {
            const amt = Math.floor(h.maxHP * data.effectValue);
            h.heal(amt);
            showFloatingText(h, `+${amt}`, 'heal');
            playCastAnimation(h);
        });
        currentBattleState.addLog(`🍵 ${data.name}: Team healed!`, 'heal');
    } else if (data.effectType === 'buff_atk') {
        heroes.forEach(h => {
            applyStatus(h, 'atk_up', 3, Math.floor(data.effectValue * 100), currentBattleState);
            showFloatingText(h, '⬆️ATK UP!', 'heal');
            playCastAnimation(h);
        });
        currentBattleState.addLog(`🍵 ${data.name}: Attack boosted!`, 'special');
    } else if (data.effectType === 'buff_def') {
        heroes.forEach(h => {
            applyStatus(h, 'def_up', 3, Math.floor(data.effectValue * 100), currentBattleState);
            showFloatingText(h, '⬆️DEF UP!', 'heal');
            playCastAnimation(h);
        });
        currentBattleState.addLog(`🍵 ${data.name}: Defense boosted!`, 'special');
    } else if (data.effectType === 'execute') {
        const lowHP = currentBattleState.aliveEnemies.filter(e => e.getHPPercent() < data.effectValue * 100);
        lowHP.forEach(e => {
            e.takeDamage(e.currentHP);
            playHitAnimation(e);
            showFloatingText(e, '💀EXECUTE!', 'crit');
            if (!e.isAlive) {
                gameState.updateQuest('killEnemies', 1);
                gameState.totalKills++;
            }
        });
        currentBattleState.addLog(`🧪 ${data.name}: Executed ${lowHP.length} enemies!`, 'special');
    }

    gameState.removeItem('teas', id, 1);
    updateBattleUI(gameState, currentBattleState);
};

// ===========================
// ANIMATION HELPERS
// ===========================

function getUnitElement(unit) {
    return document.querySelector(`[data-unit-id="${unit.instanceId || unit.id}"]`);
}

function highlightActiveUnit(unit) {
    removeActiveHighlights();
    const el = getUnitElement(unit);
    if (el) el.classList.add('active-turn');
}

function removeActiveHighlights() {
    document.querySelectorAll('.active-turn').forEach(el => el.classList.remove('active-turn'));
}

function playAttackAnimation(unit, direction) {
    const el = getUnitElement(unit);
    if (!el) return;
    const cls = direction === 'right' ? 'anim-lunge-right' : 'anim-lunge-left';
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), Math.floor(600 / battleSpeed));
}

function playHitAnimation(unit) {
    const el = getUnitElement(unit);
    if (!el) return;
    el.classList.remove('anim-hit');
    void el.offsetWidth;
    el.classList.add('anim-hit');
    setTimeout(() => el.classList.remove('anim-hit'), 400);
}

function playCastAnimation(unit) {
    const el = getUnitElement(unit);
    if (!el) return;
    el.classList.remove('anim-cast');
    void el.offsetWidth;
    el.classList.add('anim-cast');
    setTimeout(() => el.classList.remove('anim-cast'), 700);
}

function showFloatingText(unit, text, type) {
    const el = document.querySelector(`[data-unit-id="${unit.instanceId || unit.id}"]`);
    if (!el) return;
    const floater = document.createElement('div');
    const colorMap = {
        crit: 'text-red-500', heal: 'text-green-400',
        damage: 'text-slate-800', 'enemy-damage': 'text-orange-500',
        special: 'text-purple-500', fire: 'text-orange-600',
        poison: 'text-purple-600'
    };
    floater.className = `damage-number ${colorMap[type] || 'text-slate-800'}`;
    floater.textContent = text;
    el.appendChild(floater);
    setTimeout(() => floater.remove(), 900);
}

// Element color helpers
function _elBg(element) {
    const map = { Fire:'#fef2f2', Water:'#eff6ff', Wind:'#f0fdf4', Light:'#fefce8', Dark:'#faf5ff' };
    return map[element] || '#f8fafc';
}
function _elText(element) {
    const map = { Fire:'#dc2626', Water:'#2563eb', Wind:'#059669', Light:'#d97706', Dark:'#7c3aed' };
    return map[element] || '#475569';
}

// ===========================
// RENDERING — PRE-BATTLE
// ===========================

function renderBattleDashboard(gameState) {
    const container = document.getElementById('battle-tab');
    if (!container) return;

    if (!gameState.isBattleActive) {
        renderPreBattleScreen(container, gameState);
        return;
    }

    if (!document.getElementById('battle-arena-root')) {
        renderBattleArena(gameState, currentBattleState);
    }
}

function renderPreBattleScreen(container, gameState) {
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full max-w-5xl mx-auto text-center animate-entry py-8 px-4">
            <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-red-200">
                <i class="fa-solid fa-swords"></i>
            </div>
            <h2 class="text-4xl font-heading font-bold text-slate-800 mb-2">Battle Arena</h2>
            <p class="text-slate-500 mb-8 max-w-lg">Fight endless waves of enemies. HP does not restore between waves. How far can you go?</p>

            <div class="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                <div class="flex justify-between items-center mb-5">
                    <h3 class="font-bold text-slate-700 text-lg">Team Formation</h3>
                    <button class="btn btn-secondary text-sm" onclick="switchView('roster')">
                        <i class="fa-solid fa-users"></i> Manage Roster
                    </button>
                </div>
                <div class="flex flex-wrap justify-center gap-4" id="pre-battle-team">
                    ${Array.from({length:5}).map((_, i) => createTeamSlotHTML(i, gameState)).join('')}
                </div>
                <div class="mt-4 text-xs text-slate-400 text-center">
                    <i class="fa-solid fa-circle-info mr-1"></i> Click any slot to change hero
                </div>
            </div>

            ${gameState.highestWave > 0 ? `
            <div class="mb-6 flex gap-6 text-center">
                <div class="bg-white border border-slate-200 rounded-xl px-6 py-3 shadow-sm">
                    <div class="text-2xl font-bold text-rose-500">${gameState.highestWave}</div>
                    <div class="text-xs text-slate-400 uppercase font-bold">Best Wave</div>
                </div>
                <div class="bg-white border border-slate-200 rounded-xl px-6 py-3 shadow-sm">
                    <div class="text-2xl font-bold text-slate-700">${formatNumber(gameState.totalKills)}</div>
                    <div class="text-xs text-slate-400 uppercase font-bold">Enemies Slain</div>
                </div>
            </div>` : ''}

            <button class="btn btn-primary text-xl px-14 py-4 shadow-xl shadow-pink-200 hover:scale-105 transition-transform"
                    onclick="startRun(window.gameState)">
                <i class="fa-solid fa-swords mr-2"></i> Start Run
            </button>
        </div>
    `;

    // Attach slot click handlers
    for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`pre-slot-${i}`);
        if (el) el.onclick = () => showHeroSelectionModal(i, window.gameState);
    }
}

function createTeamSlotHTML(index, gameState) {
    const heroId = gameState.team[index];
    const hero = heroId ? gameState.roster.find(h => h.id === heroId) : null;

    if (hero) {
        const elColor = ELEMENT_COLORS[hero.element] || ELEMENT_COLORS['Fire'];
        return `
            <div id="pre-slot-${index}" class="relative w-32 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white group shadow-sm">
                <div class="aspect-[3/4] relative overflow-hidden">
                    <img src="images/${hero.id}.jpg" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-white text-3xl font-heading font-bold\'>${hero.name.substring(0,2).toUpperCase()}</div>'">
                    <div class="absolute top-1 left-1 text-[10px] text-yellow-400 font-bold drop-shadow">${'⭐'.repeat(Math.min(hero.stars, 5))}</div>
                    <div class="absolute top-1 right-1 badge-${hero.rarity} text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">${hero.rarity}</div>
                    <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-1.5">
                        <div class="text-white text-xs font-bold truncate">${hero.name}</div>
                        <div class="text-slate-300 text-[9px]">Lv.${hero.level} · ${hero.class}</div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div id="pre-slot-${index}" class="relative w-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary hover:bg-pink-50 transition-all duration-200 bg-slate-50 group shadow-sm">
            <div class="aspect-[3/4] flex flex-col items-center justify-center gap-2 text-slate-300 group-hover:text-primary">
                <i class="fa-solid fa-plus text-3xl"></i>
                <span class="text-xs font-bold uppercase">Empty</span>
            </div>
        </div>
    `;
}

// ===========================
// RENDERING — BATTLE ARENA
// ===========================

function renderBattleArena(gameState, battleState) {
    const container = document.getElementById('battle-tab');
    if (!container) return;

    const isBossWave = battleState && battleState.enemies.some(e => e.isBoss);
    const waveLabel = isBossWave
        ? `<span class="text-red-500 animate-pulse">👑 BOSS</span>`
        : `Wave ${battleState?.waveNumber ?? gameState.currentWave}`;

    container.innerHTML = `
        <div id="battle-arena-root" class="battle-dashboard animate-entry h-[calc(100vh-140px)] min-h-[580px]">

            <!-- LEFT: Stats & Log -->
            <div class="flex flex-col gap-3 h-full overflow-hidden">
                <!-- Wave stats bar -->
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="arena-stat-pill ${isBossWave ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}">
                            <div class="arena-stat-label">Wave</div>
                            <div class="arena-stat-val ${isBossWave ? 'text-red-500' : 'text-primary'}" id="dash-wave">${waveLabel}</div>
                        </div>
                        <div class="arena-stat-pill bg-slate-50">
                            <div class="arena-stat-label">Kills</div>
                            <div class="arena-stat-val text-slate-700" id="dash-kills">0</div>
                        </div>
                        <div class="arena-stat-pill bg-slate-50">
                            <div class="arena-stat-label">Turn</div>
                            <div class="arena-stat-val text-slate-700" id="dash-turn">0</div>
                        </div>
                    </div>
                </div>

                <!-- Combat log -->
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                    <div class="flex items-center justify-between mb-2">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combat Log</div>
                        <button class="text-[10px] text-slate-300 hover:text-slate-500" onclick="document.getElementById('combat-log').innerHTML=''">Clear</button>
                    </div>
                    <div id="combat-log" class="flex-1 overflow-y-auto text-[11px] space-y-0.5 font-mono pr-1"></div>
                </div>
            </div>

            <!-- CENTER: Battle Field -->
            <div class="flex flex-col gap-2 h-full relative">

                <!-- Enemy zone -->
                <div class="arena-zone arena-enemy-zone flex-1">
                    <div class="arena-zone-label enemy">
                        <i class="fa-solid fa-skull-crossbones mr-1"></i>
                        Enemies
                        <span class="ml-2 text-red-300 font-normal" id="enemy-count-label"></span>
                    </div>
                    <div id="arena-enemies" class="arena-units enemy-side"></div>
                </div>

                <!-- VS divider -->
                <div class="arena-vs-bar shrink-0">
                    <div class="arena-vs-line"></div>
                    <div class="arena-vs-badge">VS</div>

                    <div id="next-wave-container" class="absolute inset-0 flex items-center justify-center z-50 hidden">
                        <button class="btn btn-primary animate-bounce shadow-xl px-8 py-3 text-base border-2 border-white"
                                onclick="startWave(window.gameState)">
                            <i class="fa-solid fa-forward mr-2"></i> Next Wave
                        </button>
                    </div>
                </div>

                <!-- Hero zone -->
                <div class="arena-zone arena-hero-zone flex-1">
                    <div class="arena-zone-label hero">
                        <i class="fa-solid fa-shield-halved mr-1"></i>
                        Your Team
                    </div>
                    <div id="arena-heroes" class="arena-units hero-side"></div>
                </div>
            </div>

            <!-- RIGHT: Controls -->
            <div class="flex flex-col gap-3 h-full overflow-y-auto battle-dashboard-right">

                <!-- Ultimates -->
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <i class="fa-solid fa-star-of-david mr-1 text-amber-400"></i> Ultimates
                    </div>
                    <div id="ultimates-list" class="space-y-2"></div>
                </div>

                <!-- Battle items -->
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <i class="fa-solid fa-flask mr-1 text-green-400"></i> Battle Items
                    </div>
                    <div id="battle-tea-list" class="grid grid-cols-2 gap-2"></div>
                </div>

                <!-- Controls -->
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mt-auto space-y-2">
                    <button id="auto-btn" class="btn w-full ${gameState.autoCast ? 'btn-primary' : 'btn-secondary'} text-sm" onclick="toggleAutoCast()">
                        <i class="fa-solid fa-robot"></i>
                        <span id="auto-btn-text">${gameState.autoCast ? 'Auto: ON' : 'Auto: OFF'}</span>
                    </button>
                    <button id="speed-btn" class="speed-toggle-btn w-full justify-center speed-${battleSpeed}x" onclick="toggleBattleSpeed()">
                        <i class="fa-solid fa-gauge-high"></i> ${battleSpeed}x Speed
                    </button>
                    <button class="btn btn-secondary w-full text-sm text-red-500 border-red-100 hover:bg-red-50"
                            onclick="handleRunDefeat(window.gameState)">
                        <i class="fa-solid fa-flag-checkered mr-1"></i> Retreat
                    </button>
                </div>
            </div>
        </div>
    `;

    if (battleState) updateBattleUI(gameState, battleState);
}

// ===========================
// BATTLE UI UPDATER
// ===========================

function updateBattleUI(gameState, battleState) {
    if (!battleState) return;

    const waveEl  = document.getElementById('dash-wave');
    const killsEl = document.getElementById('dash-kills');
    const turnEl  = document.getElementById('dash-turn');
    const isBoss  = battleState.enemies.some(e => e.isBoss);
    if (waveEl) {
        waveEl.innerHTML = isBoss
            ? `<span class="text-red-500">👑 BOSS</span>`
            : String(gameState.currentWave);
    }
    if (killsEl) killsEl.textContent = formatNumber(gameState.totalKills);
    if (turnEl)  turnEl.textContent  = battleState.turnCounter;

    // Update enemy count label
    const countLabel = document.getElementById('enemy-count-label');
    if (countLabel) {
        const alive = battleState.aliveEnemies.length;
        const total = battleState.enemies.length;
        countLabel.textContent = `${alive}/${total}`;
    }

    const logEl = document.getElementById('combat-log');
    if (logEl) {
        logEl.innerHTML = battleState.combatLog.map(log => {
            const colorMap = {
                info: 'text-blue-500 font-bold', success: 'text-green-600',
                warning: 'text-orange-500', special: 'text-purple-500 font-bold',
                heal: 'text-green-500', fire: 'text-orange-600',
                poison: 'text-purple-600', neutral: 'text-slate-500'
            };
            const cls = colorMap[log.type] || 'text-slate-500';
            return `<div class="${cls} leading-relaxed">${log.message}</div>`;
        }).join('');
        logEl.scrollTop = 0;
    }

    const heroesContainer  = document.getElementById('arena-heroes');
    const enemiesContainer = document.getElementById('arena-enemies');
    if (heroesContainer)  renderUnits(heroesContainer,  battleState.heroes,  true,  battleState);
    if (enemiesContainer) renderUnits(enemiesContainer, battleState.enemies, false, battleState);

    // Ultimates list
    const ultsEl = document.getElementById('ultimates-list');
    if (ultsEl) {
        ultsEl.innerHTML = battleState.heroes
            .filter(h => h.isAlive)
            .map(hero => {
                const canCast = hero.canUseUltimate();
                const pct = hero.getManaPercent();
                return `
                    <div class="bg-slate-50 border ${canCast ? 'glow-gold border-amber-300 cursor-pointer hover:bg-amber-50' : 'border-slate-200'} p-2.5 rounded-xl transition-all"
                         onclick="${canCast ? `manualUltimate('${hero.id}')` : ''}">
                        <div class="flex justify-between items-center mb-1">
                            <div class="text-xs font-bold text-slate-700 truncate">${hero.name}</div>
                            <span class="text-[10px] font-bold ml-1 ${canCast ? 'text-amber-600 animate-pulse' : 'text-slate-400'}">${canCast ? 'READY!' : Math.floor(pct)+'%'}</span>
                        </div>
                        <div class="text-[9px] text-slate-400 mb-1.5 truncate">${hero.ultimate.name}</div>
                        <div class="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div class="${canCast ? 'bg-amber-400' : 'bg-blue-400'} h-full transition-all duration-300" style="width:${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    renderTeaList(gameState);
}

function renderUnits(container, units, isHero, battleState) {
    const existing = new Map();
    Array.from(container.children).forEach(el => {
        const id = el.getAttribute('data-unit-id');
        if (id) existing.set(id, el);
    });

    const active = new Set();

    units.forEach(unit => {
        const unitId = unit.instanceId || unit.id;
        active.add(unitId);

        const hpPct   = unit.getHPPercent();
        const hpText  = `${Math.floor(unit.currentHP)}/${unit.maxHP}`;
        const mpPct   = isHero ? unit.getManaPercent() : 0;
        const shPct   = (isHero && unit.shieldHP > 0) ? Math.min(100, (unit.shieldHP / unit.maxHP) * 100) : 0;
        const statuses = (unit.statusEffects || []).map(e => STATUS_EFFECTS[e.type]?.emoji || '').join('');

        let div = existing.get(unitId);

        if (!div) {
            div = document.createElement('div');
            div.className = `battle-unit ${isHero ? 'is-hero' : 'is-enemy cursor-pointer hover:scale-105 hover:shadow-lg'}`;
            div.setAttribute('data-unit-id', unitId);
            if (!isHero) div.onclick = () => window.setBattleFocus(unitId);

            const imgSrc = isHero ? `images/${unit.id}.jpg` : `images/enemies/${unit.id}.jpg`;
            const elColor = ELEMENT_COLORS[unit.element] || ELEMENT_COLORS['Fire'];

            const behaviorIcon = { aggressive:'⚔️', defensive:'🛡️', evasive:'💨', berserker:'🔥', technical:'🔮', support:'💚' };
            const unitSubtitle = isHero
                ? `Lv.${unit.level} · ${unit.class}`
                : `${unit.behavior ? (behaviorIcon[unit.behavior] || '') + ' ' + unit.behavior : ''}`;
            const unitEmoji = (!isHero && unit.emoji) ? unit.emoji : '';

            div.innerHTML = `
                <div class="battle-unit-image-area">
                    ${unitEmoji
                        ? `<div class="absolute inset-0 bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-5xl select-none">${unitEmoji}</div>`
                        : `<img src="${imgSrc}" class="battle-unit-img"
                               onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden')">
                           <div class="hidden absolute inset-0 bg-gradient-to-br ${elColor.from} ${elColor.to} flex items-center justify-center text-white text-3xl font-bold">${unit.name.substring(0,2).toUpperCase()}</div>`
                    }

                    <div class="absolute top-1.5 left-1.5 element-badge z-10" style="background:${_elBg(unit.element)}; color:${_elText(unit.element)}; padding:2px 5px; border-radius:999px; font-size:9px; font-weight:700;">
                        ${elColor.emoji} ${unit.element}
                    </div>

                    ${unit.isBoss ? '<div class="absolute top-1.5 right-1.5 boss-badge z-10">BOSS</div>' : ''}

                    <div class="focus-indicator absolute inset-0 z-20 hidden pointer-events-none" style="border:3px solid #ef4444; border-radius: inherit;">
                        <div class="absolute top-0 left-0 right-0 flex justify-center">
                            <div style="background:#ef4444; color:white; font-size:9px; font-weight:800; padding:2px 8px; border-radius:0 0 6px 6px; letter-spacing:.05em;">TARGET</div>
                        </div>
                    </div>

                    <div class="battle-unit-overlay">
                        <div class="battle-unit-name">${unit.name}</div>
                        <div class="battle-unit-info capitalize">${unitSubtitle}</div>
                    </div>
                </div>

                <div class="battle-unit-stats-area">
                    <div class="status-badges flex flex-wrap gap-0.5 mb-1" id="status-${unitId}"></div>

                    <div class="stat-row">
                        <div class="stat-item"><span class="stat-val stat-val-atk">${unit.atk}</span><span class="stat-icon">⚔️</span></div>
                        <div class="stat-item"><span class="stat-val stat-val-def">${unit.def}</span><span class="stat-icon">🛡️</span></div>
                        <div class="stat-item"><span class="stat-val stat-val-spd">${unit.spd}</span><span class="stat-icon">💨</span></div>
                    </div>

                    <div class="bar-groups">
                        <div class="bar-group">
                            <div class="bar-label-row">
                                <span class="text-slate-500">HP</span>
                                <span class="hp-text text-[9px] font-mono text-slate-400">${hpText}</span>
                            </div>
                            <div class="bar-track" style="position:relative;">
                                <div class="bar-fill hp" style="width:${hpPct}%"></div>
                                ${shPct > 0 ? `<div class="bar-fill shield" style="width:${shPct}%; position:absolute; top:0; left:0; opacity:0.7;"></div>` : ''}
                            </div>
                        </div>
                        ${isHero ? `
                        <div class="bar-group">
                            <div class="bar-label-row">
                                <span class="text-blue-400">MP</span>
                                <span class="mp-text text-[9px] font-mono text-slate-400">${Math.floor(unit.mana)}/${unit.maxMana}</span>
                            </div>
                            <div class="bar-track"><div class="bar-fill mana" style="width:${mpPct}%"></div></div>
                        </div>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        } else {
            // Update values
            const atkEl = div.querySelector('.stat-val-atk');
            const defEl = div.querySelector('.stat-val-def');
            const spdEl = div.querySelector('.stat-val-spd');
            if (atkEl) atkEl.textContent = unit.atk;
            if (defEl) defEl.textContent = unit.def;
            if (spdEl) spdEl.textContent = unit.spd;

            const hpBar = div.querySelector('.bar-fill.hp');
            if (hpBar) {
                hpBar.style.width = `${hpPct}%`;
                hpPct < 30 ? hpBar.classList.add('low') : hpBar.classList.remove('low');
            }
            const hpTextEl = div.querySelector('.hp-text');
            if (hpTextEl) hpTextEl.textContent = hpText;

            if (isHero) {
                const mpBar = div.querySelector('.bar-fill.mana');
                if (mpBar) mpBar.style.width = `${mpPct}%`;
                const mpTextEl = div.querySelector('.mp-text');
                if (mpTextEl) mpTextEl.textContent = `${Math.floor(unit.mana)}/${unit.maxMana}`;
            }
        }

        // Status badges
        const statusEl = div.querySelector(`#status-${unitId}`);
        if (statusEl && unit.statusEffects) {
            statusEl.innerHTML = unit.statusEffects.map(e =>
                `<span class="status-badge" title="${STATUS_EFFECTS[e.type]?.name} (${e.duration}t)">${STATUS_EFFECTS[e.type]?.emoji || '?'}</span>`
            ).join('');
        }

        // Dead state
        unit.isAlive ? div.classList.remove('dead') : div.classList.add('dead');

        // Focus indicator
        const focusEl = div.querySelector('.focus-indicator');
        if (focusEl) {
            const isFocused = battleState && battleState.focusedEnemyId === unitId;
            isFocused ? focusEl.classList.remove('hidden') : focusEl.classList.add('hidden');
        }
    });

    // Remove stale nodes
    existing.forEach((node, id) => { if (!active.has(id)) node.remove(); });
}

function renderTeaList(gameState) {
    const list = document.getElementById('battle-tea-list');
    if (!list) return;
    const teas = gameState.inventory.teas || {};

    if (Object.keys(teas).filter(k => teas[k] > 0).length === 0) {
        list.innerHTML = '<div class="col-span-2 text-[10px] text-slate-400 text-center py-2">No battle items</div>';
        return;
    }

    list.innerHTML = Object.entries(teas)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
            const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
            if (!data) return '';
            return `
                <button class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                        onclick="useTea('${id}', window.gameState)" title="${data.desc}">
                    <span class="text-lg">${data.emoji}</span>
                    <div class="overflow-hidden">
                        <div class="text-[9px] font-bold text-slate-700 truncate">${data.name}</div>
                        <div class="text-[9px] text-slate-400">×${qty}</div>
                    </div>
                </button>
            `;
        }).join('');
}

// ===========================
// WAVE RESOLUTION
// ===========================

function handleWaveVictory(gameState, battleState) {
    if (!battleState || battleState.waveComplete) return;
    battleState.waveComplete = true;
    battleState.isActive = false;

    if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }

    const bonuses = gameState.getSkillTreeBonuses();
    const goldMult  = 1 + (bonuses.goldBonus  || 0) / 100;
    const petalMult = 1 + (bonuses.petalBonus || 0) / 100;
    const orbMult   = 1 + (bonuses.orbBonus   || 0) / 100;

    const isBossWave = gameState.currentWave % 10 === 0;
    let baseGold = Math.floor((60 + gameState.currentWave * 12) * goldMult);
    if (isBossWave) baseGold = Math.floor(baseGold * 2.5);

    gameState.gold += baseGold;
    let loot = `+${formatNumber(baseGold)} 💰`;

    // Petal drops
    if (Math.random() < (isBossWave ? 0.8 : 0.25)) {
        const p = Math.floor((Math.random() * (isBossWave ? 15 : 5) + 1) * petalMult);
        gameState.petals += p;
        loot += ` +${p} 🌸`;
    }

    // Orb drops
    if (Math.random() < (isBossWave ? 0.6 : 0.08)) {
        const o = Math.floor((Math.random() * (isBossWave ? 3 : 1) + 1) * orbMult);
        gameState.spiritOrbs += o;
        loot += ` +${o} 🔮`;
    }

    // Seed drops
    if (Math.random() < 0.12) {
        const seeds = GARDEN_ITEMS_DATABASE.seeds;
        const seed = seeds[Math.floor(Math.random() * seeds.length)];
        gameState.addItem('seeds', seed.id, 1);
        loot += ` +1 ${seed.emoji}`;
    }

    // Material drops from bosses
    if (isBossWave) {
        const matKeys = Object.keys(FORGE_DATABASE.materials.reduce((acc, m) => { acc[m.id] = 1; return acc; }, {}));
        const mat = matKeys[Math.floor(Math.random() * Math.min(matKeys.length, 3))];
        const qty = Math.floor(Math.random() * 3) + 1;
        gameState.addItem('materials', mat, qty);
        loot += ` +${qty} ⛏️`;

        // Equipment drop from bosses
        const tier = Math.floor(gameState.currentWave / 10);
        const poolKey = tier >= 5 ? 'boss50plus' : `boss${Math.min(4, tier) * 10}`;
        const pool = EQUIPMENT_DROP_POOLS[poolKey] || EQUIPMENT_DROP_POOLS['boss10'];
        if (pool && Math.random() < 0.5) {
            const equipId = pool[Math.floor(Math.random() * pool.length)];
            gameState.addEquipmentItem(equipId);
            const eq = gameState.getEquipmentItem(equipId);
            loot += ` +${eq ? eq.name : equipId} 🗡️`;
            showToast(`Equipment Drop: ${eq ? eq.name : equipId}!`, 'special');
        }
    }

    gameState.enemiesDefeated += battleState.enemies.length;
    gameState.currentWave++;
    if (gameState.currentWave - 1 > gameState.highestWave) {
        gameState.highestWave = gameState.currentWave - 1;
    }
    gameState.updateQuest('clearWaves', 1);

    // Achievement check
    const newAch = gameState.checkAchievements();
    newAch.forEach(a => showToast(`🏆 Achievement: ${a.name}!`, 'special'));

    showToast(`Wave Cleared! ${loot}`, 'success');
    saveGame(gameState);
    updateUI(gameState);

    const btn = document.getElementById('next-wave-container');
    if (btn) btn.classList.remove('hidden');
}

function handleRunDefeat(gameState, _ignored) {
    if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }
    if (currentBattleState) {
        if (currentBattleState.waveComplete) return;
        currentBattleState.waveComplete = true;
        currentBattleState.isActive = false;
    }

    showToast(`Run Over! Reached Wave ${gameState.currentWave}`, 'error');
    gameState.isBattleActive = false;
    currentBattleState = null;

    gameState.checkAchievements();
    saveGame(gameState);
    renderBattleDashboard(gameState);
}

// ===========================
// TOGGLE AUTO
// ===========================

function toggleAutoCast() {
    if (!window.gameState) return;
    window.gameState.autoCast = !window.gameState.autoCast;
    const btn  = document.getElementById('auto-btn');
    const txt  = document.getElementById('auto-btn-text');
    if (btn && txt) {
        if (window.gameState.autoCast) {
            btn.classList.replace('btn-secondary', 'btn-primary');
            txt.textContent = 'Auto: ON';
        } else {
            btn.classList.replace('btn-primary', 'btn-secondary');
            txt.textContent = 'Auto: OFF';
        }
    }
}
