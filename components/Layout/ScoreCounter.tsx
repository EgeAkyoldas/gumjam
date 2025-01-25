// components/Layout/ScoreCounter.tsx

import { useGameState } from "../GameState/GameContext"

export function ScoreCounter() {
  const { state } = useGameState()

  return (
    <div className="flex items-center gap-2 text-2xl font-bold">
      <span className="text-primary">Score:</span>
      <span className="font-mono">{state.score}</span>
    </div>
  )
}

