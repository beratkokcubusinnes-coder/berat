# Troubleshooting Guide

## ERR_QUIC_PROTOCOL_ERROR & SSL Connection Issues

If you cannot access the site via HTTPS, follow these steps to resolve connection issues.

### 1. Firewall Settings (Critical)
The most common cause is blocked ports. Run these commands on your VPS:

```bash
# Allow HTTP and HTTPS traffic
ufw allow 80
ufw allow 443
ufw allow 'Nginx Full'

# Reload firewall rules
ufw reload
```

### 2. Restart Nginx Web Server
Ensure the web server is running with the latest configuration:

```bash
# Test configuration first
nginx -t

# Restart service
systemctl restart nginx
```

### 3. Check Application Status
Ensure your Next.js app is running:

```bash
pm2 status
# If it shows "errored" or "stopped", check logs:
pm2 logs promptda --lines 20
```

### 4. Cloudflare Users (Important)
If your domain uses Cloudflare DNS:
- Go to Cloudflare Dashboard > SSL/TLS
- Set encryption mode to **Full** or **Full (Strict)**.
- **NEVER** use "Flexible" mode if you have installed an SSL certificate on your VPS (which we did with Certbot). This causes infinite redirect loops or protocol errors.

### 5. Browser Testing
- This error is often cached by Chrome.
- **Try accessing the site in an Incognito/Private window.**
- Or try a different browser (Firefox, Edge).
