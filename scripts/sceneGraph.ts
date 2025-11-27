import Camera from "./camera";
import Mat4 from "./utils/matrix";
import Vec4 from "./utils/vertex";

interface Position {
	x: number;
	y: number;
	z: number;
};

interface Rotation {
	pitch: number;
	roll: number;
	yaw: number;
};

interface Scale {
	x: number;
	y: number;
	z: number;
};

class Node {
	position: Position;
	rotation: Rotation;
	scale: Scale;
	children: Node[];
	data: unknown | null;

	constructor(
		position?: Position,
		rotation?: Rotation,
		scale?: Scale,
		data: unknown | null = null
	) {
		this.position = position ?? { x: 0, y: 0, z: 0 };
		this.rotation = rotation ?? { pitch: 0, roll: 0, yaw: 0 };
		this.scale = scale ?? { x: 1.0, y: 1.0, z: 1.0 };

		this.children = [];
		this.data = data;
	}

	add_child(child: Node) {
		this.children.push(child)
		return child;
	}

	matrix() {
		let matrix = Mat4.identity();
		matrix = matrix.mul(Mat4.translation(this.position.x, this.position.y, this.position.z));
		matrix = matrix.mul(Mat4.rotation_xz(this.rotation.yaw));
		matrix = matrix.mul(Mat4.rotation_yz(this.rotation.pitch));
		matrix = matrix.mul(Mat4.rotation_xy(this.rotation.roll));
		matrix = matrix.mul(Mat4.scale(this.scale.x, this.scale.y, this.scale.z));

		return matrix;
	}

	add_yaw(amount: number) {
		this.rotation.yaw += amount;

		if (this.rotation.yaw < 0) {
			this.rotation.yaw = 1 + this.rotation.yaw;
		}

		if (this.rotation.yaw > 1) {
			this.rotation.yaw = this.rotation.yaw % 1;
		}
	}

	add_pitch(amount: number) {
		this.rotation.pitch += amount;

		if (this.rotation.pitch > Camera.PITCH_LIMIT) {
			this.rotation.pitch = Camera.PITCH_LIMIT;
		} else if (this.rotation.pitch < -Camera.PITCH_LIMIT) {
			this.rotation.pitch = -Camera.PITCH_LIMIT;
		}
	}

	add_roll(amount: number) {
		this.rotation.roll += amount;

		if (this.rotation.roll < -.5) { this.rotation.roll = -.5; }
		if (this.rotation.roll > 5) { this.rotation.roll = .5; }
	}

	move_in_direction(strafe: number, up: number, forward: number) {
		const matrix = Camera.get_dir_matrix(this.rotation.roll, this.rotation.pitch, this.rotation.yaw);
		const txed = matrix.transform_vec(new Vec4(strafe, up, forward, 0));

		// console.log(txed.x, txed.y, txed.z, txed.w);

		this.translate_vec(txed);
	}

	translate(x: number, y: number, z: number) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
	}

	translate_vec(v: Vec4) {
		this.translate(v.x, v.y, v.z);
	}

	warp(x: number, y: number, z: number) {
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
	}

	warp_vec(v: Vec4) {
		this.warp(v.x, v.y, v.z);
	}

	static get_dir_matrix(roll: number, pitch: number, yaw: number) {
		let matrix = new Mat4();

		matrix = matrix.mul(Mat4.rotation_xz(yaw));
		matrix = matrix.mul(Mat4.rotation_yz(pitch));
		matrix = matrix.mul(Mat4.rotation_xy(roll));

		return matrix;
	}


	get_view_matrix() {
		let matrix = new Mat4();

		matrix = matrix.mul(Mat4.translation(this.position.x, this.position.y, this.position.z))
			.mul(Mat4.rotation_xz(this.rotation.yaw))
			.mul(Mat4.rotation_yz(this.rotation.pitch))
			.mul(Mat4.rotation_xy(this.rotation.roll))

		return matrix.inverse();
	}
}

export default Node;
