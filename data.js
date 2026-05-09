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
    // ─────────────────────────────────────────────
    // TIER 1 — Waves 1-10 · Tutorial-friendly
    // ─────────────────────────────────────────────
    { id: 'e001', name: 'Blue Slime',      emoji: '🔵', element: 'Water', behavior: 'defensive',
      baseStats: { hp: 150, atk: 20, def: 10, spd: 88 },  reward: { gold: 15 } },
    { id: 'e002', name: 'Fire Imp',        emoji: '👺', element: 'Fire',  behavior: 'aggressive',
      baseStats: { hp: 180, atk: 26, def: 12, spd: 96 },  reward: { gold: 18 } },
    { id: 'e003', name: 'Wind Wisp',       emoji: '💨', element: 'Wind',  behavior: 'evasive',
      baseStats: { hp: 145, atk: 24, def: 8,  spd: 112 }, reward: { gold: 16 } },
    { id: 'e004', name: 'Shadow Bat',      emoji: '🦇', element: 'Dark',  behavior: 'aggressive',
      baseStats: { hp: 165, atk: 30, def: 10, spd: 118 }, reward: { gold: 20 } },
    { id: 'e005', name: 'Forest Sprite',   emoji: '🌿', element: 'Wind',  behavior: 'support',
      baseStats: { hp: 155, atk: 22, def: 14, spd: 100 }, reward: { gold: 17 }, special: ['healer'] },
    { id: 'e028', name: 'Kitsune Pup',     emoji: '🦊', element: 'Light', behavior: 'evasive',
      baseStats: { hp: 170, atk: 25, def: 11, spd: 105 }, reward: { gold: 19 } },

    // New Tier 1 additions
    { id: 'e050', name: 'Poison Slime',    emoji: '🟢', element: 'Wind',  behavior: 'technical',
      baseStats: { hp: 130, atk: 18, def: 8,  spd: 80 },  reward: { gold: 16 }, special: ['poisoner'] },
    { id: 'e051', name: 'Sand Scorpion',   emoji: '🦂', element: 'Fire',  behavior: 'technical',
      baseStats: { hp: 160, atk: 28, def: 14, spd: 92 },  reward: { gold: 18 }, special: ['poisoner'] },
    { id: 'e052', name: 'Ice Fairy',       emoji: '❄️', element: 'Water', behavior: 'technical',
      baseStats: { hp: 140, atk: 22, def: 9,  spd: 108 }, reward: { gold: 17 }, special: ['stunner'] },
    { id: 'e053', name: 'Kodama',          emoji: '🌳', element: 'Wind',  behavior: 'support',
      baseStats: { hp: 190, atk: 15, def: 18, spd: 75 },  reward: { gold: 15 }, special: ['healer'] },
    { id: 'e054', name: 'Ghost Lantern',   emoji: '🏮', element: 'Dark',  behavior: 'evasive',
      baseStats: { hp: 145, atk: 32, def: 6,  spd: 122 }, reward: { gold: 21 } },
    { id: 'e055', name: 'Tiny Oni',        emoji: '👹', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 200, atk: 24, def: 16, spd: 85 },  reward: { gold: 18 } },

    // ─────────────────────────────────────────────
    // TIER 2 — Waves 11-25 · Medium difficulty
    // ─────────────────────────────────────────────
    { id: 'e006', name: 'Oni Warrior',     emoji: '👹', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 420, atk: 58, def: 32, spd: 102 }, reward: { gold: 45 } },
    { id: 'e007', name: 'Ice Golem',       emoji: '🧊', element: 'Water', behavior: 'defensive',
      baseStats: { hp: 640, atk: 42, def: 55, spd: 78 },  reward: { gold: 50 }, special: ['shielder'] },
    { id: 'e009', name: 'Void Wraith',     emoji: '👻', element: 'Dark',  behavior: 'aggressive',
      baseStats: { hp: 370, atk: 68, def: 26, spd: 124 }, reward: { gold: 48 }, special: ['stunner'] },
    { id: 'e021', name: 'Thunder Wolf',    emoji: '🐺', element: 'Wind',  behavior: 'aggressive',
      baseStats: { hp: 400, atk: 62, def: 28, spd: 130 }, reward: { gold: 52 } },
    { id: 'e022', name: 'Sea Serpent',     emoji: '🐍', element: 'Water', behavior: 'technical',
      baseStats: { hp: 580, atk: 50, def: 45, spd: 90 },  reward: { gold: 46 }, special: ['poisoner'] },
    { id: 'e023', name: 'Cursed Oni',      emoji: '👺', element: 'Dark',  behavior: 'technical',
      baseStats: { hp: 450, atk: 70, def: 30, spd: 108 }, reward: { gold: 55 }, special: ['poisoner'] },

    // New Tier 2 additions
    { id: 'e056', name: 'Shadow Ninja',    emoji: '🥷', element: 'Dark',  behavior: 'evasive',
      baseStats: { hp: 340, atk: 78, def: 20, spd: 148 }, reward: { gold: 58 }, special: ['stunner'] },
    { id: 'e057', name: 'Demon Kunoichi',  emoji: '💃', element: 'Fire',  behavior: 'evasive',
      baseStats: { hp: 360, atk: 72, def: 22, spd: 142 }, reward: { gold: 55 }, special: ['poisoner'] },
    { id: 'e058', name: 'Iron Golem Mk2', emoji: '🤖', element: 'Light', behavior: 'defensive',
      baseStats: { hp: 720, atk: 45, def: 68, spd: 65 },  reward: { gold: 60 }, special: ['shielder'] },
    { id: 'e059', name: 'Yuki-onna',       emoji: '❄️', element: 'Water', behavior: 'technical',
      baseStats: { hp: 410, atk: 65, def: 35, spd: 115 }, reward: { gold: 52 }, special: ['stunner'] },
    { id: 'e060', name: 'Tengu Warrior',   emoji: '🪶', element: 'Wind',  behavior: 'aggressive',
      baseStats: { hp: 390, atk: 70, def: 28, spd: 138 }, reward: { gold: 54 } },
    { id: 'e061', name: 'Kappa Elder',     emoji: '🐢', element: 'Water', behavior: 'support',
      baseStats: { hp: 550, atk: 48, def: 50, spd: 82 },  reward: { gold: 50 }, special: ['healer'] },
    { id: 'e062', name: 'Metal Slime',     emoji: '⚪', element: 'Light', behavior: 'evasive',
      baseStats: { hp: 180, atk: 30, def: 80, spd: 155 }, reward: { gold: 120 } }, // rare, high def, flees fast
    { id: 'e063', name: 'Ronin',           emoji: '⚔️', element: 'Wind',  behavior: 'berserker',
      baseStats: { hp: 430, atk: 75, def: 25, spd: 120 }, reward: { gold: 58 } },

    // ─────────────────────────────────────────────
    // TIER 3 — Waves 26-40 · Hard
    // ─────────────────────────────────────────────
    { id: 'e011', name: 'Demon Samurai',   emoji: '⛩️', element: 'Dark',  behavior: 'aggressive',
      baseStats: { hp: 840, atk: 115, def: 62, spd: 128 }, reward: { gold: 90 } },
    { id: 'e012', name: 'Flame Dragon',    emoji: '🐉', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 1260, atk: 135, def: 84, spd: 112 }, reward: { gold: 110 } },
    { id: 'e024', name: 'Storm Shogun',    emoji: '🌪️', element: 'Wind',  behavior: 'aggressive',
      baseStats: { hp: 900, atk: 125, def: 70, spd: 135 }, reward: { gold: 105 } },
    { id: 'e025', name: 'Frost Lich',      emoji: '💀', element: 'Water', behavior: 'technical',
      baseStats: { hp: 780, atk: 130, def: 75, spd: 118 }, reward: { gold: 95 }, special: ['stunner', 'poisoner'] },
    { id: 'e026', name: 'Dark Paladin',    emoji: '🛡️', element: 'Dark',  behavior: 'defensive',
      baseStats: { hp: 1100, atk: 110, def: 90, spd: 100 }, reward: { gold: 115 }, special: ['shielder'] },
    { id: 'e027', name: 'Solar Ifrit',     emoji: '☀️', element: 'Light', behavior: 'berserker',
      baseStats: { hp: 950, atk: 140, def: 68, spd: 120 }, reward: { gold: 120 } },

    // New Tier 3 additions
    { id: 'e064', name: 'Corrupted Shrine Maiden', emoji: '⛩️', element: 'Dark', behavior: 'support',
      baseStats: { hp: 760, atk: 100, def: 58, spd: 125 }, reward: { gold: 100 }, special: ['healer', 'poisoner'] },
    { id: 'e065', name: 'Wyvern',          emoji: '🐲', element: 'Wind',  behavior: 'aggressive',
      baseStats: { hp: 1050, atk: 128, def: 72, spd: 130 }, reward: { gold: 108 } },
    { id: 'e066', name: 'Void Assassin',   emoji: '🗡️', element: 'Dark',  behavior: 'evasive',
      baseStats: { hp: 680, atk: 145, def: 40, spd: 155 }, reward: { gold: 115 }, special: ['stunner'] },
    { id: 'e067', name: 'Fallen Paladin',  emoji: '⚜️', element: 'Light', behavior: 'defensive',
      baseStats: { hp: 1150, atk: 108, def: 92, spd: 95 }, reward: { gold: 112 }, special: ['shielder'] },
    { id: 'e068', name: 'Storm Drake',     emoji: '🌩️', element: 'Wind',  behavior: 'berserker',
      baseStats: { hp: 880, atk: 132, def: 60, spd: 140 }, reward: { gold: 105 } },
    { id: 'e069', name: 'Succubus',        emoji: '😈', element: 'Dark',  behavior: 'technical',
      baseStats: { hp: 820, atk: 120, def: 55, spd: 132 }, reward: { gold: 110 }, special: ['stunner', 'poisoner'] },
    { id: 'e070', name: 'Arcane Automaton',emoji: '🤖', element: 'Light', behavior: 'technical',
      baseStats: { hp: 970, atk: 112, def: 85, spd: 105 }, reward: { gold: 115 }, special: ['stunner'] },
    { id: 'e071', name: 'Blade Dancer',    emoji: '💫', element: 'Wind',  behavior: 'evasive',
      baseStats: { hp: 720, atk: 138, def: 45, spd: 148 }, reward: { gold: 100 } },
    { id: 'e072', name: 'Phantom Samurai', emoji: '👘', element: 'Dark',  behavior: 'berserker',
      baseStats: { hp: 860, atk: 122, def: 66, spd: 130 }, reward: { gold: 108 } },

    // ─────────────────────────────────────────────
    // TIER 4 — Waves 41-60 · Elite
    // ─────────────────────────────────────────────
    { id: 'e030', name: 'Void Emperor',    emoji: '👑', element: 'Dark',  behavior: 'berserker',
      baseStats: { hp: 1600, atk: 180, def: 110, spd: 140 }, reward: { gold: 180 }, special: ['stunner', 'poisoner'] },
    { id: 'e031', name: 'Ancient Dragon',  emoji: '🐉', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 2000, atk: 170, def: 130, spd: 120 }, reward: { gold: 200 } },
    { id: 'e032', name: 'Celestial Serpent', emoji: '🌟', element: 'Light', behavior: 'technical',
      baseStats: { hp: 1800, atk: 175, def: 120, spd: 132 }, reward: { gold: 190 }, special: ['stunner'] },
    { id: 'e033', name: 'Abyssal Horror',  emoji: '👁️', element: 'Dark',  behavior: 'aggressive',
      baseStats: { hp: 1700, atk: 185, def: 105, spd: 145 }, reward: { gold: 185 } },

    // New Tier 4 additions
    { id: 'e073', name: 'Crystal Dragon',  emoji: '💎', element: 'Water', behavior: 'defensive',
      baseStats: { hp: 1850, atk: 165, def: 145, spd: 110 }, reward: { gold: 195 }, special: ['shielder'] },
    { id: 'e074', name: 'Void Priestess',  emoji: '🌑', element: 'Dark',  behavior: 'technical',
      baseStats: { hp: 1550, atk: 188, def: 98,  spd: 150 }, reward: { gold: 188 }, special: ['poisoner', 'stunner', 'healer'] },
    { id: 'e075', name: 'Legendary Oni',   emoji: '👹', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 1920, atk: 195, def: 115, spd: 135 }, reward: { gold: 210 } },
    { id: 'e076', name: 'Dark Sovereign',  emoji: '🔮', element: 'Dark',  behavior: 'support',
      baseStats: { hp: 1680, atk: 172, def: 125, spd: 128 }, reward: { gold: 200 }, special: ['healer', 'shielder'] },

    // ─────────────────────────────────────────────
    // TIER 5 — Waves 61+ · Nightmare
    // ─────────────────────────────────────────────
    { id: 'e077', name: 'Chaos Dragon',    emoji: '🌀', element: 'Dark',  behavior: 'berserker',
      baseStats: { hp: 2800, atk: 240, def: 160, spd: 155 }, reward: { gold: 320 }, special: ['stunner'] },
    { id: 'e078', name: 'Primordial Oni',  emoji: '🔴', element: 'Fire',  behavior: 'aggressive',
      baseStats: { hp: 3000, atk: 255, def: 145, spd: 145 }, reward: { gold: 340 } },
    { id: 'e079', name: 'Eternal Wraith',  emoji: '💀', element: 'Dark',  behavior: 'technical',
      baseStats: { hp: 2600, atk: 245, def: 155, spd: 165 }, reward: { gold: 330 }, special: ['poisoner', 'stunner'] },

    // ─────────────────────────────────────────────
    // BOSSES — Every 10 waves
    // ─────────────────────────────────────────────
    { id: 'e016', name: 'Infernal Overlord', emoji: '🔥', element: 'Fire',  behavior: 'berserker',
      baseStats: { hp: 2800, atk: 190, def: 105, spd: 132 }, reward: { gold: 350 }, isBoss: true,
      special: ['poisoner'] },
    { id: 'e017', name: 'Leviathan',        emoji: '🌊', element: 'Water', behavior: 'technical',
      baseStats: { hp: 3400, atk: 168, def: 128, spd: 118 }, reward: { gold: 400 }, isBoss: true,
      special: ['stunner', 'poisoner'] },
    { id: 'e018', name: 'Nightmare Shogun', emoji: '⛩️', element: 'Dark',  behavior: 'aggressive',
      baseStats: { hp: 3000, atk: 200, def: 118, spd: 140 }, reward: { gold: 450 }, isBoss: true,
      special: ['stunner'] },
    { id: 'e019', name: 'Celestial Dragon', emoji: '🐉', element: 'Light', behavior: 'defensive',
      baseStats: { hp: 4000, atk: 185, def: 140, spd: 128 }, reward: { gold: 500 }, isBoss: true,
      special: ['shielder', 'healer'] },
    { id: 'e020', name: 'Chaos Sovereign',  emoji: '👑', element: 'Dark',  behavior: 'berserker',
      baseStats: { hp: 5000, atk: 220, def: 160, spd: 150 }, reward: { gold: 700 }, isBoss: true,
      special: ['poisoner', 'stunner', 'shielder'] },
    { id: 'e080', name: 'Phantom Empress',  emoji: '👸', element: 'Dark',  behavior: 'technical',
      baseStats: { hp: 4500, atk: 210, def: 148, spd: 145 }, reward: { gold: 600 }, isBoss: true,
      special: ['stunner', 'healer', 'poisoner'] },
    { id: 'e081', name: 'Storm Sovereign',  emoji: '🌪️', element: 'Wind',  behavior: 'aggressive',
      baseStats: { hp: 3800, atk: 230, def: 132, spd: 158 }, reward: { gold: 550 }, isBoss: true,
      special: ['stunner'] },
    { id: 'e082', name: 'Ancient Serpent',  emoji: '🐍', element: 'Water', behavior: 'berserker',
      baseStats: { hp: 6000, atk: 200, def: 180, spd: 135 }, reward: { gold: 800 }, isBoss: true,
      special: ['poisoner', 'shielder'] }
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
        // ── Common ──
        { id: 'm001', name: 'Iron Ore',         rarity: 'N',   desc: 'Common crafting metal.',         emoji: '⛏️', tier: 1 },
        { id: 'm011', name: 'Monster Bone',      rarity: 'N',   desc: 'A sturdy bone from a monster.',  emoji: '🦴', tier: 1 },
        // ── Rare ──
        { id: 'm002', name: 'Spirit Dust',       rarity: 'R',   desc: 'Glowing magical powder.',        emoji: '✨', tier: 2 },
        { id: 'm006', name: 'Fire Crystal',      rarity: 'R',   desc: 'Crystallized fire energy.',      emoji: '🔥', tier: 2, element: 'Fire' },
        { id: 'm007', name: 'Water Gem',         rarity: 'R',   desc: 'A gem filled with water mana.',  emoji: '💧', tier: 2, element: 'Water' },
        { id: 'm008', name: 'Wind Feather',      rarity: 'R',   desc: 'A feather charged with wind.',   emoji: '🪶', tier: 2, element: 'Wind' },
        { id: 'm009', name: 'Light Shard',       rarity: 'R',   desc: 'A fragment of pure light.',      emoji: '⭐', tier: 2, element: 'Light' },
        { id: 'm010', name: 'Dark Essence',      rarity: 'R',   desc: 'Condensed primordial darkness.', emoji: '🌑', tier: 2, element: 'Dark' },
        // ── Super Rare ──
        { id: 'm003', name: 'Mithril',           rarity: 'SR',  desc: 'Incredibly light and strong.',   emoji: '💎', tier: 3 },
        { id: 'm005', name: 'Dragon Scale',      rarity: 'SR',  desc: 'Scale from a dragon hide.',      emoji: '🐉', tier: 3 },
        { id: 'm013', name: 'Enhancement Stone', rarity: 'SR',  desc: 'Used to enhance equipment.',     emoji: '🪨', tier: 3 },
        // ── SSR ──
        { id: 'm004', name: 'Star Fragment',     rarity: 'SSR', desc: 'Fallen from the cosmos.',        emoji: '🌟', tier: 4 },
        { id: 'm012', name: 'Boss Core',         rarity: 'SSR', desc: 'Crystallized core of a slain boss.', emoji: '💠', tier: 4 },
        // ── UR ──
        { id: 'm014', name: 'Void Crystal',      rarity: 'UR',  desc: 'A crystal from the void realm.', emoji: '🔮', tier: 5 },
    ],
    recipes: [
        // ── N / R tier equipment ──
        { id: 'r001', resultId: 'w002', name: 'Flame Blade',          cost: 800,
          materials: { 'm001': 8, 'm002': 3, 'm006': 2 } },
        { id: 'r002', resultId: 'a002', name: 'Chain Mail',            cost: 600,
          materials: { 'm001': 12, 'm011': 5 } },
        { id: 'r003', resultId: 'c002', name: 'Spirit Ring',           cost: 1000,
          materials: { 'm002': 5, 'm011': 3 } },
        // ── SR tier equipment ──
        { id: 'r004', resultId: 'w003', name: 'Mithril Spear',         cost: 3000,
          materials: { 'm001': 30, 'm003': 5, 'm008': 5 } },
        { id: 'r005', resultId: 'a003', name: 'Dragon Scale Armor',    cost: 5000,
          materials: { 'm001': 50, 'm005': 5, 'm013': 3 } },
        { id: 'r006', resultId: 'c003', name: 'Sakura Pendant',        cost: 4000,
          materials: { 'm002': 20, 'm003': 3, 'm009': 5 } },
        // ── SSR tier equipment ──
        { id: 'r007', resultId: 'w004', name: 'Dragon Fang',           cost: 10000,
          materials: { 'm003': 10, 'm005': 5, 'm004': 3, 'm006': 10 } },
        { id: 'r008', resultId: 'a004', name: 'Sacred Plate',          cost: 12000,
          materials: { 'm001': 100, 'm003': 8, 'm009': 8, 'm013': 5 } },
        { id: 'r009', resultId: 'c004', name: 'Dragon Eye',            cost: 15000,
          materials: { 'm004': 5, 'm005': 5, 'm012': 2 } },
        // ── UR tier equipment ──
        { id: 'r010', resultId: 'w005', name: 'Void Blade',            cost: 30000,
          materials: { 'm004': 12, 'm012': 3, 'm014': 3 } },
        { id: 'r011', resultId: 'a005', name: 'Celestial Robe',        cost: 28000,
          materials: { 'm003': 20, 'm013': 10, 'm012': 3, 'm014': 2 } },
        { id: 'r012', resultId: 'c005', name: 'Divine Orb',            cost: 25000,
          materials: { 'm004': 15, 'm007': 15, 'm010': 15, 'm014': 3 } },
    ]
};

