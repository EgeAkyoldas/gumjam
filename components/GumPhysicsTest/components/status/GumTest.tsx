import { GumState } from '../../../GameState/GumState'
import { motion } from 'framer-motion'

interface GumTestProps {
  state: GumState
}

export const GumTest = ({ state }: GumTestProps) => {
  const healthPercentage = (state.health / state.maxHealth) * 100

  return (
    <div className="p-4 bg-white/90 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-pink-600">Sakız Sağlığı</span>
        <span className="text-sm text-gray-600">{state.health} / {state.maxHealth}</span>
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
          animate={{ width: `${healthPercentage}%` }}
          transition={{ type: "spring", damping: 15 }}
        />
      </div>

      <div className="mt-2 text-center text-2xl">
        {state.isLaughing ? '😈' : healthPercentage > 60 ? '😊' : 
         healthPercentage > 30 ? '😟' : '😰'}
      </div>
    </div>
  )
} 
