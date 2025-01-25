// app/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GumSelector } from "@/components/Menu/GumSelector"

export default function MenuPage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gradient-to-b from-pink-100 to-purple-100 p-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/game")}
        className="relative text-center"
      >
        <div className="text-8xl font-black tracking-tighter text-pink-500">CHEW!</div>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-pink-500/20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.button>

      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-pink-500">GUM?</h2>
        <GumSelector />
      </div>

      <div className="fixed bottom-4 text-sm text-gray-500">Press SPACE to chew! Use A and D to move the tongue.</div>
    </main>
  )
}

