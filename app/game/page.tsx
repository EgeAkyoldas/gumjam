// app/game/page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mouth } from "@/components/Mouth/Mouth"
import { ScoreCounter } from "@/components/Layout/ScoreCounter"
import { DurabilityMeter } from "@/components/Layout/DurabilityMeter"
import { LivesTracker } from "@/components/Layout/LivesTracker"
import { GameProvider, useGameState } from "@/components/GameState/GameContext"

// GameInitializer component with proper import
function GameInitializer({ children }: { children: React.ReactNode }) {
  const { dispatch } = useGameState()

  useEffect(() => {
    // Start the game when component mounts
    dispatch({ type: "START_GAME" })
  }, [dispatch])

  return <>{children}</>
}

export default function GamePage() {
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/")
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [router])

  return (
    <GameProvider>
      <GameInitializer>
        <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
              <ScoreCounter />
              <DurabilityMeter />
              <LivesTracker />
            </div>
            <div className="aspect-video rounded-lg bg-[#fff0f5] p-8">
              <Mouth />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Press SPACE to chew!</p>
              <p className="text-xs text-gray-500">Press ESC to return to menu</p>
            </div>
          </div>
        </div>
      </GameInitializer>
    </GameProvider>
  )
}

