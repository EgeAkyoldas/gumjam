"use client"

import { motion } from "framer-motion"
import { useGum } from "@/contexts/GumContext"
import { cn } from "@/lib/utils"
import { EvilGum } from "../Gum/EvilGum"

export function GumSelector() {
  const { gums, selectedGum, selectGum } = useGum()

  return (
    <div className="flex flex-wrap justify-center gap-8 p-4">
      {gums.map((gum) => (
        <motion.button
          key={gum.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectGum(gum.id)}
          className={cn(
            "group relative h-40 w-40 cursor-pointer rounded-full bg-black/50 p-4",
            selectedGum.id === gum.id ? "ring-2 ring-offset-4" : "",
          )}
          style={{
            ringColor: gum.glowColor,
            ringOffsetColor: "#000",
          }}
        >
          <EvilGum gum={gum} size={128} isAnimating={selectedGum.id === gum.id} />
          <motion.div
            className="absolute -bottom-8 left-1/2 w-max -translate-x-1/2 text-sm font-bold"
            style={{
              color: selectedGum.id === gum.id ? gum.glowColor : "#666666",
            }}
          >
            {gum.name}
          </motion.div>
        </motion.button>
      ))}
    </div>
  )
}

