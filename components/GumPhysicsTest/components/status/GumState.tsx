import { create } from 'zustand'

interface GumStateStore {
  health: number
  maxHealth: number
  isLaughing: boolean
  damageMultiplier: number
  healAmount: number
  
  // Eylemler
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  setLaughing: (value: boolean) => void
  resetHealth: () => void
  setDamageMultiplier: (value: number) => void
}

export const useGumState = create<GumStateStore>((set) => ({
  health: 100,
  maxHealth: 100,
  isLaughing: false,
  damageMultiplier: 1,
  healAmount: 5,

  takeDamage: (amount: number) => 
    set((state) => ({
      health: Math.max(0, state.health - (amount * state.damageMultiplier))
    })),

  heal: (amount: number) =>
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + (amount || state.healAmount))
    })),

  setLaughing: (value: boolean) => 
    set({ isLaughing: value }),

  resetHealth: () => 
    set({ health: 100 }),

  setDamageMultiplier: (value: number) =>
    set({ damageMultiplier: value })
}))

// GumState tipi dışa aktarımı
export type GumState = {
  health: number
  maxHealth: number
  isLaughing: boolean
} 