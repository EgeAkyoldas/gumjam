import { PlayerState } from '../GameState/PlayerState'
import { motion } from 'framer-motion'

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
          {hearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ scale: 1 }}
              animate={{ 
                scale: heart.isFilled ? [1, 1.2, 1] : 1,
                opacity: heart.isFilled ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
              className="text-2xl text-red-500"
            >
              ❤️
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold">Skor: {state.score}</span>
          <span className="text-sm text-gray-600">
            Combo: {state.comboPoints}
          </span>
        </div>
      </div>
    </div>
  )
} 
