export const CHEWING_CONSTANTS = {
  // Çiğneme bölgeleri
  ZONES: {
    PERFECT: {
      SIZE: 20,
      SCORE: 100,
      DAMAGE: 15
    },
    GOOD: {
      SIZE: 40,
      SCORE: 50,
      DAMAGE: 10
    },
    EARLY: {
      SIZE: 60,
      SCORE: 0,
      DAMAGE: 1,
      HEALTH_PENALTY: 1
    },
    LATE: {
      SCORE: 0,
      DAMAGE: 1,
      HEALTH_PENALTY: 1
    }
  },

  // Combo sistemi
  COMBO: {
    PERFECT_INCREASE: 2,
    GOOD_INCREASE: 1,
    EARLY_DECREASE: 1,
    LATE_RESET: true,
    SQUEEZE_THRESHOLD: 7
  },

  // Squeeze mekanikleri
  SQUEEZE: {
    COMBO_THRESHOLD: 7,
    MAX_DURATION: 2000,
    DAMAGE: 30,
    SCORE: 200,
    COMPRESSION_RATIO: 2.0
  },

  // Meter sabitleri
  METER: {
    MAX_VALUE: 100,
    PERFECT_INCREASE: 30,
    GOOD_INCREASE: 10,
    EARLY_DECREASE: 20,
    LATE_RESET: true,
    DECAY_RATE: 0.1,
    DECAY_INTERVAL: 100
  }
} as const

// Çiğneme tipleri için type
export type ChewType = 'none' | 'perfect' | 'good' | 'early' | 'late'

// Renk sabitleri
export const CHEW_ZONE_COLORS = {
  PERFECT: 'bg-gradient-to-r from-green-400 to-green-500',
  GOOD: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
  EARLY: 'bg-gradient-to-r from-orange-400 to-orange-500',
  LATE: 'bg-gradient-to-r from-red-400 to-red-500',
  NONE: 'bg-gradient-to-r from-gray-200 to-gray-300'
} as const 