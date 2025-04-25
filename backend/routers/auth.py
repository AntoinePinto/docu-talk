import os
from base64 import b64encode
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from config.config import (
    USER_PERIOD_DOLLAR_AMOUNT,
    docu_talk,
    get_current_user,
    mailing_bot,
)
from utils.auth import generate_password

router = APIRouter()

class Chatbot(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    access: str
    user_role: str
    suggested_prompts: list[str]
    documents: list[dict]
    accesses: list[dict]

class User(BaseModel):
    email: str
    first_name: str
    last_name: str
    friendly_name: str
    period_dollar_amount: float
    terms_of_use_displayed: bool
    is_guest: bool
    id: str
    timestamp: datetime
    chatbots: list[Chatbot]

class GoogleToken(BaseModel):
    credential: str

class MicrosoftToken(BaseModel):
    access_token: str

class SignUpForm(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str

def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ):
    """
    Generate a JWT access token with an optional expiration time.

    Parameters
    ----------
    data : dict
        The payload data to encode in the JWT.
    expires_delta : timedelta, optional
        The duration before the token expires. Defaults to 15 minutes if not provided.

    Returns
    -------
    str
        The encoded JWT token.
    """

    if expires_delta is None:
        expires_delta = timedelta(minutes=15)

    data["exp"] = datetime.now(timezone.utc) + expires_delta

    encoded_jwt = jwt.encode(
        payload=data,
        key=os.getenv("JWT_SECRET_KEY"),
        algorithm=os.getenv("JWT_ALGORITHM")
    )

    return encoded_jwt

async def get_provider_data(
        provider: Literal["google", "microsoft"],
        token: str
    ) -> dict:
    """
    Retrieve user information from OAuth provider using the access token.

    Parameters
    ----------
    provider : {'google', 'microsoft'}
        The OAuth provider.
    token : str
        The OAuth access token.

    Returns
    -------
    dict
        The user information retrieved from the provider.

    Raises
    ------
    HTTPException
        If the token is invalid or the request fails.
    """

    if provider == "google":
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
    elif provider == "microsoft":
        url = "https://graph.microsoft.com/v1.0/me"

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url=url,
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return response.json()

@router.post("/google")
async def google_auth(google_token: GoogleToken):
    """
    Authenticate a user via Google OAuth and generate an access token.

    Parameters
    ----------
    google_token : GoogleToken
        Google OAuth credential token.

    Returns
    -------
    dict
        Access token, token type, and basic user info.
    """

    user_info = await get_provider_data(
        provider="google",
        token=google_token.credential
    )

    email = user_info["email"]
    name = user_info.get("name", "")
    picture = user_info.get("picture", "")

    existing_users = docu_talk.get_users()
    if email not in existing_users:

        password = generate_password()
        first_name=user_info.get("given_name", name)
        last_name=user_info.get("family_name", "")

        docu_talk.create_user(
            email=email,
            first_name=user_info.get("given_name", ""),
            last_name=last_name,
            password=password,
            period_dollar_amount=USER_PERIOD_DOLLAR_AMOUNT
        )

        mailing_bot.send_welcome_email(
            recipient=email,
            first_name=first_name
        )

    access_token = create_access_token(
        data={
            "sub": email,
            "name": name,
            "picture": picture
        },
        expires_delta=timedelta(
            minutes=float(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
        )
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "name": name,
            "picture": picture
        }
    }

@router.post("/microsoft")
async def microsoft_auth(
        microsoft_token: MicrosoftToken
    ):
    """
    Authenticate a user via Microsoft OAuth and generate an access token.

    Parameters
    ----------
    microsoft_token : MicrosoftToken
        Microsoft OAuth access token.

    Returns
    -------
    dict
        Access token, token type, and basic user info.
    """

    user_data = await get_provider_data(
        provider="microsoft",
        token=microsoft_token.access_token
    )

    email = user_data.get("mail") or user_data.get("userPrincipalName")
    name = user_data.get("displayName", "")
    first_name = user_data.get("givenName", name)
    last_name = user_data.get("surname", "")

    existing_users = docu_talk.get_users()
    if email not in existing_users:

        password = generate_password()

        docu_talk.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            period_dollar_amount=USER_PERIOD_DOLLAR_AMOUNT
        )

        mailing_bot.send_welcome_email(
            recipient=email,
            first_name=first_name
        )

    # Create our own JWT token
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(
            minutes=float(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
        )
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "friendly_name": name
        }
    }

