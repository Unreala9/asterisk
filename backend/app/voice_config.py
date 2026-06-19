from pydantic_settings import BaseSettings


class VoiceConfig(BaseSettings):
    # Feature flags
    ENABLE_EARLY_EOT_LLM: bool = True
    ENABLE_SPECULATIVE_INTERIM_LLM: bool = False
    ENABLE_FILLER_RESPONSE: bool = False
    ENABLE_BARGE_IN: bool = True

    # STT tuning
    STT_ENDPOINTING_MS: int = 300          # 100 / 200 / 300 / 500 — lower = faster EOT
    STT_MODEL: str = "nova-2"              # nova-2 | nova-3

    # LLM tuning
    OPENAI_MAX_OUTPUT_TOKENS: int = 80
    OPENAI_VOICE_MODEL: str = "gpt-4o-mini"
    VOICE_SYSTEM_PREFIX: str = (
        "Reply briefly and naturally for a phone/voice conversation. "
        "Keep the first sentence under 15 words."
    )

    # TTS chunking
    TTS_CHUNK_WORD_MIN: int = 6            # min words before sending to TTS
    TTS_CHUNK_TIMEOUT_MS: int = 400        # max wait before forcing a chunk

    model_config = {
        "env_prefix": "",
        "extra": "ignore",
        "env_file": ".env",
        "case_sensitive": False,
    }


voice_cfg = VoiceConfig()
