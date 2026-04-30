import { initShaderProgram } from "./shader.js";
import { Maze } from "./maze.js";
import { Mouse } from "./mouse.js";
import { storeQuad, drawUVVertices } from "./shapes2d.js";
import { Terrain } from "./terrain.js";

"use strict";

let viewType = "TopView";
let zoom_factor = .3;
let z_target = 0.35;
let render_distance = 50;
let map_size = 1000;
let wave_intensity = 0.15;
let light_x = 0, light_y = 0, light_z = -100;
let water_quality = 1;

let instructionBox = document.querySelector("#instruction-box");
let wave_direction = 0;
main();
async function main() {
	console.log('This is working');

	//
	// start gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LESS);

	//
	// Create shaders
	// 
	const shaderProgram = initShaderProgram(gl, await (await fetch("uvTriangles.vs")).text(), await (await fetch("uvTriangles.fs")).text());

	const textureFileNames = ["textures/grass01.png", "textures/snow.png", "textures/sand.jpg", "textures/water.jpg"];

	// Load a texture and move it to the gpu
	let textureImageUnit = 0; // which texture slot to use, 0 through 31
	for (textureImageUnit = 0; textureImageUnit < textureFileNames.length; textureImageUnit++) {
		loadTexture(gl, shaderProgram, textureFileNames[textureImageUnit], textureImageUnit);
	}

	gl.activeTexture(gl.TEXTURE0 + textureImageUnit); // Why do we need this? I don't know, but it doesn't pick textures right without it.

	//
	// Create content to display
	//


	// Create a maze

	let w = map_size;
	let h = w;
	let e = .01;
	// let maze = new Maze(w, h);

	// let elevations = new Map();

	// for (let i = 0; i < h; i++) {
	// 	for (let j = 0; j < w; j++) {
	// 		elevations.set(`${j},${i}`, elevation(j, i));
	// 	}
	// }
	// let shaderElevations = new Map();
	// for (let i = 0; i < h; i++) {
	// 	for (let j = 0; j < w; j++) {
	// 		shaderElevations.set(`${j+e},${i}`, elevation(j+e, i));
	// 		shaderElevations.set(`${j+e},${i+e}`, elevation(j+e, i+e));
	// 	}
	// }

	let elevations = new Float32Array(w * h);
	let shaderElevations = new Float32Array((w+1) * (h+1));

	// Fill elevations
	for (let i = 0; i < h; i++) {
		for (let j = 0; j < w; j++) {
			elevations[Index(j, i, w)] = elevation(j, i);
		}
	}
	// Fill shaderElevations
	for (let i = 0; i < h; i++) {
		for (let j = 0; j < w; j++) {
			shaderElevations[shaderIndex(j, i, w)] = elevation(j-0.9, i-0.9);

		}
	}

	
	let terrain = new Terrain(w, h, elevations, shaderElevations);

	// Create a mouse
	let m = new Mouse(w / 2, h / 2, terrain, elevations);


	const defaultColorUniformLocation = gl.getUniformLocation(shaderProgram, "uDefaultColor");
	const defaultColor = [27/255, 97/255, 105/255, 1]; // RGBA for sea green
	gl.uniform4fv(
		defaultColorUniformLocation,
		defaultColor
	);


	let physicalToCSSPixelsRatio = window.devicePixelRatio; // Do this for no pixelation. Comment out for better speed.
	canvas.width = canvas.clientWidth * physicalToCSSPixelsRatio;
	canvas.height = canvas.clientHeight * physicalToCSSPixelsRatio;
	gl.viewport(0, 0, canvas.width, canvas.height);

	//
	// Register Listeners
	//
	// These are the booleans that let the mouse know what movements to do.
	let spinLeft = false, spinRight = false;
	let goForward = false, goBackward = false;
	let strafeLeft = false, strafeRight = false;
	let lookUp = false, lookDown = false;

	document.addEventListener("keydown", (event) => {
		if (event.key === "q") {
			spinLeft = true;
		} else if (event.key === "e") {
			spinRight = true;
		} else if (event.key === "a") {
			strafeLeft = true;
		} else if (event.key === "d") {
			strafeRight = true;
		} else if (event.key === "w") {
			goForward = true;
		} else if (event.key === "s") {
			goBackward = true;
		} else if (event.key === "ArrowUp") {
			console.log("lookup");
			console.log(z_target);
			lookUp = true;
		} else if (event.key === "ArrowDown") {
			console.log("lookdown");
			console.log(z_target);
			lookDown = true;
		}
		else if (event.key == "o") {
			viewType = "ObservationView";
			setObservationView(gl, shaderProgram, terrain, w, h, zoom_factor, m, canvas.width / canvas.height);
		} 
		else if (event.key == "t") {
			viewType = "TopView";
			setTopView(gl, shaderProgram, terrain, w, h, zoom_factor, m, canvas.width / canvas.height);
		}
		else if (event.key == "r") {
			viewType = "RatsView";
			setRatsView(gl, shaderProgram, terrain, w, h, z_target, canvas.width / canvas.height, m);
		}
	})

	document.addEventListener("keyup", (event) => {
		if (event.key === "q") {
			spinLeft = false;
		} else if (event.key === "e") {
			spinRight = false;
		} else if (event.key === "a") {
			strafeLeft = false;
		} else if (event.key === "d") {
			strafeRight = false;
		} else if (event.key === "w") {
			goForward = false;
		} else if (event.key === "s") {
			goBackward = false;
		} else if (event.key === "ArrowUp") {
			lookUp = false;
		} else if (event.key === "ArrowDown") {
			lookDown = false;
		}
	})

	document.addEventListener("keypress", (event) => {
		if (event.key === "p") {
			m.spit();
		} else if (event.key === "+" || event.key === "=") {
			if (viewType == "TopView" || viewType == "ObservationView") {
				// code to zoom in in top view
				zoom_factor *= 0.9;
			}
		} else if (event.key === "-") {
			if (viewType == "TopView" || viewType == "ObservationView") {
				// code to zoom out in top view
				zoom_factor *= 1.1;

			}
		} else if (event.key === " ") {
			if (instructionBox.style.display == "block") {
				instructionBox.style.display = "none";
			}
			else {
				instructionBox.style.display = "block";
			}
		} else if (event.key === "n") {
			render_distance -= 1;
		} else if (event.key === "m") {
			render_distance += 1;
		} else if (event.key === "u") {
			light_x -= 10;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === "i") {
			light_x += 10;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === "z") {
			light_y -= 10;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === "x") {
			light_y += 10;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === "<") {
			light_z -= 1;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === ">") {
			light_z += 1;
			setLightDirection(light_x, light_y, light_z);
		} else if (event.key === "g") {
			wave_intensity -= 0.1;
		} else if (event.key === "h") {
			wave_intensity += 0.1;
		} else if (event.key === "v") {
			if (water_quality == 0) {
				water_quality = 1;
			} else if (water_quality == 1) {
				water_quality = 0;
			}
			console.log(water_quality);
		}
	})

	//
	// load a modelview matrix onto the shader
	// 
	const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	const identityMatrix = mat4.create();
	gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);


	//
	// Other shader variables:
	// 
	function setLightDirection(x, y, z) {
		gl.uniform3fv(
			gl.getUniformLocation(shaderProgram, "uLightDirection"),
			[x, y, z]
		);
	}
	setLightDirection(light_x, light_y, light_z);

	let observationEye = [0, -2, 1];
	setEye(gl, shaderProgram, observationEye[0], observationEye[1], observationEye[2]);


	const normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, identityMatrix);
	gl.uniformMatrix3fv(
		gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
		false,
		normalMatrix
	);

	//
	// Setup projection matrix
	//
	setObservationView(gl, shaderProgram, terrain, w, h, zoom_factor, m, canvas.clientWidth / canvas.clientHeight)


	//
	// Main render loop
	//
	let previousTime = 0;
	let waterTime = Math.PI/2;
	let waterFactor = 0.99;
	console.log("drawing first frame.");
	let iter = 0;
	requestAnimationFrame(redraw);
	function redraw(currentTime) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if (DT > .5)
			DT = .5;

		previousTime = currentTime;

		if (viewType == "TopView") {
			setTopView(gl, shaderProgram, terrain, w, h, zoom_factor, m, canvas.width / canvas.height);
		} else if (viewType == "ObservationView") {
			setObservationView(gl, shaderProgram, terrain, w, h, zoom_factor, m, canvas.width / canvas.height);
		} else if (viewType == "RatsView") {
			setRatsView(gl, shaderProgram, terrain, w, h, z_target, canvas.width / canvas.height, m);
		}

		// check if controls are active, call the functions to move.
		if (spinLeft) { m.rotate(3, DT); }
		if (spinRight) { m.rotate(-3, DT); }
		if (goForward) { m.scurry(4, DT); }
		if (goBackward) { m.backup(2, DT); }
		if (strafeLeft) { m.strafe(2, DT); }
		if (strafeRight) { m.strafe(-2, DT); }
		if (lookUp) {z_target += .05;}
		if (lookDown) {z_target -= .05;}

		//
		// Draw
		//
		// maze.isLegalPositionMouse(m);


		// Load an identity modelview matrix onto the shader for the three textured tiles:
		const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
		const identityMatrix = mat4.create();
		gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);

		// Update the water Height
		if (waterTime <= Math.PI / 10) {
			waterFactor = 1.008;
		} else if (waterTime >= Math.PI / 2) {
			waterFactor = 0.992;
		}
		waterTime *= waterFactor;
		terrain.waterHeight = Math.sin(waterTime);

		// Change the wave intensity to give a "wave" effect
		if (wave_direction == 0) {
			wave_intensity *= 1.01;
			if (wave_intensity > .4) {
				wave_direction = 1;
			}
		} else if (wave_direction == 1) {
			wave_intensity *= 0.99;
			if (wave_intensity < .15) {
				wave_direction = 0;
			}
		}
		// console.log(terrain.waterHeight);

		m.draw(gl, shaderProgram);
		terrain.draw(gl, shaderProgram, currentTime, m, render_distance, map_size, wave_intensity, water_quality);
		requestAnimationFrame(redraw);
	}
};


