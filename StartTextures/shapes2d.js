

function storeQuad(vertices, x1, y1, z1, u1,v1, i1, x2, y2, z2, u2,v2,i2, x3, y3, z3, u3,v3,i3, x4, y4, z4, u4,v4, i4) {
	vertices.push(x1, y1, z1, u1,v1,i1, x2, y2, z2, u2,v2,i2, x3, y3, z3, u3,v3,i3);
	vertices.push(x1, y1, z1, u1,v1,i1, x3, y3, z3, u3,v3,i3, x4, y4, z4, u4,v4,i4);
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



export {
	storeQuad, drawUVVertices
};