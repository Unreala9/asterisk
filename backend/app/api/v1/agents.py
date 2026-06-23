from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
import json
import logging
from app.db.client import get_db, Client, fetch_agent_with_context, fetch_workspace_agents_with_context, save_agent_context

logger = logging.getLogger(__name__)

router = APIRouter()

VOICE_PROVIDER_MAP = {
    "eleven_turbo_v2": "elevenlabs",
    "eleven_multilingual_v2": "elevenlabs",
    "playht_2.0": "elevenlabs",
    "openai_tts": "elevenlabs",
}

VIBE_MAP = {
    "professional": "Be professional, concise, and direct. Maintain a formal yet approachable tone.",
    "warm": "Be warm, friendly, and empathetic. Use a conversational tone that puts callers at ease.",
    "persuasive": "Be high-energy and persuasive. Confidently guide the conversation toward positive outcomes.",
}


def _compile_system_prompt(data: dict) -> str:
    biz_name = data.get("business_name", "").strip()
    industry = data.get("industry", "").strip()
    top_services = data.get("top_services", "").strip()
    pricing = data.get("pricing_range", "").strip()
    usp = data.get("usp", "").strip()
    vibe = data.get("agent_vibe", "professional")
    call_goal = data.get("call_goal", "").strip()
    collect_info = data.get("collect_info", "").strip()
    fallback_name = data.get("human_fallback_name", "").strip()
    fallback_ext = data.get("human_fallback_extension", "").strip()
    kb_text = data.get("knowledge_base", "").strip()

    lines = []
    if biz_name:
        lines.append(f"You are an AI assistant for {biz_name}.")
    if industry:
        lines.append(f"Industry: {industry}")
    
    lines.append(f"\nCommunication Style: {VIBE_MAP.get(vibe, VIBE_MAP['professional'])}")

    if top_services:
        lines.append(f"\nCore Services: {top_services}")
    
    if pricing:
        lines.append(f"\nPricing Framework: {pricing}")
    
    if usp:
        lines.append(f"\nUnique Selling Point: {usp}")

    if call_goal:
        lines.append(f"\nPrimary Objective: {call_goal}")

    if collect_info:
        lines.append(f"\nInformation to Collect: {collect_info}")

    if fallback_name or fallback_ext:
        ref = fallback_name
        if fallback_ext:
            ref += f" at extension {fallback_ext}"
        lines.append(f"\nHuman Handoff: If you cannot resolve an issue, transfer the caller to {ref}.")

    if kb_text:
        lines.append(f"\n--- Knowledge Base ---\n{kb_text}")

    return "\n".join(lines)


@router.post("/{workspace_id}/agents")
async def create_agent(workspace_id: str, agent_data: Dict[str, Any], db: Client = Depends(get_db)):
    """Create a new AI agent"""
    voice = agent_data.get("voice", "en-US-Neural2-A")

    fallback_name = agent_data.get("human_fallback_name", "").strip()
    fallback_ext = agent_data.get("human_fallback_extension", "").strip()
    fallback_message = f"{fallback_name} ext. {fallback_ext}".strip(" ext.").strip() if (fallback_name or fallback_ext) else ""

    webhook_url = agent_data.get("webhook_url", "").strip()

    kb_metadata = {
        "business_name": agent_data.get("business_name", ""),
        "industry": agent_data.get("industry", ""),
        "top_services": agent_data.get("top_services", ""),
        "pricing_range": agent_data.get("pricing_range", ""),
        "usp": agent_data.get("usp", ""),
        "faq_barrier": agent_data.get("faq_barrier", ""),
        "agent_vibe": agent_data.get("agent_vibe", "professional"),
        "human_fallback_name": fallback_name,
        "human_fallback_extension": fallback_ext,
        "call_goal": agent_data.get("call_goal", ""),
        "collect_info": agent_data.get("collect_info", ""),
        "vad_latency": agent_data.get("vad_latency", 800),
        "tts_provider": agent_data.get("tts_provider", "deepgram"),
        "voice_gender": agent_data.get("voice_gender", "female"),
        "workflow_data": agent_data.get("workflow_data") or {},
    }

    if "kb_metadata" in agent_data:
        kb_metadata = {**kb_metadata, **agent_data["kb_metadata"]}

    system_prompt = agent_data.get("system_prompt")
    if not system_prompt:
        system_prompt = _compile_system_prompt(agent_data)

    db_data = {
        "workspace_id": workspace_id,
        "name": agent_data.get("name"),
        "system_prompt": system_prompt,
        "agent_system_prompt": agent_data.get("agent_system_prompt"),
        "voice_id": voice,
        "voice_provider": VOICE_PROVIDER_MAP.get(voice, "elevenlabs"),
        "language": agent_data.get("language", "en-US"),
        "interrupt_enabled": agent_data.get("allow_interruptions", True),
        "knowledge_base": agent_data.get("knowledge_base", ""),
        "kb_source_url": agent_data.get("website_url", "") or None,
        "kb_metadata": kb_metadata,
        "fallback_message": fallback_message or None,
        "handoff_enabled": bool(webhook_url),
        "handoff_webhook_url": webhook_url or None,
    }

    result = db.table("agents").insert(db_data).execute()
    new_agent = result.data[0]

    # Save to agent_contexts
    save_agent_context(db, new_agent["id"], agent_data.get("knowledge_base", ""), agent_data.get("agent_system_prompt", ""))
    new_agent["knowledge_base"] = agent_data.get("knowledge_base", "")
    new_agent["agent_system_prompt"] = agent_data.get("agent_system_prompt", "")

    # Handle phone number assignment if provided
    phone_number_id = agent_data.get("phone_number_id")
    if phone_number_id:
        db.table("phone_numbers").update({"agent_id": new_agent["id"]}).eq("id", phone_number_id).execute()

    return new_agent


