"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mouth } from "@/components/Mouth/Mouth"
import { ScoreCounter } from "@/components/Layout/ScoreCounter"
import { DurabilityMeter } from "@/components/Layout/DurabilityMeter"
import { LivesTracker } from "@/components/Layout/LivesTracker"
import { SpeedControl } from "@/components/Layout/SpeedControl"
import { GameProvider, useGameState } from "@/components/GameState/GameContext"
import { GameAreaControl } from "@/components/Layout/GameAreaControl"
import { ChewDebugger } from "@/components/Debug/ChewDebugger"

function Game() {
  const { state } = useGameState()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
          <ScoreCounter />
          <div className="flex items-center gap-8">
            <SpeedControl />
            <GameAreaControl />
          </div>
          <div className="flex items-center gap-4">
            <DurabilityMeter />
            <LivesTracker />
          </div>
        </div>
        <div className="aspect-video rounded-lg bg-[#fff0f5] p-8">
          <Mouth />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Press SPACE to chew!</p>
          <p className="text-xs text-gray-500">Press ESC to return to menu</p>
        </div>
      </div>
      <ChewDebugger />
    </div>
  )
}

export default function GamePage() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}

