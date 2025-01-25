import { motion } from 'framer-motion'
import { ChewType } from './chewingPhysics'

interface ChewMeterProps {
  value: number          // Mevcut değer (0-100)
  maxValue: number       // Maksimum değer
  lastChewType: ChewType // Son çiğneme tipi
}

export const ChewMeter = ({ value, maxValue, lastChewType }: ChewMeterProps) => {
  // Meter rengi (çiğneme tipine göre)
  const getMeterColor = () => {
    switch (lastChewType) {
      case 'perfect':
        return 'bg-gradient-to-r from-green-400 to-green-500'
      case 'good':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      case 'late':
        return 'bg-gradient-to-r from-red-400 to-red-500'
      default:
        return 'bg-gradient-to-r from-pink-400 to-pink-500'
    }
  }

  // Doluluk oranı
  const fillPercentage = Math.min(100, (value / maxValue) * 100)

  // Son çiğneme tipini formatla
  const formatChewType = (type: ChewType) => {
    switch (type) {
      case 'perfect':
        return 'PERFECT!'
      case 'good':
        return 'GOOD'
      case 'late':
        return 'TOO LATE!'
      case 'early':
        return 'TOO EARLY!'
      default:
        return 'NONE'
    }
  }

  // Son çiğneme tipinin rengini belirle
  const getChewTypeColor = (type: ChewType) => {
    switch (type) {
      case 'perfect':
        return 'text-green-500'
      case 'good':
        return 'text-yellow-500'
      case 'late':
      case 'early':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="w-64 space-y-2">
      {/* Meter başlığı */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-pink-600">CHEW METER</span>
        <span className="text-sm text-gray-500">{Math.floor(fillPercentage)}%</span>
      </div>

      {/* Meter çerçevesi */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        {/* Doluluk animasyonu */}
        <motion.div
          className={`h-full ${getMeterColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Son çiğneme tipi */}
      <div className={`text-xs font-bold text-center ${getChewTypeColor(lastChewType)}`}>
        Last Chew: {formatChewType(lastChewType)}
      </div>
    </div>
  )
} 