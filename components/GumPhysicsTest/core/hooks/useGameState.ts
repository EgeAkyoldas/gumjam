import { useState, useCallback, useEffect } from 'react'
import { GAME_CONSTANTS } from '../constants/GameConstants'
import { ChewType, CHEW_ZONE_COLORS } from '../constants/ChewingConstants'

// Oyun durumu için interface
interface GameState {
  lives: number
  score: number
  lastCollisionTime: number | null
  isColliding: boolean
  collisionType: ChewType
  platformColors: {
    top: string
    bottom: string
  }
  gameStatus: 'idle' | 'playing' | 'ended'
  isVictory: boolean
}

// Hook için dönüş tipi
interface GameStateReturn {
  gameState: GameState
  updateGameState: (
    chewType: ChewType,
    shouldDamagePlayer: boolean,
    scoreAmount: number,
    isVictory: boolean
  ) => void
  startGame: () => void
  endGame: () => void
  resetGame: () => void
  setPlatformColors: (colors: { top: string; bottom: string }) => void
}

// Başlangıç durumu
const initialGameState: GameState = {
  lives: GAME_CONSTANTS.INITIAL_VALUES.LIVES,
  score: GAME_CONSTANTS.INITIAL_VALUES.SCORE,
  lastCollisionTime: null,
  isColliding: false,
  collisionType: 'none',
  platformColors: {
    top: CHEW_ZONE_COLORS.NONE,
    bottom: CHEW_ZONE_COLORS.NONE
  },
  gameStatus: 'idle',
  isVictory: false
}

export const useGameState = (): GameStateReturn => {
  const [gameState, setGameState] = useState<GameState>(initialGameState)

  // Oyun durumunu güncelleme
  const updateGameState = useCallback((
    chewType: ChewType,
    shouldDamagePlayer: boolean,
    scoreAmount: number,
    isVictory: boolean = false
  ) => {
    setGameState(prev => {
      // Eğer oyun bittiyse hiçbir şey yapma
      if (prev.gameStatus === 'ended') {
        return prev
      }

      const newState = { ...prev }

      // Oyuncu hasar alırsa ve oyun devam ediyorsa
      if (shouldDamagePlayer && prev.gameStatus === 'playing') {
        // Hasar cooldown kontrolü
        const now = Date.now()
        const canTakeDamage = !prev.lastCollisionTime || 
          (now - prev.lastCollisionTime) > GAME_CONSTANTS.HEALTH_SYSTEM.DAMAGE_COOLDOWN

        if (canTakeDamage) {
          // Can kaybı
          const newLives = Math.max(0, prev.lives - 1)

          console.log('%c[HEALTH] Can Kaybı!', 'color: red', {
            öncekiCan: prev.lives,
            yeniCan: newLives,
            gameStatus: prev.gameStatus,
            chewType,
            lastCollisionTime: prev.lastCollisionTime,
            now,
            timeDiff: prev.lastCollisionTime ? now - prev.lastCollisionTime : 'ilk hasar'
          })

          // Son hasar alma zamanını güncelle
          newState.lastCollisionTime = now
          newState.isColliding = true
          newState.lives = newLives
          
          // Can sıfırlanırsa oyunu bitir
          if (newLives <= 0) {
            console.log('%c[GAME] Oyun Bitti!', 'color: red', {
              sebep: 'Can Bitti',
              sonCan: newLives,
              sonChewType: chewType
            })
            newState.gameStatus = 'ended'
            newState.isVictory = false
            newState.lives = 0 // Emin olmak için
          }
        } else {
          console.log('%c[HEALTH] Hasar Engellendi!', 'color: orange', {
            cooldown: GAME_CONSTANTS.HEALTH_SYSTEM.DAMAGE_COOLDOWN,
            geçenSüre: now - (prev.lastCollisionTime || 0),
            chewType,
            currentLives: prev.lives
          })
        }
      }

      // Skor güncelleme
      if (scoreAmount > 0) {
        newState.score += scoreAmount
      }

      // Zafer durumu kontrolü (sadece özel olarak belirtildiğinde)
      if (isVictory && prev.gameStatus === 'playing') {
        newState.gameStatus = 'ended'
        newState.isVictory = true
        console.log('%c[GAME] Zafer!', 'color: green', {
          finalScore: newState.score + scoreAmount,
          remainingLives: newState.lives
        })
      }

      // Çarpışma tipi güncelleme
      newState.collisionType = chewType

      return newState
    })
  }, [])

  // Oyun durumu kontrolü
  useEffect(() => {
    // Çarpışma durumunu sıfırla
    if (gameState.isColliding) {
      const timeout = setTimeout(() => {
        setGameState(prev => {
          // Eğer oyun bittiyse hiçbir şey yapma
          if (prev.gameStatus === 'ended') {
            return prev
          }
          return {
            ...prev,
            isColliding: false
          }
        })
      }, 100) // 100ms sonra sıfırla

      return () => clearTimeout(timeout)
    }
  }, [gameState.isColliding])

  // Oyunu başlatma
  const startGame = useCallback(() => {
    console.log('%c[GAME] Oyun Başladı!', 'color: green', {
      başlangıçCanı: GAME_CONSTANTS.INITIAL_VALUES.LIVES
    })
    
    setGameState(prev => ({
      ...initialGameState,
      gameStatus: 'playing'
    }))
  }, [])

  // Oyunu bitirme
  const endGame = useCallback(() => {
    console.log('%c[GAME] Oyun Manuel Bitirildi!', 'color: blue')
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'ended'
    }))
  }, [])

  // Oyunu sıfırlama
  const resetGame = useCallback(() => {
    console.log('%c[GAME] Oyun Sıfırlandı!', 'color: purple')
    
    setGameState(initialGameState)
  }, [])

  // Platform renklerini güncelleme
  const setPlatformColors = useCallback((colors: { top: string; bottom: string }) => {
    setGameState(prev => ({
      ...prev,
      platformColors: colors
    }))
  }, [])

  return {
    gameState,
    updateGameState,
    startGame,
    endGame,
    resetGame,
    setPlatformColors
  }
}
