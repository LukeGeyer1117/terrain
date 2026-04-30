function crossProduct(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	const ux = x2 - x1;
	const uy = y2 - y1;
	const uz = z2 - z1;
	const vx = x3 - x1;
	const vy = y3 - y1;
	const vz = z3 - z1;
	const nx = uy * vz - uz * vy;
	const ny = -(ux * vz - uz * vx);
	const nz = ux * vy - uy * vx;
	return [nx, ny, nz];
}

function storeQuad(vertices,
	x1, y1, z1, nx1, ny1, nz1, u1, v1,
	x2, y2, z2, nx2, ny2, nz2, u2, v2,
	x3, y3, z3, nx3, ny3, nz3, u3, v3,
	x4, y4, z4, nx4, ny4, nz4, u4, v4,
	r, g, b, a, i) {
	vertices.push(x1, y1, z1, u1, v1, r, g, b, a, i, nx1, ny1, nz1,
		x2, y2, z2, u2, v2, r, g, b, a, i, nx2, ny2, nz2,
		x3, y3, z3, u3, v3, r, g, b, a, i, nx3, ny3, nz3);
	vertices.push(x1, y1, z1, u1, v1, r, g, b, a, i, nx1, ny1, nz1,
		x3, y3, z3, u3, v3, r, g, b, a, i, nx3, ny3, nz3,
		x4, y4, z4, u4, v4, r, g, b, a, i, nx4, ny4, nz4);
}

function storeTriangle(vertices,
	x1, y1, z1, nx1, ny1, nz1,
	x2, y2, z2, nx2, ny2, nz2,
	x3, y3, z3, nx3, ny3, nz3,
	r, g, b, a) {
		vertices.push(x1, y1, z1, rgba, nx1, ny1, nz1,
			x2, y2, z2, r, g, b, a, nx2, ny2, nz2,
			x3, y3, z3, r, g, b, a, nx3, ny3, nz3);
}


// This function gets all the elements out of the passed in array of info.
// Assigns attributes from the data accordingly.
function drawColorNormalVertices(gl, shaderProgram, vertices, style) {
	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Gets the X, Y, Z coordinate from the array.
	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		13 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	// Gets the U, V attribute from the array.
	const uvAttribLocation = gl.getAttribLocation(shaderProgram, "vertUV");
	gl.vertexAttribPointer(
		uvAttribLocation, // Attribute location
		2, 			// Number of elements per attrib
		gl.FLOAT, // Type of element
		gl.FALSE,
		13 * Float32Array.BYTES_PER_ELEMENT, 	// Size of an element
		3 * Float32Array.BYTES_PER_ELEMENT		// Offset from beginning of attribute
	);
	gl.enableVertexAttribArray(uvAttribLocation);

	// Gets the r, g, b, a values from the array.
	const colorAttribLocation = gl.getAttribLocation(shaderProgram, 'vertColor');
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		4, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		13 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Gets the face normal nx, ny, nz from the array
	const normalAttribLocation = gl.getAttribLocation(shaderProgram, 'vertNormal');
	gl.vertexAttribPointer(
		normalAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		13 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		10 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(normalAttribLocation);

	// Gets the vertIndex from the array, used for textures.
	const indexAttribLocation = gl.getAttribLocation(shaderProgram, "vertIndex");
	gl.vertexAttribPointer(
		indexAttribLocation, // Attribute location
		1, 	// Elements per attrib
		gl.FLOAT,	// Element type
		gl.FALSE,
		13 * Float32Array.BYTES_PER_ELEMENT, 	// Size of individual vertex
		9 * Float32Array.BYTES_PER_ELEMENT		// Offset from beginning of a vertex to element
	);
	gl.enableVertexAttribArray(indexAttribLocation);

	gl.drawArrays(style, 0, vertices.length / (3 + 3 + 3));

	return vertexBufferObject;
}


function drawUVVertices(gl, shaderProgram, vertices, style) {

	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const uvAttribLocation = gl.getAttribLocation(shaderProgram, 'vertUV');
	gl.vertexAttribPointer(
		uvAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(uvAttribLocation);

	const indexAttribLocation = gl.getAttribLocation(shaderProgram, 'vertIndex');
	gl.vertexAttribPointer(
		indexAttribLocation, // Attribute location
		1, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(indexAttribLocation);

	gl.drawArrays(style, 0, vertices.length / (3 + 2 + 1));
}

function drawCircle(gl, shaderProgram, x, y, z, radius, color=[0,0,1,1]){
	const sides = 24;
	const vertices = CreateCircleVertices(x,y,z,radius,sides);
	draw3dVertices(gl, shaderProgram, vertices, color, gl.TRIANGLE_FAN);
}

function CreateCircleVertices(x,y,z,radius,sides){
	const vertices = [];
	vertices.push(x);
	vertices.push(y);
	vertices.push(z);
	for(let i=0; i<sides+1; i++){
		const radians = i/sides *2*Math.PI;
		vertices.push(x+radius*Math.cos(radians));
		vertices.push(y+radius*Math.sin(radians));
		vertices.push(z);
	}
	return vertices;
}

function drawTriangle(gl, shaderProgram, vertices, color=[0,1,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLES);
}

// To be used when the 2d shader is the active shader program.
function drawVertices(gl, shaderProgram, vertices, color, style){
    const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, "vertPosition");
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	gl.uniform4fv(colorUniformLocation, color);
    gl.drawArrays(style, 0, vertices.length/2);
}

function draw3dVertices(gl, shaderProgram, vertices, color, style){
	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attrib Location
		3, // Elements per attribute
		gl.FLOAT, // type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of a vertex
		0 // Offset from beggining of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	gl.uniform4fv(colorUniformLocation, color);

	gl.drawArrays(style, 0, vertices.length/3);
}

export {
	storeQuad, storeTriangle, drawUVVertices, drawCircle, drawTriangle, crossProduct, drawColorNormalVertices
};