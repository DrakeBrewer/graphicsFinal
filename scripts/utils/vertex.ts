class Vec4 {
	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number, y: number, z: number, w?: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w ?? 0;
	}

	scaled(scalar: number): Vec4 {
		return new Vec4(
			this.x * scalar,
			this.y * scalar,
			this.z * scalar,
			this.w * scalar,
		);
	}

	dot(other: Vec4): number {
		// return the dot product 
		return (
			this.x * other.x +
			this.y * other.y +
			this.z * other.z +
			this.w * other.w
		);
	}

	length(): number {
		// return the length
		return Math.hypot(this.x, this.y, this.z, this.w);
	}

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

	static normal_of_triangle(p0: Vec4, p1: Vec4, p2: Vec4) {
		let v0 = p1.sub(p0);
		let v1 = p2.sub(p0);
		return v0.cross(v1);
	}

	toString() {
		return ['[', this.x, this.y, this.z, this.w, ']'].join(' ');
	}
}

export default Vec4;
