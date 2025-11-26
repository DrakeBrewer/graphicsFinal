dev:
	bun run --hot server.ts

build:
	bun build ./scripts/index.ts --outdir ./dist/ --target browser --watch