// Make a textureObject on the video card, and return a javascript reference to it.
// Since it might take a while to load and we never want to block, first use the 1 by 1 texture with the color "tempColor"
// Using a callback, it will switch to the texture of objTextureFileName when it is done loading.
// NOTE: Try to make "tempColor" roughly approximate what your object will actually look like when it gets its real texture loaded.
// For every texture you make, pass in a unique textureImageUnit between 0 and 31
function loadTexture(gl, shaderProgram, objTextureFileName, textureImageUnit, tempColor = [0, 0, 1, 1]) {
	gl.activeTexture(gl.TEXTURE0 + textureImageUnit); // Specify which of our 32 texture slots we are talking to
	const textureObject = gl.createTexture(); // make a new texture object
	gl.bindTexture(gl.TEXTURE_2D, textureObject);   // Every textureImageUnit has 2 targets, gl.TEXTURE_2D and a 3D one.
	// The above line tells GL that the currently used slot (textureImageUnit) at the specified target (2D) is assigned to the given textureObject.
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uTexture" + textureImageUnit.toString()), textureImageUnit);

	// Fill our textureObject with a 1x1 pixel of color tempColor, while waiting for the real image data to load
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(tempColor));

	const image = new Image(); // make an empty javascript image.
	image.src = objTextureFileName;
	image.onload = function () { // this callback will get called when the command "image.src = " below has finished loading
		gl.bindTexture(gl.TEXTURE_2D, textureObject); // remember I'm talking to YOU, Mr. textureObject! (since the current texture may have got changed in the elapsed time.)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // fill the reserved textureObject slot with the real image.

		// Check if the image is a power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D); // This makes texture mapping look better.  Texture images should be powers of 2 in size.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		} else {
			// No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // gl.CLAMP_TO_EDGE, gl.REPEAT, or gl.MIRRORED_REPEAT
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // gl.LINEAR or gl.NEAREST or gl.LINEAR_MIPMAP_LINEAR
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // gl.LINEAR or gl.NEAREST
		}
	};

	return textureObject; // the calling code probably doesn't need this return value because everything is already set up.
}

