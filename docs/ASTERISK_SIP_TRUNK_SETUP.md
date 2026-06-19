# Asterisk SIP Trunk & AudioSocket Setup Guide

This document describes how to configure Asterisk PBX to route calls from SIP Trunks (Airtel, Jio, Tata) to the Voice AI FastAPI backend via AudioSocket.

---

## 1. Asterisk Installation

For a Debian/Ubuntu-based server, install Asterisk using:

```bash
sudo apt update
sudo apt install -y asterisk asterisk-modules
```

Ensure the AudioSocket module (`app_audiosocket.so` and `res_audiosocket.so`) is compiled and loaded. You can verify this in the Asterisk CLI:

```bash
asterisk -rx "module show like audiosocket"
```

If it is not present, you may need to build Asterisk from source with the `--with-audiosocket` compiler flag.

---

## 2. SIP Trunk configuration (`pjsip.conf`)

Configure the PJSIP stack to interface with your telecom provider.

### Option A: IP-Authentication (Harmonized for Airtel/Jio/Tata Trunks)

This configuration is typical for enterprise SIP trunks with dedicated links:

```ini
; ================= Airtel/Jio/Tata IP Auth Trunk =================

[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060

[aor-provider-trunk]
type=aor
contact=sip:PROVIDER_IP_ADDRESS:5060

[endpoint-provider-trunk]
type=endpoint
transport=transport-udp
context=from-sip-trunk
disallow=all
allow=ulaw,alaw,g722
aors=aor-provider-trunk
identify_by=ip

[identify-provider-trunk]
type=identify
endpoint=endpoint-provider-trunk
match=PROVIDER_IP_ADDRESS/32
```

### Option B: Username/Password Registration (Airtel/Jio backup)

```ini
; ================= Username/Password Registration =================

[reg-provider-trunk]
type=registration
transport=transport-udp
outbound_auth=auth-provider-trunk
client_uri=sip:USERNAME@PROVIDER_IP_ADDRESS:5060
server_uri=sip:PROVIDER_IP_ADDRESS:5060

[auth-provider-trunk]
type=auth
auth_type=userpass
username=USERNAME
password=PASSWORD

[aor-provider-trunk]
type=aor
contact=sip:PROVIDER_IP_ADDRESS:5060

[endpoint-provider-trunk]
type=endpoint
transport=transport-udp
context=from-sip-trunk
disallow=all
allow=ulaw,alaw
outbound_auth=auth-provider-trunk
aors=aor-provider-trunk
```

---

## 3. Extension Routing (`extensions.conf`)

Define how incoming calls are handled and sent to the Voice AI FastAPI backend.

```ini
[from-sip-trunk]
; Handle incoming calls on the SIP trunk
exten => _X.,1,NoOp(Incoming call from trunk: ${CALLERID(num)} to ${EXTEN})
    ; 1. Normalize variables and trigger our HTTP webhook to register the call
    same => n,Set(CALL_UUID=${UNIQUEID})
    same => n,Set(DID=${EXTEN})
    same => n,Set(CALLER=${CALLERID(num)})
    same => n,Set(SECRET=your_shared_webhook_secret)
    same => n,Set(WEBHOOK_URL=http://127.0.0.1:8000/api/webhooks/asterisk/inbound)
    
    ; Curl parameters: caller_id, dialed_number, call_uuid, provider, secret
    same => n,Set(CURL_DATA=caller_id=${CALLER}&dialed_number=${DID}&call_uuid=${CALL_UUID}&secret=${SECRET})
    same => n,Set(RESPONSE=${curl(${WEBHOOK_URL},${CURL_DATA})})
    same => n,NoOp(FastAPI webhook response: ${RESPONSE})
    
    ; 2. Answer the call and establish AudioSocket stream to backend on localhost:9092
    same => n,Answer()
    same => n,AudioSocket(${CALL_UUID},127.0.0.1:9092)
    same => n,Hangup()
```

---

## 4. Firewall & Network Setup

To allow SIP and RTP traffic while securing the server:

1. **AudioSocket Access**: Keep AudioSocket listening strictly on `127.0.0.1:9092` to avoid external exploits.
2. **SIP (PJSIP) Port**: Open UDP `5060` (or `5061` for TLS) for your telecom provider's IP range.
3. **RTP Audio Stream Ports**: Open UDP `10000-20000` (Asterisk default RTP range) to allow audio traffic:
   ```bash
   sudo ufw allow 5060/udp
   sudo ufw allow 10000:20000/udp
   ```

---

## 5. CLI Debugging & Troubleshooting

Run these CLI commands in the Asterisk console (`asterisk -rvvv`):

* **Check registered SIP trunks**:
  ```text
  pjsip show registrations
  pjsip show endpoints
  ```
* **Enable SIP logging**:
  ```text
  pjsip set logger on
  ```
* **Verify AudioSocket status**:
  ```text
  audiosocket show connections
  ```
* **Trace dialplan execution**:
  ```text
  dialplan show from-sip-trunk
  ```
