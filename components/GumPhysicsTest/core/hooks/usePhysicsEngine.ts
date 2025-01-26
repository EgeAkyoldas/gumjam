import { useState, useCallback } from 'react'
import { PHYSICS_CONSTANTS } from '../constants/PhysicsConstants'
import { GAME_CONSTANTS } from '../constants/GameConstants'

// Fizik durumu için interface
interface PhysicsState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  scale: { x: number; y: number }
  isPaused: boolean
  lastVelocity: { x: number; y: number }
  isMoving: boolean
  isBouncing: boolean
}

// Hook için dönüş tipi
interface PhysicsEngineReturn {
  physics: PhysicsState
  updatePhysics: (isSpacePressed: boolean, jawPositions: { topEdge: number; bottomEdge: number }) => void
  resetPhysics: () => void
  setPhysicsPaused: (isPaused: boolean) => void
  calculateRandomVelocity: (baseSpeed?: number, currentVelocity?: { x: number; y: number }) => { x: number; y: number }
}

// Başlangıç hızı
const initialVelocity = {
  x: PHYSICS_CONSTANTS.BASE_SPEED,
  y: PHYSICS_CONSTANTS.BASE_SPEED
}

// Başlangıç durumu
const initialPhysicsState: PhysicsState = {
  position: { x: 400, y: 300 },
  velocity: { ...initialVelocity },
  scale: { x: 1, y: 1 },
  isPaused: true,
  lastVelocity: { ...initialVelocity },
  isMoving: false,
  isBouncing: false
}

