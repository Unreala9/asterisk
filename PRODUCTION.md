# Production Deployment Guide: VoicePilot AI Platform

This document outlines the architecture, deployment steps, and configuration requirements for running the VoicePilot AI Voice Platform in a live production environment on a dedicated VPS (e.g. Hostinger VPS).

---

## 🏗️ Production Architecture

In a production environment, all core components run directly on the VPS. There are **no ngrok tunnels or SSH reverse port-forwarding tunnels**. Asterisk and the FastAPI backend communicate directly on the local loopback interface (`127.0.0.1`).

```
[ Inbound Callers ]                     [ Dashboard Users (Browser) ]
         │                                            │
         ▼                                            ▼
(Zadarma / Telnyx)                             HTTPS (Port 443)
         │                                            │
   SIP (5060 UDP)                                     ▼
         │                                      [ Nginx Proxy ]
         │                               ┌────────────┴────────────┐
         ▼                               ▼                         ▼
   [ Asterisk ]                  Static Files              API / WebSockets
   (Local VPS)                    (Frontend)                 (Port 8000)
         │                                                         │
   AudioSocket TCP (Port 9092) <───────────────────────────────────┘
         │
   [ Deepgram STT / TTS ] ─── [ OpenAI LLM ] ─── [ Sarvam TTS ]
```

---

## 📋 Prerequisites

*   **VPS**: Hostinger VPS (Ubuntu 22.04 / 24.04 LTS), 2+ vCPUs, 4GB RAM.
*   **Domain**: A registered domain name (e.g. `api.yourdomain.com` and `dashboard.yourdomain.com`) pointing to your VPS public IP.
*   **SSL Certificates**: Let's Encrypt certificates managed via Certbot.
*   **Telephony**: Zadarma or other SIP trunk account configured with active credit.

---

## 🚀 Deployment Steps

### 1. Database & Supabase Configuration
*   Create a production database in Supabase.
*   Run the migration scripts found in `backend/supabase/migrations/` sequentially on the database.
*   Retrieve the production keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_JWT_SECRET`.

### 2. Backend Deployment with PM2
1. Clone your production code to `/root/voice/aura-voice-ai` on your VPS.
2. Create and configure `/root/voice/aura-voice-ai/backend/.env` (see the **Production .env** section below).
3. Set up the Python virtual environment and dependencies:
    ```bash
    cd /root/voice/aura-voice-ai/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    ```
4. Start the backend process using **PM2**:
    ```bash
    pm2 start "venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000" --name "voice-backend"
    pm2 save
    pm2 startup
    ```

### 3. Nginx Reverse Proxy Setup (with SSL)
Install Nginx and Certbot on your VPS:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Configure Nginx to reverse proxy API/WebSocket connections to port 8000, and serve the built static frontend files. Save the following configuration under `/etc/nginx/sites-available/voicepilot`:

```nginx
# API & Webhooks Proxy
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend Dashboard Static Hosting
server {
    server_name dashboard.yourdomain.com;
    root /root/voice/aura-voice-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/voicepilot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Secure your site with SSL certificates:
```bash
sudo certbot --nginx -d api.yourdomain.com -d dashboard.yourdomain.com
```

### 4. Frontend Production Build
1. Build the production React assets locally or directly on the VPS:
    ```bash
    cd /root/voice/aura-voice-ai/frontend
    npm install
    # Ensure VITE_API_URL in .env points to https://api.yourdomain.com
    npm run build
    ```
2. The built files will output to the `/root/voice/aura-voice-ai/frontend/dist` directory, which Nginx serves directly.

### 5. Asterisk Outbound Automation Configuration
In production, the backend initiates outbound calls automatically.
Ensure the `.env` configuration contains:
```ini
ASTERISK_SSH_HOST=127.0.0.1
ASTERISK_SSH_USER=root
```
Since the backend is running locally on the VPS, it will attempt to run the `asterisk -rx` command directly on the system.
If the backend process is not running as `root`, ensure the user running uvicorn has permission to run `asterisk` commands by adding it to `/etc/sudoers`:
```text
uvicorn-user ALL=(ALL) NOPASSWD: /usr/sbin/asterisk
```

---

## 🔒 Production Environment Variables (`backend/.env`)

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# AI Keys
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
SARVAM_API_KEY=your-sarvam-api-key

# Production Host Details
PUBLIC_BASE_URL=https://api.yourdomain.com
WS_STREAM_URL=wss://api.yourdomain.com/ws/voice

# Local Asterisk & AudioSocket Settings
ASTERISK_AUDIOSOCKET_ENABLED=true
ASTERISK_AUDIOSOCKET_HOST=127.0.0.1
ASTERISK_AUDIOSOCKET_PORT=9092
ASTERISK_SSH_HOST=127.0.0.1
ASTERISK_SSH_USER=root

# API Server Settings
API_HOST=127.0.0.1
API_PORT=8000
API_WORKERS=4
LOG_LEVEL=INFO
DEBUG=False
```

---

## 🛠️ Maintenance & Monitoring

### View live PM2 backend logs:
```bash
pm2 logs voice-backend
```

### Restart the backend server:
```bash
pm2 restart voice-backend
```

### View Asterisk connection stats:
Log into the Asterisk CLI:
```bash
asterisk -rvvv
```
Run these debugging commands:
*   `pjsip show endpoints` (view active SIP trunks)
*   `pjsip show registrations` (view registration status)
*   `core show channels` (view active calls)
