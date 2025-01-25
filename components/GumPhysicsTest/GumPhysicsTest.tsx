"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { updateChewingState, getChewZoneColor, METER_CONSTANTS, ChewType } from './chewingPhysics'
import { ChewMeter } from './ChewMeter'

interface PhysicsState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  scale: { x: number; y: number }
  isPaused: boolean  // Duraklatma durumu
  lastVelocity: { x: number; y: number }  // Duraklatmadan önceki hız
}

interface GameState {
  lives: number
  score: number
  lastCollisionTime: number | null
  isColliding: boolean
  collisionType: 'none' | 'approaching' | 'perfect' | 'late'
  platformColors: {
    top: string
    bottom: string
  }
}

// Yardımcı fonksiyonlar
const calculateVelocityInfo = (velocity: { x: number; y: number }) => {
  // Hızın büyüklüğü (magnitude)
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
  
  // Hareket açısı (derece cinsinden, 0° sağ, 90° yukarı)
  let angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
  // Açıyı pozitif değere çevir (0-360)
  angle = angle < 0 ? angle + 360 : angle
  
  // Hareket yönü (ok işareti olarak)
  const direction = (() => {
    if (angle > 315 || angle <= 45) return "→"
    if (angle > 45 && angle <= 135) return "↑"
    if (angle > 135 && angle <= 225) return "←"
    return "↓"
  })()

  return { speed, angle, direction }
}

