const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (event, message) => ipcRenderer.send(event, message),
  on: (event, cb) => {
    ipcRenderer.on(event, (e, m) => cb(m))
  },
  open: (event, cb) => {
    ipcRenderer.send(event)
    ipcRenderer.on(event, (e, m) => cb(m))
  },
  listen: (event, message, cb) => {
    ipcRenderer.send(event, message)
    ipcRenderer.on(event, (e, m) => cb(m))
  }
})
