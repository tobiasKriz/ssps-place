#!/bin/bash

echo "=========================================="
echo "   SSPS Place - Local DNS Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root: sudo $0"
    exit 1
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "Your server IP: $LOCAL_IP"
echo ""
read -p "Enter the domain name you want (e.g., ssps-place.local): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME="ssps-place.local"
    echo "Using default: $DOMAIN_NAME"
fi

# Install dnsmasq
echo "📦 Installing dnsmasq..."
apt-get update
apt-get install -y dnsmasq

# Backup original config
cp /etc/dnsmasq.conf /etc/dnsmasq.conf.backup

# Create dnsmasq configuration
echo "🔧 Configuring dnsmasq..."

cat > /etc/dnsmasq.d/ssps-place.conf <<EOF
# SSPS Place Local DNS Configuration
address=/$DOMAIN_NAME/$LOCAL_IP
listen-address=127.0.0.1,$LOCAL_IP
bind-interfaces
EOF

# Restart dnsmasq
echo "🔄 Restarting dnsmasq..."
systemctl restart dnsmasq
systemctl enable dnsmasq

# Check if dnsmasq is running
if systemctl is-active --quiet dnsmasq; then
    echo ""
    echo "=========================================="
    echo "✅ Local DNS Server is Running!"
    echo "=========================================="
    echo ""
    echo "🌐 Your custom domain: http://$DOMAIN_NAME:3000"
    echo ""
    echo "📋 To use this domain on other devices:"
    echo "   1. Go to WiFi/Network settings"
    echo "   2. Change DNS server to: $LOCAL_IP"
    echo "   3. Access: http://$DOMAIN_NAME:3000"
    echo ""
    echo "🔧 Or use your router's DHCP settings to"
    echo "   automatically set $LOCAL_IP as DNS server"
    echo ""
    echo "=========================================="
else
    echo ""
    echo "❌ Failed to start dnsmasq"
    echo "Check logs with: journalctl -u dnsmasq -xe"
    exit 1
fi
