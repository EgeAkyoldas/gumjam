"use client"

import { useGameState } from "../GameState/GameContext"
import { useChewSystem } from "../Mouth/systems/hooks/useChewSystem"
import { CHEW_CONSTANTS } from "../Mouth/systems/constants/ChewConstants"
import { useEffect } from "react"

interface DebugSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DebugSection = ({ title, children, className = "" }: DebugSectionProps) => (
  <div className={`mb-2 ${className}`}>
    <h4 className="font-semibold">{title}:</h4>
    {children}
  </div>
)

export function ChewDebugger() {
  const { state } = useGameState()
  const { chewState, debugInfo, updateChewZone } = useChewSystem()

  // Çene arası mesafeyi hesapla
  const jawGap = Math.abs(
    (state.lowerBoundary * window.innerHeight) -
    (state.upperBoundary * window.innerHeight)
  ) - (CHEW_CONSTANTS.JAW_SETTINGS.TEETH_HEIGHT * 2)

  // Dikey mesafeyi hesapla
  const gumPositionPercent = state.gumPosition.y / window.innerHeight
  
  // Bölge kontrolleri (yeni yüzdelere göre)
  const isInPerfectZone = gumPositionPercent >= 0.38 && gumPositionPercent <= 0.40
  const isInGoodZone = gumPositionPercent >= 0.33 && gumPositionPercent < 0.38
  const isInEarlyZone = gumPositionPercent >= 0.25 && gumPositionPercent < 0.33

  // Aktif bölgeyi belirle
  const getCurrentZone = () => {
    if (isInPerfectZone) return 'perfect'
    if (isInGoodZone) return 'good'
    if (isInEarlyZone) return 'early'
    return 'none'
  }

  // Sürekli güncelleme için useEffect
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (state.gumPosition.y && state.gumVelocity.y) {
        const currentZone = getCurrentZone()
        updateChewZone(
          state.gumPosition.y,
          state.lowerBoundary * window.innerHeight,
          state.gumVelocity,
          currentZone
        )
      }
    }, 16) // ~60fps

    return () => clearInterval(updateInterval)
  }, [state.gumPosition.y, state.gumVelocity.y, state.lowerBoundary, updateChewZone])

  // Progress bar yüzdesini hesapla (25% ile 40% arasını normalize et)
  const progressPercent = Math.max(0, Math.min(100, 
    ((gumPositionPercent - 0.25) / (0.40 - 0.25)) * 100
  ))

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded bg-black/80 p-4 text-white">
      <h3 className="mb-2 font-bold">Çiğneme Debug</h3> 
      <div className="space-y-1 text-sm">
        {/* Pozisyon Bilgileri */}
        <DebugSection title="Pozisyon">
          <p>Gum Y: {state.gumPosition.y.toFixed(2)} ({(gumPositionPercent * 100).toFixed(1)}%)</p>
          <p>Lower Jaw Y: {(state.lowerBoundary * window.innerHeight).toFixed(2)} ({(state.lowerBoundary * 100).toFixed(1)}%)</p>
          <p>Upper Jaw Y: {(state.upperBoundary * window.innerHeight).toFixed(2)} ({(state.upperBoundary * 100).toFixed(1)}%)</p>
          <p>Velocity Y: {state.gumVelocity.y.toFixed(2)}</p>
        </DebugSection>

        {/* Çiğneme Durumu */}
        <DebugSection title="Çiğneme Durumu">
          <p>Aktif Bölge: <span className={getBölgeRengi(getCurrentZone())}>{getCurrentZone().toUpperCase()}</span></p>
          <p>Son Çiğneme Bölgesi: <span className={getBölgeRengi(debugInfo.lastChewZone)}>{debugInfo.lastChewZone.toUpperCase()}</span></p>
          <p>Çiğniyor mu: <span className={chewState.isChewing ? "text-green-400" : "text-red-400"}>
            {chewState.isChewing ? 'Evet' : 'Hayır'}
          </span></p>
        </DebugSection>

        {/* Bölge Mesafeleri */}
        <DebugSection title="Bölge Mesafeleri">
          <div className="flex gap-2">
            <div className="h-32 w-2 rounded-full bg-gray-700">
              <div 
                className="w-full rounded-full bg-gradient-to-b from-orange-500 via-yellow-500 to-green-500 transition-all duration-100"
                style={{ 
                  height: `${progressPercent}%`,
                  maxHeight: '100%'
                }}
              />
            </div>
            <div className="flex flex-col justify-between text-xs">
              <div className={`${isInEarlyZone ? 'text-orange-400' : 'text-gray-400'}`}>
                Early (25-33%)
              </div>
              <div className={`${isInGoodZone ? 'text-yellow-400' : 'text-gray-400'}`}>
                Good (33-38%)
              </div>
              <div className={`${isInPerfectZone ? 'text-green-400' : 'text-gray-400'}`}>
                Perfect (38-40%)
              </div>
            </div>
          </div>
        </DebugSection>

        {/* İstatistikler */}
        <DebugSection title="İstatistikler">
          <p>Toplam Çiğneme: {debugInfo.chewAttempts}</p>
          <p>Combo: {chewState.combo}</p>
        </DebugSection>

        {/* Son Çiğnemeler */}
        <DebugSection title="Son Çiğnemeler">
          <div className="mt-1 space-y-1">
            {debugInfo.chewHistory.slice(-3).reverse().map((chew, i) => (
              <div key={i} className="text-xs">
                <span className={getBölgeRengi(chew.zone)}>{chew.zone.toUpperCase()}</span>
                {' - '}
                <span className="text-gray-400">
                  {new Date(chew.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </DebugSection>
      </div>
    </div>
  )
}

// Bölge renklerini belirle
function getBölgeRengi(zone: string): string {
  switch (zone.toLowerCase()) {
    case 'perfect':
      return 'text-green-400';
    case 'good':
      return 'text-yellow-400';
    case 'early':
      return 'text-orange-400';
    case 'late':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
} 