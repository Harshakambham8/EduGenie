"""
Configuration module for EduGenie.
Handles environment variables and application-level settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    # In production we require a key; keep behavior explicit so failures are obvious.
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Use the specific stable flash model. Do NOT use -latest or pro-latest variants.
MODEL_NAME = "gemini-2.5-flash-lite"

