// components/GameCanvas.tsx

"use client"

import { useRef, useEffect } from "react"
import { useGameState } from "./GameState/GameContext"
import { useGum } from "@/contexts/GumContext"

const BOUNCE_FACTOR = 0.8
const INITIAL_VELOCITY = { x: 5, y: -5 }
const GUM_SIZE = 40

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, dispatch } = useGameState()
  const { selectedGum } = useGum()
  const animationFrameRef = useRef<number>()

  // Initialize gum position and velocity when the game starts
  useEffect(() => {
    if (state.isPlaying && canvasRef.current) {
      const canvas = canvasRef.current
      dispatch({
        type: "UPDATE_GUM_POSITION",
        payload: {
          x: canvas.width / 2,
          y: canvas.height / 2,
        },
      })
      dispatch({
        type: "UPDATE_GUM_VELOCITY",
        payload: INITIAL_VELOCITY,
      })
    }
  }, [state.isPlaying, dispatch])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const drawGum = (x: number, y: number) => {
      ctx.save()

      // Draw main gum body
      ctx.fillStyle = selectedGum.baseColor
      ctx.beginPath()
      ctx.arc(x, y, GUM_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw eyes
      const eyeOffset = GUM_SIZE / 6
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(x - eyeOffset, y - eyeOffset, GUM_SIZE / 8, 0, Math.PI * 2)
      ctx.arc(x + eyeOffset, y - eyeOffset, GUM_SIZE / 8, 0, Math.PI * 2)
      ctx.fill()

      // Draw pupils
      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.arc(x - eyeOffset, y - eyeOffset, GUM_SIZE / 16, 0, Math.PI * 2)
      ctx.arc(x + eyeOffset, y - eyeOffset, GUM_SIZE / 16, 0, Math.PI * 2)
      ctx.fill()

      // Draw smile
      ctx.strokeStyle = selectedGum.shadowColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, GUM_SIZE / 4, 0.2, Math.PI - 0.2)
      ctx.stroke()

      ctx.restore()
    }

    const updatePhysics = () => {
      if (!state.isPlaying || state.isPaused) return

      const newPosition = {
        x: state.gumPosition.x + state.gumVelocity.x,
        y: state.gumPosition.y + state.gumVelocity.y,
      }

      const newVelocity = { ...state.gumVelocity }

      // Bounce off walls
      if (newPosition.x - GUM_SIZE / 2 <= 0 || newPosition.x + GUM_SIZE / 2 >= canvas.width) {
        newVelocity.x = -newVelocity.x * BOUNCE_FACTOR
      }

      // Bounce off ceiling and floor
      if (newPosition.y - GUM_SIZE / 2 <= 0 || newPosition.y + GUM_SIZE / 2 >= canvas.height) {
        newVelocity.y = -newVelocity.y * BOUNCE_FACTOR
      }

      // Apply gravity
      newVelocity.y += 0.2

      dispatch({ type: "UPDATE_GUM_POSITION", payload: newPosition })
      dispatch({ type: "UPDATE_GUM_VELOCITY", payload: newVelocity })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (state.isPlaying) {
        updatePhysics()
        drawGum(state.gumPosition.x, state.gumPosition.y)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.isPlaying, state.isPaused, state.gumPosition, state.gumVelocity, dispatch, selectedGum])

  return (
    <canvas
      ref={canvasRef}
      className="h-[600px] w-full rounded-lg bg-gradient-to-b from-purple-50 to-pink-50 shadow-inner"
    />
  )
}

