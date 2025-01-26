import { motion } from 'framer-motion'
import { GAME_CONSTANTS } from '../../core/constants/GameConstants'

interface GameAreaProps {
  physics: {
    position: { x: number; y: number }
    scale: { x: number; y: number }
  }
  jawPositions: {
    top: number
    bottom: number
    topEdge: number
    bottomEdge: number
  }
  platformColors: {
    top: string
    bottom: string
  }
  isSpacePressed: boolean
}

export const GameArea = ({ 
  physics, 
  jawPositions, 
  platformColors,
  isSpacePressed 
}: GameAreaProps) => {
  return (
    <div className="relative w-[800px] h-[600px] bg-pink-100 rounded-lg overflow-hidden">
      {/* Üst çene (sabit) */}
      <div 
        className={`absolute w-full shadow-md transition-colors duration-200 ${platformColors.top}`}
        style={{ 
          top: jawPositions.top,
          height: GAME_CONSTANTS.JAW_CONSTANTS.JAW_HEIGHT
        }}
      >
        {/* Üst çene alt kenar çizgisi */}
        <div 
          className="absolute w-full h-[2px] bg-red-400 opacity-50" 
          style={{ bottom: 0 }} 
        />
      </div>
      
      {/* Alt çene (hareketli) */}
      <motion.div 
        className={`absolute w-full shadow-md transition-colors duration-200 ${platformColors.bottom}`}
        style={{
          height: GAME_CONSTANTS.JAW_CONSTANTS.JAW_HEIGHT
        }}
        initial={{ top: jawPositions.bottom }}
        animate={{ 
          top: isSpacePressed 
            ? [jawPositions.topEdge + GAME_CONSTANTS.GUM_SIZE, jawPositions.bottom] 
            : jawPositions.bottom
        }}
        transition={{ 
          duration: 0.2,
          times: [0.5, 1],
          ease: "easeInOut"
        }}
      >
        {/* Alt çene üst kenar çizgisi */}
        <div 
          className="absolute w-full h-[2px] bg-red-400 opacity-50" 
          style={{ top: 0 }} 
        />
      </motion.div>
      
      {/* Sakız */}
      <motion.div
        className="absolute bg-pink-400 rounded-full shadow-lg"
        style={{
          width: GAME_CONSTANTS.GUM_SIZE,
          height: GAME_CONSTANTS.GUM_SIZE,
          x: physics.position.x - GAME_CONSTANTS.GUM_SIZE/2,
          y: physics.position.y - GAME_CONSTANTS.GUM_SIZE/2,
          scaleX: physics.scale.x,
          scaleY: physics.scale.y,
          transformOrigin: "center"
        }}
      />
    </div>
  )
} 