// components/Layout/DurabilityMeter.tsx

import { useGameState } from "../GameState/GameContext"

export function DurabilityMeter() {
  const { state } = useGameState()

  return (
    <div className="w-full max-w-[200px]">
      <div className="mb-1 text-sm font-medium">Durability</div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
          style={{ width: `${state.durability}%` }}
        />
      </div>
    </div>
  )
}

