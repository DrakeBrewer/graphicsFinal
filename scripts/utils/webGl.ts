import { Shader } from "../shader.ts"
import type { Color } from "../types.ts";

/** 
 * Creates a new vertex buffer and loads it full of the given data.
 * Preserves bound buffer.
*/
export function create_and_load_vertex_buffer(gl: WebGLRenderingContext, data: number[], usage: GLint) {
	let current_array_buf = gl.getParameter(gl.ARRAY_BUFFER_BINDING);

	let buf_id = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_id);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);

	gl.bindBuffer(gl.ARRAY_BUFFER, current_array_buf);

	return buf_id;
}

/** 
 * Creates a new element buffer and loads it full of the given data.
 * Preserves bound buffer.
*/
export function create_and_load_elements_buffer(gl: WebGLRenderingContext, data: number[], usage: GLint) {
	let current_array_buf = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

	let buf_id = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_id);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), usage);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, current_array_buf);

	return buf_id;
}

/**
 * Ensures a the shader has been compiled correctly
 */
export function assert_shader_compiled_correctly(gl: WebGLRenderingContext, shader_id: WebGLShader) {
	if (!gl.getShaderParameter(shader_id, gl.COMPILE_STATUS)) {
		let err = gl.getShaderInfoLog(shader_id);
		let shader_kind = gl.getShaderParameter(shader_id, gl.SHADER_TYPE);
		let shader_kind_name =
			shader_kind == gl.VERTEX_SHADER ? 'vertex shader' :
				shader_kind == gl.FRAGMENT_SHADER ? 'fragment shader' :
					'unknown shader';

		throw new Error('Compile error in ' + shader_kind_name + ':\n' + err);
	}

	return true;
}

/**
 * Creates a new shader program, creates and attaches vertex and fragment shaders 
 * from the given sources, links the resulting program, and returns it. 
 */
export async function create_compile_and_link_program(gl: WebGLRenderingContext, v_shader_src: string, f_shader_src: string) {
	const [v_shader, f_shader] = await Promise.all([
		new Shader(gl).load_and_compile(v_shader_src, gl.VERTEX_SHADER),
		new Shader(gl).load_and_compile(f_shader_src, gl.FRAGMENT_SHADER)
	])

	let program = gl.createProgram()
	gl.attachShader(program, v_shader);
	gl.attachShader(program, f_shader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		let err = gl.getProgramInfoLog(program);
		throw new Error('Link error in shader program:\n' + err);
	}

	return program;
}

/**
 * deletes a program and it's attached shaders
 */
export function delete_program_and_attached_shaders(gl: WebGLRenderingContext, program: WebGLProgram) {
	let shaders = gl.getAttachedShaders(program);
	if (shaders === null) {
		throw new Error("Failed to get attached shaders while cleaning up")
	}

	gl.deleteProgram(program);
	for (let shader in shaders) {
		gl.deleteShader(shader)
	}
}

/**
 * Sets the buffer for a given vertex attribute name. 
 */
export function set_vertex_attrib_to_buffer(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	attrib_name: string,
	buffer: WebGLBuffer,
	n_components: number,
	gl_type: number,
	normalize: boolean,
	stride: number,
	offset: number
) {
	let attr_loc = gl.getAttribLocation(program, attrib_name);

	if (attr_loc == - 1) {
		throw new Error('either no attribute named "' + attrib_name +
			'" in program or attribute name is reserved/built-in.')
	}

	// Ignoring this for now. It doesn't play nice with my class and I will fix it later :)
	let err = gl.getError()
	if (err != 0) {
		throw new Error('invalid program. Error: ' + err);
	}

	let current_array_buf = gl.getParameter(gl.ARRAY_BUFFER_BINDING);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(attr_loc);
	gl.vertexAttribPointer(attr_loc, n_components, gl_type, normalize, stride, offset);
	//gl.enableVertexAttribArray( attr_loc );

	gl.bindBuffer(gl.ARRAY_BUFFER, current_array_buf);
}

/**
 * Set global parameters such as "clear color". 
 */
export function set_render_params(gl: WebGLRenderingContext, bg_color: Color) {
	// gl.clearColor( 0.0, 0.0, 0.0, 1 );
	gl.clearColor(bg_color.red, bg_color.green, bg_color.blue, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);

	gl.depthMask(true);
	gl.depthFunc(gl.LEQUAL);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	// gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );
}

/**
 * Sets uniform data for a vector3
 */
export function set_uniform3fv(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	name: string,
	data: number[]
) {
	const loc = gl.getUniformLocation(program, name);
	gl.uniform3fv(loc, data);
}

/**
 * Sets uniform data for a row-major matrix4
 */
export function set_uniform_matrix4(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	name: string,
	data: number[]
) {
	// let old_prog = gl.getParameter(gl.CURRENT_PROGRAM);
	// gl.useProgram(program);

	const loc = gl.getUniformLocation(program, name);
	gl.uniformMatrix4fv(loc, true, data);

	// gl.useProgram(old_prog);
}

export function set_uniform_scalar(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	name: string,
	value: number,
) {
	const loc = gl.getUniformLocation(program, name);
	gl.uniform1f(loc, value);
}

export function bind_texture_samplers(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	name: string,
) {
	const loc = gl.getUniformLocation(program, name);
	gl.uniform1i(loc, 0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
}
