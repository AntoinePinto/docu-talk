import jwt
import time

from datetime import datetime, timedelta, timezone

from streamlit_cookies_controller import CookieController

from utils.misc import get_param_or_env

class TokenManager:
    """
    A class to manage JWT tokens and cookies for authentication purposes.
    """

    def __init__(
            self,
            cookie_name: str,
            secret_key: str,
            token_expiration: int = 1
        ) -> None:
        """
        Initializes the TokenManager with cookie settings and token parameters.

        Parameters
        ----------
        cookie_name : str
            The name of the cookie to store the token.
        secret_key : str
            The secret key for encoding and decoding JWT tokens.
        token_expiration : int, optional
            Token expiration time in hours (default is 1).
        """

        self.cookies = CookieController()
        self.cookie_name = cookie_name
        self.secret_key = get_param_or_env(secret_key, "TOKEN_SECRET_KEY")
        self.token_expiration = token_expiration

    def generate_token(
            self,
            user_id: str
        ) -> str:
        """
        Generates a JWT token for a given user ID.

        Parameters
        ----------
        user_id : str
            The user ID to include in the token payload.

        Returns
        -------
        str
            The generated JWT token.
        """

        data = {
            "user_id": user_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=self.token_expiration)
        }

        token = jwt.encode(
            payload=data,
            key=self.secret_key,
            algorithm="HS256"
        )

        return token

    def verify_token(
            self,
            token: str
        ) -> str | None:
        """
        Verifies a JWT token and extracts the user ID.

        Parameters
        ----------
        token : str
            The JWT token to verify.

        Returns
        -------
        str or None
            The user ID if the token is valid, otherwise None.
        """

        try:

            decoded_token = jwt.decode(
                jwt=token,
                key=self.secret_key,
                algorithms=["HS256"]
            )

            return decoded_token["user_id"]

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
            return None

    def get_token(self) -> str | None:
        """
        Retrieves the JWT token from the cookies.

        Returns
        -------
        str or None
            The token if it exists, otherwise None.
        """

        n = 0
        while self.cookies.getAll() == {}:
            time.sleep(0.25)
            n += 1
            if n > 15:
                return

        token = self.cookies.get("docu-talk")

        return token

    def delete_token(self) -> None:
        """
        Deletes the JWT token from the cookies.
        """

        self.cookies.remove("docu-talk")
        time.sleep(2)

    def create_token(
            self,
            email: str
        ) -> None:
        """
        Creates and stores a JWT token for a given email.

        Parameters
        ----------
        email : str
            The email address to encode in the token.
        """

        token = self.generate_token(email)
        self.cookies.set("docu-talk", token)
        time.sleep(2)
