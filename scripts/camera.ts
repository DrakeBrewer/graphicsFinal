import Mat4 from './utils/matrix.ts';
import Vec4 from './utils/vertex.ts';

type Key = string;
type ControlState = Map<Key, boolean>;

export class Controls {
	state: ControlState;
	constructor() {
		this.state = new Map<Key, boolean>([
			['KeyW', false],      // Foward
			['KeyA', false],      // Left
			['KeyS', false],      // Backward
			['KeyD', false],      // Right

			['Space', false],     // Up
			['KeyC', false],      // Down

			['ArrowUp', false],   // Pitch Down
			['ArrowDown', false], // Pitch Up
			['ArrowLeft', false], // Yaw Left
			['ArrowRight', false],// Yaw Right
		]);
	}

	static start_listening() {
		let keys = new Controls();

		addEventListener('keydown', (ev: KeyboardEvent) => {
			if (typeof ev.code !== 'string') {
				return;
			}

			if (keys.state.get(ev.code) === undefined) {
				return;
			}

			keys.state.set(ev.code, true);
		});

		addEventListener('keyup', (ev: KeyboardEvent) => {
			if (typeof ev.code !== 'string') {
				return;
			}

			if (keys.state.get(ev.code) === undefined) {
				return;
			}

			keys.state.set(ev.code, false);
		});

		return keys;
	}

	is_key_down(code: string) {
		const state = this.state.get(code);
		if (state === undefined) {
			return false;
		}

		return state;
	}

	is_key_up(code: string) {
		const state = this.state.get(code);
		if (state === undefined) {
			return false;
		}

		return !state;
	}

	keys_down_list() {
		return Array.from(this.state.entries())
			.filter(([_, v]) => v)
			.map(([k]) => k);
	}
}

class Camera {
	position: { x: number; y: number; z: number };
	pitch: number;
	roll: number;
	yaw: number;

	constructor() {
		this.position = {
			x: 0,
			y: 0,
			z: 0,
		};

		this.yaw = 0;
		this.pitch = 0;
		this.roll = 0;
	}

	// slightly less than a quarter turn up or down allowed
	static get PITCH_LIMIT() { return .24; }

	add_yaw(amount: number) {
		this.yaw += amount;

		if (this.yaw < 0) {
			this.yaw = 1 + this.yaw;
		}

		if (this.yaw > 1) {
			this.yaw = this.yaw % 1;
		}
	}

	add_pitch(amount: number) {
		this.pitch += amount;

		if (this.pitch > Camera.PITCH_LIMIT) {
			this.pitch = Camera.PITCH_LIMIT;
		} else if (this.pitch < -Camera.PITCH_LIMIT) {
			this.pitch = -Camera.PITCH_LIMIT;
		}
	}

	add_roll(amount: number) {
		this.roll += amount;

		if (this.roll < -.5) { this.roll = -.5; }
		if (this.roll > 5) { this.roll = .5; }
	}

	move_in_direction(strafe: number, up: number, forward: number) {
		const matrix = Camera.get_dir_matrix(this.roll, this.pitch, this.yaw);
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
			.mul(Mat4.rotation_xz(this.yaw))
			.mul(Mat4.rotation_yz(this.pitch))
			.mul(Mat4.rotation_xy(this.roll))

		return matrix.inverse();
	}
}

export default Camera
