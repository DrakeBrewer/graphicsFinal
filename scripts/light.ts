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
		set_uniform3fv(gl, program, `sun.direction`, Object.values(this.position));
		set_uniform3fv(gl, program, `sun.color`, Object.values(this.color));
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
		this.traverse(parent_matrix, node);
	}

	// Basically functions the same as the get_render_jobs function
	private traverse(parent_matrix: Mat4, node: Node) {
		const matrix = parent_matrix.mul(node.matrix());

		if (node.light) {
			// position indicies in row major matrix
			node.light.position = {
				x: matrix.data[3]!,
				y: matrix.data[7]!,
				z: matrix.data[11]!
			};

			this.point_lights.push(node.light);
		}

		for (const child of node.children) {
			this.traverse(matrix, child);
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
