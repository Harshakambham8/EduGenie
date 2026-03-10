from google import genai
from google.genai.types import HttpOptions
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=HttpOptions(api_version="v1")
)

models = client.models.list()

for model in models:
    print(model.name)
