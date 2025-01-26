import { useState, useCallback, useEffect } from 'react'
import { CHEWING_CONSTANTS } from '../constants/ChewingConstants'

// Squeeze durumu için interface
interface SqueezeState {
  isSqueezeReady: boolean
  squeezeTimer: number
  isSqueezing: boolean
  squeezeDamage: number
  squeezeStartTime: number | null
}

// Hook için dönüş tipi
interface SqueezeSystemReturn {
  squeezeState: SqueezeState
  startSqueeze: () => void
  endSqueeze: () => void
  resetSqueezeState: () => void
  updateSqueezeState: (combo: number) => void
}

// Başlangıç durumu
const initialSqueezeState: SqueezeState = {
  isSqueezeReady: false,
  squeezeTimer: 0,
  isSqueezing: false,
  squeezeDamage: CHEWING_CONSTANTS.SQUEEZE.DAMAGE,
  squeezeStartTime: null
}

export const useSqueezeSystem = (): SqueezeSystemReturn => {
  const [squeezeState, setSqueezeState] = useState<SqueezeState>(initialSqueezeState)

  // Squeeze durumunu güncelleme
  const updateSqueezeState = useCallback((combo: number) => {
    setSqueezeState(prev => ({
      ...prev,
      isSqueezeReady: combo >= CHEWING_CONSTANTS.SQUEEZE.COMBO_THRESHOLD && !prev.isSqueezing
    }))
  }, [])

  // Squeeze başlatma
  const startSqueeze = useCallback(() => {
    if (squeezeState.isSqueezeReady) {
      setSqueezeState(prev => ({
        ...prev,
        isSqueezing: true,
        squeezeStartTime: Date.now()
      }))
    }
  }, [squeezeState.isSqueezeReady])

  // Squeeze bitirme
  const endSqueeze = useCallback(() => {
    setSqueezeState(prev => ({
      ...prev,
      isSqueezing: false,
      isSqueezeReady: false,
      squeezeTimer: 0,
      squeezeStartTime: null
    }))
  }, [])

  // Squeeze durumunu sıfırlama
  const resetSqueezeState = useCallback(() => {
    setSqueezeState(initialSqueezeState)
  }, [])

  // Squeeze timer kontrolü
  useEffect(() => {
    if (squeezeState.isSqueezing && squeezeState.squeezeStartTime) {
      const interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = currentTime - squeezeState.squeezeStartTime!
        
        if (elapsedTime >= CHEWING_CONSTANTS.SQUEEZE.MAX_DURATION) {
          endSqueeze()
        } else {
          setSqueezeState(prev => ({
            ...prev,
            squeezeTimer: elapsedTime
          }))
        }
      }, 100) // Her 100ms'de bir kontrol et

      return () => clearInterval(interval)
    }
  }, [squeezeState.isSqueezing, squeezeState.squeezeStartTime, endSqueeze])

  return {
    squeezeState,
    startSqueeze,
    endSqueeze,
    resetSqueezeState,
    updateSqueezeState
  }
}
