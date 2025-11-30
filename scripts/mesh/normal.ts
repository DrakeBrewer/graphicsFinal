import {
	create_and_load_vertex_buffer,
	create_and_load_elements_buffer,
	set_vertex_attrib_to_buffer,
	set_uniform_scalar,
	bind_texture_samplers,
} from "../utils/webGl.ts"
import { Texture } from "../texture";
import type { Position } from "../types.ts";
import Vec4 from "../utils/vertex.ts";
import Material from "./material"

const VERTEX_STRIDE = 48;

export class Mesh {
	vertices: WebGLBuffer;
	indices: WebGLBuffer;
	n_verts: number;
	n_indis: number;
	program: WebGLProgram;
	texture: WebGLTexture;
	material: Material;
	use_color: boolean;

	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		vertices: number[],
		indices: number[],
		materials: Material,
		use_color?: boolean | undefined
	) {
		this.vertices = create_and_load_vertex_buffer(gl, vertices, gl.STATIC_DRAW);
		this.indices = create_and_load_elements_buffer(gl, indices, gl.STATIC_DRAW);

		this.n_verts = vertices.length;
		this.n_indis = indices.length;
		this.program = program;

		this.texture = Texture.xor_texture(256);

		this.material = materials;
		this.use_color = use_color ?? false;
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

	static box(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		width: number,
		height: number,
		depth: number,
		material: Material,
		frontColor: { R: number; G: number; B: number; A: number },
		backColor: { R: number; G: number; B: number; A: number },
		rightColor: { R: number; G: number; B: number; A: number },
		leftColor: { R: number; G: number; B: number; A: number },
		topColor: { R: number; G: number; B: number; A: number },
		bottomColor: { R: number; G: number; B: number; A: number },
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
			// front
			hwidth, -hheight, -hdepth, backColor.R, backColor.G, backColor.B, backColor.A, front.uMax, front.vMax,
			-hwidth, -hheight, -hdepth, backColor.R, backColor.G, backColor.B, backColor.A, front.uMin, front.vMax,
			-hwidth, hheight, -hdepth, backColor.R, backColor.G, backColor.B, backColor.A, front.uMin, front.vMin,
			hwidth, hheight, -hdepth, backColor.R, backColor.G, backColor.B, backColor.A, front.uMax, front.vMin,

			// right
			hwidth, -hheight, hdepth, rightColor.R, rightColor.G, rightColor.B, rightColor.A, right.uMax, right.vMax,
			hwidth, -hheight, -hdepth, rightColor.R, rightColor.G, rightColor.B, rightColor.A, right.uMin, right.vMax,
			hwidth, hheight, -hdepth, rightColor.R, rightColor.G, rightColor.B, rightColor.A, right.uMin, right.vMin,
			hwidth, hheight, hdepth, rightColor.R, rightColor.G, rightColor.B, rightColor.A, right.uMax, right.vMin,

			// back
			-hwidth, -hheight, hdepth, frontColor.R, frontColor.G, frontColor.B, frontColor.A, back.uMax, back.vMax,
			hwidth, -hheight, hdepth, frontColor.R, frontColor.G, frontColor.B, frontColor.A, back.uMin, back.vMax,
			hwidth, hheight, hdepth, frontColor.R, frontColor.G, frontColor.B, frontColor.A, back.uMin, back.vMin,
			-hwidth, hheight, hdepth, frontColor.R, frontColor.G, frontColor.B, frontColor.A, back.uMax, back.vMin,

			// left
			-hwidth, -hheight, -hdepth, leftColor.R, leftColor.G, leftColor.B, leftColor.A, left.uMax, left.vMax,
			-hwidth, -hheight, hdepth, leftColor.R, leftColor.G, leftColor.B, leftColor.A, left.uMin, left.vMax,
			-hwidth, hheight, hdepth, leftColor.R, leftColor.G, leftColor.B, leftColor.A, left.uMin, left.vMin,
			-hwidth, hheight, -hdepth, leftColor.R, leftColor.G, leftColor.B, leftColor.A, left.uMax, left.vMin,

			// top
			-hwidth, hheight, hdepth, topColor.R, topColor.G, topColor.B, topColor.A, top.uMax, top.vMax,
			hwidth, hheight, hdepth, topColor.R, topColor.G, topColor.B, topColor.A, top.uMin, top.vMax,
			hwidth, hheight, -hdepth, topColor.R, topColor.G, topColor.B, topColor.A, top.uMin, top.vMin,
			-hwidth, hheight, -hdepth, topColor.R, topColor.G, topColor.B, topColor.A, top.uMax, top.vMin,

			// bottom
			-hwidth, -hheight, -hdepth, bottomColor.R, bottomColor.G, bottomColor.B, bottomColor.A, bottom.uMax, bottom.vMax,
			hwidth, -hheight, -hdepth, bottomColor.R, bottomColor.G, bottomColor.B, bottomColor.A, bottom.uMin, bottom.vMax,
			hwidth, -hheight, hdepth, bottomColor.R, bottomColor.G, bottomColor.B, bottomColor.A, bottom.uMin, bottom.vMin,
			-hwidth, -hheight, hdepth, bottomColor.R, bottomColor.G, bottomColor.B, bottomColor.A, bottom.uMax, bottom.vMin,
		];

		let indis = [
			// clockwise winding
			// 0, 1, 2, 2, 3, 0,
			// 4, 0, 3, 3, 7, 4,
			// 5, 4, 7, 7, 6, 5,
			// 1, 5, 6, 6, 2, 1,
			// 3, 2, 6, 6, 7, 3,
			// 4, 5, 1, 1, 0, 4,

			0, 1, 2, 0, 2, 3,
			4, 5, 6, 4, 6, 7,
			8, 9, 10, 8, 10, 11,
			12, 13, 14, 12, 14, 15,
			16, 17, 18, 16, 18, 19,
			20, 21, 22, 20, 22, 23,

			// counter-clockwise winding
			// 0, 3, 2, 2, 1, 0, 4, 7, 3, 3, 0, 4, 5, 6, 7, 7, 4, 5, 1, 2, 6, 6, 5, 1, 3,
			// 7, 6, 6, 2, 3, 4, 0, 1, 1, 5, 4,
		];

		return new Mesh(gl, program, verts, indis, material);
	}

	static sphere(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		diameter: number,
		subdivisions: number,
		material: Material,
		color: { R: number; G: number; B: number; A: number },
	) {
		const tau = Math.PI * 2.0;
		const radius = diameter / 2.0;
		const layers = subdivisions + 1;

		const verts: number[] = [];
		const indis: number[] = [];

		for (let i = 0; i < layers; i++) {
			const y_turns = i / subdivisions / 2;
			const y = Math.cos(y_turns * tau) / 2 * radius;

			const radius_scale = Math.sin(y_turns * tau);

			for (let j = 0; j <= subdivisions; j++) {
				const turns = j / subdivisions;
				const rads = turns * tau;

				const x = Math.cos(rads) / 2 * radius * radius_scale;
				const z = Math.sin(rads) / 2 * radius * radius_scale;

				verts.push(x, y, z);
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

		return new Mesh(gl, program, verts, indis, material);
	}

	static from_heightmap(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		map: number[][],
		min: number,
		max: number,
		material: Material
	) {
		let rows = map.length;
		const is_valid = map[0] !== undefined;
		if (!is_valid) {
			return;
		}

		let cols = map[0]!.length;
		const MIN_HEIGHT_COLOR = 0.2;

		let off_x = cols / 2;
		let off_z = rows / 2;

		let verts: number[] = [];
		let indis: number[] = [];

		const color = (height: number) => {
			let normed_height = height / (max - min);
			return MIN_HEIGHT_COLOR + normed_height * (1 - MIN_HEIGHT_COLOR);
		}

		const push_vert = (verts: number[], vert: Position, u: number, v: number, normal: Position) => {
			verts.push(vert.x, vert.y, vert.z);
			let vert_bright = color(vert.y);
			verts.push(vert_bright, vert_bright, vert_bright, 1.0);
			verts.push(u, v);
			verts.push(normal.x, normal.y, normal.z);
		}

		for (let row = 1; row < rows; row++) {
			for (let col = 1; col < cols; col++) {
				let indi_start = indis.length;

				if (map[row - 1] === undefined || map[row] === undefined) {
					return;
				}

				let pos_tl = map[row - 1]![col - 1]!;
				let pos_tr = map[row - 1]![col]!;
				let pos_bl = map[row]![col - 1]!;
				let pos_br = map[row]![col]!;

				let v_tl = new Vec4(-1, pos_tl, -1);
				let v_tr = new Vec4(0, pos_tr, -1);
				let v_bl = new Vec4(-1, pos_bl, 0);
				let v_br = new Vec4(0, pos_br, 0);

				let normal_t1 = Vec4.normal_of_triangle(v_tl, v_tr, v_bl);
				let normal_t2 = Vec4.normal_of_triangle(v_br, v_bl, v_tr);

				// debug
				// normal_t1 = new Vec4(0, 1, 0);
				// normal_t2 = new Vec4(0, 1, 0);

				v_tl.x += col - off_x;
				v_tl.z += row - off_z;
				v_tr.x += col - off_x;
				v_tr.z += row - off_z;
				v_bl.x += col - off_x;
				v_bl.z += row - off_z;
				v_br.x += col - off_x;
				v_br.z += row - off_z;

				push_vert(verts, v_tl, 0, 1, normal_t1);
				push_vert(verts, v_tr, 1, 1, normal_t1);
				push_vert(verts, v_bl, 0, 0, normal_t1);

				push_vert(verts, v_br, 1, 0, normal_t2);
				push_vert(verts, v_bl, 0, 0, normal_t2);
				push_vert(verts, v_tr, 1, 1, normal_t2);

				indis.push(
					indi_start,
					indi_start + 1,
					indi_start + 2,
					indi_start + 3,
					indi_start + 4,
					indi_start + 5
				);
			}
		}

		return new Mesh(gl, program, verts, indis, material, true);
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

	static from_obj_text(gl: WebGLRenderingContext, program: WebGLProgram, text: string, material: Material) {
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

				coordinates.push(...coords, 0.5, 0.75, 0.2, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0);
			}

			if (trimmed.startsWith('f ')) {
				const parts = trimmed.split(/\s+/);
				let indis = new Array<number>(3);
				parts.slice(1).map((v, i) => indis[i] = parseInt(v) - 1);

				elements.push(...indis);
			}
		}

		return new Mesh(gl, program, coordinates, elements, material);
	}

	static from_obj_file(
		gl: WebGLRenderingContext,
		file_name: string,
		program: WebGLProgram,
		material: Material,
		f: (m: Mesh) => void
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
			let loaded_mesh = Mesh.from_obj_text(gl, program, request.responseText, material);

			console.log("loaded ", file_name);
			f(loaded_mesh);
		};

		request.open("GET", file_name); // initialize request.
		request.send(); // execute request
	}
}

