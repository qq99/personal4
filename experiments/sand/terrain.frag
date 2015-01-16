#ifdef GL_ES
precision highp float;
#endif

varying vec3 N;
varying vec3 v;


varying vec2 vTextureCoord;

uniform sampler2D uperm_sampler;
uniform sampler2D igrad_sampler;
uniform float time;
uniform float mouseX;

void main(void) {
    vec3 normal = N;
    vec3 test_light = vec3(mouseX * -300.0, mouseX *200.0, mouseX *100.0);
    vec4 sand = vec4(0.8789, 0.6602, 0.3712, 1.0);
    vec4 md = vec4(0.3, 0.8, 0.5, 1.0);
    vec4 ambient = vec4(0.1, 0.1, 0.1, 1.0);
    vec3 L = normalize(test_light - v);
    vec4 Idiff = sand * max(dot(normal,L), 0.0);
    Idiff = clamp(Idiff, 0.0, 1.0); 
    gl_FragColor = Idiff + ambient;
}