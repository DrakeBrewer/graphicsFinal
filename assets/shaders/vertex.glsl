#version 300 es
// Several articles from this site were incredibly helpful here
// https://webglfundamentals.org/webgl/lessons/
precision mediump float;

const int MAX_LIGHTS = 16;

struct PointLight {
	vec3 position;
	vec3 color;
};

struct AmbientLight {
	vec3 direction;
	vec3 color;
};

struct Material {
	float ambient;
	float diffuse;
	float specular;
	float shininess;
};

uniform PointLight uPointLights[MAX_LIGHTS];
uniform int uNumPointLights;

in vec4 coordinates;
in vec4 color;
in vec3 normal;
in vec2 uv;

out vec4 v_color;
out vec2 v_uv;
out vec4 vColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform Material material;

uniform AmbientLight sun;
uniform vec3 cam_pos;

vec3 diff_color(vec3 normal_vec, vec3 direction, vec3 color, float mat_diffuse) {
	return mat_diffuse * color * max(dot(normal_vec, direction), 0.0);
}

vec3 spec_color(
	vec3 normal_vec,
	vec3 light_direction,
	vec3 light_color,
	vec3 view_direction,
	float mat_shininess,
	float mat_specular
) {
	vec3 r = 2.0 * dot(light_direction, normal_vec) * normal_vec - light_direction;
	float spec = pow(max(dot(normalize(r), view_direction), 0.0), mat_shininess);
	return mat_specular * spec * light_color;
}

void main() {
	vec3 coords_tx = (model * coordinates).xyz;
	vec3 normal_tx = normalize(mat3(model) * normal);

	vec3 view_dir = normalize(cam_pos - coords_tx);

	vec3 sun_ambient = vec3(material.ambient);
	vec3 sun_diffuse = diff_color(normal_tx, sun.direction, sun.color, material.diffuse);
	vec3 sun_specular = spec_color(normal_tx, sun.direction, sun.color, view_dir, material.shininess, material.specular);

	vec3 final_color = sun_ambient + sun_diffuse + sun_specular;
	for (int i = 0; i < MAX_LIGHTS; i++) {
		if (i >= uNumPointLights) {
			break;
		}

		vec3 point_dir = normalize(uPointLights[i].position - coords_tx);

		// https://webgl.brown37.net/10_lights/07_lights_attenuation.html
		float distance = length(uPointLights[i].position - coords_tx);
		float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.042 * pow(distance, 2.0));

		vec3 point_diffuse = diff_color(normal_tx, point_dir, uPointLights[i].color, material.diffuse) * attenuation;
		vec3 point_specular = spec_color(
			normal_tx, point_dir,
			uPointLights[i].color, view_dir,
			material.shininess, material.specular
		) * attenuation;

		final_color += point_diffuse + point_specular;
	}

	vColor = vec4(final_color, 1.0) * color;

	gl_Position = projection * view * model * coordinates;
	v_uv = uv;
}
