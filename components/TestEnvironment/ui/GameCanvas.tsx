import React, { useRef, useEffect } from 'react';
import { GumProperties } from '../core/types';
import { GAME_CONSTANTS } from '../constants/GameConstants';

interface GameCanvasProps {
    width: number;
    height: number;
    gum: GumProperties;
    topJawY: number;
    bottomJawY: number;
    topJawColor: string;
    bottomJawColor: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    width,
    height,
    gum,
    topJawY,
    bottomJawY,
    topJawColor,
    bottomJawColor
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw jaws
        drawJaw(ctx, topJawY, topJawColor, true);
        drawJaw(ctx, bottomJawY, bottomJawColor, false);

        // Draw gum
        drawGum(ctx, gum);

    }, [width, height, gum, topJawY, bottomJawY, topJawColor, bottomJawColor]);

    const drawJaw = (
        ctx: CanvasRenderingContext2D,
        y: number,
        color: string,
        isTop: boolean
    ) => {
        ctx.save();
        
        // Convert Tailwind color class to actual color
        const actualColor = getColorFromClass(color);
        
        ctx.fillStyle = actualColor;
        ctx.fillRect(0, y, width, GAME_CONSTANTS.JAW.HEIGHT);

        // Draw jaw edge
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.moveTo(0, isTop ? y + GAME_CONSTANTS.JAW.HEIGHT : y);
        ctx.lineTo(width, isTop ? y + GAME_CONSTANTS.JAW.HEIGHT : y);
        ctx.stroke();

        ctx.restore();
    };

    const drawGum = (ctx: CanvasRenderingContext2D, gum: GumProperties) => {
        ctx.save();

        // Apply transformations
        ctx.translate(gum.position.x, gum.position.y);
        ctx.scale(gum.isSqueezing ? 1.3 : 1, gum.isSqueezing ? 0.7 : 1);

        // Draw gum circle
        ctx.beginPath();
        ctx.fillStyle = '#ec4899';
        ctx.arc(0, 0, gum.size, 0, Math.PI * 2);
        ctx.fill();

        // Add shine effect
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.arc(-gum.size/3, -gum.size/3, gum.size/3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    const getColorFromClass = (className: string): string => {
        // Convert Tailwind gradient classes to actual colors
        if (className.includes('green')) return '#22c55e';
        if (className.includes('yellow')) return '#eab308';
        if (className.includes('orange')) return '#f97316';
        if (className.includes('red')) return '#ef4444';
        return '#e5e7eb';  // Default gray
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border-2 border-gray-300 bg-white rounded-lg"
        />
    );
}; 