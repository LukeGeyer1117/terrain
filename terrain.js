import { storeQuad, drawUVVertices, crossProduct, drawColorNormalVertices } from "./shapes2d.js";
import { Index, shaderIndex } from "./main.js";


const sandColor = [234/255, 208/255, 168/255];  // light brown
const grassColor = [0, 1, 0];   // green 
const snowColor = [1, 1, 1];    // white

// A Terrain Class, which will cover the screen
class Terrain {
    constructor(width, height, elevations, shaderElevations) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.waterHeight = 0;
        this.baseWaterHeight = this.waterHeight;
        this.grassLevel = this.baseWaterHeight + 1;
        this.snowLevel = this.grassLevel + 6;
        this.elevations = elevations;
        this.shaderElevations = shaderElevations;
        this.treeChances = new Float32Array(this.WIDTH * this.HEIGHT);
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                const noiseVal = (noise.simplex2(x * 0.1, y * 0.1) + 1) / 2;
                this.treeChances[Index(x, y, this.WIDTH)] = noiseVal;
            }
        }
    } 
    getMaxHeight(x, y) {
        let h = this.elevations[Index(x, y, this.WIDTH)];
        if (this.waterHeight > h) {
            h = this.waterHeight;
        }
        return h;
    }
    waterElevation(x, y, wave_intensity) {
        let z = this.waterHeight;
        z += wave_intensity * Math.sin(x / 5) + wave_intensity * Math.cos(x / 2);
        z += wave_intensity * Math.sin(y / 9 - 2);
        z += wave_intensity * Math.sin(x / 3 + 2) * Math.cos(y / 8);
        return z;
    }
    generateTree(x, y, vertices) {
        let H = 1;
        let u1 = 0, v1 = H;
        let u2 = H, v2 = H;
        let u3 = H, v3 = 0;
        let u4 = 0, v4 = 0;

        let x1 = x, x2 = x+0.5, x3 = x2, x4 = x+1;
        let y1 = y, y2 = y, y3 = y, y4 = y;
        let z1 = this.elevations[Index(x1, y1, this.WIDTH)]
        let z2 = (z1 + 3);
        let z3 = z2;
        let z4 = this.elevations[Index(x4, y4, this.WIDTH   )];
        let e = 0.1;

        let [nx1, ny1, nz1] = crossProduct(x1, y1, this.elevations[Index(x1, y1, this.WIDTH)],
            x1 + e, y1, elevation(x1+e, y1),
            x1 + e, y1 + e, elevation(x1+e, y1+e));
        let [nx2, ny2, nz2] = crossProduct(x2, y2, this.elevations[Index(x2, y2, this.WIDTH)],
            x2 + e, y2, elevation(x2+e, y2),
            x2 + e, y2 + e, elevation(x2+e, y2+e));
        let [nx3, ny3, nz3] = crossProduct(x3, y3, this.elevations[Index(x3, y3, this.WIDTH)],
            x3 + e, y3, elevation(x3+e, y3),
            x3 + e, y3 + e, elevation(x3+e, y3+e));
        let [nx4, ny4, nz4] = crossProduct(x4, y4,this.elevations[Index(x4, y4, this.WIDTH)],
            x4 + e, y4, elevation(x4+e, y4),
            x4 + e, y4 + e, elevation(x4+e, y4+e));

        console.log(x1, y1, z1, z2, y2, z2, x3, y3, z3 ,x4, y4, z4);
        storeQuad(vertices, x1, y1, z1, nx1, ny1, nz1, u1, v1,
            x2, y2, z2, nx2, ny2, nz2, u2, v2,
            x3, y3, z3, nx3, ny3, nz3, u3, v3,
            x4, y4, z4, nx4, ny4, nz4, u4, v4,
            0, 1, 0, 1, 1);

        x1 = x+0.5, x2 = x1, x3 = x1, x4 = x1;
        
    }
    

    draw(gl, shaderProgram, currentTime, mouse, render_distance, map_size, wave_intensity, water_quality) {
        let vertices = [];
        let H = 1;
        let u1 = 0, v1 = H;
        let u2 = H, v2 = H;
        let u3 = H, v3 = 0;
        let u4 = 0, v4 = 0;
        for (let x = Math.floor(mouse.x - render_distance); x < Math.floor(mouse.x + render_distance); x++) {
            for (let y = Math.floor(mouse.y - render_distance); y < Math.floor(mouse.y + render_distance); y++) {
                let d_2 = (x - mouse.x)**2 + (y - mouse.y)**2
                if (d_2 > render_distance**2 || x > map_size - 1 || x < 0 || y < 0 || y > map_size - 1) {
                    continue;
                }

                let x1 = x;
                let y1 = y;
                let z1 = this.elevations[Index(x1, y1, this.WIDTH)];
                let x2 = x + 1;
                let y2 = y;
                let z2 = this.elevations[Index(x2, y2, this.WIDTH)];
                let x3 = x + 1;
                let y3 = y + 1;
                let z3 = this.elevations[Index(x3, y3, this.WIDTH)];
                let x4 = x;
                let y4 = y + 1;
                let z4 = this.elevations[Index(x4, y4, this.WIDTH)];

                let cx = x1;
                let cy = y1;
                let elev =this.elevations[Index(cx, cy, this.WIDTH)];
                let r, g, b, i;

                if (elev > this.snowLevel) {
                    i = 1;
                } else if (elev > this.grassLevel) {
                    i = 0;
                } else if (elev > this.waterHeight) {
                    i = 2;
                } else {
                    i = 2;
                }

                // for smooth shading
                let e = .1;

                let [nx1, ny1, nz1] = crossProduct(x1, y1, this.elevations[Index(x1, y1, this.WIDTH)],
                    x1 + e, y1, elevation(x1+e, y1),
                    x1 + e, y1 + e, elevation(x1+e, y1+e));
                let [nx2, ny2, nz2] = crossProduct(x2, y2, this.elevations[Index(x2, y2, this.WIDTH)],
                    x2 + e, y2, elevation(x2+e, y2),
                    x2 + e, y2 + e, elevation(x2+e, y2+e));
                let [nx3, ny3, nz3] = crossProduct(x3, y3, this.elevations[Index(x3, y3, this.WIDTH)],
                    x3 + e, y3, elevation(x3+e, y3),
                    x3 + e, y3 + e, elevation(x3+e, y3+e));
                let [nx4, ny4, nz4] = crossProduct(x4, y4,this.elevations[Index(x4, y4, this.WIDTH)],
                    x4 + e, y4, elevation(x4+e, y4),
                    x4 + e, y4 + e, elevation(x4+e, y4+e));

                storeQuad(vertices, x1, y1, z1, nx1, ny1, nz1, u1, v1,
                    x2, y2, z2, nx2, ny2, nz2, u2, v2,
                    x3, y3, z3, nx3, ny3, nz3, u3, v3,
                    x4, y4, z4, nx4, ny4, nz4, u4, v4,
                    r, g, b, 1, i);

                // Draw Trees
                let treeChance = this.treeChances[Index(x, y, this.WIDTH)];
                elev = elevation(x1, y1);
                if (treeChance >= 0.75 && elev > this.waterHeight + 1 && elev < this.snowLevel)
                {
                    this.generateTree(x1, y1, vertices);
                }


                // Draw Water
                z1 = this.waterHeight, z2 = this.waterHeight, z3 = this.waterHeight, z4 = this.waterHeight;
                e = 0.1;
                [nx1, ny1, nz1] = crossProduct(x1, y1, this.waterHeight,
                    x1 + e, y1, this.waterHeight,
                    x1 + e, y1 + e, this.waterHeight);
                [nx2, ny2, nz2] = crossProduct(x2, y2, this.waterHeight,
                    x2 + e, y2, this.waterHeight,
                    x2 + e, y2 + e, this.waterHeight);
                [nx3, ny3, nz3] = crossProduct(x3, y3, this.waterHeight,
                    x3 + e, y3, this.waterHeight,
                    x3 + e, y3 + e, this.waterHeight);
                [nx4, ny4, nz4] = crossProduct(x4, y4,this.waterHeight,
                    x4 + e, y4, this.waterHeight,
                    x4 + e, y4 + e, this.waterHeight);
        
                storeQuad(vertices, x1, y1, z1, nx1, ny1, nz1, u1, v1,
                    x2, y2, z2, nx2, ny2, nz2, u2, v2,
                    x3, y3, z3, nx3, ny3, nz3, u3, v3, 
                    x4, y4, z4, nx4, ny4, nz4, u4, v4, 
                    0, 0, 0, 1, 3
                );
            }
        }

        drawColorNormalVertices(gl, shaderProgram, vertices, gl.TRIANGLES);

    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(color1, color2, t) {
    return [
        lerp(color1[0], color2[0], t),
        lerp(color1[1], color2[1], t),
        lerp(color1[2], color2[2], t)
    ];
}

export {Terrain};