#!/bin/bash

echo "=========================================="
echo "   SSPS Place - Linux Setup Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please do not run as root. Run as a normal user."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y curl git

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed ($(node -v))"
fi

# Install npm packages
echo "📦 Installing npm dependencies..."
npm install

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Create systemd service file
echo "🔧 Creating systemd service..."

SERVICE_FILE="/etc/systemd/system/ssps-place.service"

sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=SSPS Place - Collaborative Pixel Art Canvas
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=/usr/bin/node $SCRIPT_DIR/server/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ssps-place

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🔧 Enabling service to start on boot..."
sudo systemctl daemon-reload
sudo systemctl enable ssps-place.service

# Start the service
echo "🚀 Starting SSPS Place server..."
sudo systemctl start ssps-place.service

# Wait a moment for service to start
sleep 2

# Check service status
if sudo systemctl is-active --quiet ssps-place.service; then
    echo ""
    echo "=========================================="
    echo "✅ SSPS Place is now running!"
    echo "=========================================="
    echo ""
    echo "🌐 Access the canvas at:"
    echo "   Local:   http://localhost:3000"
    echo "   Network: http://$LOCAL_IP:3000"
    echo ""
    echo "📊 Useful commands:"
    echo "   Status:  sudo systemctl status ssps-place"
    echo "   Stop:    sudo systemctl stop ssps-place"
    echo "   Start:   sudo systemctl start ssps-place"
    echo "   Restart: sudo systemctl restart ssps-place"
    echo "   Logs:    sudo journalctl -u ssps-place -f"
    echo ""
    echo "🔄 The server will automatically start on boot!"
    echo "=========================================="
else
    echo ""
    echo "❌ Failed to start SSPS Place"
    echo "Check logs with: sudo journalctl -u ssps-place -xe"
    exit 1
fi
