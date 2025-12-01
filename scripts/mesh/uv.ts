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
		color: Color,
		material: Material,
	) {
		let hwidth = width / 2.0;
		let hheight = height / 2.0;
		let hdepth = depth / 2.0;

		let r = color.r;
		let g = color.g;
		let b = color.b;
		let a = color.a;


		let verts = [
			hwidth, -hheight, -hdepth, r, g, b, a, 1.0, 1.0, 0, 0, -1,
			-hwidth, -hheight, -hdepth, r, g, g, a, 0.0, 1.0, 0, 0, -1,
			-hwidth, hheight, -hdepth, r, g, b, a, 0.0, 0.0, 0, 0, -1,
			hwidth, hheight, -hdepth, r, g, b, a, 1.0, 0.0, 0, 0, -1,

			hwidth, -hheight, hdepth, r, g, b, a, 1.0, 1.0, 1, 0, 0,
			hwidth, -hheight, -hdepth, r, g, b, a, 0.0, 1.0, 1, 0, 0,
			hwidth, hheight, -hdepth, r, g, b, a, 0.0, 0.0, 1, 0, 0,
			hwidth, hheight, hdepth, r, g, b, a, 1.0, 0.0, 1, 0, 0,

			-hwidth, -hheight, hdepth, r, g, b, a, 1.0, 1.0, 0, 0, 1,
			hwidth, -hheight, hdepth, r,g,b,a, 0.0, 1.0, 0, 0, 1,
			hwidth, hheight, hdepth, r,g,b,a, 0.0, 0.0, 0, 0, 1,
			-hwidth, hheight, hdepth, r,g,b,a, 1.0, 0.0, 0, 0, 1,

			-hwidth, -hheight, hdepth, r,g,b,a, 0.0, 1.0, -1, 0, 0,
			-hwidth, -hheight, -hdepth, r,g,b,a, 1.0, 1.0, -1, 0, 0,
			-hwidth, hheight, -hdepth, r,g,b,a, 1.0, 0.0, -1, 0, 0,
			-hwidth, hheight, hdepth, r,g,b,a, 0.0, 0.0, -1, 0, 0,

			-hwidth, hheight, -hdepth, r,g,b,a, 0.0, 1.0, 0, 1, 0,
			hwidth, hheight, -hdepth, r,g,b,a, 1.0, 1.0, 0, 1, 0,
			hwidth, hheight, hdepth, r,g,b,a, 1.0, 0.0, 0, 1, 0,
			-hwidth, hheight, hdepth, r,g,b,a, 0.0, 0.0, 0, 1, 0,

			-hwidth, -hheight, -hdepth, r,g,b,a, 0.0, 1.0, 0, -1, 0,
			hwidth, -hheight, -hdepth, r,g,b,a, 1.0, 1.0, 0, -1, 0,
			hwidth, -hheight, hdepth, r,g,b,a, 1.0, 0.0, 0, -1, 0,
			-hwidth, -hheight, hdepth, r,g,b,a, 0.0, 0.0, 0, -1, 0,
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

	static triangle(
		gl: WebGL2RenderingContext,
		program: WebGLProgram,
		color: Color,
		size: number,
		material: Material,
	) {
		let r = color.r;
		let g = color.g;
		let b = color.b;
		let a = color.a;

		let verts = [
		//Bottom Left 
		-0.5*size, -0.25*size, 0.0*size,  r, 0.0, 0.0, a, 0.0, 0.0, 0.0,0.0,-1.0,
		//Bottom Right
		0.0*size, 0.6*size, 0.0*size,  0.0, g, 0.0, a, 0.5, 1.0, 0.0, 0.0, -1.0,
		//Top Right
		0.5*size, -0.25*size, 0.0*size,  0.0, 0.0, b, a, 1.0, 0.0, 0.0, 0.0, -1.0,

		];

		let indices = [
			0,1,2
		];

		return new UvMesh(gl,program,verts,indices,material)

	}

	static rectangle(
		gl: WebGL2RenderingContext,
		program: WebGLProgram,
		color: Color,
		size: number,
		material: Material,
	) {

		let r = color.r;
		let g = color.g;
		let b = color.b;
		let a = color.a;

		let verts = [
			// BL
			-0.5*size, -0.5*size, 0.0*size,   1.0, 0.0, 0.0, 1.0,   0.0, 0.0,   0.0, 0.0, 1.0,
			// BR
			0.5*size, -0.5*size, 0.0*size,   0.0, 1.0, 0.0, 1.0,   1.0, 0.0,   0.0, 0.0, 1.0,
			// TR
			0.5*size,  0.5*size, 0.0*size,   0.0, 0.0, 1.0, 1.0,   1.0, 1.0,   0.0, 0.0, 1.0,
			// TL
			-0.5*size,  0.5*size, 0.0*size,   1.0, 1.0, 0.0, 1.0,   0.0, 1.0,   0.0, 0.0, 1.0,
		];

		let indices = [
			0,1,2,
			0,2,3,

		];

		return new UvMesh(gl,program,verts,indices,material);


	}

	static texture_box(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		width: number,
		height: number,
		depth: number,
		color: Color,
		material: Material,
	) {
		let hwidth = width / 2.0;
		let hheight = height / 2.0;
		let hdepth = depth / 2.0;

		let r = color.r;
		let g = color.g;
		let b = color.b;
		let a = color.a;


		const top = { uMin: 0.5, vMin: 0, uMax: 0.75, vMax: 0.25 }; // gravel
		const front = { uMin: 0, vMin: 0.25, uMax: 0.25, vMax: 0.5 }; // chain link
		const right = { uMin: 0.25, vMin: 0.25, uMax: 0.5, vMax: 0.5 }; // brick
		const back = { uMin: 0.5, vMin: 0.25, uMax: 0.75, vMax: 0.5 }; // ivy
		const left = { uMin: 0.75, vMin: 0.25, uMax: 1, vMax: 0.5 }; // wood
		const bottom = { uMin: 0.5, vMin: 0.5, uMax: 0.75, vMax: 0.75 }; // stone

		let verts = [
			hwidth, -hheight, -hdepth, r,g,b,a, front.uMax, front.vMax, 0, 0, -1,
			-hwidth, -hheight, -hdepth, r,g,b,a, front.uMin, front.vMax, 0, 0, -1,
			-hwidth, hheight, -hdepth, r,g,b,a, front.uMin, front.vMin, 0, 0, -1,
			hwidth, hheight, -hdepth, r,g,b,a, front.uMax, front.vMin, 0, 0, -1,

			hwidth, -hheight, hdepth, r,g,b,a, right.uMax, right.vMax, 1, 0, 0,
			hwidth, -hheight, -hdepth, r,g,b,a, right.uMin, right.vMax, 1, 0, 0,
			hwidth, hheight, -hdepth, r,g,b,a, right.uMin, right.vMin, 1, 0, 0,
			hwidth, hheight, hdepth, r,g,b,a, right.uMax, right.vMin, 1, 0, 0,

			-hwidth, -hheight, hdepth, r,g,b,a, back.uMax, back.vMax, 0, 0, 1,
			hwidth, -hheight, hdepth, r,g,b,a, back.uMin, back.vMax, 0, 0, 1,
			hwidth, hheight, hdepth, r,g,b,a, back.uMin, back.vMin, 0, 0, 1,
			-hwidth, hheight, hdepth, r,g,b,a, back.uMax, back.vMin, 0, 0, 1,

			-hwidth, -hheight, hdepth, r,g,b,a, left.uMax, left.vMax, -1, 0, 0,
			-hwidth, -hheight, -hdepth, r,g,b,a, left.uMin, left.vMax, -1, 0, 0,
			-hwidth, hheight, -hdepth, r,g,b,a, left.uMin, left.vMin, -1, 0, 0,
			-hwidth, hheight, hdepth, r,g,b,a, left.uMax, left.vMin, -1, 0, 0,

			-hwidth, hheight, -hdepth, r,g,b,a, top.uMax, top.vMax, 0, 1, 0,
			hwidth, hheight, -hdepth, r,g,b,a, top.uMin, top.vMax, 0, 1, 0,
			hwidth, hheight, hdepth, r,g,b,a, top.uMin, top.vMin, 0, 1, 0,
			-hwidth, hheight, hdepth, r,g,b,a, top.uMax, top.vMin, 0, 1, 0,

			-hwidth, -hheight, -hdepth, r,g,b,a, bottom.uMax, bottom.vMax, 0, -1, 0,
			hwidth, -hheight, -hdepth, r,g,b,a, bottom.uMin, bottom.vMax, 0, -1, 0,
			hwidth, -hheight, hdepth, r,g,b,a, bottom.uMin, bottom.vMin, 0, -1, 0,
			-hwidth, -hheight, hdepth, r,g,b,a, bottom.uMax, bottom.vMin, 0, -1, 0,
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


	static uv_from_obj_text(gl: WebGLRenderingContext, program: WebGLProgram, text: string, material: Material) {
		// your code here
		let lines: string[] = text.split(/\r?\n/);

		let coordinates: number[] = [];
		let elements: number[] = [];

		for (const line of lines) {
			const trimmed = line.trim();

			if (trimmed.startsWith('v ')) {
				const parts = trimmed.split(/\s+/);
				let coords = new Array<number>(3);
				parts.slice(1).map((v, i) => coords[i] = parseFloat(v));

				coordinates.push(...coords, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0);
			}

			if (trimmed.startsWith('f ')) {
				const parts = trimmed.split(/\s+/);
				let indis = new Array<number>(3);
				parts.slice(1).map((v, i) => indis[i] = parseInt(v) - 1);

				elements.push(...indis);
			}
		}

		return new UvMesh(gl, program, coordinates, elements, material);
	}

	static uv_from_obj_file(
		gl: WebGLRenderingContext,
		file_name: string,
		program: WebGLProgram,
		material: Material,
		f: (m: UvMesh) => void
	) {
		let request = new XMLHttpRequest();

		// the function that will be called when the file is being loaded
		request.onreadystatechange = () => {
			// console.log( request.readyState );

			if (request.readyState != 4) {
				return;
			}
			if (request.status != 200) {
				throw new Error(`HTTP error when opening .obj file: ${request.statusText}`);
			}

			// now we know the file exists and is ready
			let loaded_mesh = UvMesh.uv_from_obj_text(gl, program, request.responseText, material);

			console.log("loaded ", file_name);
			f(loaded_mesh);
		};

		request.open("GET", file_name); // initialize request.
		request.send(); // execute request
	}
}
