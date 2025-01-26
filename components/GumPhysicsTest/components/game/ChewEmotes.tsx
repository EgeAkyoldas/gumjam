import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChewType } from '../../core/constants/ChewingConstants'

// Çiğneme mesajları
const CHEW_MESSAGES = {
  EARLY: [
    "Too soon!",
    "Easy, rookie!",
    "Slow it down!",
    "Premature!"
  ],
  LATE: [
    "Too late!",
    "Missed it!",
    "Timing off!",
    "Way too slow!"
  ],
  GOOD: [
    "Nice chew!",
    "Solid hit!",
    "Sweet timing!",
    "Good one!"
  ],
  PERFECT: [
    "Perfect!",
    "Flawless!",
    "Bubble pro!",
    "Nailed it!"
  ],
  NONE: [""]
} as const

interface ChewEmotesProps {
  chewType: ChewType
  isVisible: boolean
}

const getRandomMessage = (type: ChewType): string => {
  const key = type.toUpperCase() as keyof typeof CHEW_MESSAGES
  const messages = CHEW_MESSAGES[key] || CHEW_MESSAGES.NONE
  return messages[Math.floor(Math.random() * messages.length)]
}

const getMessageColor = (type: ChewType): string => {
  switch (type) {
    case 'perfect':
      return 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'
    case 'good':
      return 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
    case 'early':
      return 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]'
    case 'late':
      return 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
    default:
      return 'text-gray-500'
  }
}

export const ChewEmotes: React.FC<ChewEmotesProps> = ({ chewType, isVisible }) => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (chewType !== 'none' && isVisible) {
      setMessage(getRandomMessage(chewType))
    } else {
      setMessage('')
    }
  }, [chewType, isVisible])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isVisible && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            className={`text-5xl font-bold ${getMessageColor(chewType)}`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 