let socket = null;
let reconnectInterval = null;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    
    // On production (Render, etc.), use the same host without port
    // On localhost, use port 3000
    let wsUrl;
    if (window.location.port) {
        // Development - use the current port
        wsUrl = `${protocol}//${host}:${window.location.port}`;
    } else {
        // Production - no port needed (uses 80/443)
        wsUrl = `${protocol}//${host}`;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = function(event) {
        console.log('Connected to WebSocket server');
        updateConnectionStatus(true);
        
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        
        // Request full canvas state
        socket.send(JSON.stringify({ type: 'request_canvas' }));
        
        // Check if we have an active cooldown on the server
        socket.send(JSON.stringify({ type: 'check_cooldown' }));
    };
    
    socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
    
    socket.onclose = function(event) {
        console.log('Disconnected from WebSocket server');
        updateConnectionStatus(false);
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectInterval) {
            reconnectInterval = setTimeout(() => {
                console.log('Attempting to reconnect...');
                connectWebSocket();
            }, 3000);
        }
    };
}

function sendPixelUpdate(x, y, color, previousColor) {
    console.log('sendPixelUpdate called with:', x, y, color);
    console.log('Socket state:', socket ? socket.readyState : 'socket is null');
    
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
            type: 'pixel',
            x: x,
            y: y,
            color: color,
            previousColor: previousColor, // Store for potential rollback
            timestamp: Date.now()
        });
        console.log('Sending message to server:', message);
        socket.send(message);
        return true;
    } else {
        console.error('WebSocket is not connected. ReadyState:', socket ? socket.readyState : 'null');
        // Rollback the optimistic update
        if (previousColor) {
            drawPixel(x, y, previousColor);
        }
        alert('Not connected to server! Please refresh the page.');
        return false;
    }
}

function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        if (isConnected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'connected';
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'disconnected';
        }
    }
}

// Handle incoming messages from server
function handleIncomingMessage(data) {
    console.log('Received message:', data.type);
    
    switch (data.type) {
        case 'pixel':
            // Another user placed a pixel (or server confirmed ours)
            if (typeof drawPixel === 'function') {
                drawPixel(data.x, data.y, data.color);
            }
            break;
            
        case 'canvas_state':
            // Full canvas state received
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas(data.pixels);
            }
            break;
            
        case 'cooldown_started':
            // Server confirmed our pixel and started cooldown
            console.log('Cooldown started, ends at:', data.cooldownEnd);
            if (typeof window.startCooldown === 'function') {
                window.startCooldown(data.cooldownEnd);
            }
            break;
            
        case 'cooldown_status':
            // Server sent us our current cooldown status
            console.log('Cooldown status:', data);
            if (!data.allowed && data.remainingTime > 0) {
                const cooldownEnd = Date.now() + data.remainingTime;
                console.log('Active cooldown detected, ends at:', cooldownEnd);
                if (typeof window.startCooldown === 'function') {
                    window.startCooldown(cooldownEnd);
                }
            }
            break;
            
        case 'cooldown_error':
            // Server rejected our pixel due to cooldown - ROLLBACK!
            console.warn('Pixel rejected by server:', data.message);
            
            // Rollback the optimistic update
            if (data.x !== undefined && data.y !== undefined && data.previousColor) {
                console.log('Rolling back pixel at', data.x, data.y, 'to', data.previousColor);
                if (typeof drawPixel === 'function') {
                    drawPixel(data.x, data.y, data.previousColor);
                }
            }
            
            alert('⏳ ' + data.message);
            
            // Sync our cooldown with server
            if (data.remainingTime) {
                const cooldownEnd = Date.now() + data.remainingTime;
                if (typeof window.startCooldown === 'function') {
                    window.startCooldown(cooldownEnd);
                }
            }
            break;
            
        case 'error':
            console.error('Server error:', data.message);
            alert('Error: ' + data.message);
            break;
            
        default:
            console.log('Unknown message type:', data.type);
    }
}

// Initialize connection when script loads
connectWebSocket();