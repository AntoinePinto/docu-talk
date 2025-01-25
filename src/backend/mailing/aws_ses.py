import boto3

from utils.misc import get_param_or_env

class AWSMailSES:
    """
    A class to manage sending emails using AWS Simple Email Service (SES).
    """

    def __init__(
            self,
            server_public_key: str | None = None,
            server_secret_key: str | None = None,
            region: str | None = None
        ) -> None:
        """
        Initializes the AWSMailSES client with credentials and region.

        Parameters
        ----------
        server_public_key : str or None, optional
            The AWS public key for authentication.
        server_secret_key : str or None, optional
            The AWS secret key for authentication.
        region : str or None, optional
            The AWS region for the SES service.
        """
        
        server_public_key = get_param_or_env(server_public_key, "AWS_SERVER_PUBLIC_KEY")
        server_secret_key = get_param_or_env(server_secret_key, "AWS_SERVER_SECRET_KEY")
        region = get_param_or_env(region, "AWS_REGION")
        
        self.client = boto3.client(
            "ses",
            aws_access_key_id=server_public_key,
            aws_secret_access_key=server_secret_key,
            region_name=region
        )

    def send_email(
            self,
            sender: str,
            recipient: str,
            subject: str,
            body_html: str,
            body_text: str,
            charset: str = "UTF-8",
            bcc_recipient: str | None = None,
        ) -> None:
        """
        Sends an email using AWS SES.

        Parameters
        ----------
        sender : str
            The email address of the sender.
        recipient : str
            The email address of the recipient.
        subject : str
            The subject line of the email.
        body_html : str
            The HTML version of the email body.
        body_text : str
            The plain text version of the email body.
        charset : str, optional
            The character set for the email content (default is "UTF-8").
        bcc_recipient : str or None, optional
            The email address for BCC (default is None).
        """
        
        destination = {
            "ToAddresses": [
                recipient,
            ]
        }

        if bcc_recipient is not None:
            destination["BccAddresses"] = [
                bcc_recipient,
            ]
        
        self.client.send_email(
            Source=sender,
            Destination=destination,
            Message={
                "Body": {
                    "Html": {
                        "Charset": charset,
                        "Data": body_html,
                    },
                    "Text": {
                        "Charset": charset,
                        "Data": body_text,
                    },
                },
                "Subject": {
                    "Charset": charset,
                    "Data": subject,
                },
            }
        )