const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isAutoSyncEnabled = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'icon.png')); // Add your icon here
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Toggle Auto Sync', type: 'checkbox', click: toggleAutoSync },
        { label: 'Exit', click: () => app.quit() },
    ]);
    tray.setToolTip('Digital Signage Display');
    tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function toggleAutoSync(menuItem) {
    isAutoSyncEnabled = menuItem.checked;
    mainWindow.webContents.send('auto-sync-toggle', isAutoSyncEnabled);
}

ipcMain.handle('get-connection-status', async () => {
    // Replace with actual connection status logic
    return { connected: true };
});
