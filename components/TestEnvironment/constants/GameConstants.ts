// Location: components/TestEnvironment/constants/GameConstants.ts

export const GAME_CONSTANTS = {
    // Çiğneme bölgeleri
    CHEW_ZONES: {
        TOTAL_GAP: 150,
        MULTIPLIERS: {
            PERFECT: 3,
            GOOD: 5,
            EARLY_LATE: 7
        }
    },

    // Hasar değerleri
    DAMAGE: {
        PERFECT: 15,
        GOOD: 10,
        EARLY: 0,
        SQUEEZE: 30
    },

    // Skor değerleri
    SCORE: {
        PERFECT: 100,
        GOOD: 50,
        EARLY: 0,
        SQUEEZE: 200
    },

    // Combo sistemi
    COMBO: {
        PERFECT_INCREASE: 1,
        GOOD_INCREASE: 1,
        EARLY_DECREASE: 1,
        SQUEEZE_THRESHOLD: 3
    },

    // Çene sabitleri
    JAW: {
        HEIGHT: 100,
        BOUNCE_OFFSET: 40,
        SPEED: 200,
        MAX_CLOSE_SPEED: 10,
        MIN_GAP: 30
    }
} as const; 