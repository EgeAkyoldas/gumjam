import { PlayerState } from '../../../GameState/PlayerState'
import { motion, AnimatePresence } from 'framer-motion'

interface PlayerTestProps {
  state: PlayerState
}

export const PlayerTest = ({ state }: PlayerTestProps) => {
  const hearts = Array.from({ length: state.maxHealth }, (_, index) => ({
    id: index,
    isFilled: index < state.health
  }))

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/90 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <AnimatePresence>
            {hearts.map(heart => (
              <motion.div
                key={heart.id}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ 
                  scale: heart.isFilled ? [1, 1.2, 1] : 1,
                  opacity: heart.isFilled ? 1 : 0.3
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.3,
                  scale: {
                    duration: 0.5,
                    ease: "easeInOut"
                  }
                }}
                className={`text-2xl ${heart.isFilled ? 'text-red-500' : 'text-gray-400'}`}
              >
                ❤️
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end">
          <motion.span 
            className="text-lg font-bold"
            animate={{ scale: state.score > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            Skor: {state.score}
          </motion.span>
          <motion.span 
            className={`text-sm ${state.comboPoints > 0 ? 'text-green-600 font-bold' : 'text-gray-600'}`}
            animate={{ 
              scale: state.comboPoints > 0 ? [1, 1.1, 1] : 1,
              color: state.comboPoints > 0 ? '#059669' : '#4B5563'
            }}
            transition={{ duration: 0.3 }}
          >
            Combo: {state.comboPoints}
          </motion.span>
        </div>
      </div>
      {/* Debug bilgisi */}
      <div className="text-xs text-gray-500 mt-1">
        Health: {state.health}/{state.maxHealth} (Alive: {state.isAlive ? 'Yes' : 'No'})
      </div>
    </div>
  )
} 
