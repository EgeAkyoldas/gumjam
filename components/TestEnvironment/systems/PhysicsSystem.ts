import { Vector2D, PhysicsObject, GumProperties } from '../core/types';
import { PHYSICS_CONSTANTS } from '../constants/PhysicsConstants';

export class PhysicsSystem {
    constructor(private boundaries: { width: number; height: number }) {}

    public updatePosition(object: PhysicsObject): void {
        // Verlet integrasyonu ile pozisyon güncelleme
        const newPosition = this.calculateNewPosition(object);
        
        // Hız güncelleme
        object.velocity = this.calculateNewVelocity(object);
        
        // Sınır kontrolü
        object.position = this.checkBoundaries(newPosition);
    }

    public applyGravity(object: PhysicsObject): void {
        object.acceleration = {
            x: object.acceleration.x,
            y: PHYSICS_CONSTANTS.GRAVITY
        };
    }

    public applyChewForce(gum: GumProperties, force: number): void {
        gum.velocity = {
            x: gum.velocity.x,
            y: -force / gum.mass
        };
    }

    public calculateRandomVelocity(baseSpeed: number = PHYSICS_CONSTANTS.VELOCITY.BASE): Vector2D {
        const angle = PHYSICS_CONSTANTS.ANGLE.MIN + 
            (PHYSICS_CONSTANTS.ANGLE.MAX - PHYSICS_CONSTANTS.ANGLE.MIN) * Math.random();
        const direction = Math.random() > 0.5 ? 1 : -1;

        return {
            x: baseSpeed * Math.cos(angle) * direction,
            y: baseSpeed * Math.sin(angle)
        };
    }

    private calculateNewPosition(object: PhysicsObject): Vector2D {
        return {
            x: object.position.x + object.velocity.x * PHYSICS_CONSTANTS.TIME_STEP +
               0.5 * object.acceleration.x * PHYSICS_CONSTANTS.TIME_STEP * PHYSICS_CONSTANTS.TIME_STEP,
            y: object.position.y + object.velocity.y * PHYSICS_CONSTANTS.TIME_STEP +
               0.5 * object.acceleration.y * PHYSICS_CONSTANTS.TIME_STEP * PHYSICS_CONSTANTS.TIME_STEP
        };
    }

    private calculateNewVelocity(object: PhysicsObject): Vector2D {
        const newVelocity = {
            x: object.velocity.x + object.acceleration.x * PHYSICS_CONSTANTS.TIME_STEP,
            y: object.velocity.y + object.acceleration.y * PHYSICS_CONSTANTS.TIME_STEP
        };

        // Hız sınırlaması
        const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
        
        if (speed > PHYSICS_CONSTANTS.VELOCITY.MAX) {
            const scale = PHYSICS_CONSTANTS.VELOCITY.MAX / speed;
            newVelocity.x *= scale;
            newVelocity.y *= scale;
        } else if (speed < PHYSICS_CONSTANTS.VELOCITY.MIN && speed > 0) {
            const scale = PHYSICS_CONSTANTS.VELOCITY.MIN / speed;
            newVelocity.x *= scale;
            newVelocity.y *= scale;
        }

        // Sürtünme uygulaması
        newVelocity.x *= PHYSICS_CONSTANTS.VELOCITY.DAMPING;
        newVelocity.y *= PHYSICS_CONSTANTS.VELOCITY.DAMPING;

        return newVelocity;
    }

    private checkBoundaries(position: Vector2D): Vector2D {
        return {
            x: Math.max(PHYSICS_CONSTANTS.COLLISION.EDGE_BUFFER, 
               Math.min(position.x, this.boundaries.width - PHYSICS_CONSTANTS.COLLISION.EDGE_BUFFER)),
            y: Math.max(PHYSICS_CONSTANTS.COLLISION.EDGE_BUFFER, 
               Math.min(position.y, this.boundaries.height - PHYSICS_CONSTANTS.COLLISION.EDGE_BUFFER))
        };
    }
} 