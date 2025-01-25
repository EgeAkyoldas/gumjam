// components/Mouth/Tongue.tsx

"use client"

import { motion } from "framer-motion"

interface TongueProps {
  position: "left" | "center" | "right"
}

export function Tongue({ position }: TongueProps) {
  const variants = {
    left: {
      translateX: "-150%",
      rotate: 45, // Changed from -45 to 45
    },
    center: {
      translateX: "-50%",
      rotate: 0,
    },
    right: {
      translateX: "50%",
      rotate: -45, // Changed from 45 to -45
    },
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 h-32 w-[30%] -translate-y-1/2"
      style={{
        transformOrigin: "center center",
      }}
      animate={variants[position]}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
        restDelta: 0.001,
      }}
    >
      <div className="relative h-full w-full">
        {/* Tongue base */}
        <div className="absolute bottom-0 h-full w-full rounded-[100px] bg-[#ff6b6b]">
          {/* Tongue texture */}
          <div className="absolute inset-0 rounded-[100px] bg-gradient-to-b from-[#ff8787] to-transparent opacity-50" />
        </div>
      </div>
    </motion.div>
  )
}

