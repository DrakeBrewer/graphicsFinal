import type { Color, Position } from "./types";
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
