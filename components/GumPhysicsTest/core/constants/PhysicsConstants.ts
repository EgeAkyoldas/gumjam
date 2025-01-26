export const PHYSICS_CONSTANTS = {
  // Çiğneme açı sınırları
  MIN_ANGLE: Math.PI / 6,    // 30 derece
  MAX_ANGLE: Math.PI / 3,    // 60 derece
  
  // Hız sabitleri
  BASE_SPEED: 2.5,          // Temel hız
  MIN_SPEED: 1.5,           // Minimum hız
  MAX_SPEED: 4.0,           // Maksimum hız
  SPEED_DAMPING: 0.98,      // Sürtünme katsayısı
  
  // Sıkışma sabitleri
  COMPRESSION_RATIO: 1.3,    // Temel sıkışma oranı
  MIN_COMPRESSION: 1.1,      // Minimum sıkışma
  MAX_COMPRESSION: 1.5,      // Maksimum sıkışma
  
  // Çarpışma sabitleri
  BOUNCE_THRESHOLD: 5,       // Çarpışma algılama eşiği (piksel)
  EDGE_BUFFER: 2            // Kenar güvenlik alanı (piksel)
} as const 