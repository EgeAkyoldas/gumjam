import { useState, useCallback } from 'react'
import { CHEWING_CONSTANTS, ChewType, CHEW_ZONE_COLORS } from '../constants/ChewingConstants'

// Çiğneme durumu için interface
interface ChewingState {
  topJaw: ChewType
  bottomJaw: ChewType
  currentScore: number
  combo: number
  lastChewTime: number | null
  meterValue: number
  lastChewType: ChewType
  shouldDamagePlayer: boolean
  shouldDamageGum: boolean
  damageAmount: number
  scoreAmount: number
}

// Hook için dönüş tipi
interface ChewingSystemReturn {
  chewState: ChewingState
  updateChewingState: (
    gumY: number,
    jawPositions: { topEdge: number; bottomEdge: number },
    velocity: { x: number; y: number },
    isBouncing: boolean,
    isSqueezing?: boolean,
    isSpacePressed?: boolean
  ) => void
  resetChewingState: () => void
  getZoneColor: (chewType: ChewType) => string
}

// Başlangıç durumu
const initialChewState: ChewingState = {
  topJaw: 'none',
  bottomJaw: 'none',
  currentScore: 0,
  combo: 0,
  lastChewTime: null,
  meterValue: 0,
  lastChewType: 'none',
  shouldDamagePlayer: false,
  shouldDamageGum: false,
  damageAmount: 0,
  scoreAmount: 0
}

