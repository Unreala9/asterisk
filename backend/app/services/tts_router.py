import re
import logging
from typing import Set

logger = logging.getLogger(__name__)

# Devanagari script unicode range for native Hindi text detection
HINDI_CHARACTER_REGEX = re.compile(r"[\u0900-\u097F]")

# Curated list of common Romanized Hindi (Hinglish) words that rarely clash with English
HINGLISH_KEYWORDS: Set[str] = {
    "namaste", "namaskar", "swagat", "dhanyawad", "shukriya", "alvida",
    "aap", "aapki", "aapka", "aapke", "aapko", "aapne",
    "kaise", "kaisa", "kaisi", "kaha", "kahan", "kab", "kabhi",
    "tum", "tumhara", "tumhari", "tumhere", "mera", "meri", "mere", "mujhe", "mujhse",
    "main", "mai", "hum", "apna", "apni", "apne", "bhi", "toh", "to", "tha", "thi", "the",
    "nhi", "nahi", "naa", "kya", "kyun", "kyu", "kyon", "kuch", "aur", "haan", "ji",
    "karo", "karna", "krna", "kar", "rha", "raha", "rhi", "rahi", "ho", "hu", "hoon", "hai", "hain", "he",
    "hunga", "hunge", "sakte", "sakta", "sakti", "lekin", "magar", "parantu",
    "sab", "koi", "wo", "voh", "yeh", "ye", "is", "us", "inn", "un",
    "kidhar", "idhar", "udhar", "abhi", "tabhi", "jabhi", "baad", "pehle", "pehla", "phir", "fir",
    "madad", "sahayata", "haye", "achha", "accha", "acha", "bol", "bolo", "bolna",
    "suno", "sunna", "sunao", "batao", "batana", "samajh", "aaya", "aayi", "gaya", "gayi",
    "chal", "chalo", "chalna", "de", "dena", "le", "lena", "khatam", "shuru", "theek", "thik",
    "metabool", "metabol", "metavol"
}

def is_hindi_or_hinglish(text: str) -> bool:
    """
    Check if a text is likely Hindi (Devanagari) or Hinglish (Romanized Hindi).
    """
    if not text:
        return False
    
    # 1. Check for Devanagari characters
    if HINDI_CHARACTER_REGEX.search(text):
        return True

    # 2. Check for Hinglish keywords
    # Clean text to alphanumeric and spaces, lowercase it, split into words
    cleaned_text = re.sub(r"[^\w\s]", "", text.lower())
    words = cleaned_text.split()
    
    for word in words:
        if word in HINGLISH_KEYWORDS:
            logger.debug("Detected Hinglish word: %s", word)
            return True
            
    return False

def route_tts(text: str, tts_provider: str, language: str, voice_id: str = None) -> str:
    """
    Route TTS request to 'sarvam' or 'deepgram'.
    
    Logic:
    if voice_id is a Sarvam voice:
        use Sarvam TTS
    if tts_provider == "deepgram":
        use Deepgram TTS
    if tts_provider == "sarvam":
        use Sarvam TTS
    if tts_provider == "auto":
        if language == "hi-IN" or text contains Hindi/Hinglish:
            use Sarvam TTS
        else:
            use Deepgram TTS
    """
    if voice_id:
        voice_lower = voice_id.lower()
        if any(spk in voice_lower for spk in ["shubh", "meera", "shreya", "manan", "ishita", "arjun"]):
            return "sarvam"

    provider = tts_provider.lower() if tts_provider else "deepgram"
    lang = language.lower() if language else "en-us"

    if provider == "deepgram":
        return "deepgram"
    
    if provider == "sarvam":
        return "sarvam"
    
    if provider == "auto":
        if lang.startswith("hi") or is_hindi_or_hinglish(text):
            return "sarvam"
        else:
            return "deepgram"
            
    # Default fallback
    return "deepgram"
