const canvas = document.getElementById('rplace-canvas');
const ctx = canvas.getContext('2d');

// Canvas configuration
const GRID_WIDTH = 192;
const GRID_HEIGHT = 108;
const PIXEL_SIZE = 10;

canvas.width = GRID_WIDTH * PIXEL_SIZE;
canvas.height = GRID_HEIGHT * PIXEL_SIZE;

// Store all pixels
let pixelData = {};

// Zoom and pan variables
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let lastTouchDistance = 0;
let startX = 0;
let startY = 0;

// WebSocket connection
let socket = null;
let reconnectInterval = null;

// Initialize
function init() {
    initCanvas();
    setupControls();
    connectWebSocket();
}

function initCanvas() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setupControls() {
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
}

// Mouse wheel zoom
function handleWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(0.2, scale * zoom), 10); // Changed to 0.2
    
    translateX = mouseX - (mouseX - translateX) * (newScale / scale);
    translateY = mouseY - (mouseY - translateY) * (newScale / scale);
    
    scale = newScale;
    redrawCanvas();
}

// Mouse drag
function handleMouseDown(e) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    e.preventDefault();
}

function handleMouseMove(e) {
    if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        redrawCanvas();
        e.preventDefault();
    }
}

function handleMouseUp() {
    isDragging = false;
}

// Touch events
function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 2) {
        lastTouchDistance = getTouchDistance(e.touches);
    } else if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches);
        if (lastTouchDistance > 0) {
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const rect = canvas.getBoundingClientRect();
            const canvasCenterX = centerX - rect.left;
            const canvasCenterY = centerY - rect.top;
            
            const zoom = currentDistance / lastTouchDistance;
            const newScale = Math.min(Math.max(0.2, scale * zoom), 10); // Changed to 0.2
            
            translateX = canvasCenterX - (canvasCenterX - translateX) * (newScale / scale);
            translateY = canvasCenterY - (canvasCenterY - translateY) * (newScale / scale);
            
            scale = newScale;
            redrawCanvas();
        }
        lastTouchDistance = currentDistance;
    } else if (e.touches.length === 1 && isDragging) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        redrawCanvas();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        lastTouchDistance = 0;
    }
    if (e.touches.length === 0) {
        isDragging = false;
    }
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Canvas drawing
function redrawCanvas() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (const [key, color] of Object.entries(pixelData)) {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
    
    ctx.restore();
}

function drawPixel(x, y, color) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
    
    pixelData[`${x},${y}`] = color;
    
    if (scale !== 1 || translateX !== 0 || translateY !== 0) {
        redrawCanvas();
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
}

function renderFullCanvas(pixels) {
    pixelData = { ...pixels };
    redrawCanvas();
}

// WebSocket
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port;
    
    // Build WebSocket URL
    let wsUrl;
    if (port && port !== '80' && port !== '443') {
        // Development or custom port - include the port
        wsUrl = `${protocol}//${host}:${port}`;
    } else {
        // Production (no port or standard ports 80/443)
        wsUrl = `${protocol}//${host}`;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = function() {
        console.log('Connected to server');
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        socket.send(JSON.stringify({ type: 'request_canvas' }));
    };
    
    socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    socket.onclose = function() {
        console.log('Disconnected from server');
        if (!reconnectInterval) {
            reconnectInterval = setTimeout(() => {
                console.log('Reconnecting...');
                connectWebSocket();
            }, 3000);
        }
    };
    
    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function handleMessage(data) {
    switch (data.type) {
        case 'pixel':
            drawPixel(data.x, data.y, data.color);
            break;
        case 'canvas_state':
            renderFullCanvas(data.pixels);
            break;
    }
}

// Start
init();
