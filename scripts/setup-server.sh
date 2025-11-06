#!/bin/bash
# Shappa - Server Setup Script
# Installa automaticamente: Node.js, PM2, Nginx, Certbot, Git
# Usage: curl -fsSL https://raw.githubusercontent.com/shapironeil/shappa/main/scripts/setup-server.sh | bash

set -e

echo "🚀 Shappa Server Setup - Starting..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot (for SSL)
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create deploy user
echo "👤 Creating deploy user..."
if ! id -u deploy > /dev/null 2>&1; then
    sudo adduser deploy --disabled-password --gecos ""
    sudo usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deploy
fi

# Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p /var/www/shappa
sudo chown -R deploy:deploy /var/www/shappa

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Switch to deploy user: sudo su - deploy"
echo "2. Clone repository: cd /var/www/shappa && git clone https://github.com/shapironeil/shappa.git ."
echo "3. Create .env file and configure variables"
echo "4. Install dependencies: npm ci --production"
echo "5. Start app: pm2 start server.js --name shappa"
echo "6. Save PM2 config: pm2 save && pm2 startup"
