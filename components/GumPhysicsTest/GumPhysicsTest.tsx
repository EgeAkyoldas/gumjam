"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { updateChewingState, getChewZoneColor, ChewType } from './chewingPhysics'
import { PlayerTest } from './PlayerTest'
import { GumTest } from './GumTest'
import { PlayerState, initialPlayerState } from '../GameState/PlayerState'
import { GumState, initialGumState } from '../GameState/GumState'

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
  gameStatus: 'idle' | 'playing' | 'ended'
}

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

// Squeeze durumu için interface
interface SqueezeState {
  isSqueezeReady: boolean
  squeezeTimer: number
  isSqueezing: boolean
  squeezeDamage: number
  squeezeStartTime: number | null
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
    },
    gameStatus: 'idle'
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

  // Başlangıç hızı - sabit değerler
  const initialVelocity = {
    x: PHYSICS_CONSTANTS.BASE_SPEED,
    y: PHYSICS_CONSTANTS.BASE_SPEED
  }

  // Fizik parametreleri
  const [physics, setPhysics] = useState<PhysicsState>({
    position: { x: 400, y: 300 },
    velocity: { ...initialVelocity },
    scale: { x: 1, y: 1 },
    isPaused: false,
    lastVelocity: { ...initialVelocity }
  })

  // Çiğneme durumu
  const [chewState, setChewState] = useState<ChewingState>({
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
  })

  // Player ve Gum state'leri
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState)
  const [gumState, setGumState] = useState<GumState>(initialGumState)

  // Squeeze durumu
  const [squeezeState, setSqueezeState] = useState<SqueezeState>({
    isSqueezeReady: false,
    squeezeTimer: 0,
    isSqueezing: false,
    squeezeDamage: 30,
    squeezeStartTime: null
  })

  // Platform renklerini güncelle
  const updatePlatformColors = (position: { x: number, y: number }, velocity: { x: number, y: number }, isBouncingNow: boolean) => {
    const newChewState = updateChewingState(
      position.y,
      jawPositions.topEdge,
      jawPositions.bottomEdge,
      velocity,
      chewState,
      isBouncingNow,
      squeezeState.isSqueezing
    )

    setChewState(newChewState)

    // Debug log
    console.log('%c[GAME STATE]', 'color: #4CAF50', {
      timestamp: new Date().toISOString(),
      position,
      velocity,
      isBouncingNow,
      isSqueezing: squeezeState.isSqueezing,
      chewState: newChewState,
      playerHealth: playerState.health,
      gumHealth: gumState.health,
      combo: newChewState.combo,
      score: playerState.score
    })

    // Hasar ve skor güncellemeleri
    if (newChewState.shouldDamagePlayer) {
      console.log('%c[DAMAGE] Player takes damage!', 'color: #f44336', {
        previousHealth: playerState.health,
        newHealth: Math.max(0, playerState.health - 1)
      })

      setPlayerState(prev => ({
        ...prev,
        health: Math.max(0, prev.health - 1),
        comboPoints: 0
      }))

      // Sakız gülme animasyonu
      setGumState(prev => ({
        ...prev,
        isLaughing: true
      }))
      setTimeout(() => {
        setGumState(prev => ({
          ...prev,
          isLaughing: false
        }))
      }, 500)
    }

    if (newChewState.shouldDamageGum) {
      const newHealth = Math.max(0, gumState.health - newChewState.damageAmount)
      console.log('%c[DAMAGE] Gum takes damage!', 'color: #2196F3', {
        damage: newChewState.damageAmount,
        previousHealth: gumState.health,
        newHealth: newHealth
      })

      setGumState(prev => ({
        ...prev,
        health: newHealth
      }))

      // Skor ve combo güncellemesi
      const newScore = playerState.score + newChewState.scoreAmount
      console.log('%c[SCORE] Score update!', 'color: #FFC107', {
        scoreGain: newChewState.scoreAmount,
        previousScore: playerState.score,
        newScore: newScore,
        combo: newChewState.combo
      })

      setPlayerState(prev => ({
        ...prev,
        score: newScore,
        comboPoints: prev.comboPoints + newChewState.scoreAmount
      }))
    }

    return {
      top: getChewZoneColor(newChewState.topJaw),
      bottom: getChewZoneColor(newChewState.bottomJaw)
    }
  }

  // İlk yüklenmede rastgele hız ata
  useEffect(() => {
    const randomVelocity = calculateRandomVelocity()
    setPhysics(prev => ({
      ...prev,
      velocity: randomVelocity,
      lastVelocity: randomVelocity
    }))
  }, [])

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

  // Space tuşu için yeni event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!isSpacePressed) {
          // Space'e ilk basıldığında
          setIsSpacePressed(true)
          
          // Eğer squeeze hazırsa
          if (squeezeState.isSqueezeReady) {
            setSqueezeState(prev => ({
              ...prev,
              isSqueezing: true,
              squeezeStartTime: Date.now()
            }))
          } else {
            // Normal çiğneme için mevcut hızı sakla
            setPhysics(prev => ({
              ...prev,
              lastVelocity: { ...prev.velocity }
            }))
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        
        // Squeeze modundan çıkış
        if (squeezeState.isSqueezing) {
          setSqueezeState(prev => ({
            ...prev,
            isSqueezing: false,
            isSqueezeReady: false,
            squeezeTimer: 0,
            squeezeStartTime: null
          }))
          
          // Sakıza squeeze hasarı ver
          setGumState(prev => ({
            ...prev,
            health: Math.max(0, prev.health - squeezeState.squeezeDamage)
          }))
        }

        // Normal çiğneme için hızı geri yükle
        setPhysics(prev => ({
          ...prev,
          velocity: { ...prev.lastVelocity }
        }))
        
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
  }, [isSpacePressed, squeezeState.isSqueezeReady, squeezeState.isSqueezing])

  // Squeeze timer kontrolü
  useEffect(() => {
    if (squeezeState.isSqueezing && squeezeState.squeezeStartTime) {
      const interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = currentTime - squeezeState.squeezeStartTime!
        
        if (elapsedTime >= 2000) {
          // 2 saniye dolduğunda squeeze'i bitir
          setSqueezeState(prev => ({
            ...prev,
            isSqueezing: false,
            isSqueezeReady: false,
            squeezeTimer: 0,
            squeezeStartTime: null
          }))
          setIsSpacePressed(false)
        } else {
          setSqueezeState(prev => ({
            ...prev,
            squeezeTimer: elapsedTime
          }))
        }
      }, 100) // Her 100ms'de bir kontrol et

      return () => clearInterval(interval)
    }
  }, [squeezeState.isSqueezing, squeezeState.squeezeStartTime])

  // Combo kontrolü ve Squeeze hazırlığı
  useEffect(() => {
    if (chewState.combo >= 3 && !squeezeState.isSqueezeReady && !squeezeState.isSqueezing) {
      setSqueezeState(prev => ({
        ...prev,
        isSqueezeReady: true
      }))
    }
  }, [chewState.combo])

  // Oyunu sıfırlama fonksiyonu
  const resetGame = () => {
    // Random spawn position
    const randomX = Math.random() * 600 + 100 // 100-700 arası
    const randomY = Math.random() * 200 + 200 // 200-400 arası

    setPhysics({
      position: { x: randomX, y: randomY },
      velocity: calculateRandomVelocity(),
      scale: { x: 1, y: 1 },
      isPaused: true,
      lastVelocity: initialVelocity
    })

    setPlayerState(initialPlayerState)
    setGumState(initialGumState)
    setGameState(prev => ({
      ...prev,
      gameStatus: 'idle',
      platformColors: { top: 'bg-white', bottom: 'bg-white' }
    }))
  }

  // Oyun durumu kontrolü
  useEffect(() => {
    if (playerState.health <= 0 || gumState.health <= 0) {
      setGameState(prev => ({ ...prev, gameStatus: 'ended' }))
      setPhysics(prev => ({ ...prev, isPaused: true }))
    }
  }, [playerState.health, gumState.health])

  return (
    <div className="flex gap-4">
      {/* Sol Panel - Game Over */}
      <div className="w-64 flex flex-col gap-4">
        {gameState.gameStatus === 'ended' && (
          <div className="h-full p-4 bg-red-100 text-red-800 rounded-lg text-center font-bold flex flex-col items-center justify-center">
            <div className="text-2xl mb-4">Game Over!</div>
            <div className="mb-2">
              {playerState.health <= 0 ? "You ran out of lives!" : "The gum is destroyed!"}
            </div>
            <div className="text-xl mt-4">
              Final Score: {playerState.score}
            </div>
          </div>
        )}
      </div>

      {/* Orta Panel - Ana Oyun Alanı */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Game Controls */}
        <div className="flex gap-4 p-4 bg-white/90 rounded-lg shadow-lg">
          <button
            onClick={() => {
              setGameState(prev => ({ ...prev, gameStatus: 'playing' }))
              setPhysics(prev => ({ ...prev, isPaused: false }))
            }}
            disabled={gameState.gameStatus === 'playing'}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
          >
            Play
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Reset
          </button>
        </div>

        {/* Game Instructions */}
        {gameState.gameStatus === 'idle' && (
          <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Press SPACE to chew when the gum is in the perfect zone</li>
              <li>Time your chews correctly to score points</li>
              <li>Build up your combo for higher scores</li>
              <li>Don't miss or you'll lose health!</li>
            </ul>
          </div>
        )}

        {/* Game Stats */}
        <div className="flex flex-col gap-4 w-full">
          <PlayerTest state={playerState} />
          <GumTest state={gumState} />
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
            initial={{ top: jawPositions.bottom }}
            animate={{ 
              top: isSpacePressed ? [jawPositions.closedPosition, jawPositions.bottom] : jawPositions.bottom
            }}
            transition={{ 
              duration: 0.2,
              times: [0.5, 1],
              ease: "easeInOut"
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

      {/* Sağ Panel - Debug Bilgileri */}
      <div className="w-80 flex flex-col gap-4">
        <div className="p-4 bg-white/90 rounded-lg shadow-lg space-y-6">
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
      </div>

      {/* Squeeze Prompt */}
      {squeezeState.isSqueezeReady && !squeezeState.isSqueezing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-xl animate-bounce">
          SQUEEZE! SQUEEZE! SQUEEZE!
        </div>
      )}

      {/* Squeeze Timer */}
      {squeezeState.isSqueezing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-red-500 h-2 rounded-full transition-all duration-100" 
               style={{ width: `${(2000 - squeezeState.squeezeTimer) / 20}%` }} />
        </div>
      )}
    </div>
  )
} 