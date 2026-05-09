/* =========================================
   SAKURA CHRONICLES - DATABASE v2.0
   Expanded Content: Heroes, Enemies, Equipment, Achievements
   ========================================= */

// ===========================
// HERO DATABASE (45 Heroes)
// ===========================

const HEROES_DATABASE = [
    // ===== NORMAL (N) - 8 Heroes =====
    { id: 'h001', name: 'Yuki', rarity: 'N', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 480, atk: 38, def: 28, spd: 105 },
      ultimate: { name: 'Healing Rain', manaReq: 80, desc: 'Restores 30% HP to all allies.' }
    },
    { id: 'h002', name: 'Sora', rarity: 'N', element: 'Wind', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 420, atk: 58, def: 22, spd: 118 },
      ultimate: { name: 'Swift Strike', manaReq: 80, desc: 'Deals 3x ATK damage to one target.' }
    },
    { id: 'h003', name: 'Haru', rarity: 'N', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 680, atk: 42, def: 58, spd: 92 },
      ultimate: { name: 'Iron Wall', manaReq: 80, desc: 'Grants a shield equal to 25% max HP.' }
    },
    { id: 'h004', name: 'Mio', rarity: 'N', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 440, atk: 42, def: 28, spd: 112 },
      ultimate: { name: 'Blessing', manaReq: 80, desc: 'Boosts all allies ATK by 25% for 3 turns.' }
    },
    { id: 'h005', name: 'Kenji', rarity: 'N', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 430, atk: 60, def: 24, spd: 110 },
      ultimate: { name: 'Shadow Slash', manaReq: 80, desc: 'High crit-rate strike dealing 3.2x ATK.' }
    },
    { id: 'h006', name: 'Nami', rarity: 'N', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 410, atk: 52, def: 20, spd: 108 },
      ultimate: { name: 'Wave Crash', manaReq: 80, desc: 'Deals 1.5x ATK Water damage to all enemies.' }
    },
    { id: 'h007', name: 'Ryu', rarity: 'N', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 660, atk: 40, def: 55, spd: 88 },
      ultimate: { name: 'Flame Guard', manaReq: 80, desc: 'Reduces incoming damage by 40% for 2 turns.' }
    },
    { id: 'h008', name: 'Mei', rarity: 'N', element: 'Wind', class: 'Healer', gender: 'F',
      baseStats: { hp: 460, atk: 35, def: 26, spd: 102 },
      ultimate: { name: 'Gentle Breeze', manaReq: 80, desc: 'Heals the most injured ally for 50% max HP.' }
    },

    // ===== RARE (R) - 10 Heroes =====
    { id: 'h011', name: 'Hikari', rarity: 'R', element: 'Light', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 520, atk: 78, def: 36, spd: 114 },
      ultimate: { name: 'Holy Beam', manaReq: 100, desc: 'Deals massive Light damage. Burns a random enemy.' }
    },
    { id: 'h012', name: 'Akira', rarity: 'R', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 500, atk: 72, def: 32, spd: 110 },
      ultimate: { name: 'Inferno Burst', manaReq: 100, desc: 'Deals 1.8x ATK Fire damage to all enemies.' }
    },
    { id: 'h013', name: 'Mizuki', rarity: 'R', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 570, atk: 48, def: 42, spd: 107 },
      ultimate: { name: 'Ocean Embrace', manaReq: 100, desc: 'Heals all allies for 40% max HP. Removes 1 debuff.' }
    },
    { id: 'h014', name: 'Ren', rarity: 'R', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 510, atk: 82, def: 36, spd: 122 },
      ultimate: { name: 'Tempest Blade', manaReq: 100, desc: 'Attacks twice, each hit dealing 1.8x ATK.' }
    },
    { id: 'h016', name: 'Kaito', rarity: 'R', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 830, atk: 52, def: 68, spd: 90 },
      ultimate: { name: 'Magma Shield', manaReq: 100, desc: 'Taunts all enemies. Gains a large shield.' }
    },
    { id: 'h017', name: 'Yuna', rarity: 'R', element: 'Dark', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 490, atk: 80, def: 30, spd: 120 },
      ultimate: { name: 'Phantom Step', manaReq: 100, desc: 'Strikes twice with 50% bonus crit chance each hit.' }
    },
    { id: 'h018', name: 'Shou', rarity: 'R', element: 'Light', class: 'Buffer', gender: 'M',
      baseStats: { hp: 540, atk: 55, def: 38, spd: 105 },
      ultimate: { name: 'War Cry', manaReq: 100, desc: 'Boosts all ally ATK and SPD by 20% for 3 turns.' }
    },
    { id: 'h019', name: 'Asahi', rarity: 'R', element: 'Water', class: 'Tank', gender: 'M',
      baseStats: { hp: 820, atk: 48, def: 70, spd: 85 },
      ultimate: { name: 'Tidal Barrier', manaReq: 100, desc: 'Reduces all ally damage taken by 30% for 2 turns.' }
    },
    { id: 'h020', name: 'Kasumi', rarity: 'R', element: 'Wind', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 480, atk: 70, def: 28, spd: 116 },
      ultimate: { name: 'Gale Slash', manaReq: 100, desc: 'Deals 1.6x ATK Wind damage to all enemies.' }
    },
    { id: 'h015', name: 'Tora', rarity: 'R', element: 'Fire', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 500, atk: 76, def: 34, spd: 115 },
      ultimate: { name: 'Tiger Claw', manaReq: 100, desc: 'Three rapid strikes dealing 1.2x ATK each.' }
    },
    { id: 'h010', name: 'Hana', rarity: 'R', element: 'Light', class: 'Healer', gender: 'F',
      baseStats: { hp: 560, atk: 46, def: 40, spd: 108 },
      ultimate: { name: 'Blossom Mend', manaReq: 100, desc: 'Heals all allies and applies Regen (3 turns).' }
    },

    // ===== SUPER RARE (SR) - 10 Heroes =====
    { id: 'h021', name: 'Ayame', rarity: 'SR', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 670, atk: 108, def: 48, spd: 116 },
      ultimate: { name: 'Phoenix Dance', manaReq: 100, desc: 'Massive Fire AoE + Burns all enemies for 3 turns.' }
    },
    { id: 'h023', name: 'Ryota', rarity: 'SR', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 625, atk: 118, def: 44, spd: 128 },
      ultimate: { name: 'Cyclone Fury', manaReq: 100, desc: 'Wind damage ignoring 50% of target DEF.' }
    },
    { id: 'h024', name: 'Hinata', rarity: 'SR', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 640, atk: 72, def: 52, spd: 112 },
      ultimate: { name: 'Divine Aura', manaReq: 100, desc: 'Greatly boosts ATK and DEF of all allies for 3 turns.' }
    },
    { id: 'h025', name: 'Kuro', rarity: 'SR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 630, atk: 115, def: 46, spd: 120 },
      ultimate: { name: 'Void Reaper', manaReq: 100, desc: 'Executes enemies below 30% HP; otherwise deals 4x ATK.' }
    },
    { id: 'h026', name: 'Natsuki', rarity: 'SR', element: 'Fire', class: 'Tank', gender: 'F',
      baseStats: { hp: 980, atk: 68, def: 88, spd: 96 },
      ultimate: { name: 'Molten Core', manaReq: 100, desc: 'Becomes invincible for 1 turn. Gains massive shield.' }
    },
    { id: 'h027', name: 'Suiren', rarity: 'SR', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 720, atk: 60, def: 58, spd: 110 },
      ultimate: { name: 'Lotus Bloom', manaReq: 100, desc: 'Fully heals one ally. Grants them a 20% HP shield.' }
    },
    { id: 'h028', name: 'Zenko', rarity: 'SR', element: 'Dark', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 650, atk: 112, def: 42, spd: 118 },
      ultimate: { name: 'Dark Requiem', manaReq: 100, desc: 'Deals 2x ATK Dark damage to all. Poisons all enemies.' }
    },
    { id: 'h029', name: 'Akeno', rarity: 'SR', element: 'Wind', class: 'Buffer', gender: 'F',
      baseStats: { hp: 660, atk: 78, def: 55, spd: 115 },
      ultimate: { name: 'Storm Blessing', manaReq: 100, desc: 'Grants all allies +30% SPD and evasion for 2 turns.' }
    },
    { id: 'h030', name: 'Takeshi', rarity: 'SR', element: 'Light', class: 'Tank', gender: 'M',
      baseStats: { hp: 1000, atk: 72, def: 90, spd: 94 },
      ultimate: { name: 'Sacred Rampart', manaReq: 100, desc: 'Taunts + shields the whole team for 1 turn.' }
    },
    { id: 'h022', name: 'Fubuki', rarity: 'SR', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 640, atk: 106, def: 45, spd: 114 },
      ultimate: { name: 'Blizzard Storm', manaReq: 100, desc: 'Deals Water AoE damage + Freezes all enemies for 1 turn.' }
    },

    // ===== SSR - 10 Heroes =====
    { id: 'h031', name: 'Miyuki', rarity: 'SSR', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 830, atk: 150, def: 62, spd: 122 },
      ultimate: { name: 'Frozen Eternity', manaReq: 100, desc: 'Freezes all enemies for 2 turns. Deals 2x ATK Water dmg.' }
    },
    { id: 'h032', name: 'Takumi', rarity: 'SSR', element: 'Fire', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 800, atk: 160, def: 58, spd: 124 },
      ultimate: { name: 'Dragon Wrath', manaReq: 100, desc: 'Extreme Fire damage (5x ATK). Burns target for 3 turns.' }
    },
    { id: 'h033', name: 'Kohana', rarity: 'SSR', element: 'Wind', class: 'Healer', gender: 'F',
      baseStats: { hp: 880, atk: 84, def: 72, spd: 118 },
      ultimate: { name: "Nature's Breath", manaReq: 100, desc: 'Fully heals all allies. Grants 3-turn Regen.' }
    },
    { id: 'h037', name: 'Isami', rarity: 'SSR', element: 'Water', class: 'Tank', gender: 'F',
      baseStats: { hp: 1260, atk: 88, def: 110, spd: 100 },
      ultimate: { name: 'Tidal Fortress', manaReq: 100, desc: 'Absorbs all ally damage for 2 turns. Reflects 20%.' }
    },
    { id: 'h038', name: 'Raiden', rarity: 'SSR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 790, atk: 165, def: 55, spd: 130 },
      ultimate: { name: 'Thunder God', manaReq: 100, desc: 'Strikes for 5x ATK. Stuns target for 1 turn.' }
    },
    { id: 'h039', name: 'Shiori', rarity: 'SSR', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 850, atk: 95, def: 75, spd: 115 },
      ultimate: { name: 'Celestial Vow', manaReq: 100, desc: 'Boosts ALL stats of all allies by 30% for 3 turns.' }
    },
    { id: 'h040', name: 'Kaguya', rarity: 'SSR', element: 'Dark', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 780, atk: 165, def: 54, spd: 132 },
      ultimate: { name: 'Soul Shatter', manaReq: 100, desc: 'Damage scales with enemy missing HP (up to 8x ATK).' }
    },
    { id: 'h034', name: 'Ryusei', rarity: 'SSR', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 810, atk: 158, def: 56, spd: 128 },
      ultimate: { name: 'Meteor Rain', manaReq: 100, desc: '3 hits targeting random enemies, each 2x ATK.' }
    },
    { id: 'h035', name: 'Tsubame', rarity: 'SSR', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 820, atk: 148, def: 60, spd: 120 },
      ultimate: { name: 'Crimson Swallow', manaReq: 100, desc: 'AoE Fire dmg (2.5x ATK) + Burns all for 2 turns.' }
    },
    { id: 'h036', name: 'Izumi', rarity: 'SSR', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 900, atk: 80, def: 78, spd: 112 },
      ultimate: { name: 'Sacred Spring', manaReq: 100, desc: 'Revives one fallen ally at 50% HP. Heals all others.' }
    },

    // ===== ULTRA RARE (UR) - 5 Heroes =====
    { id: 'h041', name: 'Amaterasu', rarity: 'UR', element: 'Light', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 1050, atk: 210, def: 90, spd: 138 },
      ultimate: { name: 'Solar Flare', manaReq: 100, desc: 'Apocalyptic Light AoE. Burns + blinds all foes for 2 turns.' }
    },
    { id: 'h042', name: 'Tsukuyomi', rarity: 'UR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 980, atk: 225, def: 78, spd: 145 },
      ultimate: { name: 'Lunar Eclipse', manaReq: 100, desc: 'Stops time: all enemies skip next turn. Deals 6x ATK.' }
    },
    { id: 'h043', name: 'Susanoo', rarity: 'UR', element: 'Wind', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 1010, atk: 215, def: 84, spd: 142 },
      ultimate: { name: 'Storm God', manaReq: 100, desc: 'Guaranteed crit AoE. Poisons all enemies for 3 turns.' }
    },
    { id: 'h044', name: 'Benzaiten', rarity: 'UR', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 1100, atk: 105, def: 95, spd: 130 },
      ultimate: { name: 'Divine Tide', manaReq: 100, desc: 'Fully heals all allies. Grants immunity for 1 turn.' }
    },
    { id: 'h045', name: 'Raijin', rarity: 'UR', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 1500, atk: 130, def: 150, spd: 110 },
      ultimate: { name: 'Thunder Fortress', manaReq: 100, desc: 'Becomes invincible. Reflects all damage. Boosts allies.' }
    }
];

