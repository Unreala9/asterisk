import logging

logger = logging.getLogger(__name__)

def calculate_provider_costs(
    duration_seconds: float,
    twilio_billable_minutes: float,
    stt_audio_seconds: float,
    llm_input_tokens: int,
    llm_output_tokens: int,
    tts_characters: int,
    twilio_cost_inr: float,
    twilio_cost_source: str,
    usd_to_inr: float,
    deepgram_per_hour_usd: float,
    openai_input_per_1m_usd: float,
    openai_output_per_1m_usd: float,
    sarvam_per_10k_chars_inr: float,
    credit_value_inr: float,
    twilio_fallback_per_min_usd: float
) -> dict:
    try:
        # 1. STT Cost (Deepgram)
        stt_cost_usd = (stt_audio_seconds / 3600.0) * deepgram_per_hour_usd
        stt_cost_inr = stt_cost_usd * usd_to_inr

        # 2. LLM Cost (OpenAI GPT-3.5)
        llm_input_cost_usd = (llm_input_tokens / 1000000.0) * openai_input_per_1m_usd
        llm_output_cost_usd = (llm_output_tokens / 1000000.0) * openai_output_per_1m_usd
        llm_cost_usd = llm_input_cost_usd + llm_output_cost_usd
        llm_cost_inr = llm_cost_usd * usd_to_inr

        # 3. TTS Cost (Sarvam / Deepgram default)
        tts_cost_inr = (tts_characters / 10000.0) * sarvam_per_10k_chars_inr

        # 4. Telephony Cost (Twilio)
        if twilio_cost_source == "actual":
            telephony_cost_inr = twilio_cost_inr
        else:
            # Fallback estimation
            telephony_cost_usd = twilio_billable_minutes * twilio_fallback_per_min_usd
            telephony_cost_inr = telephony_cost_usd * usd_to_inr

        # Total Cost
        total_cost_inr = stt_cost_inr + llm_cost_inr + tts_cost_inr + telephony_cost_inr
        credits_used = total_cost_inr / credit_value_inr if credit_value_inr > 0 else total_cost_inr

        return {
            "duration_seconds": duration_seconds,
            "stt_audio_seconds": stt_audio_seconds,
            "stt_cost_inr": round(stt_cost_inr, 4),
            "llm_input_tokens": llm_input_tokens,
            "llm_output_tokens": llm_output_tokens,
            "llm_cost_inr": round(llm_cost_inr, 4),
            "tts_characters": tts_characters,
            "tts_cost_inr": round(tts_cost_inr, 4),
            "telephony_cost_inr": round(telephony_cost_inr, 4),
            "total_cost_inr": round(total_cost_inr, 4),
            "credits_used": round(credits_used, 4),
        }
    except Exception as e:
        logger.error(f"Error calculating costs: {e}")
        return {
            "duration_seconds": duration_seconds,
            "stt_audio_seconds": stt_audio_seconds,
            "stt_cost_inr": 0.0,
            "llm_input_tokens": llm_input_tokens,
            "llm_output_tokens": llm_output_tokens,
            "llm_cost_inr": 0.0,
            "tts_characters": tts_characters,
            "tts_cost_inr": 0.0,
            "telephony_cost_inr": 0.0,
            "total_cost_inr": 0.0,
            "credits_used": 0.0,
        }