export const usePhysicsEngine = (): PhysicsEngineReturn => {
  const [physics, setPhysics] = useState<PhysicsState>(initialPhysicsState)

  // Rastgele hız hesaplama
  const calculateRandomVelocity = useCallback((baseSpeed: number = PHYSICS_CONSTANTS.BASE_SPEED, currentVelocity?: { x: number; y: number }) => {
    const angle = PHYSICS_CONSTANTS.MIN_ANGLE + 
      (PHYSICS_CONSTANTS.MAX_ANGLE - PHYSICS_CONSTANTS.MIN_ANGLE) * Math.random()
    
    // Eğer mevcut hız varsa, yönü koruyarak varyasyon ekle
    if (currentVelocity) {
      const currentAngle = Math.atan2(currentVelocity.y, currentVelocity.x)
      const variation = (Math.random() - 0.5) * 2 * PHYSICS_CONSTANTS.REBOUND_VARIATION
      const newAngle = currentAngle + variation
      
      return {
        x: baseSpeed * Math.cos(newAngle),
        y: baseSpeed * Math.sin(newAngle)
      }
    }
    
    // Yeni rastgele yön
    const direction = Math.random() > 0.5 ? 1 : -1
    return {
      x: baseSpeed * Math.cos(angle) * direction,
      y: baseSpeed * Math.sin(angle)
    }
  }, [])

  // Fizik durumunu güncelleme
  const updatePhysics = useCallback((
    isSpacePressed: boolean,
    jawPositions: { topEdge: number; bottomEdge: number }
  ) => {
    setPhysics(prev => {
      const newPhysics = { ...prev }
      
      if (newPhysics.isPaused) {
        return newPhysics
      }

      if (isSpacePressed) {
        // Space basılıyken sakızı çeneler arasında tut
        const targetY = jawPositions.topEdge + GAME_CONSTANTS.GUM_SIZE / 2
        newPhysics.position.y = targetY
        
        // Sakızı sıkıştır
        newPhysics.scale = {
          x: PHYSICS_CONSTANTS.COMPRESSION_RATIO,
          y: 1 / PHYSICS_CONSTANTS.COMPRESSION_RATIO
        }
        
        return newPhysics
      }
      
      // Normal fizik güncellemeleri
      // Hız sınırlaması
      const speed = Math.sqrt(newPhysics.velocity.x ** 2 + newPhysics.velocity.y ** 2)
      if (speed > PHYSICS_CONSTANTS.MAX_SPEED) {
        const scale = PHYSICS_CONSTANTS.MAX_SPEED / speed
        newPhysics.velocity.x *= scale
        newPhysics.velocity.y *= scale
      } else if (speed < PHYSICS_CONSTANTS.MIN_SPEED && speed > 0) {
        const scale = PHYSICS_CONSTANTS.MIN_SPEED / speed
        newPhysics.velocity.x *= scale
        newPhysics.velocity.y *= scale
      }

      // Sürtünme uygulaması
      newPhysics.velocity.x *= PHYSICS_CONSTANTS.SPEED_DAMPING
      newPhysics.velocity.y *= PHYSICS_CONSTANTS.SPEED_DAMPING
      
      // Pozisyon güncelleme
      newPhysics.position.x += newPhysics.velocity.x
      newPhysics.position.y += newPhysics.velocity.y
      
      // Duvar çarpışmaları (x ekseni)
      if (newPhysics.position.x <= 0 || newPhysics.position.x >= GAME_CONSTANTS.GAME_WIDTH) {
        newPhysics.velocity.x *= -1
        newPhysics.position.x = newPhysics.position.x <= 0 ? 0 : GAME_CONSTANTS.GAME_WIDTH
      }
      
      // Top sekme kontrolü
      let isBouncingNow = false
      
      // Üst sekme noktası
      if (newPhysics.position.y <= jawPositions.topEdge) {
        isBouncingNow = true
        
        // Mevcut hızı kullanarak yeni hız hesapla
        const currentSpeed = Math.sqrt(newPhysics.velocity.x ** 2 + newPhysics.velocity.y ** 2)
        const retainedSpeed = currentSpeed * PHYSICS_CONSTANTS.VELOCITY_RETENTION
        const newVelocity = calculateRandomVelocity(retainedSpeed, newPhysics.velocity)
        
        newPhysics.velocity = {
          x: newVelocity.x,
          y: Math.abs(newVelocity.y) // Aşağı yönlendir
        }
        newPhysics.position.y = jawPositions.topEdge
      }
      
      // Alt sekme noktası
      if (newPhysics.position.y >= jawPositions.bottomEdge) {
        isBouncingNow = true
        
        // Mevcut hızı kullanarak yeni hız hesapla
        const currentSpeed = Math.sqrt(newPhysics.velocity.x ** 2 + newPhysics.velocity.y ** 2)
        const retainedSpeed = currentSpeed * PHYSICS_CONSTANTS.VELOCITY_RETENTION
        const newVelocity = calculateRandomVelocity(retainedSpeed, newPhysics.velocity)
        
        newPhysics.velocity = {
          x: newVelocity.x,
          y: -Math.abs(newVelocity.y) // Yukarı yönlendir
        }
        newPhysics.position.y = jawPositions.bottomEdge
      }

      // Sakız şekil değişimi
      if (isBouncingNow) {
        // Hıza bağlı sıkışma oranı
        const speed = Math.sqrt(newPhysics.velocity.x ** 2 + newPhysics.velocity.y ** 2)
        const speedRatio = Math.min(speed / PHYSICS_CONSTANTS.MAX_SPEED, 1)
        const dynamicCompression = PHYSICS_CONSTANTS.MIN_COMPRESSION + 
          (PHYSICS_CONSTANTS.MAX_COMPRESSION - PHYSICS_CONSTANTS.MIN_COMPRESSION) * speedRatio
        
        newPhysics.scale = {
          x: dynamicCompression,
          y: 1 / dynamicCompression
        }
      } else {
        // Kademeli şekil düzeltme
        newPhysics.scale = {
          x: 1 + (newPhysics.scale.x - 1) * 0.9,
          y: 1 + (newPhysics.scale.y - 1) * 0.9
        }
      }

      newPhysics.isBouncing = isBouncingNow
      newPhysics.isMoving = speed > 0
      
      return newPhysics
    })
  }, [calculateRandomVelocity])

  // Fizik durumunu sıfırlama
  const resetPhysics = useCallback(() => {
    // Random spawn position
    const randomX = Math.random() * (GAME_CONSTANTS.GAME_WIDTH - 200) + 100
    const randomY = Math.random() * 200 + 200

    setPhysics({
      ...initialPhysicsState,
      position: { x: randomX, y: randomY },
      velocity: calculateRandomVelocity()
    })
  }, [calculateRandomVelocity])

  // Duraklatma durumunu ayarlama
  const setPhysicsPaused = useCallback((isPaused: boolean) => {
    setPhysics(prev => ({ ...prev, isPaused }))
  }, [])

  return {
    physics,
    updatePhysics,
    resetPhysics,
    setPhysicsPaused,
    calculateRandomVelocity
  }
}
