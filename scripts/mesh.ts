import {
	create_and_load_vertex_buffer,
	create_and_load_elements_buffer,
	set_vertex_attrib_to_buffer,
	set_uniform_scalar,
	bind_texture_samplers,
} from "./utils/webGl.ts"
import { Texture } from "./texture";

const VERTEX_STRIDE = 36;


export interface Material {
	ambient: number;
	diffuse: number;
	specular: number;
	shininess: number;
}

export class Mesh {
	verts: number[];
	indis: number[];
	n_verts: number;
	n_indis: number;
	program: WebGLProgram;
	texture: WebGLTexture;
	materials: Material

	/**
	 * Creates a new mesh and loads it into video memory.
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {number} program
	 * @param {number[]} vertices
	 * @param {number[]} indices
	 */
	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		vertices: number[],
		indices: number[],
		materials?: Material,
	) {
		this.verts = create_and_load_vertex_buffer(gl, vertices, gl.STATIC_DRAW);
		this.indis = create_and_load_elements_buffer(gl, indices, gl.STATIC_DRAW);

		this.n_verts = vertices.length;
		this.n_indis = indices.length;
		this.program = program;

		this.texture = Texture.xor_texture(256);

		this.materials = materials || {
			ambient: 0.25,
			diffuse: 1.0,
			specular: 2.0,
			shininess: 4.0
		};
	}

	/**
	 * Create a box mesh with the given dimensions and colors.
	 * @param {WebGLRenderingContext} gl
	 * @param {number} width
	 * @param {number} height
	 * @param {number} depth
	 */

	static box(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		width: number,
		height: number,
		depth: number,
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

		return new Mesh(gl, program, verts, indis);
	}

	static sphere(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		diameter: number,
		subdivisions: number,
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

				// const magnitude = Math.sqrt(x * x + y * y + z * z);
				// const normals = {
				// 	x: x / magnitude,
				// 	y: y / magnitude,
				// 	z: z / magnitude,
				// }

				// verts.push(...Object.values(normals));
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

		return new Mesh(gl, program, verts, indis);
	}

	/**
	 * Render the mesh. Does NOT preserve array/index buffer or program bindings!
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	render(gl: WebGLRenderingContext) {
		gl.frontFace(gl.CW)
		gl.cullFace(gl.BACK);
		gl.enable(gl.CULL_FACE);

		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verts);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indis);

		set_vertex_attrib_to_buffer(
			gl,
			this.program,
			"coordinates",
			this.verts,
			3,
			gl.FLOAT,
			false,
			VERTEX_STRIDE,
			0,
		);

		set_vertex_attrib_to_buffer(
			gl,
			this.program,
			"color",
			this.verts,
			4,
			gl.FLOAT,
			false,
			VERTEX_STRIDE,
			12,
		);

		set_vertex_attrib_to_buffer(
			gl,
			this.program,
			"uv",
			this.verts,
			2,
			gl.FLOAT,
			false,
			VERTEX_STRIDE,
			28,
		);

		// set_vertex_attrib_to_buffer(
		// 	gl,
		// 	this.program,
		// 	"normal",
		// 	this.verts,
		// 	3,
		// 	gl.FLOAT,
		// 	false,
		// 	VERTEX_STRIDE,
		// 	36,  // offset: 12 (pos) + 16 (color) + 8 (uv) = 36
		// );

		const sampler_loc = gl.getUniformLocation(this.program, 'tex_0');
		gl.uniform1i(sampler_loc, 0);
		// gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// set_uniform_scalar(gl, this.program, "mat_ambient", this.materials.ambient);
		// set_uniform_scalar(gl, this.program, "mat_diffuse", this.materials.diffuse);
		// set_uniform_scalar(gl, this.program, "mat_specular", this.materials.specular);
		// set_uniform_scalar(gl, this.program, "mat_shininess", this.materials.shininess);

		gl.drawElements(gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0);
	}

	/**
	 * Parse the given text as the body of an obj file.
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 * @param {string} text
	 */
	static from_obj_text(gl: WebGLRenderingContext, program: WebGLProgram, text: string) {
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

				coordinates.push(...coords, 0.5, 0.75, 0.2, 1.0);
			}

			if (trimmed.startsWith('f ')) {
				const parts = trimmed.split(/\s+/);
				let indis = new Array<number>(3);
				parts.slice(1).map((v, i) => indis[i] = parseInt(v) - 1);

				elements.push(...indis);
			}
		}

		return new Mesh(gl, program, coordinates, elements);
	}

	/**
	 * Asynchronously load the obj file as a mesh.
	 * @param {WebGLRenderingContext} gl
	 * @param {string} file_name
	 * @param {WebGLProgram} program
	 * @param {function} f the function to call and give mesh to when finished.
	 */
	static from_obj_file(gl: WebGLRenderingContext, file_name: string, program: WebGLProgram, f: (m: Mesh) => void) {
		let request = new XMLHttpRequest();

		// the function that will be called when the file is being loaded
		request.onreadystatechange = function() {
			// console.log( request.readyState );

			if (request.readyState != 4) {
				return;
			}
			if (request.status != 200) {
				throw new Error(`HTTP error when opening .obj file: ${request.statusText}`);
			}

			// now we know the file exists and is ready
			let loaded_mesh = Mesh.from_obj_text(gl, program, request.responseText);

			console.log("loaded ", file_name);
			f(loaded_mesh);
		};

		request.open("GET", file_name); // initialize request.
		request.send(); // execute request
	}
}

