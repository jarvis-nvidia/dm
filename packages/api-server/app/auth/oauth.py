"""OAuth2 configuration and utilities."""
import httpx
from urllib.parse import urlencode
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.auth.models import GitHubUser
import logging

logger = logging.getLogger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    scopes={
        "profile": "Read user profile information",
        "projects": "Access to user projects",
        "admin": "Administrative access",
    },
    auto_error=False
)

# GitHub OAuth configuration
GITHUB_OAUTH_CONFIG = {
    "client_id": settings.GITHUB_CLIENT_ID,
    "client_secret": settings.GITHUB_CLIENT_SECRET,
    "redirect_uri": settings.GITHUB_REDIRECT_URI,
    "scope": "user:email",
    "authorize_url": "https://github.com/login/oauth/authorize",
    "token_url": "https://github.com/login/oauth/access_token",
    "user_url": "https://api.github.com/user"
}

class GitHubOAuth2:
    """GitHub OAuth2 client."""
    
    def __init__(self, config: dict):
        self.config = config
    
    async def get_access_token(self, code: str) -> str:
        """Exchange authorization code for access token."""
        if not self.config["client_id"] or not self.config["client_secret"]:
            raise Exception("GitHub OAuth not configured")
        
        data = {
            "client_id": self.config["client_id"],
            "client_secret": self.config["client_secret"],
            "code": code,
            "redirect_uri": self.config["redirect_uri"]
        }
        
        headers = {"Accept": "application/json"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.config["token_url"],
                data=data,
                headers=headers
            )
            response.raise_for_status()
            token_data = response.json()
            return token_data["access_token"]

def create_github_oauth_url() -> str:
    """Create GitHub OAuth authorization URL."""
    if not settings.GITHUB_CLIENT_ID:
        raise Exception("GitHub OAuth not configured")
    
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": GITHUB_OAUTH_CONFIG["scope"],
        "response_type": "code"
    }
    
    return f"{GITHUB_OAUTH_CONFIG['authorize_url']}?{urlencode(params)}"

async def get_github_user_data(access_token: str) -> GitHubUser:
    """Get GitHub user data using access token."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_OAUTH_CONFIG["user_url"],
            headers=headers
        )
        response.raise_for_status()
        user_data = response.json()
        return GitHubUser(**user_data)

# Initialize GitHub OAuth2 client
github_oauth2 = GitHubOAuth2(GITHUB_OAUTH_CONFIG)