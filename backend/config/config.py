import json
import os

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from docu_talk.docu_talk import DocuTalk
from mailing.mailing_bot import MailingBot
from utils.file_io import get_encoded_image

docu_talk = DocuTalk()

LOGO_PATH = os.path.join(os.path.dirname(__file__), "..","assets", "logo_docu_talk.png")
mailing_bot = MailingBot(
    encoded_logo=get_encoded_image(path=LOGO_PATH)
)

path = os.path.join(os.path.dirname(__file__), "config.json")
with open(path) as f:
    CONFIG = json.load(f)

DISPLAY_GUEST_MODE = CONFIG["display_guest_mode"]
TOKEN_EXPIRATION_HOURS = CONFIG["token_expiration_hours"]
USER_PERIOD_DOLLAR_AMOUNT = CONFIG["credits"]["period_dollar_amount"]["user"]
BASIC_MODEL_NAME = CONFIG["models"]["basic"]
PREMIUM_MODEL_NAME = CONFIG["models"]["premium"]
GUEST_PERIOD_DOLLAR_AMOUNT = CONFIG["credits"]["period_dollar_amount"]["guest"]
CREDIT_EXCHANGE_RATE = CONFIG["credits"]["credit_exchange_rate"]
MAX_ICON_FILE_SIZE = CONFIG["limits"]["max_icon_file_size"]
MAX_NB_DOC_PER_CHATBOT = CONFIG["limits"]["max_nb_doc_per_chatbot"]
MAX_NB_PAGES_PER_CHATBOT = CONFIG["limits"]["max_nb_pages_per_chatbot"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user(
        token: str = Depends(oauth2_scheme)
    ):
    """
    Decode the JWT token to retrieve the current authenticated user's email.

    Parameters
    ----------
    token : str
        The JWT token provided by the OAuth2 scheme.

    Returns
    -------
    str
        The email of the authenticated user extracted from the token.
    """

    payload = jwt.decode(
        jwt=token,
        key=os.getenv("JWT_SECRET_KEY"),
        algorithms=[os.getenv("JWT_ALGORITHM")]
    )

    email = payload.get("sub")

    return email

def check_user_access(
        chatbot_id: str,
        email: str,
        check_admin: bool = False
    ):
    """
    Verify if a user has access to a specific chatbot, with an optional admin check.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    email : str
        The user's email to check access for.
    check_admin : bool, optional
        If True, verifies that the user has admin rights. Default is False.

    Raises
    ------
    HTTPException
        If the user does not have access to the chatbot or lacks admin privileges when
        required.
    """

    user_accesses = docu_talk.get_user_accesses(user_id=email)

    if chatbot_id not in user_accesses:

        raise HTTPException(
            status_code=403,
            detail="You don't have access to this chatbot"
        )

    if check_admin:

        if user_accesses[chatbot_id] != "Admin":

            raise HTTPException(
                status_code=403,
                detail="You don't have admin access to this chatbot"
            )
