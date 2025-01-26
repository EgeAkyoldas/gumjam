"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useGum } from "@/contexts/GumContext"

export function PlayButton() {
  const router = useRouter()
  const { selectedGum } = useGum()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push("/game")}
      className="relative text-center"
    >
      <div className="text-8xl font-black tracking-tighter text-gray-900">CHEW!</div>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: selectedGum.glowColor }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  )
}

