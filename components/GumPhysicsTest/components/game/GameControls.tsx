interface GameControlsProps {
  gameStatus: 'idle' | 'playing' | 'ended'
  onPlay: () => void
  onReset: () => void
}

export const GameControls = ({ gameStatus, onPlay, onReset }: GameControlsProps) => {
  return (
    <div className="flex gap-4 p-4 bg-white/90 rounded-lg shadow-lg">
      <button
        onClick={onPlay}
        disabled={gameStatus === 'playing'}
        className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600 transition-colors"
      >
        {gameStatus === 'playing' ? 'Playing...' : 'Play'}
      </button>
      
      <button
        onClick={onReset}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Reset
      </button>

      {gameStatus === 'ended' && (
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg">
          Game Over!
        </div>
      )}
    </div>
  )
} 