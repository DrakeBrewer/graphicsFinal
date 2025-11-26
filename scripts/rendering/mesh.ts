import type Node from "../sceneGraph";
import type Mat4 from "../utils/matrix";

type Mesh = any;

class RenderMesh {
	matrix: Mat4;
	mesh: Mesh;

	constructor(matrix: Mat4, mesh: Mesh) {
		this.matrix = matrix;
		this.mesh = mesh;
	}
}

function generate_render_jobs(parent_matrix: Mat4, node: Node, jobs: RenderMesh[]) {
	const matrix = parent_matrix.mul(node.matrix());
	if (node.data !== null) {
		jobs.push(new RenderMesh(matrix, node.data))
	}
	for (let child of node.children) {
		generate_render_jobs(matrix, child, jobs);
	}
}
