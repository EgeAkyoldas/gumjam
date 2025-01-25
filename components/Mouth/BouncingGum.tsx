"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameState } from "../GameState/GameContext"
import { useGum } from "@/contexts/GumContext"
import { EvilGum } from "../Gum/EvilGum"

const BOUNCE_FACTOR = 1.0
const INITIAL_VELOCITY = { x: 5, y: 3 }
const GUM_SIZE = 40

export function BouncingGum() {
  const { state, dispatch } = useGameState()
  const { selectedGum } = useGum()
  const containerRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(state.gumPosition)
  const velocityRef = useRef(state.gumVelocity)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)

  // Initialize gum position and velocity when mounted
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const initialPosition = {
        x: container.offsetWidth / 2,
        y: container.offsetHeight * 0.4,
      }
      const initialVelocity = { ...INITIAL_VELOCITY }

      positionRef.current = initialPosition
      velocityRef.current = initialVelocity

      dispatch({ type: "UPDATE_GUM_POSITION", payload: initialPosition })
      dispatch({ type: "UPDATE_GUM_VELOCITY", payload: initialVelocity })
    }
  }, [dispatch])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updatePhysics = (timestamp: number) => {
      if (state.isPaused) return

      // Limit updates to 60fps
      if (timestamp - lastUpdateRef.current < 16) return
      lastUpdateRef.current = timestamp

      const position = positionRef.current
      const velocity = velocityRef.current

      const newPosition = {
        x: position.x + velocity.x,
        y: position.y + velocity.y,
      }

      const newVelocity = { ...velocity }

      // Get the current boundaries
      const upperTeethY = container.offsetHeight * 0.2
      const lowerTeethY = container.offsetHeight * 0.8
      const sideOffset = container.offsetWidth * 0.15

      // Bounce off sides
      if (
        newPosition.x - GUM_SIZE / 2 <= sideOffset ||
        newPosition.x + GUM_SIZE / 2 >= container.offsetWidth - sideOffset
      ) {
        newVelocity.x = -newVelocity.x * BOUNCE_FACTOR
        newPosition.x = Math.max(
          sideOffset + GUM_SIZE / 2,
          Math.min(container.offsetWidth - sideOffset - GUM_SIZE / 2, newPosition.x),
        )
      }

      // Bounce off teeth
      const lowerJawOffset = state.isChewing ? 80 : 0

      if (newPosition.y - GUM_SIZE / 2 <= upperTeethY) {
        newVelocity.y = Math.abs(newVelocity.y) * BOUNCE_FACTOR
        newPosition.y = upperTeethY + GUM_SIZE / 2
      }

      if (newPosition.y + GUM_SIZE / 2 >= lowerTeethY - lowerJawOffset) {
        newVelocity.y = -Math.abs(newVelocity.y) * BOUNCE_FACTOR
        newPosition.y = lowerTeethY - lowerJawOffset - GUM_SIZE / 2
      }

      // Apply mild gravity
      newVelocity.y += 0.15

      // Maintain minimum velocity
      const minVelocity = 3
      if (Math.abs(newVelocity.y) < minVelocity) {
        newVelocity.y = newVelocity.y > 0 ? minVelocity : -minVelocity
      }

      // Update refs
      positionRef.current = newPosition
      velocityRef.current = newVelocity

      // Batch state updates
      requestAnimationFrame(() => {
        dispatch({ type: "UPDATE_GUM_POSITION", payload: newPosition })
        dispatch({ type: "UPDATE_GUM_VELOCITY", payload: newVelocity })
      })
    }

    const animate = (timestamp: number) => {
      updatePhysics(timestamp)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.isPaused, state.isChewing, dispatch])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <motion.div
        className="absolute z-50"
        style={{
          width: GUM_SIZE,
          height: GUM_SIZE,
          x: state.gumPosition.x - GUM_SIZE / 2,
          y: state.gumPosition.y - GUM_SIZE / 2,
        }}
        animate={{
          rotate: velocityRef.current.x * 20,
        }}
        transition={{
          rotate: {
            type: "spring",
            stiffness: 100,
            damping: 10,
          },
        }}
      >
        <EvilGum gum={selectedGum} size={GUM_SIZE} />
      </motion.div>
    </div>
  )
}

