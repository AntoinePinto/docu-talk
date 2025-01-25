from datetime import datetime
from uuid import uuid4

import streamlit as st

from config import (
    LOGO_PATH,
    TEXTS,
    MAX_NB_DOC_PER_CHATBOT,
    MAX_NB_PAGES_PER_CHATBOT,
    PREMIUM_MODEL_NAME
)

from docu_talk.exceptions import BadOutputFormat
from st_docu_talk import StreamlitDocuTalk
from utils.file_io import get_nb_pages_pdf

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="centered",
    back_page_path="src/frontend/pages/home.py",
    back_page_name="Home"
)

st.markdown(TEXTS["create_chatbot_header"])

with st.container(border=True):
    documents_files = app.form_documents()
    
create_chatbot = st.button(
    label="Create",
    type="primary",
    icon=":material/add:",
    disabled=(len(documents_files) == 0)
)

open_chat = False
if create_chatbot:

    model = PREMIUM_MODEL_NAME

    with st.spinner("..."):
        
        nb_documents = len(documents_files)
        if nb_documents > MAX_NB_DOC_PER_CHATBOT:
            st.error(
                "The total number of documents should be less than "
                f"{MAX_NB_DOC_PER_CHATBOT}."
            )
            st.stop()

        total_pages = 0
        documents = []
        for document in documents_files: #type: ignore

            document_bytes = document.getvalue()

            documents.append(
                {
                    "filename": document.name,
                    "bytes": document_bytes,
                    "nb_pages": get_nb_pages_pdf(document_bytes)
                }
            )

            total_pages += document["nb_pages"]
        
        if total_pages > MAX_NB_PAGES_PER_CHATBOT:
            st.error(
                "The total number of pages in the documents must be less than "
                f"{MAX_NB_PAGES_PER_CHATBOT}."
            )
            st.stop()

        estimated_duration = app.docu_talk.predictor.predict(
            metric="create_chatbot_duration",
            data={
                "nb_documents": nb_documents,
                "total_pages": total_pages,
                "model": model,
                "timestamp": datetime.now()
            }
        )

    start_time = datetime.now()

    status_placeholder = st.status(
        label=(
            "Chatbot Deployment | Estimated duration: "
            f"{estimated_duration:.0f} seconds"
        ),
        expanded=True
    )

    with status_placeholder:

        chatbot_id = str(uuid4())

        new_message = st.chat_message("assistant", avatar=LOGO_PATH)
        new_message.markdown("I'm looking at your documents...")

        chatbot = app.docu_talk.get_chatbot_service(
            chatbot_id=chatbot_id,
            documents=documents
        )
        
        new_message = st.chat_message("assistant", avatar=LOGO_PATH)
        try:
            title, description = chatbot.generate_title_description(
                model=model
            )
            new_message.markdown(
                f"Your chatbot can be named like this: **{title}**"
            )
            new_message.markdown(
                f"And I'll give him this description: **{description}**"
            )
        except BadOutputFormat:

            title, description = "<TITLE>", "<DESCRIPTION>"
            message = TEXTS["failed_title_description"].format(
                title=title,
                description=description
            )
            
            new_message.markdown(message)

        app.store_usage(
            model_name=chatbot.last_usages["model"],
            qty=chatbot.last_usages["qty"]
        )

        icon = chatbot.generate_icon(
            description=description,
            model=model
        )

        new_message = st.chat_message("assistant", avatar=LOGO_PATH)
        new_message.markdown("To illustrate the chatbot, I suggest the following icon:")
        new_message.image(icon, width=80)

        app.store_usage(
            model_name=chatbot.last_usages["model"],
            qty=chatbot.last_usages["qty"]
        )
        
        new_message = st.chat_message("assistant", avatar=LOGO_PATH)
        try:
            
            suggested_prompts = chatbot.get_suggested_prompts(
                model=model
            )
            
            md_suggested_prompts = "\n".join(
                [f"* *{prompt}*" for prompt in suggested_prompts]
            )
            
            new_message.markdown(
                "Finally, I suggest the following examples of prompts:\n\n"
                f"{md_suggested_prompts}"
            )
            
        except BadOutputFormat:
            suggested_prompts = []
            new_message.markdown(
                "Hmm... I failed to define example prompts for your chatbot. "
                "I'll leave this blank for now."
            )

        app.store_usage(
            model_name=chatbot.last_usages["model"],
            qty=chatbot.last_usages["qty"]
        )

        app.docu_talk.create_chatbot(
            chatbot_id=chatbot_id,
            created_by=app.auth.user["email"],
            title=title,
            description=description,
            icon=icon,
            access="private",
            documents=chatbot.documents,
            suggested_prompts=suggested_prompts
        )

        end_time = datetime.now()

        app.docu_talk.predictor.log_create_chatbot_metric(
            duration=(end_time - start_time).total_seconds(),
            nb_documents=nb_documents,
            total_pages=total_pages,
            model=model,
            chatbot_id=chatbot_id
        )

        app.auth.user["chatbots"] = app.docu_talk.get_user_chatbots(
            user_id=app.auth.user["email"]
        )
        app.chatbot_id = chatbot_id

        new_message = st.chat_message("assistant", avatar=LOGO_PATH)
        new_message.markdown(
            """
            **Your Chatbot is ready!**
            
            You can access it from the welcome page.
            """
        )