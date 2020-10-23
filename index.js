'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer;
const IPFS = require('ipfs')

function getRandomNumber(min, max) {
	    return ((Math.random() * (max - min)) + min)
	}

function typeText(item, text, delay, i) {
    $(item).append(text.charAt(i))
        .delay(getRandomNumber(10,delay))
        .promise()
        .done(function() {
          if(i<text.length) {
            i++;
            typeText(item, text, delay, i);  
          }
    });       
}

function scrollDown(item) {
  $(item).scrollTop($(item)[0].scrollHeight)
}

function myConsole(msg) {
  document.getElementById('console').innerText += '\n'
  document.getElementById('console').innerText += msg
  document.getElementById('console').innerText += '\n'
  scrollDown(document.getElementById('terminal-body'))
  console.log(msg)
}

function myIPFSConsole(msg) {
  document.getElementById('ipfs-console').innerText += '\n'
  document.getElementById('ipfs-console').innerText += msg
  document.getElementById('ipfs-console').innerText += '\n'
  scrollDown(document.getElementById('terminal-body'))
  console.log(msg)
}
document.addEventListener('DOMContentLoaded', async () => {
  typeText(document.getElementById('console'), 'Please wait, I\'m waking up... a coffee. ', 250, 0)

  const node = await IPFS.create({
    repo: String(Math.random() + Date.now()),
    EXPERIMENTAL: { pubsub: true },
    init: { alogorithm: 'ed25519' }
  })

  console.log('trying to access QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme')

  const stream = node.cat('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme')
  let data = ''
  for await (const chunk of stream) {
    console.log(chunk.toString())
  }

  const storeMsg = document.getElementById('store-message')
  const readMsg = document.getElementById('read-file')
  const browserGo = document.getElementById('ipfs-browser-go')

  async function IPFSstore() {
    const data = document.getElementById('message-content').value
    const file = await node.add(data)
    myIPFSConsole('message added to IPFS : ')
    myIPFSConsole('https://ipfs.io/ipfs/' + file.cid)
  }

  async function IPFSread() {
   const hash = document.getElementById('ipfs-reader').value
   const stream = node.cat(hash)
   let data = ''
   myIPFSConsole('Reading file https://ipfs.io/ipfs/' + hash)
   for await (const chunk of stream) {
     myIPFSConsole(chunk.toString())
   }
  }

  async function IPFSbrowse() {
   const addr = document.getElementById('ipns-browser').value
   myIPFSConsole('ipns resolution request on /ipns/' + addr)
   const hash = await node.resolve('/ipns/' + addr)
   myIPFSConsole('ipfs resolution answer :' + hash)
   document.getElementById('ipfs-browser-content').innerHTML = ''
   const stream = node.cat(hash + '/index.html')
   myIPFSConsole('Reading content')
   let data = ''
   for await (const chunk of stream) {
    document.getElementById('ipfs-browser-content').innerHTML += chunk.toString()
   }
  }

  storeMsg.onclick = IPFSstore
  readMsg.onclick = IPFSread
  browserGo.onclick = IPFSbrowse

  typeText(document.getElementById('console'), 'Hello, my name is Freddy. I am working in the IT for about 20 years and I\'m doing some research on IPFS. I\'m using this dashboard to deliver multiple dapps using ipfs and libp2p. The aim is to provide a small environment to be able to communicate, store and read documents, listen to music, watch a video, through the peer to peer network. All this is experimental, you may have better results using firefox as this piece of software has not been accessed from any other web browser. The sources of this project are published on Github. You\'ll get the link browsing ipns://dapp.linuxtribe.fr with the IPFS Browser. Feel free to send your feedback to freddy@linuxtribe.fr.', 100, 0)
})
