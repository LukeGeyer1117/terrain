precision mediump float;
varying vec2 fragUV;
varying float fragIndex;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec4 uDefaultColor;
void main() {
    if(fragIndex < -.5) // -1
    {
        gl_FragColor = uDefaultColor;
    } else if(fragIndex < .5) // 0
    {
        gl_FragColor = texture2D(uTexture0, fragUV);
    } else if(fragIndex < 1.5) // 1
    {
        gl_FragColor = texture2D(uTexture1, fragUV);
    } else if(fragIndex < 2.5) // 2
    {
        gl_FragColor = texture2D(uTexture2, fragUV);
    }

}
