import { create } from 'zustand'

interface GumStateStore {
  health: number
  maxHealth: number
  isLaughing: boolean
  damageMultiplier: number
  healAmount: number
  isGameOver: boolean
  
  // Eylemler
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  setLaughing: (value: boolean) => void
  resetHealth: () => void
  setDamageMultiplier: (value: number) => void
  setGameOver: (value: boolean) => void
}

// GumState store'u
const useGumState = create<GumStateStore>((set) => ({
  health: 100,
  maxHealth: 100,
  isLaughing: false,
  damageMultiplier: 1,
  healAmount: 5,
  isGameOver: false,

  takeDamage: (amount: number) => 
    set((state) => {
      const newHealth = Math.max(0, state.health - (amount * state.damageMultiplier))
      return {
        health: newHealth,
        isGameOver: newHealth <= 0
      }
    }),

  heal: (amount: number) =>
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + (amount || state.healAmount))
    })),

  setLaughing: (value: boolean) => 
    set({ isLaughing: value }),

  resetHealth: () => 
    set({ 
      health: 100,
      isGameOver: false 
    }),

  setDamageMultiplier: (value: number) =>
    set({ damageMultiplier: value }),

  setGameOver: (value: boolean) =>
    set({ isGameOver: value })
}))

// GumState tipi dışa aktarımı
export type GumState = {
  health: number
  maxHealth: number
  isLaughing: boolean
  isGameOver: boolean
}

// Hook'u dışa aktar
export { useGumState } 