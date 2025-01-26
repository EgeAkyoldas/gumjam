import { GAME_CONSTANTS } from '../../core/constants/GameConstants'
import { ChewType } from '../../core/constants/ChewingConstants'
import { useState, useEffect } from 'react'

interface DamageHistory {
  type: ChewType
  amount: number
  timestamp: number
}

interface DebugPanelProps {
  physics: {
    position: { x: number; y: number }
    velocity: { x: number; y: number }
    scale: { x: number; y: number }
    isPaused: boolean
    isMoving: boolean
  }
  jawStatus: {
    isSpacePressed: boolean
    top: number
    bottom: number
    currentGap: number
  }
  chewState: {
    topJaw: ChewType
    bottomJaw: ChewType
    currentScore: number
    shouldDamagePlayer: boolean
    damageAmount: number
    lastChewType: ChewType
    gameStatus?: 'idle' | 'playing' | 'ended'
  }
}

interface VelocityInfo {
  speed: number
  angle: number
  direction: string
}

const calculateVelocityInfo = (velocity: { x: number; y: number }): VelocityInfo => {
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

export const DebugPanel = ({ physics, jawStatus, chewState }: DebugPanelProps) => {
  const [damageHistory, setDamageHistory] = useState<DamageHistory[]>([])
  const velocityInfo = calculateVelocityInfo(physics.velocity)

  // Hasar geçmişini güncelle
  useEffect(() => {
    if (chewState.shouldDamagePlayer && chewState.damageAmount > 0) {
      setDamageHistory(prev => [
        {
          type: chewState.lastChewType,
          amount: chewState.damageAmount,
          timestamp: Date.now()
        },
        ...prev.slice(0, 4) // Son 5 hasarı tut
      ])
    }
  }, [chewState.shouldDamagePlayer, chewState.damageAmount, chewState.lastChewType])

  // Oyun durumu değiştiğinde geçmişi sıfırla
  useEffect(() => {
    if (chewState.gameStatus === 'idle' || chewState.gameStatus === 'ended') {
      setDamageHistory([])
    }
  }, [chewState.gameStatus])

  // Hasar tipine göre emoji ve renk
  const getDamageIcon = (type: ChewType) => {
    switch (type) {
      case 'early':
        return '🔸'
      case 'late':
        return '🔺'
      default:
        return '❓'
    }
  }

  return (
    <div className="w-80 p-4 bg-white/90 rounded-lg shadow-lg space-y-6">
      {/* Position Info */}
      <div className="space-y-1">
        <div className="font-bold text-pink-600 border-b pb-1">Position</div>
        <div>X: {physics.position.x.toFixed(0)}</div>
        <div>Y: {physics.position.y.toFixed(0)}</div>
        <div className="text-xs text-gray-500">
          Game Area: {GAME_CONSTANTS.GAME_WIDTH}x{GAME_CONSTANTS.GAME_HEIGHT}
        </div>
      </div>
      
      {/* Velocity Info */}
      <div className="space-y-1">
        <div className="font-bold text-pink-600 border-b pb-1">Velocity</div>
        <div>Magnitude: {velocityInfo.speed.toFixed(1)} px/frame</div>
        <div>Angle: {velocityInfo.angle.toFixed(1)}°</div>
        <div>Direction: {velocityInfo.direction}</div>
        <div className="text-gray-500 text-xs">
          (x: {physics.velocity.x.toFixed(1)}, y: {physics.velocity.y.toFixed(1)})
        </div>
      </div>
      
      {/* Jaw Status */}
      <div className="space-y-1">
        <div className="font-bold text-pink-600 border-b pb-1">Jaw Status</div>
        <div>Space: {jawStatus.isSpacePressed ? 'Pressed ⬆️' : 'Released ⬇️'}</div>
        <div>Top Jaw: {jawStatus.top}</div>
        <div>Bottom Jaw: {jawStatus.bottom}</div>
        <div>Gap: {jawStatus.currentGap.toFixed(0)}px</div>
      </div>

      {/* Gum Info */}
      <div className="space-y-1">
        <div className="font-bold text-pink-600 border-b pb-1">Gum</div>
        <div>Size: {GAME_CONSTANTS.GUM_SIZE}px</div>
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
        {/* Hasar Bilgileri */}
        <div className="mt-2">
          <div className="text-sm font-semibold text-red-600">Damage History</div>
          <div className="text-sm">
            Current: {chewState.shouldDamagePlayer ? '⚠️ Taking Damage' : '✅ Safe'}
          </div>
          {/* Hasar Geçmişi */}
          <div className="mt-1 space-y-1">
            {damageHistory.map((damage, index) => (
              <div key={damage.timestamp} className="text-sm flex items-center gap-1">
                <span>{getDamageIcon(damage.type)}</span>
                <span className="text-gray-600">
                  {damage.type === 'early' ? 'Early Chew' : 
                   damage.type === 'late' ? 'Late Chew' : 'Unknown'} 
                  (-{damage.amount})
                </span>
              </div>
            ))}
            {damageHistory.length === 0 && (
              <div className="text-sm text-gray-500">No damage taken yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 