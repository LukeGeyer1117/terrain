import { storeQuad, drawUVVertices } from "./shapes2d.js";

// A Cell class that knows its own number in the maze, and
// has 4 walls to be turned on or off.
class Cell {
    constructor(number) {
        this.number = number;
        this.left = true;
        this.bottom = true;
        this.right = true;
        this.top = true;
        this.visited = false;
        this.vertices = [];
        this.color = this.generateColor(this.number);
    }

    generateColor(num) {
        // Use bitwise operations to extract pseudo-random colors
        const r = ((num * 37) % 255) / 255;  // Red component
        const g = ((59) % 255) / 255;  // Green component
        const b = ((num * 83) % 255) / 255;  // Blue component
        const a = 1.0;  // Fully opaque

        return [r, g, b, a]; // Return normalized color
    }

    // After the maze generation algorithm runs, the cell adds
    // vertices for the walls it still has.
    draw(x, y, gl, shaderProgram, viewType, vertices) {
		let H = 1;
		let u1 = 0; let v1 = H;
		let u2 = H; let v2 = H;
		let u3 = H; let v3 = 0;
		let u4 = 0; let v4 = 0;

        if (this.left) { 
            let i = 2;  // Index which texture map to use
            storeQuad(vertices,
                x+0.001, y, 0, u1, v1, i,
                x+0.001, y, 1, u4, v4, i,
                x+0.001, y+1, 1, u3, v3, i,
                x+0.001, y+1, 0, u2, v2, i
            );
            storeQuad(vertices,
                x+0.07, y, 0, u1, v1, i,
                x+0.07, y, 1, u4, v4, i,
                x+0.07, y+1, 1, u3, v3, i,
                x+0.07, y+1, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y, 0, u1, v1, i,
                x, y, 1, u4, v4, i,
                x+0.07, y, 1, u3, v3, i,
                x+0.07, y, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y+1, 0, u1, v1, i,
                x, y+1, 1, u4, v4, i,
                x+0.07, y+1, 1, u3, v3, i,
                x+0.07, y+1, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y, 1, u1, v1, i,
                x, y+1, 1, u4, v4, i,
                x+0.07, y+1, 1, u3, v3, i,
                x+0.07, y+1, 1, u4, v4, i

            )
        }
        if (this.top) { 
            let i = 2;
            storeQuad(vertices,
                x, y+0.999, 0, u1, v1, i,
                x, y+0.999, 1, u4, v4, i,
                x+1, y+0.999, 1, u3, v3, i,
                x+1, y+0.999, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y+0.93, 0, u1, v1, i,
                x, y+0.93, 1, u4, v4, i,
                x+1, y+0.93, 1, u3, v3, i,
                x+1, y+0.93, 0, u2, v2, i 
            );
            storeQuad(vertices,
                x+1, y+0.93, 0, u1, v1, i,
                x+1, y+0.93, 1, u4, v4, i,
                x+1, y+1, 1, u3, v3, i,
                x+1, y+1, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y+1, 0, u1, v1, i,
                x, y+1, 1, u4, v4, i,
                x, y+0.93, 1, u3, v3, i,
                x, y+0.93, 0, u2, v2, i
            );
            storeQuad(vertices,
                x, y+0.93, 1, u1, v1, i,
                x, y+1, 1, u4, v4, i,
                x+1, y+1, 1, u3, v3, i,
                x+1, y+0.93, 1, u2, v2, i
            )
        }
        if (this.right) { 
            let i = 2;
            storeQuad(vertices,
                x+1, y+1, 0, u1, v1, i,
                x+1, y+1, 1, u4, v4, i,
                x+1, y, 1, u3, v3, i,
                x+1, y, 0, u2, v2, i
            );
        }
        if (this.bottom) { 
            let i = 2;
            storeQuad(vertices,
                x+1, y, 0, u1, v1, i,
                x+1, y, 1, u4, v4, i,
                x, y, 1, u3, v3, i,
                x, y, 0, u2, v2, i
            )
        }

        // floor
        let i = 1;
        storeQuad(vertices, 
            x, y, 0, u1, v1, i,
            x, y+1, 0, u2, v2, i,
            x+1, y+1, 0, u3, v3, i,
            x+1, y, 0, u4, v4, i
        )

        if (viewType == "RatsView") {
            // roof
            i = -1;
            storeQuad(vertices,
                x, y, 1, u1, v1, i,
                x, y+1, 1, u2, v2, i,
                x+1, y+1, 1, u3, v3, i,
                x+1, y, 1, u4, v4, i
            )

        }
    }
}

