const canvas = document.getElementById('rplace-canvas');
const ctx = canvas.getContext('2d');

// Canvas configuration
const GRID_WIDTH = 192;  // Number of pixels wide
const GRID_HEIGHT = 108; // Number of pixels tall
const PIXEL_SIZE = 10;    // Size of each pixel in screen pixels

canvas.width = GRID_WIDTH * PIXEL_SIZE;
canvas.height = GRID_HEIGHT * PIXEL_SIZE;

// Store all pixels
let pixelData = {};

// Get the current color of a pixel (for optimistic updates)
function getPixelColor(x, y) {
    const key = `${x},${y}`;
    return pixelData[key] || '#FFFFFF'; // Default to white if not set
}

// Zoom and pan variables for mobile
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let lastTouchDistance = 0;
let startX = 0;
let startY = 0;
let wasZooming = false;
let wasDragging = false;
let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let isZooming = false; // Track if currently zooming
let mouseDownX = 0; // Track mouse down position
let mouseDownY = 0;
let mouseMoved = false; // Track if mouse moved during drag

// Initialize canvas with white background
function initCanvas() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    drawGrid();
    
    // Setup touch events for mobile zoom/pan
    setupTouchControls();
}

function setupTouchControls() {
    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse wheel zoom for desktop
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Mouse drag for desktop
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
}

function handleWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(0.2, scale * zoom), 10); // Changed to 0.2
    
    // Zoom towards mouse position
    translateX = mouseX - (mouseX - translateX) * (newScale / scale);
    translateY = mouseY - (mouseY - translateY) * (newScale / scale);
    
    scale = newScale;
    redrawCanvas();
}

function handleMouseDown(e) {
    if (e.button === 0) { // Left click to drag
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        mouseMoved = false;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function handleMouseMove(e) {
    if (isDragging) {
        // Check if mouse moved significantly
        const moveDistance = Math.sqrt(
            Math.pow(e.clientX - mouseDownX, 2) + 
            Math.pow(e.clientY - mouseDownY, 2)
        );
        
        if (moveDistance > 3) {
            mouseMoved = true;
        }
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        redrawCanvas();
        e.preventDefault();
    }
}

function handleMouseUp(e) {
    const wasDraggingBefore = isDragging;
    const didMove = mouseMoved;
    
    isDragging = false;
    mouseMoved = false;
    canvas.style.cursor = 'crosshair';
    
    // Only place pixel if we weren't dragging
    if (wasDraggingBefore && !didMove && e.button === 0) {
        // This was a click, not a drag - allow pixel placement
        const { x, y } = getPixelCoordinates(e);
        if (window.handleCanvasClick) {
            window.handleCanvasClick(x, y);
        }
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    
    touchStartTime = Date.now();
    wasZooming = false;
    wasDragging = false;
    isZooming = false;
    
    if (e.touches.length === 2) {
        // Two finger pinch zoom
        lastTouchDistance = getTouchDistance(e.touches);
        wasZooming = true;
        isZooming = true;
        isDragging = false; // Disable dragging when zooming starts
    } else if (e.touches.length === 1) {
        // Single finger - could be tap or pan
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = true;
        startX = touch.clientX - translateX;
        startY = touch.clientY - translateY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 2) {
        // Pinch zoom - disable dragging completely during zoom
        wasZooming = true;
        isZooming = true;
        isDragging = false;
        
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
    } else if (e.touches.length === 1 && isDragging && !isZooming) {
        // Only allow panning if not currently zooming
        const touch = e.touches[0];
        const moveDistance = Math.sqrt(
            Math.pow(touch.clientX - touchStartX, 2) + 
            Math.pow(touch.clientY - touchStartY, 2)
        );
        
        // If moved more than 5 pixels, it's a drag not a tap
        if (moveDistance > 5) {
            wasDragging = true;
        }
        
        // Pan
        translateX = touch.clientX - startX;
        translateY = touch.clientY - startY;
        redrawCanvas();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        lastTouchDistance = 0;
        isZooming = false;
    }
    
    if (e.touches.length === 0) {
        isDragging = false;
        isZooming = false;
        
        const touchDuration = Date.now() - touchStartTime;
        const touch = e.changedTouches[0];
        const moveDistance = Math.sqrt(
            Math.pow(touch.clientX - touchStartX, 2) + 
            Math.pow(touch.clientY - touchStartY, 2)
        );
        
        // Only trigger pixel placement if:
        // 1. Was not zooming
        // 2. Was not dragging (moved less than 5 pixels)
        // 3. Touch duration was less than 500ms (quick tap)
        if (!wasZooming && !wasDragging && moveDistance < 5 && touchDuration < 500) {
            const rect = canvas.getBoundingClientRect();
            const clickEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            // Trigger click handler
            const coords = getPixelCoordinates(clickEvent);
            if (window.handleCanvasClick) {
                window.handleCanvasClick(coords.x, coords.y);
            }
        }
        
        // Reset flags
        wasZooming = false;
        wasDragging = false;
    }
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function redrawCanvas() {
    // Save current state
    ctx.save();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);
    
    // Redraw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all pixels
    for (const [key, color] of Object.entries(pixelData)) {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
    
    // Redraw grid
    drawGrid();
    
    // Restore state
    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    // Draw grid
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * PIXEL_SIZE, 0);
        ctx.lineTo(x * PIXEL_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * PIXEL_SIZE);
        ctx.lineTo(canvas.width, y * PIXEL_SIZE);
        ctx.stroke();
    }
}

function drawPixel(x, y, color) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        console.warn('Pixel out of bounds:', x, y);
        return;
    }
    
    console.log('Drawing pixel at', x, y, 'with color', color);
    
    // Store pixel in data structure first
    pixelData[`${x},${y}`] = color;
    
    // If we're zoomed or panned, redraw the entire canvas to maintain transformations
    if (scale !== 1 || translateX !== 0 || translateY !== 0) {
        redrawCanvas();
    } else {
        // Simple case: no transformation, draw directly
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        
        // Redraw grid line around this pixel
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
}

function getPixelCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Account for zoom and pan
    const canvasX = ((event.clientX - rect.left) * scaleX - translateX) / scale;
    const canvasY = ((event.clientY - rect.top) * scaleY - translateY) / scale;
    
    const x = Math.floor(canvasX / PIXEL_SIZE);
    const y = Math.floor(canvasY / PIXEL_SIZE);
    
    return { x, y };
}

function renderFullCanvas(pixels) {
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all pixels
    for (const [key, color] of Object.entries(pixels)) {
        const [x, y] = key.split(',').map(Number);
        drawPixel(x, y, color);
    }
    
    // Redraw grid
    drawGrid();
    
    pixelData = { ...pixels };
}

// Handle incoming WebSocket messages
function handleIncomingMessage(data) {
    switch (data.type) {
        case 'pixel':
            drawPixel(data.x, data.y, data.color);
            break;
            
        case 'canvas_state':
            renderFullCanvas(data.pixels);
            break;
            
        case 'error':
            console.error('Server error:', data.message);
            break;
    }
}

// Mouse hover to show coordinates
canvas.addEventListener('mousemove', (event) => {
    const { x, y } = getPixelCoordinates(event);
    const coordElement = document.getElementById('coordinates');
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
        coordElement.textContent = `x: ${x}, y: ${y}`;
    } else {
        coordElement.textContent = 'x: -, y: -';
    }
});

canvas.addEventListener('mouseleave', () => {
    const coordElement = document.getElementById('coordinates');
    coordElement.textContent = 'x: -, y: -';
});

// Initialize canvas on load
initCanvas();