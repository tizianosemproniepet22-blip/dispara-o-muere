export interface LevelTheme {
  skyColors: [string, string, string, string];
  sunColors: [string, string, string];
  mountainColor: string;
  gridColor: string;
  gridFloorColor: string;
  horizonGlow: string;
  portalColor: string;
  platformTopColor: string;
  platformBodyColor: string;
  accentColor: string;
}

export interface BossConfig {
  name: string;
  health: number;
  color: string;
  glowColor: string;
  scoreValue: number;
  bulletColor: string;
}

export interface LevelConfig {
  level: number;
  name: string;
  subtitle: string;
  worldWidth: number;
  theme: LevelTheme;
  hazardDensity: number;
  sawSpeedMult: number;
  movingPlatformsCount: number;
  enemyTypes: ('wasp' | 'skull' | 'crawler')[];
  enemyCount: number;
  enemySpeedMult: number;
  enemyHpMult: number;
  hasBoss?: boolean;
  bossConfig?: BossConfig;
}

export const LEVELS_CONFIG: LevelConfig[] = [
  // LEVEL 1: DISTRITO NEÓN (Introducción)
  {
    level: 1,
    name: 'Distrito Neón',
    subtitle: 'Aprende los controles básicos, salta plataformas y elimina avispas.',
    worldWidth: 3200,
    theme: {
      skyColors: ['#0a0212', '#1a0030', '#320042', '#080118'],
      sunColors: ['#ffe600', '#ff007f', '#7928ca'],
      mountainColor: '#a855f7',
      gridColor: 'rgba(0, 85, 255, 0.35)',
      gridFloorColor: 'rgba(255, 0, 127, 0.45)',
      horizonGlow: '#00f0ff',
      portalColor: '#00f0ff',
      platformTopColor: '#00f0ff',
      platformBodyColor: 'rgba(10, 5, 28, 0.92)',
      accentColor: '#00f0ff'
    },
    hazardDensity: 0.5,
    sawSpeedMult: 1.0,
    movingPlatformsCount: 2,
    enemyTypes: ['wasp'],
    enemyCount: 8,
    enemySpeedMult: 0.9,
    enemyHpMult: 0.9
  },

  // LEVEL 2: CORREDOR ESPECTRAL
  {
    level: 2,
    name: 'Corredor Espectral',
    subtitle: 'Calaveras espectrales patrullan en zigzag. Cuidado con las sierras.',
    worldWidth: 3400,
    theme: {
      skyColors: ['#060114', '#17012e', '#2f013d', '#050114'],
      sunColors: ['#ff00bb', '#9900ff', '#4400cc'],
      mountainColor: '#c084fc',
      gridColor: 'rgba(168, 85, 247, 0.35)',
      gridFloorColor: 'rgba(0, 240, 255, 0.4)',
      horizonGlow: '#c084fc',
      portalColor: '#c084fc',
      platformTopColor: '#c084fc',
      platformBodyColor: 'rgba(14, 4, 28, 0.92)',
      accentColor: '#c084fc'
    },
    hazardDensity: 0.65,
    sawSpeedMult: 1.1,
    movingPlatformsCount: 3,
    enemyTypes: ['wasp', 'skull'],
    enemyCount: 11,
    enemySpeedMult: 0.95,
    enemyHpMult: 1.0
  },

  // LEVEL 3: TORRE DE PLASMA
  {
    level: 3,
    name: 'Torre de Plasma',
    subtitle: 'Rastreadores terrestres y plataformas elevadas sobre el abismo.',
    worldWidth: 3600,
    theme: {
      skyColors: ['#05081a', '#081738', '#0f2c52', '#040714'],
      sunColors: ['#00f0ff', '#0070f3', '#7928ca'],
      mountainColor: '#38bdf8',
      gridColor: 'rgba(56, 189, 248, 0.35)',
      gridFloorColor: 'rgba(0, 240, 255, 0.45)',
      horizonGlow: '#38bdf8',
      portalColor: '#38bdf8',
      platformTopColor: '#38bdf8',
      platformBodyColor: 'rgba(5, 15, 30, 0.92)',
      accentColor: '#38bdf8'
    },
    hazardDensity: 0.8,
    sawSpeedMult: 1.15,
    movingPlatformsCount: 4,
    enemyTypes: ['wasp', 'crawler'],
    enemyCount: 13,
    enemySpeedMult: 1.0,
    enemyHpMult: 1.05
  },

  // LEVEL 4: CALZADA DE PINCHOS
  {
    level: 4,
    name: 'Calzada de Pinchos',
    subtitle: 'Campos densos de pinchos de neón. Usa el Dash [Shift] con precisión.',
    worldWidth: 3800,
    theme: {
      skyColors: ['#120108', '#260212', '#40041d', '#0d0106'],
      sunColors: ['#ff0055', '#ff007f', '#ffaa00'],
      mountainColor: '#f43f5e',
      gridColor: 'rgba(244, 63, 94, 0.35)',
      gridFloorColor: 'rgba(255, 230, 0, 0.4)',
      horizonGlow: '#fb7185',
      portalColor: '#fb7185',
      platformTopColor: '#fb7185',
      platformBodyColor: 'rgba(24, 4, 12, 0.92)',
      accentColor: '#fb7185'
    },
    hazardDensity: 1.0,
    sawSpeedMult: 1.2,
    movingPlatformsCount: 4,
    enemyTypes: ['skull', 'crawler'],
    enemyCount: 14,
    enemySpeedMult: 1.05,
    enemyHpMult: 1.1
  },

  // LEVEL 5: COLMENA CARMESÍ (JEFE 1)
  {
    level: 5,
    name: 'Colmena Carmesí (Jefe)',
    subtitle: '¡ALERTA DE JEFE! Derrota a la Reina Avispa para desbloquear el Portal dimensional.',
    worldWidth: 3800,
    theme: {
      skyColors: ['#18000a', '#330015', '#4f0022', '#100008'],
      sunColors: ['#ff0055', '#ff00aa', '#880033'],
      mountainColor: '#f43f5e',
      gridColor: 'rgba(244, 63, 94, 0.45)',
      gridFloorColor: 'rgba(255, 0, 85, 0.55)',
      horizonGlow: '#ff0055',
      portalColor: '#ff0055',
      platformTopColor: '#ff0055',
      platformBodyColor: 'rgba(28, 4, 16, 0.94)',
      accentColor: '#ff0055'
    },
    hazardDensity: 0.85,
    sawSpeedMult: 1.25,
    movingPlatformsCount: 3,
    enemyTypes: ['wasp', 'skull'],
    enemyCount: 12,
    enemySpeedMult: 1.1,
    enemyHpMult: 1.15,
    hasBoss: true,
    bossConfig: {
      name: 'Reina Avispa Carmesí',
      health: 500,
      color: '#f43f5e',
      glowColor: 'rgba(244,63,94,0.9)',
      scoreValue: 4000,
      bulletColor: '#ff0055'
    }
  },

  // LEVEL 6: CAÑÓN ULTRAVIOLETA
  {
    level: 6,
    name: 'Cañón Ultravioleta',
    subtitle: 'Enormes abismos y plataformas cinéticas móviles en el horizonte.',
    worldWidth: 4000,
    theme: {
      skyColors: ['#090014', '#18002a', '#2d0047', '#080010'],
      sunColors: ['#c084fc', '#a855f7', '#6b21a8'],
      mountainColor: '#a855f7',
      gridColor: 'rgba(168, 85, 247, 0.35)',
      gridFloorColor: 'rgba(192, 132, 252, 0.45)',
      horizonGlow: '#c084fc',
      portalColor: '#c084fc',
      platformTopColor: '#c084fc',
      platformBodyColor: 'rgba(15, 4, 30, 0.92)',
      accentColor: '#c084fc'
    },
    hazardDensity: 0.9,
    sawSpeedMult: 1.25,
    movingPlatformsCount: 6,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 15,
    enemySpeedMult: 1.12,
    enemyHpMult: 1.2
  },

  // LEVEL 7: NÚCLEO DE FRECUENCIA
  {
    level: 7,
    name: 'Núcleo de Frecuencia',
    subtitle: 'Sierras mecánicas rápidas y proyectiles cruzados en frecuencia alta.',
    worldWidth: 4200,
    theme: {
      skyColors: ['#01120f', '#02241f', '#033b33', '#01100d'],
      sunColors: ['#10b981', '#059669', '#047857'],
      mountainColor: '#34d399',
      gridColor: 'rgba(16, 185, 129, 0.35)',
      gridFloorColor: 'rgba(52, 211, 153, 0.45)',
      horizonGlow: '#10b981',
      portalColor: '#10b981',
      platformTopColor: '#10b981',
      platformBodyColor: 'rgba(2, 20, 16, 0.92)',
      accentColor: '#10b981'
    },
    hazardDensity: 1.1,
    sawSpeedMult: 1.35,
    movingPlatformsCount: 5,
    enemyTypes: ['wasp', 'crawler'],
    enemyCount: 16,
    enemySpeedMult: 1.15,
    enemyHpMult: 1.25
  },

  // LEVEL 8: RED CIBERNÉTICA
  {
    level: 8,
    name: 'Red Cibernética',
    subtitle: 'Plataformas flotantes de gran altitud y ataques sincronizados.',
    worldWidth: 4200,
    theme: {
      skyColors: ['#100c01', '#261c02', '#3d2e04', '#0d0a01'],
      sunColors: ['#facc15', '#eab308', '#ca8a04'],
      mountainColor: '#fde047',
      gridColor: 'rgba(234, 179, 8, 0.35)',
      gridFloorColor: 'rgba(250, 204, 21, 0.45)',
      horizonGlow: '#facc15',
      portalColor: '#facc15',
      platformTopColor: '#facc15',
      platformBodyColor: 'rgba(22, 18, 4, 0.92)',
      accentColor: '#facc15'
    },
    hazardDensity: 1.15,
    sawSpeedMult: 1.4,
    movingPlatformsCount: 6,
    enemyTypes: ['skull', 'crawler', 'wasp'],
    enemyCount: 17,
    enemySpeedMult: 1.18,
    enemyHpMult: 1.3
  },

  // LEVEL 9: FORTALEZA DE CRISTAL
  {
    level: 9,
    name: 'Fortaleza de Cristal',
    subtitle: 'Doble patrulla de sierras en pasarelas suspendidas y hielo cian.',
    worldWidth: 4400,
    theme: {
      skyColors: ['#020b17', '#031933', '#06294f', '#020914'],
      sunColors: ['#38bdf8', '#0ea5e9', '#0284c7'],
      mountainColor: '#7dd3fc',
      gridColor: 'rgba(14, 165, 233, 0.35)',
      gridFloorColor: 'rgba(56, 189, 248, 0.45)',
      horizonGlow: '#38bdf8',
      portalColor: '#38bdf8',
      platformTopColor: '#38bdf8',
      platformBodyColor: 'rgba(4, 18, 32, 0.92)',
      accentColor: '#38bdf8'
    },
    hazardDensity: 1.2,
    sawSpeedMult: 1.45,
    movingPlatformsCount: 6,
    enemyTypes: ['wasp', 'skull'],
    enemyCount: 18,
    enemySpeedMult: 1.2,
    enemyHpMult: 1.35
  },

  // LEVEL 10: BASTIÓN MECÁNICO (JEFE 2)
  {
    level: 10,
    name: 'Bastión Mecánico (Jefe)',
    subtitle: '¡GUARDIÁN DEFENSOR! Esquiva el fuego radial cuádruple y contraataca.',
    worldWidth: 4200,
    theme: {
      skyColors: ['#140502', '#2b0c03', '#451606', '#100402'],
      sunColors: ['#f97316', '#ea580c', '#c2410c'],
      mountainColor: '#fb923c',
      gridColor: 'rgba(249, 115, 22, 0.4)',
      gridFloorColor: 'rgba(251, 146, 60, 0.5)',
      horizonGlow: '#f97316',
      portalColor: '#f97316',
      platformTopColor: '#f97316',
      platformBodyColor: 'rgba(24, 8, 4, 0.94)',
      accentColor: '#f97316'
    },
    hazardDensity: 1.0,
    sawSpeedMult: 1.4,
    movingPlatformsCount: 4,
    enemyTypes: ['skull', 'crawler'],
    enemyCount: 14,
    enemySpeedMult: 1.2,
    enemyHpMult: 1.35,
    hasBoss: true,
    bossConfig: {
      name: 'Guardián Mecánico de Pulso',
      health: 650,
      color: '#f97316',
      glowColor: 'rgba(249,115,22,0.9)',
      scoreValue: 5500,
      bulletColor: '#fb923c'
    }
  },

  // LEVEL 11: VALLE DE POLÍGONOS
  {
    level: 11,
    name: 'Valle de Polígonos',
    subtitle: 'Geometría móvil activa. Combina disparos de plasma y saltos dobles.',
    worldWidth: 4500,
    theme: {
      skyColors: ['#0f0317', '#220833', '#391052', '#0b0212'],
      sunColors: ['#ec4899', '#db2777', '#be185d'],
      mountainColor: '#f472b6',
      gridColor: 'rgba(236, 72, 153, 0.35)',
      gridFloorColor: 'rgba(244, 114, 182, 0.45)',
      horizonGlow: '#ec4899',
      portalColor: '#ec4899',
      platformTopColor: '#ec4899',
      platformBodyColor: 'rgba(20, 5, 30, 0.92)',
      accentColor: '#ec4899'
    },
    hazardDensity: 1.25,
    sawSpeedMult: 1.45,
    movingPlatformsCount: 7,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 19,
    enemySpeedMult: 1.22,
    enemyHpMult: 1.4
  },

  // LEVEL 12: ABISMO SUBATÓMICO
  {
    level: 12,
    name: 'Abismo Subatómico',
    subtitle: 'Vacío profundo sin suelo continuo. Cada salto debe ser exacto.',
    worldWidth: 4600,
    theme: {
      skyColors: ['#040112', '#090324', '#120838', '#03010d'],
      sunColors: ['#6366f1', '#4f46e5', '#4338ca'],
      mountainColor: '#818cf8',
      gridColor: 'rgba(99, 102, 241, 0.35)',
      gridFloorColor: 'rgba(129, 140, 248, 0.45)',
      horizonGlow: '#6366f1',
      portalColor: '#6366f1',
      platformTopColor: '#6366f1',
      platformBodyColor: 'rgba(8, 4, 26, 0.92)',
      accentColor: '#6366f1'
    },
    hazardDensity: 1.3,
    sawSpeedMult: 1.5,
    movingPlatformsCount: 8,
    enemyTypes: ['wasp', 'skull'],
    enemyCount: 20,
    enemySpeedMult: 1.25,
    enemyHpMult: 1.45
  },

  // LEVEL 13: LABORATORIO LÁSER
  {
    level: 13,
    name: 'Laboratorio Láser',
    subtitle: 'Trampas giratorias y enjambres rápidos de calaveras bio-láser.',
    worldWidth: 4700,
    theme: {
      skyColors: ['#140105', '#29030b', '#420614', '#100104'],
      sunColors: ['#ef4444', '#dc2626', '#b91c1c'],
      mountainColor: '#f87171',
      gridColor: 'rgba(239, 68, 68, 0.35)',
      gridFloorColor: 'rgba(248, 113, 113, 0.45)',
      horizonGlow: '#ef4444',
      portalColor: '#ef4444',
      platformTopColor: '#ef4444',
      platformBodyColor: 'rgba(24, 4, 8, 0.92)',
      accentColor: '#ef4444'
    },
    hazardDensity: 1.35,
    sawSpeedMult: 1.55,
    movingPlatformsCount: 6,
    enemyTypes: ['skull', 'crawler', 'wasp'],
    enemyCount: 21,
    enemySpeedMult: 1.28,
    enemyHpMult: 1.5
  },

  // LEVEL 14: CÁMARA DE GRAVEDAD
  {
    level: 14,
    name: 'Cámara de Gravedad',
    subtitle: 'Navega túneles de pinchos flotantes mientras te asedian avispas.',
    worldWidth: 4800,
    theme: {
      skyColors: ['#010c14', '#021826', '#04283d', '#010a10'],
      sunColors: ['#06b6d4', '#0891b2', '#0e7490'],
      mountainColor: '#22d3ee',
      gridColor: 'rgba(6, 182, 212, 0.35)',
      gridFloorColor: 'rgba(34, 211, 238, 0.45)',
      horizonGlow: '#06b6d4',
      portalColor: '#06b6d4',
      platformTopColor: '#06b6d4',
      platformBodyColor: 'rgba(2, 16, 26, 0.92)',
      accentColor: '#06b6d4'
    },
    hazardDensity: 1.4,
    sawSpeedMult: 1.6,
    movingPlatformsCount: 8,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 22,
    enemySpeedMult: 1.3,
    enemyHpMult: 1.55
  },

  // LEVEL 15: MATRIARCA NEÓN (JEFE 3)
  {
    level: 15,
    name: 'Matriarca Neón (Jefe)',
    subtitle: '¡LA MATRIARCA DESPIERTA! Dispara ráfagas de 5 proyectiles de plasma.',
    worldWidth: 4500,
    theme: {
      skyColors: ['#120119', '#240233', '#3d0554', '#0e0114'],
      sunColors: ['#a855f7', '#d946ef', '#ec4899'],
      mountainColor: '#e879f9',
      gridColor: 'rgba(217, 70, 239, 0.4)',
      gridFloorColor: 'rgba(232, 121, 249, 0.5)',
      horizonGlow: '#d946ef',
      portalColor: '#d946ef',
      platformTopColor: '#d946ef',
      platformBodyColor: 'rgba(24, 4, 32, 0.94)',
      accentColor: '#d946ef'
    },
    hazardDensity: 1.15,
    sawSpeedMult: 1.5,
    movingPlatformsCount: 5,
    enemyTypes: ['wasp', 'skull'],
    enemyCount: 16,
    enemySpeedMult: 1.3,
    enemyHpMult: 1.6,
    hasBoss: true,
    bossConfig: {
      name: 'Matriarca Neón Hiperespacial',
      health: 850,
      color: '#d946ef',
      glowColor: 'rgba(217,70,239,0.9)',
      scoreValue: 7500,
      bulletColor: '#e879f9'
    }
  },

  // LEVEL 16: VÓRTICE SINTÉTICO
  {
    level: 16,
    name: 'Vórtice Sintético',
    subtitle: 'Velocidad de combate elevada. Las plataformas cinéticas se mueven rápido.',
    worldWidth: 5000,
    theme: {
      skyColors: ['#140d01', '#2e1e02', '#473005', '#100a01'],
      sunColors: ['#eab308', '#ca8a04', '#a16207'],
      mountainColor: '#facc15',
      gridColor: 'rgba(234, 179, 8, 0.35)',
      gridFloorColor: 'rgba(250, 204, 21, 0.45)',
      horizonGlow: '#eab308',
      portalColor: '#eab308',
      platformTopColor: '#eab308',
      platformBodyColor: 'rgba(26, 18, 4, 0.92)',
      accentColor: '#eab308'
    },
    hazardDensity: 1.45,
    sawSpeedMult: 1.65,
    movingPlatformsCount: 9,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 24,
    enemySpeedMult: 1.34,
    enemyHpMult: 1.65
  },

  // LEVEL 17: HORIZONTE CARMESÍ
  {
    level: 17,
    name: 'Horizonte Carmesí',
    subtitle: 'La atmósfera arde en frecuencias críticas. Máxima concentración requerida.',
    worldWidth: 5100,
    theme: {
      skyColors: ['#170104', '#2e030b', '#4a0614', '#120104'],
      sunColors: ['#dc2626', '#b91c1c', '#991b1b'],
      mountainColor: '#ef4444',
      gridColor: 'rgba(220, 38, 38, 0.35)',
      gridFloorColor: 'rgba(239, 68, 68, 0.45)',
      horizonGlow: '#dc2626',
      portalColor: '#dc2626',
      platformTopColor: '#dc2626',
      platformBodyColor: 'rgba(28, 4, 8, 0.92)',
      accentColor: '#dc2626'
    },
    hazardDensity: 1.5,
    sawSpeedMult: 1.7,
    movingPlatformsCount: 9,
    enemyTypes: ['skull', 'crawler', 'wasp'],
    enemyCount: 25,
    enemySpeedMult: 1.37,
    enemyHpMult: 1.7
  },

  // LEVEL 18: LÍMITE DEL HIPERESPACIO
  {
    level: 18,
    name: 'Límite del Hiperespacio',
    subtitle: 'Espacio cuántico profundo. Los enemigos atacan en oleadas persistentes.',
    worldWidth: 5200,
    theme: {
      skyColors: ['#020814', '#05142e', '#0a2347', '#020610'],
      sunColors: ['#0284c7', '#0369a1', '#075985'],
      mountainColor: '#38bdf8',
      gridColor: 'rgba(2, 132, 199, 0.35)',
      gridFloorColor: 'rgba(56, 189, 248, 0.45)',
      horizonGlow: '#0284c7',
      portalColor: '#0284c7',
      platformTopColor: '#0284c7',
      platformBodyColor: 'rgba(4, 14, 28, 0.92)',
      accentColor: '#0284c7'
    },
    hazardDensity: 1.55,
    sawSpeedMult: 1.75,
    movingPlatformsCount: 10,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 26,
    enemySpeedMult: 1.4,
    enemyHpMult: 1.75
  },

  // LEVEL 19: PUERTA DEL APOCALIPSIS
  {
    level: 19,
    name: 'Puerta del Apocalipsis',
    subtitle: 'La última antesala antes del núcleo central. Resiste con todas tus armas.',
    worldWidth: 5300,
    theme: {
      skyColors: ['#120014', '#260129', '#3d0242', '#0f0010'],
      sunColors: ['#ec4899', '#f43f5e', '#ffe600'],
      mountainColor: '#f43f5e',
      gridColor: 'rgba(244, 63, 94, 0.38)',
      gridFloorColor: 'rgba(255, 230, 0, 0.48)',
      horizonGlow: '#ffe600',
      portalColor: '#ffe600',
      platformTopColor: '#ffe600',
      platformBodyColor: 'rgba(24, 2, 28, 0.92)',
      accentColor: '#ffe600'
    },
    hazardDensity: 1.6,
    sawSpeedMult: 1.8,
    movingPlatformsCount: 10,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 28,
    enemySpeedMult: 1.42,
    enemyHpMult: 1.8
  },

  // LEVEL 20: CÚSPIDE DE LA REINA SUPREMA (GRAN FINAL)
  {
    level: 20,
    name: 'Cúspide de la Reina Suprema (Final)',
    subtitle: '¡BATALLA FINAL! Derrota a la Reina Suprema Cósmica y corona tu victoria.',
    worldWidth: 5000,
    theme: {
      skyColors: ['#0f0018', '#250036', '#3e0057', '#0c0014'],
      sunColors: ['#ffe600', '#ff007f', '#00f0ff'],
      mountainColor: '#ffe600',
      gridColor: 'rgba(0, 240, 255, 0.45)',
      gridFloorColor: 'rgba(255, 0, 127, 0.55)',
      horizonGlow: '#ffe600',
      portalColor: '#ffe600',
      platformTopColor: '#00f0ff',
      platformBodyColor: 'rgba(20, 2, 32, 0.95)',
      accentColor: '#ffe600'
    },
    hazardDensity: 1.35,
    sawSpeedMult: 1.8,
    movingPlatformsCount: 7,
    enemyTypes: ['wasp', 'skull', 'crawler'],
    enemyCount: 20,
    enemySpeedMult: 1.45,
    enemyHpMult: 1.9,
    hasBoss: true,
    bossConfig: {
      name: 'Reina Suprema del Hiperespacio',
      health: 1200,
      color: '#ffe600',
      glowColor: 'rgba(255,230,0,0.95)',
      scoreValue: 15000,
      bulletColor: '#ffe600'
    }
  }
];

export function getLevelConfig(level: number): LevelConfig {
  const clamped = Math.max(1, Math.min(20, level));
  return LEVELS_CONFIG[clamped - 1] || LEVELS_CONFIG[0];
}

export const LEVEL_CONFIGS = LEVELS_CONFIG;
