export const GAME_CONSTANTS = {
  // Oyun alanı boyutları
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  
  // Sakız boyutları
  GUM_SIZE: 40,
  
  // Çene sabitleri
  JAW_CONSTANTS: {
    JAW_HEIGHT: 100,           // Çene yüksekliği
    BOUNCE_OFFSET: 40,         // Sekme mesafesi
    JAW_SPEED: 200,            // Çene hareket hızı (px)
    MAX_CLOSE_SPEED: 10,       // Maksimum kapanma hızı
  },

  // Çene pozisyonları
  JAW_POSITIONS: {
    TOP: 150,                  // Üst çenenin Y pozisyonu
    BOTTOM: 400,               // Alt çenenin en açık Y pozisyonu
  },

  // Başlangıç değerleri
  INITIAL_VALUES: {
    LIVES: 3,
    SCORE: 0,
    COMBO: 0
  },

  // Can sistemi
  HEALTH_SYSTEM: {
    MAX_LIVES: 3,
    DAMAGE_COOLDOWN: 500, // ms
    INVINCIBILITY_TIME: 1000 // ms
  }
} as const

// Sakız hesaplamaları için yardımcı fonksiyonlar
export const GUM_CALCULATIONS = {
  // Normal boyut
  NORMAL_SIZE: GAME_CONSTANTS.GUM_SIZE,
  
  // Sıkıştırılmış yükseklik
  get SQUEEZED_HEIGHT() {
    return GAME_CONSTANTS.GUM_SIZE / GAME_CONSTANTS.JAW_CONSTANTS.MAX_CLOSE_SPEED
  },
  
  // Sıkıştırılmış genişlik
  get SQUEEZED_WIDTH() {
    return GAME_CONSTANTS.GUM_SIZE * GAME_CONSTANTS.JAW_CONSTANTS.MAX_CLOSE_SPEED
  }
} 