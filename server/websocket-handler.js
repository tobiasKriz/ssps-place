const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Store the canvas state in memory
let canvasState = {};

// File path for saving canvas data
const CANVAS_FILE = path.join(__dirname, 'canvas-data.json');
const TIMELAPSE_FILE = path.join(__dirname, 'timelapse-data.json');

// Store cooldowns by IP address (IP -> timestamp when they can place next)
const cooldowns = new Map();
const COOLDOWN_TIME = 10 * 1000; // 10 seconds in milliseconds
const LOCALHOST_COOLDOWN_TIME = 1 * 1000; // 1 second for localhost

// Timelapse data - stores every pixel change with timestamp
let timelapseData = [];

// Allowed color palette (must match client-side palette)
const ALLOWED_COLORS = new Set([
    // Row 1: Dark burgundy to green-teal
    '#6D001A', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#FFF8B8', '#FFFFCC', '#00A368',
    // Row 2: Light green to purple-blue
    '#00CC78', '#00756F', '#009EAA', '#00CCC0', '#2450A4', '#3690EA', '#51E9F4', '#493AC1',
    // Row 3: Lavender-blue to light pink
    '#6A5CFF', '#811E9F', '#B44AC0', '#E4ABFF', '#DE107F', '#FF3881', '#FF99AA', '#FFCCDD',
    // Row 4: Brown to white
    '#6D482F', '#9C6926', '#FFB470', '#000000', '#515252', '#898D90', '#D4D7D9', '#FFFFFF'
]);

// Load canvas data from file on startup
function loadCanvasData() {
    try {
        if (fs.existsSync(CANVAS_FILE)) {
            const data = fs.readFileSync(CANVAS_FILE, 'utf8');
            canvasState = JSON.parse(data);
            console.log('Canvas data loaded from file. Total pixels:', Object.keys(canvasState).length);
        } else {
            console.log('No saved canvas data found. Starting with blank canvas.');
        }
    } catch (error) {
        console.error('Error loading canvas data:', error);
        canvasState = {};
    }
}

// Load timelapse data from file on startup
function loadTimelapseData() {
    try {
        if (fs.existsSync(TIMELAPSE_FILE)) {
            const data = fs.readFileSync(TIMELAPSE_FILE, 'utf8');
            timelapseData = JSON.parse(data);
            console.log('Timelapse data loaded from file. Total events:', timelapseData.length);
        } else {
            console.log('No saved timelapse data found. Starting fresh.');
            timelapseData = [];
        }
    } catch (error) {
        console.error('Error loading timelapse data:', error);
        timelapseData = [];
    }
}

// Save canvas data to file
function saveCanvasData() {
    try {
        fs.writeFileSync(CANVAS_FILE, JSON.stringify(canvasState, null, 2), 'utf8');
        console.log('Canvas data saved to file. Total pixels:', Object.keys(canvasState).length);
    } catch (error) {
        console.error('Error saving canvas data:', error);
    }
}

// Save timelapse data to file
function saveTimelapseData() {
    try {
        fs.writeFileSync(TIMELAPSE_FILE, JSON.stringify(timelapseData, null, 2), 'utf8');
        console.log('Timelapse data saved to file. Total events:', timelapseData.length);
    } catch (error) {
        console.error('Error saving timelapse data:', error);
    }
}

// Function to get hostname from IP (async)
function getHostname(ip) {
    return new Promise((resolve) => {
        // Skip hostname resolution for localhost
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            resolve('localhost');
            return;
        }
        
        dns.reverse(ip, (err, hostnames) => {
            if (err || !hostnames || hostnames.length === 0) {
                resolve(ip); // Return IP if hostname not found
            } else {
                resolve(hostnames[0]); // Return first hostname
            }
        });
    });
}

// Add pixel change to timelapse
async function addToTimelapse(x, y, color, ip) {
    const hostname = await getHostname(ip);
    
    const event = {
        x: x,
        y: y,
        color: color,
        timestamp: Date.now(),
        ip: ip.replace(/:/g, '_'), // Anonymize IP partially
        hostname: hostname // Add hostname/device name
    };
    timelapseData.push(event);
    
    // Save timelapse immediately after every pixel
    saveTimelapseData();
}

// Auto-save every 30 seconds
setInterval(() => {
    if (Object.keys(canvasState).length > 0) {
        saveCanvasData();
    }
    if (timelapseData.length > 0) {
        saveTimelapseData();
    }
}, 30000);

// Load canvas data when module loads
loadCanvasData();
loadTimelapseData();

function getClientIP(req) {
    // Get IP from various possible headers (for proxies/load balancers)
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.socket.remoteAddress ||
           'unknown';
}

