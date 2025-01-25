"use client"

import { UpperJaw } from "./UpperJaw"
import { LowerJaw } from "./LowerJaw"
import { Tongue } from "./Tongue"
import { BouncingGum } from "./BouncingGum"
import { useKeyPress } from "../../hooks/useKeyPress"
import { useGameState } from "../GameState/GameContext"

export function Mouth() {
  useKeyPress()
  const { state } = useGameState()

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden">
      {/* Static Upper Parts */}
      <div className="absolute inset-x-0 top-0 bottom-[40%] rounded-t-[40px] bg-[#4a0000] z-10" />
      <div className="absolute inset-x-[6px] top-[6px] bottom-[40%] rounded-t-[34px] bg-[#660000] z-20" />

      {/* Animated Lower Parts - Both outer and inner move together */}
      <div
        className={`absolute inset-x-0 bottom-0 top-[40%] rounded-b-[40px] bg-[#4a0000] z-0 transform ${
          state.isChewing
            ? "-translate-y-[80px] transition-none"
            : "translate-y-0 transition-transform duration-200 ease-in"
        }`}
      >
        {/* Inner mouth background that moves with the outer part */}
        <div className="absolute inset-x-[6px] inset-y-0 rounded-b-[34px] bg-[#660000]" />
      </div>

      {/* Jaws Container */}
      <div className="relative grid gap-32 p-8 z-30">
        <UpperJaw />
        <Tongue position={state.tonguePosition} />
        <LowerJaw />
      </div>

      {/* Bouncing Gum Layer */}
      <div className="absolute inset-0 z-40">
        <BouncingGum />
      </div>
    </div>
  )
}