@router.post("/token")
async def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends()
    ):
    """
    Authenticate user using email and password, and return a JWT access token.

    Parameters
    ----------
    form_data : OAuth2PasswordRequestForm
        Form data containing username (email) and password.

    Returns
    -------
    dict
        Access token and token type.

    Raises
    ------
    HTTPException
        If credentials are invalid.
    """

    check = docu_talk.check_login(
        email=form_data.username,
        password=form_data.password
    )

    if not check:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(
            minutes=float(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
        )
    )

    response = {
        "access_token": access_token,
        "token_type": "bearer"
    }

    return response

@router.post("/signup")
async def signup(form_data: SignUpForm):
    """
    Register a new user account and return an access token.

    Parameters
    ----------
    form_data : SignUpForm
        User registration details including email, name, and password.

    Returns
    -------
    dict
        Access token, token type, user info, and success message.

    Raises
    ------
    HTTPException
        If the user already exists.
    """

    existing_users = docu_talk.get_users()
    if form_data.email in existing_users:
        raise HTTPException(
            status_code=401,
            detail="User already exists"
        )

    docu_talk.create_user(
        email=form_data.email,
        first_name=form_data.first_name,
        last_name=form_data.last_name,
        password=form_data.password,
        period_dollar_amount=USER_PERIOD_DOLLAR_AMOUNT
    )

    mailing_bot.send_welcome_email(
        recipient=form_data.email,
        first_name=form_data.first_name,
        id=form_data.email
    )

    # Create access token for immediate login
    access_token = create_access_token(
        data={"sub": form_data.email},
        expires_delta=timedelta(
            minutes=float(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
        )
    )

    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": form_data.email,
            "first_name": form_data.first_name,
            "last_name": form_data.last_name
        },
        "message": "User created successfully"
    }

    return response

@router.get("/user", response_model=User)
async def get_user(
        email: str = Depends(get_current_user)
    ):
    """
    Retrieve detailed information about the current authenticated user.

    Parameters
    ----------
    email : str
        The current authenticated user's email.

    Returns
    -------
    User
        User object containing personal details and associated chatbots.
    """

    user = docu_talk.get_user(email=email)

    users_data = docu_talk.db.get_data(
        table="Users",
        filter={"email": email}
    )

    user_data = users_data[0]

    chatbots_data = docu_talk.get_user_chatbots(
        user_id=email
    )

    chatbots = []
    for chatbot_data in chatbots_data:
        chatbot_data["icon"] = b64encode(chatbot_data["icon"]).decode("utf-8")
        chatbot = Chatbot.model_validate(chatbot_data)
        chatbots.append(chatbot)

    user_data["chatbots"] = chatbots

    user = User.model_validate(user_data)

    return user

@router.post("/get_remaining_credits")
async def get_remaining_credits(
        email: str = Depends(get_current_user)
    ):
    """
    Get the remaining credits (consumed price) for the authenticated user.

    Parameters
    ----------
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        The total consumed price.
    """

    consumed_price = docu_talk.get_consumed_price(
        user_id=email
    )

    response = {
        "consumed_price": consumed_price
    }

    return response

@router.delete("/delete_account")
async def delete_account(
        email: str = Depends(get_current_user)
    ):
    """
    Initiate deletion of the authenticated user's account.

    Parameters
    ----------
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming account deletion initiation.
    """

    docu_talk.delete_user(
        user_id=email
    )

    response = {"message": "Account deletion initiated"}

    return response

@router.post("/set_terms_accepted")
async def set_terms_accepted(
        email: str = Depends(get_current_user)
    ):
    """
    Mark the terms of use as accepted for the current user.

    Parameters
    ----------
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming acceptance of terms of use.
    """

    docu_talk.db.update_data(
        table="Users",
        filter={"email": email},
        updates={"terms_of_use_displayed": True}
    )

    return {"message": "Terms of use accepted"}
