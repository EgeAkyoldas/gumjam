import { ChewZone, Vector2D, ChewZoneConfig } from '../types/ChewCalculator';
import { CHEW_CONSTANTS } from '../constants/ChewConstants';

export class ChewCalculator {
    private config: ChewZoneConfig;

    constructor(config?: ChewZoneConfig) {
        this.config = config || {
            totalGap: CHEW_CONSTANTS.JAW_SETTINGS.MAX_GAP,
            multipliers: {
                perfect: CHEW_CONSTANTS.ZONES.PERFECT_ZONE,
                good: CHEW_CONSTANTS.ZONES.GOOD_ZONE
            }
        };
    }

    private calculateJawGap(upperJawY: number, lowerJawY: number): number {
        // Çeneler arası mesafeyi hesapla
        const rawGap = Math.abs(lowerJawY - upperJawY);
        // Diş yüksekliklerini çıkar
        const actualGap = rawGap - (CHEW_CONSTANTS.JAW_SETTINGS.TEETH_HEIGHT * 2);
        return Math.max(CHEW_CONSTANTS.JAW_SETTINGS.MIN_GAP, 
               Math.min(actualGap, CHEW_CONSTANTS.JAW_SETTINGS.MAX_GAP));
    }

    public isInContactWithJaw(gumPosition: number, jawPosition: number): boolean {
        const distance = Math.abs(gumPosition - jawPosition);
        return distance <= CHEW_CONSTANTS.JAW_SETTINGS.TEETH_HEIGHT;
    }

    public calculateChewZone(
        gumPosition: number,
        jawPosition: number,
        velocity: Vector2D
    ): ChewZone {
        // Önce temas kontrolü yap
        if (!this.isInContactWithJaw(gumPosition, jawPosition)) {
            return 'none';
        }

        const distance = Math.abs(gumPosition - jawPosition);
        const direction = velocity.y < 0 ? 'up' : 'down';

        // Debug için log ekleyelim
        console.log('Chew Debug:', {
            gumPosition,
            jawPosition,
            distance,
            direction,
            jawGap: this.calculateJawGap(
                jawPosition - CHEW_CONSTANTS.JAW_SETTINGS.UPPER_JAW_HEIGHT,
                jawPosition
            ),
            zones: {
                perfect: CHEW_CONSTANTS.ZONES.PERFECT_ZONE,
                good: CHEW_CONSTANTS.ZONES.GOOD_ZONE,
                early: CHEW_CONSTANTS.ZONES.EARLY_ZONE
            }
        });

        // Sadece yukarıdan aşağıya hareket ederken çiğneme kontrolü yap
        if (direction === CHEW_CONSTANTS.ZONES.DIRECTION.BOTTOM_TO_TOP) {
            return 'none';
        }

        // Late durumu: Çiğneme olmadan top sekerse
        if (direction === CHEW_CONSTANTS.ZONES.DIRECTION.TOP_TO_BOTTOM && gumPosition > jawPosition) {
            return 'late';
        }

        // Gum pozisyonunu viewport yüzdesine çevir
        const gumPositionPercent = gumPosition / window.innerHeight;

        // Bölge kontrolü
        if (gumPositionPercent >= 0.38 && gumPositionPercent <= 0.40) {
            return 'perfect';
        } else if (gumPositionPercent >= 0.33 && gumPositionPercent < 0.38) {
            return 'good';
        } else if (gumPositionPercent >= 0.25 && gumPositionPercent < 0.33) {
            return 'early';
        }

        return 'none';
    }

    public getTeethColors(chewZone: ChewZone): string[] {
        const baseColor = CHEW_CONSTANTS.TEETH_COLORS[chewZone.toUpperCase() as keyof typeof CHEW_CONSTANTS.TEETH_COLORS];
        // 16 diş için aynı rengi döndür
        return Array(16).fill(baseColor);
    }

    public isValidChewTiming(lastChewTime: number): boolean {
        const currentTime = Date.now();
        return currentTime - lastChewTime >= CHEW_CONSTANTS.TIMING.MIN_CHEW_INTERVAL;
    }

    public calculateCombo(currentCombo: number, chewZone: ChewZone): number {
        const { COMBO } = CHEW_CONSTANTS;

        // Can kaybı olmadan sadece combo hesaplama
        switch (chewZone) {
            case 'perfect':
                return Math.min(currentCombo + COMBO.PERFECT_INCREASE, COMBO.MAX_COMBO);
            case 'good':
                return Math.min(currentCombo + COMBO.GOOD_INCREASE, COMBO.MAX_COMBO);
            case 'early':
            case 'late':
                // Can kaybı yerine sadece combo'yu sıfırla
                return 0;
            default:
                return currentCombo;
        }
    }
}
