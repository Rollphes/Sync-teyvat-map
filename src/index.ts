import * as opencvBuild from '@u4/opencv-build'
import { app, BrowserWindow, dialog, session, shell } from 'electron'
import * as Log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { Worker } from 'worker_threads'

process.env.OPENCV_BIN_DIR = new opencvBuild.OpenCVBuildEnv().opencvBinDir
process.env.path += ';' + new opencvBuild.OpenCVBuildEnv().opencvBinDir

Log.transports.file.level = 'info'
autoUpdater.logger = Log

const homePath = __dirname.split('dist')[0]
const resourcesPath = homePath.split('app')[0]
const server = new Worker(homePath + 'dist\\server.js', {
  env: {
    OPENCV_BIN_DIR: new opencvBuild.OpenCVBuildEnv().opencvBinDir,
    path: process.env.path,
  },
})

process.on('uncaughtException', (err) => {
  Log.error(err)
  app.quit()
})

if (require('electron-squirrel-startup') || !app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

const deploy = async () => {
  await session.defaultSession.loadExtension(resourcesPath + 'extensions', {
    allowFileAccess: true,
  })
  const win = new BrowserWindow({
    show: false,
    title: `パイモンが地図動かしてくれるヤツ ver.${app.getVersion()}`,
  })
  void win.loadURL('https://act.hoyolab.com/ys/app/interactive-map/index.html')
  win.on('ready-to-show', () => {
    win.show()
  })
  win.on('page-title-updated', (evt) => {
    evt.preventDefault()
  })
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/rollphes/.exec(url)) {
      void shell.openExternal(url)
      return {
        action: 'deny',
      }
    }
    return {
      action: 'allow',
    }
  })
  win.setMenu(null)
  //win.webContents.openDevTools()

  void autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.on('update-downloaded', (info) => {
    void dialog
      .showMessageBox(win, {
        type: 'info',
        buttons: ['更新して再起動', 'あとで'],
        message: 'アップデート',
        detail:
          '新しいバージョンをダウンロードしました。再起動して更新を適用しますか？',
      })
      .then((returnValue) => {
        if (returnValue.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })
}

app.on('ready', () => {
  void deploy()
})

app.on('browser-window-created', (e, win) => {
  win.on('page-title-updated', (evt) => {
    evt.preventDefault()
  })
  win.setMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    void server.terminate()
  }
})