// ===========================
// ENEMY DATABASE (27 Enemies)
// ===========================

const ENEMIES_DATABASE = [
    // Tier 1 (Waves 1-10) — Weak, tutorial-friendly
    { id: 'e001', name: 'Slime', element: 'Water', baseStats: { hp: 150, atk: 20, def: 10, spd: 88 }, reward: { gold: 15 } },
    { id: 'e002', name: 'Fire Imp', element: 'Fire', baseStats: { hp: 180, atk: 26, def: 12, spd: 96 }, reward: { gold: 18 } },
    { id: 'e003', name: 'Wind Wisp', element: 'Wind', baseStats: { hp: 145, atk: 24, def: 8, spd: 112 }, reward: { gold: 16 } },
    { id: 'e004', name: 'Shadow Bat', element: 'Dark', baseStats: { hp: 165, atk: 30, def: 10, spd: 118 }, reward: { gold: 20 } },
    { id: 'e005', name: 'Forest Sprite', element: 'Wind', baseStats: { hp: 155, atk: 22, def: 14, spd: 100 }, reward: { gold: 17 } },
    { id: 'e028', name: 'Kitsune Pup', element: 'Light', baseStats: { hp: 170, atk: 25, def: 11, spd: 105 }, reward: { gold: 19 } },

    // Tier 2 (Waves 11-25) — Medium difficulty
    { id: 'e006', name: 'Oni Warrior', element: 'Fire', baseStats: { hp: 420, atk: 58, def: 32, spd: 102 }, reward: { gold: 45 } },
    { id: 'e007', name: 'Ice Golem', element: 'Water', baseStats: { hp: 640, atk: 42, def: 55, spd: 78 }, reward: { gold: 50 } },
    { id: 'e009', name: 'Void Wraith', element: 'Dark', baseStats: { hp: 370, atk: 68, def: 26, spd: 124 }, reward: { gold: 48 } },
    { id: 'e021', name: 'Thunder Wolf', element: 'Wind', baseStats: { hp: 400, atk: 62, def: 28, spd: 130 }, reward: { gold: 52 } },
    { id: 'e022', name: 'Sea Serpent', element: 'Water', baseStats: { hp: 580, atk: 50, def: 45, spd: 90 }, reward: { gold: 46 } },
    { id: 'e023', name: 'Cursed Oni', element: 'Dark', baseStats: { hp: 450, atk: 70, def: 30, spd: 108 }, reward: { gold: 55 } },

    // Tier 3 (Waves 26-40) — Hard
    { id: 'e011', name: 'Demon Samurai', element: 'Dark', baseStats: { hp: 840, atk: 115, def: 62, spd: 128 }, reward: { gold: 90 } },
    { id: 'e012', name: 'Flame Dragon', element: 'Fire', baseStats: { hp: 1260, atk: 135, def: 84, spd: 112 }, reward: { gold: 110 } },
    { id: 'e024', name: 'Storm Shogun', element: 'Wind', baseStats: { hp: 900, atk: 125, def: 70, spd: 135 }, reward: { gold: 105 } },
    { id: 'e025', name: 'Frost Lich', element: 'Water', baseStats: { hp: 780, atk: 130, def: 75, spd: 118 }, reward: { gold: 95 } },
    { id: 'e026', name: 'Dark Paladin', element: 'Dark', baseStats: { hp: 1100, atk: 110, def: 90, spd: 100 }, reward: { gold: 115 } },
    { id: 'e027', name: 'Solar Ifrit', element: 'Light', baseStats: { hp: 950, atk: 140, def: 68, spd: 120 }, reward: { gold: 120 } },

    // Tier 4 (Waves 41+) — Elite
    { id: 'e030', name: 'Void Emperor', element: 'Dark', baseStats: { hp: 1600, atk: 180, def: 110, spd: 140 }, reward: { gold: 180 } },
    { id: 'e031', name: 'Ancient Dragon', element: 'Fire', baseStats: { hp: 2000, atk: 170, def: 130, spd: 120 }, reward: { gold: 200 } },
    { id: 'e032', name: 'Celestial Serpent', element: 'Light', baseStats: { hp: 1800, atk: 175, def: 120, spd: 132 }, reward: { gold: 190 } },
    { id: 'e033', name: 'Abyssal Horror', element: 'Dark', baseStats: { hp: 1700, atk: 185, def: 105, spd: 145 }, reward: { gold: 185 } },

    // Bosses (every 10 waves)
    { id: 'e016', name: 'Infernal Overlord', element: 'Fire', baseStats: { hp: 2800, atk: 190, def: 105, spd: 132 }, reward: { gold: 350 }, isBoss: true },
    { id: 'e017', name: 'Leviathan', element: 'Water', baseStats: { hp: 3400, atk: 168, def: 128, spd: 118 }, reward: { gold: 400 }, isBoss: true },
    { id: 'e018', name: 'Nightmare Shogun', element: 'Dark', baseStats: { hp: 3000, atk: 200, def: 118, spd: 140 }, reward: { gold: 450 }, isBoss: true },
    { id: 'e019', name: 'Celestial Dragon', element: 'Light', baseStats: { hp: 4000, atk: 185, def: 140, spd: 128 }, reward: { gold: 500 }, isBoss: true },
    { id: 'e020', name: 'Chaos Sovereign', element: 'Dark', baseStats: { hp: 5000, atk: 220, def: 160, spd: 150 }, reward: { gold: 700 }, isBoss: true }
];

