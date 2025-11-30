import { Controls } from "./camera";
import { UvMesh } from "./mesh/uv.ts";
import Material from "./mesh/material";
import Node from "./sceneGraph";
import type { Color } from "./types";
import {
	DESIRED_MSPT,
	FLY_SPEED_PER_FRAME,
	ROTATION_SPEED_PER_FRAME
} from "./utils/constants";
import Mat4 from "./utils/matrix";
import {
	set_render_params,
	create_compile_and_link_program,
	set_uniform_matrix4,
	set_uniform3fv,
	loadCubemap,
	create_and_load_vertex_buffer,
	create_and_load_elements_buffer,
} from "./utils/webGl";
import { generate_render_jobs, RenderMesh } from "./rendering/mesh"
import { Mesh } from "./mesh/normal.ts";

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
if (!canvas) {
	throw new Error("Error: you forgot the canvas");
}

//Skybox verts
const sky_box_verts = [
	-1, -1, 1,
	1, -1, 1,
	1, 1, 1,
	-1, 1, 1,
	-1, -1, -1,
	1, -1, -1,
	1, 1, -1,
	-1, 1, -1,

];

const sky_box_indicies = [
	0, 1, 2, 0, 2, 3,
	1, 5, 6, 1, 6, 2,
	5, 4, 7, 5, 7, 6,
	4, 0, 3, 4, 3, 7,
	3, 2, 6, 3, 6, 7,
	4, 5, 1, 4, 1, 0,

];

