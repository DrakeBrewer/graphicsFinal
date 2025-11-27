import type { UvMesh } from "../mesh";
import type Node from "../sceneGraph";
import type Mat4 from "../utils/matrix";

export class RenderMesh {
	matrix: Mat4;
	mesh: UvMesh;

	constructor(matrix: Mat4, mesh: UvMesh) {
		this.matrix = matrix;
		this.mesh = mesh;
	}
}

export function generate_render_jobs(parent_matrix: Mat4, node: Node, jobs: RenderMesh[]) {
	const matrix = parent_matrix.mul(node.matrix());
	if (node.data !== null) {
		jobs.push(new RenderMesh(matrix, node.data))
	}

	for (let child of node.children) {
		generate_render_jobs(matrix, child, jobs);
	}
}
