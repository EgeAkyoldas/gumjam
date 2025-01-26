"use client"

import { useEffect } from "react"
import { useGameState } from "../GameState/GameContext"
import { useChewSystem } from "./systems/hooks/useChewSystem"

export function LowerJaw() {
  const { state } = useGameState()
  const { chewState, startChewing } = useChewSystem()

  // Space tuşu kontrolü
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault() // Sayfanın kaymasını önle
        startChewing()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [startChewing])

  return (
    <div
      className={`relative origin-top transform ${
        chewState.isChewing
          ? "-translate-y-[80px] transition-none"
          : "translate-y-0 transition-transform duration-200 ease-in"
      }`}
    >
      {/* Gums */}
      <div className="h-40 w-full rounded-b-[40px] bg-[#ffb3b3]">
        {/* Teeth Row */}
        <div className="absolute top-0 flex w-full justify-center gap-1 px-8">
          {chewState.teethState.colors.map((color, i) => (
            <div
              key={i}
              className={`h-16 w-8 ${color}`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

