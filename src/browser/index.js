"use strict"

let app = require('electron').app
let BrowserWindow = require('electron').BrowserWindow
let Menu = require('electron').Menu
let Tray = require('electron').Tray

let path = require('path')

let probe = require('node-ffprobe')
let $ = require('nodobjc')
$.import('Foundation')
$.import('Cocoa')

app.on('window-all-closed', () => {
	app.quit()
})

let win = null

if (process.argv.length < 2) {
	console.log("引数に動画ファイルを指定してください、リゼ先輩！")
	process.exit(1)
}

app.on('ready', () => {
	let fn = path.resolve(process.argv[2])
	probe(fn, (err, data) => {
		if (err) {
			console.log(`${fn}: probe error`)
			console.dir(err)
			process.exit(1)
		}
		let width = 0
		let height = 0
		data.streams.forEach((stream) => {
			if (stream.codec_type == 'video' && stream.width && stream.height) {
				width = stream.width
				height = stream.height
			}
		})
		console.log(`${fn}: ${width} x ${height}`)
		if (width && height) {
			win = new BrowserWindow({frame: false, x: 0, y:0, width: width, height: height, transparent: true, 'always-on-top': true})
			win.loadURL(`file://${__dirname}/../renderer/index.html`)
			win.webContents.on('did-finish-load', () => {
				let appIcon = new Tray('images/rabbit-tray.png')
				let contextMenu = Menu.buildFromTemplate([
					{label: '終了', accelerator: 'Command+Q', click: () => {app.quit()}}
				])
				appIcon.setContextMenu(contextMenu)
				appIcon.setToolTip(`${fn}: ${width} x ${height}`)

				$.NSApplication('sharedApplication')('windows')('objectAtIndex', 0)('setIgnoresMouseEvents', $.YES)

				win.webContents.send('open', {path: fn})
			})
			win.on('closed', () => {
				win = null
			})
		}
	})
})
