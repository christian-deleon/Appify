const { app, BrowserWindow } = require('electron')
const path = require('path')
const config = require('../../config');

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // By default, Electron does not allow self-signed certificates.
  // This callback allows you to bypass this behavior.
  if (url.startsWith(config.websiteUrl)) {
    event.preventDefault();
    callback(true); // <-- Override the default behavior
  } else {
    callback(false);
  }
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 750,
    height: 900,
    webPreferences: {
      nodeIntegration: false, // For security reasons, disable node integration for the renderer process
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the URL of the website
  mainWindow.loadURL(config.websiteUrl)

  // Open the DevTools for debugging (optional)
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
