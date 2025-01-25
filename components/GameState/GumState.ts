export const GUM_CONSTANTS = {
  MAX_HEALTH: 100,
  DAMAGE_MULTIPLIER: 1.5,
  BASE_DAMAGE: 10
} as const

export interface GumState {
  health: number
  maxHealth: number
  isLaughing: boolean
  isAlive: boolean
}

export const initialGumState: GumState = {
  health: GUM_CONSTANTS.MAX_HEALTH,
  maxHealth: GUM_CONSTANTS.MAX_HEALTH,
  isLaughing: false,
  isAlive: true
} 