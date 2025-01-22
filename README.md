1) Digital Signage System

This project is a Digital Signage Content Management System, consisting of a Web Dashboard for content creation and management and an Electron-based Display Application for content playback. It is designed to provide offline capabilities, real-time synchronization, and a user-friendly interface.

Features

2) Web Dashboard

Content Creation: Supports text, images, and basic layouts using Fabric.js.

Content Preview: Allows users to preview created content.

Scheduling Options (Optional): Schedule content for future playback.

Content List with Status Indicators: Displays the status of all uploaded content.

Organization: Folders and categories for organizing content.

Device Monitoring: Monitor the status of connected display devices.

3) Electron Display Application

Full-Screen Playback: Displays content in full-screen mode.

Manual Sync: Syncs content manually, with status indicators.

Auto-Sync: Option to enable automatic synchronization.

Offline Playback: Supports playback of locally stored content during offline periods.

System Tray Controls: Provides quick access to app controls via the system tray.

Connection Status Indicator: Displays real-time connection status.

Error Notifications: Alerts users about errors during operation.

4) Offline Capabilities

Local Storage: Saves content locally for offline playback.

Content Caching: Ensures that content is cached for future use.

Automatic Sync: Syncs content automatically when the connection is restored.

Backup: Keeps a local backup of content.

Offline Status Indication: Indicates offline status clearly.

5) Technical Overview

-->Architecture

The system comprises two main components:

Web Dashboard: Built using React.js and hosted on Vercel for live access.

Electron Display Application: A cross-platform desktop application paired with the dashboard through a code pairing system or QR code.

Communication between the components is facilitated by WebSocket for real-time updates and synchronization.

-->WebSocket Implementation

Real-Time Updates: Ensures instant communication between the dashboard and the display app.

Status Monitoring: Displays real-time connection status and sync progress.

-->Offline Functionality

Local Storage: Implements a robust mechanism to store content locally for offline use.

Auto-Sync: Automatically syncs content as soon as the connection is restored.

Error Handling: Manages connection issues gracefully with retry mechanisms and user notifications.

6) Setup Instructions

-->Web Dashboard

Clone the repository: git clone https://github.com/vishwa-p/signage-system

Navigate to the dashboard directory: cd web-dashboard

Install dependencies: npm install

Start the development server:  node app.js 

For production, deploy the dashboard using Vercel or your preferred hosting platform.

-->Electron Display Application

Navigate to the electron-app directory: cd electron-app

Install dependencies: npm install

Start the application: npx electron .

For production, package the app using Electron Builder: npm run build

-->Known Limitations

Content scheduling features are optional and may lack advanced functionality.

Limited support for complex media formats like video.

The offline playback experience may vary depending on the user's device storage capacity.

-->Future Improvements

Enhance scheduling functionality to support advanced recurrence patterns.

Add support for additional media formats such as video and interactive widgets.

Improve error logging and provide detailed troubleshooting guides.

Implement more advanced security measures for data storage and transmission.

-->Deliverables

Source Code: Available on GitHub.

Live Dashboard: Deployed on Vercel.

Electron App Pairing: Supports pairing through a code system or QR code.

Offline Demonstration: Demonstrates offline capabilities as described.

For further assistance or questions, please contact [Vishwa Patel](https://github.com/vishwa-p?tab=repositories).
