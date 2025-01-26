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

function GameOver() {
  const router = useRouter()

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Game Over!</h2>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Return to Menu
        </button>
      </div>
    </div>
  )
}

function Game() {
  const { state } = useGameState()

  return (
    <>
      {!state.isPlaying && <GameOver />}
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
      </div>
    </>
  )
}

function GameInitializer({ children }: { children: React.ReactNode }) {
  const { dispatch } = useGameState()

  useEffect(() => {
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
        <Game />
      </GameInitializer>
    </GameProvider>
  )
}

