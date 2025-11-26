import index from "./index.html"
const PORT = Number(process.env.PORT ?? 8080);

const server = Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		const path = url.pathname;

		// Serve index.html for root
		if (path === "/") {
			const file = Bun.file("./index.html");
			return new Response(file);
		}

		// Serve other files
		const filePath = `.${path}`; // e.g., "./assets/shaders/vertex.glsl"
		const file = Bun.file(filePath);

		// Check if file exists
		if (await file.exists()) {
			return new Response(file);
		}

		// 404 if not found
		return new Response("Not Found", { status: 404 });
	},
});

console.info(`Listening on port ${PORT}`);
