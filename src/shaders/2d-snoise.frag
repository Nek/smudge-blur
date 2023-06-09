#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform vec2 scale;

#include lygia/generative/snoise.glsl
#include uvScale.glsl

void main() {
    vec2 st = gl_FragCoord.xy/resolution.xy;
    st.x *= resolution.x/resolution.y;

    vec3 color = vec3(0.0);

    // Scale the space in order to see the function
    // st *= 1.;

    color = snoise3(vec3(uvScale(st, scale), .1));
    color *= 0.5;
    color += .5;

    gl_FragColor = vec4(color,1.0);
}
