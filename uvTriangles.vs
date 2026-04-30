precision mediump float;

attribute vec3 vertPosition;
attribute vec4 vertColor;
attribute vec2 vertUV;
attribute float vertIndex;
attribute vec3 vertNormal;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
varying vec4 fragColor;
varying vec2 fragUV;
varying float fragIndex;
varying vec3 fragNormal;
varying vec4 fragPosition;

void main() {
    fragUV = vertUV;
    fragIndex = vertIndex;
    fragColor = vertColor;
    fragNormal = normalize(uNormalMatrix * vertNormal);
    fragPosition = uModelViewMatrix * vec4(vertPosition, 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 1.0);
}