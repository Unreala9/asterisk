import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class TelephonyService:
    def __init__(self, account_sid: str, auth_token_or_api_key: str, provider: str = "telnyx"):
        self.account_sid = account_sid
        self.auth_token_or_api_key = auth_token_or_api_key
        self.provider = provider
        if provider == "telnyx":
            self.base_url = "https://api.telnyx.com/v2"
        else:
            self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}"

    @property
    def _headers(self) -> dict[str, str]:
        if self.provider == "telnyx":
            return {
                "Authorization": f"Bearer {self.auth_token_or_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        return {}  # Twilio uses Basic Auth, handled in httpx

    @property
    def _auth(self) -> tuple[str, str] | None:
        if self.provider == "twilio":
            return (self.account_sid, self.auth_token_or_api_key)
        return None

    def make_outbound_call(
        self,
        to: str,
        from_: str,
        texml_url: str,
        status_callback_url: str | None = None,
    ) -> str:
        """Initiate an outbound call (TeXML for Telnyx, TwiML for Twilio) and return the call SID."""
        if self.provider == "telnyx":
            payload: dict[str, Any] = {
                "From": from_,
                "To": to,
                "Url": texml_url,
            }
            if status_callback_url:
                payload["StatusCallback"] = status_callback_url

            response = httpx.post(
                f"{self.base_url}/texml/Accounts/{self.account_sid}/Calls",
                headers=self._headers,
                json=payload,
                timeout=20.0,
            )
        else:
            # Twilio
            payload = {
                "To": to,
                "From": from_,
                "Url": texml_url,
            }
            if status_callback_url:
                payload["StatusCallback"] = status_callback_url

            response = httpx.post(
                f"{self.base_url}/Calls.json",
                auth=self._auth,
                data=payload,
                timeout=20.0,
            )

        response.raise_for_status()
        data = response.json()

        call_sid = data.get("sid") or data.get("call_sid") or data.get("CallSid")
        if not call_sid:
            raise RuntimeError(f"{self.provider.capitalize()} did not return a call SID: {data}")

        logger.info("Outbound %s call created: %s -> %s", self.provider, call_sid, to)
        return call_sid

    def end_call(self, call_sid: str):
        """Hang up an active call."""
        try:
            if self.provider == "telnyx":
                response = httpx.post(
                    f"{self.base_url}/texml/Accounts/{self.account_sid}/Calls/{call_sid}",
                    headers=self._headers,
                    json={"Status": "completed"},
                    timeout=20.0,
                )
            else:
                response = httpx.post(
                    f"{self.base_url}/Calls/{call_sid}.json",
                    auth=self._auth,
                    data={"Status": "completed"},
                    timeout=20.0,
                )
            response.raise_for_status()
            logger.info("Terminated %s call %s", self.provider, call_sid)
        except Exception as e:
            logger.error("Failed to end %s call %s: %s", self.provider, call_sid, e)

    def get_call_details(self, call_sid: str):
        """Fetch call details from the provider API."""
        try:
            if self.provider == "telnyx":
                url = f"{self.base_url}/texml/Accounts/{self.account_sid}/Calls/{call_sid}"
                response = httpx.get(url, headers=self._headers, timeout=20.0)
            else:
                url = f"{self.base_url}/Calls/{call_sid}.json"
                response = httpx.get(url, auth=self._auth, timeout=20.0)
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("Failed to fetch %s call details for %s: %s", self.provider, call_sid, e)
            return None

    def get_first_phone_number(self) -> str | None:
        """Return the first active phone number on this account."""
        try:
            if self.provider == "telnyx":
                response = httpx.get(
                    f"{self.base_url}/phone_numbers",
                    headers=self._headers,
                    params={"page[size]": 1},
                    timeout=20.0,
                )
                response.raise_for_status()
                data = response.json().get("data") or []
                return data[0].get("phone_number") if data else None
            else:
                # Twilio IncomingPhoneNumbers
                response = httpx.get(
                    f"{self.base_url}/IncomingPhoneNumbers.json",
                    auth=self._auth,
                    params={"PageSize": 1},
                    timeout=20.0,
                )
                response.raise_for_status()
                numbers = response.json().get("incoming_phone_numbers") or []
                return numbers[0].get("phone_number") if numbers else None
        except Exception as e:
            logger.error("Failed to fetch %s phone numbers: %s", self.provider, e)
            return None