// ===========================
// EQUIPMENT DATABASE
// ===========================

const EQUIPMENT_DATABASE = {
    weapons: [
        { id: 'w001', name: 'Iron Sword', rarity: 'N', slot: 'weapon', desc: 'A sturdy iron sword.',
          stats: { atk: 15 }, emoji: '⚔️' },
        { id: 'w002', name: 'Flame Blade', rarity: 'R', slot: 'weapon', desc: 'A blade wreathed in fire.',
          stats: { atk: 35, crit: 5 }, emoji: '🔥' },
        { id: 'w003', name: 'Mithril Spear', rarity: 'SR', slot: 'weapon', desc: 'Incredibly sharp mithril lance.',
          stats: { atk: 65, spd: 8 }, emoji: '🏹' },
        { id: 'w004', name: 'Dragon Fang', rarity: 'SSR', slot: 'weapon', desc: 'Made from a true dragon tooth.',
          stats: { atk: 110, crit: 10 }, emoji: '🐉' },
        { id: 'w005', name: 'Void Blade', rarity: 'UR', slot: 'weapon', desc: 'A blade from the void itself.',
          stats: { atk: 180, crit: 15, spd: 10 }, emoji: '✨' }
    ],
    armors: [
        { id: 'a001', name: 'Cloth Tunic', rarity: 'N', slot: 'armor', desc: 'Basic cloth protection.',
          stats: { def: 12, hp: 100 }, emoji: '👕' },
        { id: 'a002', name: 'Chain Mail', rarity: 'R', slot: 'armor', desc: 'Interlocked metal rings.',
          stats: { def: 28, hp: 200 }, emoji: '🛡️' },
        { id: 'a003', name: 'Dragon Scale', rarity: 'SR', slot: 'armor', desc: 'Scales of an ancient dragon.',
          stats: { def: 55, hp: 400 }, emoji: '🐲' },
        { id: 'a004', name: 'Sacred Plate', rarity: 'SSR', slot: 'armor', desc: 'Blessed by the gods.',
          stats: { def: 90, hp: 700 }, emoji: '⚜️' },
        { id: 'a005', name: 'Celestial Robe', rarity: 'UR', slot: 'armor', desc: 'Woven from starlight.',
          stats: { def: 140, hp: 1200 }, emoji: '🌟' }
    ],
    accessories: [
        { id: 'c001', name: 'Lucky Charm', rarity: 'N', slot: 'accessory', desc: 'A small luck charm.',
          stats: { spd: 5, crit: 3 }, emoji: '🍀' },
        { id: 'c002', name: 'Spirit Ring', rarity: 'R', slot: 'accessory', desc: 'Enhances spiritual power.',
          stats: { spd: 12, hp: 150 }, emoji: '💍' },
        { id: 'c003', name: 'Sakura Pendant', rarity: 'SR', slot: 'accessory', desc: 'A mystical sakura pendant.',
          stats: { atk: 30, spd: 15, crit: 8 }, emoji: '🌸' },
        { id: 'c004', name: 'Dragon Eye', rarity: 'SSR', slot: 'accessory', desc: 'The eye of a slain dragon.',
          stats: { atk: 55, crit: 12, spd: 20 }, emoji: '👁️' },
        { id: 'c005', name: 'Divine Orb', rarity: 'UR', slot: 'accessory', desc: 'Contains divine energy.',
          stats: { atk: 80, def: 50, hp: 500, crit: 15 }, emoji: '🔮' }
    ]
};

