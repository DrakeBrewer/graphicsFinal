import type Node from "./sceneGraph";
import type { Color, Position } from "./types";
import type Mat4 from "./utils/matrix";
import { set_uniform3fv } from "./utils/webGl";

type LightColor = Omit<Color, 'a'>;
class Light {
	position: Position;
	color: LightColor;

	constructor(position: Position, color: LightColor) {
		this.position = position;
		this.color = color;
	}
}

export class PointLight extends Light {
	bind(gl: WebGLRenderingContext, program: WebGLProgram) {
		set_uniform3fv(gl, program, `light.position`, Object.values(this.position));
		set_uniform3fv(gl, program, `light.color`, Object.values(this.color));
	}
}

export class AmbientLight extends Light {
	bind(gl: WebGLRenderingContext, program: WebGLProgram) {
		set_uniform3fv(gl, program, `ambient_light.position`, Object.values(this.position));
		set_uniform3fv(gl, program, `ambient_light.color`, Object.values(this.color));
	}
}

export class LightCollection {
	point_lights: PointLight[];
	ambient_light: AmbientLight | null;
	max_lights = 16;

	constructor() {
		this.point_lights = [];
		this.ambient_light = null;
	}

	set_ambient(light: AmbientLight) {
		this.ambient_light = light;
	}

	collect(node: Node, parent_matrix: Mat4) {
		this.point_lights = [];
		this.traverse(node, parent_matrix);
	}

	private traverse(root: Node, parent_matrix: Mat4) {
		const local_matrix = root.matrix();
		const world_matrix = parent_matrix.mul(local_matrix);

		if (root.light) {
			root.light.position = {
				x: world_matrix.data[12]!,
				y: world_matrix.data[13]!,
				z: world_matrix.data[14]!
			};

			this.point_lights.push(root.light);
		}

		for (const child of root.children) {
			this.traverse(child, world_matrix);
		}
	}

	bind_lights(gl: WebGLRenderingContext, program: WebGLProgram) {
		if (this.ambient_light) {
			this.ambient_light.bind(gl, program);
		}

		const num_lights_loc = gl.getUniformLocation(program, "uNumPointLights");
		gl.uniform1i(num_lights_loc, this.point_lights.length);

		for (let i = 0; i < this.point_lights.length; i++) {
			const light = this.point_lights[i];
			if (!light) {
				continue;
			}

			set_uniform3fv(gl, program, `uPointLights[${i}].color`, Object.values(light.color))
			set_uniform3fv(gl, program, `uPointLights[${i}].position`, Object.values(light.position))
		}
	}
}
