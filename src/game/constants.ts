import { WeaponInfo, WeaponType } from '../types';

export const GRAVITY = 0.58;
export const FRICTION = 0.84;
export const MOVE_SPEED = 5.2;
export const JUMP_FORCE = -11.5;
export const DOUBLE_JUMP_FORCE = -10.2;
export const DASH_SPEED = 14;
export const DASH_DURATION = 12; // frames

export const WEAPONS: Record<WeaponType, WeaponInfo> = {
  BLASTER: {
    type: 'BLASTER',
    name: 'PULSE BLASTER',
    fireRate: 140, // ms
    damage: 18,
    speed: 15,
    spread: 0.04,
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.8)',
    description: 'Rapid-fire high-velocity cyan neon plasma bolts'
  },
  SPREAD: {
    type: 'SPREAD',
    name: 'TRI-BURST BLASTER',
    fireRate: 260,
    damage: 14,
    speed: 13,
    spread: 0.22,
    color: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.8)',
    description: 'Triple kinetic spread projectile for crowd control'
  },
  PLASMA: {
    type: 'PLASMA',
    name: 'ION CANNON',
    fireRate: 420,
    damage: 48,
    speed: 9,
    spread: 0.02,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    description: 'Heavy explosive plasma orb with splash radius'
  },
  RAILGUN: {
    type: 'RAILGUN',
    name: 'QUANTUM RAILGUN',
    fireRate: 600,
    damage: 85,
    speed: 28,
    spread: 0.0,
    color: '#ffe600',
    glowColor: 'rgba(255, 230, 0, 0.9)',
    description: 'Hyper-velocity piercing neon beam that slices through enemies'
  }
};

// 8x8 Pixel art matrices for enemies:
// 0 = transparent, 1 = body primary, 2 = body secondary/accent, 3 = eyes/glow, 4 = highlights
export const PIXEL_TEMPLATES = {
  wasp: [
    [0, 2, 0, 0, 0, 0, 2, 0],
    [2, 2, 2, 0, 0, 2, 2, 2],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 3, 1, 1, 1, 1, 3, 1],
    [1, 3, 1, 2, 2, 1, 3, 1],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  skull: [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 3, 1, 1, 3, 3, 1],
    [1, 3, 3, 1, 1, 3, 3, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
  ],
  crawler: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 3, 1, 1, 3, 1, 0],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
  ],
  queen_boss: [
    [0, 0, 2, 1, 1, 1, 1, 2, 0, 0],
    [0, 2, 2, 1, 1, 1, 1, 2, 2, 0],
    [2, 1, 1, 3, 3, 3, 3, 1, 1, 2],
    [1, 1, 3, 4, 3, 3, 4, 3, 1, 1],
    [1, 2, 1, 3, 3, 3, 3, 1, 2, 1],
    [1, 2, 2, 1, 2, 2, 1, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 0, 1, 0, 0, 1, 0, 2, 0],
    [2, 0, 0, 1, 0, 0, 1, 0, 0, 2],
  ]
};

export const ENEMY_PALETTES = {
  wasp: ['transparent', '#e11d48', '#fb7185', '#38bdf8', '#ffffff'], // Neon red/pink body with electric blue eyes
  skull: ['transparent', '#9333ea', '#c084fc', '#4ade80', '#ffffff'], // Violet body with acid green glowing eyes
  crawler: ['transparent', '#f97316', '#fdba74', '#06b6d4', '#ffffff'], // Cyber orange body with cyan eyes
  queen_boss: ['transparent', '#dc2626', '#f43f5e', '#a855f7', '#fef08a'] // Heavy red/violet/gold boss
};
