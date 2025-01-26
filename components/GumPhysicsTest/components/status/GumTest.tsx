import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGumState } from '../../../GameState/GumState'

interface GumTestProps {
  onVictory?: () => void
}

export const GumTest = ({ onVictory }: GumTestProps) => {
  const [showVictory, setShowVictory] = useState(false)
  const { health, maxHealth, isLaughing } = useGumState()
  const healthPercentage = (health / maxHealth) * 100

  // Can sıfırlandığında zafer kontrolü
  useEffect(() => {
    if (health <= 0 && !showVictory) {
      setShowVictory(true)
      onVictory?.()
    }
  }, [health, showVictory, onVictory])

  // Sakızın ruh hali emojisi
  const getMoodEmoji = () => {
    if (showVictory) return '🎉'
    if (health <= 0) return '💀'
    if (isLaughing) return '😈'
    if (healthPercentage > 60) return '😊'
    if (healthPercentage > 30) return '😟'
    return '😰'
  }

  return (
    <div className="p-4 bg-white/90 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-pink-600">Gumjam Health</span>
        <span className="text-sm text-gray-600">{Math.max(0, health)} / {maxHealth}</span>
      </div>
      
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              ${healthPercentage > 60 ? '#22c55e' : 
                healthPercentage > 30 ? '#eab308' : '#ef4444'} 0%, 
              ${healthPercentage > 60 ? '#4ade80' : 
                healthPercentage > 30 ? '#facc15' : '#f87171'} 100%)`
          }}
          initial={{ width: '100%' }}
          animate={{ width: `${Math.max(0, healthPercentage)}%` }}
          transition={{ type: "spring", damping: 15 }}
        />
      </div>

      <AnimatePresence>
        {showVictory ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="mt-4 text-center"
          >
            <div className="text-2xl font-bold text-green-500 mb-2">
              NICELY CHEWED
            </div>
            <div className="text-sm text-gray-600">
              YOU WASTED THE GUM!
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="mt-2 text-center text-2xl"
            key="mood"
            initial={{ scale: 1 }}
            animate={{ 
              scale: isLaughing ? [1, 1.2, 1] : 1,
              rotate: isLaughing ? [0, -10, 10, 0] : 0
            }}
            transition={{ 
              duration: 0.5,
              repeat: isLaughing ? Infinity : 0
            }}
          >
            {getMoodEmoji()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
