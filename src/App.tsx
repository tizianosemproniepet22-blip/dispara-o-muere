import React, { useEffect, useRef, useState } from 'react';
import { Camera, Map, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sound } from './audio/synthAudio';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { TouchControls } from './components/TouchControls';
import { GameEngine } from './game/GameEngine';
import { GameStats, LevelSummary, Player, WeaponType } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [levelSummary, setLevelSummary] = useState<LevelSummary | null>(null);
  const [liveCaptureUrl, setLiveCaptureUrl] = useState<string | null>(null);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('neon_cube_unlocked_level');
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    maxComboTimer: 180,
    multiplier: 1,
    kills: 0,
    wave: 1,
    distance: 0,
    currentLevel: 1,
    maxUnlockedLevel: 1,
    levelProgress: 0,
    isPortalActive: true,
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0
  });

  const [playerState, setPlayerState] = useState<Player>({
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
  });

  // Initialize Game Engine on Canvas Mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle initial resize
    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (engineRef.current) {
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    // Hook stats update
    engine.onStatsUpdate = (newStats, newPlayer) => {
      setStats({ ...newStats });
      setPlayerState({ ...newPlayer });
    };

    // Hook game over
    engine.onGameOver = () => {
      setIsGameOver(true);
    };

    // Hook level complete
    engine.onLevelComplete = (summary) => {
      setLevelSummary(summary);
      if (summary.level < 20) {
        setMaxUnlockedLevel((prev) => Math.max(prev, summary.level + 1));
      }
    };

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey for Screenshot (C key)
      if (e.code === 'KeyC') {
        takeScreenshot();
        return;
      }

      if (e.code === 'KeyM') {
        toggleMute();
        return;
      }

      engine.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.code);
    };

    const handleMouseMove = (e: MouseEvent) => {
      engine.handleMouseMove(e.clientX, e.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!hasStarted) {
        setHasStarted(true);
        sound.init();
        engine.start();
      }
      engine.handleMouseDown(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      engine.handleMouseUp(e);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Allow right click for dashing
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    // Initial render single frame for backdrop
    engine.render();

    return () => {
      engine.stop();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const startGame = () => {
    setHasStarted(true);
    sound.init();
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const restartGame = () => {
    setIsGameOver(false);
    if (engineRef.current) {
      engineRef.current.restart();
    }
  };

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const takeScreenshot = () => {
    if (engineRef.current) {
      const snapUrl = engineRef.current.captureScreenshot();
      setLiveCaptureUrl(snapUrl);
      setIsScreenshotModalOpen(true);
    }
  };

  const openGallery = () => {
    setIsScreenshotModalOpen(true);
  };

  const selectWeapon = (wType: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.setWeapon(wType);
    }
  };

  const doDash = () => {
    if (engineRef.current) {
      engineRef.current.doDash();
    }
  };

  const handleNextLevel = () => {
    setLevelSummary(null);
    if (engineRef.current) {
      engineRef.current.nextLevel();
    }
  };

  const handleReplayLevel = () => {
    setLevelSummary(null);
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  const handleSelectLevel = (levelNum: number) => {
    setIsLevelSelectOpen(false);
    setLevelSummary(null);
    setIsGameOver(false);
    if (!hasStarted) {
      setHasStarted(true);
      sound.init();
    }
    if (engineRef.current) {
      engineRef.current.loadLevel(levelNum);
    }
  };

  // Touch handlers
  const handleTouchLeft = (pressed: boolean) => {
    if (!engineRef.current) return;
    if (pressed) {
      engineRef.current.handleKeyDown('KeyA');
    } else {
      engineRef.current.handleKeyUp('KeyA');
    }
  };

  const handleTouchRight = (pressed: boolean) => {
    if (!engineRef.current) return;
    if (pressed) {
      engineRef.current.handleKeyDown('KeyD');
    } else {
      engineRef.current.handleKeyUp('KeyD');
    }
  };

  const handleTouchJump = () => {
    if (engineRef.current) {
      engineRef.current.doJump();
    }
  };

  const handleTouchFire = (pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = pressed;
    }
  };

  const handleTouchNextWeapon = () => {
    if (engineRef.current) {
      engineRef.current.cycleWeapon(1);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0212] geo-bg select-none">
      {/* 2D Canvas Viewport */}
      <canvas
        id="game-viewport"
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair"
      />

      {/* In-Game HUD matching user requirements */}
      {hasStarted && !isGameOver && (
        <HUD
          stats={stats}
          player={playerState}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onTakeScreenshot={takeScreenshot}
          onOpenGallery={openGallery}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onSelectWeapon={selectWeapon}
          onDash={doDash}
        />
      )}

      {/* Mobile / Touch Controls overlay */}
      {hasStarted && !isGameOver && (
        <TouchControls
          onMoveLeft={handleTouchLeft}
          onMoveRight={handleTouchRight}
          onJump={handleTouchJump}
          onFire={handleTouchFire}
          onDash={doDash}
          onNextWeapon={handleTouchNextWeapon}
        />
      )}

      {/* Start Screen Overlay (if game hasn't started yet) */}
      {!hasStarted && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0a0212]/80 backdrop-blur-md p-4 font-['Orbitron']">
          <div className="relative flex max-w-xl flex-col items-center border-2 border-cyan-500/70 bg-[#0a0212]/95 p-8 text-center shadow-[0_0_60px_rgba(0,240,255,0.25)] geo-chamfer">
            {/* Top decorative geometric corner lines */}
            <div className="pointer-events-none absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-pink-500" />

            <div className="mb-3 inline-flex items-center gap-2 border border-pink-500/60 bg-[#160324] px-4 py-1 text-xs font-bold tracking-widest text-pink-400 geo-chamfer-sm -skew-x-6 shadow-[0_0_12px_rgba(255,0,127,0.2)]">
              <div className="flex items-center gap-2 skew-x-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>SYNTHWAVE 2D ACTION PLATFORMER • 20 NIVELES</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(0,240,255,0.7)]">
              NEON CUBE PLATFORMER
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-cyan-200/90 leading-relaxed max-w-md font-['Chakra_Petch']">
              Controla el <strong>cubo de neón cian</strong> con extremidades, salta sobre <strong>pinchos triangulares</strong> y <strong>sierras circulares</strong> mientras disparas proyectiles de energía a la <strong>horda de monstruos pixelados</strong> en <strong>20 niveles</strong> synthwave con jefes épicos y portales dimensionales.
            </p>

            <div className="my-5 flex flex-wrap justify-center gap-2.5 text-xs text-slate-300 font-['Chakra_Petch']">
              <span className="-skew-x-6 border border-cyan-500/40 bg-[#120424]/90 px-3 py-1 text-cyan-200/90 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                <span className="inline-block skew-x-6">WASD / Flechas: Mover y Saltar</span>
              </span>
              <span className="-skew-x-6 border border-cyan-500/40 bg-[#120424]/90 px-3 py-1 text-cyan-200/90 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                <span className="inline-block skew-x-6">Click Izq: Disparar Plasma</span>
              </span>
              <span className="-skew-x-6 border border-pink-500/40 bg-[#120424]/90 px-3 py-1 text-pink-200/90 shadow-[0_0_10px_rgba(255,0,127,0.15)]">
                <span className="inline-block skew-x-6">Shift / Click Der: Dash Neón</span>
              </span>
              <span className="-skew-x-6 border border-cyan-500/40 bg-[#120424]/90 px-3 py-1 text-cyan-200/90 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                <span className="inline-block skew-x-6">Teclas 1-4: Cambiar Armas</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                id="start-game-btn"
                onClick={startGame}
                className="flex items-center justify-center gap-2 -skew-x-6 border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3 text-sm font-black text-black shadow-[0_0_25px_rgba(0,240,255,0.5)] transition hover:scale-105 hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2 skew-x-6">
                  <Play className="h-5 w-5 fill-current" />
                  <span>INICIAR JUEGO</span>
                </div>
              </button>

              <button
                id="start-level-select-btn"
                onClick={() => setIsLevelSelectOpen(true)}
                className="flex items-center justify-center gap-2 -skew-x-6 border-2 border-yellow-400/80 bg-[#181102]/90 px-5 py-3 text-xs font-bold text-yellow-300 shadow-[0_0_18px_rgba(255,230,0,0.25)] transition hover:bg-yellow-950/60 hover:text-white cursor-pointer hover:border-yellow-400"
              >
                <div className="flex items-center gap-2 skew-x-6">
                  <Map className="h-4 w-4 text-yellow-400" />
                  <span>MAPA DE NIVELES (20)</span>
                </div>
              </button>

              <button
                id="start-view-screenshot-btn"
                onClick={openGallery}
                className="flex items-center justify-center gap-2 -skew-x-6 border-2 border-pink-500/80 bg-[#180326]/90 px-5 py-3 text-xs font-bold text-pink-300 shadow-[0_0_18px_rgba(255,0,127,0.3)] transition hover:bg-pink-900/60 hover:text-white cursor-pointer hover:border-pink-400"
              >
                <div className="flex items-center gap-2 skew-x-6">
                  <Camera className="h-4 w-4" />
                  <span>CAPTURA 8K</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {levelSummary && (
        <LevelCompleteModal
          summary={levelSummary}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        />
      )}

      {/* Level Select Modal (20 levels) */}
      {isLevelSelectOpen && (
        <LevelSelectModal
          currentLevel={stats.currentLevel || 1}
          maxUnlockedLevel={maxUnlockedLevel}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          stats={stats}
          onRestart={restartGame}
          onOpenScreenshot={openGallery}
        />
      )}

      {/* Screenshot / Photo Mode Modal */}
      <ScreenshotModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        gameCaptureUrl={liveCaptureUrl}
      />
    </div>
  );
}
