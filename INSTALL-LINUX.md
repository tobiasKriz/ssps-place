# SSPS Place - Linux Installation Guide

## Quick Setup for Old PC / Raspberry Pi

This guide will help you set up SSPS Place on an old PC or Raspberry Pi running Linux (Ubuntu, Debian, Raspberry Pi OS, etc.) with automatic startup on boot.

## Requirements

- Ubuntu/Debian/Raspberry Pi OS (or similar)
- Sudo access
- Internet connection (for initial setup)

## Installation Steps

### 1. Transfer the Project to Your Linux PC

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/ssps-place.git
cd ssps-place
```

**Option B: Using USB/Network Transfer**
- Copy the entire `ssps-place` folder to your Linux PC
- Navigate to the folder: `cd ~/ssps-place`

### 2. Run the Setup Script

```bash
# Make the script executable
chmod +x setup-linux.sh

# Run the setup script
./setup-linux.sh
```

The script will automatically:
- ✅ Install Node.js and dependencies
- ✅ Install npm packages
- ✅ Create a systemd service
- ✅ Enable auto-start on boot
- ✅ Start the server immediately
- ✅ Display your local network IP address

### 3. Access SSPS Place

After installation, the script will show you the URL to access your canvas:

```
Local:   http://localhost:3000
Network: http://192.168.1.XXX:3000
```

Share the **Network URL** with others on your local network!

## 🌐 Optional: Set Up a Custom Local Domain

Instead of using `http://192.168.1.XXX:3000`, you can access your server with a custom domain like `http://ssps-place.local:3000`!

### Option 1: Local DNS Server (Automatic for All Devices)

Run this script on your Linux server:

```bash
# Make the DNS setup script executable
chmod +x setup-local-dns.sh

# Run it as root
sudo ./setup-local-dns.sh
```

Follow the prompts to set up a custom domain (e.g., `ssps-place.local`).

Then, on each device on your network:
1. Go to WiFi/Network Settings
2. Change DNS server to your server's IP (e.g., `192.168.1.100`)
3. Access: `http://ssps-place.local:3000`

### Option 2: Router DNS (Easiest - Automatic)

1. Log into your router admin panel (usually `192.168.1.1`)
2. Find "DNS Settings" or "Local DNS" or "DHCP Settings"
3. Add a custom DNS entry:
   - **Hostname:** `ssps-place.local`
   - **IP Address:** Your server's IP
4. Save and reboot router

Now everyone automatically uses: `http://ssps-place.local:3000`

### Option 3: Hosts File (Per-Device)

**On Windows:**
1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add: `192.168.1.XXX    ssps-place.local`
4. Save

**On Linux/Mac:**
```bash
sudo nano /etc/hosts
# Add: 192.168.1.XXX    ssps-place.local
```

**On Android/iOS:** Use a hosts editor app

## Managing the Service

### Check Status
```bash
sudo systemctl status ssps-place
```

### Stop the Server
```bash
sudo systemctl stop ssps-place
```

### Start the Server
```bash
sudo systemctl start ssps-place
```

### Restart the Server
```bash
sudo systemctl restart ssps-place
```

### View Live Logs
```bash
sudo journalctl -u ssps-place -f
```

### Disable Auto-Start
```bash
sudo systemctl disable ssps-place
```

### Enable Auto-Start Again
```bash
sudo systemctl enable ssps-place
```

## Accessing Data Files

Your canvas and timelapse data are stored in:
```bash
cd ~/ssps-place/server/
ls -l canvas-data.json timelapse-data.json
```

### Download Timelapse via API
```
http://YOUR_IP:3000/api/timelapse
```

### View Timelapse Data
```
http://YOUR_IP:3000/api/timelapse/view
```

## Firewall Configuration

If you're using UFW firewall, allow port 3000:
```bash
sudo ufw allow 3000
sudo ufw reload
```

## Finding Your IP Address

```bash
hostname -I
```

The first IP address shown is usually your local network IP (e.g., 192.168.1.100).

## Troubleshooting

### Service won't start
```bash
# Check logs for errors
sudo journalctl -u ssps-place -xe

# Check if port 3000 is already in use
sudo netstat -tulpn | grep 3000
```

### Can't access from other devices
1. Check firewall settings
2. Make sure both devices are on the same network
3. Try pinging the server: `ping YOUR_SERVER_IP`

### Server stops after reboot
```bash
# Make sure service is enabled
sudo systemctl enable ssps-place

# Check service status
sudo systemctl status ssps-place
```

## Updating SSPS Place

```bash
cd ~/ssps-place

# Stop the service
sudo systemctl stop ssps-place

# Pull latest changes (if using git)
git pull origin main

# Install any new dependencies
npm install

# Start the service
sudo systemctl start ssps-place
```

## Uninstalling

```bash
# Stop and disable the service
sudo systemctl stop ssps-place
sudo systemctl disable ssps-place

# Remove the service file
sudo rm /etc/systemd/system/ssps-place.service

# Reload systemd
sudo systemctl daemon-reload

# Remove the project folder
rm -rf ~/ssps-place
```

## Hardware Recommendations

### Minimum Requirements
- **CPU:** Any dual-core processor (even old ones work!)
- **RAM:** 512MB minimum, 1GB recommended
- **Storage:** 2GB free space
- **Network:** Ethernet or WiFi

### Works Great On:
- ✅ Old laptops/desktops (2010+)
- ✅ Raspberry Pi 3/4
- ✅ Thin clients
- ✅ Old office PCs

### Power Consumption
A Raspberry Pi or old laptop typically uses **5-10W** of power (costs ~$1-2/month to run 24/7).

## Performance Tips

### For Very Old PCs
If your PC is very old, consider:
1. Using a lightweight Linux distro (Ubuntu Server, Debian)
2. Disabling the desktop environment (use headless mode)
3. Reducing cooldown time if you have few users

### Monitor Resources
```bash
# Check CPU and memory usage
htop

# Or use top
top
```

## Security Notes

Since this is running on your **local network only**, it's relatively secure. However:

1. **Don't port forward** to the internet without adding authentication
2. **Keep your Linux system updated**: `sudo apt update && sudo apt upgrade`
3. **Use a strong WiFi password** for your network

## Support

If you encounter issues:
1. Check the logs: `sudo journalctl -u ssps-place -xe`
2. Verify Node.js is installed: `node -v`
3. Check if the service is running: `sudo systemctl status ssps-place`

---

**Enjoy your local SSPS Place server! 🎨**
