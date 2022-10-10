ci:
	npm ci

link:
	sudo npm link

lint:
	npx eslint .

develop:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

publish:
	npm publish --dry-run
