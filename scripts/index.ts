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
		[1, 2, 3, 2, 1],
		[2, 4, 6, 4, 2],
		[3, 6, 4, 6, 3],
		[2, 4, 6, 4, 2],
		[1, 2, 3, 2, 1],
	];

	const texture_map_mat = new Material(gl, '../assets/textures/texture_map.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0);
	const metal_scale_mat = new Material(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0)
	const metal_sphere_mat = new Material(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR, 0.25, 1.0, 2.0, 4.0)
	const blank_mat = new Material(gl, '../assets/textures/white.png', gl.LINEAR_MIPMAP_LINEAR, 1, 1, 1, 1);
	const robo_mat = new Material(gl, '../assets/textures/robot.png', gl.LINEAR_MIPMAP_LINEAR, 1, 1, 1, 1);
	const sun_material = new Material(gl, '../assets/textures/grant.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0)
	const water_mat = new Material(gl,'../assets/textures/blue_water.png',gl.LINEAR_MIPMAP_LINEAR,1.0,0.0,2.0,9.0);

	const height_map = Mesh.from_heightmap(gl, program, hm, 0, 7.6, metal_scale_mat);
	const cube_with_textures_mesh = UvMesh.texture_box(gl, program, 4, 4, 4, { r: 1, g: 1, b: 1, a: 1 }, texture_map_mat);
	const cube_with_grant_mesh = UvMesh.box(gl, program, 3, 3, 3, { r: 1, g: 1, b: 1, a: 1 }, sun_material);
	const metal_sphere_mesh = UvMesh.sphere(gl, program, 8, 16, { r: 1, g: 1, b: 1, a: 1 }, metal_sphere_mat);
	const triangle_mesh = UvMesh.triangle(gl, program, { r: 1, g: 1, b: 1, a: 1 }, blank_mat);
	const rectangle_mesh = UvMesh.rectangle(gl, program, { r: 1, g: 1, b: 1, a: 1 }, 5, blank_mat);
	const robot_mesh = UvMesh.texture_box(gl, program, 3, 3, 3, { r: 1, g: 1, b: 1, a: 1 }, robo_mat);


	//const sun_material = new Material(gl, '../assets/textures/grant.png', gl.LINEAR_MIPMAP_LINEAR, 1.0, 0.0, 2.0, 9.0)

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
	const museum = new Node();
	const camera = new Node({ x: 0, y: 0, z: -25 });
	root.add_child(camera);

	const white_light = new PointLight(
		{ x: 0, y: 0, z: 0 },
		{ r: 1, g: 1, b: 1 }
	);


	const grant_cube = new Node({ x: -11.75, y: 0, z: -10 }, undefined, undefined, cube_with_grant_mesh);
	const top_light0 = new Node({ x: -11.75, y: 5, z: -10 }, undefined, undefined, null, white_light);
	museum.add_child(top_light0);

	const texture_cube = new Node({ x: -11.75, y: 0, z: -40 }, undefined, undefined, cube_with_textures_mesh);
	const top_light1 = new Node({ x: -11.75, y: 5, z: -40 }, undefined, undefined, null, white_light);
	museum.add_child(top_light1);

	const ground = new Node({ x: -22.75, y: -3, z: -10 }, undefined, { x: 0.5, y: 0.5, z: 0.5 }, height_map)
	const top_light2 = new Node({ x: -22.75, y: 5, z: -10 }, undefined, undefined, null, white_light);
	museum.add_child(top_light2);

	const metal_sphere = new Node({ x: -22.75, y: 0, z: -40 }, undefined, undefined, metal_sphere_mesh);
	const top_light3 = new Node({ x: -22.75, y: 5, z: -40 }, undefined, undefined, null, white_light);
	museum.add_child(top_light3);

	const triangle = new Node({ x: 0, y: 0, z: -10 }, undefined, { x: 4, y: 4, z: 4 }, triangle_mesh);
	//triangle.rotation.yaw = Math.PI * 2;
	const top_light4 = new Node({ x: 0, y: 5, z: -10 }, undefined, undefined, null, white_light);
	museum.add_child(top_light4);

	const triangle_anim = new Node({ x: 0, y: 1, z: -40 }, undefined, { x: 7, y: 7, z: 7 }, triangle_mesh);
	const top_light5 = new Node({ x: 0, y: 5, z: -40 }, undefined, undefined, null, white_light);
	museum.add_child(top_light5);

	const rect = new Node({ x: 12, y: 0, z: -10 }, undefined, undefined, rectangle_mesh);
	//rect.rotation.yaw = -Math.PI / 1.9;
	const top_light6 = new Node({ x: 11, y: 5, z: -10 }, undefined, undefined, null, white_light);
	museum.add_child(top_light6);

	const light_pivot = new Node({ x: 0, y: 0, z: 0 });

	let building_walls: Node | null = null;
	let building_floors: Node | null = null;
	let teapot: Node | null = null;
	let cow: Node | null = null;

	root.add_child(camera);
	
	root.add_child(ground);
	root.add_child(texture_cube);
	root.add_child(grant_cube);
	root.add_child(metal_sphere);
	root.add_child(triangle);
	root.add_child(triangle_anim);
	root.add_child(rect);

	const torso_mesh = UvMesh.box(gl, program, 2.5, 4, 2, { r: 0, g: 0, b: 255, a: 1 }, blank_mat);
	const torso_mesh_bottom = UvMesh.box(gl, program, 2.5, 4, 2, { r: 0, g: 0, b: 0, a: 1 }, blank_mat);
	const sphere_mesh = UvMesh.sphere(gl, program, 5, 16, { r: 1, g: 1, b: 1, a: 1 }, sun_material);
	const cube_mesh = UvMesh.box(gl, program, 2, 2, 2, { r: 1, g: 1, b: 1, a: 1 }, blank_mat);

	const robot = new Node({ x: 23.5, y: 0, z: -10 });
	const torso = new Node({ x: 0, y: 0, z: 0 }, undefined, { x: 1, y: 1, z: 1 }, torso_mesh);
	const torso_bottom = new Node({ x: 0, y: -2.2, z: 0 }, undefined, { x: 1, y: 0.1, z: 1 }, torso_mesh_bottom);
	const head = new Node({ x: 0, y: 3.0, z: 0 }, undefined, { x: 0.6, y: 0.6, z: 0.6 }, sphere_mesh);
	const helmet = new Node({ x: 0, y: 0, z: 0 }, undefined, undefined, robot_mesh);

	const left_shoulder = new Node({ x: -1.75, y: 1.25, z: 0 }, undefined, { x: 0.3, y: 0.3, z: 0.3 }, cube_mesh);
	const right_shoulder = new Node({ x: 1.75, y: 1.25, z: 0 }, undefined, { x: 0.3, y: 0.3, z: 0.3 }, cube_mesh);
	const left_arm = new Node({ x: 0, y: -3.5, z: 0 }, undefined, { x: 0.3, y: 2.5, z: 0.3 }, cube_mesh);
	const right_arm = new Node({ x: 0, y: -3.5, z: 0 }, undefined, { x: 0.3, y: 2.5, z: 0.3 }, cube_mesh);

	const left_hip = new Node({ x: -0.75, y: -4.0, z: 0 }, undefined, undefined, undefined);
	const right_hip = new Node({ x: 0.75, y: -4.0, z: 0 }, undefined, undefined, undefined);

	const left_leg = new Node({ x: 0, y: -2.0, z: 0 }, undefined, { x: 0.4, y: 2.0, z: 0.3 }, cube_mesh);
	const right_leg = new Node({ x: 0, y: -2.0, z: 0 }, undefined, { x: 0.4, y: 2.0, z: 0.3 }, cube_mesh);

	robot.add_child(torso);
	robot.add_child(torso_bottom);
	robot.add_child(head);
	head.add_child(helmet);
	torso.add_child(left_shoulder);
	torso.add_child(right_shoulder);
	torso_bottom.add_child(left_hip);
	torso_bottom.add_child(right_hip);
	left_hip.add_child(left_leg);
	right_hip.add_child(right_leg);
	left_shoulder.add_child(left_arm);
	right_shoulder.add_child(right_arm);

	museum.add_child(robot);
	museum.add_child(ground);
	museum.add_child(texture_cube);
	museum.add_child(grant_cube);

	museum.add_child(metal_sphere);
	metal_sphere.add_child(light_pivot);

	museum.add_child(triangle);
	museum.add_child(triangle_anim);
	museum.add_child(rect);

	const red_light = new PointLight(
		{ x: 0, y: 0, z: 0 },
		{ r: 1.0, g: 0.0, b: 0.0 }
	);

	const blue_light = new PointLight(
		{ x: 0, y: 0, z: 0 },
		{ r: 0.9, g: 3, b: 3 }
	);

	const red_light_node = new Node(
		{ x: 3, y: -2.0, z: -2.0 },
		undefined,
		undefined,
		null,
		red_light
	);

	const blue_light_node = new Node(
		{ x: 0, y: 0, z: -2 },
		undefined,
		undefined,
		null,
		blue_light
	);

	metal_sphere.add_child(light_pivot);
	light_pivot.add_child(red_light_node);
	helmet.add_child(blue_light_node);

	const ambient_sun = new AmbientLight({ x: 0, y: -10, z: -15 }, { r: 1, g: 1, b: 1 });
	//light_collection.set_ambient(ambient_sun)

	// Load building with material separation
	console.log("About to load building OBJ file...");
	console.log("File path: '../assets/obj_files/lessCoolBuilding.obj'");
	
	// Try simpler OBJ loading first
	UvMesh.uv_from_obj_file(gl, '../assets/obj_files/lessCoolBuilding.obj', program, interior_material, (building_mesh) => {
		console.log("Simple OBJ loaded! Creating building node...");
		console.log("Building mesh:", building_mesh);
		
		const building = new Node(
			{ x: 0, y: -5, z: -25 },
			undefined,
			{x:4,y:4,z:4},
			building_mesh);
		museum.add_child(building);
		
		console.log("Building node created and added to scene!");
		console.log(`Building position: x=0, y=0, z=-10`);
	});
	
	

	// let building: Node | null = null;
	// UvMesh.uv_from_obj_file(gl, '../assets/obj_files/lessCoolBuilding.obj', program, blank_mat, (m) => {
	// 	building = new Node(
	// 		{ x: 0, y: 0, z: 0 },
	// 		undefined,
	// 		undefined,
	// 		m);
	// 	root.add_child(building);
	// });

	UvMesh.uv_from_obj_file(gl, '../assets/obj_files/teapot.obj', program, metal_scale_mat, (m) => {
		teapot = new Node(
			{ x: 12, y: -2, z: -40 },
			undefined,
			undefined,
			m);
		museum.add_child(teapot);
	});
	const top_light7 = new Node({ x: 10, y: 5, z: -10 }, undefined, undefined, null, white_light);
	// museum.add_child(top_light7);

	UvMesh.uv_from_obj_file(gl, '../assets/obj_files/cow.obj', program, water_mat, (m) => {
		teapot = new Node(
			{ x: 22, y: 2, z: -40 },
			undefined,
			undefined,
			m);
		museum.add_child(teapot);
	});

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

		head.rotation.yaw = Math.sin(now * 0.001) * 0.1;
		torso.rotation.yaw = Math.sin(now * 0.002) * 0.1;
		torso_bottom.rotation.yaw = Math.sin(now * 0.002) * 0.1;
		left_shoulder.rotation.pitch = Math.sin(now * 0.002) * 0.1;
		right_shoulder.rotation.pitch = -Math.sin(now * 0.002) * 0.1;

		left_hip.rotation.pitch = Math.sin(now * 0.002) * 0.1;
		right_hip.rotation.pitch = -Math.sin(now * 0.002) * 0.1;
		light_pivot.rotation.yaw += 0.25 * dt;   // Orbit around sphere

		const spin_xy = 0.25;
		const spin_xz = 0.5;
		const spin_yz = 0.05;

		grant_cube.rotation.yaw += spin_xy *dt;
		grant_cube.rotation.roll += spin_xy * dt;
		texture_cube.rotation.yaw += spin_xy *dt;
		texture_cube.rotation.roll += spin_xy * dt;

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

		light_collection.collect(museum, Mat4.identity());
		light_collection.bind_lights(gl, program);

		set_uniform_matrix4(gl, program, 'projection', projection.data);
		set_uniform_matrix4(gl, program, 'view', view.data);
		set_uniform_matrix4(gl, program, 'model', model.data);

		set_uniform3fv(gl, program, 'cam_pos', Object.values(camera.position));

		let jobs: RenderMesh[] = [];
		generate_render_jobs(Mat4.identity(), museum, jobs);

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
