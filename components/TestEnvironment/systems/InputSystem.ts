// Location: components/TestEnvironment/systems/InputSystem.ts

import { InputAction, InputEvent } from '../core/types';

export class InputSystem {
    private keyMap: Map<string, InputAction>;
    private listeners: ((event: InputEvent) => void)[];
    private isListening: boolean;

    constructor() {
        this.keyMap = new Map([
            ['Space', 'CHEW'],
            ['KeyA', 'TONGUE_LEFT'],
            ['KeyD', 'TONGUE_RIGHT']
        ]);
        this.listeners = [];
        this.isListening = false;
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    public start(): void {
        if (!this.isListening) {
            window.addEventListener('keydown', this.handleKeyDown);
            this.isListening = true;
        }
    }

    public stop(): void {
        if (this.isListening) {
            window.removeEventListener('keydown', this.handleKeyDown);
            this.isListening = false;
        }
    }

    public addListener(callback: (event: InputEvent) => void): void {
        this.listeners.push(callback);
    }

    public removeListener(callback: (event: InputEvent) => void): void {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    public clearListeners(): void {
        this.listeners = [];
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const action = this.keyMap.get(event.code);
        if (action) {
            const inputEvent: InputEvent = {
                action,
                timestamp: performance.now()
            };
            this.notifyListeners(inputEvent);
        }
    }

    private notifyListeners(event: InputEvent): void {
        this.listeners.forEach(listener => listener(event));
    }

    public cleanup(): void {
        this.stop();
        this.clearListeners();
    }
} 