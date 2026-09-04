import React from 'react';
import { ArrowRight, Award, CheckCircle2, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import { LevelSummary } from '../types';

interface LevelCompleteModalProps {
  summary: LevelSummary;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelSelect: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  summary,
  onNextLevel,
  onReplayLevel,
  onOpenLevelSelect
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a0212]/85 backdrop-blur-md p-4 font-['Orbitron']">
      <div className="relative flex w-full max-w-lg flex-col items-center border-2 border-cyan-400 bg-[#0a0212]/95 p-6 text-center shadow-[0_0_55px_rgba(0,240,255,0.4)] geo-chamfer">
        {/* Geometric Corner Accents */}
        <div className="pointer-events-none absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-pink-500" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 -skew-x-6 border border-cyan-400/80 bg-cyan-950/60 px-4 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] mb-2">
          <span className="skew-x-6 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            NIVEL {summary.level} / 20 COMPLETADO
          </span>
        </div>

        <div className="mb-1 text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-yellow-300 drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
          {summary.isGameComplete ? '¡VICTORIA TOTAL NEÓN!' : '¡SECTOR CONQUISTADO!'}
        </div>
        <div className="text-xs tracking-widest text-pink-400 uppercase font-['Chakra_Petch']">
          {summary.levelName}
        </div>

        {/* Stats Table */}
        <div className="my-5 flex w-full flex-col gap-2.5 -skew-x-3 border border-cyan-500/40 bg-[#120324]/90 p-4 text-left shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">PUNTOS GANADOS EN EL NIVEL:</span>
            <span className="text-base font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
              +{summary.scoreGained.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">BONIFICACIÓN DE MISIÓN:</span>
            <span className="text-sm font-bold text-yellow-400">
              +{summary.completionBonus.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">BONIFICACIÓN DE SALUD:</span>
            <span className="text-sm font-bold text-emerald-400">
              +{summary.healthBonus.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">ENEMIGOS DERROTADOS:</span>
            <span className="text-sm font-bold text-pink-400">
              {summary.kills}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">MÁXIMO COMBO:</span>
            <span className="text-sm font-bold text-purple-300">
              x{summary.maxCombo}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 skew-x-3">
            <span className="text-xs font-bold text-slate-300">PUNTUACIÓN TOTAL:</span>
            <span className="text-lg font-black text-white drop-shadow-[0_0_10px_rgba(255,230,0,0.8)]">
              {summary.totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2.5">
          {!summary.isGameComplete ? (
            <button
              id="next-level-btn"
              onClick={onNextLevel}
              className="flex w-full items-center justify-center gap-2 -skew-x-6 border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 py-3 text-sm font-black text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] transition hover:scale-102 hover:shadow-[0_0_35px_rgba(0,240,255,0.9)] active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2 skew-x-6">
                <span>AVANZAR AL NIVEL {summary.level + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          ) : (
            <div className="p-3 mb-1 -skew-x-3 border border-yellow-400/60 bg-yellow-950/40 text-xs font-bold text-yellow-300">
              <span className="skew-x-3 inline-block">
                🏆 ¡HAS COMPLETADO LOS 20 NIVELES DEL UNIVERSO SYNTHWAVE!
              </span>
            </div>
          )}

          <div className="flex w-full gap-2">
            <button
              id="replay-level-btn"
              onClick={onReplayLevel}
              className="flex flex-1 items-center justify-center gap-2 -skew-x-6 border border-slate-700 bg-[#160424]/90 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400 hover:text-white cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-1.5 skew-x-6">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>REPETIR NIVEL</span>
              </div>
            </button>

            <button
              id="select-level-btn"
              onClick={onOpenLevelSelect}
              className="flex flex-1 items-center justify-center gap-2 -skew-x-6 border border-pink-500/70 bg-[#160424]/90 py-2.5 text-xs font-bold text-pink-300 transition hover:border-pink-400 hover:text-white cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-1.5 skew-x-6">
                <Award className="h-3.5 w-3.5 text-pink-400" />
                <span>MAPA DE NIVELES (20)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
