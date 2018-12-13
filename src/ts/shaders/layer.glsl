uniform sampler2D texture01;
uniform sampler2D texture02;
varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 direction;
uniform float radius;
void main() {

    vec4 colorA = texture2D(texture01, vUv);
    vec4 colorB = texture2D(texture02,vUv);
    float a = colorB.x + colorB.y + colorB.z;
    vec4 result = mix(colorA,colorB,colorB.a);
    gl_FragColor = result;
}
