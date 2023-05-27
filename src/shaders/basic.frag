#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;
varying vec2 uv;

void main() {
	vec2 p = uv.xy;
	gl_FragColor = texture2D(texture, p);
}