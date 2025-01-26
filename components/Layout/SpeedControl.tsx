"use client"

import { Slider } from "@/components/ui/slider"
import { useGameState } from "../GameState/GameContext"

export function SpeedControl() {
  const { state, dispatch } = useGameState()

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Speed:</span>
      <Slider
        value={[state.gumSpeed]}
        min={1}
        max={10}
        step={0.5}
        className="w-[100px]"
        onValueChange={([value]) => {
          dispatch({ type: "UPDATE_GUM_SPEED", payload: value })
        }}
      />
      <span className="min-w-[2rem] text-sm tabular-nums">{state.gumSpeed}x</span>
    </div>
  )
}

