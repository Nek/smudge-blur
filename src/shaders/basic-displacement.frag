#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D feedbackTexture;
uniform sampler2D startingImageTexture;
uniform sampler2D displacementMap;

varying vec2 uv;

uniform float scale;// = 0.001;
uniform vec2 zoom;//1.01

#define TWO_PI = 6.28318531;

vec2 toCartesian(vec4 displacementMap) {
  float angle = displacementMap.x * 6.28318531;
  float distance = (1. - (displacementMap.y * .09 + .01)) * scale;
	float x = distance * cos(angle);
  float y = distance * sin(angle);
	return vec2(x, y);
}

#include uvScale.glsl

void main() {
  vec2 p = uv.xy;
  p = uvScale(p, zoom);
  vec4 colorOrig = texture2D(startingImageTexture, p);
  // vec4 displacement = (texture2D(displacementMap, p) + vec4(texOffset, 0.0, 0.0)) * vec4(amp, 1.0, 1.0);
  vec2 displace =  p + toCartesian(texture2D(displacementMap, uv.xy));//p + displacement.rg;
  vec4 colorDisplaced = texture2D(feedbackTexture, displace);
  gl_FragColor = mix(colorOrig, colorDisplaced, .98);//texture2D(displacementMap, p);;
}