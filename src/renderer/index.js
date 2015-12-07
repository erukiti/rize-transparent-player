"use strict"

let ipc = require('electron').ipcRenderer

ipc.on('open', (ev, packet) => {
	document.querySelector('video').src = packet.path
})
