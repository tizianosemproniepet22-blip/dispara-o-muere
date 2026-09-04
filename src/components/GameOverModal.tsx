import React from 'react';
import { Camera, RotateCcw, Trophy, Zap } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenScreenshot: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenScreenshot
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a0212]/85 backdrop-blur-md p-4 font-['Orbitron']">
      <div className="relative flex w-full max-w-md flex-col items-center border-2 border-red-500/80 bg-[#0a0212]/95 p-6 text-center shadow-[0_0_50px_rgba(255,0,60,0.35)] geo-chamfer">
        {/* Geometric Corner Accents */}
        <div className="pointer-events-none absolute -top-1 -left-1 h-5 w-5 border-t-2 border-l-2 border-red-500" />
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />

        {/* Glow header */}
        <div className="mb-1 text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-400 drop-shadow-[0_0_15px_rgba(255,0,60,0.8)]">
          SISTEMA CRÍTICO
        </div>
        <div className="text-xs tracking-widest text-pink-400/90 uppercase font-['Chakra_Petch']">
          CONEXIÓN NEÓN PERDIDA
        </div>

        {/* Score Stats Table */}
        <div className="my-6 flex w-full flex-col gap-3 -skew-x-3 border border-red-900/60 bg-[#12021a]/90 p-4 text-left shadow-[0_0_20px_rgba(255,0,60,0.12)]">
          <div className="flex items-center justify-between border-b border-red-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">PUNTUACIÓN FINAL:</span>
            <span className="text-lg font-bold text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-red-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">MÁXIMO COMBO:</span>
            <span className="text-base font-bold text-pink-400">
              x{stats.maxCombo}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-red-950/80 pb-2 skew-x-3">
            <span className="text-xs text-slate-400">MONSTRUOS ELIMINADOS:</span>
            <span className="text-base font-bold text-cyan-400">
              {stats.kills}
            </span>
          </div>

          <div className="flex items-center justify-between skew-x-3">
            <span className="text-xs text-slate-400">RÉCORD HISTÓRICO:</span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-400">
              <Trophy className="h-4 w-4" />
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3">
          <button
            id="gameover-restart-btn"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 -skew-x-6 border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-sm font-black text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] transition hover:scale-102 hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2 skew-x-6">
              <RotateCcw className="h-4 w-4" />
              <span>REINICIAR MISIÓN NEÓN</span>
            </div>
          </button>

          <button
            id="gameover-screenshot-btn"
            onClick={onOpenScreenshot}
            className="flex w-full items-center justify-center gap-2 -skew-x-6 border-2 border-pink-500/70 bg-[#1c0428]/90 py-2.5 text-xs font-bold text-pink-300 shadow-[0_0_15px_rgba(255,0,127,0.2)] transition hover:bg-pink-900/60 hover:text-white cursor-pointer hover:border-pink-400"
          >
            <div className="flex items-center gap-2 skew-x-6">
              <Camera className="h-4 w-4" />
              <span>VER CAPTURA DE PANTALLA 8K</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
