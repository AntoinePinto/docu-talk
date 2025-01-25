import json
import logging
import os

from typing import Generator, Tuple

from docu_talk.agents.chatbot.generator import Gemini
from docu_talk.agents.chatbot.icons import get_icon_bytes
from docu_talk.agents.storage import GoogleCloudStorageManager
from docu_talk.exceptions import BadOutputFormatError

from utils.file_io import recursive_read

from utils.parsing import (
    extract_list_of_dicts,
    extract_list,
    extract_dict
)

from .validation import (
    Source,
    Icon,
    Desc,
    SuggestedPrompts
)

logger = logging.getLogger(__name__)

path = os.path.join(os.path.dirname(__file__), "src", "icons.json")
with open(path) as f:
    ICONS = json.load(f)

PROMPTS = recursive_read(
    os.path.join(os.path.dirname(__file__), "src", "prompts"),
    extensions=(".txt")
)

class ChatBotService:
    """
    A service class for managing chatbot interactions, including generating titles,
    icons, suggested prompts, and handling user queries.
    """

    def __init__(
            self,
            documents: list,
            storage_manager: GoogleCloudStorageManager
        ) -> None:
        """
        Initializes the ChatBotService with documents and a storage manager.

        Parameters
        ----------
        documents : list
            A list of documents to associate with the chatbot.
        storage_manager : GoogleCloudStorageManager
            The storage manager for handling file storage operations.
        """

        self.documents = documents

        self.gemini = Gemini(
            project_id=os.getenv("GCP_PROJECT_ID"),
            location=os.getenv("GCP_LOCATION")
        )

        self.storage_manager = storage_manager

        self.messages = []

    def get_documents_contents(
            self,
            document_ids: list | None = None
        ) -> list[dict]:
        """
        Retrieves the contents of the associated documents.

        Parameters
        ----------
        document_ids : list or None, optional
            A list of document IDs to filter the content (default is None).

        Returns
        -------
        list of dict
            A list of document contents in structured format.
        """

        if document_ids is None:
            document_ids = [document["id"] for document in self.documents]

        parts = []
        for document in self.documents:

            if document["id"] not in document_ids:
                continue

            parts.append(f"{document['filename']}: ")
            parts.append(document["uri"])

        documents_contents = [{"role": "user", "parts": parts}]

        return documents_contents

    def reset_conversation(self) -> None:
        """
        Resets the conversation history of the chatbot.
        """

        self.messages = []

    def return_streamed_response(
            self,
            stream: Generator
        ) -> Generator:
        """
        Handles streaming responses from the generative model.

        Parameters
        ----------
        stream : Generator
            A generator yielding parts of the response.

        Yields
        ------
        str or dict
            Streamed content parts and usage data.
        """

        answer = ""
        for part in stream:

            if isinstance(part, str):
                answer += part
                yield part
            else:
                self.last_usages = part

        self.messages.append(
            {
                "role": "assistant",
                "content": answer
            }
        )

    def generate_title_description(
            self,
            model: str = "gemini-1.5-flash-002",
        ) -> Tuple[str, str]:
        """
        Generates a title and description for the chatbot based on its documents.

        Parameters
        ----------
        model : str, optional
            The model to use for generation (default is "gemini-1.5-flash-002").

        Returns
        -------
        tuple of str
            The generated title and description.
        """

        messages = self.get_documents_contents()
        messages.append({"role": "user", "parts": [PROMPTS["title_description"]]})

        response = self.gemini.get_answer(
            messages=messages,
            stream=False,
            model=model,
            temperature=0
        )

        self.last_usages = response["usages"]

        try:
            desc = extract_dict(response["answer"])
            Desc(**desc)
        except Exception as e:
            raise BadOutputFormatError("Bad LLM output format") from e

        return desc["title"], desc["description"]

    def generate_icon(
            self,
            description: str,
            model: str = "gemini-1.5-flash-002",
        ) -> bytes:
        """
        Generates an icon for the chatbot based on its description.

        Parameters
        ----------
        description : str
            The chatbot's description.
        model : str, optional
            The model to use for icon generation (default is "gemini-1.5-flash-002").

        Returns
        -------
        bytes
            The generated icon in binary format.
        """

        prompt = PROMPTS["icon"].format(
            icons=list(ICONS.keys()),
            chatbot_description=description
        )

        response = self.gemini.get_answer(
            messages=[{"role": "user", "parts": [prompt]}],
            stream=False,
            model=model,
            temperature=0
        )

        self.last_usages = response["usages"]

        try:
            icon = extract_dict(response["answer"])
            Icon(**icon)
            icon_id = ICONS.get(icon["name"], "f06c")
        except Exception:
            icon_id = "f06c"

        icon_bytes = get_icon_bytes(
            icon_id=icon_id,
            color=icon["color"]
        )

        return icon_bytes

    def get_suggested_prompts(
            self,
            model: str = "gemini-1.5-flash-002",
        ) -> list:
        """
        Retrieves a list of suggested prompts for the chatbot.

        Parameters
        ----------
        model : str, optional
            The model to use for generating suggested prompts.

        Returns
        -------
        list
            A list of suggested prompts.
        """

        messages = self.get_documents_contents()
        messages.append({"role": "user", "parts": [PROMPTS["suggested_prompts"]]})

        response = self.gemini.get_answer(
            messages=messages,
            stream=False,
            model=model,
            temperature=0
        )

        self.last_usages = response["usages"]

        try:
            suggested_prompts = extract_list(response["answer"])
            SuggestedPrompts(items=suggested_prompts)
        except Exception as e:
            raise BadOutputFormatError("Bad LLM output format") from e

        return suggested_prompts

    def ask(
            self,
            message: str,
            model: str = "gemini-1.5-flash-002",
            document_ids: list | None = None
        ):
        """
        Sends a user query to the chatbot and retrieves a response.

        Parameters
        ----------
        message : str
            The user's query.
        model : str, optional
            The model to use for the query (default is "gemini-1.5-flash-002").
        document_ids : list or None, optional
            A list of document IDs to include in the context (default is None).

        Returns
        -------
        Generator
            A generator yielding parts of the response.
        """

        self.messages.append(
            {
                "role": "user",
                "content": message
            }
        )

        messages = self.get_documents_contents(document_ids=document_ids)
        messages.extend(
            [{"role": m["role"], "parts": [m["content"]]} for m in self.messages]
        )

        response = self.gemini.get_answer(
            messages=messages,
            stream=True,
            model=model,
            context=PROMPTS["context_ask"]
        )

        return self.return_streamed_response(response)

    def get_last_message_sources(
            self,
            model: str = "gemini-1.5-flash-002",
            document_ids: list | None = None
        ) -> list[dict]:
        """
        Retrieves the sources for the last message in the conversation.

        Parameters
        ----------
        model : str, optional
            The model to use for source identification.
        document_ids : list or None, optional
            A list of document IDs to include in the context (default is None).

        Returns
        -------
        list of dict
            A list of source dictionaries containing file metadata and signed URLs.
        """

        messages = self.get_documents_contents(document_ids=document_ids)
        messages.extend(
            [{"role": m["role"], "parts": [m["content"]]} for m in self.messages]
        )
        messages.append({"role": "user", "parts": [PROMPTS["source_identification"]]})

        response = self.gemini.get_answer(
            messages=messages,
            stream=False,
            model=model,
            temperature=0
        )

        self.last_usages = response["usages"]

        try:
            extracted_sources = extract_list_of_dicts(response["answer"])
        except Exception as e:
            raise BadOutputFormatError("Bad LLM output format") from e

        filenames = [document["filename"] for document in self.documents]
        sources = []
        for extracted_source in extracted_sources:

            try:
                Source(**extracted_source)
            except Exception as e:
                logger.warning(
                    f"Failed to process extracted source: {extracted_source}. "
                    f"Error: {e}"
                )
                continue

            if extracted_source["filename"] not in filenames:
                continue

            uri = next(
                document["uri"]
                for document in self.documents
                if document["filename"] == extracted_source["filename"]
            )
            signed_url = self.storage_manager.generate_signed_url(uri)
            extracted_source["url"] = f"{signed_url}#page={extracted_source['page']}"

            sources.append(extracted_source)

        return sources
