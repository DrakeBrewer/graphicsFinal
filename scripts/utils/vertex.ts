class Vec4 {
	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w ?? 0;
	}

	/**
	 * Returns the vector that is this vector scaled by the given scalar.
	 * @param {number} by the scalar to scale with 
	 * @returns {Vec4}
	 */
	scaled(scalar: number): Vec4 {
		return new Vec4(
			this.x * scalar,
			this.y * scalar,
			this.z * scalar,
			this.w * scalar,
		);
	}

	/**
	 * Returns the dot product between this vector and other
	 * @param {Vec4} other the other vector 
	 * @returns {number}
	 */
	dot(other: Vec4): number {
		// return the dot product 
		return (
			this.x * other.x +
			this.y * other.y +
			this.z * other.z +
			this.w * other.w
		);
	}

	/**
	 * Returns the length of this vector
	 * @returns {number}
	 */
	length(): number {
		// return the length
		return Math.hypot(this.x, this.y, this.z, this.w);
	}

	/**
	 * Returns a normalized version of this vector
	 * @returns {Vec4}
	 */
	norm(): Vec4 {
		// return the normalized vector
		const normalized = {
			x: this.x / this.length(),
			y: this.y / this.length(),
			z: this.z / this.length(),
			w: this.w / this.length()
		}

		return new Vec4(normalized.x, normalized.y, normalized.z, normalized.w);
	}

	/**
	 * Returns the vector sum between this and other.
	 * @param {Vec4} other 
	 */
	add(other: Vec4): Vec4 {
		// return the vector sum
		return new Vec4(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z,
			this.w + other.w
		);
	}

	sub(other: Vec4) {
		return this.add(other.scaled(-1));
	}

	cross(other: Vec4) {
		let x = this.y * other.z - this.z * other.y;
		let y = this.x * other.z - this.z * other.x;
		let z = this.x * other.y - this.y * other.x;

		return new Vec4(x, y, z, 0);
	}

	toString() {
		return ['[', this.x, this.y, this.z, this.w, ']'].join(' ');
	}
}

export default Vec4;