export const GumPhysicsTest = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  
  // Sabitler
  const GUM_SIZE = 40
  
  // Fizik sabitleri
  const PHYSICS_CONSTANTS = {
    MIN_ANGLE: Math.PI / 6,    // 30 derece
    MAX_ANGLE: Math.PI / 3,    // 60 derece
    BASE_SPEED: 2,           // Temel hız
    COMPRESSION_RATIO: 1.3     // Sıkışma oranı
  }

  // Sakız hesaplamaları
  const GUM_CALCULATIONS = {
    // Normal boyut
    NORMAL_SIZE: GUM_SIZE,
    // Sıkıştırılmış yükseklik
    get SQUEEZED_HEIGHT() {
      return GUM_SIZE / PHYSICS_CONSTANTS.COMPRESSION_RATIO
    },
    // Sıkıştırılmış genişlik
    get SQUEEZED_WIDTH() {
      return GUM_SIZE * PHYSICS_CONSTANTS.COMPRESSION_RATIO
    }
  }

  // Oyun durumu
  const [gameState, setGameState] = useState<GameState>({
    lives: 3,
    score: 0,
    lastCollisionTime: null,
    isColliding: false,
    collisionType: 'none',
    platformColors: {
      top: 'bg-white',
      bottom: 'bg-white'
    }
  })
  
  // Çene Sabitleri
  const JAW_CONSTANTS = {
    JAW_HEIGHT: 100,           // Çene yüksekliği
    BOUNCE_OFFSET: 40,         // Sekme mesafesi
    JAW_SPEED: 200,            // Çene hareket hızı (px)
    MAX_CLOSE_SPEED: 10,       // Maksimum kapanma hızı
    // Minimum çene aralığı (sıkıştırılmış sakız yüksekliği + ekstra boşluk)
    get MIN_GAP() {
      return GUM_CALCULATIONS.SQUEEZED_HEIGHT + 10 // 10px ekstra güvenlik boşluğu
    }
  }

  // Çene pozisyonları
  const jawPositions = {
    // Sabit pozisyonlar
    top: 150,                  // Üst çenenin Y pozisyonu
    bottom: 400,               // Alt çenenin en açık Y pozisyonu

    // Çene kenarları
    get topEdge() {
      return this.top + JAW_CONSTANTS.JAW_HEIGHT  // Üst çenenin alt kenarı
    },
    get bottomEdge() {
      return isSpacePressed ? this.closedPosition : this.bottom  // Alt çenenin üst kenarı
    },

    // Sekme noktaları (topun sekmesi için)
    get topBouncePoint() {
      return this.topEdge  // Üst çenenin alt kenarında sekme
    },
    get bottomBouncePoint() {
      return this.bottomEdge  // Alt çenenin üst kenarında sekme
    },

    // Kapanma pozisyonları
    get closedPosition() {
      // Alt çenenin kapanabileceği en üst nokta
      // Üst çenenin alt kenarından tam olarak sıkıştırılmış sakız boyutu kadar aşağıda olmalı
      return this.topEdge + GUM_CALCULATIONS.SQUEEZED_HEIGHT
    },

    // Çeneler arası mesafe
    get currentGap() {
      return Math.abs(this.bottomEdge - this.topEdge)
    }
  }

  // Rastgele açı ve hız hesaplama
  const calculateRandomVelocity = (speed: number = PHYSICS_CONSTANTS.BASE_SPEED) => {
    const angle = PHYSICS_CONSTANTS.MIN_ANGLE + 
      (PHYSICS_CONSTANTS.MAX_ANGLE - PHYSICS_CONSTANTS.MIN_ANGLE) * Math.random()
    const direction = Math.random() > 0.5 ? 1 : -1

    return {
      x: speed * Math.cos(angle) * direction,
      y: speed * Math.sin(angle)
    }
  }

  // Başlangıç hızı
  const initialVelocity = calculateRandomVelocity()

  // Fizik parametreleri
  const [physics, setPhysics] = useState<PhysicsState>({
    position: { x: 400, y: 300 },
    velocity: { ...initialVelocity },
    scale: { x: 1, y: 1 },
    isPaused: false,
    lastVelocity: { ...initialVelocity }
  })

  // Çiğneme durumu
  const [chewState, setChewState] = useState({
    topJaw: 'none' as ChewType,
    bottomJaw: 'none' as ChewType,
    currentScore: 0,
    combo: 0,
    lastChewTime: null as number | null,
    meterValue: 0,
    lastChewType: 'none' as ChewType
  })

  // Alt çene animasyonu için pozisyon hesaplama
  const calculateJawPosition = () => {
    if (isSpacePressed) {
      // Space basılıyken direkt olarak kapanma pozisyonuna git
      return jawPositions.closedPosition
    }
    return jawPositions.bottom
  }

  // Platform renklerini güncelle
  const updatePlatformColors = (position: { x: number, y: number }, velocity: { x: number, y: number }, isBouncingNow: boolean) => {
    const newChewState = updateChewingState(
      position.y,
      jawPositions.topEdge,
      jawPositions.bottomEdge,
      velocity,
      chewState,
      isBouncingNow
    )

    setChewState(newChewState)

    return {
      top: getChewZoneColor(newChewState.topJaw),
      bottom: getChewZoneColor(newChewState.bottomJaw)
    }
  }

  // Fizik güncellemesi
  useEffect(() => {
    let animationFrameId: number

    const updatePhysics = () => {
      setPhysics(prev => {
        const newPhysics = { ...prev }
        
        if (newPhysics.isPaused) {
          return newPhysics
        }

        if (isSpacePressed) {
          // Space basılıyken sakızı çeneler arasında tut
          const targetY = jawPositions.topEdge + GUM_CALCULATIONS.SQUEEZED_HEIGHT / 2
          newPhysics.position.y = targetY
          
          // Sakızı sıkıştır
          newPhysics.scale = {
            x: PHYSICS_CONSTANTS.COMPRESSION_RATIO,
            y: 1 / PHYSICS_CONSTANTS.COMPRESSION_RATIO
          }
          
          return newPhysics
        }
        
        // Normal fizik güncellemeleri...
        newPhysics.position.x += newPhysics.velocity.x
        newPhysics.position.y += newPhysics.velocity.y
        
        // Duvar çarpışmaları (x ekseni)
        if (newPhysics.position.x <= 0 || newPhysics.position.x >= 800) {
          newPhysics.velocity.x *= -1
          newPhysics.position.x = newPhysics.position.x <= 0 ? 0 : 800
        }
        
        // Top sekme kontrolü
        let isBouncingNow = false
        
        // Üst sekme noktası
        if (newPhysics.position.y <= jawPositions.topBouncePoint) {
          isBouncingNow = true
          const newVelocity = calculateRandomVelocity()
          newPhysics.velocity = {
            x: newVelocity.x,
            y: Math.abs(newVelocity.y) // Aşağı yönlendir
          }
          newPhysics.position.y = jawPositions.topBouncePoint
        }
        
        // Alt sekme noktası
        if (newPhysics.position.y >= jawPositions.bottomBouncePoint) {
          isBouncingNow = true
          const newVelocity = calculateRandomVelocity()
          newPhysics.velocity = {
            x: newVelocity.x,
            y: -Math.abs(newVelocity.y) // Yukarı yönlendir
          }
          newPhysics.position.y = jawPositions.bottomBouncePoint
        }

        // Sakız şekil değişimi
        if (isBouncingNow) {
          const compression = PHYSICS_CONSTANTS.COMPRESSION_RATIO
          newPhysics.scale = {
            x: compression,
            y: 1 / compression
          }
        } else {
          newPhysics.scale = {
            x: 1 + (newPhysics.scale.x - 1) * 0.8,
            y: 1 + (newPhysics.scale.y - 1) * 0.8
          }
        }

        // Platform renklerini güncelle
        const newColors = updatePlatformColors(newPhysics.position, newPhysics.velocity, isBouncingNow)
        setGameState(prev => ({
          ...prev,
          platformColors: newColors,
          isColliding: isBouncingNow
        }))
        
        return newPhysics
      })
      
      animationFrameId = requestAnimationFrame(updatePhysics)
    }
    
    animationFrameId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isSpacePressed, gameState.isColliding])

  // Q ve E tuşları için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        // Space basıldığında mevcut hızı sakla
        setPhysics(prev => ({
          ...prev,
          lastVelocity: { ...prev.velocity }
        }))
        setIsSpacePressed(true)
      }
      
      // Q tuşu - Duraklat
      if (e.code === 'KeyQ') {
        setPhysics(prev => ({
          ...prev,
          isPaused: true,
          lastVelocity: { ...prev.velocity },
          velocity: { x: 0, y: 0 }
        }))
      }
      
      // E tuşu - Devam et
      if (e.code === 'KeyE') {
        setPhysics(prev => ({
          ...prev,
          isPaused: false,
          velocity: { ...prev.lastVelocity }
        }))
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Space bırakıldığında saklanmış hızı geri yükle
        setPhysics(prev => ({
          ...prev,
          velocity: { ...prev.lastVelocity }
        }))
        setIsSpacePressed(false)
        setGameState(prev => ({
          ...prev,
          collisionType: 'none'
        }))
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isSpacePressed])

  return (
    <div className="flex flex-col gap-4">
      {/* Debug Panel */}
      <div className="flex gap-4 p-4 bg-white/90 rounded-lg shadow-lg">
        {/* Position Info */}
        <div className="space-y-1">
          <div className="font-bold text-pink-600 border-b pb-1">Position</div>
          <div>X: {physics.position.x.toFixed(0)}</div>
          <div>Y: {physics.position.y.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Game Area: 800x600</div>
        </div>
        
        {/* Velocity Info */}
        <div className="space-y-1">
          <div className="font-bold text-pink-600 border-b pb-1">Velocity</div>
          <div>Magnitude: {calculateVelocityInfo(physics.velocity).speed.toFixed(1)} px/frame</div>
          <div>Angle: {calculateVelocityInfo(physics.velocity).angle.toFixed(1)}°</div>
          <div>Direction: {calculateVelocityInfo(physics.velocity).direction}</div>
          <div className="text-gray-500 text-xs">
            (x: {physics.velocity.x.toFixed(1)}, y: {physics.velocity.y.toFixed(1)})
          </div>
        </div>
        
        {/* Jaw Status */}
        <div className="space-y-1">
          <div className="font-bold text-pink-600 border-b pb-1">Jaw Status</div>
          <div>Space: {isSpacePressed ? 'Pressed ⬆️' : 'Released ⬇️'}</div>
          <div>Status: {physics.isPaused ? '⏸️ Paused' : '▶️ Running'}</div>
          <div>Top Jaw: {jawPositions.top}</div>
          <div>Bottom Jaw: {isSpacePressed ? jawPositions.closedPosition : jawPositions.bottom}</div>
          <div>Gap: {jawPositions.currentGap.toFixed(0)}px</div>
        </div>

        {/* Gum Info */}
        <div className="space-y-1">
          <div className="font-bold text-pink-600 border-b pb-1">Gum</div>
          <div>Size: {GUM_SIZE}px</div>
          <div>Scale X: {physics.scale.x.toFixed(2)}</div>
          <div>Scale Y: {physics.scale.y.toFixed(2)}</div>
          <div>Compression: {((1 - physics.scale.y) * 100).toFixed(0)}%</div>
        </div>

        {/* Chew State */}
        <div className="space-y-1">
          <div className="font-bold text-pink-600 border-b pb-1">Chew State</div>
          <div>Top: {chewState.topJaw}</div>
          <div>Bottom: {chewState.bottomJaw}</div>
          <div>Score: {chewState.currentScore}</div>
        </div>
      </div>

      {/* Chew Meter - Yeni konumu */}
      <div className="flex justify-center w-full">
        <ChewMeter 
          value={chewState.meterValue}
          maxValue={METER_CONSTANTS.MAX_VALUE}
          lastChewType={chewState.lastChewType}
        />
      </div>

      {/* Game Area */}
      <div className="relative w-[800px] h-[600px] bg-pink-100 rounded-lg overflow-hidden" ref={containerRef}>
        {/* Üst çene (sabit) */}
        <div 
          className={`absolute w-full shadow-md transition-colors duration-200 ${gameState.platformColors.top}`}
          style={{ 
            top: jawPositions.top,
            height: JAW_CONSTANTS.JAW_HEIGHT
          }}
        >
          {/* Üst çene alt kenar çizgisi */}
          <div 
            className="absolute w-full h-[2px] bg-red-400 opacity-50" 
            style={{ bottom: 0 }} 
          />
        </div>
        
        {/* Alt çene (hareketli) */}
        <motion.div 
          className={`absolute w-full shadow-md transition-colors duration-200 ${gameState.platformColors.bottom}`}
          style={{
            height: JAW_CONSTANTS.JAW_HEIGHT
          }}
          animate={{ 
            top: calculateJawPosition()
          }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Alt çene üst kenar çizgisi */}
          <div 
            className="absolute w-full h-[2px] bg-red-400 opacity-50" 
            style={{ top: 0 }} 
          />
        </motion.div>
        
        {/* Sakız */}
        <motion.div
          className="absolute bg-pink-400 rounded-full shadow-lg"
          style={{
            width: GUM_SIZE,
            height: GUM_SIZE,
            x: physics.position.x - GUM_SIZE/2,
            y: physics.position.y - GUM_SIZE/2,
            scaleX: physics.scale.x,
            scaleY: physics.scale.y,
            transformOrigin: "center"
          }}
        />
      </div>
    </div>
  )
} 