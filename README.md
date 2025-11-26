# Graphics Engine

To run the file server run
```sh
bun run --hot server.ts
```

to compile the typescript so that it can be hot reloaded on changes run:
```sh
bun build ./scripts/index.ts --outdir ./dist/ --target browser --watch
```

Or you can download Justfile and use the just commands instead.
