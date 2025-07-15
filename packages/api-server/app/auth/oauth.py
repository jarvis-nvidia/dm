"""GitHub OAuth implementation for DevMind."""
from typing import Optional
from fastapi.security import OAuth2AuthorizationCodeBearer
from httpx import AsyncClient
from app.core.config import settings
from app.auth.models import GitHubUser

GITHUB_OAUTH_URL = "https://github.com/login/oauth"
GITHUB_API_URL = "https://api.github.com"

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{GITHUB_OAUTH_URL}/authorize",
    tokenUrl=f"{GITHUB_OAUTH_URL}/access_token",
)

class GitHubOAuth2:
    def __init__(self):
        self.client_id = settings.GITHUB_CLIENT_ID
        self.client_secret = settings.GITHUB_CLIENT_SECRET
        self.redirect_uri = settings.GITHUB_REDIRECT_URI
        self.client = AsyncClient()

    async def get_access_token(self, code: str) -> str:
        """Exchange authorization code for access token."""
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri,
        }

        headers = {"Accept": "application/json"}

        async with self.client as client:
            response = await client.post(
                f"{GITHUB_OAUTH_URL}/access_token",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data["access_token"]

    async def get_user_data(self, access_token: str) -> dict:
        """Get GitHub user data using access token."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/json",
        }

        async with self.client as client:
            response = await client.get(
                f"{GITHUB_API_URL}/user",
                headers=headers
            )
            response.raise_for_status()
            return response.json()

# Initialize GitHub OAuth handler
github_oauth2 = GitHubOAuth2()

def create_github_oauth_url() -> str:
    """Create GitHub OAuth authorization URL."""
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "read:user user:email",
        "response_type": "code",
    }

    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{GITHUB_OAUTH_URL}/authorize?{query}"

async def get_github_user_data(access_token: str) -> GitHubUser:
    """Get GitHub user data and convert to GitHubUser model."""
    user_data = await github_oauth2.get_user_data(access_token)
    return GitHubUser(**user_data)
