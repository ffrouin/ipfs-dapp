'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer;
const IPFS = require('ipfs')

function getRandomNumber(min, max) {
	    return ((Math.random() * (max - min)) + min)
	}

function typeText(item, text, delay, i) {
    $(item).append(text.charAt(i))
        .delay(getRandomNumber(50,delay))
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
  typeText(document.getElementById('console'), 'IPFS node loading...\n', 200, 0)

  const node = await IPFS.create({
    repo: String(Math.random() + Date.now()),
    EXPERIMENTAL: { pubsub: true },
    init: { alogorithm: 'ed25519' }
  })

  myConsole('trying to access QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme')

  const stream = node.cat('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme')
  let data = ''
  for await (const chunk of stream) {
    myConsole(chunk.toString())
  }

  typeText(document.getElementById('console'), 'feel free to send your feedback to freddy@linuxtribe.fr\n', 200, 0)

  const storeMsg = document.getElementById('store-message')
  const readMsg = document.getElementById('read-file')

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

  storeMsg.onclick = IPFSstore
  readMsg.onclick = IPFSread
})
