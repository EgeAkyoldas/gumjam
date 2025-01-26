"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameState } from "../GameState/GameContext"

const GUM_SIZE = 40
const BASE_SPEED = 6
const BOUNCE_DAMPENING = 0.92 // Reduced from 0.93 for more controlled bounces
const STUCK_WOBBLE_AMOUNT = 3.7
const CHEW_BOUNCE_FORCE = 12 // Increased bounce force
const SQUEEZE_THRESHOLD = 18 // Distance threshold for squeeze effect
const SQUEEZE_FORCE = 14.1 // Increased from 0.5 to 15
const ESCAPE_FORCE = 6.9 // New constant for escape velocity

interface Vector2D {
  x: number
  y: number
}

function normalizeVector(vector: Vector2D): Vector2D {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  return magnitude === 0
    ? { x: 0, y: 0 }
    : {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
      }
}

// Helper function to add random wobble to stuck gum
function addWobble(position: Vector2D): Vector2D {
  return {
    x: position.x + (Math.random() - 0.5) * STUCK_WOBBLE_AMOUNT,
    y: position.y + (Math.random() - 0.5) * STUCK_WOBBLE_AMOUNT,
  }
}

export function BouncingGum() {
  const { state, dispatch } = useGameState()
  const containerRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(state.gumPosition)
  const velocityRef = useRef(state.gumVelocity)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const lastBounceRef = useRef<number>(0)
  const lastDamageRef = useRef<number>(0)
  //const stuckPositionRef = useRef<Vector2D | null>(null) // Removed
  const wasSqueezeRef = useRef(false)

  // Initialize gum position and velocity when mounted
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const upperTeethY = container.offsetHeight * state.upperBoundary + 64
      const lowerTeethY = container.offsetHeight * state.lowerBoundary

      // Start in the middle of the playable area
      const initialPosition = {
        x: container.offsetWidth * 0.3,
        y: (upperTeethY + lowerTeethY) * 0.5, // Middle of the actual playable area
      }

      // Start with diagonal movement
      const initialVelocity = {
        x: BASE_SPEED * 0.7,
        y: -BASE_SPEED * 0.7,
      }

      positionRef.current = initialPosition
      velocityRef.current = initialVelocity

      dispatch({ type: "UPDATE_GUM_POSITION", payload: initialPosition })
      dispatch({ type: "UPDATE_GUM_VELOCITY", payload: initialVelocity })
    }
  }, [dispatch, state.upperBoundary, state.lowerBoundary]) // Added state.lowerBoundary

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const upperTeethY = container.offsetHeight * state.upperBoundary + 64
      const lowerTeethY = container.offsetHeight * state.lowerBoundary

      // Reset to middle of new playable area
      const newPosition = {
        x: state.gumPosition.x,
        y: (upperTeethY + lowerTeethY) * 0.5,
      }

      positionRef.current = newPosition
      dispatch({ type: "UPDATE_GUM_POSITION", payload: newPosition })
    }
  }, [state.upperBoundary, state.lowerBoundary])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updatePhysics = (timestamp: number) => {
      if (state.isPaused) return

      // Limit updates to 60fps
      if (timestamp - lastUpdateRef.current < 16) return
      lastUpdateRef.current = timestamp

      // Removed isStuck logic

      const position = positionRef.current
      const velocity = velocityRef.current

      // Apply speed multiplier to velocity
      const currentSpeed = state.gumSpeed
      const normalizedVelocity = normalizeVector(velocity)
      const scaledVelocity = {
        x: normalizedVelocity.x * currentSpeed * BASE_SPEED,
        y: normalizedVelocity.y * currentSpeed * BASE_SPEED,
      }

      const newPosition = {
        x: position.x + scaledVelocity.x,
        y: position.y + scaledVelocity.y,
      }

      const newVelocity = { ...scaledVelocity }

      // Get the teeth boundaries
      const upperTeethY = container.offsetHeight * state.upperBoundary + 64
      const lowerTeethY = container.offsetHeight * state.lowerBoundary
      const lowerTeethOffset = state.isChewing ? 80 : 0

      // Calculate the current gap between teeth
      const teethGap = lowerTeethY - lowerTeethOffset - upperTeethY
      const gumRadius = GUM_SIZE / 2

      // Check if gum is being squeezed
      const isBeingSqueeezed =
        state.isChewing &&
        newPosition.y + gumRadius >= lowerTeethY - lowerTeethOffset - 20 &&
        newPosition.y - gumRadius <= upperTeethY + 20

      if (isBeingSqueeezed) {
        // Apply squeeze forces
        const escapeDirection = Math.random() > 0.5 ? 1 : -1
        const horizontalEscape = (Math.random() - 0.5) * SQUEEZE_FORCE

        // Add strong horizontal movement
        newVelocity.x += horizontalEscape

        // Add vertical escape force
        if (teethGap < GUM_SIZE * 1.2) {
          // If gap is smaller than 120% of gum size
          newVelocity.y = ESCAPE_FORCE * escapeDirection
        }
      }

      // Upper teeth collision with squeeze effect
      if (newPosition.y - gumRadius <= upperTeethY) {
        // Check if enough time has passed since last bounce (50ms minimum)
        if (timestamp - lastBounceRef.current > 50) {
          newPosition.y = upperTeethY + gumRadius
          if (state.isChewing) {
            newVelocity.y = Math.abs(newVelocity.y) + ESCAPE_FORCE
            newVelocity.x += (Math.random() - 0.5) * SQUEEZE_FORCE
          } else {
            newVelocity.y = Math.abs(newVelocity.y) * BOUNCE_DAMPENING
          }
          lastBounceRef.current = timestamp
        }
      }

      // Lower teeth collision with squeeze effect and damage
      if (newPosition.y + gumRadius >= lowerTeethY - lowerTeethOffset) {
        newPosition.y = lowerTeethY - lowerTeethOffset - gumRadius
        if (state.isChewing) {
          newVelocity.y = -Math.abs(newVelocity.y) - ESCAPE_FORCE
          newVelocity.x += (Math.random() - 0.5) * SQUEEZE_FORCE
        } else {
          // Take damage if not chewing when hitting lower teeth
          if (timestamp - lastDamageRef.current > 1000) {
            // 1 second cooldown
            dispatch({ type: "TAKE_DAMAGE", payload: 1 })
            lastDamageRef.current = timestamp
          }
          newVelocity.y = -Math.abs(newVelocity.y) * BOUNCE_DAMPENING
        }
      }

      // Handle wall collisions
      if (newPosition.x - gumRadius <= 0) {
        newPosition.x = gumRadius
        newVelocity.x = Math.abs(newVelocity.x) * BOUNCE_DAMPENING
      } else if (newPosition.x + gumRadius >= container.offsetWidth) {
        newPosition.x = container.offsetWidth - gumRadius
        newVelocity.x = -Math.abs(newVelocity.x) * BOUNCE_DAMPENING
      }

      // Ensure minimum diagonal velocity
      const minSpeed = 4
      const currentMagnitude = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y)
      if (currentMagnitude < minSpeed) {
        const scale = minSpeed / currentMagnitude
        newVelocity.x *= scale
        newVelocity.y *= scale
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
  }, [
    state.isPaused,
    state.isChewing,
    state.gumSpeed,
    state.upperBoundary,
    state.lowerBoundary, // Added state.lowerBoundary
    dispatch,
  ])

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
      >
        <div
          className="h-full w-full rounded-full bg-pink-400 shadow-lg"
          style={{
            boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.2)",
          }}
        />
      </motion.div>
    </div>
  )
}

