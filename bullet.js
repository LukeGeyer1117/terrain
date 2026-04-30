import { drawCircle } from "./shapes2d.js";

class Bullet {
    constructor(x, y, radians) {
        this.x = x;
        this.y = y;
        this.z = 0.05;
        this.radius = 0.06
        this.radians = radians;
        this.speed = 0.1;
    }
    fly() {
        const nextX = this.x + this.speed * Math.cos(this.radians);
        const nextY = this.y + this.speed * Math.sin(this.radians);
        this.x = nextX;
        this.y = nextY;
    }
    draw(gl, shaderProgram) {
        drawCircle(gl, shaderProgram, this.x, this.y, this.z, this.radius, [1, 0, 0, 1]);
    }
}

export { Bullet };