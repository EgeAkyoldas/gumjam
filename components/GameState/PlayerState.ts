export const PLAYER_CONSTANTS = {
  MAX_HEALTH: 3,
  COMBO_THRESHOLD: 100,
  SCORE_VALUES: {
    PERFECT: 100,
    GOOD: 50,
    EARLY: -30,
    LATE: -30
  }
} as const

export interface PlayerState {
  health: number
  maxHealth: number
  score: number
  comboPoints: number
  isAlive: boolean
}

export const initialPlayerState: PlayerState = {
  health: PLAYER_CONSTANTS.MAX_HEALTH,
  maxHealth: PLAYER_CONSTANTS.MAX_HEALTH,
  score: 0,
  comboPoints: 0,
  isAlive: true
} 