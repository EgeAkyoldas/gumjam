import { Heart } from "lucide-react"
import { useGameState } from "../GameState/GameContext"

export function LivesTracker() {
  const { state } = useGameState()

  // Sakızın durability göstergesi
  const getDurabilityColor = () => {
    if (state.durability >= 66) return "bg-green-500"
    if (state.durability >= 33) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Oyuncu Canları */}
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

      {/* Sakız Durability Göstergesi */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium">Sakız Dayanıklılığı</span>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getDurabilityColor()}`}
            style={{ width: `${state.durability}%` }}
          />
        </div>
      </div>
    </div>
  )
}

