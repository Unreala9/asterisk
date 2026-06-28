# VoicePilot: AI-Powered Telephony & Voice Bot Platform (Asterisk Integration)

VoicePilot is a state-of-the-art AI voice agent platform designed to handle inbound and outbound voice calls. By integrating a FastAPI-based AI pipeline with an open-source **Asterisk PBX** server using **AudioSocket (TCP)**, VoicePilot achieves real-time, low-latency, human-like voice conversations using Deepgram STT, OpenAI/Claude, and Sarvam/Deepgram TTS.

---

## 🏗️ System Architecture

```
                       [ Public Telecom Networks ]
                                    │
                            (Zadarma / Telnyx)
                                    │
                                SIP Trunk
                                    │
                         [ Hostinger Asterisk VPS ]
                       (Ubuntu 24.04, Asterisk 20.6)
                                    │
                         Webhook (Inbound / Status)
                                    │
                        https://ngrok-free.dev
                                    │
                      [ Local Development Laptop ]
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
     [ FastAPI Backend ]                             [ React Frontend ]
      (Port 8000)                                     (Port 5173 / Vite)
             │
      AudioSocket TCP Server
      (Port 9092 via SSH Tunnel)
             ├───────────────────┬───────────────────┐
             ▼                   ▼                   ▼
      [ Deepgram STT ]     [ OpenAI LLM ]      [ Sarvam / Deepgram TTS ]
```

---

## 🛠️ Technology Stack

*   **Frontend**: React, TypeScript, Vite, TailwindCSS, TanStack Router.
*   **Backend**: Python, FastAPI, Uvicorn, Pytest.
*   **Database**: Supabase (PostgreSQL) with Realtime subscriptions.
*   **Telephony**: Asterisk PBX (PJSIP channel driver, AudioSocket application).
*   **AI Services**: Deepgram (Live Streaming STT & TTS), Sarvam AI (Indian Language TTS), OpenAI / Anthropic (LLM Core).

---

## 🚀 Local Quickstart Guide

### 1. Prerequisites
*   Python 3.10+ installed.
*   Node.js 18+ installed.
*   An active Ngrok account.
*   A remote Ubuntu VPS running Asterisk 20+.

### 2. Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    # Windows PowerShell:
    .\venv\Scripts\Activate.ps1
    # Bash:
    source venv/bin/activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Configure your environment variables in `.env` (see **Environment Variables** section below).
5. Start the FastAPI development server:
    ```bash
    python -m app.main
    ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install package dependencies:
    ```bash
    npm install
    ```
3. Copy or create `.env` configuring `VITE_API_URL` to point to your ngrok URL.
4. Start the frontend developer console:
    ```bash
    npm run dev
    ```

### 4. Ngrok Tunneling Setup
To allow the remote Asterisk VPS to send webhooks to your local machine, expose port 8000:
```bash
ngrok http 8000
```
Update your backend `.env` variables (`PUBLIC_BASE_URL`, `WS_STREAM_URL`) to match the generated ngrok domain.

---

## 🔒 SSH Reverse Port Forwarding & VPS Settings

Because the audio pipeline operates on **AudioSocket (TCP port 9092)**, Asterisk needs to send audio to your local machine. We accomplish this by establishing an SSH reverse tunnel from your local laptop to the remote VPS.

### 1. Enable Forwarding on your Hostinger VPS
By default, VPS templates may block reverse port forwarding. Log into your VPS as `root` and edit `/etc/ssh/sshd_config`:
```bash
# Uncomment or add these directives:
AllowTcpForwarding yes
GatewayPorts yes
```
Restart the SSH service:
```bash
systemctl restart ssh
```

### 2. Free Stuck Ports on the VPS
If a previous SSH tunnel hung, kill the orphaned socket on the VPS:
```bash
fuser -k 9092/tcp
```

### 3. Open the SSH Tunnel (Run on your LOCAL Laptop)
Start the background tunnel from your local computer:
```bash
ssh -N -R 9092:127.0.0.1:9092 -o ExitOnForwardFailure=yes -o ServerAliveInterval=60 root@72.60.202.148
```
*Leave this terminal window running in the background.*

---

## 📞 Outbound Call Origination

When you trigger an outbound call (either via the browser dashboard or the `/api/calls/asterisk/outbound` API), the backend handles credentials and formatting automatically.

### Number Formatting
*   **Zadarma Outbound Rules**: The destination number must omit the leading `+` symbol (e.g. `919343418163` instead of `+919343418163`). The backend automatically strips the `+` prefix prior to placing Asterisk calls.
*   **Caller ID**: The originate command passes your verified Zadarma virtual number (`+18166536732`) as the authenticated caller identity.

### Triggering Outbound Calls (Manual vs. Automatic)
*   **Automatic Mode (Recommended)**: Set up passwordless key authentication between your laptop and VPS:
    ```bash
    ssh-keygen -t rsa -b 4096
    ssh-copy-id root@72.60.202.148
    ```
    Once keys are set up, clicking **"Test Call"** in the browser dashboard triggers the VPS automatically.
*   **Manual Mode (Fallback)**: If keys are not set up, the backend console prints a command:
    ```bash
    asterisk -rx "channel originate PJSIP/919343418163@provider-64d25934-3abc-45a4-8cce-203d07acce62 application AudioSocket <UUID>,127.0.0.1:9092 \"+18166536732\""
    ```
    Copy the entire command and paste it inside your open remote VPS SSH session to trigger the call.

---

## 🗄️ Database Tables (Supabase Schema)

*   `agents`: Manages AI agent personas, language settings, and voice configurations.
*   `did_numbers`: Mappings of virtual telephone numbers to specific agents.
*   `sip_trunk_providers`: Registered SIP credentials, proxy hosts, and codecs for Asterisk.
*   `calls`: Active call history logging metadata, direction (inbound/outbound), and duration.
*   `call_messages`: Transcript records showing chat history between the caller and the bot.

---

## 🧪 Running Automated Tests

A suite of unit tests validates the database recovery, lifecycle management, and AudioSocket parsing. To execute tests locally:
```bash
cd backend
.\venv\Scripts\python -m pytest tests/test_asterisk.py -v
```

---

## 💡 Troubleshooting

*   **Spinner Stuck on "LOADING NUMBERS..."**: Bypass the ngrok warning screen by opening `https://rewash-rematch-repost.ngrok-free.dev` in a new browser tab and clicking **"Visit Site"**.
*   **Port Forwarding Fails**: Run `fuser -k 9092/tcp` on the VPS to clear active sockets.
*   **Immediate "Answered" Status but No Ringing**: Verify your Zadarma account balance or ensure the Caller ID is whitelisted in your carrier panel.