// Equipment drop pools by wave tier
const EQUIPMENT_DROP_POOLS = {
    boss10: ['w001', 'a001', 'c001', 'w002', 'a002'],
    boss20: ['w002', 'a002', 'c002', 'w003', 'a003'],
    boss30: ['w003', 'a003', 'c003', 'w004', 'a004'],
    boss40: ['w004', 'a004', 'c004', 'w005', 'a005'],
    boss50plus: ['w005', 'a005', 'c005']
};

// ===========================
// GARDEN / ITEMS DATABASE
// ===========================

const GARDEN_ITEMS_DATABASE = {
    seeds: [
        { id: 's001', name: 'Sakura Seed', emoji: '🌸', growthTime: 30000, resultId: 't001', desc: 'Fast growing healing herb.' },
        { id: 's002', name: 'Matcha Seed', emoji: '🍵', growthTime: 90000, resultId: 't002', desc: 'Takes time, yields power.' },
        { id: 's003', name: 'Dragon Seed', emoji: '🐲', growthTime: 180000, resultId: 't003', desc: 'Rare seed with potent magic.' },
        { id: 's004', name: 'Moon Seed', emoji: '🌙', growthTime: 60000, resultId: 't004', desc: 'Grows in moonlight.' }
    ],
    teas: [
        { id: 't001', name: 'Sakura Tea', emoji: '🌸', desc: 'Heal 30% HP to all allies.', effectType: 'heal', effectValue: 0.3 },
        { id: 't002', name: 'Matcha Brew', emoji: '🍵', desc: '+25% ATK to all allies (3 turns).', effectType: 'buff_atk', effectValue: 0.25 },
        { id: 't003', name: 'Dragon Elixir', emoji: '🧪', desc: 'Execute enemies below 35% HP instantly.', effectType: 'execute', effectValue: 0.35 },
        { id: 't004', name: 'Moon Essence', emoji: '🌙', desc: '+30% DEF and regenerate HP for 3 turns.', effectType: 'buff_def', effectValue: 0.3 }
    ]
};

