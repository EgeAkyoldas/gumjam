"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Gum {
  id: string
  name: string
  baseColor: string
  highlightColor: string
  shadowColor: string
  glowColor: string
  eyeColor: string
  durability: number
  baseSpeed: number
}

const defaultGums: Gum[] = [
  {
    id: "brain-eater",
    name: "Brain Eater",
    baseColor: "#ec4899",
    highlightColor: "#f472b6",
    shadowColor: "#831843",
    glowColor: "#fb7185",
    eyeColor: "#ffffff",
    durability: 100,
    baseSpeed: 1,
  },
  {
    id: "void-horror",
    name: "Void Horror",
    baseColor: "#4c1d95",
    highlightColor: "#6d28d9",
    shadowColor: "#2e1065",
    glowColor: "#7c3aed",
    eyeColor: "#ffffff",
    durability: 90,
    baseSpeed: 1.2,
  },
  {
    id: "toxic-terror",
    name: "Toxic Terror",
    baseColor: "#15803d",
    highlightColor: "#22c55e",
    shadowColor: "#14532d",
    glowColor: "#4ade80",
    eyeColor: "#ffffff",
    durability: 110,
    baseSpeed: 0.9,
  },
]

interface GumContextType {
  gums: Gum[]
  selectedGum: Gum
  selectGum: (id: string) => void
}

const GumContext = createContext<GumContextType | null>(null)

export function GumProvider({ children }: { children: ReactNode }) {
  const [selectedGum, setSelectedGum] = useState<Gum>(defaultGums[0])

  const selectGum = (id: string) => {
    const gum = defaultGums.find((g) => g.id === id)
    if (gum) setSelectedGum(gum)
  }

  return <GumContext.Provider value={{ gums: defaultGums, selectedGum, selectGum }}>{children}</GumContext.Provider>
}

export function useGum() {
  const context = useContext(GumContext)
  if (!context) {
    throw new Error("useGum must be used within a GumProvider")
  }
  return context
}

