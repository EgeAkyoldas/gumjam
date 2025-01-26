// Location: components/TestEnvironment/constants/PhysicsConstants.ts

export const PHYSICS_CONSTANTS = {
    GRAVITY: 0.1,  // Yerçekimi daha da azaltıldı
    TIME_STEP: 1 / 60,
    
    // Hız sabitleri
    VELOCITY: {
        BASE: 3.0,     // Temel hız arttırıldı
        MIN: 2.0,      // Minimum hız arttırıldı
        MAX: 5.0,      // Maksimum hız arttırıldı
        DAMPING: 0.995 // Sürtünme azaltıldı
    },

    // Açı sabitleri
    ANGLE: {
        MIN: Math.PI / 6,    // 30 derece
        MAX: Math.PI / 3     // 60 derece
    },

    // Sıkışma sabitleri
    COMPRESSION: {
        RATIO: 1.3,
        MIN: 1.1,
        MAX: 1.5
    },

    // Çarpışma sabitleri
    COLLISION: {
        BOUNCE_THRESHOLD: 5,
        EDGE_BUFFER: 2,
        ELASTICITY: 0.95,    // Elastikiyet arttırıldı
        MIN_BOUNCE_SPEED: 2.0 // Minimum sekme hızı arttırıldı
    }
} as const; 