// ===========================
// FORGE DATABASE
// ===========================

const FORGE_DATABASE = {
    materials: [
        { id: 'm001', name: 'Iron Ore', rarity: 'N', desc: 'Common crafting metal.', emoji: '⛏️' },
        { id: 'm002', name: 'Spirit Dust', rarity: 'R', desc: 'Glowing magical powder.', emoji: '✨' },
        { id: 'm003', name: 'Mithril', rarity: 'SR', desc: 'Incredibly light and strong.', emoji: '💎' },
        { id: 'm004', name: 'Star Fragment', rarity: 'SSR', desc: 'Fallen from the cosmos.', emoji: '🌟' },
        { id: 'm005', name: 'Dragon Scale', rarity: 'SR', desc: 'Scale from a dragon hide.', emoji: '🐉' }
    ],
    recipes: [
        { id: 'r001', resultId: 'w002', resultSlot: 'weapons', name: 'Flame Blade', cost: 800,
          materials: { 'm001': 8, 'm002': 3 }, desc: 'A blade wreathed in fire.' },
        { id: 'r002', resultId: 'a002', resultSlot: 'armors', name: 'Chain Mail', cost: 600,
          materials: { 'm001': 12 }, desc: 'Interlocked metal protection.' },
        { id: 'r003', resultId: 'c002', resultSlot: 'accessories', name: 'Spirit Ring', cost: 1000,
          materials: { 'm002': 5 }, desc: 'Enhances spiritual power.' },
        { id: 'r004', resultId: 'w003', resultSlot: 'weapons', name: 'Mithril Spear', cost: 3000,
          materials: { 'm001': 30, 'm003': 5 }, desc: 'Incredibly sharp mithril lance.' },
        { id: 'r005', resultId: 'a003', resultSlot: 'armors', name: 'Dragon Scale Armor', cost: 5000,
          materials: { 'm001': 50, 'm005': 5 }, desc: 'Scales of an ancient dragon.' },
        { id: 'r006', resultId: 'c003', resultSlot: 'accessories', name: 'Sakura Pendant', cost: 4000,
          materials: { 'm002': 20, 'm003': 3 }, desc: 'A mystical sakura pendant.' }
    ]
};

