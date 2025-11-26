import Mat4 from "./utils/matrix";

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
	data: number[] | null;

	constructor(
		position?: Position,
		rotation?: Rotation,
		scale?: Scale,
		data: number[] | null = null
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
		const matrix = new Mat4();
		matrix.mul(Mat4.translation(this.position.x, this.position.y, this.position.z))
			.mul(Mat4.rotation_xz(this.rotation.yaw))
			.mul(Mat4.rotation_yz(this.rotation.pitch))
			.mul(Mat4.rotation_xy(this.rotation.roll))
			.mul(Mat4.scale(this.scale.x, this.scale.y, this.scale.z));

		return matrix;
	}
}

export default Node;
