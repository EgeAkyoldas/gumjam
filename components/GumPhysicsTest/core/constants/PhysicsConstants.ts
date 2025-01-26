export const PHYSICS_CONSTANTS = {
  // Çiğneme açı sınırları
  MIN_ANGLE: Math.PI / 8,    // 22.5 derece - daha dar açı
  MAX_ANGLE: Math.PI / 2.5,  // 72 derece - daha geniş açı
  
  // Hız sabitleri
  BASE_SPEED: 2.0,          // Temel hızı artırdım
  MIN_SPEED: 1.0,           // Minimum hızı artırdım
  MAX_SPEED: 5.0,           // Maksimum hızı artırdım
  SPEED_DAMPING: 0.95,      // Sürtünmeyi artırdım
  
  // Sıkışma sabitleri
  COMPRESSION_RATIO: 1.5,    // Sıkışma oranını artırdım
  MIN_COMPRESSION: 1.2,      // Minimum sıkışmayı artırdım
  MAX_COMPRESSION: 1.8,      // Maksimum sıkışmayı artırdım
  
  // Çarpışma sabitleri
  BOUNCE_THRESHOLD: 8,       // Çarpışma eşiğini artırdım
  EDGE_BUFFER: 3,           // Kenar güvenliğini artırdım
  
  // Yeni sabitler
  REBOUND_VARIATION: 0.2,    // Sekme varyasyonu
  VELOCITY_RETENTION: 0.7    // Hız koruma oranı
} as const 