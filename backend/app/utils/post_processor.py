import re

def detect_voice_gender(voice_id: str | None) -> str:
    """
    Detects whether a voice ID corresponds to a male or female voice.
    """
    if not voice_id:
        return "female"
    v = voice_id.lower()
    # Male indicators
    if any(name in v for name in ["shubh", "manan", "arjun", "orion", "arcas", "perseus", "zeus", "angus", "orpheus", "helios", "odysseus", "joey"]):
        return "male"
    # Female indicators
    if any(name in v for name in ["meera", "shreya", "ishita", "asteria", "luna", "stella", "athena", "hera", "thalia", "amalthea", "joanna"]):
        return "female"
    if "female" in v:
        return "female"
    if "male" in v:
        return "male"
    return "female"

def apply_hinglish_post_processing(text: str, voice_gender: str = "female") -> str:
    """
    Applies strict string replacements to enforce gendered phrases
    and convert overly pure Hindi to conversational Hinglish.
    """
    if not text:
        return text

    # Handle voice_id instead of raw gender string
    gender = voice_gender.lower() if voice_gender else "female"
    if gender not in ("male", "female"):
        gender = detect_voice_gender(voice_gender)


    # Define exact replacements based on gender
    if gender == "male":
        gender_replacements = {
            r"\bkar sakti (?:hoon|hu)\b": "kar sakta hoon",
            r"\bsamajh (?:gayi|gai)\b": "samajh gaya",
            r"\bbata deti (?:hoon|hu)\b": "bata deta hoon",
            r"\bcheck kar leti (?:hoon|hu)\b": "check kar leta hoon",
            r"\bdekh leti (?:hoon|hu)\b": "dekh leta hoon",
            r"\bbhej deti (?:hoon|hu)\b": "bhej deta hoon",
            r"\bconfirm kar deti (?:hoon|hu)\b": "confirm kar deta hoon",
            r"कर सकती हूँ": "कर सकता हूँ",
            r"कर सकती हु": "कर सकता हूँ",
            r"समझ गयी": "समझ गया",
            r"समझ गई": "समझ गया",
            r"बता देती हूँ": "बता देता हूँ",
            r"बता देती हु": "बता देता हूँ",
            r"चेक कर लेती हूँ": "चेक कर लेता हूँ",
            r"चेक कर लेती हु": "चेक कर लेता हूँ",
            r"देख लेती हूँ": "देख लेता हूँ",
            r"देख लेती हु": "देख लेता हूँ",
            r"भेज देती हूँ": "भेज देता हूँ",
            r"भेज देती हु": "भेज देता हूँ",
        }
    else:
        gender_replacements = {
            r"\bkar sakta (?:hoon|hu)\b": "kar sakti hoon",
            r"\bsamajh gaya\b": "samajh gayi",
            r"\bbata deta (?:hoon|hu)\b": "bata deti hoon",
            r"\bcheck kar leta (?:hoon|hu)\b": "check kar leti hoon",
            r"\bdekh leta (?:hoon|hu)\b": "dekh leti hoon",
            r"\bbhej deta (?:hoon|hu)\b": "bhej deti hoon",
            r"\bconfirm kar deta (?:hoon|hu)\b": "confirm kar deti hoon",
            r"\bmain ready (?:hoon|hu) sir\b": "main ready hoon",
            r"कर सकता हूँ": "कर सकती हूँ",
            r"कर सकता हु": "कर सकती हूँ",
            r"समझ गया": "समझ गयी",
            r"बता देता हूँ": "बता देती हूँ",
            r"बता देता हु": "बता देती हूँ",
            r"चेक कर लेता हूँ": "चेक कर लेती हूँ",
            r"चेक कर लेता हु": "चेक कर लेती हूँ",
            r"देख लेता हूँ": "देख लेती हूँ",
            r"देख लेता हु": "देख लेती हूँ",
            r"भेज देता हूँ": "भेज देती हूँ",
            r"भेज देता हु": "भेज देती हूँ",
        }

    style_replacements = {
        # Pure Hindi to Hinglish conversions
        r"मैं आपकी सहायता कर सकती हूँ": "main aapki help kar sakti hoon" if gender != "male" else "main aapki help kar sakta hoon",
        r"मैं आपकी सहायता कर सकता हूँ": "main aapki help kar sakta hoon" if gender == "male" else "main aapki help kar sakti hoon",
        r"कृपया प्रतीक्षा करें": "please ek second wait kijiye",
        r"मैं जानकारी देख रही हूँ": "main details check kar rahi hoon" if gender != "male" else "main details check kar raha hoon",
        r"मैं जानकारी देख रहा हूँ": "main details check kar raha hoon" if gender == "male" else "main details check kar rahi hoon",
        r"क्या आप मुझे बता सकते हैं": "aap mujhe bata sakte hain?",
    }

    # Combine both dicts
    replacements = {**gender_replacements, **style_replacements}

    processed_text = text
    for pattern, replacement in replacements.items():
        # Use regex for case-insensitive replacement on Roman phrases
        # Devanagari matching doesn't need case-insensitivity
        if re.search(r'[a-zA-Z]', pattern):
            processed_text = re.sub(pattern, replacement, processed_text, flags=re.IGNORECASE)
        else:
            processed_text = processed_text.replace(pattern, replacement)

    return processed_text
