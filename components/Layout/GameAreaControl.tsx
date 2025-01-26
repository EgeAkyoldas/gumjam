"use client"

import { Slider } from "@/components/ui/slider"
import { useGameState } from "../GameState/GameContext"

export function GameAreaControl() {
  const { state, dispatch } = useGameState()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium min-w-[80px]">Upper Bound:</span>
        <Slider
          value={[state.upperBoundary]}
          min={0.1}
          max={0.4}
          step={0.01}
          defaultValue={[0.22]}
          className="w-[100px]"
          onValueChange={([value]) => {
            if (value < state.lowerBoundary) {
              dispatch({ type: "UPDATE_UPPER_BOUNDARY", payload: value })
            }
          }}
        />
        <span className="min-w-[3rem] text-sm tabular-nums">{(state.upperBoundary * 100).toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium min-w-[80px]">Lower Bound:</span>
        <Slider
          value={[state.lowerBoundary]}
          min={0.4}
          max={0.8}
          step={0.01}
          defaultValue={[0.63]}
          className="w-[100px]"
          onValueChange={([value]) => {
            if (value > state.upperBoundary) {
              dispatch({ type: "UPDATE_LOWER_BOUNDARY", payload: value })
            }
          }}
        />
        <span className="min-w-[3rem] text-sm tabular-nums">{(state.lowerBoundary * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}

