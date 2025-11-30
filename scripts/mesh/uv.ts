import {
	create_and_load_vertex_buffer,
	create_and_load_elements_buffer,
	set_vertex_attrib_to_buffer,
	set_uniform_scalar,
	bind_texture_samplers,
} from "../utils/webGl.ts"
import { Texture } from "../texture.ts";
import type { Color } from "../types.ts";
import Material from "./material"

const VERTEX_STRIDE = 48;

export class UvMesh {
	vertices: WebGLBuffer;
	indices: WebGLBuffer;
	n_verts: number;
	n_indis: number;
	program: WebGLProgram;
	material: Material

	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		vertices: number[],
		indices: number[],
		material: Material,
	) {
		this.vertices = create_and_load_vertex_buffer(gl, vertices, gl.STATIC_DRAW);
		this.indices = create_and_load_elements_buffer(gl, indices, gl.STATIC_DRAW);

		this.n_verts = vertices.length;
		this.n_indis = indices.length;
		this.program = program;
		this.material = material;
	}

	private set_vertex_attrib_buffers(gl: WebGLRenderingContext) {
		set_vertex_attrib_to_buffer(
			gl, this.program,
			"coordinates",
			this.vertices, 3,
			gl.FLOAT, false,
			VERTEX_STRIDE, 0,
		);

		set_vertex_attrib_to_buffer(
			gl, this.program, "color",
			this.vertices, 4,
			gl.FLOAT, false,
			VERTEX_STRIDE, 12,
		);

		set_vertex_attrib_to_buffer(
			gl, this.program, "uv",
			this.vertices, 2,
			gl.FLOAT, false,
			VERTEX_STRIDE, 28,
		);

		set_vertex_attrib_to_buffer(
			gl, this.program, "normal",
			this.vertices, 3,
			gl.FLOAT, false,
			VERTEX_STRIDE, 36,
		);
	}

	render(gl: WebGLRenderingContext) {
		gl.frontFace(gl.CW)
		gl.cullFace(gl.BACK);
		//gl.enable(gl.CULL_FACE);

		gl.useProgram(this.program);
		this.set_vertex_attrib_buffers(gl);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
		bind_texture_samplers(gl, this.program, 'tex_0');

		set_uniform_scalar(gl, this.program, "material.ambient", this.material.ambient);
		set_uniform_scalar(gl, this.program, "material.diffuse", this.material.diffuse);
		set_uniform_scalar(gl, this.program, "material.specular", this.material.specular);
		set_uniform_scalar(gl, this.program, "material.shininess", this.material.shininess);

		gl.activeTexture(gl.TEXTURE0);
		this.material.bind(gl, this.program);

		gl.drawElements(gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0);
	}

	static box(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		width: number,
		height: number,
		depth: number,
		material: Material,
	) {
		let hwidth = width / 2.0;
		let hheight = height / 2.0;
		let hdepth = depth / 2.0;

		let verts = [
			hwidth, -hheight, -hdepth, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0, 0, -1,
			-hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0, 0, -1,
			-hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, 0.0, 0.0, 0, 0, -1,
			hwidth, hheight, -hdepth, 1.0, 1.0, 0.5, 1.0, 1.0, 0.0, 0, 0, -1,

			hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1, 0, 0,
			hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1, 0, 0,
			hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, 0.0, 0.0, 1, 0, 0,
			hwidth, hheight, hdepth, 1.0, 1.0, 0.5, 1.0, 1.0, 0.0, 1, 0, 0,

			-hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0, 0, 1,
			hwidth, -hheight, hdepth, 1.0, 1.0, 0.5, 1.0, 0.0, 1.0, 0, 0, 1,
			hwidth, hheight, hdepth, 0.5, 0.5, 1.0, 1.0, 0.0, 0.0, 0, 0, 1,
			-hwidth, hheight, hdepth, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0, 0, 1,

			-hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1, 0, 0,
			-hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1, 0, 0,
			-hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, 1.0, 0.0, -1, 0, 0,
			-hwidth, hheight, hdepth, 1.0, 1.0, 0.5, 1.0, 0.0, 0.0, -1, 0, 0,

			-hwidth, hheight, -hdepth, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0, 1, 0,
			hwidth, hheight, -hdepth, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0, 1, 0,
			hwidth, hheight, hdepth, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0, 1, 0,
			-hwidth, hheight, hdepth, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0, 1, 0,

			-hwidth, -hheight, -hdepth, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0, -1, 0,
			hwidth, -hheight, -hdepth, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0, -1, 0,
			hwidth, -hheight, hdepth, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0, -1, 0,
			-hwidth, -hheight, hdepth, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0, -1, 0,
		];

		let indis = [
			// // clockwise winding
			0, 3, 2, 2, 1, 0,
			4, 7, 6, 6, 5, 4,
			8, 11, 10, 10, 9, 8,
			12, 13, 14, 14, 15, 12,
			16, 17, 18, 18, 19, 16,
			20, 23, 22, 22, 21, 20,

			// counter-clockwise winding
			// 2, 1, 0, 2, 0, 3,
			// 6, 5, 4, 4, 7, 6,
			// 10, 9, 8, 8, 11, 10,
			// 12, 13, 14, 14, 15, 12,
			// 16, 17, 18, 18, 19, 16,
			// 22, 21, 20, 20, 23, 22,
		];

		return new UvMesh(gl, program, verts, indis, material);
	}

	static texture_box(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		width: number,
		height: number,
		depth: number,
		material: Material,
	) {
		let hwidth = width / 2.0;
		let hheight = height / 2.0;
		let hdepth = depth / 2.0;

		const top = { uMin: 0.5, vMin: 0, uMax: 0.75, vMax: 0.25 }; // gravel
		const front = { uMin: 0, vMin: 0.25, uMax: 0.25, vMax: 0.5 }; // chain link
		const right = { uMin: 0.25, vMin: 0.25, uMax: 0.5, vMax: 0.5 }; // brick
		const back = { uMin: 0.5, vMin: 0.25, uMax: 0.75, vMax: 0.5 }; // ivy
		const left = { uMin: 0.75, vMin: 0.25, uMax: 1, vMax: 0.5 }; // wood
		const bottom = { uMin: 0.5, vMin: 0.5, uMax: 0.75, vMax: 0.75 }; // stone

		let verts = [
			hwidth, -hheight, -hdepth, 1.0, 0.0, 1.0, 1.0, front.uMax, front.vMax, 0, 0, -1,
			-hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, front.uMin, front.vMax, 0, 0, -1,
			-hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, front.uMin, front.vMin, 0, 0, -1,
			hwidth, hheight, -hdepth, 1.0, 1.0, 0.5, 1.0, front.uMax, front.vMin, 0, 0, -1,

			hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, right.uMax, right.vMax, 1, 0, 0,
			hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, right.uMin, right.vMax, 1, 0, 0,
			hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, right.uMin, right.vMin, 1, 0, 0,
			hwidth, hheight, hdepth, 1.0, 1.0, 0.5, 1.0, right.uMax, right.vMin, 1, 0, 0,

			-hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, back.uMax, back.vMax, 0, 0, 1,
			hwidth, -hheight, hdepth, 1.0, 1.0, 0.5, 1.0, back.uMin, back.vMax, 0, 0, 1,
			hwidth, hheight, hdepth, 0.5, 0.5, 1.0, 1.0, back.uMin, back.vMin, 0, 0, 1,
			-hwidth, hheight, hdepth, 0.0, 1.0, 1.0, 1.0, back.uMax, back.vMin, 0, 0, 1,

			-hwidth, -hheight, hdepth, 1.0, 0.0, 1.0, 1.0, left.uMax, left.vMax, -1, 0, 0,
			-hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0, left.uMin, left.vMax, -1, 0, 0,
			-hwidth, hheight, -hdepth, 0.5, 0.5, 1.0, 1.0, left.uMin, left.vMin, -1, 0, 0,
			-hwidth, hheight, hdepth, 1.0, 1.0, 0.5, 1.0, left.uMax, left.vMin, -1, 0, 0,

			-hwidth, hheight, -hdepth, 1.0, 0.0, 0.0, 1.0, top.uMax, top.vMax, 0, 1, 0,
			hwidth, hheight, -hdepth, 0.0, 1.0, 0.0, 1.0, top.uMin, top.vMax, 0, 1, 0,
			hwidth, hheight, hdepth, 0.0, 0.0, 1.0, 1.0, top.uMin, top.vMin, 0, 1, 0,
			-hwidth, hheight, hdepth, 1.0, 1.0, 0.0, 1.0, top.uMax, top.vMin, 0, 1, 0,

			-hwidth, -hheight, -hdepth, 1.0, 0.0, 0.0, 1.0, bottom.uMax, bottom.vMax, 0, -1, 0,
			hwidth, -hheight, -hdepth, 0.0, 1.0, 0.0, 1.0, bottom.uMin, bottom.vMax, 0, -1, 0,
			hwidth, -hheight, hdepth, 0.0, 0.0, 1.0, 1.0, bottom.uMin, bottom.vMin, 0, -1, 0,
			-hwidth, -hheight, hdepth, 1.0, 1.0, 0.0, 1.0, bottom.uMax, bottom.vMin, 0, -1, 0,
		];

		let indis = [
			// // clockwise winding
			0, 3, 2, 2, 1, 0,
			4, 7, 6, 6, 5, 4,
			8, 11, 10, 10, 9, 8,
			12, 13, 14, 14, 15, 12,
			16, 17, 18, 18, 19, 16,
			20, 23, 22, 22, 21, 20,

			// counter-clockwise winding
			// 2, 1, 0, 2, 0, 3,
			// 6, 5, 4, 4, 7, 6,
			// 10, 9, 8, 8, 11, 10,
			// 12, 13, 14, 14, 15, 12,
			// 16, 17, 18, 18, 19, 16,
			// 22, 21, 20, 20, 23, 22,
		];

		return new UvMesh(gl, program, verts, indis, material);
	}

	static sphere(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		diameter: number,
		subdivisions: number,
		color: Color,
		material: Material,
	) {
		const tau = Math.PI * 2.0;
		const radius = diameter / 2.0;
		const layers = subdivisions + 1;

		const verts: number[] = [];
		const indis: number[] = [];

		for (let i = 0; i < layers; i++) {
			const y_turns = i / subdivisions / 2;
			const y = Math.cos(y_turns * tau) / 2;

			const radius_scale = Math.sin(y_turns * tau);

			for (let j = 0; j <= subdivisions; j++) {
				const turns = j / subdivisions;
				const rads = turns * tau;

				const x = Math.cos(rads) / 2 * radius_scale;
				const z = Math.sin(rads) / 2 * radius_scale;

				verts.push(x * radius, y * radius, z * radius);
				verts.push(...Object.values(color))

				const uv_coords = {
					u: j / subdivisions,
					v: i / subdivisions,
				}

				verts.push(...Object.values(uv_coords));

				const magnitude = Math.sqrt(x * x + y * y + z * z);
				const normals = {
					x: x / magnitude,
					y: y / magnitude,
					z: z / magnitude,
				}

				verts.push(...Object.values(normals));
			}
		}

		// Clockwise winding
		for (let i = 0; i < layers - 1; i++) {
			for (let j = 0; j < subdivisions; j++) {
				const topLeft = i * (subdivisions + 1) + j;
				const topRight = topLeft + 1;
				const bottomLeft = (i + 1) * (subdivisions + 1) + j;
				const bottomRight = bottomLeft + 1;

				indis.push(topLeft, topRight, bottomLeft);
				indis.push(topRight, bottomRight, bottomLeft);
			}
		}

		return new UvMesh(gl, program, verts, indis, material);
	}
}
