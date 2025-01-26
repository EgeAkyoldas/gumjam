"use client"

import { useEffect, useState } from 'react'
import { GameArea } from './components/game/GameArea'
import { DebugPanel } from './components/debug/DebugPanel'
import { GameControls } from './components/game/GameControls'
import { GameInstructions } from './components/game/GameInstructions'
import { GumTest } from './components/status/GumTest'
import { PlayerTest } from './components/status/PlayerTest'

import { usePhysicsEngine } from './core/hooks/usePhysicsEngine'
import { useChewingSystem } from './core/hooks/useChewingSystem'
import { useSqueezeSystem } from './core/hooks/useSqueezeSystem'
import { useGameState } from './core/hooks/useGameState'
import { useGumState } from '../GameState/GumState'

import { GAME_CONSTANTS } from './core/constants/GameConstants'

export const GumPhysicsTest = () => {
  // Space tuşu durumu
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // Hook'ları kullan
  const { 
    physics, 
    updatePhysics, 
    resetPhysics, 
    setPhysicsPaused 
  } = usePhysicsEngine()

  const {
    chewState,
    updateChewingState,
    resetChewingState,
    getZoneColor
  } = useChewingSystem()

  const {
    squeezeState,
    startSqueeze,
    endSqueeze,
    resetSqueezeState,
    updateSqueezeState
  } = useSqueezeSystem()

  const {
    gameState,
    updateGameState,
    startGame,
    resetGame,
    setPlatformColors
  } = useGameState()

  // GumState hook'unu kullan
  const gumState = useGumState()

  // Çene pozisyonları
  const jawPositions = {
    top: GAME_CONSTANTS.JAW_POSITIONS.TOP,
    bottom: GAME_CONSTANTS.JAW_POSITIONS.BOTTOM,
    get topEdge() {
      return this.top + GAME_CONSTANTS.JAW_CONSTANTS.JAW_HEIGHT
    },
    get bottomEdge() {
      return isSpacePressed 
        ? this.topEdge + GAME_CONSTANTS.GUM_SIZE 
        : this.bottom
    },
    get currentGap() {
      return Math.abs(this.bottomEdge - this.topEdge)
    }
  }

  // Space tuşu için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && gameState.gameStatus === 'playing') {
        setIsSpacePressed(true)
        if (squeezeState.isSqueezeReady) {
          startSqueeze()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        if (squeezeState.isSqueezing) {
          endSqueeze()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isSpacePressed, squeezeState, gameState.gameStatus])

  // Fizik güncellemesi
  useEffect(() => {
    let animationFrameId: number

    const updateGame = () => {
      if (gameState.gameStatus === 'playing') {
        // Fizik motorunu güncelle
        updatePhysics(isSpacePressed, jawPositions)

        // Çiğneme durumunu güncelle
        updateChewingState(
          physics.position.y,
          { topEdge: jawPositions.top, bottomEdge: jawPositions.bottom },
          physics.velocity,
          physics.isBouncing,
          physics.isSqueezing,
          isSpacePressed
        )

        // Platform renklerini güncelle
        setPlatformColors({
          top: getZoneColor(chewState.topJaw),
          bottom: getZoneColor(chewState.bottomJaw)
        })

        // Oyun durumunu güncelle
        updateGameState(
          chewState.lastChewType,
          chewState.shouldDamagePlayer,
          chewState.scoreAmount,
          false // Normal güncelleme, zafer değil
        )

        // Squeeze durumunu güncelle
        updateSqueezeState(chewState.combo)
      }

      animationFrameId = requestAnimationFrame(updateGame)
    }

    animationFrameId = requestAnimationFrame(updateGame)
    return () => cancelAnimationFrame(animationFrameId)
  }, [
    gameState.gameStatus,
    isSpacePressed,
    physics,
    chewState,
    squeezeState
  ])

  // Oyunu başlatma
  const handlePlay = () => {
    // Tüm durumları sıfırla
    resetGame()
    resetPhysics()
    resetChewingState()
    resetSqueezeState()
    gumState.resetHealth() // Sakızın canını sıfırla
    
    // Oyunu başlat
    startGame()
    setPhysicsPaused(false)
  }

  // Oyunu sıfırlama
  const handleReset = () => {
    resetGame()
    resetPhysics()
    resetChewingState()
    resetSqueezeState()
    gumState.resetHealth() // Sakızın canını sıfırla
    setPhysicsPaused(true)
    setIsSpacePressed(false)
  }

  return (
    <div className="flex gap-4">
      {/* Sol Panel - Game Over/Victory */}
      <div className="w-64 flex flex-col gap-4">
        {gameState.gameStatus === 'ended' && (
          <div className={`h-full p-4 ${gameState.lives <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} rounded-lg text-center font-bold flex flex-col items-center justify-center`}>
            <div className="text-2xl mb-4">
              {gameState.lives <= 0 ? "Game Over!" : "Victory!"}
            </div>
            <div className="mb-2">
              {gameState.lives <= 0 ? "YOU GUMMED!" : "GUMJAM IS WASTED!"}
            </div>
            <div className="text-xl mt-4">
              Final Score: {gameState.score}
            </div>
          </div>
        )}
      </div>

      {/* Orta Panel - Ana Oyun Alanı */}
      <div className="flex-1 flex flex-col gap-4">
        <GameControls
          gameStatus={gameState.gameStatus}
          onPlay={handlePlay}
          onReset={handleReset}
        />

        <GameInstructions isVisible={gameState.gameStatus === 'idle'} />

        <div className="flex flex-col gap-4 w-full">
          <PlayerTest state={{ 
            health: gameState.lives, 
            score: gameState.score, 
            comboPoints: chewState.combo,
            maxHealth: 3,
            isAlive: gameState.lives > 0 
          }} />
          <GumTest onVictory={() => {
            // Sadece sakızın canı 0'a ulaştığında ve oyuncu hayattaysa zafer
            if (gameState.lives > 0 && gumState.health <= 0) {
              // Oyunu zaferle bitir ve bonus skor ekle
              updateGameState('none', false, 1000, true)
              setPhysicsPaused(true)
            }
          }} />
        </div>

        <GameArea
          physics={physics}
          jawPositions={jawPositions}
          platformColors={gameState.platformColors}
          isSpacePressed={isSpacePressed}
        />
      </div>

      {/* Sağ Panel - Debug Bilgileri */}
      <DebugPanel
        physics={physics}
        jawStatus={{
          isSpacePressed,
          top: jawPositions.top,
          bottom: jawPositions.bottom,
          currentGap: jawPositions.currentGap
        }}
        chewState={chewState}
      />

      {/* Squeeze Prompt */}
      {squeezeState.isSqueezeReady && !squeezeState.isSqueezing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-xl animate-bounce">
          SQUEEZE! SQUEEZE! SQUEEZE!
        </div>
      )}

      {/* Squeeze Timer */}
      {squeezeState.isSqueezing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-100" 
            style={{ width: `${(2000 - squeezeState.squeezeTimer) / 20}%` }} 
          />
        </div>
      )}
    </div>
  )
} 