// ===========================
// ACHIEVEMENT DATABASE
// ===========================

const ACHIEVEMENTS_DATABASE = [
    { id: 'ach_first_blood', name: 'First Blood', desc: 'Win your first battle.', icon: '⚔️',
      type: 'totalBattles', target: 1, reward: { gold: 500, petals: 10 } },
    { id: 'ach_wave10', name: 'Wave Rider', desc: 'Reach Wave 10.', icon: '🌊',
      type: 'highestWave', target: 10, reward: { gold: 1000, petals: 20 } },
    { id: 'ach_wave25', name: 'Dungeon Delver', desc: 'Reach Wave 25.', icon: '🏰',
      type: 'highestWave', target: 25, reward: { gold: 2000, petals: 50, spiritOrbs: 5 } },
    { id: 'ach_wave50', name: 'Endless Warrior', desc: 'Reach Wave 50.', icon: '🔱',
      type: 'highestWave', target: 50, reward: { gold: 5000, petals: 100, spiritOrbs: 15 } },
    { id: 'ach_collector5', name: 'Collector', desc: 'Collect 5 different heroes.', icon: '📚',
      type: 'rosterSize', target: 5, reward: { petals: 30, gold: 500 } },
    { id: 'ach_collector15', name: 'Connoisseur', desc: 'Collect 15 different heroes.', icon: '📖',
      type: 'rosterSize', target: 15, reward: { petals: 100, gold: 2000, spiritOrbs: 10 } },
    { id: 'ach_ssr', name: 'Lucky Star', desc: 'Obtain your first SSR hero.', icon: '⭐',
      type: 'ownSSR', target: 1, reward: { petals: 50, gold: 1000 } },
    { id: 'ach_ur', name: 'Chosen One', desc: 'Obtain your first UR hero.', icon: '💫',
      type: 'ownUR', target: 1, reward: { petals: 200, gold: 5000, spiritOrbs: 20 } },
    { id: 'ach_kills100', name: 'Monster Slayer', desc: 'Defeat 100 enemies.', icon: '💀',
      type: 'totalKills', target: 100, reward: { gold: 1500, petals: 30 } },
    { id: 'ach_kills1000', name: 'Annihilator', desc: 'Defeat 1000 enemies.', icon: '☠️',
      type: 'totalKills', target: 1000, reward: { gold: 10000, petals: 200, spiritOrbs: 25 } },
    { id: 'ach_pulls10', name: 'Gacha Addict', desc: 'Perform 10 summons.', icon: '🎲',
      type: 'totalPulls', target: 10, reward: { petals: 20, gold: 500 } },
    { id: 'ach_pulls100', name: 'High Roller', desc: 'Perform 100 summons.', icon: '🎰',
      type: 'totalPulls', target: 100, reward: { petals: 100, spiritOrbs: 10 } }
];

