import { Bullet } from "./bullet.js";
import { drawTriangle } from "./shapes2d.js";

// A Mouse class that tracks its current position and
// face direction, updating its vertices based on current
// position and rotation.
class Mouse {
    constructor(column, row, t, elevations) {
        this.terrain = t;
        this.elevations = elevations;
        this.x = column+0.5;
        this.y = row+0.5;
        this.z = elevations[this.x - 0.5, this.y - 0.5];
        if (this.z < t.waterHeight) {
            this.z = t.waterHeight + 0.2;
        }
        this.radius = 0.15; // must be < 0.5 for the maze not to go wild
        this.radians = Math.PI/2; // Facing right initially

        // mouse spit
        this.bullets = [];

        // Define vertices relative to the center
        this.baseVertices = [
            [-0.2, -0.1, elevation(-0.2, -0.1)], // Left point
            [0.2, 0, elevation(0.2, 0)],     // Forward point (tip)
            [-0.2, 0.1, elevation(-0.2, 0.1)]   // Right point
        ];

        this.updateVertices();
    }

    // Movement functions, to be called if buttons are pressed

    scurry(forwardSpeed, DeltaT) {
        // Move in the direction the mouse is facing
        this.x += Math.cos(this.radians) * DeltaT * forwardSpeed;
        this.y += Math.sin(this.radians) * DeltaT * forwardSpeed;

        this.updateVertices();
    }

    backup(backwardSpeed, DeltaT) {
        // Move opposite to the direction it's facing
        this.x -= Math.cos(this.radians) * DeltaT * backwardSpeed;
        this.y -= Math.sin(this.radians) * DeltaT * backwardSpeed;

        this.updateVertices();
    }

    strafe(sideSpeed, DeltaT) {
        // Move sideways (left/right) based on perpendicular direction
        this.x += Math.cos(this.radians + Math.PI / 2) * DeltaT * sideSpeed;
        this.y += Math.sin(this.radians + Math.PI / 2) * DeltaT * sideSpeed;

        this.updateVertices();
    }

    rotate(spinSpeed, DeltaT) {
        this.radians += spinSpeed * DeltaT;
        this.updateVertices();
    }

    // The spit method, which (eventually will) shoots a spit bullet in a straight line forward
    spit() {
        if (this.bullets.length < 4) {
            let bulletX = this.x, bulletY = this.y;
            let bulletRadians = this.radians;
            let b = new Bullet(bulletX, bulletY, bulletRadians);
            this.bullets.push(b);
        }
    }
    // Function to update all mouse vertices as center x, y, and radians (direction)
    // changes. Should be called after every movement function, and in the contructor.
    updateVertices() {
        this.z = elevation(this.x, this.y)+ 0.2;
        if (this.z < this.terrain.waterHeight) {
            this.z = this.terrain.waterHeight + 0.2;
        } else {
            this.z = elevation(this.x, this.y) + 0.2;
        }

        const cosA = Math.cos(this.radians);
        const sinA = Math.sin(this.radians);

        // Apply rotation to base vertices
        this.vertices = this.baseVertices.flatMap(([x, y, z]) => {
            let rotatedX = cosA * x - sinA * y;
            let rotatedY = sinA * x + cosA * y;
            let rotatedZ;
            if (elevation(this.x, this.y) + 0.3 < this.terrain.waterHeight) {
                rotatedZ = this.terrain.waterHeight + 0.2;
            } else {
                rotatedZ = elevation(rotatedX, rotatedY) + 1 + this.z;
            }
            // Translate back to the mouse's center
            return [rotatedX + this.x, rotatedY + this.y, rotatedZ];
        });
    }

    draw(gl, shaderProgram) {
        drawTriangle(gl, shaderProgram, this.vertices, [1, 0, 1, 1]);
    }
}

export { Mouse };
