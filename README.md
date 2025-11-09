# SSPS Place

A real-time collaborative pixel art canvas inspired by Reddit's r/place.

![SSPS Place](https://img.shields.io/badge/canvas-192x108-blue) ![cooldown](https://img.shields.io/badge/cooldown-10s-orange) ![websocket](https://img.shields.io/badge/websocket-realtime-green)

## Features

- 🎨 **192×108 pixel canvas** with 16 color palette
- ⏱️ **10-second cooldown** between pixel placements (1 second for localhost)
- 🔄 **Real-time synchronization** using WebSockets
- 📱 **Mobile-friendly** with pinch-to-zoom and pan
- 🖱️ **Desktop controls** - mouse wheel zoom, click & drag to pan
- 💾 **Persistent canvas** - saves automatically to JSON
- 📹 **Timelapse recording** - every pixel placement is logged with timestamp and hostname
- 🖼️ **Viewer mode** - fullscreen canvas without controls
- 🎯 **Optimistic updates** - instant pixel placement with server validation
- 🔒 **Server-side rate limiting** - IP-based cooldown enforcement
- 🌐 **Hostname tracking** - records device names in timelapse data

## Screenshots

### Main Editor
The main canvas with color palette and controls.

### Viewer Mode
Fullscreen canvas view without UI elements.

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ssps-place.git

# Navigate to project
cd ssps-place

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Placing Pixels
1. Open `http://localhost:3000` in your browser
2. Select a color from the 16-color palette
3. Click on the canvas to place a pixel
4. Wait for the cooldown before placing another pixel

### Controls

**Desktop:**
- 🖱️ **Click & drag** - Pan around the canvas
- 🖱️ **Mouse wheel** - Zoom in/out (0.2x to 10x)
- 🖱️ **Click** - Place a pixel

**Mobile:**
- 👆 **One finger drag** - Pan around the canvas
- 🤏 **Pinch with two fingers** - Zoom in/out
- 👉 **Quick tap** - Place a pixel

### Viewer Mode

Access the fullscreen viewer at `http://localhost:3000/viewer.html` - perfect for displaying on a TV or projector!

## Color Palette

The palette uses 16 carefully selected colors inspired by retro pixel art:

```
#1a1c2c  #5d275d  #b13e53  #ef7d57
#ffcd75  #a7f070  #38b764  #257179
#29366f  #3b5dc9  #41a6f6  #73eff7
#f4f4f4  #94b0c2  #566c86  #333c57
```

## Technologies

- **Frontend**: HTML5 Canvas, Vanilla JavaScript, CSS3
- **Backend**: Node.js, WebSocket (ws library)
- **Data Storage**: JSON files

## File Structure

```
ssps-place/
├── src/
│   ├── index.html          # Main editor page
│   ├── viewer.html         # Fullscreen viewer
│   ├── css/
│   │   └── style.css       # Styles for editor
│   └── js/
│       ├── app.js          # Main application logic & cooldown
│       ├── canvas.js       # Canvas rendering & zoom/pan
│       ├── websocket.js    # WebSocket client
│       └── canvas-viewer.js # Viewer logic
├── server/
│   ├── server.js           # Express & WebSocket server
│   ├── websocket-handler.js # WebSocket & rate limiting logic
│   ├── canvas-data.json    # Current canvas state (auto-saved)
│   └── timelapse-data.json # Pixel placement history
├── package.json
├── .gitignore
└── README.md
```

## Data Persistence

### Canvas Data (`canvas-data.json`)
Stores the current state of all placed pixels:
```json
{
  "50,25": "#1a1c2c",
  "51,25": "#f4f4f4"
}
```

### Timelapse Data (`timelapse-data.json`)
Records every pixel placement with full history:
```json
[
  {
    "x": 50,
    "y": 25,
    "color": "#1a1c2c",
    "timestamp": 1731196800000,
    "ip": "192.168.1.5",
    "hostname": "Johns-iPhone"
  }
]
```

## Configuration

### Cooldown Times
Edit `server/websocket-handler.js`:
```javascript
const COOLDOWN_TIME = 10 * 1000; // 10 seconds
const LOCALHOST_COOLDOWN_TIME = 1 * 1000; // 1 second for localhost
```

### Canvas Size
Edit `src/js/canvas.js` and `src/js/canvas-viewer.js`:
```javascript
const GRID_WIDTH = 192;  // pixels wide
const GRID_HEIGHT = 108; // pixels tall
```

### Zoom Limits
Edit zoom functions in canvas files:
```javascript
const newScale = Math.min(Math.max(0.2, scale * zoom), 10);
// Min: 0.2x (20%), Max: 10x (1000%)
```

## Deployment

### Quick Deploy with Ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start server
npm start

# In another terminal
ngrok http 3000
```

### Deploy to Render.com
1. Push code to GitHub
2. Create account at [render.com](https://render.com)
3. New Web Service → Connect repository
4. Build: `npm install`
5. Start: `npm start`
6. Deploy!

## Development

Run in development mode with auto-restart:
```bash
npm install -g nodemon
nodemon server/server.js
```

## API / WebSocket Messages

### Client → Server
- `request_canvas` - Request full canvas state
- `check_cooldown` - Check current cooldown status
- `pixel` - Place a pixel with x, y, color

### Server → Client
- `canvas_state` - Full canvas data
- `pixel` - New pixel placed (broadcast to all)
- `cooldown_started` - Cooldown activated
- `cooldown_status` - Current cooldown info
- `cooldown_error` - Placement rejected

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use and modify!

## Credits

Inspired by Reddit's [r/place](https://www.reddit.com/r/place/) collaborative art project.

---

Made with ❤️ by [Your Name]