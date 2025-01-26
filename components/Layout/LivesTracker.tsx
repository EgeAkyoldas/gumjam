import { Heart } from "lucide-react"
import { useGameState } from "../GameState/GameContext"

export function LivesTracker() {
  const { state } = useGameState()

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Heart
          key={i}
          className={`h-6 w-6 transition-all duration-300 ${
            i < state.lives ? "fill-red-500 text-red-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

