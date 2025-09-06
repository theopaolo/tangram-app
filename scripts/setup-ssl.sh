#!/bin/bash

# Script to generate SSL certificates with current network IP
# Run this whenever you change networks

# Get current network IP
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🔍 Current network IP: $CURRENT_IP"

# Create .certs directory if it doesn't exist
mkdir -p .certs

# Generate new certificate with current IP
echo "🔐 Generating SSL certificate for localhost and $CURRENT_IP..."
mkcert -key-file .certs/localhost-key.pem -cert-file .certs/localhost.pem localhost 127.0.0.1 ::1 $CURRENT_IP

echo "✅ SSL certificate generated!"
echo "📱 You can now access your app via:"
echo "   🖥️  Desktop: https://localhost:5173/"
echo "   📱 Mobile:  https://$CURRENT_IP:5173/"
echo ""
echo "💡 Note: You may need to accept the security warning on mobile devices"
echo "   Tap 'Advanced' → 'Proceed to $CURRENT_IP (unsafe)'"
