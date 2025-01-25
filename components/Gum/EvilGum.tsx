"use client"

import { motion } from "framer-motion"
import type { Gum } from "@/contexts/GumContext"

interface EvilGumProps {
  gum: Gum
  size?: number
  isAnimating?: boolean
}

export function EvilGum({ gum, size = 100, isAnimating = true }: EvilGumProps) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={
        isAnimating
          ? {
              scale: [1, 1.05, 0.95, 1],
            }
          : undefined
      }
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {/* Main circle with gradient border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-600 to-gray-700 p-[3px]">
        <div className="relative h-full w-full rounded-full" style={{ backgroundColor: gum.baseColor }}>
          {/* Texture overlay */}
          <div className="absolute inset-0 rounded-full bg-black/10" />

          {/* Eyes */}
          <div className="absolute left-1/2 top-[35%] flex w-[60%] -translate-x-1/2 -translate-y-1/2 justify-between">
            {[0, 1].map((i) => (
              <motion.div
                key={`eye-${i}`}
                className="relative h-8 w-8"
                animate={
                  isAnimating
                    ? {
                        scale: [1, 0.9, 1],
                      }
                    : undefined
                }
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                }}
              >
                {/* White background */}
                <div className="absolute inset-0 rounded-full bg-white" />
                {/* Black dot */}
                <div className="absolute inset-[30%] rounded-full bg-black" />
              </motion.div>
            ))}
          </div>

          {/* Evil Smile with Triangular Teeth */}
          <div className="absolute left-1/2 top-[60%] w-[70%] -translate-x-1/2">
            <motion.div
              className="relative h-10 overflow-hidden"
              animate={
                isAnimating
                  ? {
                      scaleX: [1, 1.05, 1],
                    }
                  : undefined
              }
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              {/* Curved smile background */}
              <div
                className="absolute h-20 w-full"
                style={{
                  backgroundColor: gum.shadowColor,
                  borderRadius: "100%",
                  transform: "translateY(-35%)",
                }}
              />

              {/* Triangular teeth - now pointing downward */}
              <div className="absolute top-0 flex w-full justify-between px-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={`tooth-${i}`}
                    className="h-3 w-3 bg-white"
                    style={{
                      clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)", // Flipped triangle
                      transformOrigin: "top",
                    }}
                    animate={
                      isAnimating
                        ? {
                            height: ["12px", "10px", "12px"],
                          }
                        : undefined
                    }
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bubbles/texture spots */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`spot-${i}`}
              className="absolute h-4 w-4 rounded-full opacity-20"
              style={{
                backgroundColor: gum.shadowColor,
                left: `${20 + (i % 3) * 30}%`,
                top: `${20 + Math.floor(i / 3) * 40}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