// ===========================
// ELEMENT SYSTEM
// ===========================

const ELEMENT_ADVANTAGE = {
    'Fire':  { strong: 'Wind',  weak: 'Water' },
    'Water': { strong: 'Fire',  weak: 'Wind'  },
    'Wind':  { strong: 'Water', weak: 'Fire'  },
    'Light': { strong: 'Dark',  weak: 'Dark'  },
    'Dark':  { strong: 'Light', weak: 'Light' }
};

const ELEMENT_COLORS = {
    'Fire':  { from: 'from-red-400',    to: 'to-orange-500', text: 'text-red-500',    bg: 'bg-red-50',    emoji: '🔥' },
    'Water': { from: 'from-blue-400',   to: 'to-cyan-500',   text: 'text-blue-500',   bg: 'bg-blue-50',   emoji: '💧' },
    'Wind':  { from: 'from-emerald-400',to: 'to-teal-500',   text: 'text-teal-500',   bg: 'bg-teal-50',   emoji: '🌪️' },
    'Light': { from: 'from-yellow-300', to: 'to-amber-500',  text: 'text-amber-500',  bg: 'bg-amber-50',  emoji: '✨' },
    'Dark':  { from: 'from-purple-500', to: 'to-indigo-600', text: 'text-purple-500', bg: 'bg-purple-50', emoji: '🌑' }
};

// ===========================
// GACHA RATES
// ===========================

const GACHA_RATES = {
    'UR':  0.5,
    'SSR': 4.5,
    'SR':  10.0,
    'R':   25.0,
    'N':   60.0
};

// Soft pity starts at this pull count and increases SSR chance
const SOFT_PITY_START = 40;
const HARD_PITY = 50;
