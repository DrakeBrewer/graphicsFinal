import Vec4 from './vertex'

/**
 * Matrix with row-major layout:
 *  0       1       2       3
 *  4       5       6       7
 *  8       9       10      11
 *  12      13      14      15
 */
class Mat4 {
	data: number[];

	constructor(data?: number[] | null | undefined) {
		if (data == null) {
			this.data = [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1,
			];
		} else {
			this.data = data;
		}
	}

	static identity(): Mat4 {
		return new Mat4(null);
	}

	toString(): string {
		var str_vals = this.data.map(function(val) { return "" + val })
		var str =
			str_vals.slice(0, 4).join(' ') + '; ' +
			str_vals.slice(4, 8).join(' ') + '; ' +
			str_vals.slice(8, 12).join(' ') + '; ' +
			str_vals.slice(12, 16).join(' ');

		return '[' + str + ']';
	}

	/**
	 * Returns a rotation matrix in the XY plane, rotating by the given number of turns. 
	 * @param {number} turns amount to rotate by
	 * @returns {Mat4}  
	 */
	static rotation_xy(turns: number): Mat4 {
		const rot = turns * 2 * Math.PI;

		return new Mat4([
			Math.cos(rot), Math.sin(rot), 0, 0,
			-Math.sin(rot), Math.cos(rot), 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		])
	}

	/**
	 * Returns a rotation matrix in the XZ plane, rotating by the given number of turns
	 * @param {number} turns amount to rotate by
	 * @returns {Mat4}  
	 */
	static rotation_xz(turns: number): Mat4 {
		const rot = turns * 2 * Math.PI;

		return new Mat4([
			Math.cos(rot), 0, Math.sin(rot), 0,
			0, 1, 0, 0,
			-Math.sin(rot), 0, Math.cos(rot), 0,
			0, 0, 0, 1,
		])
	}

	/**
	 * Returns a rotation matrix in the YZ plane, rotating by the given number of turns
	 * @param {number} turns amount to rotate by
	 * @returns {Mat4}  
	 */
	static rotation_yz(turns: number): Mat4 {
		const rot = turns * 2 * Math.PI;

		return new Mat4([
			1, 0, 0, 0,
			0, Math.cos(rot), Math.sin(rot), 0,
			0, -Math.sin(rot), Math.cos(rot), 0,
			0, 0, 0, 1,
		])
	}

	static translation(dx: number, dy: number, dz: number): Mat4 {
		return new Mat4([
			1, 0, 0, dx,
			0, 1, 0, dy,
			0, 0, 1, dz,
			0, 0, 0, 1,
		]);
	}

	static scale(sx: number, sy: number, sz: number): Mat4 {
		return new Mat4([
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1,
		]);
	}

