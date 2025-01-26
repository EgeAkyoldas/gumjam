"use client"

import { useGameState } from "../GameState/GameContext"

export function LowerJaw() {
  const { state } = useGameState()

  return (
    <div
      className={`relative origin-top transform ${
        state.isChewing
          ? "-translate-y-[80px] transition-none"
          : "translate-y-0 transition-transform duration-200 ease-in"
      }`}
    >
      {/* Gums */}
      <div className="h-40 w-full rounded-b-[40px] bg-[#ffb3b3]">
        {/* Teeth Row */}
        <div className="absolute top-0 flex w-full justify-center gap-1 px-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-8 bg-white"
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

