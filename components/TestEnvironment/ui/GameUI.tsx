// Location: components/TestEnvironment/ui/GameUI.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { GameState, ChewingState } from '../core/types';

interface GameUIProps {
    gameState: GameState;
    chewState: ChewingState;
    onPlay: () => void;
    onReset: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
    gameState,
    chewState,
    onPlay,
    onReset
}) => {
    return (
        <div className="flex flex-col gap-4">
            {/* Game Controls */}
            <div className="flex gap-4 p-4 bg-white/90 rounded-lg shadow-lg">
                <button
                    onClick={onPlay}
                    disabled={gameState.gameStatus === 'playing'}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
                >
                    Play
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Reset
                </button>
            </div>

            {/* Game Stats */}
            <div className="p-4 bg-white/90 rounded-lg shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold text-gray-700">Score</h3>
                        <p className="text-2xl font-bold text-pink-600">
                            {gameState.score}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">Combo</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {chewState.combo}x
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">Lives</h3>
                        <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 1 }}
                                    animate={{
                                        scale: i < gameState.lives ? [1, 1.2, 1] : 1,
                                        opacity: i < gameState.lives ? 1 : 0.3
                                    }}
                                    className="text-2xl"
                                >
                                    ❤️
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">Last Chew</h3>
                        <p className="text-lg font-semibold" style={{
                            color: chewState.lastChewType === 'perfect' ? '#22c55e' :
                                   chewState.lastChewType === 'good' ? '#eab308' :
                                   chewState.lastChewType === 'early' ? '#f97316' : '#ef4444'
                        }}>
                            {chewState.lastChewType.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Game Instructions */}
            {gameState.gameStatus === 'idle' && (
                <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
                    <h3 className="font-bold mb-2">How to Play:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Press SPACE to chew when the gum is in the perfect zone</li>
                        <li>Time your chews correctly to score points</li>
                        <li>Build up your combo for higher scores</li>
                        <li>Don&apos;t miss or you&apos;ll lose health!</li>
                    </ul>
                </div>
            )}

            {/* Game Over Screen */}
            {gameState.gameStatus === 'ended' && (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                    <p className="text-lg mb-4">Final Score: {gameState.score}</p>
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}; 