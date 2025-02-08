import os
from string import Template

from html2text import html2text
from mailing.aws_ses import AWSMailSES
from utils.file_io import recursive_read


class MailingBot:
    """
    A class to handle sending templated emails using AWS SES.
    """

    def __init__(
            self,
            encoded_logo: bytes
        ) -> None:
        """
        Initializes the MailingBot with email templates and AWS SES configuration.

        Parameters
        ----------
        encoded_logo : bytes
            The base64-encoded logo to embed in email templates.
        """

        self.email_service = AWSMailSES(
            server_public_key=os.getenv("AWS_SES_SERVER_PUBLIC_KEY"),
            server_secret_key=os.getenv("AWS_SES_SERVER_SECRET_KEY"),
            region=os.getenv("AWS_SES_REGION")
        )

        self.emails = recursive_read(
            folder=os.path.join(os.path.dirname(__file__), "templates"),
            extensions=(".html")
        )

        self.encoded_logo = encoded_logo

    def send_welcome_email(
            self,
            recipient: str,
            first_name: str,
            id: str | None = None,
            password: str | None = None
        ) -> None:
        """
        Sends a welcome email to a new user.

        Parameters
        ----------
        recipient : str
            The email address of the recipient.
        first_name : str
            The first name of the recipient.
        id : str
            The user ID for the recipient.
        password : str
            The generated password for the recipient.
        """

        if id is not None:
            html = Template(self.emails["welcome"]).substitute(
                logo=self.encoded_logo,
                first_name=first_name,
                id=id,
                password=password
            )
        else:
            html = Template(self.emails["welcome_no_ids"]).substitute(
                logo=self.encoded_logo,
                first_name=first_name
            )

        self.email_service.send_email(
            sender="support@ai-apps.cloud",
            recipient=recipient,
            bcc_recipient="support@ai-apps.cloud",
            subject="Welcome to Docu Talk!",
            body_html=html,
            body_text=html2text(html)
        )

    def send_chatbot_shared_email(
            self,
            recipient: str,
            sharing_name: str,
            chatbot_name: str
        ) -> None:
        """
        Sends an email notifying the recipient that a chatbot has been shared with them.

        Parameters
        ----------
        recipient : str
            The email address of the recipient.
        sharing_name : str
            The name of the person sharing the chatbot.
        chatbot_name : str
            The name of the chatbot being shared.
        """

        html = Template(self.emails["chatbot_shared"]).substitute(
            logo=self.encoded_logo,
            sharing_name=sharing_name,
            chatbot_name=chatbot_name
        )

        self.email_service.send_email(
            sender="support@ai-apps.cloud",
            recipient=recipient,
            bcc_recipient="support@ai-apps.cloud",
            subject=f"{sharing_name} shared a Chat Bot with you!",
            body_html=html,
            body_text=html2text(html)
        )
