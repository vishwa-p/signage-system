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
      nodeIntegration: false, // Secure
      contextIsolation: true,
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

//  logic to simulate connection status changes
ipcMain.on('offline-status-request', (event) => {
  const isOnline = true; // Replace with actual status check logic
  console.log('Connection Status:', isOnline ? 'Online' : 'Offline');
  event.sender.send('offline-status', isOnline); // Send status to renderer
})

setTimeout(() => {
  const { BrowserWindow } = require('electron');
  const win = BrowserWindow.getAllWindows()[0]; // Get the active window
  if (win) {
      win.webContents.send('offline-status', true); // Send 'Online' status
  }
}, 2000);