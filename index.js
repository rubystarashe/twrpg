import { app, BrowserWindow, protocol, net, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

const listener_inited = {}
const isDev = process.env.NODE_ENV === 'development'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, supportFetchAPI: true, secure: true } }
])

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const windows = {}

const createMainWindow = () => {
  windows.main = new BrowserWindow({
    width: 1280,
    height: 1080,
    titleBarStyle: 'hidden',
    minWidth: 900,
    minHeight: 600,
    title: "더월드 도우미",
    // transparent: true,
    // show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  protocol.handle('app', req => {
    return net.fetch('file://' + path.join(app.getAppPath(), req.url.slice('app://'.length)))
  })
  windows.main.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')

  ipcMain.on('savefile', (e, m) => {
    if (listener_inited['savefile']) return
    listener_inited['savefile'] = true
    windows.main.show()

    try {
      const savefilepath = path.join(os.homedir(), '/Documents/Warcraft III/CustomMapData/TWRPG/HeroSave.txt')
      if (fs.existsSync(savefilepath)) {
        windows.main.webContents.send('savedir', savefilepath)
        windows.main.webContents.send('savefile', fs.readFileSync(savefilepath, 'utf-8'))
      }
      fs.watchFile(savefilepath, { interval: 500 }, ({ size }) => {
        if (size) {
          windows.main.webContents.send('savefile', fs.readFileSync(savefilepath, 'utf-8'))
        }
      })
    } catch (e) {}

    try {
      const one_savefilepath = path.join(os.homedir(), '/OneDrive/문서/Warcraft III/CustomMapData/TWRPG/HeroSave.txt')
      if (fs.existsSync(one_savefilepath)) {
        windows.main.webContents.send('savedir', one_savefilepath)
        windows.main.webContents.send('savefile', fs.readFileSync(one_savefilepath, 'utf-8'))
      }
      fs.watchFile(one_savefilepath, { interval: 500 }, ({ size }) => {
        if (size) {
          windows.main.webContents.send('savefile', fs.readFileSync(one_savefilepath, 'utf-8'))
        }
      })
    } catch (e) {}
  })

  windows.main.on('maximize', () => {
    windows.main.webContents.send('maximized', true)
  })
  windows.main.on('unmaximize', () => {
    windows.main.webContents.send('maximized', false)
  })
  windows.main.on('minimize', () => {
  })
  windows.main.on('restore', () => {
  })

  ipcMain.on('minimize', (e, m) => {
    windows.main.minimize()
  })
  ipcMain.on('maximize', (e, m) => {
    windows.main.maximize()
  })
  ipcMain.on('unmaximize', (e, m) => {
    windows.main.unmaximize()
  })
  ipcMain.on('close', (e, m) => {
    windows.main.close()
  })
}

app.whenReady().then(() => {
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (windows.main) {
    if (windows.main.isMinimized()) windows.main.restore()
      windows.main.focus()
    }
  })
}