// const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
// const path = require('path');

// let mainWindow;
// let tray;
// let isAutoSyncEnabled = false;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 1920,
//         height: 1080,
//         fullscreen: true,
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.js'),
//             contextIsolation: true,
//             nodeIntegration: false,
//         },
//     });

//     mainWindow.loadFile('index.html');
//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });
// }

// app.whenReady().then(() => {
//     createWindow();

//     tray = new Tray(path.join(__dirname, 'icon.png')); // Add your icon here
//     const contextMenu = Menu.buildFromTemplate([
//         { label: 'Toggle Auto Sync', type: 'checkbox', click: toggleAutoSync },
//         { label: 'Exit', click: () => app.quit() },
//     ]);
//     tray.setToolTip('Digital Signage Display');
//     tray.setContextMenu(contextMenu);
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit();
// });

// function toggleAutoSync(menuItem) {
//     isAutoSyncEnabled = menuItem.checked;
//     mainWindow.webContents.send('auto-sync-toggle', isAutoSyncEnabled);
// }

// ipcMain.handle('get-connection-status', async () => {
//     // Replace with actual connection status logic
//     return { connected: true };
// });


const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide(); // Minimize to system tray
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Electron Display App');
  tray.setContextMenu(contextMenu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle offline content logic
ipcMain.on('offline-status', (event, status) => {
  console.log('Connection Status:', status ? 'Online' : 'Offline');
});
