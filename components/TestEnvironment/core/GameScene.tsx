'use client';

import React, { useRef, useEffect } from 'react';
import { GameCanvas } from '../ui/GameCanvas';
import { GameUI } from '../ui/GameUI';
import { GameState, ChewingState, GumProperties } from './types';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { GAME_CONSTANTS } from '../constants/GameConstants';
import { PHYSICS_CONSTANTS } from '../constants/PhysicsConstants';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const INITIAL_GUM_STATE: GumProperties = {
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    mass: 1,
    durability: 100,
    elasticity: 0.8,
    size: 20,
    isSqueezing: false
};

const INITIAL_GAME_STATE: GameState = {
    isPlaying: false,
    score: 0,
    lives: 3,
    combo: 0,
    lastCollisionTime: null,
    collisionType: 'none',
    gameStatus: 'idle'
};

const INITIAL_CHEW_STATE: ChewingState = {
    topJaw: 'none',
    bottomJaw: 'none',
    currentScore: 0,
    combo: 0,
    lastChewTime: null,
    meterValue: 0,
    lastChewType: 'none',
    shouldDamagePlayer: false,
    shouldDamageGum: false,
    damageAmount: 0,
    scoreAmount: 0
};

export default function GameScene() {
    const [gameState, setGameState] = React.useState<GameState>(INITIAL_GAME_STATE);
    const [chewState, setChewState] = React.useState<ChewingState>(INITIAL_CHEW_STATE);
    const [gum, setGum] = React.useState<GumProperties>(INITIAL_GUM_STATE);
    
    // Referanslar
    const physicsSystem = useRef<PhysicsSystem>(new PhysicsSystem({ 
        width: CANVAS_WIDTH, 
        height: CANVAS_HEIGHT 
    }));
    const animationFrameRef = useRef<number>();
    const lastUpdateTimeRef = useRef<number>(0);

    // Çene pozisyonları
    const jawPositions = {
        top: 150,
        bottom: 400,
        get topEdge() {
            return this.top + GAME_CONSTANTS.JAW.HEIGHT;
        },
        get bottomEdge() {
            return this.bottom;
        }
    };

    // Oyun döngüsü
    const gameLoop = (timestamp: number) => {
        if (!gameState.isPlaying) return;

        // Delta time hesaplama
        const deltaTime = lastUpdateTimeRef.current ? (timestamp - lastUpdateTimeRef.current) / 1000 : 0;
        lastUpdateTimeRef.current = timestamp;

        setGum(prevGum => {
            const newGum = { ...prevGum };

            // Yerçekimi uygula
            newGum.velocity.y += PHYSICS_CONSTANTS.GRAVITY;

            // Hız sınırlaması
            const speed = Math.sqrt(newGum.velocity.x ** 2 + newGum.velocity.y ** 2);
            if (speed > PHYSICS_CONSTANTS.VELOCITY.MAX) {
                const scale = PHYSICS_CONSTANTS.VELOCITY.MAX / speed;
                newGum.velocity.x *= scale;
                newGum.velocity.y *= scale;
            }

            // Pozisyon güncelle
            newGum.position.x += newGum.velocity.x;
            newGum.position.y += newGum.velocity.y;

            // Çene çarpışma kontrolü
            const handleBounce = (jawY: number, isTopJaw: boolean) => {
                const COLLISION_THRESHOLD = 10; // Çarpışma algılama mesafesi

                if ((isTopJaw && newGum.position.y - newGum.size/2 <= jawY && newGum.velocity.y < 0) || 
                    (!isTopJaw && newGum.position.y + newGum.size/2 >= jawY && newGum.velocity.y > 0)) {
                    
                    // Çarpışma noktasına geri çek
                    newGum.position.y = jawY + (isTopJaw ? newGum.size/2 : -newGum.size/2);

                    // Mevcut hızın büyüklüğünü koru
                    const currentSpeed = Math.sqrt(
                        newGum.velocity.x ** 2 + 
                        newGum.velocity.y ** 2
                    );

                    // Yeni açı hesapla (30-60 derece arası)
                    const bounceAngle = (Math.random() * 30 + 30) * (Math.PI / 180);
                    
                    // Yatay hız yönünü koru
                    const horizontalDirection = newGum.velocity.x > 0 ? 1 : -1;
                    
                    // Yeni hızları hesapla
                    const newSpeed = Math.max(
                        currentSpeed * PHYSICS_CONSTANTS.COLLISION.ELASTICITY,
                        PHYSICS_CONSTANTS.COLLISION.MIN_BOUNCE_SPEED
                    );

                    newGum.velocity = {
                        x: newSpeed * Math.cos(bounceAngle) * horizontalDirection,
                        y: newSpeed * Math.sin(bounceAngle) * (isTopJaw ? 1 : -1)
                    };

                    return true;
                }
                return false;
            };

            // Üst ve alt çene çarpışmalarını kontrol et
            const topCollision = handleBounce(jawPositions.topEdge, true);
            const bottomCollision = handleBounce(jawPositions.bottomEdge, false);

            // Yan duvarlardan sekme
            if (newGum.position.x <= 0) {
                newGum.position.x = 0;
                newGum.velocity.x = Math.abs(newGum.velocity.x) * PHYSICS_CONSTANTS.COLLISION.ELASTICITY;
            } else if (newGum.position.x >= CANVAS_WIDTH) {
                newGum.position.x = CANVAS_WIDTH;
                newGum.velocity.x = -Math.abs(newGum.velocity.x) * PHYSICS_CONSTANTS.COLLISION.ELASTICITY;
            }

            // Sürtünme uygula
            newGum.velocity.x *= PHYSICS_CONSTANTS.VELOCITY.DAMPING;
            newGum.velocity.y *= PHYSICS_CONSTANTS.VELOCITY.DAMPING;

            return newGum;
        });

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Oyun döngüsünü başlat/durdur
    useEffect(() => {
        if (gameState.isPlaying) {
            lastUpdateTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState.isPlaying]);

    const handlePlay = () => {
        setGameState(prev => ({ ...prev, gameStatus: 'playing', isPlaying: true }));
        // Başlangıç hızını ayarla
        setGum(prev => ({
            ...prev,
            velocity: physicsSystem.current.calculateRandomVelocity()
        }));
    };

    const handleReset = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setGameState(INITIAL_GAME_STATE);
        setChewState(INITIAL_CHEW_STATE);
        setGum(INITIAL_GUM_STATE);
        lastUpdateTimeRef.current = 0;
    };

    return (
        <div className="flex gap-4 p-4">
            <div className="flex-1">
                <GameUI
                    gameState={gameState}
                    chewState={chewState}
                    onPlay={handlePlay}
                    onReset={handleReset}
                />
                <div className="mt-4">
                    <GameCanvas
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        gum={gum}
                        topJawY={jawPositions.top}
                        bottomJawY={jawPositions.bottom}
                        topJawColor="bg-white"
                        bottomJawColor="bg-white"
                    />
                </div>
            </div>
        </div>
    );
} 
