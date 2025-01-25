import os

from uuid import uuid4

import streamlit as st

from config import (
    TOKEN_EXPIRATION_HOURS,
    USER_PERIOD_DOLLAR_AMOUNT,
    GUEST_PERIOD_DOLLAR_AMOUNT
)

from auth.cookies import TokenManager
from docu_talk.docu_talk import DocuTalk
from mailing.mailing_bot import MailingBot
from utils.auth import is_valid_email

class Auth:
    """
    A class to manage user authentication, including sign-up, sign-in, guest access,
    and logout.
    """

    def __init__(
            self,
            docu_talk: DocuTalk,
            mailing_bot: MailingBot
        ) -> None:
        """
        Initializes the Auth class with the DocuTalk and MailingBot services.

        Parameters
        ----------
        docu_talk : DocuTalk
            The DocuTalk service instance.
        mailing_bot : MailingBot
            The mailing bot service instance.
        """

        self.docu_talk = docu_talk
        self.mailing_bot = mailing_bot
        self.logged_in = False

        self.token_manager = TokenManager(
            cookie_name="docu-talk",
            secret_key=os.getenv("TOKEN_SECRET_KEY"),
            token_expiration=TOKEN_EXPIRATION_HOURS
        )

        self.check_token()

    def check_token(self) -> None:
        """
        Checks the validity of the JWT token stored in cookies.
        If valid, retrieves the associated user; otherwise, deletes the token.
        """

        token = self.token_manager.get_token()

        if token is not None:
            email = self.token_manager.verify_token(token)
            if email is None:
                self.token_manager.delete_token()
            else:
                self.user = self.docu_talk.get_user(email)
                self.logged_in = True

    def logout(self) -> None:
        """
        Logs out the user by deleting the stored JWT token and updating the login state.
        """

        self.token_manager.delete_token()
        self.logged_in = False

    def sign_up(
            self,
            email: str,
            first_name: str,
            last_name: str
        ) -> None:
        """
        Registers a new user and sends a welcome email with login details.

        Parameters
        ----------
        email : str
            The email address of the user.
        first_name : str
            The first name of the user.
        last_name : str
            The last name of the user.

        Raises
        ------
        streamlit.error
            If the email, first name, or last name format is invalid or the email
            already exists.
        """

        if not is_valid_email(email):
            st.error("Invalid Email format")

        elif first_name == "":
            st.error("Invalid First Name format")

        elif last_name == "":
            st.error("Invalid Last Name format")

        else:

            existing_users = self.docu_talk.get_users()
            if email in [user["email"] for user in existing_users]:
                st.error("Email already exists")
            else:
                password = self.docu_talk.create_user(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    period_dollar_amount=USER_PERIOD_DOLLAR_AMOUNT
                )

                self.mailing_bot.send_welcome_email(
                    recipient=email,
                    first_name=first_name,
                    id=email,
                    password=password
                )

                st.success(
                    "Successful registration. You have received an e-mail "
                    "containing your login details (check your spam)."
                )

                st.balloons()

    def sign_in(
            self,
            email: str,
            password: str
        ) -> None:
        """
        Logs in an existing user by verifying their credentials.

        Parameters
        ----------
        email : str
            The email address of the user.
        password : str
            The password of the user.

        Raises
        ------
        streamlit.error
            If the email or password is invalid.
        """

        if self.docu_talk.check_login(email, password) is True:
            self.token_manager.create_token(email)
            self.user = self.docu_talk.get_user(email)
            self.logged_in = True
            st.rerun()
        else:
            st.error("Invalid Email or Password")

    def sign_guest(self) -> None:
        """
        Creates a guest account for temporary access and logs the guest in.
        """

        email = f"guest-{uuid4()}@ai-apps.cloud"

        self.docu_talk.create_user(
            email=email,
            first_name="Guest",
            last_name="GUEST",
            period_dollar_amount=GUEST_PERIOD_DOLLAR_AMOUNT,
            is_guest=True
        )

        self.token_manager.create_token(email)
        self.user = self.docu_talk.get_user(email)
        self.logged_in = True
        st.rerun()
