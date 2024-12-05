const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

// Function to save window state
function saveWindowState(window) {
  const bounds = window.getBounds();
  const windowState = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    isMaximized: window.isMaximized()
  };

  const filePath = path.join(app.getPath('userData'), 'window-state.json');
  fs.writeFileSync(filePath, JSON.stringify(windowState));
}

// Function to load window state
function loadWindowState() {
  const filePath = path.join(app.getPath('userData'), 'window-state.json');
  let windowState = { width: 750, height: 900, x: undefined, y: undefined, isMaximized: false }; // Default size

  try {
    windowState = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.log('No saved window state found.');
  }

  return windowState;
}

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

let mainWindow;

function createWindow() {
  const { width, height, x, y, isMaximized } = loadWindowState();

  // Create the browser window with the loaded state
  mainWindow = new BrowserWindow({
    width: width || 750, // Fallback to default if not defined
    height: height || 900,
    x: x,
    y: y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Restore maximized state
  if (isMaximized) {
    mainWindow.maximize();
  }

  // Load the URL of the website
  mainWindow.loadURL(config.websiteUrl);

  // Open the DevTools for debugging (optional)
  // mainWindow.webContents.openDevTools();

  // Save window state on close
  mainWindow.on('close', () => {
    if (!mainWindow.isMaximized()) {
      saveWindowState(mainWindow);
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