// ===========================
// MERCHANT DATABASE
// ===========================

const MERCHANT_DATABASE = [
    // Equipment
    { id: 'mg_w002', type: 'equipment', equipId: 'w002', name: 'Flame Blade',         emoji: '🔥', rarity: 'R',   currency: 'gold',   price: 2500 },
    { id: 'mg_w003', type: 'equipment', equipId: 'w003', name: 'Mithril Spear',       emoji: '🏹', rarity: 'SR',  currency: 'gold',   price: 7000 },
    { id: 'mg_a002', type: 'equipment', equipId: 'a002', name: 'Chain Mail',           emoji: '🛡️', rarity: 'R',   currency: 'gold',   price: 2000 },
    { id: 'mg_a003', type: 'equipment', equipId: 'a003', name: 'Dragon Scale Armor',  emoji: '🐲', rarity: 'SR',  currency: 'gold',   price: 6500 },
    { id: 'mg_c003', type: 'equipment', equipId: 'c003', name: 'Sakura Pendant',      emoji: '🌸', rarity: 'SR',  currency: 'petals', price: 75 },
    { id: 'mg_c004', type: 'equipment', equipId: 'c004', name: 'Dragon Eye',          emoji: '👁️', rarity: 'SSR', currency: 'petals', price: 200 },
    // Materials
    { id: 'mg_m003', type: 'material',  matId: 'm003',  name: 'Mithril ×3',           emoji: '💎', rarity: 'SR',  currency: 'gold',   price: 1800,  qty: 3 },
    { id: 'mg_m004', type: 'material',  matId: 'm004',  name: 'Star Fragment ×2',     emoji: '🌟', rarity: 'SSR', currency: 'petals', price: 50,    qty: 2 },
    { id: 'mg_m012', type: 'material',  matId: 'm012',  name: 'Boss Core',            emoji: '💠', rarity: 'SSR', currency: 'gold',   price: 5000,  qty: 1 },
    { id: 'mg_m013', type: 'material',  matId: 'm013',  name: 'Enhancement Stones ×5',emoji: '🪨', rarity: 'SR',  currency: 'gold',   price: 3500,  qty: 5 },
    { id: 'mg_m014', type: 'material',  matId: 'm014',  name: 'Void Crystal',         emoji: '🔮', rarity: 'UR',  currency: 'orbs',   price: 25,    qty: 1 },
    // Teas / Consumables
    { id: 'mg_t001', type: 'tea',       teaId: 't001',  name: 'Sakura Tea ×3',        emoji: '🌸', rarity: 'N',   currency: 'gold',   price: 600,   qty: 3 },
    { id: 'mg_t002', type: 'tea',       teaId: 't002',  name: 'Matcha Brew ×2',       emoji: '🍵', rarity: 'R',   currency: 'gold',   price: 1200,  qty: 2 },
    { id: 'mg_t003', type: 'tea',       teaId: 't003',  name: 'Dragon Elixir',        emoji: '🧪', rarity: 'SR',  currency: 'gold',   price: 3000,  qty: 1 },
    { id: 'mg_t004', type: 'tea',       teaId: 't004',  name: 'Moon Essence ×2',      emoji: '🌙', rarity: 'R',   currency: 'gold',   price: 1400,  qty: 2 },
    // Currency exchanges
    { id: 'mg_orbs3', type: 'orbs',                     name: 'Spirit Orbs ×3',       emoji: '🔮', rarity: 'R',   currency: 'gold',   price: 2000,  qty: 3 },
    { id: 'mg_petal', type: 'petals',                    name: 'Sakura Petals ×15',    emoji: '🌸', rarity: 'N',   currency: 'gold',   price: 1000,  qty: 15 },
    { id: 'mg_petal2',type: 'petals',                    name: 'Sakura Petals ×40',    emoji: '🌸', rarity: 'R',   currency: 'gold',   price: 2500,  qty: 40 },
];

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
