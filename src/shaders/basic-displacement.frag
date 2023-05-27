#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;
uniform vec2 texOffset;// [-0.25, -0.25]
varying vec2 uv;

uniform sampler2D map;
uniform float amp;// = 0.01;
uniform float scale;// = 0.001;

#define TWO_PI = 6.28318531;

float rgbToGray(vec4 rgba) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgba.xyz, W);
}

#include uvScale.glsl;

void main() {
  vec2 p = uv.xy;
  p = uvScale(p, scale);
  vec4 colorOrig = texture2D(texture, p);
  vec4 displacement = texture2D(map, p);
  vec2 displace = p + (vec2(displacement.r, displacement.b) + texOffset) * amp;
  vec4 colorDisplaced = texture2D(texture, displace);
  gl_FragColor = mix(colorOrig, colorDisplaced, 0.25);
}