'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer;
const IPFS = require('ipfs')

Hls.DefaultConfig.loader = HlsjsIpfsLoader
Hls.DefaultConfig.debug = false

async function IPFSvideo(node) {
  if (!Hls.isSupported()) {
    return displayError(new Error('Your Browser does not support the HTTP Live Streaming Protocol'))
  }
  if (document.getElementById('ipfs-video').value != '') {
  const video = document.getElementById('video')
  const hls = new Hls()

  hls.config.ipfs = node
  hls.config.ipfsHash = document.getElementById('ipfs-video').value
  hls.loadSource('master.m3u8')
  hls.attachMedia(video)
  hls.on(Hls.Events.MANIFEST_PARSED, () => video.pause())
  }
} 

function displayError(err) {
  const modalElement = document.getElementById('modal');
  modalElement.style.display = 'flex';

  const errStr = String(err).toLowerCase();
  const spanElement = document.getElementById('errorText');

  spanElement.innerHTML = errorStr.includes('SecurityError'.toLowerCase()) 
    ? 'You must use Chrome or Firefox to test this embedded app!' 
    : 'Something went wrong. See the console to get further details.';
}

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

document.addEventListener('DOMContentLoaded', async () => {
  const node = await IPFS.create({
    repo: String(Math.random() + Date.now()),
    EXPERIMENTAL: { pubsub: true },
    init: { alogorithm: 'ed25519' }
  })

  document.getElementById('terminal-cursor').innerText = ''

  const storeMsg = document.getElementById('store-message')
  const readMsg = document.getElementById('read-file')
  const browserGo = document.getElementById('ipfs-browser-go')
  const videoGo = document.getElementById('ipfs-video-go')
  const dragContainer = document.getElementById('drag-container')
  const progressBar = document.getElementById('progress-bar')
  const multihashInput = document.getElementById('multihash-input')
  const fileDownload = document.getElementById('file-download')

  async function IPFSstore() {
    const data = document.getElementById('message-content').value
    const file = await node.add(data)
    document.getElementById('ipfs-reader').value = file.cid
    console.log('message added to IPFS : https://ipfs.io/ipfs/', file.cid)
  }

  async function IPFSread() {
   const hash = document.getElementById('ipfs-reader').value
   const stream = node.cat(hash)
   let data = ''
   console.log('Reading file https://ipfs.io/ipfs/' + hash)
   document.getElementById('message-content').value = ''
   for await (const chunk of stream) {
     document.getElementById('message-content').value += chunk.toString()
   }
  }

  async function updatePeers() {
    node.swarm.peers()
      .then(function(peers) {
        document.getElementById('peers').innerText = 'Peers connected : ' + peers.length
      })
      .catch(function(err) { console.log('fail : ', err) })
  }

  async function IPFSbrowse() {
   updatePeers()
   const addr = document.getElementById('ipns-browser').value
   console.log('ipns resolution request on /ipns/', addr)
   const hash = await node.resolve('/ipns/' + addr)
   console.log('ipfs resolution answer :', hash)
   document.getElementById('ipfs-browser-content').innerHTML = ''
   const stream = node.cat(hash + '/index.html')
   console.log('Requesting content')
   let data = ''
   for await (const chunk of stream) {
    console.log("chunk of data received")
    document.getElementById('ipfs-browser-content').innerHTML += chunk.toString()
   }
  }

  async function IPFSdownload() {
    let hash = document.getElementById('multihash-input').value

    for await (const file of node.get(hash)) {
       if (!file.content) continue
       const content = []
       for await (const chunk of file.content) {
          content.push(chunk)
       }
       const myFile = new window.Blob(content, { type: 'application/octet-binary' })
       const url = window.URL.createObjectURL(myFile)
       const link = document.createElement('a')
       link.setAttribute('href', url)
       link.setAttribute('download', file.name)
       link.style.display = 'none'
       document.body.appendChild(link)
       link.click()
       document.body.removeChild(link)
    }
  }

  await IPFSread() // delay in order peers to get connected

  node.id()
    .then(function(id) {
      document.getElementById('node-id').innerText = 'Node id : ' + id.id
      document.getElementById('agent-version').innerText = 'Agent version : ' + id.agentVersion
      document.getElementById('protocols').innerText = 'Protocols : ' + id.protocols
    })
    .catch(function(err) { console.log('fail : ', err) })

  updatePeers()

  storeMsg.onclick = IPFSstore
  readMsg.onclick = IPFSread
  browserGo.onclick = IPFSbrowse
  videoGo.onclick = IPFSvideo(node)
  fileDownload.onclick = IPFSdownload

  /* Drag & Drop
   =========================================================================== */

  let fileSize = 0

function onSuccess (msg) {
  console.log(msg)
}

function onError (err) {
  let msg = 'An error occured, check the dev console'

  if (err.stack !== undefined) {
    msg = err.stack
  } else if (typeof err === 'string') {
    msg = err
  }
  console.log(err)
}

window.onerror = onError

const updateProgress = (bytesLoaded) => {
  let percent = 100 - ((bytesLoaded / fileSize) * 100)

  progressBar.style.transform = `translateX(${-percent}%)`
}

const resetProgress = () => {
  progressBar.style.transform = 'translateX(-100%)'
}

function getFile () {
  const hash = multihashInput.value

  multihashInput.value = ''

  if (!hash) {
    return onError('No multihash was inserted.')
  }

  node.get(hash)
    .then((files) => {
      files.forEach((file) => {
        if (file.content) {
          appendFile(file.name, hash, file.size, file.content)
          onSuccess(`The ${file.name} file was added.`)
          $emptyRow.style.display = 'none'
        }
      })
    })
    .catch(() => onError('An error occurred when fetching the files.'))
}


  const onDragEnter = () => dragContainer.classList.add('dragging')

  const onDragLeave = () => dragContainer.classList.remove('dragging')

  function onDrop (event) {
      onDragLeave()
    event.preventDefault()
  
    const dt = event.dataTransfer
    const filesDropped = dt.files
  
    function readFileContents (file) {
      return new Promise((resolve) => {
        const reader = new window.FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.readAsArrayBuffer(file)
      })
    }
  
    const files = []
    for (let i = 0; i < filesDropped.length; i++) {
      files.push(filesDropped[i])
    }
  
    files.forEach((file) => {
      readFileContents(file)
        .then((buffer) => {
          fileSize = file.size
  
          node.add({
            path: file.name,
            content: Buffer.from(buffer)
          }, { wrap: true, progress: updateProgress }).then( (file) => {
                resetProgress()
                document.getElementById('multihash-input').value = file.cid.toString()
           })
        })
        .catch(onError)
    })
  }

  dragContainer.addEventListener('dragenter', onDragEnter)
  dragContainer.addEventListener('dragover', onDragEnter)
  dragContainer.addEventListener('drop', onDrop)
  dragContainer.addEventListener('dragleave', onDragLeave)
  
  typeText(document.getElementById('console'), 'Hello, my name is Freddy. I\'m using this dashboard to deliver multiple dapps using ipfs and libp2p. The aim is to provide a small environment to be able to communicate, store and read documents, listen to music, watch a video, through the peer to peer network. All this is experimental, you may have better results using firefox as this piece of software has not been accessed from any other web browser. The sources of this project are published on Github. You\'ll get the link browsing ipns://dapp.linuxtribe.fr with the IPFS Browser. Feel free to send your feedback to freddy@linuxtribe.fr.', 100, 0)
  
})