@router.get("/{workspace_id}/agents")
async def list_agents(workspace_id: str, db: Client = Depends(get_db)):
    """List all agents in a workspace"""
    return fetch_workspace_agents_with_context(db, workspace_id)


@router.get("/{workspace_id}/agents/{agent_id}")
async def get_agent(workspace_id: str, agent_id: str, db: Client = Depends(get_db)):
    """Get agent details"""
    agent = fetch_agent_with_context(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.patch("/{workspace_id}/agents/{agent_id}")
async def update_agent(workspace_id: str, agent_id: str, agent_data: Dict[str, Any], db: Client = Depends(get_db)):
    """Update agent configuration"""
    workspace_id = workspace_id.strip()
    agent_id = agent_id.strip()
    
    logger.info(f"Updating agent {agent_id} in workspace {workspace_id}. Payload: {agent_data}")

    existing = fetch_agent_with_context(db, agent_id)
    if not existing or existing.get("workspace_id") != workspace_id:
        logger.error(f"Agent {agent_id} not found in workspace {workspace_id}")
        raise HTTPException(status_code=404, detail="Agent not found")

    # Initialize update payload
    update_payload = {}
    
    # Handle basic fields
    if "status" in agent_data: 
        update_payload["status"] = agent_data["status"]
        logger.info(f"Adding status to payload: {agent_data['status']}")
    
    if "name" in agent_data: update_payload["name"] = agent_data["name"]
    if "language" in agent_data: update_payload["language"] = agent_data["language"]
    if "knowledge_base" in agent_data: update_payload["knowledge_base"] = agent_data["knowledge_base"]
    if "website_url" in agent_data: update_payload["kb_source_url"] = agent_data["website_url"]
    if "webhook_url" in agent_data: 
        update_payload["handoff_webhook_url"] = agent_data["webhook_url"]
        update_payload["handoff_enabled"] = bool(agent_data["webhook_url"])

    if "agent_system_prompt" in agent_data:
        update_payload["agent_system_prompt"] = agent_data["agent_system_prompt"]

    if "allow_interruptions" in agent_data:
        update_payload["interrupt_enabled"] = agent_data["allow_interruptions"]
    
    if "voice" in agent_data:
        voice = agent_data["voice"]
        update_payload["voice_id"] = voice
        update_payload["voice_provider"] = VOICE_PROVIDER_MAP.get(voice, "elevenlabs")

    # Handle kb_metadata merge
    existing_kb = existing.get("kb_metadata") or {}
    new_kb_fields = {
        "business_name", "industry", "top_services", "pricing_range", "usp", "faq_barrier",
        "agent_vibe", "human_fallback_name", "human_fallback_extension",
        "call_goal", "collect_info", "vad_latency", "tts_provider", "voice_gender"
    }
    
    # Check if any KB fields are in agent_data
    if any(k in agent_data for k in new_kb_fields):
        kb_metadata = {
            **existing_kb,
            "business_name": agent_data.get("business_name", existing_kb.get("business_name", "")),
            "industry": agent_data.get("industry", existing_kb.get("industry", "")),
            "top_services": agent_data.get("top_services", existing_kb.get("top_services", "")),
            "pricing_range": agent_data.get("pricing_range", existing_kb.get("pricing_range", "")),
            "usp": agent_data.get("usp", existing_kb.get("usp", "")),
            "faq_barrier": agent_data.get("faq_barrier", existing_kb.get("faq_barrier", "")),
            "agent_vibe": agent_data.get("agent_vibe", existing_kb.get("agent_vibe", "professional")),
            "human_fallback_name": agent_data.get("human_fallback_name", existing_kb.get("human_fallback_name", "")),
            "human_fallback_extension": agent_data.get("human_fallback_extension", existing_kb.get("human_fallback_extension", "")),
            "call_goal": agent_data.get("call_goal", existing_kb.get("call_goal", "")),
            "collect_info": agent_data.get("collect_info", existing_kb.get("collect_info", "")),
            "vad_latency": agent_data.get("vad_latency", existing_kb.get("vad_latency", 800)),
            "tts_provider": agent_data.get("tts_provider", existing_kb.get("tts_provider", "deepgram")),
            "voice_gender": agent_data.get("voice_gender", existing_kb.get("voice_gender", "female")),
        }
        update_payload["kb_metadata"] = kb_metadata
    else:
        kb_metadata = existing_kb

    if "workflow_data" in agent_data:
        kb_metadata = {**kb_metadata, "workflow_data": agent_data["workflow_data"]}
        update_payload["kb_metadata"] = kb_metadata

    if "kb_metadata" in agent_data:
        kb_metadata = {**kb_metadata, **agent_data["kb_metadata"]}
        update_payload["kb_metadata"] = kb_metadata

    if "system_prompt" in agent_data:
        update_payload["system_prompt"] = agent_data["system_prompt"]

    # Update fallback message if relevant fields changed
    if any(k in agent_data for k in ["human_fallback_name", "human_fallback_extension"]):
        fb_name = agent_data.get("human_fallback_name", kb_metadata.get("human_fallback_name", "")).strip()
        fb_ext = agent_data.get("human_fallback_extension", kb_metadata.get("human_fallback_extension", "")).strip()
        update_payload["fallback_message"] = (f"{fb_name} ext. {fb_ext}".strip(" ext.").strip() or None)

    # Compile system prompt if any prompt-related field changed
    prompt_trigger_fields = {
        "knowledge_base", "agent_role", "agent_vibe", "unknown_rule",
        "forbidden_topics", "call_goal", "collect_info",
        "human_fallback_name", "human_fallback_extension"
    }
    if any(k in agent_data for k in prompt_trigger_fields):
        prompt_fields = {
            "agent_role": kb_metadata.get("agent_role", ""),
            "agent_vibe": kb_metadata.get("agent_vibe", "professional"),
            "call_goal": kb_metadata.get("call_goal", ""),
            "collect_info": kb_metadata.get("collect_info", ""),
            "unknown_rule": kb_metadata.get("unknown_rule", "callback"),
            "forbidden_topics": kb_metadata.get("forbidden_topics", ""),
            "human_fallback_name": kb_metadata.get("human_fallback_name", ""),
            "human_fallback_extension": kb_metadata.get("human_fallback_extension", ""),
            "knowledge_base": agent_data.get("knowledge_base", existing.get("knowledge_base", "")),
        }
        update_payload["system_prompt"] = _compile_system_prompt(prompt_fields)

    if "knowledge_base" in agent_data or "agent_system_prompt" in agent_data:
        save_agent_context(
            db,
            agent_id,
            knowledge_base=agent_data.get("knowledge_base"),
            agent_system_prompt=agent_data.get("agent_system_prompt")
        )

    if not update_payload and "phone_number_id" not in agent_data:
        return fetch_agent_with_context(db, agent_id)

    if update_payload:
        db.table("agents").update(update_payload).eq("id", agent_id).execute()

    updated_agent = fetch_agent_with_context(db, agent_id)
    if not updated_agent:
        logger.error(f"Update failed for agent {agent_id}: record not found after update")
        raise HTTPException(status_code=404, detail="Agent not found or update failed")
    logger.info(f"Successfully updated agent {agent_id}. New status: {updated_agent.get('status')}")

    # Handle phone number assignment/unassignment if provided
    if "phone_number_id" in agent_data:
        new_pn_id = agent_data["phone_number_id"]
        # First, unlink this agent from any other numbers
        db.table("phone_numbers").update({"agent_id": None}).eq("agent_id", agent_id).execute()
        # Then link to the new one if not None/empty
        if new_pn_id:
            db.table("phone_numbers").update({"agent_id": agent_id}).eq("id", new_pn_id).execute()

    return updated_agent




@router.delete("/{workspace_id}/agents/{agent_id}")
async def delete_agent(workspace_id: str, agent_id: str, db: Client = Depends(get_db)):
    """Delete an agent"""
    db.table("agents").delete().eq("workspace_id", workspace_id).eq("id", agent_id).execute()
    return {"status": "deleted"}
