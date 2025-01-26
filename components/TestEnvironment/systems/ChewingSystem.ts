import { ChewType, ChewingState, Vector2D } from '../core/types';
import { GAME_CONSTANTS } from '../constants/GameConstants';

export class ChewingSystem {
    private calculateChewZone(
        gumPosition: number,
        jawPosition: number,
        velocity: Vector2D
    ): ChewType {
        const distance = Math.abs(gumPosition - jawPosition);
        const direction = velocity.y < 0 ? 'up' : 'down';

        // Hareket yönüne göre bölge kontrolü
        if (direction === 'up' && gumPosition > jawPosition) {
            return 'late';
        }
        if (direction === 'down' && gumPosition < jawPosition) {
            return 'late';
        }

        const { CHEW_ZONES } = GAME_CONSTANTS;
        const totalGap = CHEW_ZONES.TOTAL_GAP;
        const perfectZone = totalGap / CHEW_ZONES.MULTIPLIERS.PERFECT;
        const goodZone = totalGap / CHEW_ZONES.MULTIPLIERS.GOOD;

        if (distance <= perfectZone) {
            return 'perfect';
        } else if (distance <= goodZone) {
            return 'good';
        } else {
            return 'early';
        }
    }

    public getChewZoneColor(chewType: ChewType): string {
        switch (chewType) {
            case 'perfect':
                return 'bg-gradient-to-r from-green-400 to-green-500';
            case 'good':
                return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
            case 'early':
                return 'bg-gradient-to-r from-orange-400 to-orange-500';
            case 'late':
                return 'bg-gradient-to-r from-red-400 to-red-500';
            default:
                return 'bg-gradient-to-r from-gray-200 to-gray-300';
        }
    }

    public updateChewingState(
        gumY: number,
        topEdge: number,
        bottomEdge: number,
        velocity: Vector2D,
        currentState: ChewingState,
        isBouncingNow: boolean,
        isSqueezing: boolean = false
    ): ChewingState {
        const newState: ChewingState = {
            ...currentState,
            shouldDamagePlayer: false,
            shouldDamageGum: false,
            damageAmount: 0,
            scoreAmount: 0
        };

        // Squeeze durumu kontrolü
        if (isSqueezing) {
            return this.handleSqueezeState(newState);
        }

        // Normal çiğneme durumu
        const chewType = this.calculateChewZone(
            gumY,
            velocity.y < 0 ? topEdge : bottomEdge,
            velocity
        );

        if (isBouncingNow) {
            this.handleChewResult(newState, chewType);
        }

        return newState;
    }

    private handleSqueezeState(state: ChewingState): ChewingState {
        return {
            ...state,
            lastChewType: 'perfect',
            shouldDamageGum: true,
            damageAmount: GAME_CONSTANTS.DAMAGE.SQUEEZE,
            scoreAmount: GAME_CONSTANTS.SCORE.SQUEEZE,
            combo: 0
        };
    }

    private handleChewResult(state: ChewingState, chewType: ChewType): void {
        const { DAMAGE, SCORE, COMBO } = GAME_CONSTANTS;

        switch (chewType) {
            case 'perfect':
                state.shouldDamageGum = true;
                state.damageAmount = DAMAGE.PERFECT;
                state.scoreAmount = SCORE.PERFECT;
                state.combo += COMBO.PERFECT_INCREASE;
                break;

            case 'good':
                state.shouldDamageGum = true;
                state.damageAmount = DAMAGE.GOOD;
                state.scoreAmount = SCORE.GOOD;
                state.combo += COMBO.GOOD_INCREASE;
                break;

            case 'early':
                state.shouldDamagePlayer = true;
                state.combo = Math.max(0, state.combo - COMBO.EARLY_DECREASE);
                break;

            case 'late':
                state.shouldDamagePlayer = true;
                state.combo = 0;
                break;
        }

        state.lastChewType = chewType;
        state.lastChewTime = Date.now();
    }
} 