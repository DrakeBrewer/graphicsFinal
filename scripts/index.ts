import Camera, { Controls } from "./camera";
import { Mesh, UvMesh, type Material } from "./mesh";
import Node from "./sceneGraph";
import { Texture } from "./texture";
import type { Color } from "./types";
import Mat4 from "./utils/matrix";
import {
	set_render_params,
	create_compile_and_link_program,
	set_uniform_matrix4,
	set_uniform3fv
} from "./utils/webGl";

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

	// const root = new Node();
	// const sun = new Node();
	// const earth = new Node({ x: 100, y: 5, z: 0 });
	// const moon = new Node({ x: 25, y: 5, z: 0 });

	// root.add_child(sun);
	// sun.add_child(earth);
	// earth.add_child(moon);

	const texture = new Texture(gl, '../assets/textures/metal_scale.png', gl.LINEAR_MIPMAP_LINEAR);
	const material: Material = { ambient: 0.25, diffuse: 1.0, specular: 2.0, shininess: 4.0 };
	const sphere = UvMesh.sphere(
		gl, program, 16.0, 16,
		{ r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
		texture, material
	);

	const controls = Controls.start_listening();
	const camera = new Camera();
	camera.translate(0, 0, -10);

	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	onResize();

	const perspective = {
		fov: 0.25,
		aspectRatio: canvas.width / canvas.height,
		plane: { near: 0.1, far: 100 },
	}

	let previous = performance.now();
	const render = (now: number) => {
		let dt = (now - previous) / 1000;
		previous = now;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		const projection = Mat4.perspective(
			perspective.fov,
			perspective.aspectRatio,
			perspective.plane.near,
			perspective.plane.far
		);

		const model = Mat4.identity();
		const view = camera.get_view_matrix();

		set_uniform_matrix4(gl, program, 'projection', projection.data)
		set_uniform_matrix4(gl, program, 'view', view.data)
		set_uniform_matrix4(gl, program, 'model', model.data)

		set_uniform3fv(gl, program, 'sun.direction', [1.0, 0.0, 0.0])
		set_uniform3fv(gl, program, 'sun.color', [1.0, 1.0, 1.0])
		set_uniform3fv(gl, program, 'point_light.position', [-5.0, -5.0, -2.0])
		set_uniform3fv(gl, program, 'point_light.color', [1.0, 0.0, 0.0])

		set_uniform3fv(gl, program, 'cam_pos', Object.values(camera.position))

		sphere.render(gl);

		window.requestAnimationFrame(render);
	}


	window.addEventListener("resize", onResize)
	window.requestAnimationFrame(render);
}

main()
