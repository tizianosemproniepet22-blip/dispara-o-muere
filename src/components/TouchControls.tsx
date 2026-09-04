import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Flame, Zap } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onJump: () => void;
  onFire: (pressed: boolean) => void;
  onDash: () => void;
  onNextWeapon: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
  onFire,
  onDash,
  onNextWeapon
}) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-30 flex justify-between px-6 md:hidden">
      {/* Left side: D-pad movement */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          id="touch-left"
          onTouchStart={() => onMoveLeft(true)}
          onTouchEnd={() => onMoveLeft(false)}
          onMouseDown={() => onMoveLeft(true)}
          onMouseUp={() => onMoveLeft(false)}
          className="flex h-14 w-14 items-center justify-center -skew-x-6 border-2 border-cyan-400/80 bg-[#0a0212]/90 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.35)] active:bg-cyan-500 active:text-black"
        >
          <div className="skew-x-6">
            <ArrowLeft className="h-7 w-7" />
          </div>
        </button>

        <button
          id="touch-right"
          onTouchStart={() => onMoveRight(true)}
          onTouchEnd={() => onMoveRight(false)}
          onMouseDown={() => onMoveRight(true)}
          onMouseUp={() => onMoveRight(false)}
          className="flex h-14 w-14 items-center justify-center -skew-x-6 border-2 border-cyan-400/80 bg-[#0a0212]/90 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.35)] active:bg-cyan-500 active:text-black"
        >
          <div className="skew-x-6">
            <ArrowRight className="h-7 w-7" />
          </div>
        </button>
      </div>

      {/* Right side: Jump, Fire, Dash, Weapon */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          id="touch-dash"
          onClick={onDash}
          className="flex h-12 w-12 items-center justify-center -skew-x-6 border-2 border-yellow-500/70 bg-[#0a0212]/90 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.35)] active:scale-95"
        >
          <div className="skew-x-6">
            <Zap className="h-6 w-6" />
          </div>
        </button>

        <button
          id="touch-jump"
          onClick={onJump}
          className="flex h-14 w-14 items-center justify-center -skew-x-6 border-2 border-pink-500/80 bg-[#0a0212]/90 text-pink-400 shadow-[0_0_15px_rgba(255,0,127,0.35)] active:bg-pink-500 active:text-white"
        >
          <div className="skew-x-6">
            <ArrowUp className="h-7 w-7" />
          </div>
        </button>

        <button
          id="touch-fire"
          onTouchStart={() => onFire(true)}
          onTouchEnd={() => onFire(false)}
          onMouseDown={() => onFire(true)}
          onMouseUp={() => onFire(false)}
          className="flex h-16 w-16 items-center justify-center -skew-x-6 border-2 border-cyan-400 bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95"
        >
          <div className="skew-x-6">
            <Flame className="h-8 w-8 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};
