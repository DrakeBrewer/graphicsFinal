#version 300 es
precision mediump float;

in vec3 v_dir;

uniform samplerCube u_skybox;

out vec4 outColor;

void main(){
    outColor = texture(u_skybox,normalize(v_dir));
}