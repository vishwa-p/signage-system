const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // Monitor online/offline status
  const updateConnectionStatus = () => {
    const isOnline = navigator.onLine;
    ipcRenderer.send('offline-status', isOnline);
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = isOnline ? 'Online' : 'Offline';
    statusElement.style.color = isOnline ? 'green' : 'red';
  };

  contextBridge.exposeInMainWorld('electronAPI', {
    requestStatus: () => ipcRenderer.send('offline-status-request'),
    onStatusUpdate: (callback) => ipcRenderer.on('offline-status', (event, status) => callback(status)),
});
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  updateConnectionStatus();
});