function isPowerOf2(value) {
	return (value & (value - 1)) === 0;
}

function polarToCartesian(polar, alpha) {
	// alpha is the horizontal angle from the positive X axis
	// polar is the vertical angle from the positive Z axis
	const x = Math.sin(polar) * Math.cos(alpha);
	const y = Math.sin(polar) * Math.sin(alpha);
	const z = Math.cos(polar);
	return [x, y, z];
}

function drawSphere(gl, shaderProgram) {
	const vertices = [];
	const strips = 50;
	for (let i = 0; i < strips; i++) {
		const polar1 = (i / strips) * Math.PI; // 0 to PI (as z goes +1 to -1)
		const polar2 = ((i + 1) / strips) * Math.PI;
		for (let j = 0; j < strips; j++) {
			const alpha1 = j / strips * Math.PI * 2;
			const alpha2 = (j + 1) / strips * Math.PI * 2;
			const [x1, y1, z1] = polarToCartesian(polar1, alpha1);
			const [x2, y2, z2] = polarToCartesian(polar2, alpha1);
			const [x3, y3, z3] = polarToCartesian(polar2, alpha2);
			const [x4, y4, z4] = polarToCartesian(polar1, alpha2);
			let r = Math.sin(i * 3712 + j * 34857 + 1) * .5 + .5;
			let g = Math.sin(i * 9321 + j * 27543 + 2) * .5 + .5;
			let b = Math.sin(i * 1268 + j * 12771 + 7) * .5 + .5;
			r = .8;
			g = .1;
			b = .9;


			let [nx, ny, nz] = crossProduct(x1, y1, z1, x2, y2, z2, x3, y3, z3);
			if (j == strips - 1) {
				[nx, ny, nz] = crossProduct(x1, y1, z1, x2, y2, z2, x4, y4, z4);
			}
			storeQuad(vertices, x1, y1, z1, nx, ny, nz,
				x2, y2, z2, nx, ny, nz,
				x3, y3, z3, nx, ny, nz,
				x4, y4, z4, nx, ny, nz,
				r, g, b);


			/*
			const nx1 = x1;
			const ny1 = y1;
			const nz1 = z1;			
			const nx2 = x2;
			const ny2 = y2;
			const nz2 = z2;
			const nx3 = x3;
			const ny3 = y3;
			const nz3 = z3;
			const nx4 = x4;
			const ny4 = y4;
			const nz4 = z4;	
			storeQuad(vertices, x1, y1, z1, nx1, ny1, nz1,
								x2, y2, z2, nx2, ny2, nz2,
								x3, y3, z3, nx3, ny3, nz3,
								x4, y4, z4, nx4, ny4, nz4,
								r, g, b);	
								*/
		}
	}
	drawColorNormalVertices(gl, shaderProgram, vertices, gl.TRIANGLES);
}

