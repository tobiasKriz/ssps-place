const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const websocketHandler = require('./websocket-handler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '../src')));

// Handle WebSocket connections with request object for IP tracking
wss.on('connection', (ws, req) => {
    websocketHandler(ws, wss, req);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    console.log('Server-side IP-based rate limiting is active');
});