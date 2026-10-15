import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from pathlib import Path
from dotenv import load_dotenv
from app.prompts.gym_trainer import GYM_TRAINER_SYSTEM_PROMPT, get_system_prompt

# Ensure .env is loaded from backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._reload_env()

    def _reload_env(self):
        load_dotenv(dotenv_path=env_path, override=True)
        self.provider = os.getenv("AI_PROVIDER", "gemini").lower()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        if not self.gemini_api_key and self.openai_api_key:
            self.provider = "openai"

    def is_configured(self) -> bool:
        self._reload_env()
        if self.provider == "gemini":
            return bool(self.gemini_api_key)
        elif self.provider == "openai":
            return bool(self.openai_api_key)
        return False

    def get_info(self) -> Dict[str, Any]:
        self._reload_env()
        return {
            "provider": self.provider,
            "model": self.gemini_model if self.provider == "gemini" else self.openai_model,
            "configured": self.is_configured(),
        }

    async def generate_response(self, message: str, history: List[Dict[str, str]], persona: str = "hypertrophy") -> str:
        """
        Sends the user message, conversation history, and persona to the configured AI API.
        """
        if not self.is_configured():
            missing_key_msg = (
                "AI API key is missing. Please set `GEMINI_API_KEY` (recommended free tier) "
                "or `OPENAI_API_KEY` in `fitbot-ai/backend/.env`.\n\n"
                "To get a free Gemini API key:\n"
                "1. Visit https://aistudio.google.com/app/apikey\n"
                "2. Click 'Create API key'\n"
                "3. Paste it into your `fitbot-ai/backend/.env` file as `GEMINI_API_KEY=your_key_here`\n"
                "4. Restart the backend server."
            )
            raise ValueError(missing_key_msg)

        if self.provider == "gemini":
            return await self._call_gemini(message, history, persona)
        elif self.provider == "openai":
            return await self._call_openai(message, history, persona)
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}")

    async def _call_gemini(self, message: str, history: List[Dict[str, str]], persona: str = "hypertrophy") -> str:
        candidate_models = [self.gemini_model, "gemini-3.5-flash-lite", "gemini-3.8-flash"]
        # Deduplicate while preserving order
        unique_models = list(dict.fromkeys([m for m in candidate_models if m]))

        # Construct contents for Gemini API
        contents = []
        for item in history[-10:]:
            role = "model" if item.get("role") == "assistant" else "user"
            content_text = item.get("content", "").strip()
            if content_text:
                contents.append({
                    "role": role,
                    "parts": [{"text": content_text}]
                })

        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        system_instruction_text = get_system_prompt(persona)

        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction_text}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }

        last_error = None
        for model in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_api_key}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    response = await client.post(
                        url,
                        headers={"Content-Type": "application/json"},
                        json=payload
                    )
                except httpx.TimeoutException:
                    last_error = RuntimeError("Request to Gemini API timed out.")
                    continue
                except httpx.RequestError as exc:
                    last_error = RuntimeError(f"Network error connecting to Gemini API: {str(exc)}")
                    continue

            # If 503 (high demand) or 404 (model unavailable), try next model in fallback list
            if response.status_code in [503, 404]:
                logger.warning(f"Model {model} returned {response.status_code}. Trying next available fallback model...")
                last_error = RuntimeError(f"Gemini API returned status {response.status_code}: {response.text}")
                continue

            if response.status_code == 429:
                raise RuntimeError("Gemini API rate limit reached. Please wait a few seconds before retrying.")

            if response.status_code in [400, 403]:
                err_data = response.json().get("error", {})
                err_msg = err_data.get("message", "Invalid API key or request format.")
                raise RuntimeError(f"Gemini API error ({response.status_code}): {err_msg}")

            if response.status_code != 200:
                last_error = RuntimeError(f"Gemini API returned status {response.status_code}: {response.text}")
                continue

            try:
                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    feedback = data.get("promptFeedback", {})
                    block_reason = feedback.get("blockReason")
                    if block_reason:
                        return f"I couldn't process this request due to safety filtering: {block_reason}. Let's focus on your workout and training goals!"
                    return "I couldn't generate a workout response. Please try rephrasing your question."

                first_candidate = candidates[0]
                parts = first_candidate.get("content", {}).get("parts", [])
                reply_text = "".join(part.get("text", "") for part in parts).strip()
                return reply_text or "Workout plan received with empty text. Please ask again!"
            except Exception as e:
                logger.error(f"Error parsing Gemini response: {e}")
                last_error = RuntimeError("Failed to parse response from Gemini API.")

        if last_error:
            raise last_error
        raise RuntimeError("Unable to get a response from any Gemini model.")

    async def _call_openai(self, message: str, history: List[Dict[str, str]], persona: str = "hypertrophy") -> str:
        url = "https://api.openai.com/v1/chat/completions"

        messages = [
            {"role": "system", "content": get_system_prompt(persona)}
        ]

        for item in history[-10:]:
            role = item.get("role", "user")
            content = item.get("content", "").strip()
            if content and role in ["user", "assistant"]:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": message})

        payload = {
            "model": self.openai_model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048,
        }

        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
            except httpx.TimeoutException:
                raise RuntimeError("Request to OpenAI API timed out. Please try again.")
            except httpx.RequestError as exc:
                raise RuntimeError(f"Network error connecting to OpenAI API: {str(exc)}")

        if response.status_code == 429:
            raise RuntimeError("OpenAI API rate limit or quota exceeded. Check your plan/billing.")

        if response.status_code == 401:
            raise RuntimeError("Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.")

        if response.status_code != 200:
            raise RuntimeError(f"OpenAI API returned status {response.status_code}: {response.text}")

        data = response.json()
        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            return choices[0]["message"].get("content", "").strip()

        return "No response generated from OpenAI."
