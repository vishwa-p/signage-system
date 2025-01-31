const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  navigator,
} = require("electron");
const path = require("path");

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false, // Secure
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide(); // Minimize to system tray
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, "icons8-system-tray-50.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Electron Display App");
  tray.setContextMenu(contextMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//  logic to simulate connection status changes
ipcMain.on("offline-status-request", (event) => {
  // Try to make an HTTP request to check if the system is online
  http
    .get("http://www.google.com", (res) => {
      const isOnline = res.statusCode === 200; // If Google is reachable, we are online
      console.log("Connection Status:", isOnline ? "Online" : "Offline");
      event.sender.send("offline-status", isOnline); // Send status back to renderer
    })
    .on("error", () => {
      console.log("Connection Status: Offline");
      event.sender.send("offline-status", false); // If error occurs, send offline status
    });
});
setTimeout(() => {
  const { BrowserWindow } = require('electron');
  const win = BrowserWindow.getAllWindows()[0]; // Get the active window
  if (win) {
      win.webContents.send('offline-status', true); // Send 'Online' status
  }
}, 2000);
