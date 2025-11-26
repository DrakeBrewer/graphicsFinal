#version 300 es
precision mediump float;

in vec4 coordinates;
in vec4 color;
in vec2 uv;

out vec4 v_color;
out vec2 v_uv;

uniform mat4 modelview;

out vec4 vColor;

void main() {
    gl_Position = modelview * coordinates;
    vColor = color;
    v_uv = uv;
}
