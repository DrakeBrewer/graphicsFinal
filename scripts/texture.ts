export class Texture {
	tex: WebGLTexture;
	image_url: HTMLImageElement;
	blend_mode: GLint;
	loaded: boolean;

	constructor(gl: WebGLRenderingContext, image_url: string, blend_mode: GLint) {
		this.tex = gl.createTexture();
		this.blend_mode = blend_mode;
		this.loaded = false;

		const old_tex_binding = gl.getParameter(gl.TEXTURE_BINDING_2D);
		this.bind(gl);

		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA,
			256, 256, 0,
			gl.RGBA, gl.UNSIGNED_BYTE,
			Texture.xor_texture(256)
		);
		gl.generateMipmap(gl.TEXTURE_2D);

		if (old_tex_binding === null) {
			gl.bindTexture(gl.TEXTURE_2D, old_tex_binding);
		}

		if (image_url == 'xor') {
			return;
		}

		let image = new Image();
		let _tex = this; // inside an anomymous function, 'this' refers to the function.
		// so we create an alias to the material we're creating.

		// the image has to be loaded before we can load the pixel data
		image.onload = () => {

			const old_tex_binding = gl.getParameter(gl.TEXTURE_BINDING_2D);
			_tex.bind(gl);

			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA,
				gl.RGBA, gl.UNSIGNED_BYTE, image
			);

			// @ts-ignore
			_tex.width = image.width;
			// @ts-ignore
			_tex.height = image.height;

			gl.generateMipmap(gl.TEXTURE_2D);

			let err = gl.getError();
			if (err != 0) {
				gl.getError(); //clear potential 2nd error.
				throw new Error('Error generating mipmap: ' + err);
			}

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, blend_mode);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			err = gl.getError();
			if (err != 0) {
				gl.getError(); //clear potential 2nd error.
				throw new Error('Error setting texture parameters: ' + err);
			}

			console.log('loaded texture: ', image.src);

			// we might want to keep track of this later
			_tex.loaded = true;

			if (old_tex_binding === null) {
				gl.bindTexture(gl.TEXTURE_2D, old_tex_binding);
			}
		};

		image.src = image_url;
	}

	bind(gl: WebGLRenderingContext) {
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
	}

	static xor_texture(width: number) {
		let data = new Array(width * width * 4);

		for (let row = 0; row < width; row++) {
			for (let col = 0; col < width; col++) {
				let pix = (row * width + col) * 4;
				data[pix] = data[pix + 1] = data[pix + 2] = row ^ col; // r, g, and b are the same
				data[pix + 3] = 255; // alpha is always max (fully opaque)
			}
		}

		return new Uint8Array(data);
	}
}
