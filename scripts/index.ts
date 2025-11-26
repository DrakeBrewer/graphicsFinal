import { Mesh } from "./mesh";
import Node from "./sceneGraph";
import type { Color } from "./types";
import Mat4 from "./utils/matrix";
import {
	set_render_params,
	create_compile_and_link_program,
	set_uniform_matrix4
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
		red: 0.5,
		green: 0.5,
		blue: 0.5,
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

	const sphere = Mesh.sphere(gl, program, 2, 16, { R: 1.0, G: 0.5, B: 0.0, A: 1.0 })

	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	onResize();

	let previous = performance.now();
	const render = (now: number) => {
		let dt = (now - previous) / 1000;
		previous = now;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// TODO: fix aspect ratio among other things
		let model = Mat4.identity();
		set_uniform_matrix4(gl, program, "modelview", model.data);

		sphere.render(gl)

		window.requestAnimationFrame(render);
	}


	window.addEventListener("resize", onResize)
	window.requestAnimationFrame(render);
}

main()
