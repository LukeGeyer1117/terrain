precision mediump float;
varying vec2 fragUV;
varying float fragIndex;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;
uniform sampler2D uTexture4;
uniform vec4 uDefaultColor;
varying vec4 fragColor;
varying vec3 fragNormal;
varying vec4 fragPosition;

vec4 texColor;

uniform vec3 uEyePosition;
uniform vec3 uLightDirection;

void main() {
    // Assign textures to things.
    if(fragIndex < -.5)
    {
      texColor = uDefaultColor;
    } else if(fragIndex < .5)
    {
      texColor = texture2D(uTexture0, fragUV);
    } else if (fragIndex < 1.5)
    {
      texColor = texture2D(uTexture1, fragUV);
    } else if (fragIndex < 2.5)
    {
      texColor = texture2D(uTexture2, fragUV);
    } else if(fragIndex < 3.5)
    {
      texColor = texture2D(uTexture3, fragUV);
    }

    vec3 materialColor = texColor.rgb;
    vec3 finalColor = vec3(0,0,0);

    // Add ambient:
    float ambient = 0.1;
    finalColor += materialColor * ambient;

    // Add diffuse:
    vec3 normalizedNormalVector = normalize(fragNormal);
    vec3 lightDirection = normalize(uLightDirection);
    vec3 toLight = lightDirection*-1.0;
    float d = dot(normalizedNormalVector, toLight) * (1.0 - ambient);
    if(d>0.0){
      finalColor += materialColor * d;

        // Add specular:
      vec3 toEye = uEyePosition - fragPosition.xyz;
      toEye = normalize(toEye);
      
      vec3 lightDirectionReflected = reflect(lightDirection, normalizedNormalVector);
      float d2 =dot(toEye, lightDirectionReflected);
      if(d2>0.0){
        float shininess = 50.0;
        d2 = pow(d2, shininess);
        vec3 specularColor = vec3(.5,.5,.5);
        finalColor += specularColor*d2;
      }
    }
    
    if(finalColor[0] > 1.0)
        finalColor[0] = 1.0;
    if(finalColor[1] > 1.0)
        finalColor[1] = 1.0;
    if(finalColor[2] > 1.0)
        finalColor[2] = 1.0;

    gl_FragColor = vec4(finalColor, texColor.a);
}
