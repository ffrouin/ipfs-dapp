all:	build deploy
	
install:
	npm install ipfs

build:
	browserify index.js -o dapp/js-ipfs.js

deploy:
	ipfs add -r dapp
