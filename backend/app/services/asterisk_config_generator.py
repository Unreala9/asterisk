import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class AsteriskConfigGenerator:
    @staticmethod
    def generate_config(trunk: Dict[str, Any], mask_password: bool = True) -> Dict[str, str]:
        """
        Generate pjsip.conf, extensions.conf, firewall commands, and reload commands for a SIP Trunk.
        """
        trunk_id = trunk.get("id", "template-id")
        name = trunk.get("name", "SIP-Trunk")
        auth_type = trunk.get("auth_type", "ip_auth")
        sip_proxy = trunk.get("sip_proxy", "127.0.0.1")
        sip_port = trunk.get("sip_port", 5060)
        transport = trunk.get("transport", "udp")
        username = trunk.get("username", "")
        
        # Get password, check if it's already decrypted/plain-text
        password = trunk.get("password", "") or trunk.get("password_decrypted", "")
        if mask_password and password:
            password = "********"

        provider_ips = trunk.get("provider_ips") or []
        if isinstance(provider_ips, str):
            import json
            try:
                provider_ips = json.loads(provider_ips)
            except Exception:
                provider_ips = [provider_ips]

        codecs = trunk.get("allowed_codecs") or ["ulaw", "alaw"]
        if isinstance(codecs, str):
            import json
            try:
                codecs = json.loads(codecs)
            except Exception:
                codecs = ["ulaw", "alaw"]
        
        codecs_str = ",".join(codecs)
        webhook_secret = settings.asterisk_webhook_secret or "your_shared_webhook_secret"
        transport_name = f"transport-{transport}"

        # 1. PJSIP config generation
        pjsip_lines = [
            f"; === SIP Trunk: {name} (ID: {trunk_id}) ==="
        ]

        if auth_type == "ip_auth":
            # IP Auth Endpoint
            pjsip_lines.extend([
                f"[provider-{trunk_id}]",
                "type=endpoint",
                f"transport={transport_name}",
                f"context=from-provider-{trunk_id}",
                "disallow=all",
                f"allow={codecs_str}",
                "direct_media=no",
                "force_rport=yes",
                "rewrite_contact=yes",
                "rtp_symmetric=yes",
                "",
                f"[provider-{trunk_id}-identify]",
                "type=identify",
                f"endpoint=provider-{trunk_id}",
            ])
            for ip in provider_ips:
                if ip:
                    pjsip_lines.append(f"match={ip}")
            pjsip_lines.append("")
        else:
            # Username/Password Auth
            pjsip_lines.extend([
                f"[provider-{trunk_id}-auth]",
                "type=auth",
                "auth_type=userpass",
                f"username={username}",
                f"password={password}",
                "",
                f"[provider-{trunk_id}-aor]",
                "type=aor",
                f"contact=sip:{sip_proxy}:{sip_port}",
                "",
                f"[provider-{trunk_id}]",
                "type=endpoint",
                f"transport={transport_name}",
                f"context=from-provider-{trunk_id}",
                "disallow=all",
                f"allow={codecs_str}",
                f"outbound_auth=provider-{trunk_id}-auth",
                f"aors=provider-{trunk_id}-aor",
                "direct_media=no",
                "force_rport=yes",
                "rewrite_contact=yes",
                "rtp_symmetric=yes",
                "",
                f"[provider-{trunk_id}-reg]",
                "type=registration",
                f"transport={transport_name}",
                f"outbound_auth=provider-{trunk_id}-auth",
                f"client_uri=sip:{username}@{sip_proxy}:{sip_port}",
                f"server_uri=sip:{sip_proxy}:{sip_port}",
                ""
            ])

        pjsip_conf = "\n".join(pjsip_lines)

        # 2. Extensions config generation
        ext_lines = [
            f"; === Inbound Routing for Provider: {name} (ID: {trunk_id}) ===",
            f"[from-provider-{trunk_id}]",
            "exten => _X.,1,NoOp(Incoming SIP call from ${CALLERID(num)} to ${EXTEN})",
            " same => n,Answer()",
            " same => n,Set(CALL_UUID=${UNIQUEID})",
            f" same => n,System(curl -s \"{settings.public_base_url or 'http://127.0.0.1:8010'}/api/webhooks/asterisk/inbound?caller_id=${{CALLERID(num)}}&dialed_number=${{EXTEN}}&call_uuid=${{CALL_UUID}}&provider=asterisk&secret={webhook_secret}\" >/dev/null 2>&1 &)",
            " same => n,AudioSocket(${CALL_UUID},127.0.0.1:9092)",
            " same => n,Hangup()",
            ""
        ]
        extensions_conf = "\n".join(ext_lines)

        # 3. Suggested firewall rules
        fw_rules = [
            f"# 1. Allow SIP traffic from SIP proxy ({sip_proxy})",
            f"sudo ufw allow from {sip_proxy} to any port {sip_port} proto {transport}",
        ]
        if auth_type == "ip_auth":
            for ip in provider_ips:
                if ip:
                    fw_rules.append(f"sudo ufw allow from {ip} to any port {sip_port} proto {transport}")
        fw_rules.extend([
            "# 2. Allow RTP media ports (typical default Asterisk RTP range)",
            "sudo ufw allow 10000:20000/udp"
        ])
        firewall_commands = "\n".join(fw_rules)

        # 4. Asterisk reload commands
        reload_commands = (
            "asterisk -rx \"pjsip reload\"\n"
            "asterisk -rx \"dialplan reload\""
        )

        return {
            "pjsip_conf": pjsip_conf,
            "extensions_conf": extensions_conf,
            "firewall_commands": firewall_commands,
            "reload_commands": reload_commands
        }
