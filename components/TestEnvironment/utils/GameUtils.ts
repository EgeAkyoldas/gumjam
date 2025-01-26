import { Vector2D } from '../core/types';

export const calculateVelocityInfo = (velocity: Vector2D) => {
    // Hızın büyüklüğü (magnitude)
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Hareket açısı (derece cinsinden, 0° sağ, 90° yukarı)
    let angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    // Açıyı pozitif değere çevir (0-360)
    angle = angle < 0 ? angle + 360 : angle;
    
    // Hareket yönü (ok işareti olarak)
    const direction = (() => {
        if (angle > 315 || angle <= 45) return "→";
        if (angle > 45 && angle <= 135) return "↑";
        if (angle > 135 && angle <= 225) return "←";
        return "↓";
    })();

    return { speed, angle, direction };
};

export const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
};

export const calculateComboMultiplier = (combo: number): number => {
    if (combo <= 0) return 1;
    if (combo < 5) return 1.5;
    if (combo < 10) return 2;
    if (combo < 20) return 3;
    return 4;
};

export const lerp = (start: number, end: number, t: number): number => {
    return start * (1 - t) + end * t;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

export const generateRandomPosition = (
    width: number,
    height: number,
    margin: number = 100
): Vector2D => {
    return {
        x: Math.random() * (width - 2 * margin) + margin,
        y: Math.random() * (height - 2 * margin) + margin
    };
}; 