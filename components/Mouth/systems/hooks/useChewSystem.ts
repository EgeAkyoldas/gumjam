import { useState, useCallback, useEffect } from 'react';
import { ChewCalculator } from '../utils/ChewCalculator';
import { ChewingState, Vector2D, ChewZone } from '../types/ChewCalculator';
import { CHEW_CONSTANTS } from '../constants/ChewConstants';

const calculator = new ChewCalculator();

const initialState: ChewingState = {
    isChewing: false,
    lastChewTime: 0,
    teethState: {
        colors: Array(16).fill(CHEW_CONSTANTS.TEETH_COLORS.NONE),
        currentZone: 'none'
    },
    combo: 0
};

export const useChewSystem = () => {
    const [chewState, setChewState] = useState<ChewingState>(initialState);
    const [debugInfo, setDebugInfo] = useState<{
        zone: ChewZone;
        position: number;
        lastUpdate: number;
        chewAttempts: number;
        lastChewZone: ChewZone;
        chewHistory: Array<{
            time: number;
            zone: ChewZone;
            success: boolean;
        }>;
    }>({
        zone: 'none',
        position: 0,
        lastUpdate: Date.now(),
        chewAttempts: 0,
        lastChewZone: 'none',
        chewHistory: []
    });

    // Zone değişimlerini izle
    useEffect(() => {
        console.log('Zone Değişimi:', {
            debugZone: debugInfo.zone,
            teethZone: chewState.teethState.currentZone,
            isChewing: chewState.isChewing,
            lastChewZone: debugInfo.lastChewZone
        });
    }, [debugInfo.zone, chewState.teethState.currentZone]);

    const updateChewZone = useCallback((
        gumPosition: number,
        jawPosition: number,
        velocity: Vector2D,
        currentZone: ChewZone
    ) => {
        console.log('updateChewZone çağrıldı:', {
            gumPosition,
            jawPosition,
            velocity,
            currentZone
        });

        // Önce debug bilgilerini güncelle
        setDebugInfo(prev => {
            const zoneChanged = currentZone !== prev.zone;
            if (zoneChanged) {
                console.log('Debug Zone Güncelleniyor:', {
                    old: prev.zone,
                    new: currentZone
                });
            }
            return {
                ...prev,
                zone: currentZone,
                position: gumPosition,
                lastUpdate: Date.now()
            };
        });

        // Sonra chew state'i güncelle
        setChewState(prev => {
            const colors = calculator.getTeethColors(currentZone);
            console.log('Chew State Güncelleniyor:', {
                oldZone: prev.teethState.currentZone,
                newZone: currentZone,
                colors
            });
            return {
                ...prev,
                teethState: {
                    colors,
                    currentZone
                }
            };
        });
    }, []);

    const startChewing = useCallback(() => {
        console.log('startChewing çağrıldı:', {
            currentZone: debugInfo.zone,
            lastChewTime: chewState.lastChewTime,
            isChewing: chewState.isChewing
        });

        if (!calculator.isValidChewTiming(chewState.lastChewTime)) {
            console.log('Çiğneme Reddedildi: Çok Erken');
            return;
        }

        const currentTime = Date.now();

        // Debug bilgilerini güncelle
        setDebugInfo(prev => {
            console.log('Çiğneme Debug Güncelleniyor:', {
                oldZone: prev.zone,
                attempts: prev.chewAttempts + 1
            });

            return {
                ...prev,
                chewAttempts: prev.chewAttempts + 1,
                lastChewZone: prev.zone,
                chewHistory: [
                    ...prev.chewHistory.slice(-9),
                    {
                        time: currentTime,
                        zone: prev.zone,
                        success: prev.zone !== 'none'
                    }
                ]
            };
        });

        // Chew state'i güncelle
        setChewState(prev => {
            const newCombo = calculator.calculateCombo(prev.combo, debugInfo.zone);
            console.log('Çiğneme State Güncelleniyor:', {
                oldCombo: prev.combo,
                newCombo,
                zone: debugInfo.zone
            });

            return {
                ...prev,
                isChewing: true,
                lastChewTime: currentTime,
                combo: newCombo
            };
        });

        // Çiğneme bitişini planla
        setTimeout(() => {
            console.log('Çiğneme Bitiyor');
            setChewState(prev => ({
                ...prev,
                isChewing: false
            }));
        }, CHEW_CONSTANTS.TIMING.CHEW_DURATION);
    }, [chewState.lastChewTime, debugInfo.zone]);

    return {
        chewState,
        updateChewZone,
        startChewing,
        debugInfo
    };
};
