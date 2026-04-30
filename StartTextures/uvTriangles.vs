precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertUV;
attribute float vertIndex;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 fragUV;
varying float fragIndex;

void main() {
    fragUV = vertUV;
    fragIndex = vertIndex;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 1.0);
}
