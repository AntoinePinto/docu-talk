import streamlit as st

from auth.auth import Auth
from docu_talk.docu_talk import DocuTalk
from mailing.mailing_bot import MailingBot
from sidebar import Sidebar
from st_utils.decorators import st_progress, st_confirmation_dialog

from config import (
    LOGO_PATH,
    ENCODED_LOGO,
    TEXTS,
    CREDIT_EXCHANGE_RATE,
    MAX_NB_DOC_PER_CHATBOT,
    MAX_NB_PAGES_PER_CHATBOT
)

class StreamlitDocuTalk:
    """
    A class for managing the Streamlit frontend of the DocuTalk application.
    """

    chatbot_id: str | None
    chatbots: dict

    def __init__(self) -> None:
        """
        Initializes the StreamlitDocuTalk instance with authentication, mailing, 
        and sidebar services.
        """
        
        self.docu_talk = DocuTalk()
        
        self.mailing_bot = MailingBot(
            encoded_logo=ENCODED_LOGO
        )

        self.auth = Auth(
            docu_talk=self.docu_talk,
            mailing_bot=self.mailing_bot
        )

        self.sidebar = Sidebar(
            auth=self.auth,
            docu_talk=self.docu_talk
        )

        self.chatbot_id: str | None = None
        self.chatbots = {}

    def set_page_config(
            self,
            layout: str,
            display_sidebar: bool = True,
            back_page_path: str | None = None,
            back_page_name: str | None = None
        ) -> None:
        """
        Configures the page settings for the Streamlit app.

        Parameters
        ----------
        layout : str
            Layout type for the Streamlit app.
        display_sidebar : bool, optional
            Whether to display the sidebar (default is True).
        back_page_path : str or None, optional
            Path to the back page button (default is None).
        back_page_name : str or None, optional
            Name for the back page button (default is None).
        """

        st.set_page_config(
            page_title="Docu Talk",
            page_icon=LOGO_PATH,
            layout=layout,
            initial_sidebar_state="auto"
        )

        if display_sidebar:
            if not self.auth.user["terms_of_use_displayed"]:
                self.sidebar.display_terms_of_use()
                
            self.sidebar.display_sidebar()

        if back_page_path is not None:

            return_back_page = st.button(
                label=back_page_name,
                icon=":material/arrow_back:"
            )

            if return_back_page:
                st.switch_page(back_page_path)

    def store_usage(
            self,
            model_name: str,
            qty: int
        ) -> None:
        """
        Records usage and updates user credits.

        Parameters
        ----------
        model_name : str
            Name of the model used.
        qty : int
            Quantity of usage.
        """

        price = self.docu_talk.store_usage(
            user_id=self.auth.user["email"],
            model_name=model_name,
            qty=qty
        )

        credits = price * CREDIT_EXCHANGE_RATE

        st.toast(f"{credits:.1f} Credits", icon="💰")
        self.sidebar.update_credit_placeholder()

    @st_confirmation_dialog(
        title="Are you sure to delete your account?",
        content=(
            "By deleting your account, you will no longer have access "
            "to any of your Chat Bots."
        ),
        button_label="Delete my account"
    )
    def delete_user(self) -> None:
        """
        Deletes the current user's account and logs them out.
        """

        self.docu_talk.delete_user(self.auth.user["email"])
        self.auth.logout()
    
    @st_progress()
    def update_suggested_prompt(
            self,
            chatbot_id: str,
            prompt_id: str,
            new_prompt: str
        ) -> None:
        """
        Updates a suggested prompt for a specific chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot.
        prompt_id : str
            ID of the prompt to update.
        new_prompt : str
            The new prompt text.
        """

        self.docu_talk.db.update_data(
            table="SuggestedPrompts",
            filter={"chatbot_id": chatbot_id, "id": prompt_id},
            updates={"prompt": new_prompt}
        )

        if chatbot_id in self.chatbots:
            del self.chatbots[chatbot_id]

    @st_progress()
    def update_chatbot(
            self,
            chatbot_id: str,
            title: str | None = None,
            description: str | None = None,
            icon: bytes | None = None
        ) -> None:
        """
        Updates chatbot details such as title, description, or icon.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot to update.
        title : str or None, optional
            New title for the chatbot (default is None).
        description : str or None, optional
            New description for the chatbot (default is None).
        icon : bytes or None, optional
            New icon for the chatbot (default is None).
        """

        self.docu_talk.update_chatbot(
            chatbot_id=chatbot_id,
            title=title,
            description=description,
            icon=icon
        )

        self.auth.user["chatbots"] = self.docu_talk.get_user_chatbots(
            user_id=self.auth.user["email"]
        )

        if chatbot_id in self.chatbots:
            del self.chatbots[chatbot_id]

    @st_confirmation_dialog(
        title="Are you sure you want to delete this Chat Bot?",
        content="By deleting this Chat Bot, nobody will be able to access it.",
        button_label="Delete Chat Bot"
    )
    def delete_chatbot(
            self,
            chatbot_id: str
        ) -> None:
        """
        Deletes a specified chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot to delete.
        """

        self.docu_talk.delete_chatbot(
            chatbot_id=chatbot_id
        )

        self.auth.user["chatbots"] = self.docu_talk.get_user_chatbots(
            user_id=self.auth.user["email"]
        )

        if chatbot_id in self.chatbots:
            del self.chatbots[chatbot_id]

        st.switch_page("src/frontend/pages/home.py")

    @st_progress()
    def share_chatbot(
            self,
            chatbot_id: str,
            user_email: str,
            role: str,
            chatbot_name: str
        ) -> None:
        """
        Shares a chatbot with another user.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot to share.
        user_email : str
            Email of the user to share with.
        role : str
            Role to assign to the user (e.g., "Admin").
        chatbot_name : str
            Name of the chatbot.
        """
        
        self.docu_talk.share_chatbot(
            chatbot_id=chatbot_id,
            user_id=user_email,
            role=role
        )

        self.mailing_bot.send_chatbot_shared_email(
            recipient=user_email,
            sharing_name=self.auth.user["email"],
            chatbot_name=chatbot_name
        )

    @st_progress()
    def remove_access_chatbot(
            self,
            chatbot_id: str,
            user_email: str,
        ) -> None:
        """
        Removes a user's access to a chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot.
        user_email : str
            Email of the user whose access will be removed.
        """
        
        self.docu_talk.remove_access_chatbot(
            chatbot_id=chatbot_id,
            user_id=user_email
        )

    @st_progress()
    def request_public_sharing(
            self,
            chatbot_id
        ) -> None:
        """
        Requests public sharing for a chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot to request sharing for.
        """

        self.docu_talk.db.update_data(
            table="Chatbots",
            filter={"id": chatbot_id},
            updates={"access": "pending_public_request"}
        )

        if chatbot_id in self.chatbots:
            del self.chatbots[chatbot_id]

    @st_progress()
    def add_documents(
            self,
            chatbot_id: str,
            documents: list
        ) -> None:
        """
        Adds documents to a chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot.
        documents : list
            List of documents to add.
        """

        for document in documents:

            self.docu_talk.add_document(
                chatbot_id=chatbot_id,
                created_by=self.auth.user["email"],
                filename=document["filename"],
                pdf_bytes=document["bytes"],
                nb_pages=document["nb_pages"]
            )

        if chatbot_id in self.chatbots:
            self.chatbots[chatbot_id] = self.docu_talk.start_chat(chatbot_id)

    @st_progress()
    def delete_documents(
            self,
            chatbot_id: str,
            filenames: list
        ) -> None:
        """
        Deletes documents from a chatbot.

        Parameters
        ----------
        chatbot_id : str
            ID of the chatbot.
        filenames : list
            List of filenames to delete.
        """

        for filename in filenames:
            self.docu_talk.remove_document(
                chatbot_id=chatbot_id,
                filename=filename
            )

        if chatbot_id in self.chatbots:
            del self.chatbots[chatbot_id]

    def form_documents(self):
        """
        Displays a form for uploading chatbot documents.

        Returns
        -------
        list
            A list of uploaded files.
        """

        st.markdown(TEXTS["form_chatbot_documents"])

        documents_files = st.file_uploader(
            label="Documents",
            accept_multiple_files=True,
            type=["pdf"],
            label_visibility="collapsed"
        )

        markdown = TEXTS["form_chatbot_documents_limit"].format(
            max_nb_doc=MAX_NB_DOC_PER_CHATBOT,
            max_nb_pages=MAX_NB_PAGES_PER_CHATBOT
        )

        st.markdown(markdown)
        st.markdown(TEXTS["form_chatbot_documents_note"])

        return documents_files

    def form_chatbot_title(
            self,
            disabled: bool = False,
            default_value: str = ""
        ) -> str:
        """
        Displays a form input for the chatbot title.

        Parameters
        ----------
        disabled : bool, optional
            Whether the input should be disabled (default is False).
        default_value : str, optional
            The default value for the input (default is "").

        Returns
        -------
        str
            The entered chatbot title.
        """

        st.markdown(TEXTS["form_chatbot_title"])

        title = st.text_input(
            label="Title of your Chat Bot",
            label_visibility="collapsed",
            value=default_value,
            disabled=disabled
        )

        return title
    
    def form_chatbot_description(
            self,
            disabled: bool = False,
            default_value: str = ""
        ) -> str:
        """
        Displays a form input for the chatbot description.

        Parameters
        ----------
        disabled : bool, optional
            Whether the input should be disabled (default is False).
        default_value : str, optional
            The default value for the input (default is "").

        Returns
        -------
        str
            The entered chatbot description.
        """

        st.markdown(TEXTS["form_chatbot_description"])

        description = st.text_area(
            label="Description of your Chat Bot",
            max_chars=100,
            value=default_value,
            label_visibility="collapsed",
            disabled=disabled
        )

        return description