function setEye(gl, shaderProgram, x, y, z) {
	gl.uniform3fv(
		gl.getUniformLocation(shaderProgram, "uEyePosition"),
		[x, y, z]
	);
}

function setTopView(gl, shaderProgram, terrain, WIDTH, HEIGHT, zoom_factor, mouse, canvasAspect) {
	// terrain.viewType = "TopView";
	const projectionMatrix = mat4.create();
	const fov = 90 * Math.PI / 180;
	const near = .1;
	const far = (WIDTH + HEIGHT) * 2;
	mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

	const lookAtMatrix = mat4.create();
	mat4.lookAt(lookAtMatrix, [mouse.x, mouse.y, zoom_factor * HEIGHT / 4], [mouse.x, mouse.y, 1], [0,1,0]);
	mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

function setRatsView(gl, shaderProgram, terrain, WIDTH, HEIGHT, z_target, canvasAspect, mouse) {
    // terrain.viewType = "RatsView";
    
    const projectionMatrix = mat4.create();
    const fov = 120 * Math.PI / 180;

    const near = 0.01;
    const far = (render_distance * 2.5);
    mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

	z_target += mouse.z;

	if (z_target <= terrain.waterHeight) {
		z_target = terrain.waterHeight + 0.2;
	}

    // Calculate forward direction using mouse.radians
    const lookAtMatrix = mat4.create();
    const eye = [mouse.x + Math.cos(mouse.radians) * 0.4, mouse.y + Math.sin(mouse.radians) * 0.4, mouse.z + 0.5]; // Camera position
    const target = [
        mouse.x + Math.cos(mouse.radians), // Looking forward in the X direction
        mouse.y + Math.sin(mouse.radians), // Looking forward in the Y direction
    	z_target  // Keeping Z level fixed
    ];
    const up = [0, 0, 1]; // Keep camera upright

    mat4.lookAt(lookAtMatrix, eye, target, up);
    mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

    const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

function setObservationView(gl, shaderProgram, terrain, WIDTH, HEIGHT, zoom_factor, mouse, canvasAspect) {
	// terrain.viewType = "ObservationView";
	const projectionMatrix = mat4.create();
	const fov = 90 * Math.PI / 180;
	const near = .1;
	const far = (WIDTH + HEIGHT);
	mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

	const lookAtMatrix = mat4.create();
	mat4.lookAt(lookAtMatrix, [mouse.x, mouse.y - HEIGHT / 20 * zoom_factor, zoom_factor * HEIGHT / 4], [mouse.x, mouse.y, 1], [0,0.5,1]);
	mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}


function Index(x, y, w) {
	return y * w + x;
}

function shaderIndex(x, y, w) {
	return y * (w+1) + x;
}


export {Index, shaderIndex};