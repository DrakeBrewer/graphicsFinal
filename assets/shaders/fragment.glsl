#version 300 es
precision mediump float;

in vec4 vColor;
in vec2 v_uv;

out vec4 color;
uniform sampler2D tex_0;

void main() {
    vec4 tex_color = texture(tex_0, v_uv);
    color = tex_color * vColor;
}