export const useChewingSystem = (): ChewingSystemReturn => {
  const [chewState, setChewState] = useState<ChewingState>(initialChewState)

  // Çiğneme bölgesi hesaplama
  const calculateChewZone = useCallback((
    gumPosition: number,
    jawPosition: number,
    velocity: { x: number; y: number },
    isTopJaw: boolean,
    isBouncing: boolean,
    isSpacePressed: boolean
  ): ChewType => {
    const distance = Math.abs(gumPosition - jawPosition)
    const direction = velocity.y < 0 ? 'up' : 'down'
    const isMovingTowardsJaw = (isTopJaw && direction === 'up') || (!isTopJaw && direction === 'down')

    // Debug için mesafe bilgilerini logla
    console.log('%c[ZONE] Mesafe Kontrolü:', 'color: cyan', {
      gumPosition,
      jawPosition,
      distance,
      direction,
      isTopJaw,
      velocity,
      isBouncing,
      isSpacePressed,
      isMovingTowardsJaw
    })

    // Bölge sınırlarını hesapla
    const perfectZone = CHEWING_CONSTANTS.ZONES.PERFECT.SIZE
    const goodZone = perfectZone + CHEWING_CONSTANTS.ZONES.GOOD.SIZE
    const earlyZone = goodZone + CHEWING_CONSTANTS.ZONES.EARLY.SIZE

    // Space basılıysa ve çeneye yaklaşıyorsa
    if (isSpacePressed && isMovingTowardsJaw) {
      // Perfect ve Good kontrolü
      if (distance <= perfectZone) {
        console.log('%c[ZONE] Perfect Tespit!', 'color: green', {
          distance,
          perfectZone
        })
        return 'perfect'
      } else if (distance <= goodZone) {
        console.log('%c[ZONE] Good Tespit!', 'color: yellow', {
          distance,
          goodZone
        })
        return 'good'
      } else if (distance <= earlyZone) {
        console.log('%c[ZONE] Early Tespit!', 'color: orange', {
          distance,
          earlyZone,
          sebep: 'Çeneye çok uzak ve yaklaşıyor'
        })
        return 'early'
      }
    }

    // Late durumu kontrolü - Sakız sekerken space basılmadıysa
    if (isBouncing && !isSpacePressed && distance <= goodZone) {
      console.log('%c[ZONE] Late Tespit!', 'color: red', {
        sebep: 'Space basılmadı ve sakız sekti',
        distance,
        direction
      })
      return 'late'
    }
    
    // Hiçbir koşula uymuyorsa none
    return 'none'
  }, [])

  // Çiğneme durumu güncelleme
  const updateChewingState = useCallback((
    gumY: number,
    jawPositions: { topEdge: number; bottomEdge: number },
    velocity: { x: number; y: number },
    isBouncing: boolean,
    isSqueezing: boolean = false,
    isSpacePressed: boolean = false
  ) => {
    setChewState(prev => {
      const newState = { ...prev }
      const now = Date.now()

      // Squeeze durumunda farklı davran
      if (isSqueezing) {
        newState.lastChewType = 'perfect'
        newState.shouldDamageGum = true
        newState.shouldDamagePlayer = false
        newState.damageAmount = CHEWING_CONSTANTS.SQUEEZE.DAMAGE
        newState.scoreAmount = CHEWING_CONSTANTS.SQUEEZE.SCORE
        newState.combo = 0
        newState.lastChewTime = now

        console.log('%c[SQUEEZE] Başarılı!', 'color: purple', {
          damage: CHEWING_CONSTANTS.SQUEEZE.DAMAGE,
          score: CHEWING_CONSTANTS.SQUEEZE.SCORE
        })

        return newState
      }

      // Hareket yönünü belirle
      const direction = velocity.y < 0 ? 'up' : 'down'
      
      // Aktif çeneye göre çiğneme tipini belirle
      const isTopJaw = direction === 'up'
      const activeJaw = isTopJaw ? jawPositions.topEdge : jawPositions.bottomEdge
      const chewType = calculateChewZone(gumY, activeJaw, velocity, isTopJaw, isBouncing, isSpacePressed)

      // Debug için çiğneme bilgilerini logla
      console.log('%c[CHEW] Durum:', 'color: blue', {
        direction,
        isTopJaw,
        gumY,
        activeJaw,
        chewType,
        velocity,
        isBouncing,
        lastChewTime: prev.lastChewTime
      })

      // Çene durumlarını güncelle
      if (isTopJaw) {
        newState.topJaw = chewType
        newState.bottomJaw = 'none'
      } else {
        newState.topJaw = 'none'
        newState.bottomJaw = chewType
      }

      // Varsayılan değerler
      newState.shouldDamageGum = false
      newState.shouldDamagePlayer = false
      newState.damageAmount = 0
      newState.scoreAmount = 0

      // Çiğneme zamanlaması kontrolü
      if (prev.lastChewTime && now - prev.lastChewTime < 200) {
        console.log('%c[CHEW] Çok hızlı çiğneme!', 'color: orange', {
          timeSinceLastChew: now - prev.lastChewTime,
          minRequired: 200,
          chewType,
          shouldSkip: true,
          message: 'Çiğneme engellendi - çok hızlı'
        })
        return prev
      }

      // Early durumu için cooldown kontrolü
      if (chewType === 'early') {
        const earlyCooldown = 1000 // 1 saniye cooldown
        if (prev.lastChewTime && now - prev.lastChewTime < earlyCooldown) {
          console.log('%c[CHEW] Early immune!', 'color: orange', {
            timeSinceLastChew: now - prev.lastChewTime,
            cooldown: earlyCooldown,
            message: 'Early hasarına karşı bağışıklık'
          })
          return prev
        }
      }

      // Late durumu için cooldown kontrolü
      if (chewType === 'late') {
        const lateCooldown = 500 // 500ms cooldown
        if (prev.lastChewTime && now - prev.lastChewTime < lateCooldown) {
          console.log('%c[CHEW] Late immune!', 'color: red', {
            timeSinceLastChew: now - prev.lastChewTime,
            cooldown: lateCooldown,
            message: 'Late hasarına karşı bağışıklık'
          })
          return prev
        }
      }

      // Çiğneme tipine göre durumu güncelle
      switch (chewType) {
        case 'perfect':
          newState.shouldDamageGum = true
          newState.shouldDamagePlayer = false
          newState.damageAmount = CHEWING_CONSTANTS.ZONES.PERFECT.DAMAGE
          newState.scoreAmount = CHEWING_CONSTANTS.ZONES.PERFECT.SCORE
          newState.combo += CHEWING_CONSTANTS.COMBO.PERFECT_INCREASE // Perfect için +2 combo
          newState.meterValue = Math.min(
            CHEWING_CONSTANTS.METER.MAX_VALUE,
            newState.meterValue + CHEWING_CONSTANTS.METER.PERFECT_INCREASE
          )
          console.log('%c[CHEW] Perfect Success!', 'color: green', {
            damage: newState.damageAmount,
            score: newState.scoreAmount,
            combo: newState.combo,
            meter: newState.meterValue,
            message: 'Perfect! +2 Combo'
          })
          break

        case 'good':
          newState.shouldDamageGum = true
          newState.shouldDamagePlayer = false
          newState.damageAmount = CHEWING_CONSTANTS.ZONES.GOOD.DAMAGE
          newState.scoreAmount = CHEWING_CONSTANTS.ZONES.GOOD.SCORE
          newState.combo += CHEWING_CONSTANTS.COMBO.GOOD_INCREASE // Good için +1 combo
          newState.meterValue = Math.min(
            CHEWING_CONSTANTS.METER.MAX_VALUE,
            newState.meterValue + CHEWING_CONSTANTS.METER.GOOD_INCREASE
          )
          console.log('%c[CHEW] Good Success!', 'color: yellow', {
            damage: newState.damageAmount,
            score: newState.scoreAmount,
            combo: newState.combo,
            meter: newState.meterValue,
            message: 'Good! +1 Combo'
          })
          break

        case 'early':
          newState.shouldDamageGum = false
          newState.shouldDamagePlayer = true
          newState.damageAmount = CHEWING_CONSTANTS.ZONES.EARLY.DAMAGE
          newState.scoreAmount = CHEWING_CONSTANTS.ZONES.EARLY.SCORE
          newState.combo = Math.max(0, newState.combo - CHEWING_CONSTANTS.COMBO.EARLY_DECREASE) // Early için -1 combo (minimum 0)
          newState.meterValue = Math.max(0, newState.meterValue - CHEWING_CONSTANTS.METER.EARLY_DECREASE)
          console.log('%c[CHEW] Early Unsuccessful!', 'color: orange', {
            combo: newState.combo,
            meter: newState.meterValue,
            shouldDamagePlayer: newState.shouldDamagePlayer,
            damageAmount: newState.damageAmount,
            message: `Erken çiğneme - Combo -1`
          })
          break

        case 'late':
          newState.shouldDamageGum = false
          newState.shouldDamagePlayer = true
          newState.damageAmount = CHEWING_CONSTANTS.ZONES.LATE.HEALTH_PENALTY
          newState.scoreAmount = CHEWING_CONSTANTS.ZONES.LATE.SCORE
          newState.combo = 0 // Late durumunda combo sıfırlanır
          newState.meterValue = 0
          console.log('%c[CHEW] Late Unsuccessful!', 'color: red', {
            combo: newState.combo,
            meter: newState.meterValue,
            shouldDamagePlayer: newState.shouldDamagePlayer,
            damageAmount: newState.damageAmount,
            message: 'Geç çiğneme - Combo sıfırlandı!'
          })
          break

        default:
          // None durumunda hiçbir şey olmaz
          console.log('%c[CHEW] None', 'color: gray', {
            chewType,
            shouldDamagePlayer: false
          })
          break
      }

      // Son çiğneme zamanını güncelle
      if (chewType !== 'none') {
        newState.lastChewTime = now
        newState.lastChewType = chewType
      }

      return newState
    })
  }, [calculateChewZone])

  // Çiğneme durumunu sıfırlama
  const resetChewingState = useCallback(() => {
    setChewState(initialChewState)
  }, [])

  // Bölge rengini alma
  const getZoneColor = useCallback((chewType: ChewType): string => {
    return CHEW_ZONE_COLORS[chewType.toUpperCase() as keyof typeof CHEW_ZONE_COLORS] || CHEW_ZONE_COLORS.NONE
  }, [])

  return {
    chewState,
    updateChewingState,
    resetChewingState,
    getZoneColor
  }
}
