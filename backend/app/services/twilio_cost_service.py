import httpx
import logging
import math
from app.core.config import settings

logger = logging.getLogger(__name__)

def fetch_actual_twilio_call_cost(call_sid: str, usd_to_inr: float) -> dict:
    try:
        account_sid = settings.twilio_account_sid
        auth_token = settings.twilio_auth_token
        
        if not account_sid or not auth_token or not call_sid or call_sid.startswith("pending-"):
            return {"source": "pending", "billable_minutes": 0, "twilio_cost_inr": 0.0}

        # Query Twilio Call API
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls/{call_sid}.json"
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, auth=(account_sid, auth_token))
            
        if response.status_code == 200:
            data = response.json()
            price_str = data.get("price")
            price_unit = data.get("price_unit") or "USD"
            duration_str = data.get("duration") or "0"
            
            billable_minutes = 0.0
            try:
                dur_sec = float(duration_str)
                billable_minutes = math.ceil(dur_sec / 60.0)
            except Exception:
                pass
                
            if price_str is not None:
                try:
                    raw_price = abs(float(price_str))
                    twilio_cost_inr = raw_price * usd_to_inr
                    return {
                        "source": "actual",
                        "billable_minutes": billable_minutes,
                        "raw_price": raw_price,
                        "price_unit": price_unit,
                        "twilio_cost_inr": twilio_cost_inr
                    }
                except Exception:
                    pass
        else:
            logger.warning(f"Twilio call API returned status {response.status_code}: {response.text}")
            
    except Exception as e:
        logger.error(f"Error fetching Twilio call cost: {e}")
        
    return {"source": "pending", "billable_minutes": 0, "twilio_cost_inr": 0.0}
