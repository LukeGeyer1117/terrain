import { initShaderProgram } from "./shader.js";
import { storeQuad, drawUVVertices } from "./shapes2d.js";

"use strict";

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
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things

	//
	// Create shaders
	// 
	const shaderProgram = initShaderProgram(gl, await (await fetch("uvTriangles.vs")).text(), await (await fetch("uvTriangles.fs")).text());

	const textureFileNames = ["wall-4-granite-TEX.jpg", "wall-9-brick-TEX.jpg", "sandra512.jpg"];

	// Load a texture and move it to the gpu
	let textureImageUnit = 0; // which texture slot to use, 0 through 31
	for (textureImageUnit = 0; textureImageUnit < textureFileNames.length; textureImageUnit++) {
		loadTexture(gl, shaderProgram, textureFileNames[textureImageUnit], textureImageUnit);
	}

	gl.activeTexture(gl.TEXTURE0 + textureImageUnit); // Why do we need this? I don't know, but it doesn't pick textures right without it.

	//
	// Create content to display
	//

	const defaultColorUniformLocation = gl.getUniformLocation(shaderProgram, "uDefaultColor");
	const defaultColor = [1, 0, 1, 1];
	gl.uniform4fv(
		defaultColorUniformLocation,
		defaultColor
	);


	let physicalToCSSPixelsRatio = window.devicePixelRatio; // Do this for no pixelation. Comment out for better speed.
	canvas.width = canvas.clientWidth * physicalToCSSPixelsRatio;
	canvas.height = canvas.clientHeight * physicalToCSSPixelsRatio;
	gl.viewport(0, 0, canvas.width, canvas.height);



	//
	// Setup projection matrix
	//
	setObservationView(gl, shaderProgram, canvas.clientWidth / canvas.clientHeight)


	//
	// Main render loop
	//
	let previousTime = 0;
	requestAnimationFrame(redraw);
	function redraw(currentTime) {
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if (DT > .5)
			DT = .5;
		previousTime = currentTime;

		//
		// Draw
		//
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


		// Load an identity modelview matrix onto the shader for the three textured tiles:
		const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
		const identityMatrix = mat4.create();
		gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);

		// Draw the three textured tiles
		const vertices = [];
		let H = 1;
		let u1 = 0; let v1 = H;
		let u2 = H; let v2 = H;
		let u3 = H; let v3 = 0;
		let u4 = 0; let v4 = 0;

		let i = 0; // index as to which texture map to use
		storeQuad(vertices,
			-11, 0, 0, u1, v1, i,
			-1, 0, 0, u2, v2, i,
			-1, 10, 0, u3, v3, i,
			-11, 10, 0, u4, v4, i);

		i = -1; // setting i = -1 uses the defaultColor instead of a texture map.
		storeQuad(vertices,
			0, 0, 0, u1, v1, i,
			10, 0, 0, u2, v2, i,
			10, 10, 0, u3, v3, i,
			0, 10, 0, u4, v4, i);

		i = 2;
		storeQuad(vertices,
			11, 0, 0, u1, v1, i,
			21, 0, 0, u2, v2, i,
			21, 10, 0, u3, v3, i,
			11, 10, 0, u4, v4, i);

		// draw all the stored up quads, each having stored its texture number in i.
		drawUVVertices(gl, shaderProgram, vertices, gl.TRIANGLES);

		requestAnimationFrame(redraw);
	}
};


function setObservationView(gl, shaderProgram, canvasAspect) {
	const projectionMatrix = mat4.create();
	const fov = 90 * Math.PI / 180;
	const near = 1;
	const far = 1000;
	mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

	const WIDTH = 10;
	const HEIGHT = 10;

	const lookAtMatrix = mat4.create();
	mat4.lookAt(lookAtMatrix, [WIDTH / 2, -HEIGHT / 10, HEIGHT], [WIDTH / 2, HEIGHT / 2, 0], [0, 0, 1]);
	mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}


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
