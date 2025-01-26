export const PHYSICS_CONSTANTS = {
  // Çiğneme açı sınırları
  MIN_ANGLE: 3,             // 0 derece - tam yatay
  MAX_ANGLE: 9,   // 360 derece - tam dönüş
  
  // Hız sabitleri
  BASE_SPEED: 3.0,          // Temel hız artırıldı
  MIN_SPEED: 1.5,           // Minimum hız artırıldı
  MAX_SPEED: 5.0,           // Maximum hız artırıldı
  SPEED_DAMPING: 0.995,     // Çok az sürtünme
  
  // Sıkışma sabitleri
  COMPRESSION_RATIO: 1.4,    // Daha fazla sıkışma
  MIN_COMPRESSION: 1.1,      // Minimum sıkışma
  MAX_COMPRESSION: 1.6,      // Maximum sıkışma artırıldı
  
  // Çarpışma sabitleri
  BOUNCE_THRESHOLD: 3,       // Daha hassas çarpışma algılama
  EDGE_BUFFER: 2,           // Kenar tamponu
  
  // Fizik sabitleri
  ELASTICITY: 0.98,         // Daha yüksek elastiklik
  VELOCITY_RETENTION: 0.99,  // Daha yüksek hız korunumu
  REBOUND_VARIATION: 0.4     // Çok daha fazla rastgele sekme
} as const 