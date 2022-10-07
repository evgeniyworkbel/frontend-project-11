install:
	npm ci

link:
	sudo npm link

lint:
	npx eslint .

publish:
	npm publish --dry-run
