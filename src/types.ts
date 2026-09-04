export type WeaponType = 'BLASTER' | 'SPREAD' | 'PLASMA' | 'RAILGUN';

export interface WeaponInfo {
  type: WeaponType;
  name: string;
  fireRate: number; // ms
  damage: number;
  speed: number;
  spread: number;
  color: string;
  glowColor: string;
  description: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  jumpsLeft: number;
  maxJumps: number;
  dashCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  facingRight: boolean;
  aimAngle: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  invulnTimer: number;
  activeWeapon: WeaponType;
  fireTimer: number;
  runCycle: number;
  ghostTrails: { x: number; y: number; alpha: number; angle: number }[];
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  damage: number;
  isPlayer: boolean;
  piercing: boolean;
  pierceCount: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

export type EnemyType = 'wasp' | 'skull' | 'crawler' | 'queen_boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  color: string;
  glowColor: string;
  scoreValue: number;
  attackTimer: number;
  sineOffset: number;
  animTick: number;
  facingRight: boolean;
  pixelGrid: number[][]; // 8x8 or 10x10 matrix of color indices
  palette: string[];
}

export interface Hazard {
  id: number;
  type: 'spike' | 'buzzsaw';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  angle: number;
  rotSpeed: number;
  patrol?: {
    xStart: number;
    xEnd: number;
    speed: number;
    dir: number;
  };
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'hazard' | 'moving';
  patrol?: {
    xStart: number;
    xEnd: number;
    speed: number;
    dir: number;
  };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  isPixel?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface Camera {
  x: number;
  y: number;
  shake: number;
  zoom: number;
}

export interface ExitPortal {
  x: number;
  y: number;
  radius: number;
  active: boolean;
  angle: number;
}

export interface LevelSummary {
  level: number;
  levelName: string;
  scoreGained: number;
  totalScore: number;
  kills: number;
  maxCombo: number;
  healthBonus: number;
  completionBonus: number;
  isGameComplete: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  maxComboTimer: number;
  multiplier: number;
  kills: number;
  wave: number;
  distance: number;
  currentLevel: number;
  maxUnlockedLevel: number;
  levelName: string;
  levelProgress: number; // 0 to 100 percentage toward exit portal
  isPortalActive: boolean;
  bossActive: boolean;
  bossName?: string;
  bossHealth?: number;
  bossMaxHealth?: number;
}
