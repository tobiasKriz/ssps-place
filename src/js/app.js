// Application state
let currentColor = '#1a1c2c';
let canPlace = true;
let cooldownEndTime = null;

// Test the timer display immediately
console.log('App.js loaded');
console.log('Timer element:', document.getElementById('timer-display'));

// Server will tell us when cooldown starts - make it globally accessible
window.startCooldown = function(endTime) {
    console.log('startCooldown called with endTime:', endTime);
    console.log('Current time:', Date.now());
    console.log('Time difference (ms):', endTime - Date.now());
    
    canPlace = false;
    cooldownEndTime = endTime;
    updateCanvasCursor(false);
    updateTimerDisplay(); // Update immediately
}

window.endCooldown = function() {
    console.log('endCooldown called');
    canPlace = true;
    cooldownEndTime = null;
    updateCanvasCursor(true);
    updateTimerDisplay(); // Update immediately
}

// Test function - call this from console to test cooldown
window.testCooldown = function() {
    const testEndTime = Date.now() + 30000; // 30 seconds from now
    console.log('Testing cooldown for 30 seconds...');
    window.startCooldown(testEndTime);
}

// Initialize the application
function initApp() {
    setupColorPicker();
    setupCanvasClick();
    startCooldownTimer();
}

// Setup color picker functionality
function setupColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    console.log('Found color options:', colorOptions.length);
    
    // Set first color as default
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('selected');
        currentColor = colorOptions[0].dataset.color;
        updateSelectedColorDisplay();
    }
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            console.log('Color clicked:', option.dataset.color);
            
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update current color
            currentColor = option.dataset.color;
            updateSelectedColorDisplay();
            
            console.log('Current color set to:', currentColor);
        });
    });
}

function updateSelectedColorDisplay() {
    const currentColorDisplay = document.getElementById('current-color');
    if (currentColorDisplay) {
        currentColorDisplay.style.backgroundColor = currentColor;
    }
}

// Setup canvas click handler
function setupCanvasClick() {
    const canvas = document.getElementById('rplace-canvas');
    
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    console.log('Canvas click handler set up');
    
    // Make this function globally accessible for touch events and mouse clicks
    window.handleCanvasClick = function(x, y) {
        console.log('handleCanvasClick called', 'canPlace:', canPlace, 'color:', currentColor);
        
        if (!canPlace) {
            showCooldownMessage();
            return;
        }
        
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            // Store the previous pixel color for rollback
            const previousColor = getPixelColor(x, y);
            
            // Optimistic update: Draw pixel immediately
            drawPixel(x, y, currentColor);
            
            // Send to server - if rejected, we'll roll back
            sendPixelUpdate(x, y, currentColor, previousColor);
        }
    };
    
    // Note: Click handling is now done in canvas.js to prevent pixel placement during panning
}

function startCooldownTimer() {
    setInterval(() => {
        updateTimerDisplay();
    }, 100);
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    
    if (!timerDisplay) {
        console.error('Timer display element not found!');
        return;
    }
    
    if (!canPlace && cooldownEndTime) {
        const remaining = cooldownEndTime - Date.now();
        
        console.log('Updating timer, remaining:', remaining);
        
        if (remaining <= 0) {
            window.endCooldown();
            timerDisplay.textContent = 'Ready to place!';
            timerDisplay.classList.remove('cooldown');
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerDisplay.textContent = `Cooldown: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.classList.add('cooldown');
        }
    } else {
        timerDisplay.textContent = 'Ready to place!';
        timerDisplay.classList.remove('cooldown');
    }
}

function updateCanvasCursor(enabled) {
    const canvas = document.getElementById('rplace-canvas');
    if (canvas) {
        if (enabled) {
            canvas.classList.remove('cooldown');
        } else {
            canvas.classList.add('cooldown');
        }
    }
}

function showCooldownMessage() {
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = '⏳ Please wait for cooldown!';
    
    setTimeout(() => {
        updateTimerDisplay();
    }, 2000);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}