// A Maze class, which stores a 2-dimensional array of Cell objects, 
// and uses a maze-carving algorithm to generate a brand new maze.
class Maze {
    constructor(width, height) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.cells = [];
        for (let i = 0; i < this.HEIGHT; i++) {
            let layer = []
            for (let j = 0; j < this.WIDTH; j++) {
                layer.push(new Cell(i*this.WIDTH + j));
            }
            this.cells.push(layer);
        }
        this.removeWalls(0,0);
        // this.cells[0][0].bottom = false;
        // this.cells[this.HEIGHT-1][this.WIDTH-1].top = false;
        this.viewType = "TopView";
    }

    draw(gl, shaderProgram) {
        const vertices = [];
        for (let r = 0; r < this.HEIGHT; r++) {
            for (let c = 0; c < this.WIDTH; c++) {
                this.cells[r][c].draw(c, r, gl, shaderProgram, this.viewType, vertices);
            }
        }
        drawUVVertices(gl, shaderProgram, vertices, gl.TRIANGLES);
    }

    // A recursive algorithm, which finds the possible moves from a given cell, and 
    // randomly selects moves to base the shape of the maze from. Creates a single
    // path from every cell to every other cell.
    removeWalls(row, column) {
        const LEFT = 0;
        const DOWN = 1;
        const RIGHT = 2;
        const UP = 3;
        this.cells[row][column].visited = true;

        // Find the possible moves from the current cell.
        while (true) {
            let possible = [];
            if (row > 0 && this.cells[row-1][column].visited == false) { possible.push(DOWN); }
            if (row < this.HEIGHT -1 && this.cells[row+1][column].visited == false) { possible.push(UP); }
            if (column > 0 && this.cells[row][column-1].visited == false) { possible.push(LEFT); }
            if (column < this.WIDTH - 1 && this.cells[row][column+1].visited == false) { possible.push(RIGHT); }

            if (possible.length == 0) {
                return;
            }

            // Choose a move randomly from the possible moves
            const choice = Math.floor(Math.random() * possible.length);
            const go = possible[choice];

            // Make the move and delete the correct walls
            if (go == LEFT) {
                this.cells[row][column].left = false;
                this.cells[row][column - 1].right = false;
                this.removeWalls(row, column-1);
            }
            else if (go == RIGHT) {
                this.cells[row][column].right = false;
                this.cells[row][column+1].left = false;
                this.removeWalls(row, column+1);
            }
            else if (go == UP) {
                this.cells[row][column].top = false;
                this.cells[row+1][column].bottom = false;
                this.removeWalls(row+1, column);
            }
            else if (go == DOWN) {
                this.cells[row][column].bottom = false;
                this.cells[row-1][column].top = false;
                this.removeWalls(row-1, column);
            }
        }
    }

    // Determine if the mouse's current location is legal,
    // and adjust if it passes over a wall.
    isLegalPositionMouse(mouse) {
        // Get the cell the mouse is in
        let column = Math.floor(mouse.x);
        let row = Math.floor(mouse.y);
        let cell = this.cells[row][column];
        // Check each wall that's on, adjust mouse if needed
        if (cell.bottom) {
            if (mouse.y - mouse.radius < row) {
                mouse.y = row + mouse.radius;
            }
        }
        if (cell.top) {
            if (mouse.y + mouse.radius > row+1) {
                mouse.y = row+1 - mouse.radius;
            }
        }
        if (cell.left) {
            if (mouse.x - mouse.radius < column) {
                mouse.x = column + mouse.radius;
            }
        }
        if (cell.right) {
            if (mouse.x + mouse.radius > column+1) {
                mouse.x = column+1 - mouse.radius;
            }
        }
    }

    isLegalPositionBullet(bullet) {
        // Get the cell the mouse is in
        if (bullet.x < 0 + bullet.radius || bullet.y < 0 + bullet.radius) {
            bullet.speed = 0; 
            return;
        }
        if (bullet.x > this.WIDTH - bullet.radius || bullet.y > this.HEIGHT - bullet.radius) {
            bullet.speed = 0;
            return;
        } 
        let column = Math.floor(bullet.x);
        let row = Math.floor(bullet.y);
        let cell = this.cells[row][column];
        // Check each wall that's on, adjust mouse if needed
        if (cell.bottom) {
            if (bullet.y - bullet.radius - 0.05 < row) {
                bullet.speed = 0;
            }
        }
        if (cell.top) {
            if (bullet.y + bullet.radius + 0.05 > row+1) {
                bullet.speed = 0;
            }
        }
        if (cell.left) {
            if (bullet.x - bullet.radius - 0.05 < column) {
                bullet.speed = 0;
            }
        }
        if (cell.right) {
            if (bullet.x + bullet.radius + 0.05 > column+1) {
                bullet.speed = 0;
            }
        }
    }
}

export { Maze, Cell };