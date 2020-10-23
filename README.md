# ipfs-dapp

ubuntu like ipfs desktop running in a web browser :

https://ipfs.io/ipns/ipfs-desktop.linuxtribe.fr

# building the application

requirements : ipfs to publish your dapp (make deploy)
               nodejs, js-ipfs, libp2p, browserify (to generate a browser javascript file running in standalone mode)

clone the repo

	git clone https://github.com/ffrouin/ipfs-dapp

verify you've got nodejs (node/npm) installed in browserify:

	npm install -g browserify (as root)

install npm required modules

	cd ipfs-dapp
	npm install
	make

	cid for dapp directory output in your console will let you access your dapp at:
	https://ipfs.io/ipfs/<cid>

# project status

https://ipfs.io/ipns/dapp.linuxtribe.fr
