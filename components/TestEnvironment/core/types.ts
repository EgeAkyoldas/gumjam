// Location: components/TestEnvironment/core/types.ts

// Temel vektör tipi
export interface Vector2D {
    x: number;
    y: number;
}

// Fizik nesnesi için temel tip
export interface PhysicsObject {
    position: Vector2D;
    velocity: Vector2D;
    acceleration: Vector2D;
    mass: number;
}

// Sakız özellikleri
export interface GumProperties extends PhysicsObject {
    durability: number;
    elasticity: number;
    size: number;
    isSqueezing: boolean;
}

// Oyun durumu
export interface GameState {
    isPlaying: boolean;
    score: number;
    lives: number;
    combo: number;
    lastCollisionTime: number | null;
    collisionType: 'none' | 'approaching' | 'perfect' | 'late';
    gameStatus: 'idle' | 'playing' | 'ended';
}

// Çiğneme tipleri
export type ChewType = 'none' | 'perfect' | 'good' | 'early' | 'late';

// Çiğneme durumu
export interface ChewingState {
    topJaw: ChewType;
    bottomJaw: ChewType;
    currentScore: number;
    combo: number;
    lastChewTime: number | null;
    meterValue: number;
    lastChewType: ChewType;
    shouldDamagePlayer: boolean;
    shouldDamageGum: boolean;
    damageAmount: number;
    scoreAmount: number;
}

// Sıkıştırma durumu
export interface SqueezeState {
    isSqueezeReady: boolean;
    squeezeTimer: number;
    isSqueezing: boolean;
    squeezeDamage: number;
    squeezeStartTime: number | null;
}

// Girdi aksiyonları
export type InputAction = 'CHEW' | 'TONGUE_LEFT' | 'TONGUE_RIGHT';

// Girdi olayları
export interface InputEvent {
    action: InputAction;
    timestamp: number;
} 
