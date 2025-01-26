import { useState, useCallback } from 'react'
import { PHYSICS_CONSTANTS } from '../constants/PhysicsConstants'
import { GAME_CONSTANTS } from '../constants/GameConstants'

// Fizik durumu için interface
interface PhysicsState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  scale: { x: number; y: number }
  isPaused: boolean
  isBouncing: boolean
  lastBounceTime: number
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
  isBouncing: false,
  lastBounceTime: 0
}

export const usePhysicsEngine = (): PhysicsEngineReturn => {
  const [physics, setPhysics] = useState<PhysicsState>(initialPhysicsState)

  // Rastgele hız hesaplama
  const calculateRandomVelocity = useCallback((baseSpeed: number = PHYSICS_CONSTANTS.BASE_SPEED, currentVelocity?: { x: number; y: number }) => {
    // Eğer mevcut hız varsa, sadece dikey yönde sekme uygula
    if (currentVelocity) {
      // Dikey hızı koru, yatay hızı sıfırla
      return {
        x: 0,
        y: baseSpeed * (currentVelocity.y > 0 ? -1 : 1)
      }
    }
    
    // Başlangıç için sadece aşağı yönlü hareket
    return {
      x: 0,
      y: baseSpeed // Her zaman aşağı yönlü başla
    }
  }, [])

  // Fizik durumunu güncelleme
  const updatePhysics = useCallback((
    isSpacePressed: boolean,
    jawPositions: { topEdge: number; bottomEdge: number }
  ) => {
    setPhysics(prev => {
      const newPhysics = { ...prev }
      const now = Date.now()
      
      if (newPhysics.isPaused) {
        return newPhysics
      }

      // Sürtünme etkisi (sadece dikey)
      newPhysics.velocity.y *= PHYSICS_CONSTANTS.SPEED_DAMPING
      
      // Hız sınırlaması (sadece dikey)
      const speed = Math.abs(newPhysics.velocity.y)
      if (speed > PHYSICS_CONSTANTS.MAX_SPEED) {
        newPhysics.velocity.y *= PHYSICS_CONSTANTS.MAX_SPEED / speed
      } else if (speed < PHYSICS_CONSTANTS.MIN_SPEED && speed > 0) {
        newPhysics.velocity.y *= PHYSICS_CONSTANTS.MIN_SPEED / speed
      }

      // Pozisyon güncelleme (sadece dikey)
      newPhysics.position.y += newPhysics.velocity.y
      
      // Çene çarpışmaları
      let isBouncingNow = false
      const bounceCooldown = 100 // ms
      const canBounce = now - newPhysics.lastBounceTime > bounceCooldown
      
      // Üst çene çarpışması
      if (newPhysics.position.y <= jawPositions.topEdge && canBounce) {
        isBouncingNow = true
        newPhysics.lastBounceTime = now
        
        // Çarpışma hızını hesapla ve yeni hız vektörü oluştur
        const currentSpeed = Math.abs(newPhysics.velocity.y)
        const bounceSpeed = Math.max(currentSpeed * PHYSICS_CONSTANTS.ELASTICITY, PHYSICS_CONSTANTS.MIN_SPEED)
        
        // Sadece dikey yönde sekme
        newPhysics.velocity = {
          x: 0,
          y: Math.abs(bounceSpeed) // Aşağı yönlendir
        }
        
        newPhysics.position.y = jawPositions.topEdge
      }
      
      // Alt çene çarpışması
      if (newPhysics.position.y >= jawPositions.bottomEdge && canBounce) {
        isBouncingNow = true
        newPhysics.lastBounceTime = now
        
        // Her durumda bounce et
        const currentSpeed = Math.abs(newPhysics.velocity.y)
        const bounceSpeed = Math.max(currentSpeed * PHYSICS_CONSTANTS.ELASTICITY, PHYSICS_CONSTANTS.MIN_SPEED)
        
        // Sadece dikey yönde sekme
        newPhysics.velocity = {
          x: 0,
          y: -Math.abs(bounceSpeed) // Yukarı yönlendir
        }
        
        // Space basılıyken ekstra sıkışma efekti
        if (isSpacePressed) {
          newPhysics.scale = {
            x: PHYSICS_CONSTANTS.COMPRESSION_RATIO * 1.2,
            y: 1 / (PHYSICS_CONSTANTS.COMPRESSION_RATIO * 1.2)
          }
        }
        
        newPhysics.position.y = jawPositions.bottomEdge
      }

      // Sakız şekil değişimi
      if (isBouncingNow) {
        // Çarpışma hızına bağlı sıkışma
        const speedRatio = Math.min(Math.abs(newPhysics.velocity.y) / PHYSICS_CONSTANTS.MAX_SPEED, 1)
        const dynamicCompression = PHYSICS_CONSTANTS.MIN_COMPRESSION + 
          (PHYSICS_CONSTANTS.MAX_COMPRESSION - PHYSICS_CONSTANTS.MIN_COMPRESSION) * speedRatio
        
        newPhysics.scale = {
          x: dynamicCompression,
          y: 1 / dynamicCompression
        }
      } else {
        // Kademeli şekil düzeltme
        const returnSpeed = 0.1
        newPhysics.scale = {
          x: 1 + (newPhysics.scale.x - 1) * (1 - returnSpeed),
          y: 1 + (newPhysics.scale.y - 1) * (1 - returnSpeed)
        }
      }

      newPhysics.isBouncing = isBouncingNow
      
      return newPhysics
    })
  }, [calculateRandomVelocity])

  // Fizik durumunu sıfırlama
  const resetPhysics = useCallback(() => {
    // Oyun alanının ortasından başla
    const startX = GAME_CONSTANTS.GAME_WIDTH / 2
    const startY = GAME_CONSTANTS.JAW_POSITIONS.TOP + 100 // Üst çeneden biraz aşağıda

    setPhysics({
      ...initialPhysicsState,
      position: { x: startX, y: startY },
      velocity: calculateRandomVelocity(),
      lastBounceTime: 0
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
