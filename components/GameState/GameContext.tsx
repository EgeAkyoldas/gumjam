// components/GameState/GameContext.tsx

"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"

interface GameState {
  score: number
  lives: number
  durability: number
  isPlaying: boolean
  isPaused: boolean
  isChewing: boolean
  tonguePosition: "left" | "center" | "right"
  gumPosition: { x: number; y: number }
  gumVelocity: { x: number; y: number }
}

type GameAction =
  | { type: "START_GAME" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "UPDATE_SCORE"; payload: number }
  | { type: "DECREASE_LIVES" }
  | { type: "UPDATE_DURABILITY"; payload: number }
  | { type: "GAME_OVER" }
  | { type: "START_CHEWING" }
  | { type: "STOP_CHEWING" }
  | { type: "MOVE_TONGUE"; payload: "left" | "center" | "right" }
  | { type: "UPDATE_GUM_POSITION"; payload: { x: number; y: number } }
  | { type: "UPDATE_GUM_VELOCITY"; payload: { x: number; y: number } }

const initialState: GameState = {
  score: 0,
  lives: 3,
  durability: 100,
  isPlaying: false,
  isPaused: false,
  isChewing: false,
  tonguePosition: "center",
  gumPosition: { x: 0, y: 0 },
  gumVelocity: { x: 0, y: 0 },
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_GAME":
      return { ...initialState, isPlaying: true }
    case "PAUSE_GAME":
      return { ...state, isPaused: true }
    case "RESUME_GAME":
      return { ...state, isPaused: false }
    case "UPDATE_SCORE":
      return { ...state, score: state.score + action.payload }
    case "DECREASE_LIVES":
      return { ...state, lives: state.lives - 1 }
    case "UPDATE_DURABILITY":
      return { ...state, durability: action.payload }
    case "GAME_OVER":
      return { ...state, isPlaying: false }
    case "START_CHEWING":
      return { ...state, isChewing: true }
    case "STOP_CHEWING":
      return { ...state, isChewing: false }
    case "MOVE_TONGUE":
      return { ...state, tonguePosition: action.payload }
    case "UPDATE_GUM_POSITION":
      return { ...state, gumPosition: action.payload }
    case "UPDATE_GUM_VELOCITY":
      return { ...state, gumVelocity: action.payload }
    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGameState() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider")
  }
  return context
}