	mul(right: Mat4): Mat4 {
		const res = new Array<number>(16).fill(0);

		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				let cell = 0
				for (let k = 0; k < 4; k++) {
					cell += (this.data[row * 4 + k] * right.data[k * 4 + col]);
				}

				res[row * 4 + col] = cell;
			}
		}

		return new Mat4(res)
	}

	// right multiply by column vector
	transform(x, y, z, w): Vec4 {
		return this.transform_vec(new Vec4(x, y, z, w));
	}

	transform_vec(vec: Vec4): Vec4 {
		const m = this.data;
		const x = vec.x, y = vec.y, z = vec.z, w = vec.w;

		const tx = m[0] * x + m[1] * y + m[2] * z + m[3] * w;   // row 0
		const ty = m[4] * x + m[5] * y + m[6] * z + m[7] * w;   // row 1
		const tz = m[8] * x + m[9] * y + m[10] * z + m[11] * w;   // row 2
		const tw = m[12] * x + m[13] * y + m[14] * z + m[15] * w;   // row 3

		return new Vec4(tx, ty, tz, tw);
	}


	rc(row: number, col: number): number {
		return this.data[row * 4 + col]
	}

	// inverting a 4x4 matrix is ugly, there are 16 determinants we 
	// need to calculate. Because it's such a pain, I looked it up:
	// https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
	// author: willnode
	inverse() {
		// var A2323 = m.m22 * m.m33 - m.m23 * m.m32 ;
		const A2323 = this.rc(2, 2) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 2);

		// var A1323 = m.m21 * m.m33 - m.m23 * m.m31 ;
		const A1323 = this.rc(2, 1) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 1);

		// var A1223 = m.m21 * m.m32 - m.m22 * m.m31 ;
		const A1223 = this.rc(2, 1) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 1);

		// var A0323 = m.m20 * m.m33 - m.m23 * m.m30 ;
		const A0323 = this.rc(2, 0) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 0);

		// var A0223 = m.m20 * m.m32 - m.m22 * m.m30 ;
		const A0223 = this.rc(2, 0) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 0);

		// var A0123 = m.m20 * m.m31 - m.m21 * m.m30 ;
		const A0123 = this.rc(2, 0) * this.rc(3, 1) - this.rc(2, 1) * this.rc(3, 0);

		// var A2313 = m.m12 * m.m33 - m.m13 * m.m32 ;
		const A2313 = this.rc(1, 2) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 2);

		// var A1313 = m.m11 * m.m33 - m.m13 * m.m31 ;
		const A1313 = this.rc(1, 1) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 1);

		// var A1213 = m.m11 * m.m32 - m.m12 * m.m31 ;
		const A1213 = this.rc(1, 1) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 1);

		// var A2312 = m.m12 * m.m23 - m.m13 * m.m22 ;
		const A2312 = this.rc(1, 2) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 2);

		// var A1312 = m.m11 * m.m23 - m.m13 * m.m21 ;
		const A1312 = this.rc(1, 1) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 1);

		// var A1212 = m.m11 * m.m22 - m.m12 * m.m21 ;
		const A1212 = this.rc(1, 1) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 1);

		// var A0313 = m.m10 * m.m33 - m.m13 * m.m30 ;
		const A0313 = this.rc(1, 0) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 0);

		// var A0213 = m.m10 * m.m32 - m.m12 * m.m30 ;
		const A0213 = this.rc(1, 0) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 0);

		// var A0312 = m.m10 * m.m23 - m.m13 * m.m20 ;
		const A0312 = this.rc(1, 0) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 0);

		// var A0212 = m.m10 * m.m22 - m.m12 * m.m20 ;
		const A0212 = this.rc(1, 0) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 0);

		// var A0113 = m.m10 * m.m31 - m.m11 * m.m30 ;
		const A0113 = this.rc(1, 0) * this.rc(3, 1) - this.rc(1, 1) * this.rc(3, 0);

		// var A0112 = m.m10 * m.m21 - m.m11 * m.m20 ;
		const A0112 = this.rc(1, 0) * this.rc(2, 1) - this.rc(1, 1) * this.rc(2, 0);


		const det =
			this.rc(0, 0) * (this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223) -
			this.rc(0, 1) * (this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223) +
			this.rc(0, 2) * (this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123) -
			this.rc(0, 3) * (this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123);

		const dr = 1.0 / det;

		return new Mat4([
			dr * (this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223),
			dr * -(this.rc(0, 1) * A2323 - this.rc(0, 2) * A1323 + this.rc(0, 3) * A1223),
			dr * (this.rc(0, 1) * A2313 - this.rc(0, 2) * A1313 + this.rc(0, 3) * A1213),
			dr * -(this.rc(0, 1) * A2312 - this.rc(0, 2) * A1312 + this.rc(0, 3) * A1212),

			dr * -(this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223),
			dr * (this.rc(0, 0) * A2323 - this.rc(0, 2) * A0323 + this.rc(0, 3) * A0223),
			dr * -(this.rc(0, 0) * A2313 - this.rc(0, 2) * A0313 + this.rc(0, 3) * A0213),
			dr * (this.rc(0, 0) * A2312 - this.rc(0, 2) * A0312 + this.rc(0, 3) * A0212),

			dr * (this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123),
			dr * -(this.rc(0, 0) * A1323 - this.rc(0, 1) * A0323 + this.rc(0, 3) * A0123),
			dr * (this.rc(0, 0) * A1313 - this.rc(0, 1) * A0313 + this.rc(0, 3) * A0113),
			dr * -(this.rc(0, 0) * A1312 - this.rc(0, 1) * A0312 + this.rc(0, 3) * A0112),

			dr * -(this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123),
			dr * (this.rc(0, 0) * A1223 - this.rc(0, 1) * A0223 + this.rc(0, 2) * A0123),
			dr * -(this.rc(0, 0) * A1213 - this.rc(0, 1) * A0213 + this.rc(0, 2) * A0113),
			dr * (this.rc(0, 0) * A1212 - this.rc(0, 1) * A0212 + this.rc(0, 2) * A0112),
		]);
	}

	static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number) {
		// these scalars will scale x,y values to the near plane
		let scale_x = 2 * near / (right - left);
		let scale_y = 2 * near / (top - bottom);

		// shift the eye depending on the right/left and top/bottom planes.
		// only really used for VR (left eye and right eye shifted differently).  
		let t_x = (right + left) / (right - left);
		let t_y = (top + bottom) / (top - bottom);

		// map z into the range [ -1, 1 ] linearly
		const linear_c2 = 1 / (far - near);
		const linear_c1 = near / (far - near);
		// remember that the w coordinate will always be 1 before being fed to the vertex shader.
		// therefore, anything we put in row 3, col 4 of the matrix will be added to the z.

		// map z into the range [ -1, 1], but with a non-linear ramp
		// see: https://learnopengl.com/Advanced-OpenGL/Depth-testing and
		// https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix and
		// http://learnwebgl.brown37.net/08_projections/projections_perspective.html
		// for more info. (note, I'm using left-handed coordinates. Some sources use right-handed).
		const nonlin_c2 = (far + near) / (far - near);
		const nonlin_c1 = 2 * far * near / (far - near);

		let c1 = nonlin_c1;
		let c2 = nonlin_c2;

		return new Mat4([
			scale_x, 0, t_x, 0,
			0, scale_y, t_y, 0,
			0, 0, c2, -c1,
			0, 0, 1, 0,
		]);
	}

	static perspective(fov: number, aspectRatio: number, near: number, far: number) {
		const rot = fov * 2 * Math.PI

		const top = Math.tan(rot / 2) * near;
		const bottom = -top;
		const right = top * aspectRatio;
		const left = -right;

		return Mat4.frustum(left, right, bottom, top, near, far);
	}

	clone() {
		let c = new Array(16);
		for (let i = 0; i < 16; i++) { c[i] = this.data[i]; }
		return new Mat4(c);
	}

	toString() {
		let pieces = ['['];

		for (let row = 0; row < 4; row++) {
			pieces.push('[');

			for (let col = 0; col < 4; col++) {
				let i = row * 4 + col;
				pieces.push(this.data[i]);
			}

			pieces.push(']')
		}

		pieces.push(']');

		return pieces.join(' ');
	}
}

export default Mat4;
