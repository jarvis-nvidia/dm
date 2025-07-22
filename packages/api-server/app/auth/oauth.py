"""OAuth2 configuration and utilities."""
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

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