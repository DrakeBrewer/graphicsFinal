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
		//gl.cullFace(gl.BACK);
		gl.disable(gl.CULL_FACE); // Disable culling to see interior

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
		material: Material,
	) {
		let r = color.r;
		let g = color.g;
		let b = color.b;
		let a = color.a;

		let verts = [
		//Bottom Left 
		-0.5, -0.25, 0.0,  r, 0.0, 0.0, a, 0.0, 0.0, 0.0,0.0,-1.0,
		//Bottom Right
		0.0, 0.6, 0.0,  0.0, g, 0.0, a, 0.5, 1.0, 0.0, 0.0, -1.0,
		//Top Right
		0.5, -0.25, 0.0,  0.0, 0.0, b, a, 1.0, 0.0, 0.0, 0.0, -1.0,

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
		const lines = text.split(/\r?\n/);

		// Arrays to store parsed data from OBJ file
		const positions: number[][] = [];     // v x y z
		const uvs: number[][] = [];           // vt u v
		const normals: number[][] = [];       // vn x y z
		const faces: string[][] = [];         // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3

		// Parse the OBJ file line by line with better error handling
		for (let i = 0; i < lines.length; i++) {
			const trimmed = lines[i].trim();
			if (!trimmed || trimmed.startsWith('#')) continue;

			try {
				const parts = trimmed.split(/\s+/);
				if (parts.length === 0) continue;

				const command = parts[0];

				switch (command) {
					case 'v':
						// Vertex position - ensure we have at least 3 coordinates
						if (parts.length < 4) {
							console.warn(`Line ${i + 1}: Incomplete vertex position, using defaults`);
						}
						positions.push([
							parseFloat(parts[1]) || 0,
							parseFloat(parts[2]) || 0,
							parseFloat(parts[3]) || 0
						]);
						break;

					case 'vt':
						// Texture coordinate - ensure we have at least 2 coordinates
						if (parts.length < 3) {
							console.warn(`Line ${i + 1}: Incomplete UV coordinates, using defaults`);
						}
						uvs.push([
							parseFloat(parts[1]) || 0,
							parseFloat(parts[2]) || 0
						]);
						break;

					case 'vn':
						// Normal vector - ensure we have 3 components
						if (parts.length < 4) {
							console.warn(`Line ${i + 1}: Incomplete normal vector, using defaults`);
						}
						normals.push([
							parseFloat(parts[1]) || 0,
							parseFloat(parts[2]) || 1,
							parseFloat(parts[3]) || 0
						]);
						break;

					case 'f':
						// Face definition
						const faceVertices = parts.slice(1);
						if (faceVertices.length < 3) {
							console.warn(`Line ${i + 1}: Face with less than 3 vertices, skipping`);
							continue;
						}
						faces.push(faceVertices);
						break;
				}
			} catch (error) {
				console.error(`Error parsing OBJ line ${i + 1}: "${trimmed}"`, error);
				// Continue parsing despite errors
			}
		}

		// Build final vertex array and index array with vertex deduplication
		const finalVertices: number[] = [];
		const finalIndices: number[] = [];
		const vertexMap = new Map<string, number>(); // For vertex deduplication
		let vertexIndex = 0;

		// Helper function to calculate triangle normal
		const calculateTriangleNormal = (triangle: string[]): number[] => {
			if (triangle.length !== 3) return [0, 1, 0];
			
			const v1Idx = parseInt(triangle[0].split('/')[0]) - 1;
			const v2Idx = parseInt(triangle[1].split('/')[0]) - 1;
			const v3Idx = parseInt(triangle[2].split('/')[0]) - 1;

			if (v1Idx < 0 || v2Idx < 0 || v3Idx < 0 || 
				v1Idx >= positions.length || v2Idx >= positions.length || v3Idx >= positions.length) {
				return [0, 1, 0];
			}
			
			const p1 = positions[v1Idx];
			const p2 = positions[v2Idx];
			const p3 = positions[v3Idx];

			// Calculate face normal using cross product
			const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
			const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

			const normal = [
				u[1] * v[2] - u[2] * v[1],
				u[2] * v[0] - u[0] * v[2],
				u[0] * v[1] - u[1] * v[0]
			];

			// Normalize
			const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
			if (length > 1e-6) {
				normal[0] /= length;
				normal[1] /= length;
				normal[2] /= length;
			} else {
				// Degenerate triangle, use default normal
				return [0, 1, 0];
			}

			return normal;
		};

		// Process each face with better triangulation
		for (const face of faces) {
			const numVertices = face.length;
			
			// Fan triangulation for polygons with >3 vertices
			for (let i = 1; i < numVertices - 1; i++) {
				const triangle = [face[0], face[i], face[i + 1]];
				const triangleNormal = calculateTriangleNormal(triangle);
				
				for (const vertexDef of triangle) {
					// Parse vertex definition with better error handling
					const indices = vertexDef.split('/');
					
					const posIdx = parseInt(indices[0]) - 1;
					const uvIdx = indices[1] && indices[1] !== '' ? parseInt(indices[1]) - 1 : -1;
					const normalIdx = indices[2] && indices[2] !== '' ? parseInt(indices[2]) - 1 : -1;

					// Validate indices
					if (posIdx < 0 || posIdx >= positions.length) {
						console.warn(`Invalid position index: ${posIdx + 1}`);
						continue;
					}

					// Create unique vertex key for deduplication
					const vertexKey = `${posIdx}_${uvIdx}_${normalIdx}`;
					
					let index = vertexMap.get(vertexKey);
					if (index === undefined) {
						// New unique vertex - add it
						index = vertexIndex++;
						vertexMap.set(vertexKey, index);

						// Add position
						finalVertices.push(...positions[posIdx]);

						// Add color (white default)
						finalVertices.push(1.0, 1.0, 1.0, 1.0);

						// Add UV coordinates
						if (uvIdx >= 0 && uvIdx < uvs.length) {
							finalVertices.push(...uvs[uvIdx]);
						} else {
							finalVertices.push(0.0, 0.0);
						}

						// Add normal
						if (normalIdx >= 0 && normalIdx < normals.length) {
							finalVertices.push(...normals[normalIdx]);
						} else {
							// Use calculated triangle normal
							finalVertices.push(...triangleNormal);
						}
					}

					// Add index to triangle
					finalIndices.push(index);
				}
			}
		}

		console.log(`OBJ Parser Results:`);
		console.log(`- Positions: ${positions.length}`);
		console.log(`- UVs: ${uvs.length}`);
		console.log(`- Normals: ${normals.length}`);
		console.log(`- Faces: ${faces.length}`);
		console.log(`- Final vertices: ${finalVertices.length / 12} (${finalVertices.length} floats)`);
		console.log(`- Final indices: ${finalIndices.length}`);

		return new UvMesh(gl, program, finalVertices, finalIndices, material);
	}

	static uv_from_obj_file_with_materials(
		gl: WebGLRenderingContext,
		file_name: string,
		program: WebGLProgram,
		wall_material: Material,
		floor_material: Material,
		f: (walls: UvMesh, floors: UvMesh) => void
	) {
		console.log("Starting to load OBJ file:", file_name);
		let request = new XMLHttpRequest();

		request.onreadystatechange = () => {
			if (request.readyState != 4) {
				return;
			}
			if (request.status != 200) {
				console.error(`HTTP error when opening .obj file: ${request.statusText}`);
				throw new Error(`HTTP error when opening .obj file: ${request.statusText}`);
			}

			console.log("OBJ file loaded, parsing...");
			// Parse the OBJ and separate into walls and floors
			const meshes = UvMesh.parse_obj_by_surface_type(gl, program, request.responseText, wall_material, floor_material);
			
			console.log("loaded ", file_name, "with separate wall/floor materials");
			f(meshes.walls, meshes.floors);
		};

		request.open("GET", file_name);
		request.send();
	}

	static parse_obj_by_surface_type(
		gl: WebGLRenderingContext, 
		program: WebGLProgram, 
		text: string, 
		wall_material: Material, 
		floor_material: Material
	): { walls: UvMesh, floors: UvMesh } {
		let lines: string[] = text.split(/\r?\n/);

		let positions: number[][] = [];
		let uvs: number[][] = [];
		let normals: number[][] = [];
		let faces: string[][] = [];

		// Parse OBJ data
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;

			const parts = trimmed.split(/\s+/);
			const command = parts[0];

			switch (command) {
				case 'v':
					positions.push([
						parseFloat(parts[1]) || 0,
						parseFloat(parts[2]) || 0,
						parseFloat(parts[3]) || 0
					]);
					break;
				case 'vt':
					uvs.push([
						parseFloat(parts[1]) || 0,
						parseFloat(parts[2]) || 0
					]);
					break;
				case 'vn':
					normals.push([
						parseFloat(parts[1]) || 0,
						parseFloat(parts[2]) || 1,
						parseFloat(parts[3]) || 0
					]);
					break;
				case 'f':
					faces.push(parts.slice(1));
					break;
			}
		}

		// Separate wall and floor vertices/indices
		const wallVertices: number[] = [];
		const wallIndices: number[] = [];
		const floorVertices: number[] = [];
		const floorIndices: number[] = [];
		
		let wallVertexIndex = 0;
		let floorVertexIndex = 0;

		// Process each face and determine if it's a wall or floor
		for (const face of faces) {
			const numVertices = face.length;
			
			for (let i = 1; i < numVertices - 1; i++) {
				const triangle = [face[0], face[i], face[i + 1]];
				
				// Calculate face normal to determine if it's a floor or wall
				const faceNormal = UvMesh.calculateTriangleNormal(triangle, positions);
				const isFloor = Math.abs(faceNormal[1]) > 0.7; // Y component > 0.7 means mostly horizontal
				
				// Choose target arrays based on surface type
				const targetVertices = isFloor ? floorVertices : wallVertices;
				const targetIndices = isFloor ? floorIndices : wallIndices;
				const vertexCounter = isFloor ? floorVertexIndex : wallVertexIndex;
				
				for (const vertexDef of triangle) {
					const indices = vertexDef.split('/');
					const posIdx = parseInt(indices[0]) - 1;
					const uvIdx = indices[1] ? parseInt(indices[1]) - 1 : -1;
					const normalIdx = indices[2] ? parseInt(indices[2]) - 1 : -1;

					// Add position
					if (posIdx >= 0 && posIdx < positions.length) {
						targetVertices.push(...positions[posIdx]);
					} else {
						targetVertices.push(0, 0, 0);
					}

					// Add color
					targetVertices.push(1.0, 1.0, 1.0, 1.0);

					// Add UV coordinates - modify based on surface type
					if (uvIdx >= 0 && uvIdx < uvs.length) {
						let u = uvs[uvIdx][0];
						let v = uvs[uvIdx][1];
						
						if (isFloor) {
							// Map floor UVs to tile region (bottom half of texture)
							v = v * 0.5 + 0.5; // Scale to bottom half
						} else {
							// Map wall UVs to wood paneling region (top half of texture) 
							v = v * 0.5; // Scale to top half
						}
						
						targetVertices.push(u, v);
					} else {
						targetVertices.push(0.0, 0.0);
					}

					// Add normal
					if (normalIdx >= 0 && normalIdx < normals.length) {
						targetVertices.push(...normals[normalIdx]);
					} else {
						targetVertices.push(...faceNormal);
					}

					targetIndices.push(vertexCounter);
				}
				
				// Update vertex counters
				if (isFloor) {
					floorVertexIndex += 3;
				} else {
					wallVertexIndex += 3;
				}
			}
		}

		console.log(`Separated building: ${wallVertices.length/12} wall vertices, ${floorVertices.length/12} floor vertices`);

		return {
			walls: new UvMesh(gl, program, wallVertices, wallIndices, wall_material),
			floors: new UvMesh(gl, program, floorVertices, floorIndices, floor_material)
		};
	}

	static calculateTriangleNormal(triangle: string[], positions: number[][]): number[] {
		try {
			const v1Idx = parseInt(triangle[0].split('/')[0]) - 1;
			const v2Idx = parseInt(triangle[1].split('/')[0]) - 1;
			const v3Idx = parseInt(triangle[2].split('/')[0]) - 1;

			if (v1Idx >= 0 && v2Idx >= 0 && v3Idx >= 0 && 
				v1Idx < positions.length && v2Idx < positions.length && v3Idx < positions.length) {
				
				const p1 = positions[v1Idx];
				const p2 = positions[v2Idx];
				const p3 = positions[v3Idx];

				// Calculate vectors from p1 to p2 and p1 to p3
				const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
				const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

				// Cross product u × v
				const normal = [
					u[1] * v[2] - u[2] * v[1],
					u[2] * v[0] - u[0] * v[2],
					u[0] * v[1] - u[1] * v[0]
				];

				// Normalize with better epsilon check
				const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
				if (length > 1e-6) {
					normal[0] /= length;
					normal[1] /= length;
					normal[2] /= length;
					return normal;
				}
			}
		} catch (error) {
			console.warn('Error calculating triangle normal:', error);
		}
		
		return [0, 1, 0]; // default up normal
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
