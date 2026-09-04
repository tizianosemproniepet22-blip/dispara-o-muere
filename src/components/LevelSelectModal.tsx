import React from 'react';
import { Award, CheckCircle2, Lock, Play, Skull, Sparkles, X } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levels';

interface LevelSelectModalProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  maxUnlockedLevel,
  onSelectLevel,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0212]/90 backdrop-blur-md p-4 font-['Orbitron']">
      <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col border-2 border-cyan-400 bg-[#0a0212]/98 p-6 shadow-[0_0_60px_rgba(0,240,255,0.35)] geo-chamfer overflow-hidden">
        {/* Geometric Corner Accents */}
        <div className="pointer-events-none absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-pink-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-yellow-300">
                MAPA DIMENSIONAL NEÓN
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-['Chakra_Petch']">
              20 SECTORES SINTÉTICOS • PROGRESO DESBLOQUEADO: {Math.min(20, maxUnlockedLevel)} / 20
            </p>
          </div>

          <button
            id="close-level-select-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center -skew-x-6 border border-slate-700 bg-slate-900/80 text-slate-400 transition hover:border-pink-500 hover:text-white cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4 skew-x-6" />
          </button>
        </div>

        {/* 20 Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 overflow-y-auto max-h-[60vh] pr-1">
          {LEVEL_CONFIGS.map((cfg) => {
            const isUnlocked = cfg.level <= maxUnlockedLevel;
            const isCurrent = cfg.level === currentLevel;
            const hasBoss = !!cfg.hasBoss;

            return (
              <button
                key={cfg.level}
                id={`level-card-${cfg.level}`}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(cfg.level)}
                className={`relative flex flex-col p-3 text-left transition border -skew-x-3 cursor-pointer ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400'
                    : isUnlocked
                    ? 'border-pink-500/40 bg-[#120320]/80 hover:border-pink-400 hover:bg-[#1a042e] shadow-[0_0_12px_rgba(255,0,127,0.15)]'
                    : 'border-slate-800/60 bg-[#0c0216]/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="skew-x-3 flex flex-col h-full justify-between">
                  <div>
                    {/* Top line: Level number & Boss/Status badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-black tracking-wider text-white">
                        NVL {cfg.level}
                      </span>
                      {hasBoss && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 border border-red-500/50 bg-red-950/60 px-1.5 py-0.5">
                          <Skull className="h-3 w-3" />
                          <span>JEFE</span>
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Lock className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    {/* Level Title */}
                    <div className="text-xs font-bold text-cyan-300 line-clamp-1">
                      {cfg.name}
                    </div>

                    {/* Subtitle / Description */}
                    <div className="text-[10px] text-slate-400 font-['Chakra_Petch'] line-clamp-2 mt-1">
                      {cfg.subtitle}
                    </div>
                  </div>

                  {/* Footer status / Launch button */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    {isCurrent ? (
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Play className="h-3 w-3 fill-cyan-400" /> JUGANDO
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-pink-400 font-bold group-hover:text-white flex items-center gap-1">
                        <Play className="h-3 w-3" /> INICIAR
                      </span>
                    ) : (
                      <span className="text-slate-600 font-bold">BLOQUEADO</span>
                    )}

                    <span className="text-slate-500 font-mono text-[9px]">
                      {Math.round(cfg.worldWidth / 10)}m
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 border-t border-cyan-950 flex flex-wrap items-center justify-between text-xs text-slate-400 font-['Chakra_Petch']">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-cyan-400 inline-block -skew-x-6" /> Nivel Actual
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-pink-500 inline-block -skew-x-6" /> Desbloqueado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-red-500 inline-block -skew-x-6" /> Batalla de Jefe
            </span>
          </div>

          <span className="text-cyan-400 font-bold">
            Portal al final de cada nivel para avanzar
          </span>
        </div>
      </div>
    </div>
  );
};
