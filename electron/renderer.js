const { ipcRenderer } = require('electron');

// DOM Elements
const syncBtn = document.getElementById('syncBtn');
const connectionStatus = document.getElementById('connectionStatus');
const contentArea = document.getElementById('contentArea');

// State
let isAutoSyncEnabled = false;
let cachedContent = [];

// Fetch and Display Content
async function fetchContent() {
    try {
        const response = await fetch('http://localhost:3000/content');
        if (!response.ok) throw new Error('Failed to fetch content');
        const content = await response.json();
        cachedContent = content;
        displayContent(content);
    } catch (err) {
        displayError(err.message);
    }
}

// Display Content
function displayContent(content) {
    contentArea.innerHTML = ''; // Clear previous content
    content.forEach((item) => {
        if (item.type === 'text') {
            const div = document.createElement('div');
            div.textContent = item.data;
            div.className = 'text-content';
            contentArea.appendChild(div);
        } else if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.data;
            img.className = 'image-content';
            contentArea.appendChild(img);
        }
    });
}

// Manual Sync Button
syncBtn.addEventListener('click', () => {
    fetchContent();
});

// Handle Auto-Sync
ipcRenderer.on('auto-sync-toggle', (event, enabled) => {
    isAutoSyncEnabled = enabled;
    if (isAutoSyncEnabled) {
        setInterval(fetchContent, 10000); // Auto-sync every 10 seconds
    }
});

// Handle Offline Playback
window.addEventListener('offline', () => {
    displayContent(cachedContent);
    displayError('Offline: Displaying cached content');
});

// Display Connection Status
async function updateConnectionStatus() {
    const status = await ipcRenderer.invoke('get-connection-status');
    connectionStatus.textContent = status.connected ? 'Connected' : 'Disconnected';
}

// Error Notifications
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = `Error: ${message}`;
    errorDiv.className = 'error-notification';
    contentArea.appendChild(errorDiv);
}


// Request connection status from main process
// Request connection status from main process
ipcRenderer.send('offline-status-request');

// Listen for the offline-status event
ipcRenderer.on('offline-status', (event, status) => {
    console.log('Received Connection Status:', status ? 'Online' : 'Offline');

    // Check if the status element exists
    const statusElement = document.getElementById('status');

    if (statusElement) {
        // Update the status text and class based on the connection status
        if (status) {
            statusElement.textContent = 'Online';
            statusElement.className = 'online';  // CSS class for online status
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'offline';  // CSS class for offline status
        }
    } else {
        console.warn('Status element not found in the DOM.');
    }
});

// Initial Load
fetchContent();
updateConnectionStatus();
