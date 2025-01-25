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
export type ChewType = 'perfect' | 'good' | 'early' | 'late' | 'none'

// Çiğneme bölgesi hesaplama
export const calculateChewZone = (
  gumPosition: number,   // Sakızın Y pozisyonu
  jawPosition: number,   // Hedef çenenin Y pozisyonu
  direction: 'up' | 'down' // Sakızın hareket yönü
): ChewType => {
  const distance = Math.abs(gumPosition - jawPosition)
  const zones = CHEW_ZONES.ZONE_SIZES

  // Önce mesafeye göre bölge kontrolü
  if (distance <= zones.PERFECT_END) {
    // Perfect bölgesi (0-10px)
    return 'perfect'
  } else if (distance <= zones.GOOD_END) {
    // Good bölgesi (10-30px)
    return 'good'
  } else if (distance <= zones.EARLY_END) {
    // Early/Late kontrolü
    if (direction === 'up') {
      return gumPosition > jawPosition ? 'late' : 'early'
    } else {
      return gumPosition < jawPosition ? 'late' : 'early'
    }
  }

  return 'none'
}

// Çiğneme durumuna göre renk belirleme
export const getChewZoneColor = (chewType: ChewType): string => {
  switch (chewType) {
    case 'perfect':
      return 'bg-green-400'
    case 'good':
      return 'bg-yellow-400'
    case 'early':
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
      return 90
    case 'early':
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
}

// Meter sabitleri
export const METER_CONSTANTS = {
  MAX_VALUE: 100,        // Maksimum değer
  PERFECT_INCREASE: 30,  // Perfect çiğneme için artış (30 puan)
  GOOD_INCREASE: 10,     // Good çiğneme için artış (10 puan)
  DECAY_RATE: 0.1,       // Saniyede azalma miktarı
  DECAY_INTERVAL: 100    // Azalma kontrol aralığı (ms)
}

// Meter değerini güncelle
const updateMeterValue = (
  currentValue: number,
  chewType: ChewType,
  timeDelta: number,
  isBouncingNow: boolean = false
): number => {
  let newValue = currentValue

  // Eğer sakız bouncing yapıyorsa ve önceden sarı/yeşil alanda chewlanmamışsa late olarak işaretle
  if (isBouncingNow && chewType === 'none') {
    return 0
  }

  // Late durumunda meter'ı sıfırla
  if (chewType === 'late') {
    return 0
  }

  // Başarılı çiğneme durumunda artış
  if (chewType === 'perfect') {
    newValue += METER_CONSTANTS.PERFECT_INCREASE
  } else if (chewType === 'good') {
    newValue += METER_CONSTANTS.GOOD_INCREASE
  }

  // Zaman bazlı azalma
  newValue -= (METER_CONSTANTS.DECAY_RATE * timeDelta / 1000)

  // Sınırlar içinde tut (maksimum 100)
  return Math.min(METER_CONSTANTS.MAX_VALUE, Math.max(0, newValue))
}

// Çiğneme durumu güncelleme
export const updateChewingState = (
  gumPosition: number,
  topJawPosition: number,
  bottomJawPosition: number,
  velocity: { x: number, y: number },
  previousState?: ChewingState,
  isBouncingNow: boolean = false
): ChewingState => {
  const direction = velocity.y < 0 ? 'up' : 'down'
  const activeJawPosition = direction === 'up' ? topJawPosition : bottomJawPosition
  const chewType = calculateChewZone(gumPosition, activeJawPosition, direction)
  
  // Zaman farkını hesapla
  const currentTime = Date.now()
  const timeDelta = previousState?.lastChewTime 
    ? currentTime - previousState.lastChewTime 
    : 0

  // Eğer bouncing oluyorsa ve önceden sarı/yeşil alanda chewlanmamışsa late olarak işaretle
  const finalChewType = isBouncingNow && chewType === 'none' ? 'late' : chewType

  // Meter değerini güncelle
  const newMeterValue = updateMeterValue(
    previousState?.meterValue ?? 0,
    finalChewType,
    timeDelta,
    isBouncingNow
  )

  return {
    topJaw: direction === 'up' ? finalChewType : 'none',
    bottomJaw: direction === 'down' ? finalChewType : 'none',
    currentScore: calculateChewScore(finalChewType),
    combo: 0,
    lastChewTime: currentTime,
    meterValue: newMeterValue,
    lastChewType: finalChewType === 'perfect' || finalChewType === 'good' 
      ? finalChewType 
      : (previousState?.lastChewType ?? 'none')
  }
} 