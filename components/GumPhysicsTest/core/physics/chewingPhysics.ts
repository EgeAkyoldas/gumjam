// Çiğneme bölgeleri için sabitler
export const CHEW_ZONES = {
  // Toplam çene aralığı: 150px
  TOTAL_GAP: 150,
  
  // Bölge çarpanları (x)
  ZONE_MULTIPLIERS: {
    PERFECT: 3,     // Yeşil bölge: 3x
    GOOD: 5,        // Sarı bölge: 5x
    EARLY_LATE: 7   // Kırmızı bölge: 7x
  },

  // Bölge boyutları (piksel)
  get ZONE_SIZES() {
    // Toplam çarpan: 15x
    const totalMultiplier = 
      this.ZONE_MULTIPLIERS.PERFECT + 
      this.ZONE_MULTIPLIERS.GOOD + 
      this.ZONE_MULTIPLIERS.EARLY_LATE

    // Bir birim (1x) için piksel değeri
    const baseUnit = this.TOTAL_GAP / totalMultiplier

    // Bölge boyutlarını hesapla
    const perfect = baseUnit * this.ZONE_MULTIPLIERS.PERFECT     // 30px
    const good = baseUnit * this.ZONE_MULTIPLIERS.GOOD           // 50px
    const earlyLate = baseUnit * this.ZONE_MULTIPLIERS.EARLY_LATE // 70px

    return {
      PERFECT_START: 0,
      PERFECT_END: perfect,
      GOOD_START: perfect,
      GOOD_END: perfect + good,
      EARLY_START: perfect + good,
      EARLY_END: perfect + good + earlyLate
    }
  }
}

// Çiğneme durumları
export type ChewType = 'none' | 'perfect' | 'good' | 'early' | 'late'

// Çiğneme bölgesi hesaplama
export const calculateChewZone = (
  gumPosition: number,
  jawPosition: number,
  velocity: { x: number; y: number }
): ChewType => {
  const currentVelocity = Math.abs(velocity.y)
  const direction = velocity.y < 0 ? 'up' : 'down'
  const distance = Math.abs(gumPosition - jawPosition)
  
  // Yön kontrolü - sakızın yönü ile çene pozisyonu uyumsuzsa
  const isWrongDirection = (direction === 'up' && gumPosition > jawPosition) || 
                         (direction === 'down' && gumPosition < jawPosition)
  
  if (isWrongDirection) {
    return 'late'
  }

  const zones = CHEW_ZONES.ZONE_SIZES
  
  // Normal bölge kontrolleri
  if (distance <= zones.PERFECT_END) {
    return 'perfect'
  } else if (distance <= zones.GOOD_END) {
    return 'good'
  } else if (distance <= zones.EARLY_END) {
    return 'early'
  } 
  
  return 'late'
}

// Çiğneme bölgesi renklerini belirle
export const getChewZoneColor = (chewType: ChewType): string => {
  switch (chewType) {
    case 'perfect':
      return 'bg-gradient-to-r from-green-400 to-green-500'
    case 'good':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
    case 'early':
      return 'bg-gradient-to-r from-orange-400 to-orange-500'
    case 'late':
      return 'bg-gradient-to-r from-red-400 to-red-500'
    default:
      return 'bg-gradient-to-r from-gray-200 to-gray-300'
  }
}

// Çiğneme skoru hesaplama
export const calculateChewScore = (chewType: ChewType): number => {
  switch (chewType) {
    case 'perfect':
      return 100
    case 'good':
      return 50
    case 'early':
      return 10
    case 'late':
      return 0
    default:
      return 0
  }
}

// Çiğneme durumu kontrolü
export interface ChewingState {
  topJaw: ChewType
  bottomJaw: ChewType
  currentScore: number
  combo: number
  lastChewTime: number | null
  meterValue: number     // Meter değeri (0-100)
  lastChewType: ChewType // Son başarılı çiğneme tipi
  shouldDamagePlayer: boolean // Oyuncuya hasar verilmeli mi?
  shouldDamageGum: boolean    // Sakıza hasar verilmeli mi?
  damageAmount: number        // Verilecek hasar miktarı
  scoreAmount: number         // Kazanılacak puan
}

// Meter sabitleri
export const METER_CONSTANTS = {
  MAX_VALUE: 100,        // Maksimum değer
  PERFECT_INCREASE: 30,  // Perfect çiğneme için artış (30 puan)
  GOOD_INCREASE: 10,     // Good çiğneme için artış (10 puan)
  DECAY_RATE: 0.1,       // Saniyede azalma miktarı
  DECAY_INTERVAL: 100    // Azalma kontrol aralığı (ms)
}

export const CHEW_CONSTANTS = {
  DAMAGE: {
    PERFECT: 15,    
    GOOD: 10,       
    EARLY: 0.5,     
    LATE: 2,        // Late hasar değerini artırdım
    SQUEEZE: 30     
  },
  SCORE: {
    PERFECT: 100,   
    GOOD: 50,       
    EARLY: 10,      // Early'de küçük bir skor ekledim
    LATE: 0,        
    SQUEEZE: 200    
  },
  COMBO: {
    PERFECT_INCREASE: 1,
    GOOD_INCREASE: 1,
    EARLY_DECREASE: 0.5,  // Early combo kaybını azalttım
    LATE_DECREASE: 1,     // Late için yeni combo kaybı
    SQUEEZE_RESET: true
  },
  // Yeni tolerans değerleri
  TOLERANCE: {
    VELOCITY_THRESHOLD: 20,
    EARLY_BUFFER: 15,
    LATE_BUFFER: 15,
    BOUNCE_WINDOW: 200    // Sekme öncesi çiğneme penceresi (ms)
  }
}

