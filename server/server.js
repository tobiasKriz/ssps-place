const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const websocketHandler = require('./websocket-handler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '../src')));

// Add endpoint to download timelapse data
app.get('/api/timelapse', (req, res) => {
    const timelapseFile = path.join(__dirname, 'timelapse-data.json');
    
    if (fs.existsSync(timelapseFile)) {
        res.download(timelapseFile, 'ssps-place-timelapse.json', (err) => {
            if (err) {
                console.error('Error downloading timelapse:', err);
                res.status(500).json({ error: 'Failed to download timelapse' });
            }
        });
    } else {
        res.status(404).json({ error: 'Timelapse file not found' });
    }
});

// Add endpoint to view timelapse data as JSON
app.get('/api/timelapse/view', (req, res) => {
    const timelapseData = websocketHandler.getTimelapseData();
    res.json({
        totalEvents: timelapseData.length,
        data: timelapseData
    });
});

// Add endpoint to download canvas data
app.get('/api/canvas', (req, res) => {
    const canvasFile = path.join(__dirname, 'canvas-data.json');
    
    if (fs.existsSync(canvasFile)) {
        res.download(canvasFile, 'ssps-place-canvas.json', (err) => {
            if (err) {
                console.error('Error downloading canvas:', err);
                res.status(500).json({ error: 'Failed to download canvas' });
            }
        });
    } else {
        res.status(404).json({ error: 'Canvas file not found' });
    }
});

// Add endpoint to view canvas data as JSON
app.get('/api/canvas/view', (req, res) => {
    const canvasData = websocketHandler.getCanvasState();
    res.json({
        totalPixels: Object.keys(canvasData).length,
        data: canvasData
    });
});

// Handle WebSocket connections with request object for IP tracking
wss.on('connection', (ws, req) => {
    websocketHandler(ws, wss, req);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    console.log('Server-side IP-based rate limiting is active');
    console.log(`API Endpoints:`);
    console.log(`  - GET /api/timelapse/view - View timelapse data`);
    console.log(`  - GET /api/timelapse - Download timelapse file`);
    console.log(`  - GET /api/canvas/view - View canvas data`);
    console.log(`  - GET /api/canvas - Download canvas file`);
});