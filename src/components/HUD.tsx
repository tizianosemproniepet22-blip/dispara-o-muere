import React from 'react';
import { Award, Camera, Crosshair, Flame, Heart, Map, Shield, Skull, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';
import { sound } from '../audio/synthAudio';
import { WEAPONS } from '../game/constants';
import { GameStats, Player, WeaponType } from '../types';

interface HUDProps {
  stats: GameStats;
  player: Player;
  isMuted: boolean;
  onToggleMute: () => void;
  onTakeScreenshot: () => void;
  onOpenGallery: () => void;
  onOpenLevelSelect?: () => void;
  onSelectWeapon: (weapon: WeaponType) => void;
  onDash: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  player,
  isMuted,
  onToggleMute,
  onTakeScreenshot,
  onOpenGallery,
  onOpenLevelSelect,
  onSelectWeapon,
  onDash
}) => {
  const currentWeapon = WEAPONS[player.activeWeapon];
  const hpPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100));
  const comboPercent = stats.maxComboTimer > 0 ? (stats.comboTimer / stats.maxComboTimer) * 100 : 0;
  const bossHpPercent = stats.bossMaxHealth > 0 ? Math.max(0, Math.min(100, (stats.bossHealth / stats.bossMaxHealth) * 100)) : 0;

  // Combo tier names
  const getComboTitle = (combo: number) => {
    if (combo >= 15) return 'SYNTH GOD';
    if (combo >= 10) return 'ULTRA RAMPAGE';
    if (combo >= 6) return 'NEON OVERLOAD';
    if (combo >= 3) return 'CYBER STRIKE';
    return 'ACTIVE';
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-['Orbitron'] select-none">
      {/* TOP ROW: Health, Level Progress, Combo, Boss Bar, and Actions */}
      <div className="flex items-start justify-between gap-4">
        {/* Top Left: Health & Shield Bar + Player Status */}
        <div className="flex flex-col gap-2">
          {/* Health Bar Container */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center -skew-x-6 border-2 border-cyan-400 bg-[#0a0212]/95 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="skew-x-6">
                <Heart className={`h-5 w-5 ${player.health < 30 ? 'animate-pulse text-red-500' : 'text-cyan-400'}`} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs tracking-widest text-cyan-300">
                <span className="font-bold">SYSTEM INTEGRITY</span>
                <span>{Math.round(player.health)}%</span>
              </div>
              <div className="h-4 w-52 overflow-hidden -skew-x-6 border border-cyan-500/60 bg-[#0a0212]/90 p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-cyan-400 transition-all duration-150 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Shield Bar */}
              <div className="h-2 w-52 overflow-hidden -skew-x-6 border border-blue-500/50 bg-[#0a0212]/90 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-300 transition-all duration-150"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Level Progress Indicator */}
          <div className="flex flex-col gap-1 -skew-x-6 border border-cyan-900/60 bg-[#0a0212]/90 p-2 shadow-[0_0_15px_rgba(0,240,255,0.15)] w-52">
            <div className="skew-x-6 flex items-center justify-between text-[10px] text-slate-300">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-400" />
                NVL {stats.currentLevel || 1}/20
              </span>
              <span className={stats.isPortalActive ? 'text-cyan-300 font-bold animate-pulse' : 'text-slate-400'}>
                {stats.isPortalActive ? 'PORTAL ACTIVO' : `${stats.levelProgress || 0}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${stats.isPortalActive ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-gradient-to-r from-cyan-600 to-pink-500'}`}
                style={{ width: `${stats.levelProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Dash Cooldown Indicator */}
          <div className="flex items-center gap-2 -skew-x-6 border border-cyan-900/40 bg-[#0a0212]/85 px-2.5 py-0.5 text-[10px] tracking-wider text-slate-300 w-fit">
            <div className="flex items-center gap-2 skew-x-6">
              <Zap className={`h-3.5 w-3.5 ${player.dashCooldown <= 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`} />
              <span>DASH: {player.dashCooldown <= 0 ? 'READY (SHIFT / RMB)' : 'RECHARGING...'}</span>
            </div>
          </div>
        </div>

        {/* Center: Boss Bar OR Combo Multiplier */}
        <div className="flex flex-col items-center gap-2">
          {/* Active Boss Health Bar */}
          {stats.bossActive && stats.bossMaxHealth > 0 && (
            <div className="flex flex-col items-center -skew-x-6 border-2 border-red-500 bg-[#120216]/95 px-5 py-2 shadow-[0_0_35px_rgba(255,0,60,0.6)] animate-pulse">
              <div className="flex items-center gap-2 skew-x-6">
                <Skull className="h-4 w-4 text-red-500 animate-spin" />
                <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                  {stats.bossName || 'AMENAZA TITÁNICA'}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {Math.round(stats.bossHealth)} / {stats.bossMaxHealth}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-64 overflow-hidden border border-red-900 bg-[#0a0212] p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 via-pink-600 to-red-600 transition-all duration-100 shadow-[0_0_12px_#ff0055]"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* High-Impact Combo Multiplier Counter */}
          {stats.combo > 1 && (
            <div className="flex flex-col items-center animate-bounce">
              <div className="flex items-center gap-2 -skew-x-6 border-2 border-pink-500/80 bg-[#0a0212]/95 px-5 py-1.5 shadow-[0_0_30px_rgba(255,0,127,0.5)]">
                <div className="flex items-center gap-2 skew-x-6">
                  <Flame className="h-5 w-5 text-pink-500 animate-pulse" />
                  <span className="text-xl font-black tracking-widest text-pink-400">
                    x{stats.multiplier} COMBO!
                  </span>
                  <span className="ml-1 -skew-x-6 border border-pink-500/50 bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300 uppercase">
                    <span className="inline-block skew-x-6">{getComboTitle(stats.combo)}</span>
                  </span>
                </div>
              </div>
              {/* Combo Decay Bar */}
              <div className="mt-1.5 h-1.5 w-44 overflow-hidden -skew-x-6 border border-pink-500/40 bg-[#0a0212]">
                <div
                  className="h-full bg-pink-500 shadow-[0_0_8px_#ff007f] transition-all duration-75"
                  style={{ width: `${comboPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Score Counter & Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Score Display */}
          <div className="flex flex-col items-end -skew-x-6 border-2 border-cyan-500/60 bg-[#0a0212]/95 px-5 py-2 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
            <div className="flex flex-col items-end skew-x-6">
              <span className="text-[10px] tracking-widest text-cyan-400/90 uppercase">SYNTH SCORE</span>
              <span className="text-2xl font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                {stats.score.toLocaleString().padStart(6, '0')}
              </span>
              <span className="text-[9px] text-slate-400">
                RECORD: {stats.highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons (NIVELES, Captura de pantalla, Mute, Concept 8K) */}
          <div className="pointer-events-auto flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                id="hud-levels-btn"
                onClick={onOpenLevelSelect}
                className="group flex items-center gap-1.5 -skew-x-6 border border-yellow-400/80 bg-[#1e1505]/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-[0_0_15px_rgba(255,230,0,0.3)] transition hover:scale-105 hover:bg-yellow-400 hover:text-black cursor-pointer active:scale-95"
                title="Seleccionar Nivel (1 a 20)"
              >
                <div className="flex items-center gap-1.5 skew-x-6">
                  <Map className="h-3.5 w-3.5 text-yellow-400 group-hover:text-black" />
                  <span>NIVELES (20)</span>
                </div>
              </button>
            )}

            <button
              id="hud-screenshot-btn"
              onClick={onTakeScreenshot}
              className="group flex items-center gap-1.5 -skew-x-6 border border-cyan-400 bg-[#0a1524]/90 px-3.5 py-1.5 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition hover:scale-105 hover:bg-cyan-500 hover:text-black cursor-pointer active:scale-95"
              title="Captura de Pantalla instantánea (C)"
            >
              <div className="flex items-center gap-1.5 skew-x-6">
                <Camera className="h-3.5 w-3.5" />
                <span>CAPTURA</span>
              </div>
            </button>

            <button
              id="hud-gallery-btn"
              onClick={onOpenGallery}
              className="group flex items-center gap-1.5 -skew-x-6 border border-pink-500/80 bg-[#1c0424]/90 px-3.5 py-1.5 text-xs font-bold text-pink-300 shadow-[0_0_15px_rgba(255,0,127,0.3)] transition hover:scale-105 hover:bg-pink-500 hover:text-white cursor-pointer active:scale-95"
              title="Ver Arte 8K & Galería"
            >
              <div className="flex items-center gap-1.5 skew-x-6">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                <span>ARTE 8K</span>
              </div>
            </button>

            <button
              id="hud-mute-btn"
              onClick={onToggleMute}
              className="flex h-8 w-8 items-center justify-center -skew-x-6 border border-slate-700 bg-[#0a0212]/90 text-slate-300 shadow transition hover:border-cyan-400 hover:text-cyan-400 cursor-pointer active:scale-95"
              title={isMuted ? 'Activar Sonido Synth' : 'Silenciar'}
            >
              <div className="skew-x-6">
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Futuristic Weapon Arsenal Bar & Controls Helper */}
      <div className="flex items-end justify-between">
        {/* Weapon Selection Slots */}
        <div className="pointer-events-auto flex items-center gap-2 -skew-x-6 border border-cyan-500/40 bg-[#0a0212]/95 p-2 shadow-[0_0_25px_rgba(0,240,255,0.18)] backdrop-blur-md">
          {(['BLASTER', 'SPREAD', 'PLASMA', 'RAILGUN'] as WeaponType[]).map((wType, index) => {
            const w = WEAPONS[wType];
            const isActive = player.activeWeapon === wType;
            return (
              <button
                key={wType}
                id={`weapon-slot-${wType.toLowerCase()}`}
                onClick={() => onSelectWeapon(wType)}
                className={`flex flex-col items-center gap-0.5 border px-3.5 py-1.5 transition cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                    : 'border-slate-800 bg-[#0d041c]/60 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1 skew-x-6">
                  <span className="text-[10px] font-bold text-slate-500">[{index + 1}]</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isActive ? w.color : undefined }}
                  >
                    {w.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400 skew-x-6">
                  <span>DMG {w.damage}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls helper tooltip */}
        <div className="hidden md:flex items-center gap-3 -skew-x-6 border border-cyan-900/60 bg-[#0a0212]/90 px-4 py-1.5 text-[11px] text-cyan-200/80 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <div className="flex items-center gap-3 skew-x-6">
            <span>[A/D] Correr</span>
            <span>•</span>
            <span>[W / ESPACIO] Saltar</span>
            <span>•</span>
            <span>[MOUSE] Apuntar / Disparar</span>
            <span>•</span>
            <span>[SHIFT] Dash Neón</span>
            <span>•</span>
            <span>[1-4 / Q,E] Armas</span>
            <span>•</span>
            <span>[C] Captura</span>
          </div>
        </div>
      </div>
    </div>
  );
};
