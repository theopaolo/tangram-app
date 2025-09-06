# 📱 Camera Setup for Mobile Testing

This guide explains how to set up HTTPS for testing the QR scanner on mobile devices.

## 🔐 Why HTTPS is Required

Modern browsers require **HTTPS** for camera access when connecting from network IP addresses (non-localhost). This is a security requirement.

## 🚀 Quick Setup

### When You Change Networks

Every time you connect to a new WiFi network, run:

```bash
npm run setup-ssl
```

This will:
1. 🔍 Detect your current network IP
2. 🔐 Generate SSL certificates for that IP
3. 📱 Show you the URLs to access from mobile

### Alternative Manual Method

```bash
# Get your current IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

# Generate certificate (replace 192.168.1.X with your IP)
mkcert -key-file .certs/localhost-key.pem -cert-file .certs/localhost.pem localhost 127.0.0.1 ::1 192.168.1.X
```

## 📲 Accessing from Mobile

1. **Run the setup**: `npm run setup-ssl`
2. **Start the server**: `npm run dev`
3. **On your mobile device**: Navigate to `https://YOUR_IP:5173/scanner`
4. **Accept the security warning**:
   - Tap "Advanced"
   - Tap "Proceed to [IP] (unsafe)"
5. **Allow camera permissions** when prompted

## 🔧 URLs After Setup

- **Desktop**: `https://localhost:5173/`
- **Mobile**: `https://192.168.1.X:5173/` (where X is your current IP)

## 🐛 Troubleshooting

### "Unable to access camera" Error
- ✅ Make sure you're using HTTPS (not HTTP)
- ✅ Accept the security certificate warning
- ✅ Allow camera permissions in browser
- ✅ Try refreshing the page

### "Connection is not secure" Warning
- This is normal for local development
- Tap "Advanced" → "Proceed anyway"
- The warning appears because we're using self-signed certificates

### Camera Works on Desktop but Not Mobile
- ✅ Verify you're using the HTTPS URL on mobile
- ✅ Check that both devices are on the same network
- ✅ Run `npm run setup-ssl` to regenerate certificates

## 🔄 Network Change Workflow

1. Connect to new WiFi network
2. Run: `npm run setup-ssl`
3. Restart dev server: `npm run dev`
4. Access new URL from mobile device

## 📁 Files

- **`.certs/`** - SSL certificates (auto-generated, not in git)
- **`scripts/setup-ssl.sh`** - Automated setup script
- **`vite.config.js`** - HTTPS configuration
