
build:
	pnpm i

serve:
	@goreman -set-ports=false start

lint:
	@pnpm lint

test:
	@pnpm test

data:
	@echo "!! Run seed local script from Convex panel instead."