// Log detayları için interface
interface ChewLogDetails {
  damage?: number
  score?: number
  comboIncrease?: number
  comboDecrease?: number
  newCombo?: number
  comboReset?: boolean
  playerDamage?: number
  gumDamage?: number
  distances?: {
    fromTop: number
    fromBottom: number
  }
}

// Log fonksiyonu
const logChewAction = (actionType: string, details: ChewLogDetails) => {
  console.log(`[CHEW ACTION] ${actionType}`, details)
}

// Çiğneme durumu güncelleme
export const updateChewingState = (
  gumY: number,
  topEdge: number,
  bottomEdge: number,
  velocity: { x: number; y: number },
  currentState: ChewingState,
  isBouncingNow: boolean,
  isSqueezing: boolean = false
): ChewingState => {
  const newState: ChewingState = {
    ...currentState,
    shouldDamagePlayer: false,
    shouldDamageGum: false,
    damageAmount: 0,
    scoreAmount: 0,
    topJaw: 'none',
    bottomJaw: 'none'
  }

  // Squeeze kontrolü
  if (isSqueezing) {
    newState.lastChewType = 'perfect'
    newState.shouldDamageGum = true
    newState.damageAmount = CHEW_CONSTANTS.DAMAGE.SQUEEZE
    newState.scoreAmount = CHEW_CONSTANTS.SCORE.SQUEEZE
    newState.combo = 0

    logChewAction('SQUEEZE', {
      damage: CHEW_CONSTANTS.DAMAGE.SQUEEZE,
      score: CHEW_CONSTANTS.SCORE.SQUEEZE,
      comboReset: true
    })

    return newState
  }

  const direction = velocity.y < 0 ? 'up' : 'down'
  const activeJawPosition = direction === 'up' ? topEdge : bottomEdge
  const chewType = calculateChewZone(gumY, activeJawPosition, velocity)

  // Sadece aktif çenenin durumunu güncelle
  if (direction === 'up') {
    newState.topJaw = chewType
  } else {
    newState.bottomJaw = chewType
  }

  // Çiğneme zamanlaması kontrolü
  const now = Date.now()
  const timeSinceLastChew = currentState.lastChewTime ? now - currentState.lastChewTime : Infinity

  // Late durumu - sekme öncesi yanlış yönde veya zamanında çiğnenmemişse
  if (chewType === 'late' && isBouncingNow) {
    newState.lastChewType = 'late'
    newState.shouldDamagePlayer = true
    newState.shouldDamageGum = false
    newState.damageAmount = CHEW_CONSTANTS.DAMAGE.LATE
    newState.scoreAmount = 0
    newState.combo = 0

    logChewAction('LATE CHEW', {
      playerDamage: CHEW_CONSTANTS.DAMAGE.LATE,
      comboReset: true,
      distances: {
        fromTop: Math.abs(gumY - topEdge),
        fromBottom: Math.abs(gumY - bottomEdge)
      }
    })
  } else if (isBouncingNow) {
    // Normal çiğneme durumları
    if (chewType === 'perfect') {
      newState.lastChewType = 'perfect'
      newState.shouldDamageGum = true        // Sakız hasar alır
      newState.shouldDamagePlayer = false    // Oyuncu hasar almaz
      newState.damageAmount = CHEW_CONSTANTS.DAMAGE.PERFECT
      newState.scoreAmount = CHEW_CONSTANTS.SCORE.PERFECT
      newState.combo += CHEW_CONSTANTS.COMBO.PERFECT_INCREASE

      logChewAction('PERFECT CHEW', {
        damage: CHEW_CONSTANTS.DAMAGE.PERFECT,
        score: CHEW_CONSTANTS.SCORE.PERFECT,
        comboIncrease: CHEW_CONSTANTS.COMBO.PERFECT_INCREASE,
        newCombo: newState.combo,
        gumDamage: CHEW_CONSTANTS.DAMAGE.PERFECT
      })

    } else if (chewType === 'good') {
      newState.lastChewType = 'good'
      newState.shouldDamageGum = true        // Sakız hasar alır
      newState.shouldDamagePlayer = false    // Oyuncu hasar almaz
      newState.damageAmount = CHEW_CONSTANTS.DAMAGE.GOOD
      newState.scoreAmount = CHEW_CONSTANTS.SCORE.GOOD
      newState.combo += CHEW_CONSTANTS.COMBO.GOOD_INCREASE

      logChewAction('GOOD CHEW', {
        damage: CHEW_CONSTANTS.DAMAGE.GOOD,
        score: CHEW_CONSTANTS.SCORE.GOOD,
        comboIncrease: CHEW_CONSTANTS.COMBO.GOOD_INCREASE,
        newCombo: newState.combo,
        gumDamage: CHEW_CONSTANTS.DAMAGE.GOOD
      })

    } else if (chewType === 'early') {
      newState.lastChewType = 'early'
      newState.shouldDamageGum = false
      newState.shouldDamagePlayer = true
      newState.damageAmount = CHEW_CONSTANTS.DAMAGE.EARLY
      newState.scoreAmount = CHEW_CONSTANTS.SCORE.EARLY
      newState.combo = Math.max(0, newState.combo - CHEW_CONSTANTS.COMBO.EARLY_DECREASE)

      logChewAction('EARLY CHEW', {
        playerDamage: CHEW_CONSTANTS.DAMAGE.EARLY,
        comboDecrease: CHEW_CONSTANTS.COMBO.EARLY_DECREASE,
        newCombo: newState.combo,
        score: CHEW_CONSTANTS.SCORE.EARLY
      })
    }
  }

  newState.lastChewTime = now
  return newState
} 