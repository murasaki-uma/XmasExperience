vec3 tonemap(vec3 color){
	mat3 m1 = mat3(
		0.59719, 0.07600, 0.02840,
		0.35458, 0.90834, 0.13383,
		0.04823, 0.01566, 0.83777
	);
	mat3 m2 = mat3(
		1.60475, -0.10208, -0.00327,
		-0.53108,  1.10813, -0.07276,
		-0.07367, -0.00605,  1.07602
	);
	vec3 v = m1 * color;
	vec3 a = v * (v + 0.0245786) - 0.000090537;
	vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
	return pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2));
}


vec3 gammacorrect(vec3 c){
    return pow(c, vec3(1.0 / 2.2));
}
uniform float time;
uniform vec2 resolution;
float PI = 3.14159265358979323846264338327950288;
void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;
	position.x = sin((position.x+time)*PI/2.);
	vec3 color = pow(sin(position.x * 4.0 + vec3(0.0, 1.0, 2.0) * 3.1415 * 2.0 / 3.0) * 0.5 + 0.5, vec3(2.0)) * (exp(abs(position.y) * 4.0));

	gl_FragColor = vec4( tonemap(color), 1.0 );

}