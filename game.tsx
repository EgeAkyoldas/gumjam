"use client"

import { GameProvider } from "./components/GameState/GameContext"
import { Mouth } from "./components/Mouth/Mouth"
import { ScoreCounter } from "./components/Layout/ScoreCounter"
import { DurabilityMeter } from "./components/Layout/DurabilityMeter"
import { LivesTracker } from "./components/Layout/LivesTracker"

export default function Game() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-[#fff0f5] p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <ScoreCounter />
            <DurabilityMeter />
            <LivesTracker />
          </div>
          <div className="aspect-video rounded-lg bg-[#fff0f5] p-8">
            <Mouth />
          </div>
          <div className="text-center text-sm text-gray-600">Press SPACE to chew!</div>
        </div>
      </div>
    </GameProvider>
  )
}

