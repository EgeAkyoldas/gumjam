export const CHEW_CONSTANTS = {
    ZONES: {
        PERFECT_ZONE: 0.39, // Perfect zone: 38-40% arası
        GOOD_ZONE: 0.35, // Good zone: 35-38% arası
        EARLY_ZONE: 0.28, // Early zone: 25-33% arası
        DIRECTION: {
            TOP_TO_BOTTOM: 'down', // Yukarıdan aşağıya hareket
            BOTTOM_TO_TOP: 'up' // Aşağıdan yukarıya hareket
        }
    },
    JAW_SETTINGS: {
        UPPER_JAW_HEIGHT: 64, // Üst çene yüksekliği (px)
        LOWER_JAW_HEIGHT: 64, // Alt çene yüksekliği (px)
        TEETH_HEIGHT: 16, // Diş yüksekliği (px)
        MIN_GAP: 40, // Minimum çene arası mesafe (px)
        MAX_GAP: 150, // Maximum çene arası mesafe (px)
        CHEW_TRAVEL: 80, // Çiğneme hareketi mesafesi (px)
        BOUNDARIES: {
            UPPER: 0.22, // Üst çene sınırı (viewport height %)
            LOWER: 0.63 // Alt çene sınırı (viewport height %)
        }
    },
    TEETH_COLORS: {
        PERFECT: 'bg-white brightness-110 shadow-inner transition-all duration-200',
        GOOD: 'bg-[#F8F8F8] opacity-95 transition-all duration-200',
        EARLY: 'bg-[#F0F0F0] opacity-90 transition-all duration-200',
        LATE: 'bg-[#F0F0F0] opacity-90 transition-all duration-200',
        NONE: 'bg-white transition-all duration-200'
    },
    TIMING: {
        CHEW_DURATION: 200, // ms
        MIN_CHEW_INTERVAL: 500 // ms
    },
    COMBO: {
        PERFECT_INCREASE: 2,
        GOOD_INCREASE: 1,
        EARLY_DECREASE: 1,
        MAX_COMBO: 10
    }
} as const;
