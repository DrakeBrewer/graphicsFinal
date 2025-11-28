import Camera, { Controls } from "./camera";
import { Mesh,UvMesh, type Material } from "./mesh";
import Node from "./sceneGraph";
import { Texture } from "./texture";
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
	set_uniform3fv
} from "./utils/webGl";
import { generate_render_jobs, RenderMesh } from "./rendering/mesh"

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
if (!canvas) {
	throw new Error("Error: you forgot the canvas");
}

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

	const vertex_src = "../assets/shaders/vertex.glsl"
	const fragment_src = "../assets/shaders/fragment.glsl"
	const program = await create_compile_and_link_program(gl, vertex_src, fragment_src);
	gl.useProgram(program);

	const grant_texture = new Texture(gl, '../assets/textures/grant.png', gl.LINEAR_MIPMAP_LINEAR);
	const cube_texture = new Texture(gl, '../assets/textures/texture_map.png', gl.LINEAR_MIPMAP_LINEAR);
	const metal_texture = new Texture(gl, '../assets/textures/metal_scale.png',gl.LINEAR_MIPMAP_LINEAR);

	const cube_material: Material = {ambient:1.0, diffuse:0.0, specular:2.0,shininess:9.0};
	const cube_with_textures_mesh = UvMesh.texture_box(gl,program, 3,3,3,cube_texture,cube_material);
	const cube_with_grant_mesh = UvMesh.box(gl,program,3,3,3,grant_texture,cube_material);

	const metal_sphere_material: Material = {ambient:0.25, diffuse:1.0, specular: 2.0, shininess: 4.0};
	const metal_sphere_mesh = UvMesh.sphere(gl,program,8,16,{r:1,g:1,b:1,a:1},metal_texture,metal_sphere_material);

	//const teapot_material: Material = {}


	const sun_material: Material = { ambient: 1.0, diffuse: 0.0, specular: 2.0, shininess: 9.0 };
	const sun_mesh = UvMesh.sphere(
		gl, program, 16.0, 16,
		{ r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
		grant_texture, sun_material
	);

	const moon_material: Material = { ambient: 0.25, diffuse: 1.0, specular: 2.0, shininess: 4.0 };
	const moon_mesh = UvMesh.sphere(
		gl, program, 3.0, 16,
		{ r: 0.7, g: 0.7, b: 0.7, a: 1.0 },
		grant_texture, moon_material
	);

	const earth_material: Material = { ambient: 0.25, diffuse: 1.0, specular: 2.0, shininess: 4.0 };
	const earth_mesh = UvMesh.sphere(
		gl, program, 8.0, 16,
		{ r: 0.88, g: 0.66, b: 0.37, a: 1.0 },
		grant_texture, earth_material
	);

	const controls = Controls.start_listening();

	const perspective = {
		fov: 0.25,
		aspectRatio: canvas.width / canvas.height,
		plane: { near: 0.1, far: 100 },
	}

	const root = new Node();
	const camera = new Node({ x: 0, y: 0, z: -25 });
	const texture_cube = new Node({x:-4.5,y:0,z:-10},undefined,undefined,cube_with_textures_mesh);
	const grant_cube = new Node({x:0, y:0, z:-10 },undefined,undefined,cube_with_grant_mesh);

	const metal_sphere = new Node({x:5,y:0,z:-10},undefined,undefined,metal_sphere_mesh);


	//const sun = new Node({x:6,y:0,z:-10}, undefined, undefined, sun_mesh);
	//const earth = new Node({ x: 25, y: 2, z: 0 }, undefined, undefined, earth_mesh);
	//const moon = new Node({ x: 10, y: 5, z: 0 }, undefined, undefined, moon_mesh);

	root.add_child(camera);
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


	//root.add_child(sun);
	//sun.add_child(earth);
	//earth.add_child(moon);

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

		//sun.rotation.yaw += 0.05 * dt;
		//earth.rotation.yaw += 0.5 * dt;
		//moon.rotation.roll += 1.0 * dt;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		const projection = Mat4.perspective(
			perspective.fov,
			perspective.aspectRatio,
			perspective.plane.near,
			perspective.plane.far
		);

		const model = Mat4.identity();
		const view = camera.matrix().inverse();

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
