import { sound } from '../audio/synthAudio';
import {
  Bullet,
  Camera,
  Enemy,
  ExitPortal,
  FloatingText,
  GameStats,
  Hazard,
  LevelSummary,
  Particle,
  Platform,
  Player,
  WeaponType
} from '../types';
import {
  DASH_DURATION,
  DASH_SPEED,
  DOUBLE_JUMP_FORCE,
  ENEMY_PALETTES,
  FRICTION,
  GRAVITY,
  JUMP_FORCE,
  MOVE_SPEED,
  PIXEL_TEMPLATES,
  WEAPONS
} from './constants';
import { getLevelConfig, LevelConfig } from './levels';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public player: Player;
  public bullets: Bullet[] = [];
  public enemies: Enemy[] = [];
  public hazards: Hazard[] = [];
  public platforms: Platform[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public camera: Camera;
  public stats: GameStats;

  // Level & Portal State
  public currentLevel: number = 1;
  public maxUnlockedLevel: number = 1;
  public levelConfig: LevelConfig;
  public exitPortal: ExitPortal = { x: 3000, y: 440, radius: 40, active: true, angle: 0 };
  private levelStartScore: number = 0;
  private levelStartKills: number = 0;
  private isLevelCompleting: boolean = false;

  // Controls input state
  public keys: Record<string, boolean> = {};
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;

  // Game loop & timing
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private bulletIdCounter: number = 0;
  private enemyIdCounter: number = 0;
  private textIdCounter: number = 0;
  private worldWidth: number = 3600;
  private gridOffset: number = 0;

  // Callback hooks for UI state
  public onStatsUpdate?: (stats: GameStats, player: Player) => void;
  public onGameOver?: (stats: GameStats) => void;
  public onLevelComplete?: (summary: LevelSummary) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not obtain 2D canvas context');
    this.ctx = context;

    this.maxUnlockedLevel = Math.max(1, Math.min(20, parseInt(localStorage.getItem('neon_cube_unlocked_level') || '1', 10)));
    this.currentLevel = 1;
    this.levelConfig = getLevelConfig(this.currentLevel);

    this.player = this.createPlayer();
    this.camera = { x: 0, y: 0, shake: 0, zoom: 1 };
    this.stats = {
      score: 0,
      highScore: parseInt(localStorage.getItem('neon_cube_highscore') || '0', 10),
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      maxComboTimer: 180, // ~3 seconds
      multiplier: 1,
      kills: 0,
      wave: this.currentLevel,
      distance: 0,
      currentLevel: this.currentLevel,
      maxUnlockedLevel: this.maxUnlockedLevel,
      levelName: this.levelConfig.name,
      levelProgress: 0,
      isPortalActive: true,
      bossActive: false
    };

    this.initLevel(this.currentLevel);
  }

  private createPlayer(): Player {
    return {
      x: 200,
      y: 350,
      vx: 0,
      vy: 0,
      width: 36,
      height: 36,
      isGrounded: false,
      jumpsLeft: 2,
      maxJumps: 2,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      facingRight: true,
      aimAngle: 0,
      health: 100,
      maxHealth: 100,
      shield: 50,
      maxShield: 50,
      invulnTimer: 0,
      activeWeapon: 'BLASTER',
      fireTimer: 0,
      runCycle: 0,
      ghostTrails: []
    };
  }

  public initLevel(levelNum?: number) {
    if (levelNum !== undefined) {
      this.currentLevel = Math.max(1, Math.min(20, levelNum));
    }
    this.levelConfig = getLevelConfig(this.currentLevel);
    this.worldWidth = this.levelConfig.worldWidth;
    this.isLevelCompleting = false;
    this.levelStartScore = this.stats.score;
    this.levelStartKills = this.stats.kills;

    // Reset collections
    this.platforms = [];
    this.hazards = [];
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];

    // Reset player position and state
    this.player.x = 180;
    this.player.y = 350;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.invulnTimer = 35; // Brief spawn invulnerability

    const groundY = 520;
    const config = this.levelConfig;

    // Procedural terrain generation tailored to level parameters
    let currentX = 0;
    while (currentX < this.worldWidth - 520) {
      const isStartArea = currentX < 450;
      const minSeg = isStartArea ? 600 : Math.max(280, 520 - this.currentLevel * 8);
      const maxSeg = isStartArea ? 800 : Math.max(420, 720 - this.currentLevel * 7);
      const segWidth = minSeg + Math.random() * (maxSeg - minSeg);

      this.platforms.push({
        x: currentX,
        y: groundY,
        width: segWidth,
        height: 200,
        type: 'solid'
      });

      // Add hazards on ground
      if (!isStartArea) {
        // Neon Spikes
        if (Math.random() < 0.65 * config.hazardDensity) {
          const spikeCount = Math.min(4, Math.floor(1 + Math.random() * (1 + config.hazardDensity)));
          const spikeX = currentX + 80 + Math.random() * Math.max(20, segWidth - 220);
          for (let s = 0; s < spikeCount; s++) {
            this.hazards.push({
              id: Math.random(),
              type: 'spike',
              x: spikeX + s * 28,
              y: groundY - 26,
              width: 26,
              height: 26,
              radius: 13,
              angle: 0,
              rotSpeed: 0
            });
          }
        }

        // Circular Buzzsaws
        if (Math.random() < 0.5 * config.hazardDensity) {
          const sawX = currentX + 160 + Math.random() * Math.max(30, segWidth - 300);
          const sawSpeed = (1.8 + Math.random() * 0.8) * config.sawSpeedMult;
          this.hazards.push({
            id: Math.random(),
            type: 'buzzsaw',
            x: sawX,
            y: groundY - 45 - Math.random() * 35,
            width: 54,
            height: 54,
            radius: 27,
            angle: 0,
            rotSpeed: 0.16 * config.sawSpeedMult,
            patrol: {
              xStart: sawX - 85,
              xEnd: sawX + 85,
              speed: sawSpeed,
              dir: Math.random() > 0.5 ? 1 : -1
            }
          });
        }
      }

      // Elevated and moving platforms
      const elevatedCount = 1 + Math.floor(Math.random() * 3);
      for (let p = 0; p < elevatedCount; p++) {
        const platY = groundY - 95 - Math.random() * 160;
        const platW = Math.max(95, 160 - this.currentLevel * 2 + Math.random() * 60);
        const platX = currentX + 50 + p * 200;

        // Moving platform determination based on level config
        const isMoving = Math.random() < (config.movingPlatformsCount / 9);
        if (isMoving) {
          const moveRange = 75 + Math.random() * 60;
          this.platforms.push({
            x: platX,
            y: platY,
            width: platW,
            height: 18,
            type: 'moving',
            patrol: {
              xStart: platX - moveRange,
              xEnd: platX + moveRange,
              speed: 1.4 * config.sawSpeedMult,
              dir: 1
            }
          });
        } else {
          this.platforms.push({
            x: platX,
            y: platY,
            width: platW,
            height: 18,
            type: 'solid'
          });

          // Chance of buzzsaw patrolling platform
          if (Math.random() < 0.45 * config.hazardDensity && platW > 120) {
            this.hazards.push({
              id: Math.random(),
              type: 'buzzsaw',
              x: platX + platW / 2,
              y: platY - 26,
              width: 44,
              height: 44,
              radius: 22,
              angle: 0,
              rotSpeed: 0.18 * config.sawSpeedMult,
              patrol: {
                xStart: platX + 22,
                xEnd: platX + platW - 22,
                speed: 2.0 * config.sawSpeedMult,
                dir: 1
              }
            });
          }
        }
      }

      // Gap between ground segments
      const gapMin = 65 + Math.min(45, this.currentLevel * 2.5);
      const gapMax = 100 + Math.min(55, this.currentLevel * 3.5);
      currentX += segWidth + (gapMin + Math.random() * (gapMax - gapMin));
    }

    // Final Landing Platform where Exit Portal is anchored
    const finalPlatX = this.worldWidth - 520;
    const finalPlatW = 560;
    this.platforms.push({
      x: finalPlatX,
      y: groundY,
      width: finalPlatW,
      height: 200,
      type: 'solid'
    });

    // Elevated pedestal for portal
    this.platforms.push({
      x: this.worldWidth - 330,
      y: groundY - 60,
      width: 150,
      height: 18,
      type: 'solid'
    });

    // Setup Exit Portal
    this.exitPortal = {
      x: this.worldWidth - 255,
      y: groundY - 115,
      radius: 40,
      active: !config.hasBoss, // If boss level, portal is unlocked once boss falls
      angle: 0
    };

    // Update stats metadata for current level
    this.stats.currentLevel = this.currentLevel;
    this.stats.levelName = config.name;
    this.stats.wave = this.currentLevel;
    this.stats.isPortalActive = this.exitPortal.active;
    this.stats.bossActive = false;
    this.stats.bossName = undefined;
    this.stats.bossHealth = undefined;
    this.stats.bossMaxHealth = undefined;

    // Spawn enemies
    this.spawnLevelEnemies();

    // Spawn boss if configured
    if (config.hasBoss && config.bossConfig) {
      this.spawnConfiguredBoss(config.bossConfig);
    }

    // Intro banner text
    this.addFloatingText(this.player.x + 180, 220, `NIVEL ${this.currentLevel}: ${config.name.toUpperCase()}`, config.theme.accentColor, 1.8);
    if (config.hasBoss) {
      this.addFloatingText(this.player.x + 180, 260, '⚠️ ¡ZONA DE JEFE! ELIMÍNALO PARA ACTIVAR EL PORTAL', '#ff0055', 1.4);
    }
  }

  private spawnLevelEnemies() {
    const config = this.levelConfig;
    const count = config.enemyCount;
    const spacing = (this.worldWidth - 1100) / count;

    for (let i = 0; i < count; i++) {
      const targetX = 600 + i * spacing + (Math.random() - 0.5) * (spacing * 0.4);
      if (targetX < this.worldWidth - 550) {
        this.spawnEnemyAt(targetX);
      }
    }
  }

  private spawnEnemyAt(targetX: number) {
    const types = this.levelConfig.enemyTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const isWasp = type === 'wasp';
    const isSkull = type === 'skull';

    const y = isWasp
      ? 180 + Math.random() * 200
      : isSkull
      ? 140 + Math.random() * 220
      : 470;

    const size = isWasp ? 36 : isSkull ? 38 : 34;
    const baseHp = isWasp ? 30 : isSkull ? 45 : 35;
    const hp = Math.round(baseHp * this.levelConfig.enemyHpMult);

    this.enemies.push({
      id: ++this.enemyIdCounter,
      type,
      x: targetX,
      y,
      vx: 0,
      vy: 0,
      width: size,
      height: size,
      health: hp,
      maxHealth: hp,
      color: type === 'wasp' ? '#fb7185' : type === 'skull' ? '#c084fc' : '#f97316',
      glowColor: type === 'wasp' ? 'rgba(244,63,94,0.7)' : type === 'skull' ? 'rgba(192,132,252,0.7)' : 'rgba(249,115,22,0.7)',
      scoreValue: (isWasp ? 120 : isSkull ? 180 : 100) * this.currentLevel,
      attackTimer: Math.random() * 120,
      sineOffset: Math.random() * Math.PI * 2,
      animTick: 0,
      facingRight: false,
      pixelGrid: PIXEL_TEMPLATES[type],
      palette: ENEMY_PALETTES[type]
    });
  }

  public spawnConfiguredBoss(bossConfig: { name: string; health: number; color: string; glowColor: string; scoreValue: number }) {
    const hp = bossConfig.health;
    const bossX = this.worldWidth - 850;

    this.enemies.push({
      id: ++this.enemyIdCounter,
      type: 'queen_boss',
      x: bossX,
      y: 200,
      vx: 0,
      vy: 0,
      width: 76,
      height: 76,
      health: hp,
      maxHealth: hp,
      color: bossConfig.color,
      glowColor: bossConfig.glowColor,
      scoreValue: bossConfig.scoreValue,
      attackTimer: 60,
      sineOffset: 0,
      animTick: 0,
      facingRight: false,
      pixelGrid: PIXEL_TEMPLATES.queen_boss,
      palette: ENEMY_PALETTES.queen_boss
    });

    this.stats.bossActive = true;
    this.stats.bossName = bossConfig.name;
    this.stats.bossHealth = hp;
    this.stats.bossMaxHealth = hp;
    this.camera.shake = 22;
    sound.playExplosion(true);
  }

  public spawnBoss() {
    if (this.levelConfig.bossConfig) {
      this.spawnConfiguredBoss(this.levelConfig.bossConfig);
    } else {
      this.spawnConfiguredBoss({
        name: 'Guardián Neón',
        health: 450 + this.currentLevel * 40,
        color: '#f43f5e',
        glowColor: 'rgba(244,63,94,0.9)',
        scoreValue: 3000
      });
    }
  }

  // --- CONTROLS HOOKS ---
  public handleKeyDown(code: string) {
    this.keys[code] = true;

    // Jump
    if (code === 'KeyW' || code === 'Space' || code === 'ArrowUp') {
      this.doJump();
    }

    // Dash
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyK') {
      this.doDash();
    }

    // Weapon slots
    if (code === 'Digit1') this.setWeapon('BLASTER');
    if (code === 'Digit2') this.setWeapon('SPREAD');
    if (code === 'Digit3') this.setWeapon('PLASMA');
    if (code === 'Digit4') this.setWeapon('RAILGUN');
    if (code === 'KeyQ') this.cycleWeapon(-1);
    if (code === 'KeyE') this.cycleWeapon(1);
  }

  public handleKeyUp(code: string) {
    this.keys[code] = false;
  }

  public handleMouseMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.mouseX = (clientX - rect.left) * scaleX;
    this.mouseY = (clientY - rect.top) * scaleY;
  }

  public handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = true;
    } else if (e.button === 2) {
      // Right click dash
      this.doDash();
    }
  }

  public handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  public setWeapon(type: WeaponType) {
    this.player.activeWeapon = type;
    this.addFloatingText(this.player.x, this.player.y - 40, WEAPONS[type].name, WEAPONS[type].color, 1.2);
  }

  public cycleWeapon(dir: number) {
    const weaponKeys: WeaponType[] = ['BLASTER', 'SPREAD', 'PLASMA', 'RAILGUN'];
    const idx = weaponKeys.indexOf(this.player.activeWeapon);
    const nextIdx = (idx + dir + weaponKeys.length) % weaponKeys.length;
    this.setWeapon(weaponKeys[nextIdx]);
  }

  public doJump() {
    if (this.player.jumpsLeft > 0) {
      const isDouble = this.player.jumpsLeft < this.player.maxJumps;
      this.player.vy = isDouble ? DOUBLE_JUMP_FORCE : JUMP_FORCE;
      this.player.jumpsLeft--;
      this.player.isGrounded = false;
      sound.playJump(isDouble);

      // Jump ring particles
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        this.particles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * 1.5 + (isDouble ? -1 : 1),
          size: 3 + Math.random() * 2,
          color: '#00f0ff',
          alpha: 1,
          life: 0,
          maxLife: 20,
          gravity: 0.1
        });
      }
    }
  }

  public doDash() {
    if (this.player.dashCooldown <= 0 && !this.player.isDashing) {
      this.player.isDashing = true;
      this.player.dashTimer = DASH_DURATION;
      this.player.dashCooldown = 60; // 1 sec cooldown
      this.player.vx = (this.player.facingRight ? 1 : -1) * DASH_SPEED;
      this.player.vy = 0;
      sound.playDash();

      // Ghost trail
      for (let i = 0; i < 4; i++) {
        this.player.ghostTrails.push({
          x: this.player.x - (this.player.facingRight ? 1 : -1) * i * 15,
          y: this.player.y,
          alpha: 0.8 - i * 0.2,
          angle: this.player.aimAngle
        });
      }
    }
  }

  // --- WEAPON SHOOTING ---
  private fireWeapon() {
    const weapon = WEAPONS[this.player.activeWeapon];
    if (this.player.fireTimer > 0) return;

    this.player.fireTimer = weapon.fireRate;
    sound.playLaser(weapon.type);

    const barrelX = this.player.x + this.player.width / 2 + Math.cos(this.player.aimAngle) * 26;
    const barrelY = this.player.y + this.player.height / 2 + Math.sin(this.player.aimAngle) * 26;

    // Muzzle flash particles
    for (let i = 0; i < 6; i++) {
      const pAngle = this.player.aimAngle + (Math.random() - 0.5) * 0.8;
      const pSpeed = 4 + Math.random() * 6;
      this.particles.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        size: 3 + Math.random() * 3,
        color: weapon.color,
        alpha: 1,
        life: 0,
        maxLife: 15,
        gravity: 0
      });
    }

    if (weapon.type === 'BLASTER') {
      const angle = this.player.aimAngle + (Math.random() - 0.5) * weapon.spread;
      this.bullets.push({
        id: ++this.bulletIdCounter,
        x: barrelX,
        y: barrelY,
        vx: Math.cos(angle) * weapon.speed,
        vy: Math.sin(angle) * weapon.speed,
        radius: 4,
        color: weapon.color,
        glowColor: weapon.glowColor,
        damage: weapon.damage,
        isPlayer: true,
        piercing: false,
        pierceCount: 0,
        life: 0,
        maxLife: 80,
        trail: []
      });
    } else if (weapon.type === 'SPREAD') {
      const angles = [-0.18, 0, 0.18];
      for (const offset of angles) {
        const angle = this.player.aimAngle + offset;
        this.bullets.push({
          id: ++this.bulletIdCounter,
          x: barrelX,
          y: barrelY,
          vx: Math.cos(angle) * weapon.speed,
          vy: Math.sin(angle) * weapon.speed,
          radius: 3.5,
          color: weapon.color,
          glowColor: weapon.glowColor,
          damage: weapon.damage,
          isPlayer: true,
          piercing: false,
          pierceCount: 0,
          life: 0,
          maxLife: 60,
          trail: []
        });
      }
    } else if (weapon.type === 'PLASMA') {
      this.bullets.push({
        id: ++this.bulletIdCounter,
        x: barrelX,
        y: barrelY,
        vx: Math.cos(this.player.aimAngle) * weapon.speed,
        vy: Math.sin(this.player.aimAngle) * weapon.speed,
        radius: 8,
        color: weapon.color,
        glowColor: weapon.glowColor,
        damage: weapon.damage,
        isPlayer: true,
        piercing: false,
        pierceCount: 0,
        life: 0,
        maxLife: 100,
        trail: []
      });
      this.camera.shake = 5;
    } else if (weapon.type === 'RAILGUN') {
      this.bullets.push({
        id: ++this.bulletIdCounter,
        x: barrelX,
        y: barrelY,
        vx: Math.cos(this.player.aimAngle) * weapon.speed,
        vy: Math.sin(this.player.aimAngle) * weapon.speed,
        radius: 5,
        color: weapon.color,
        glowColor: weapon.glowColor,
        damage: weapon.damage,
        isPlayer: true,
        piercing: true,
        pierceCount: 6,
        life: 0,
        maxLife: 50,
        trail: []
      });
      this.camera.shake = 8;
    }
  }

  // --- MAIN TICK / UPDATE ---
  public update(deltaTime: number) {
    if (this.player.health <= 0) return;

    // Continuous fire if mouse is down or J / Enter / Z is held
    if (this.isMouseDown || this.keys['KeyJ'] || this.keys['KeyZ'] || this.keys['Enter']) {
      this.fireWeapon();
    }

    if (this.player.fireTimer > 0) {
      this.player.fireTimer -= deltaTime;
    }

    // Aim calculation: toward mouse relative to player screen position
    const playerScreenX = this.player.x - this.camera.x;
    const playerScreenY = this.player.y - this.camera.y;
    this.player.aimAngle = Math.atan2(
      this.mouseY - (playerScreenY + this.player.height / 2),
      this.mouseX - (playerScreenX + this.player.width / 2)
    );

    // Update facing direction based on aim or movement
    if (Math.cos(this.player.aimAngle) > 0.1) {
      this.player.facingRight = true;
    } else if (Math.cos(this.player.aimAngle) < -0.1) {
      this.player.facingRight = false;
    }

    // Player Movement Horizontal
    let moveDir = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir += 1;

    if (!this.player.isDashing) {
      if (moveDir !== 0) {
        this.player.vx += moveDir * 0.9;
        if (Math.abs(this.player.vx) > MOVE_SPEED) {
          this.player.vx = Math.sign(this.player.vx) * MOVE_SPEED;
        }
        this.player.runCycle += 0.25;
      } else {
        this.player.vx *= FRICTION;
        if (Math.abs(this.player.vx) < 0.05) this.player.vx = 0;
        this.player.runCycle *= 0.8;
      }
    } else {
      this.player.dashTimer--;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
        this.player.vx *= 0.5;
      }
    }

    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown--;
    }

    // Gravity
    if (!this.player.isDashing) {
      this.player.vy += GRAVITY;
      if (this.player.vy > 14) this.player.vy = 14;
    }

    // Apply Velocity
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Platform Collisions and Moving Platforms
    this.player.isGrounded = false;
    for (const plat of this.platforms) {
      // Update moving platform position
      if (plat.type === 'moving' && plat.patrol) {
        plat.x += plat.patrol.speed * plat.patrol.dir;
        if (plat.x > plat.patrol.xEnd) {
          plat.x = plat.patrol.xEnd;
          plat.patrol.dir = -1;
        } else if (plat.x < plat.patrol.xStart) {
          plat.x = plat.patrol.xStart;
          plat.patrol.dir = 1;
        }
      }

      // Check landing on top
      if (
        this.player.x + this.player.width > plat.x &&
        this.player.x < plat.x + plat.width &&
        this.player.y + this.player.height >= plat.y &&
        this.player.y + this.player.height <= plat.y + 20 &&
        this.player.vy >= 0
      ) {
        this.player.y = plat.y - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.jumpsLeft = this.player.maxJumps;

        // Carry player on moving platform
        if (plat.type === 'moving' && plat.patrol) {
          this.player.x += plat.patrol.speed * plat.patrol.dir;
        }
      }
    }

    // Bottom pit death / damage
    if (this.player.y > 750) {
      this.takePlayerDamage(40);
      this.player.y = 350;
      this.player.vy = 0;
    }

    // Invulnerability timer
    if (this.player.invulnTimer > 0) {
      this.player.invulnTimer--;
    }

    // Shield passive recharge
    if (this.player.shield < this.player.maxShield && this.player.invulnTimer <= 0) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 0.08);
    }

    // Player ghost trail decay
    for (let i = this.player.ghostTrails.length - 1; i >= 0; i--) {
      this.player.ghostTrails[i].alpha -= 0.05;
      if (this.player.ghostTrails[i].alpha <= 0) {
        this.player.ghostTrails.splice(i, 1);
      }
    }

    // Update Hazards (Buzzsaws & Spikes)
    for (const haz of this.hazards) {
      if (haz.type === 'buzzsaw') {
        haz.angle += haz.rotSpeed;
        if (haz.patrol) {
          haz.x += haz.patrol.speed * haz.patrol.dir;
          if (haz.x > haz.patrol.xEnd) {
            haz.x = haz.patrol.xEnd;
            haz.patrol.dir = -1;
          } else if (haz.x < haz.patrol.xStart) {
            haz.x = haz.patrol.xStart;
            haz.patrol.dir = 1;
          }
        }

        // Buzzsaw sparks
        if (Math.random() > 0.4) {
          this.particles.push({
            x: haz.x + (Math.random() - 0.5) * haz.radius,
            y: haz.y + haz.radius,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            size: 2,
            color: '#ffaa00',
            alpha: 1,
            life: 0,
            maxLife: 15,
            gravity: 0.15
          });
        }

        // Collision with player
        const dist = Math.hypot(
          this.player.x + this.player.width / 2 - haz.x,
          this.player.y + this.player.height / 2 - haz.y
        );
        if (dist < haz.radius + 14) {
          this.takePlayerDamage(24);
          this.player.vy = -7;
          this.player.vx = (this.player.x < haz.x ? -1 : 1) * 8;
          sound.playHit();
        }
      } else if (haz.type === 'spike') {
        // Triangular spike collision
        if (
          this.player.x + this.player.width > haz.x &&
          this.player.x < haz.x + haz.width &&
          this.player.y + this.player.height >= haz.y + 6 &&
          this.player.y < haz.y + haz.height
        ) {
          this.takePlayerDamage(28);
          this.player.vy = -10; // Launch player up
          sound.playHit();
        }
      }
    }

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life++;

      // Trail history
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();

      let bulletDead = b.life >= b.maxLife;

      if (b.isPlayer) {
        // Check collision with enemies
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = this.enemies[eIdx];
          const dist = Math.hypot(b.x - (enemy.x + enemy.width / 2), b.y - (enemy.y + enemy.height / 2));
          if (dist < enemy.width / 2 + b.radius) {
            // Hit enemy
            enemy.health -= b.damage;
            if (enemy.type === 'queen_boss') {
              this.stats.bossHealth = Math.max(0, enemy.health);
            }
            this.addFloatingText(enemy.x, enemy.y - 10, `${Math.round(b.damage)}`, b.color, 1.1);

            // Pixel blood/debris explosion particles
            this.spawnEnemyImpactParticles(b.x, b.y, enemy.palette);

            if (!b.piercing) {
              bulletDead = true;
            } else {
              b.pierceCount--;
              if (b.pierceCount <= 0) bulletDead = true;
            }

            if (enemy.health <= 0) {
              this.killEnemy(enemy, eIdx);
            }
            break;
          }
        }
      } else {
        // Enemy bullet hitting player
        const dist = Math.hypot(
          b.x - (this.player.x + this.player.width / 2),
          b.y - (this.player.y + this.player.height / 2)
        );
        if (dist < this.player.width / 2 + b.radius) {
          this.takePlayerDamage(b.damage);
          bulletDead = true;
        }
      }

      if (bulletDead) {
        this.bullets.splice(i, 1);
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.animTick++;

      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      enemy.facingRight = dx > 0;

      if (enemy.type === 'wasp') {
        // Floating insect with fluttering sine wave
        enemy.sineOffset += 0.08;
        enemy.vy = Math.sin(enemy.sineOffset) * 2.2;
        // Glide toward player when within range
        if (dist < 550) {
          enemy.vx = (dx / dist) * 2.4;
        } else {
          enemy.vx = 0;
        }

        // Stinger attack
        enemy.attackTimer += deltaTime / 16;
        if (enemy.attackTimer > 160 && dist < 450) {
          enemy.attackTimer = 0;
          this.shootEnemyProjectile(enemy, 5, '#fb7185');
        }
      } else if (enemy.type === 'skull') {
        // Floating pixel skull that dashes in pulses
        enemy.sineOffset += 0.05;
        enemy.vy = Math.sin(enemy.sineOffset) * 1.5;
        if (dist < 600) {
          enemy.vx = (dx / dist) * 1.9;
        }
      } else if (enemy.type === 'crawler') {
        // Scurries on platforms
        enemy.vy += GRAVITY;
        enemy.vx = (dx > 0 ? 1 : -1) * 2.1;

        // Platform collision for crawler
        for (const plat of this.platforms) {
          if (
            enemy.x + enemy.width > plat.x &&
            enemy.x < plat.x + plat.width &&
            enemy.y + enemy.height >= plat.y &&
            enemy.y + enemy.height <= plat.y + 15 &&
            enemy.vy >= 0
          ) {
            enemy.y = plat.y - enemy.height;
            enemy.vy = 0;
          }
        }
      } else if (enemy.type === 'queen_boss') {
        // Boss hovering and attacking
        enemy.sineOffset += 0.03;
        enemy.vy = Math.sin(enemy.sineOffset) * 2.8;
        enemy.vx = (dx / (dist + 0.1)) * 1.2;

        enemy.attackTimer += deltaTime / 16;
        if (enemy.attackTimer > 90) {
          enemy.attackTimer = 0;
          // Fire radial spread of stingers
          for (let a = -2; a <= 2; a++) {
            const angle = Math.atan2(dy, dx) + a * 0.22;
            this.bullets.push({
              id: ++this.bulletIdCounter,
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: Math.cos(angle) * 4.5,
              vy: Math.sin(angle) * 4.5,
              radius: 4.5,
              color: '#f43f5e',
              glowColor: 'rgba(244,63,94,0.8)',
              damage: 15,
              isPlayer: false,
              piercing: false,
              pierceCount: 0,
              life: 0,
              maxLife: 120,
              trail: []
            });
          }
        }
      }

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      // Enemy touching player
      if (dist < enemy.width / 2 + this.player.width / 2 - 4) {
        this.takePlayerDamage(enemy.type === 'queen_boss' ? 32 : 16);
        this.player.vx = (this.player.x < enemy.x ? -1 : 1) * 6;
        sound.playHit();
      }
    }

    // Dynamic enemy spawning ahead of player tuned to level
    if (this.enemies.length < Math.min(12, this.levelConfig.enemyCount)) {
      const spawnX = this.player.x + 600 + Math.random() * 350;
      if (spawnX < this.worldWidth - 450) {
        this.spawnEnemyAt(spawnX);
      }
    }

    // Exit Portal updates & Progress calculation
    this.exitPortal.angle += 0.035;
    const startX = 180;
    const portalX = this.exitPortal.x;
    const progress = Math.min(100, Math.max(0, Math.round(((this.player.x - startX) / (portalX - startX)) * 100)));
    this.stats.levelProgress = progress;
    this.stats.isPortalActive = this.exitPortal.active;

    // Check collision with Exit Portal
    if (this.exitPortal.active && !this.isLevelCompleting) {
      const pDist = Math.hypot(
        (this.player.x + this.player.width / 2) - this.exitPortal.x,
        (this.player.y + this.player.height / 2) - this.exitPortal.y
      );

      if (pDist < this.exitPortal.radius + 18) {
        this.completeLevel();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 1.2;
      t.life++;
      t.alpha = 1 - t.life / t.maxLife;
      if (t.life >= t.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Combo Timer Decay
    if (this.stats.combo > 0) {
      this.stats.comboTimer--;
      if (this.stats.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // Update Stats Distance
    this.stats.distance = Math.max(this.stats.distance, Math.floor(this.player.x / 10));

    // Update Camera with dynamic lead
    const targetCamX = this.player.x - this.canvas.width * 0.35;
    const targetCamY = this.player.y - this.canvas.height * 0.55;
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.08;

    // Camera shake decay
    if (this.camera.shake > 0) {
      this.camera.shake *= 0.88;
      if (this.camera.shake < 0.2) this.camera.shake = 0;
    }

    // Synthwave grid floor scroll
    this.gridOffset = (this.gridOffset + 2 + Math.abs(this.player.vx) * 0.5) % 40;

    // Send updates to React HUD
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.player);
    }
  }

  private shootEnemyProjectile(enemy: Enemy, speed: number, color: string) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const angle = Math.atan2(dy, dx);

    this.bullets.push({
      id: ++this.bulletIdCounter,
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4,
      color,
      glowColor: color,
      damage: 14,
      isPlayer: false,
      piercing: false,
      pierceCount: 0,
      life: 0,
      maxLife: 100,
      trail: []
    });
  }

  private takePlayerDamage(amount: number) {
    if (this.player.invulnTimer > 0) return;

    this.player.invulnTimer = 35; // Frames of invulnerability
    this.camera.shake = 14;
    sound.playHit();

    let remaining = amount;
    if (this.player.shield > 0) {
      if (this.player.shield >= remaining) {
        this.player.shield -= remaining;
        remaining = 0;
      } else {
        remaining -= this.player.shield;
        this.player.shield = 0;
      }
    }

    if (remaining > 0) {
      this.player.health = Math.max(0, this.player.health - remaining);
    }

    // Break combo on damage
    this.resetCombo();

    // Damage particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 3,
        color: '#ff0055',
        alpha: 1,
        life: 0,
        maxLife: 25,
        gravity: 0.15
      });
    }

    if (this.player.health <= 0) {
      sound.playExplosion(true);
      if (this.onGameOver) this.onGameOver(this.stats);
    }
  }

  private killEnemy(enemy: Enemy, index: number) {
    const isBoss = enemy.type === 'queen_boss';
    sound.playExplosion(isBoss);

    // Increase combo
    this.stats.combo++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
    this.stats.comboTimer = this.stats.maxComboTimer;
    this.stats.multiplier = 1 + Math.floor(this.stats.combo / 4);
    this.stats.kills++;

    sound.playCombo(this.stats.combo);

    const earnedScore = enemy.scoreValue * this.stats.multiplier;
    this.stats.score += earnedScore;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('neon_cube_highscore', this.stats.highScore.toString());
    }

    // Floating text
    this.addFloatingText(
      enemy.x,
      enemy.y,
      `+${earnedScore}${this.stats.multiplier > 1 ? ` (x${this.stats.multiplier})` : ''}`,
      this.stats.combo >= 8 ? '#ffe600' : '#00f0ff',
      this.stats.combo >= 8 ? 1.6 : 1.2
    );

    if (this.stats.combo === 5) {
      this.addFloatingText(this.player.x, this.player.y - 60, '🔥 MEGA COMBO! 🔥', '#ff007f', 1.8);
    } else if (this.stats.combo === 10) {
      this.addFloatingText(this.player.x, this.player.y - 60, '⚡ ULTRA SYNTH SLAYER! ⚡', '#ffe600', 2.2);
    }

    // Giant pixel debris explosion
    for (let p = 0; p < (isBoss ? 50 : 22); p++) {
      const col = enemy.palette[Math.floor(Math.random() * (enemy.palette.length - 1)) + 1];
      this.particles.push({
        x: enemy.x + Math.random() * enemy.width,
        y: enemy.y + Math.random() * enemy.height,
        vx: (Math.random() - 0.5) * (isBoss ? 16 : 10),
        vy: (Math.random() - 0.5) * (isBoss ? 16 : 10),
        size: 4 + Math.random() * 4,
        color: col,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 20,
        gravity: 0.2,
        isPixel: true
      });
    }

    this.camera.shake = isBoss ? 24 : 7;
    this.enemies.splice(index, 1);

    if (isBoss) {
      this.stats.bossActive = false;
      this.stats.bossHealth = 0;
      if (!this.exitPortal.active) {
        this.exitPortal.active = true;
        this.addFloatingText(this.player.x + 160, 200, '✨ ¡PORTAL DIMENSIONAL ACTIVADO! ✨', '#00f0ff', 2.2);
        this.camera.shake = 28;
      }
    }
  }

  private completeLevel() {
    if (this.isLevelCompleting) return;
    this.isLevelCompleting = true;
    sound.playLevelComplete();
    this.camera.shake = 20;

    // Portal entry burst particles
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: this.exitPortal.x,
        y: this.exitPortal.y,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        size: 3 + Math.random() * 4,
        color: this.levelConfig.theme.portalColor,
        alpha: 1,
        life: 0,
        maxLife: 45,
        gravity: 0,
        isPixel: true
      });
    }

    const completionBonus = this.currentLevel * 1000;
    const healthBonus = Math.round(this.player.health * 10);
    const scoreGained = (this.stats.score - this.levelStartScore) + completionBonus + healthBonus;
    this.stats.score += completionBonus + healthBonus;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('neon_cube_highscore', this.stats.highScore.toString());
    }

    const isGameComplete = this.currentLevel === 20;
    if (isGameComplete) {
      sound.playVictory();
    }

    // Unlock next level in persistence
    if (this.currentLevel < 20) {
      this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, this.currentLevel + 1);
      localStorage.setItem('neon_cube_unlocked_level', this.maxUnlockedLevel.toString());
      this.stats.maxUnlockedLevel = this.maxUnlockedLevel;
    }

    const summary: LevelSummary = {
      level: this.currentLevel,
      levelName: this.levelConfig.name,
      scoreGained,
      totalScore: this.stats.score,
      kills: this.stats.kills - this.levelStartKills,
      maxCombo: this.stats.maxCombo,
      healthBonus,
      completionBonus,
      isGameComplete
    };

    if (this.onLevelComplete) {
      this.onLevelComplete(summary);
    }
  }

  private spawnEnemyImpactParticles(x: number, y: number, palette: string[]) {
    for (let i = 0; i < 7; i++) {
      const col = palette[Math.floor(Math.random() * (palette.length - 1)) + 1];
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 3 + Math.random() * 2,
        color: col,
        alpha: 1,
        life: 0,
        maxLife: 18,
        gravity: 0.1,
        isPixel: true
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1) {
    this.floatingTexts.push({
      id: ++this.textIdCounter,
      x,
      y,
      text,
      color,
      alpha: 1,
      scale,
      life: 0,
      maxLife: 45
    });
  }

  private resetCombo() {
    this.stats.combo = 0;
    this.stats.multiplier = 1;
    this.stats.comboTimer = 0;
  }

  // --- RENDERING PIPELINE ---
  public render() {
    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;
    const theme = this.levelConfig.theme;

    // Apply Camera Shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.camera.shake > 0) {
      shakeX = (Math.random() - 0.5) * this.camera.shake;
      shakeY = (Math.random() - 0.5) * this.camera.shake;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. SYNTHWAVE SKY GRADIENT (Themed per level)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, theme.skyColors[0]);
    skyGrad.addColorStop(0.35, theme.skyColors[1]);
    skyGrad.addColorStop(0.65, theme.skyColors[2]);
    skyGrad.addColorStop(1, theme.skyColors[3]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. RETRO SYNTH SUN with horizontal sliced scanlines (Themed per level)
    const sunScreenX = width * 0.7 - this.camera.x * 0.05;
    const sunScreenY = height * 0.38;
    const sunRadius = 90;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sunScreenX, sunScreenY, sunRadius, 0, Math.PI * 2);
    ctx.clip();

    const sunGrad = ctx.createLinearGradient(sunScreenX, sunScreenY - sunRadius, sunScreenX, sunScreenY + sunRadius);
    sunGrad.addColorStop(0, theme.sunColors[0]);
    sunGrad.addColorStop(0.5, theme.sunColors[1]);
    sunGrad.addColorStop(1, theme.sunColors[2]);
    ctx.fillStyle = sunGrad;
    ctx.fillRect(sunScreenX - sunRadius, sunScreenY - sunRadius, sunRadius * 2, sunRadius * 2);

    // Sun horizontal scanline cuts matching level deep tone
    ctx.fillStyle = theme.skyColors[0];
    for (let sl = 10; sl < sunRadius * 2; sl += 14) {
      const cutHeight = 2 + (sl / (sunRadius * 2)) * 6;
      ctx.fillRect(sunScreenX - sunRadius, sunScreenY - sunRadius + sl, sunRadius * 2, cutHeight);
    }
    ctx.restore();

    // 3. WIREFRAME NEON MOUNTAINS (Parallax background)
    this.renderNeonMountains(ctx, width, height);

    // 4. SYNTHWAVE PERSPECTIVE DIGITAL GRID (Horizon floor)
    this.renderPerspectiveGrid(ctx, width, height);

    // Camera Translation for Game World
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // 5. PLATFORMS
    this.renderPlatforms(ctx);

    // 5.5 EXIT PORTAL (Quantum Gate to next level)
    this.renderExitPortal(ctx);

    // 6. HAZARDS (Neon Triangular Spikes & Spinning Buzzsaws)
    this.renderHazards(ctx);

    // 7. PARTICLES
    this.renderParticles(ctx);

    // 8. BULLETS & PROJECTILES
    this.renderBullets(ctx);

    // 9. ENEMIES (Pixelated monsters & flying insects)
    this.renderEnemies(ctx);

    // 10. MAIN HERO: GLOWING CYAN GEOMETRIC CUBE WITH LIMBS & BLASTER
    this.renderPlayer(ctx);

    // 11. FLOATING DAMAGE & COMBO TEXTS
    this.renderFloatingTexts(ctx);

    ctx.restore(); // Restore camera transform

    // 12. CRT SCANLINES & VIGNETTE OVERLAY
    this.renderCRTPostProcess(ctx, width, height);

    ctx.restore(); // Restore camera shake
  }

  private renderNeonMountains(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const horizonY = height * 0.58;
    const parallaxOffset = this.camera.x * 0.12;
    const theme = this.levelConfig.theme;

    ctx.save();
    ctx.strokeStyle = theme.mountainColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.mountainColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= width + 60; x += 40) {
      const worldX = x + parallaxOffset;
      const peakY = horizonY - 45 - Math.sin(worldX * 0.008) * 35 - Math.cos(worldX * 0.02) * 20;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Neon glow line along horizon
    ctx.strokeStyle = theme.horizonGlow;
    ctx.shadowColor = theme.horizonGlow;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();
    ctx.restore();
  }

  private renderPerspectiveGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const horizonY = height * 0.58;
    const gridBottomY = height;
    const theme = this.levelConfig.theme;

    ctx.save();
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1.5;

    // Vanishing point in the horizon center
    const vpX = width * 0.5 - (this.camera.x * 0.05) % 200;

    // Perspective converging vertical lines
    for (let x = -width; x <= width * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(x, gridBottomY);
      ctx.stroke();
    }

    // Perspective horizontal lines moving forward with high speed
    ctx.strokeStyle = theme.gridFloorColor;
    ctx.shadowColor = theme.accentColor;
    ctx.shadowBlur = 6;
    for (let i = 0; i < 18; i++) {
      const progress = ((i * 12 + this.gridOffset) % 200) / 200;
      // Non-linear spacing for 3D perspective depth
      const y = horizonY + Math.pow(progress, 2.2) * (gridBottomY - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    const theme = this.levelConfig.theme;
    for (const plat of this.platforms) {
      // Cull offscreen platforms
      if (plat.x + plat.width < this.camera.x || plat.x > this.camera.x + this.canvas.width) continue;

      ctx.save();
      // Platform body
      ctx.fillStyle = theme.platformBodyColor;
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Neon top rail
      ctx.strokeStyle = plat.type === 'moving' ? '#ffe600' : theme.platformTopColor;
      ctx.lineWidth = plat.type === 'moving' ? 3.5 : 3;
      ctx.shadowColor = plat.type === 'moving' ? '#ffe600' : theme.platformTopColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(plat.x, plat.y);
      ctx.lineTo(plat.x + plat.width, plat.y);
      ctx.stroke();

      // Moving platform kinematic indicator
      if (plat.type === 'moving') {
        ctx.fillStyle = '#ffe600';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 6;
        const midX = plat.x + plat.width / 2;
        const midY = plat.y + 10;
        ctx.beginPath();
        ctx.arc(midX - 14, midY, 2.5, 0, Math.PI * 2);
        ctx.arc(midX, midY, 3.5, 0, Math.PI * 2);
        ctx.arc(midX + 14, midY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cyber digital grid texture inside platform
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      for (let px = plat.x; px < plat.x + plat.width; px += 24) {
        ctx.beginPath();
        ctx.moveTo(px, plat.y);
        ctx.lineTo(px, plat.y + plat.height);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderExitPortal(ctx: CanvasRenderingContext2D) {
    const portal = this.exitPortal;
    const theme = this.levelConfig.theme;
    const color = portal.active ? theme.portalColor : '#ff0055';

    ctx.save();
    ctx.translate(portal.x, portal.y);

    // Glowing vertical light beacon to the sky
    const beamGrad = ctx.createLinearGradient(0, 0, 0, -450);
    beamGrad.addColorStop(0, portal.active ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 0, 85, 0.3)');
    beamGrad.addColorStop(0.7, portal.active ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 0, 85, 0.08)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-22, -450, 44, 450);

    // Outer rotating octagonal ring
    ctx.rotate(portal.angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    const sides = 8;
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const rx = Math.cos(a) * portal.radius;
      const ry = Math.sin(a) * portal.radius;
      if (s === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();

    // Counter-rotating inner ring
    ctx.rotate(-portal.angle * 2.2);
    ctx.strokeStyle = portal.active ? '#ffe600' : '#ff3366';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Center quantum vortex
    const vortexGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, portal.radius * 0.5);
    vortexGrad.addColorStop(0, '#ffffff');
    vortexGrad.addColorStop(0.4, color);
    vortexGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Portal Status floating label above
    ctx.save();
    ctx.font = 'bold 11px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    if (portal.active) {
      ctx.fillText(`PORTAL NEÓN [NIVEL ${this.currentLevel}]`, portal.x, portal.y - portal.radius - 22);
      ctx.font = '9px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ENTRA PARA COMPLETAR EL NIVEL', portal.x, portal.y - portal.radius - 9);
    } else {
      ctx.fillText('⚠️ PORTAL BLOQUEADO', portal.x, portal.y - portal.radius - 20);
      ctx.font = '9px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#ff8899';
      ctx.fillText('DERROTA AL JEFE PARA ABRIR', portal.x, portal.y - portal.radius - 8);
    }
    ctx.restore();
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const haz of this.hazards) {
      if (haz.x + haz.width < this.camera.x - 50 || haz.x > this.camera.x + this.canvas.width + 50) continue;

      ctx.save();
      if (haz.type === 'spike') {
        // TRIANGULAR NEON SPIKE (Glowing magenta/pink with electric core)
        const peakX = haz.x + haz.width / 2;
        const peakY = haz.y;
        const leftX = haz.x;
        const leftY = haz.y + haz.height;
        const rightX = haz.x + haz.width;
        const rightY = haz.y + haz.height;

        // Outer glow path
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 0, 127, 0.3)';
        ctx.fill();

        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Inner glowing core spike
        ctx.beginPath();
        ctx.moveTo(leftX + 4, leftY);
        ctx.lineTo(peakX, peakY + 6);
        ctx.lineTo(rightX - 4, rightY);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.fill();
      } else if (haz.type === 'buzzsaw') {
        // ROTATING CIRCULAR BUZZSAW
        ctx.translate(haz.x, haz.y);
        ctx.rotate(haz.angle);

        const r = haz.radius;
        const teeth = 12;

        // Spinning saw blade
        ctx.beginPath();
        for (let t = 0; t < teeth; t++) {
          const a1 = (Math.PI * 2 * t) / teeth;
          const a2 = a1 + (Math.PI * 2) / teeth / 2;
          const toothOuterR = r + 7;
          const toothInnerR = r - 4;

          const x1 = Math.cos(a1) * toothInnerR;
          const y1 = Math.sin(a1) * toothInnerR;
          const x2 = Math.cos(a2) * toothOuterR;
          const y2 = Math.sin(a2) * toothOuterR;

          if (t === 0) ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(Math.cos(a1 + (Math.PI * 2) / teeth) * toothInnerR, Math.sin(a1 + (Math.PI * 2) / teeth) * toothInnerR);
        }
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 170, 0, 0.25)';
        ctx.fill();

        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Center neon hub
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#110022';
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Center glowing nut
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

    // Ghost trails when dashing
    for (const ghost of p.ghostTrails) {
      ctx.save();
      ctx.translate(ghost.x - (p.x + p.width / 2), ghost.y - (p.y + p.height / 2));
      ctx.fillStyle = `rgba(0, 240, 255, ${ghost.alpha * 0.4})`;
      ctx.strokeStyle = `rgba(0, 240, 255, ${ghost.alpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }

    // Flip horizontally if facing left
    if (!p.facingRight) {
      ctx.scale(-1, 1);
    }

    // Invulnerability flashing
    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer / 3) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 1. ANIMATED LIMBS (Legs)
    const legLength = 12;
    const isRunning = Math.abs(p.vx) > 0.5 && p.isGrounded;
    const legPhase = p.runCycle;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    // Back leg
    const backLegAngle = p.isGrounded ? (isRunning ? Math.sin(legPhase) * 0.7 : 0.1) : -0.5;
    ctx.beginPath();
    ctx.moveTo(-6, p.height / 2 - 4);
    ctx.lineTo(-6 + Math.sin(backLegAngle) * legLength, p.height / 2 + Math.cos(backLegAngle) * legLength);
    ctx.stroke();

    // Front leg
    const frontLegAngle = p.isGrounded ? (isRunning ? -Math.sin(legPhase) * 0.7 : -0.1) : 0.6;
    ctx.beginPath();
    ctx.moveTo(6, p.height / 2 - 4);
    ctx.lineTo(6 + Math.sin(frontLegAngle) * legLength, p.height / 2 + Math.cos(frontLegAngle) * legLength);
    ctx.stroke();

    // 2. MAIN CUBE BODY (Glowing Cyan Geometric Cube)
    const size = p.width;
    const half = size / 2;

    // Outer neon glow box
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.fillRect(-half, -half, size, size);

    // Solid geometric cube core
    ctx.fillStyle = '#05192d';
    ctx.fillRect(-half + 2, -half + 2, size - 4, size - 4);

    // Neon cyan borders & beveled highlight
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-half, -half, size, size);

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(-half + 8, -half + 8, size - 16, size - 16);

    // Digital Visor / Eye that tracks aim
    const eyeOffsetX = 4;
    const eyeOffsetY = -2;
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    ctx.fillRect(eyeOffsetX, eyeOffsetY, 10, 4);

    // 3. FUTURISTIC NEON BLASTER WEAPON
    const weapon = WEAPONS[p.activeWeapon];
    // Blaster aiming relative to facing
    const weaponAngle = p.facingRight ? p.aimAngle : Math.PI - p.aimAngle;

    ctx.save();
    ctx.translate(4, 2);
    ctx.rotate(weaponAngle);

    // Robotic Arm holding weapon
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(4, 4);
    ctx.stroke();

    // Futuristic Gun body
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(4, -4, 22, 9);

    ctx.strokeStyle = weapon.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = weapon.color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(4, -4, 22, 9);

    // Energy rail / emitter glow on gun barrel
    ctx.fillStyle = weapon.color;
    ctx.fillRect(16, -2, 10, 5);

    // Muzzle tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, -3, 3, 7);

    ctx.restore();

    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const enemy of this.enemies) {
      if (enemy.x + enemy.width < this.camera.x - 50 || enemy.x > this.camera.x + this.canvas.width + 50) continue;

      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      if (!enemy.facingRight) {
        ctx.scale(-1, 1);
      }

      // Procedural Pixel Art Rendering
      const grid = enemy.pixelGrid;
      const rows = grid.length;
      const cols = grid[0].length;
      const pixelSize = enemy.width / cols;

      ctx.translate(-enemy.width / 2, -enemy.height / 2);

      // Insect flapping wings if wasp
      if (enemy.type === 'wasp') {
        const wingFlap = Math.sin(enemy.animTick * 0.8) * 6;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(cols * pixelSize * 0.2, -wingFlap, pixelSize * 3, pixelSize * 2);
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const colorIndex = grid[r][c];
          if (colorIndex > 0) {
            const col = enemy.palette[colorIndex];
            ctx.fillStyle = col;

            // Eyes / glow pixels receive shadow blur
            if (colorIndex === 3) {
              ctx.shadowColor = col;
              ctx.shadowBlur = 6;
            } else {
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
          }
        }
      }

      // Enemy Health Bar (if damaged)
      if (enemy.health < enemy.maxHealth) {
        const hpWidth = enemy.width;
        const hpHeight = 4;
        const hpPercent = enemy.health / enemy.maxHealth;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, -8, hpWidth, hpHeight);

        ctx.fillStyle = enemy.type === 'queen_boss' ? '#ff0055' : '#00f0ff';
        ctx.fillRect(0, -8, hpWidth * hpPercent, hpHeight);
      }

      ctx.restore();
    }
  }

  private renderBullets(ctx: CanvasRenderingContext2D) {
    for (const b of this.bullets) {
      ctx.save();

      // Bullet trail
      if (b.trail.length > 1) {
        ctx.strokeStyle = b.glowColor;
        ctx.lineWidth = b.radius * 1.5;
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.stroke();
      }

      // Glowing Bullet Core
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer color halo
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.isPixel) {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = `bold ${Math.round(16 * t.scale)}px "Orbitron", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  private renderCRTPostProcess(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Subtle CRT scanlines
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // Radial vignette for cinematic arcade cabinet feel
    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.7);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // --- GAME LOOP LIFECYCLE ---
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    sound.startMusic();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - this.lastTime, 100);
      this.lastTime = currentTime;

      this.update(deltaTime);
      this.render();

      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sound.stopMusic();
  }

  public restart() {
    this.player = this.createPlayer();
    this.stats.score = 0;
    this.stats.combo = 0;
    this.stats.kills = 0;
    this.stats.multiplier = 1;
    this.stats.distance = 0;
    this.initLevel(this.currentLevel);
    if (!this.isRunning) {
      this.start();
    }
  }

  public restartCurrentLevel() {
    this.player = this.createPlayer();
    this.stats.combo = 0;
    this.stats.multiplier = 1;
    this.initLevel(this.currentLevel);
    if (!this.isRunning) {
      this.start();
    }
  }

  public loadLevel(levelNum: number) {
    this.player = this.createPlayer();
    this.stats.combo = 0;
    this.stats.multiplier = 1;
    this.initLevel(levelNum);
    if (!this.isRunning) {
      this.start();
    }
  }

  public nextLevel() {
    if (this.currentLevel < 20) {
      this.loadLevel(this.currentLevel + 1);
    } else {
      this.loadLevel(1);
    }
  }

  // --- SCREENSHOT CAPTURE (Captura de pantalla) ---
  public captureScreenshot(): string {
    // Render an instantaneous crisp frame and export high quality PNG
    this.render();
    return this.canvas.toDataURL('image/png');
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