async function main() {
	const gl = canvas!.getContext('webgl2');
	if (!gl) {
		throw new Error('failed to initialize gl context');
	}

	const render_bg: Color = {
		r: 0.5,
		g: 0.5,
		b: 0.5,
		a: 1.0
	}
	set_render_params(gl, render_bg);

	const sky_box_vao = gl.createVertexArray()!;
	gl.bindVertexArray(sky_box_vao);

	const sky_box_vbo = create_and_load_vertex_buffer(gl, sky_box_verts, gl.STATIC_DRAW);
	const sky_box_ebo = create_and_load_elements_buffer(gl, sky_box_indicies, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, sky_box_vbo);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sky_box_ebo);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);

	gl.bindVertexArray(null);


	const vertex_src = "../assets/shaders/vertex.glsl";
	const fragment_src = "../assets/shaders/fragment.glsl";
	const sky_shade = '../assets/shaders/skybox_vertex.glsl';
	const sky_frag = '../assets/shaders/skybox_fragment.glsl';

	const program = await create_compile_and_link_program(gl, vertex_src, fragment_src);
	const sky_prog = await create_compile_and_link_program(gl, sky_shade, sky_frag);
	gl.useProgram(sky_prog);
	gl.useProgram(program);

	const skybox_texture = loadCubemap(gl, [
		'../assets/textures/px.png',
		'../assets/textures/nx.png',
		'../assets/textures/py.png',
		'../assets/textures/ny.png',
		'../assets/textures/pz.png',
		'../assets/textures/nz.png',
	]);

	const hm = [
		[2.3, 1.8, 2.1, 3.4, 2.9, 3.1, 2.7, 3.5, 4.1, 3.8, 4.2, 3.9, 4.5, 4.8, 5.1],
		[1.9, 2.4, 2.8, 3.1, 3.5, 3.8, 4.2, 4.0, 4.3, 4.6, 4.9, 5.2, 5.0, 5.3, 5.6],
		[2.2, 2.6, 3.0, 3.6, 4.1, 4.4, 4.7, 4.5, 4.8, 5.1, 5.4, 5.7, 5.5, 5.8, 6.1],
		[2.5, 2.9, 3.3, 3.9, 4.5, 5.0, 5.3, 5.1, 5.4, 5.7, 6.0, 6.3, 6.1, 6.4, 6.7],
		[2.8, 3.2, 3.7, 4.3, 4.9, 5.4, 5.8, 5.6, 5.9, 6.2, 6.5, 6.8, 6.6, 6.9, 7.2],
		[3.1, 3.5, 4.0, 4.6, 5.2, 5.7, 6.1, 6.0, 6.3, 6.6, 6.9, 7.2, 7.0, 7.3, 7.6],
		[2.7, 3.1, 3.6, 4.2, 4.8, 5.3, 5.7, 5.5, 5.8, 6.1, 6.4, 6.7, 6.5, 6.8, 7.1],
		[2.4, 2.8, 3.3, 3.9, 4.5, 5.0, 5.4, 5.2, 5.5, 5.8, 6.1, 6.4, 6.2, 6.5, 6.8],
		[2.1, 2.5, 3.0, 3.6, 4.2, 4.7, 5.1, 4.9, 5.2, 5.5, 5.8, 6.1, 5.9, 6.2, 6.5],
		[1.8, 2.2, 2.7, 3.3, 3.9, 4.4, 4.8, 4.6, 4.9, 5.2, 5.5, 5.8, 5.6, 5.9, 6.2],
		[1.5, 1.9, 2.4, 3.0, 3.6, 4.1, 4.5, 4.3, 4.6, 4.9, 5.2, 5.5, 5.3, 5.6, 5.9],
		[1.2, 1.6, 2.1, 2.7, 3.3, 3.8, 4.2, 4.0, 4.3, 4.6, 4.9, 5.2, 5.0, 5.3, 5.6],
		[0.9, 1.3, 1.8, 2.4, 3.0, 3.5, 3.9, 3.7, 4.0, 4.3, 4.6, 4.9, 4.7, 5.0, 5.3],
		[0.6, 1.0, 1.5, 2.1, 2.7, 3.2, 3.6, 3.4, 3.7, 4.0, 4.3, 4.6, 4.4, 4.7, 5.0],
		[0.3, 0.7, 1.2, 1.8, 2.4, 2.9, 3.3, 3.1, 3.4, 3.7, 4.0, 4.3, 4.1, 4.4, 4.7]
	];
	const texture_map_mat = new Material(gl, '../assets/textures/texture_map.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0);
	const metal_scale_mat = new Material(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0)
	const metal_sphere_mat = new Material(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR, 0.25, 1.0, 2.0, 4.0)

	const height_map = Mesh.from_heightmap(gl, program, hm, 0, 7.6, metal_scale_mat);
	const cube_with_textures_mesh = UvMesh.texture_box(gl, program, 4, 4, 4, texture_map_mat);
	const cube_with_grant_mesh = UvMesh.box(gl, program, 3, 3, 3, metal_scale_mat);
	const metal_sphere_mesh = UvMesh.sphere(gl, program, 8, 16, { r: 1, g: 1, b: 1, a: 1 }, metal_sphere_mat);

	const sun_material = new Material(gl, '../assets/textures/grant.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0)
	const sun_mesh = UvMesh.sphere(
		gl, program, 16.0, 16,
		{ r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
		sun_material
	);

	const moon_material = new Material(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR, 0.25, 1.0, 2.0, 4.0)
	const moon_mesh = UvMesh.sphere(
		gl, program, 3.0, 16,
		{ r: 0.7, g: 0.7, b: 0.7, a: 1.0 },
		moon_material
	);

	const earth_material = new Material(gl, '../assets/textures/grant.png', gl.LINEAR_MIPMAP_LINEAR, 0.25, 1.0, 2.0, 4.0)
	const earth_mesh = UvMesh.sphere(
		gl, program, 8.0, 16,
		{ r: 0.88, g: 0.66, b: 0.37, a: 1.0 },
		earth_material
	);

	const controls = Controls.start_listening();

	const perspective = {
		fov: 0.25,
		aspectRatio: canvas.width / canvas.height,
		plane: { near: 0.1, far: 100 },
	}

	const root = new Node();
	const camera = new Node({ x: 0, y: 0, z: -25 });
	const texture_cube = new Node({ x: -4.5, y: 0, z: -10 }, undefined, undefined, cube_with_textures_mesh);
	const grant_cube = new Node({ x: 0, y: 0, z: -10 }, undefined, undefined, cube_with_grant_mesh);

	const ground = new Node({ x: 0, y: 0, z: 0 }, undefined, undefined, height_map)

	const metal_sphere = new Node({ x: 5, y: 0, z: -10 }, undefined, undefined, metal_sphere_mesh);

	const sun = new Node({ x: 6, y: 0, z: -10 }, undefined, undefined, sun_mesh);
	const earth = new Node({ x: 25, y: 2, z: 0 }, undefined, undefined, earth_mesh);
	const moon = new Node({ x: 10, y: 5, z: 0 }, undefined, undefined, moon_mesh);

	root.add_child(camera);
	root.add_child(ground);
	root.add_child(texture_cube);
	root.add_child(grant_cube);
	root.add_child(metal_sphere);

	// Mesh.from_obj_file(gl,'../assets/obj_files/teapot.obj',program,(m) => {const teapot = new Node(
	// 		{ x: 10, y: 0, z: -10 },
	// 		undefined,
	// 		undefined,
	// 		m);
	// 		root.add_child(teapot);}
	// );

	root.add_child(sun);
	sun.add_child(earth);
	earth.add_child(moon);

	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		perspective.aspectRatio = canvas.width / canvas.height;

		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	onResize();

	let previous = performance.now();
	const render = (now: number) => {
		let dt = (now - previous) / 1000;
		previous = now;

		sun.rotation.yaw += 0.05 * dt;
		earth.rotation.yaw += 0.5 * dt;
		moon.rotation.roll += 1.0 * dt;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		const projection = Mat4.perspective(
			perspective.fov,
			perspective.aspectRatio,
			perspective.plane.near,
			perspective.plane.far
		);

		const model = Mat4.identity();
		const view = camera.matrix().inverse();

		const view_no_trans = view.clone();
		view_no_trans.data[12] = 0.0;
		view_no_trans.data[13] = 0.0;
		view_no_trans.data[14] = 0.0;

		//Render skybox first
		gl.depthFunc(gl.LEQUAL);
		gl.depthMask(false);

		gl.useProgram(sky_prog);

		set_uniform_matrix4(gl, sky_prog, 'u_projection', projection.data);
		set_uniform_matrix4(gl, sky_prog, 'u_view', view_no_trans.data);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture);

		const skybox_location = gl.getUniformLocation(sky_prog, 'u_skybox');
		gl.uniform1i(skybox_location, 0);

		gl.bindVertexArray(sky_box_vao);
		gl.drawElements(gl.TRIANGLES, sky_box_indicies.length, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);

		gl.depthMask(true);
		gl.depthFunc(gl.LESS);

		//Render other objects
		gl.useProgram(program);

		set_uniform_matrix4(gl, program, 'projection', projection.data);
		set_uniform_matrix4(gl, program, 'view', view.data);
		set_uniform_matrix4(gl, program, 'model', model.data);

		set_uniform3fv(gl, program, 'sun.direction', [1.0, 0.0, 0.0]);
		set_uniform3fv(gl, program, 'sun.color', [1.0, 1.0, 1.0]);
		set_uniform3fv(gl, program, 'point_light.position', [-5.0, -5.0, -2.0]);
		set_uniform3fv(gl, program, 'point_light.color', [1.0, 0.0, 0.0]);

		set_uniform3fv(gl, program, 'cam_pos', Object.values(camera.position));

		let jobs: RenderMesh[] = [];
		generate_render_jobs(Mat4.identity(), root, jobs);

		for (let job of jobs) {
			set_uniform_matrix4(gl, program, 'model', job.matrix.data);
			job.mesh.render(gl);
		}

		window.requestAnimationFrame(render);
	}

	const keymap = new Map<string, (() => void)>([
		['KeyW', () => { camera.move_in_direction(0, 0, FLY_SPEED_PER_FRAME) }],
		['KeyA', () => { camera.move_in_direction(-FLY_SPEED_PER_FRAME, 0, 0) }],
		['KeyS', () => { camera.move_in_direction(0, 0, -FLY_SPEED_PER_FRAME) }],
		['KeyD', () => { camera.move_in_direction(FLY_SPEED_PER_FRAME, 0, 0) }],

		['Space', () => { camera.translate(0, FLY_SPEED_PER_FRAME, 0) }],
		['KeyC', () => { camera.translate(0, -FLY_SPEED_PER_FRAME, 0) }],

		['ArrowUp', () => { camera.add_pitch(-ROTATION_SPEED_PER_FRAME) }],
		['ArrowDown', () => { camera.add_pitch(ROTATION_SPEED_PER_FRAME) }],
		['ArrowLeft', () => { camera.add_yaw(-ROTATION_SPEED_PER_FRAME) }],
		['ArrowRight', () => { camera.add_yaw(ROTATION_SPEED_PER_FRAME) }],
	]);

	const update = () => {
		for (let key of controls.keys_down_list()) {
			let func = keymap.get(key);
			if (func !== undefined) {
				func();
			}
		}
	}


	window.addEventListener("resize", onResize)
	window.requestAnimationFrame(render);
	setInterval(update, DESIRED_MSPT);
}

main()
