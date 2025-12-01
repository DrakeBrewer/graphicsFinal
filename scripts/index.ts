import { Controls } from "./camera";
import { UvMesh } from "./mesh/uv.ts";
import Material from "./mesh/material";
import Node from "./sceneGraph";
import type { Color } from "./types";
import {
	DESIRED_MSPT,
	FLY_SPEED_PER_FRAME,
	MOUSE_SENSITIVITY,
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
import { AmbientLight, LightCollection, PointLight } from "./light.ts";

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
	const blank_mat = new Material(gl, '../assets/textures/white.png', gl.LINEAR_MIPMAP_LINEAR, 1, 1, 1, 1);

	const height_map = Mesh.from_heightmap(gl, program, hm, 0, 7.6, metal_scale_mat);
	const cube_with_textures_mesh = UvMesh.texture_box(gl, program, 4, 4, 4, { r: 1, g: 1, b: 1, a: 1 }, texture_map_mat);
	const cube_with_grant_mesh = UvMesh.box(gl, program, 3, 3, 3, { r: 0, g: 0, b: 255, a: 1 }, blank_mat);
	const metal_sphere_mesh = UvMesh.sphere(gl, program, 8, 16, { r: 1, g: 1, b: 1, a: 1 }, metal_sphere_mat);
	const triangle_mesh = UvMesh.triangle(gl, program, { r: 1, g: 1, b: 1, a: 1 }, 5, blank_mat);
	const rectangle_mesh = UvMesh.rectangle(gl, program, { r: 1, g: 1, b: 1, a: 1 }, 5, blank_mat);

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

	// Building material with uvImage_1 texture
	const building_material = new Material(gl, '../assets/textures/uvImage_1.jpg', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.2, 1.5, 32.0);

	// Create materials for different parts of the building using different regions of uvImage_1
	const wood_paneling_material = new Material(gl, '../assets/textures/uvImage_1.jpg', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.3, 1.8, 16.0);
	const tile_floor_material = new Material(gl, '../assets/textures/uvImage_1.jpg', gl.LINEAR_MIPMAP_LINEAR, 0.8, 0.4, 1.2, 8.0);
	const interior_material = new Material(gl, '../assets/textures/uvImage_1.jpg', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.1, 2.0, 16.0);

	const light_collection = new LightCollection();
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

	const metal_sphere = new Node({ x: -9, y: 0, z: -10 }, undefined, undefined, metal_sphere_mesh);

	//const triangle_first = new Node({x:-15,y:0,z:-10},undefined,undefined,triangle_mesh);

	const triangle = new Node({ x: 0, y: 10, z: -10 }, undefined, undefined, triangle_mesh);
	triangle.rotation.yaw = Math.PI * 2;

	const triangle_anim = new Node({ x: 0, y: 15, z: -10 }, undefined, undefined, triangle_mesh);

	const rect = new Node({ x: -9, y: 10, z: -10 }, undefined, undefined, rectangle_mesh);
	rect.rotation.yaw = -Math.PI / 1.9;

	const light_pivot = new Node({ x: 0, y: 0, z: 0 });

	let building_walls: Node | null = null;
	let building_floors: Node | null = null;
	let teapot: Node | null = null;

	root.add_child(camera);
	
	root.add_child(ground);
	root.add_child(texture_cube);
	root.add_child(grant_cube);
	root.add_child(metal_sphere);
	root.add_child(triangle);
	root.add_child(triangle_anim);
	root.add_child(rect);

	//root.add_child(triangle_first);

	metal_sphere.add_child(light_pivot);

	const red_light = new PointLight(
		{ x: 0, y: 0, z: 0 },
		{ r: 2.0, g: 0.0, b: 0.0 }
	);

	const blue_light = new PointLight(
		{ x: 0, y: 0, z: 0 },
		{ r: 0.0, g: 0.0, b: 2.0 }
	);

	const red_light_node = new Node(
		{ x: 8, y: 0, z: 0 },
		undefined,
		undefined,
		null,
		red_light
	);

	const blue_light_node = new Node(
		{ x: -8, y: 0, z: 0 },
		undefined,
		undefined,
		null,
		blue_light
	);

	metal_sphere.add_child(light_pivot);
	light_pivot.add_child(red_light_node);
	light_pivot.add_child(blue_light_node);

	const ambient_sun = new AmbientLight({ x: 1.0, y: 1.0, z: 1.0 }, { r: 1.0, g: 1.0, b: 1.0 });
	light_collection.set_ambient(ambient_sun)

	// Load building with material separation
	console.log("About to load building OBJ file...");
	console.log("File path: '../assets/obj_files/lessCoolBuilding.obj'");
	
	// Try simpler OBJ loading first
	UvMesh.uv_from_obj_file(gl, '../assets/obj_files/lessCoolBuilding.obj', program, metal_scale_mat, (building_mesh) => {
		console.log("Simple OBJ loaded! Creating building node...");
		console.log("Building mesh:", building_mesh);
		
		const building = new Node(
			{ x: 0, y: 0, z: -10 },
			undefined,
			undefined,
			building_mesh);
		root.add_child(building);
		
		console.log("Building node created and added to scene!");
		console.log(`Building position: x=0, y=0, z=-10`);
	});
	
	

	UvMesh.uv_from_obj_file(gl, '../assets/obj_files/teapot.obj', program, blank_mat, (m) => {
		teapot = new Node(
			{ x: 15, y: 0, z: -10 },
			undefined,
			undefined,
			m);
		root.add_child(teapot);
	}
	);


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

		light_pivot.rotation.yaw += 0.25 * dt;   // Orbit around sphere

		const spin_xy = 0.25;
		const spin_xz = 0.5;
		const spin_yz = 0.05;

		triangle_anim.rotation.roll += spin_xy * dt;
		triangle_anim.rotation.yaw += spin_xz * dt;
		triangle_anim.rotation.pitch += spin_yz * dt;

		if (teapot !== null) {
			teapot.rotation.yaw += spin_xy * dt;
		}

		// Building doesn't rotate - it stays stationary

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

		light_collection.collect(root, Mat4.identity());
		light_collection.bind_lights(gl, program);

		set_uniform_matrix4(gl, program, 'projection', projection.data);
		set_uniform_matrix4(gl, program, 'view', view.data);
		set_uniform_matrix4(gl, program, 'model', model.data);

		set_uniform3fv(gl, program, 'cam_pos', Object.values(camera.position));

		let jobs: RenderMesh[] = [];
		generate_render_jobs(Mat4.identity(), root, jobs);

		for (let job of jobs) {
			set_uniform_matrix4(gl, program, 'model', job.matrix.data);
			job.mesh.render(gl);
		}

		// Handle mouse updates in render loop for smooth turning
		const mouseDelta = controls.get_mouse_delta();
		if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
			camera.add_yaw(mouseDelta.x * MOUSE_SENSITIVITY * dt);
			camera.add_pitch(-mouseDelta.y * MOUSE_SENSITIVITY * dt);
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
