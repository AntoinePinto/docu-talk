import os

from typing import Any

from datetime import datetime, timedelta
from uuid import uuid4

from docu_talk.agents import(
    ChatBotService,
    GoogleCloudStorageManager,
    Predictor
)

from docu_talk.base import ChatBot

from docu_talk.database.database import Database
from utils.auth import generate_password, hash_password, verify_password

class DocuTalk:
    """
    A service class for managing chatbots, users, documents, and usage within the 
    DocuTalk application.
    """

    def __init__(self) -> None:
        """
        Initializes the DocuTalk instance with storage, database, and prediction 
        services.
        """
        
        self.storage_manager = GoogleCloudStorageManager(
            project_id=os.getenv("GCP_PROJECT_ID"),
            bucket_name=os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET")
        )

        self.db = Database(
            uri=os.getenv("MONGO_DB_URI"),
            database_name=os.getenv("MONGO_DB_NAME")
        )

        self.predictor = Predictor()

        self.models = self.db.get_data(table="ServiceModels")

    def get_users(self) -> list[dict]:
        """
        Retrieves all registered users.

        Returns
        -------
        list of dict
            A list of user dictionaries.
        """

        users = self.db.get_data(
            table="Users",
            filter={}
        )

        return users

    def get_chatbot_users(
            self,
            chatbot_id: str
        ) -> list[str]:
        """
        Retrieves all user IDs with access to a specified chatbot.

        Parameters
        ----------
        chatbot_id : str
            The unique identifier for the chatbot.

        Returns
        -------
        list of str
            A list of user IDs.
        """

        access = self.db.get_data(
            table="Access",
            filter={"chatbot_id": chatbot_id}
        )

        chatbot_users = [user["user_id"] for user in access if user["user_id"]]

        return chatbot_users

    def create_user(
            self,
            first_name: str,
            last_name: str,
            email: str,
            period_dollar_amount: float,
            is_guest: bool = False
        ) -> str:
        """
        Creates a new user and returns their generated password.

        Parameters
        ----------
        first_name : str
            The user's first name.
        last_name : str
            The user's last name.
        email : str
            The user's email address.
        period_dollar_amount : float
            The subscription or period dollar amount for the user.
        is_guest : bool, optional
            Whether the user is a guest (default is False).

        Returns
        -------
        str
            The generated password for the user.
        """

        password = generate_password()
        password_hash = hash_password(password)

        friendly_name = first_name + " " + last_name[0].upper() + "."

        self.db.insert_data(
            table="Users",
            data={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "friendly_name": friendly_name,
                "password_hash": password_hash,
                "period_dollar_amount": period_dollar_amount,
                "terms_of_use_displayed": False,
                "is_guest": is_guest
            }
        )

        return password
    
    def check_login(
            self,
            email: str,
            password: str
        ) -> bool:
        """
        Verifies a user's login credentials.

        Parameters
        ----------
        email : str
            The user's email address.
        password : str
            The user's password.

        Returns
        -------
        bool
            True if credentials are valid, False otherwise.
        """

        data = self.db.get_data(
            table="Users",
            filter={"email": email}
        )

        if len(data) == 0:
            return False
        elif not verify_password(password, data[0]["password_hash"]):
            return False
        else:
            return True
        
    def get_user_chatbots(
            self,
            user_id: str
        ) -> dict[str, dict]:
        """
        Retrieves chatbots associated with a user.

        Parameters
        ----------
        user_id : str
            The user's unique identifier.

        Returns
        -------
        dict
            A dictionary of chatbot data keyed by chatbot IDs.
        """

        accesses = self.db.get_data(
            table="Access",
            filter={"user_id": user_id}
        )

        chatbots = self.db.get_data(
            table="Chatbots",
            filter={
                "$or": [
                    {"id": {"$in": [access["chatbot_id"] for access in accesses]}},
                    {"access": "public"}
                ]
            }
        )

        user_chatbots = {}
        for chatbot in chatbots:

            if chatbot["access"] != "public":
                chatbot["user_role"] = next(
                    d["role"] for d in accesses if d["chatbot_id"] == chatbot["id"]
                )
            else:
                chatbot["user_role"] = "User"
            
            user_chatbots[chatbot["id"]] = chatbot

        return user_chatbots

    def get_user(
            self,
            email: str
        ) -> dict[str, Any]:
        """
        Retrieves user details by email.

        Parameters
        ----------
        email : str
            The user's email address.

        Returns
        -------
        dict
            A dictionary containing user details and their chatbots.
        """

        data = self.db.get_data(
            table="Users",
            filter={"email": email}
        )

        user = data[0]
        user["chatbots"] = self.get_user_chatbots(email)

        return user

    def delete_user(
            self,
            user_id: str
        ) -> None:
        """
        Deletes a user and their associated data.

        Parameters
        ----------
        user_id : str
            The unique identifier of the user to be deleted.
        """

        self.db.delete_data(
            table="Users",
            filter={"email": user_id}
        )

        self.db.delete_data(
            table="Access",
            filter={"user_id": user_id}
        )

    def add_document(
            self,
            chatbot_id: str,
            created_by: str,
            filename: str,
            pdf_bytes: bytes,
            nb_pages: int
        )-> None:
        """
        Adds a document to a chatbot.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        created_by : str
            The user who created the document.
        filename : str
            The name of the document file.
        pdf_bytes : bytes
            The binary content of the PDF document.
        nb_pages : int
            The number of pages in the document.
        """

        uri, public_path = self.storage_manager.save_from_file(
            file=pdf_bytes,
            gcs_path=f"docu-talk/chatbots/{chatbot_id}/{str(uuid4())}.pdf"
        )

        self.db.insert_data(
            table="Documents",
            data={
                "chatbot_id": chatbot_id, 
                "created_by": created_by,
                "filename": filename,
                "public_path": public_path,
                "uri": uri,
                "nb_pages": nb_pages
            }
        )

    def remove_document(
            self,
            chatbot_id: str,
            filename: str
        ) -> None:
        """
        Removes a document from a chatbot.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        filename : str
            The name of the document file to be removed.
        """

        documents = self.db.get_data(
            table="Documents",
            filter={"chatbot_id": chatbot_id}
        )

        uri = next(d["uri"] for d in documents if d["filename"] == filename)

        self.storage_manager.delete_from_gcs(
            uri=uri
        )

        self.db.delete_data(
            table="Documents",
            filter={"chatbot_id": chatbot_id, "filename": filename}
        )
    
    def get_filenames(
            self,
            chatbot_id: str
        ) -> list[str]:
        """
        Retrieves filenames of documents associated with a chatbot.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.

        Returns
        -------
        list of str
            A list of filenames.
        """

        documents = self.db.get_data(
            table="Documents",
            filter={"chatbot_id": chatbot_id}
        )

        filenames = [document["filename"] for document in documents]

        return filenames

    def get_chatbot_service(
            self,
            chatbot_id: str,
            documents: list,
        ) -> ChatBotService:
        """
        Retrieves a chatbot service for a specific chatbot and its documents.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        documents : list
            A list of document data.

        Returns
        -------
        ChatBotService
            An instance of ChatBotService configured for the chatbot.
        """

        for document in documents:

            document["id"] = str(uuid4())

            uri, public_path = self.storage_manager.save_from_file(
                file=document["bytes"],
                gcs_path=f"docu-talk/chatbots/{chatbot_id}/{document['id']}.pdf"
            )

            document["uri"], document["public_path"] = uri, public_path 

        chatbot_service = ChatBotService(
            documents=documents,
            storage_manager=self.storage_manager
        )

        return chatbot_service
    
    def create_chatbot(
            self,
            chatbot_id: str,
            created_by: str,
            title: str,
            description: str,
            icon: bytes,
            access: str,
            documents: list,
            suggested_prompts: list
        ) -> None:
        """
        Creates a new chatbot.

        Parameters
        ----------
        chatbot_id : str
            The unique identifier for the chatbot.
        created_by : str
            The ID of the user creating the chatbot.
        title : str
            The title of the chatbot.
        description : str
            A description of the chatbot.
        icon : bytes
            The binary data for the chatbot's icon.
        access : str
            Access level of the chatbot ('public' or 'private').
        documents : list
            A list of documents associated with the chatbot.
        suggested_prompts : list
            A list of suggested prompts for the chatbot.
        """

        chatbot_id = self.db.insert_data(
            table="Chatbots",
            data={
                "id": chatbot_id,
                "created_by": created_by,
                "title": title,
                "description": description,
                "icon": icon,
                "access": access
            }
        )

        for prompt in suggested_prompts:

            self.db.insert_data(
                table="SuggestedPrompts",
                data={
                    "chatbot_id": chatbot_id,
                    "prompt": prompt.strip()
                }
            )

        for document in documents:

            self.db.insert_data(
                table="Documents",
                data={
                    "chatbot_id": chatbot_id, 
                    "created_by": created_by,
                    "filename": document['filename'],
                    "public_path": document["public_path"],
                    "uri": document["uri"],
                    "nb_pages": document["nb_pages"]
                }
            )

        self.share_chatbot(
            chatbot_id=chatbot_id,
            user_id=created_by,
            role="Admin"
        )
    
    def update_chatbot(
            self,
            chatbot_id: str,
            title: str | None = None,
            description: str | None = None,
            icon: bytes | None = None
        ) -> None:
        """
        Updates a chatbot's details.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        title : str, optional
            The new title for the chatbot.
        description : str, optional
            The new description for the chatbot.
        icon : bytes, optional
            The new icon for the chatbot.
        """
        
        updates = {}
        if title is not None:
            updates["title"] = title
        if description is not None:
            updates["description"] = description
        if icon is not None:
            updates["icon"] = icon

        self.db.update_data(
            table="Chatbots",
            filter={"id": chatbot_id},
            updates=updates
        )

    def delete_chatbot(
            self,
            chatbot_id: str
        ) -> None:
        """
        Deletes a chatbot and its associated data.

        Parameters
        ----------
        chatbot_id : str
            The unique identifier for the chatbot to be deleted.
        """

        self.db.delete_data(
            table="Chatbots",
            filter={"id": chatbot_id}
        )

        self.db.delete_data(
            table="Access",
            filter={"chatbot_id": chatbot_id}
        )

        self.db.delete_data(
            table="SuggestedPrompts",
            filter={"chatbot_id": chatbot_id}
        )

        self.storage_manager.delete_directory_from_gcs(
            directory_path=f"docu-talk/chatbots/{chatbot_id}"
        )

        self.db.delete_data(
            table="Documents",
            filter={"chatbot_id": chatbot_id}
        )

    def share_chatbot(
            self,
            chatbot_id: str,
            user_id: str,
            role: str
        ) -> None:
        """
        Shares a chatbot with a user by assigning a role.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        user_id : str
            The user's unique identifier.
        role : str
            The role to assign to the user (e.g., 'Admin', 'User').
        """

        self.db.insert_data(
            table="Access",
            data={
                "chatbot_id": chatbot_id,
                "user_id": user_id, 
                "role": role
            }
        )

    def remove_access_chatbot(
            self,
            chatbot_id: str,
            user_id: str
        ) -> None:
        """
        Removes a user's access to a chatbot.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.
        user_id : str
            The user's unique identifier.
        """

        self.db.delete_data(
            table="Access",
            filter={
                "chatbot_id": chatbot_id,
                "user_id": user_id
            }
        )
    
    def start_chat(
            self,
            chatbot_id: str
        ) -> ChatBot:
        """
        Starts a chat session with a chatbot.

        Parameters
        ----------
        chatbot_id : str
            The chatbot's unique identifier.

        Returns
        -------
        ChatBot
            An instance of ChatBot configured for the chat session.
        """

        data = self.db.get_data(
            table="Chatbots",
            filter={"id": chatbot_id}
        )

        desc = data[0]

        documents = self.db.get_data(
            table="Documents",
            filter={"chatbot_id": chatbot_id}
        )

        suggested_prompts = self.db.get_data(
            table="SuggestedPrompts",
            filter={"chatbot_id": chatbot_id}
        )

        service = ChatBotService(
            documents=documents,
            storage_manager=self.storage_manager
        )

        chatbot = ChatBot(
            title=desc["title"],
            description=desc["description"],
            icon=desc["icon"],
            access=desc["access"],
            suggested_prompts=suggested_prompts,
            service=service
        )

        return chatbot
    
    def get_consumed_price(
            self,
            user_id: str
        ) -> float:
        """
        Calculates the total usage cost for a user within the current week.

        Parameters
        ----------
        user_id : str
            The user's unique identifier.

        Returns
        -------
        float
            The total usage cost for the week.
        """

        today = datetime.now()
        start_of_week = (today - timedelta(days=today.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_of_week = start_of_week + timedelta(days=7)

        usages_data = self.db.get_data(
            table="Usages",
            filter={
                "user_id": user_id,
                "timestamp": {
                    "$gte": start_of_week,
                    "$lt": end_of_week
                }
            }
        )

        consumed_price = sum([usage["price"] for usage in usages_data])

        return consumed_price
    
    def store_usage(
            self,
            user_id: str,
            model_name: str,
            qty: int
        ) -> float:
        """
        Stores usage data for a user and calculates the associated cost.

        Parameters
        ----------
        user_id : str
            The user's unique identifier.
        model_name : str
            The name of the model used.
        qty : int
            The quantity of units consumed.

        Returns
        -------
        float
            The cost of the usage.
        """

        price_per_unit = next(
            m["price_per_unit"] for m in self.models if m["name"] == model_name
        )
        price = qty * price_per_unit

        self.db.insert_data(
            table="Usages",
            data={
                "user_id": user_id,
                "model": model_name,
                "unit": "characters",
                "qty": qty,
                "price": price
            }
        )

        return price