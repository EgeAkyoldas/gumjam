// Çiğneme bölgeleri için sabitler
export const CHEW_ZONES = {
  // Toplam çene aralığı: 150px
  TOTAL_GAP: 150,
  
  // Bölge çarpanları (x)
  ZONE_MULTIPLIERS: {
    PERFECT: 2,     // Yeşil bölge: 1x
    GOOD: 4,        // Sarı bölge: 2x
    EARLY_LATE: 9  // Kırmızı bölge: 12x
  },

  // Bölge boyutları (piksel)
  get ZONE_SIZES() {
    // Toplam çarpan: 15x (1 + 2 + 12)
    const totalMultiplier = 
      this.ZONE_MULTIPLIERS.PERFECT + 
      this.ZONE_MULTIPLIERS.GOOD + 
      this.ZONE_MULTIPLIERS.EARLY_LATE

    // Bir birim (1x) için piksel değeri
    const baseUnit = this.TOTAL_GAP / totalMultiplier

    // Bölge boyutlarını hesapla
    const perfect = baseUnit * this.ZONE_MULTIPLIERS.PERFECT     // 20px (1x)
    const good = baseUnit * this.ZONE_MULTIPLIERS.GOOD           // 40px (2x)
    const earlyLate = baseUnit * this.ZONE_MULTIPLIERS.EARLY_LATE // 90px (12x)

    // Bölge sınırları (başlangıç ve bitiş noktaları)
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

// Çiğneme durumu tipleri
export type ChewType = 'none' | 'perfect' | 'good' | 'early' | 'late'

// Çiğneme bölgesi hesaplama
export const calculateChewZone = (
  gumPosition: number,
  jawPosition: number
): ChewType => {
  const distance = Math.abs(gumPosition - jawPosition)
  const zones = CHEW_ZONES.ZONE_SIZES

  if (distance <= zones.PERFECT_END) {
    return 'perfect'
  } else if (distance <= zones.GOOD_END) {
    return 'good'
  } else if (distance <= zones.EARLY_END) {
    return 'early'
  } else {
    return 'late'
  }
}

// Çiğneme durumuna göre renk belirleme
export const getChewZoneColor = (chewType: ChewType): string => {
  switch (chewType) {
    case 'perfect':
      return 'bg-green-400'
    case 'good':
      return 'bg-yellow-400'
    case 'early':
      return 'bg-orange-400'
    case 'late':
      return 'bg-red-400'
    default:
      return 'bg-white'
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
      return 0
    case 'late':
      return 10
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
    PERFECT: 15,    // Perfect çiğneme hasarı
    GOOD: 10,       // Good çiğneme hasarı
    EARLY: 0,       // Early durumunda hasar yok
    SQUEEZE: 30     // Squeeze hasarı
  },
  SCORE: {
    PERFECT: 100,   // Perfect skor
    GOOD: 50,       // Good skor
    EARLY: 0,       // Early'de skor yok
    SQUEEZE: 200    // Squeeze bonus
  },
  COMBO: {
    PERFECT_INCREASE: 1,
    GOOD_INCREASE: 1,
    EARLY_DECREASE: 1,
    SQUEEZE_RESET: true
  },
  SQUEEZE: {
    COMBO_THRESHOLD: 3,
    MAX_DURATION: 2000,
    COMPRESSION_RATIO: 2.0
  }
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
  // Log detayları için tip
  interface ChewLogDetails {
    damage?: number
    score?: number
    playerDamage?: number
    comboIncrease?: number
    comboDecrease?: number
    comboReset?: boolean
    newCombo?: number
    distances?: {
      fromTop: number
      fromBottom: number
    }
  }

  // Debug log için yardımcı fonksiyon
  const logChewAction = (action: string, details: ChewLogDetails) => {
    console.log(`%c[CHEW ACTION] ${action}`, 'color: #ff69b4', {
      ...details,
      timestamp: new Date().toISOString(),
      gumPosition: gumY,
      topEdge,
      bottomEdge,
      isBouncingNow,
      isSqueezing,
      currentCombo: currentState.combo
    })
  }

  const newState: ChewingState = {
    ...currentState,
    shouldDamagePlayer: false,
    shouldDamageGum: false,
    damageAmount: 0,
    scoreAmount: 0,
    topJaw: 'none',    // Reset jaw states
    bottomJaw: 'none'  // Reset jaw states
  }

  // Squeeze durumunda farklı davran
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

  // Hareket yönünü belirle
  const direction = velocity.y < 0 ? 'up' : 'down'
  
  // Normal çiğneme kontrolü
  const perfectZone = 20
  const goodZone = 40
  const earlyZone = 60

  // Aktif çeneye olan mesafeyi hesapla
  const activeJawDistance = direction === 'up' 
    ? Math.abs(gumY - topEdge)
    : Math.abs(gumY - bottomEdge)

  // Çiğneme tipini belirle
  let chewType: ChewType = 'none'
  if (activeJawDistance <= perfectZone) {
    chewType = 'perfect'
  } else if (activeJawDistance <= goodZone) {
    chewType = 'good'
  } else if (activeJawDistance <= earlyZone) {
    chewType = 'early'
  } else {
    chewType = 'late'
  }

  // Sadece aktif çenenin durumunu güncelle
  if (direction === 'up') {
    newState.topJaw = chewType
    newState.bottomJaw = 'none'
  } else {
    newState.topJaw = 'none'
    newState.bottomJaw = chewType
  }

  // Çiğneme zamanlaması kontrolü
  if (isBouncingNow) {
    const now = Date.now()

    if (chewType === 'perfect') {
      newState.lastChewType = 'perfect'
      newState.shouldDamageGum = true
      newState.shouldDamagePlayer = false
      newState.damageAmount = CHEW_CONSTANTS.DAMAGE.PERFECT
      newState.scoreAmount = CHEW_CONSTANTS.SCORE.PERFECT
      newState.combo += CHEW_CONSTANTS.COMBO.PERFECT_INCREASE

      logChewAction('PERFECT CHEW', {
        damage: CHEW_CONSTANTS.DAMAGE.PERFECT,
        score: CHEW_CONSTANTS.SCORE.PERFECT,
        comboIncrease: CHEW_CONSTANTS.COMBO.PERFECT_INCREASE,
        newCombo: newState.combo
      })

    } else if (chewType === 'good') {
      newState.lastChewType = 'good'
      newState.shouldDamageGum = true
      newState.shouldDamagePlayer = false
      newState.damageAmount = CHEW_CONSTANTS.DAMAGE.GOOD
      newState.scoreAmount = CHEW_CONSTANTS.SCORE.GOOD
      newState.combo += CHEW_CONSTANTS.COMBO.GOOD_INCREASE

      logChewAction('GOOD CHEW', {
        damage: CHEW_CONSTANTS.DAMAGE.GOOD,
        score: CHEW_CONSTANTS.SCORE.GOOD,
        comboIncrease: CHEW_CONSTANTS.COMBO.GOOD_INCREASE,
        newCombo: newState.combo
      })

    } else if (chewType === 'early') {
      newState.lastChewType = 'early'
      newState.shouldDamageGum = false
      newState.shouldDamagePlayer = false
      newState.combo = Math.max(0, newState.combo - CHEW_CONSTANTS.COMBO.EARLY_DECREASE)

      logChewAction('EARLY CHEW', {
        comboDecrease: CHEW_CONSTANTS.COMBO.EARLY_DECREASE,
        newCombo: newState.combo
      })

    } else if (chewType === 'late') {
      // Sadece 'late' durumunda oyuncu hasar alır
      newState.lastChewType = 'late'
      newState.shouldDamagePlayer = true
      newState.shouldDamageGum = false
      newState.combo = 0
      newState.scoreAmount = 0

      logChewAction('LATE CHEW', {
        playerDamage: 1,
        comboReset: true,
        distances: {
          fromTop: Math.abs(gumY - topEdge),
          fromBottom: Math.abs(gumY - bottomEdge)
        }
      })
    }

    newState.lastChewTime = now
  }

  return newState
} 