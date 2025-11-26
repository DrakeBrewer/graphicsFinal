import { assert_shader_compiled_correctly } from './utils/webGl.ts'

// TODO: make this more robust
export class Shader {
	gl: WebGLRenderingContext;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	async load(url: string) {
		try {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Fetch error: ${res.status}, ${res.statusText}`);
			}

			return res.text();
		} catch (err) {
			throw new Error(`Failed to fetch shader: ${err}`);
		}
	}

	compile(source: string, type: GLenum) {
		const shader = this.gl.createShader(type);
		if (shader === null) {
			throw new Error("Failed to create vertex shader")
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		assert_shader_compiled_correctly(this.gl, shader);

		return shader;
	}

	async load_and_compile(url: string, type: GLenum) {
		const shader = await this.load(url);
		return this.compile(shader as string, type);
	}
}
