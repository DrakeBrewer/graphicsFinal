#version 300 es
precision mediump float;

layout(location = 0) in vec3 a_position;

uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_dir;

void main(){
    v_dir = a_position;

    mat4 view = u_view;
    view[3] = vec4(0.0,0.0,0.0,view[3].w);

    vec4 clip_pos = u_projection*view*vec4(a_position,1.0);

    gl_Position = vec4(clip_pos.xy,clip_pos.w,clip_pos.w);
}