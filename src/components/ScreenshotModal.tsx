import React, { useState } from 'react';
import { Camera, Check, Download, Eye, Layers, Sparkles, X } from 'lucide-react';
import aiScreenshotUrl from '../assets/images/neon_cube_platformer_1788550116975.jpg';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCaptureUrl: string | null;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  isOpen,
  onClose,
  gameCaptureUrl
}) => {
  const [activeTab, setActiveTab] = useState<'8k_art' | 'live_game'>('8k_art');
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [bloomIntensity, setBloomIntensity] = useState<number>(1.2);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentImageUrl = activeTab === '8k_art' ? aiScreenshotUrl : (gameCaptureUrl || aiScreenshotUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = activeTab === '8k_art' ? 'neon_cube_synthwave_8k.jpg' : 'neon_cube_gameplay_capture.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0212]/85 backdrop-blur-md p-4 font-['Orbitron']">
      <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col border-2 border-cyan-500/60 bg-[#0a0212] shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden geo-chamfer">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 bg-[#0e021a]/95 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center -skew-x-6 border-2 border-cyan-400 bg-[#0a1524]/90 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="skew-x-6">
                <Camera className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider text-white">
                MODO CAPTURA DE PANTALLA
              </h2>
              <p className="text-xs text-cyan-300/80 font-['Chakra_Petch']">
                Acción y plataformas 2D Synthwave • Iluminación Neón Vibrante 8K
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="flex -skew-x-6 border border-cyan-900/80 bg-[#0a0212] p-1 text-xs">
              <button
                id="tab-8k-art"
                onClick={() => setActiveTab('8k_art')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 font-bold transition cursor-pointer ${
                  activeTab === '8k_art'
                    ? 'border border-pink-500 bg-gradient-to-r from-pink-600 to-cyan-500 text-white shadow-[0_0_10px_rgba(255,0,127,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 skew-x-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Render 8K Neón</span>
                </div>
              </button>
              <button
                id="tab-live-game"
                onClick={() => setActiveTab('live_game')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 font-bold transition cursor-pointer ${
                  activeTab === 'live_game'
                    ? 'border border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 skew-x-6">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Captura en Vivo</span>
                </div>
              </button>
            </div>

            <button
              id="close-screenshot-modal"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center -skew-x-6 border border-slate-700 bg-[#0a0212]/90 text-slate-400 transition hover:border-red-500 hover:text-red-400 cursor-pointer"
            >
              <div className="skew-x-6">
                <X className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>

        {/* Content Image Display */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#06010d] p-4">
          <div className="relative max-h-[62vh] w-full max-w-4xl overflow-hidden border border-cyan-500/40 bg-[#0a0212] shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt="Captura de pantalla de videojuego de acción y plataformas en 2D"
              referrerPolicy="no-referrer"
              className="max-h-[60vh] w-auto object-contain transition-all duration-300"
              style={{
                filter: `brightness(${bloomIntensity}) contrast(1.15)`
              }}
            />

            {/* Optional CRT Scanlines filter */}
            {crtFilter && (
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.35)_3px,rgba(0,0,0,0.35)_4px)]" />
            )}
          </div>
        </div>

        {/* Bottom Panel Controls & Prompt Details */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cyan-900/60 bg-[#0e021a]/95 px-6 py-4 font-['Chakra_Petch']">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={crtFilter}
                onChange={(e) => setCrtFilter(e.target.checked)}
                className="rounded-none border-cyan-500 text-cyan-500 focus:ring-cyan-500 accent-cyan-400"
              />
              <span>Filtro CRT Scanlines</span>
            </label>

            <div className="flex items-center gap-2 text-slate-300">
              <span>Brillo Neón:</span>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.05"
                value={bloomIntensity}
                onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 font-['Orbitron']">
            <button
              id="download-screenshot-btn"
              onClick={handleDownload}
              className="flex items-center gap-2 -skew-x-6 border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2 skew-x-6">
                <Download className="h-4 w-4" />
                <span>DESCARGAR FOTO HD</span>
              </div>
            </button>

            <button
              id="resume-game-btn"
              onClick={onClose}
              className="flex items-center justify-center -skew-x-6 border border-slate-700 bg-[#0a0212]/90 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer"
            >
              <span className="skew-x-6">CONTINUAR JUGANDO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
