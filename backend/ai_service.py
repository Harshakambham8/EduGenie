"""AI Service module.
Handles Gemini interactions for EduGenie.

This module initializes a Gemini `genai.Client` configured to use
the stable v1 API (not v1beta). It exposes functions that keep
their existing signatures; internal calls pass a local
`prompt_or_question` variable to `client.models.generate_content`.
"""

import json
import logging
from google import genai
from google.genai.types import HttpOptions
from config import GEMINI_API_KEY, MODEL_NAME

# Configure logger
logger = logging.getLogger(__name__)

# Initialize Gemini client forcing API version v1
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=HttpOptions(api_version="v1"),
)


def generate_answer(question: str) -> str:
    """Generate a direct answer to a question.

    Keeps the same signature. Uses `prompt_or_question` locally
    and calls `client.models.generate_content` with `model` and
    `contents` to ensure the v1 API is used.
    """
    prompt_or_question = question
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_or_question,
        )

        return getattr(response, "text", str(response))
    except Exception as e:
        logger.exception("Error generating answer")
        raise


def explain_topic(topic: str, level: str) -> str:
    """Explain a topic at a given complexity level.

    Signature unchanged; constructs a prompt and delegates to
    `client.models.generate_content` using the `contents=` param.
    """
    prompt_or_question = f"Explain {topic} at a {level} level with examples."
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_or_question,
        )

        return getattr(response, "text", str(response))
    except Exception as e:
        logger.exception("Error explaining topic")
        raise


def generate_quiz(topic: str, difficulty: str, num_questions: int) -> dict:
    """Generate a quiz in strict JSON format.

    Builds the prompt, calls the v1 API, strips any markdown fences,
    and validates the returned JSON.
    """
    prompt_or_question = f"""
    Generate {num_questions} multiple choice questions about {topic}.
    Difficulty: {difficulty}.

    Return ONLY valid JSON in this format:

    {{
      "questions": [
        {{
          "question": "string",
          "options": ["A", "B", "C", "D"],
          "answer": "A"
        }}
      ]
    }}

    Do NOT include markdown formatting.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_or_question,
        )

        raw = getattr(response, "text", str(response)).strip()

        # Remove markdown fences if present
        if raw.startswith("```"):
            parts = raw.split("```")
            if len(parts) >= 2:
                raw = parts[1]

        quiz_data = json.loads(raw)
        return quiz_data

    except json.JSONDecodeError:
        logger.exception("Quiz response was not valid JSON.")
        raise ValueError("Invalid quiz format returned by AI.")
    except Exception:
        logger.exception("Error generating quiz")
        raise

def step_by_step_solution(question: str) -> str:
    """Provide step-by-step solution to a problem."""
    prompt = f"Solve the following problem step by step:\n\n{question}"

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return response.text

    except Exception as e:
        logger.error(f"Error generating solution: {e}")
        raise

def summarize_text(text: str) -> str:
    """Summarize a block of text."""
    prompt = f"""
    Summarize the following text clearly and concisely:

    {text}
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text

    except Exception as e:
        logger.error(f"Error summarizing text: {e}")
        raise
