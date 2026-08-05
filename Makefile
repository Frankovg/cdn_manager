build:
	pnpm i

serve:
	@goreman -set-ports=false start

lint:
	@pnpm run lint

test:
	@pnpm run test

typecheck:
	@pnpm run typecheck
