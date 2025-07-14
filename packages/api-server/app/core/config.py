import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """
    Application settings.
    Using Pydantic's settings management is also a good practice here.
    """
    PROJECT_NAME: str = "DevMind API"
    PROJECT_VERSION: str = "0.1.0"

    # Add any API keys or other secrets here
    # Example: GROQ_API_KEY = os.getenv("GROQ_API_KEY")

settings = Settings()
