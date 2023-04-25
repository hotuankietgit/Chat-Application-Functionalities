const { app, BrowserWindow } = require('electron')
const path = require('path')
const {ipcMain} = require('electron')
const { desktopCapturer } = require('electron')
const {Menu} = require("electron")

let win,winNew;

function createWindow () {
  win = new BrowserWindow({
    width: 1200,
    height: 900,
    title: "Electron Chat App",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.loadFile(path.join(__dirname,'./renderer/test.html'))
}

ipcMain.on("recording" , (event, value) => {
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    win.webContents.send("all_source", sources);
  })
})

app.whenReady().then(() => {
  createWindow()
  let template = [
    {
      label: "New Window",
      click: function(){
          winNew = new BrowserWindow({
            width: 1200,
            height: 900,
            title: "Electron Chat App",
              webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
            }
          }).loadFile(path.join(__dirname,'./renderer/test.html'))
      }
    }
  ]
  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

 app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow() 
    }
  })
})

 app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})