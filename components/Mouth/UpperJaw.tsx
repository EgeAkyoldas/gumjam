"use client"

import { motion } from "framer-motion"

export function UpperJaw() {
  return (
    <div className="relative">
      {/* Gums */}
      <div className="h-40 w-full rounded-t-[40px] bg-[#ffb3b3]">
        {/* Teeth Row */}
        <div className="absolute bottom-0 flex w-full justify-center gap-1 px-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-8 bg-white"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

