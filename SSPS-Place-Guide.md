# SSPS Place
## Collaborative Pixel Art Canvas

---

## What is SSPS Place?

SSPS Place is a real-time collaborative pixel art canvas inspired by Reddit's r/place. It allows multiple users to work together to create pixel art by placing one pixel at a time.

**Key Features:**
- 🎨 192×108 pixel canvas with 16 beautiful colors
- ⏱️ 10-second cooldown between pixel placements
- 🔄 Real-time synchronization - see other users' pixels instantly
- 📱 Works on phones, tablets, and computers
- 🖱️ Easy zoom and pan controls
- 💾 Your artwork is saved automatically

---

## How to Connect

### Option 1: Using the Domain Name

Simply visit:

```
http://krizan.site:3000
```

**[QR CODE PLACEHOLDER - Insert QR code here]**

### Option 2: Direct IP Connection

If the domain doesn't work, use the direct IP address:

```
http://192.168.0.83:3000
```

> **Note:** Both you and the server must be on the same local network (WiFi)

---

## How to Use SSPS Place

### Getting Started

1. **Open the website** using one of the connection methods above
2. **Select a color** from the 16-color palette on the left
3. **Click on the canvas** to place your pixel
4. **Wait 10 seconds** before placing your next pixel

### Desktop Controls

| Action | How to Do It |
|--------|--------------|
| **Place a pixel** | Click on the canvas |
| **Zoom in/out** | Scroll mouse wheel |
| **Pan around** | Click and drag |
| **Select color** | Click a color in the palette |

### Mobile/Tablet Controls

| Action | How to Do It |
|--------|--------------|
| **Place a pixel** | Tap on the canvas |
| **Zoom in/out** | Pinch with two fingers |
| **Pan around** | Drag with one finger |
| **Select color** | Tap a color in the palette |

---

## Understanding the Interface

### Color Palette
Located on the left side of the screen, you'll find 16 colors to choose from. The currently selected color is highlighted with a black border.

### Status Information
At the bottom of the color palette, you'll see:
- **Cooldown Timer** - Shows when you can place your next pixel
- **Connection Status** - Shows if you're connected (green) or disconnected (red)
- **Coordinates** - Shows your cursor position on the canvas

### The Canvas
The large grid in the center is where the collaborative art happens. Each square represents one pixel that can be any of the 16 colors.

---

## Tips & Tricks

### 🎯 **Work Together**
Coordinate with other users to create larger artworks. Communication makes amazing art!

### 🔍 **Zoom In for Detail**
Use the zoom feature to place pixels precisely when working on detailed areas.

### 🗺️ **Zoom Out for Overview**
Zoom out to see the full canvas and plan your next artwork.

### ⏱️ **Use Your Time Wisely**
You can only place one pixel every 10 seconds, so think about where to place it!

### 📱 **Mobile Friendly**
The color palette moves to the bottom of the screen on mobile devices for easy thumb access.

---

## Viewer Mode

Want to display the canvas on a TV or projector without controls?

Visit the viewer mode:

```
http://krizan.site:3000/viewer.html
```

This shows only the canvas in fullscreen - perfect for displaying your collaborative artwork!

---

## Troubleshooting

### ❌ Can't Connect to the Server

**Check these things:**
1. Are you connected to the **same WiFi network** as the server?
2. Is the server computer turned on and running?
3. Try refreshing the page (press F5 or pull down on mobile)
4. Try using the direct IP address instead: `http://192.168.0.83:3000`

### ❌ Connection Status Shows "Disconnected"

1. Check your WiFi connection
2. Refresh the page
3. Wait a few seconds - it may reconnect automatically

### ❌ Can't Place Pixels

1. **Check the cooldown timer** - You may need to wait
2. **Check connection status** - Make sure it shows "Connected" (green)
3. **Refresh the page** if the problem persists

### ❌ Pixels Disappear or Roll Back

This means the server rejected your pixel placement, usually because:
- You're still on cooldown (try placing too soon)
- Connection was lost temporarily

Simply wait for the cooldown and try again!

---

## Technical Details

### Canvas Specifications
- **Size:** 192 pixels wide × 108 pixels tall
- **Total pixels:** 20,736 individual pixels
- **Aspect ratio:** 16:9 (widescreen format)

### Color Palette (16 Colors)
The palette uses carefully selected colors inspired by retro pixel art:

| Dark Tones | Mid Tones | Bright Tones | Special |
|------------|-----------|--------------|---------|
| Dark Purple | Teal | Light Green | White |
| Purple | Dark Blue | Light Orange | Light Gray |
| Mauve | Blue | Cyan | Gray |
| Peach | Light Blue | - | Dark Gray |

### System Requirements

**Desktop/Laptop:**
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection to the local network
- Mouse or trackpad

**Mobile/Tablet:**
- iOS Safari, Chrome, or any modern mobile browser
- Android 5.0+ recommended
- Touch screen

---

## Privacy & Data

### What Gets Saved?
- Your pixel placements (coordinates and colors)
- Your IP address and device hostname (for cooldown tracking)
- Timestamp of each pixel placement

### Who Can See It?
- Only users on the **same local network** can access SSPS Place
- Your artwork is stored locally on the server
- No data is sent to the internet

### Cooldown System
The 10-second cooldown prevents spam and ensures everyone gets a fair chance to contribute. The cooldown is tracked by your device's IP address.

---

## API Endpoints (Advanced)

For developers and data enthusiasts:

### View Timelapse Data
```
http://krizan.site:3000/api/timelapse/view
```
Shows every pixel placement with timestamps - perfect for creating time-lapse videos!

### Download Timelapse
```
http://krizan.site:3000/api/timelapse
```
Downloads the complete history as a JSON file.

### View Current Canvas
```
http://krizan.site:3000/api/canvas/view
```
Shows the current state of all pixels.

### Download Canvas Data
```
http://krizan.site:3000/api/canvas
```
Downloads the current canvas as a JSON file.

---

## Frequently Asked Questions

### Q: How many people can use it at once?
**A:** Unlimited! As many people as can connect to your WiFi network.

### Q: Can I change the cooldown time?
**A:** Yes, if you have access to the server settings. Contact the administrator.

### Q: What happens if the server restarts?
**A:** Your artwork is saved automatically and will be restored when the server starts again.

### Q: Can I undo a pixel?
**A:** No, but you can place a different color pixel in the same spot after the cooldown.

### Q: Can people outside the network access it?
**A:** No, this is a local network only project for privacy and security.

### Q: Why is there a cooldown?
**A:** To prevent spam and give everyone a fair chance to contribute to the artwork.

### Q: Can I download the final artwork?
**A:** Yes! Use the API endpoints above or ask the server administrator for the canvas data.

---

## Credits

**SSPS Place** is inspired by Reddit's r/place collaborative art experiment.

**Technology Stack:**
- Frontend: HTML5 Canvas, JavaScript, CSS
- Backend: Node.js, WebSocket
- Real-time communication for instant pixel updates

---

## Support & Contact

If you encounter any issues:
1. Try the troubleshooting steps above
2. Refresh your browser
3. Contact the server administrator
4. Check that you're connected to the correct WiFi network

---

## Let's Create Something Amazing! 🎨

SSPS Place is all about collaboration and creativity. Every pixel matters, and together we can create beautiful artwork. Have fun and be creative!

---

**Connection Information:**
- **Domain:** http://krizan.site:3000
- **Direct IP:** http://192.168.0.83:3000
- **Viewer Mode:** http://krizan.site:3000/viewer.html

**[QR CODE PLACEHOLDER - Insert QR code here]**

---

*Last Updated: November 9, 2024*
