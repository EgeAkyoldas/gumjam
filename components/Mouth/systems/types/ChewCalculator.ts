export type ChewZone = 'perfect' | 'good' | 'early' | 'late' | 'none';

export interface TeethState {
    colors: string[];
    currentZone: ChewZone;
}

export interface ChewingState {
    isChewing: boolean;
    lastChewTime: number;
    teethState: TeethState;
    combo: number;
}

export interface Vector2D {
    x: number;
    y: number;
}

export interface ChewZoneConfig {
    totalGap: number;
    multipliers: {
        perfect: number;
        good: number;
    };
}