function canPlacePixel(ip) {
    const cooldownEnd = cooldowns.get(ip);
    if (!cooldownEnd) {
        return { allowed: true, remainingTime: 0 };
    }
    
    const now = Date.now();
    if (now >= cooldownEnd) {
        cooldowns.delete(ip);
        return { allowed: true, remainingTime: 0 };
    }
    
    return { allowed: false, remainingTime: cooldownEnd - now };
}

function setCooldown(ip) {
    // Check if this is localhost
    const cooldownTime = (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') 
        ? LOCALHOST_COOLDOWN_TIME 
        : COOLDOWN_TIME;
    
    const cooldownEnd = Date.now() + cooldownTime;
    cooldowns.set(ip, cooldownEnd);
    console.log(`Cooldown set for ${ip}: ${cooldownTime / 1000} seconds`);
    return cooldownEnd;
}

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
    handleWebSocketConnection(ws, wss, req);
});

function handleWebSocketConnection(ws, wss, req) {
    const clientIP = getClientIP(req);
    
    // Get hostname asynchronously
    getHostname(clientIP).then(hostname => {
        console.log('New client connected from IP:', clientIP, '| Hostname:', hostname);
    });
    
    // Send initial cooldown status
    const cooldownStatus = canPlacePixel(clientIP);
    if (!cooldownStatus.allowed) {
        console.log('Sending initial cooldown status:', cooldownStatus);
        ws.send(JSON.stringify({
            type: 'cooldown_status',
            allowed: false,
            remainingTime: cooldownStatus.remainingTime
        }));
    }
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message from', clientIP, ':', data.type);
            
            switch (data.type) {
                case 'pixel':
                    handlePixelUpdate(data, wss, clientIP, ws);
                    break;
                    
                case 'request_canvas':
                    console.log('Sending canvas state to', clientIP);
                    // Send current canvas state to the requesting client
                    ws.send(JSON.stringify({
                        type: 'canvas_state',
                        pixels: canvasState
                    }));
                    break;
                    
                case 'check_cooldown':
                    const status = canPlacePixel(clientIP);
                    console.log('Cooldown check for', clientIP, ':', status);
                    ws.send(JSON.stringify({
                        type: 'cooldown_status',
                        allowed: status.allowed,
                        remainingTime: status.remainingTime
                    }));
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected:', clientIP);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function handlePixelUpdate(data, wss, clientIP, ws) {
    const { x, y, color, previousColor } = data;
    
    console.log('Pixel update request from', clientIP, ':', x, y, color);
    
    // Validate the pixel data
    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
        console.log('Invalid pixel data');
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid pixel data'
        }));
        return;
    }
    
    // Check if the color is allowed
    if (!ALLOWED_COLORS.has(color)) {
        console.log('Invalid color:', color);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid color'
        }));
        return;
    }
    
    // Check if client can place a pixel (server-side rate limiting)
    const cooldownStatus = canPlacePixel(clientIP);
    if (!cooldownStatus.allowed) {
        console.log(`Client ${clientIP} is on cooldown, remaining:`, cooldownStatus.remainingTime);
        ws.send(JSON.stringify({
            type: 'cooldown_error',
            message: 'You must wait before placing another pixel',
            remainingTime: cooldownStatus.remainingTime,
            x: x,
            y: y,
            previousColor: previousColor // Send back previous color for rollback
        }));
        return;
    }
    
    // Set cooldown for this IP
    const cooldownEnd = setCooldown(clientIP);
    console.log(`Cooldown set for ${clientIP}, ends at:`, cooldownEnd);
    
    // Update canvas state
    const key = `${x},${y}`;
    canvasState[key] = color;
    
    // Add to timelapse
    addToTimelapse(x, y, color, clientIP);
    
    // Save to file immediately after placing a pixel
    saveCanvasData();
    
    // Broadcast to all connected clients
    const message = JSON.stringify({
        type: 'pixel',
        x: x,
        y: y,
        color: color,
        timestamp: Date.now()
    });
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
    
    // Notify the sender of their new cooldown
    console.log('Sending cooldown_started to', clientIP);
    ws.send(JSON.stringify({
        type: 'cooldown_started',
        cooldownEnd: cooldownEnd
    }));
    
    console.log(`Pixel placed at (${x}, ${y}) with color ${color} by ${clientIP}`);
}

function getCanvasState() {
    return canvasState;
}

function setCanvasState(state) {
    canvasState = state;
}

// Export all functions properly
module.exports = handleWebSocketConnection;
module.exports.handleWebSocketConnection = handleWebSocketConnection;
module.exports.getCanvasState = getCanvasState;
module.exports.setCanvasState = setCanvasState;
module.exports.saveCanvasData = saveCanvasData;
module.exports.getTimelapseData = () => timelapseData;
module.exports.saveTimelapseData = saveTimelapseData;