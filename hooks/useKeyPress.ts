// hooks/useKeyPress.ts

"use client"

import { useEffect, useRef } from "react"
import { useGameState } from "../components/GameState/GameContext"

export function useKeyPress() {
  const { dispatch } = useGameState()
  const isChewingRef = useRef(false)
  const chewTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      if (event.code === "Space" && !isChewingRef.current) {
        event.preventDefault()
        isChewingRef.current = true
        dispatch({ type: "START_CHEWING" })

        chewTimeoutRef.current = setTimeout(() => {
          dispatch({ type: "STOP_CHEWING" })
          // Add extra time before allowing next chew to account for return animation
          setTimeout(() => {
            isChewingRef.current = false
          }, 200)
        }, 200) // Time before starting return animation
      }

      if ((event.code === "KeyA" || event.code === "KeyD") && !isChewingRef.current) {
        event.preventDefault()
        const direction = event.code === "KeyA" ? "left" : "right"
        dispatch({ type: "MOVE_TONGUE", payload: direction })

        setTimeout(() => {
          dispatch({ type: "MOVE_TONGUE", payload: "center" })
        }, 300)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (chewTimeoutRef.current) {
        clearTimeout(chewTimeoutRef.current)
      }
      isChewingRef.current = false
      dispatch({ type: "STOP_CHEWING" })
    }
  }, [dispatch])
}

