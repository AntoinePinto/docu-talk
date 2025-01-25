import streamlit as st
from config import (
    MAX_ICON_FILE_SIZE,
    MAX_NB_DOC_PER_CHATBOT,
    MAX_NB_PAGES_PER_CHATBOT,
    TEXTS,
)
from docu_talk.base import ChatBot
from st_docu_talk import StreamlitDocuTalk
from utils.file_io import get_nb_pages_pdf

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="centered",
    back_page_path="src/frontend/pages/chatbot.py",
    back_page_name="Chat Bot"
)

if "chatbot_id" not in st.query_params:
    # Temporary assignment due to Streamlit issue #8112
    # To be removed in a future version of Streamlit
    st.query_params["chatbot_id"] = app.chatbot_id

chatbot_id = st.query_params.chatbot_id

if chatbot_id not in app.chatbots:

    if chatbot_id not in app.auth.user["chatbots"]:
        st.error("You do not have access to this Chat Bot or it does not exist.")
        st.stop()

    app.chatbots[chatbot_id] = app.docu_talk.start_chat(chatbot_id)

if app.auth.user["chatbots"][chatbot_id]["user_role"] != "Admin":
    st.error("You are not Admin of this Chat Bot")
    st.stop()

chatbot : ChatBot = app.chatbots[chatbot_id]

st.markdown(f"# {chatbot.title} - Settings")

tabs = ["Main Settings", "Manage Documents", "Manage Access"]
tab_main_settings, tab_documents, tab_access = st.tabs(tabs)

with tab_main_settings:

    with st.container(border=True):

        title = app.form_chatbot_title(
            default_value=chatbot.title
        )

        st.button(
            label="Update",
            icon=":material/save:",
            disabled=title == chatbot.title,
            type="primary",
            key="update_title",
            on_click=app.update_chatbot,
            kwargs={
                "chatbot_id": chatbot_id,
                "title": title
            }
        )

    with st.container(border=True):

        description = app.form_chatbot_description(
            default_value=chatbot.description
        )

        st.button(
            label="Update",
            icon=":material/save:",
            disabled=description == chatbot.description,
            type="primary",
            key="update_description",
            on_click=app.update_chatbot,
            kwargs={
                "chatbot_id": chatbot_id,
                "description": description,
            }
        )

    with st.container(border=True):

        st.markdown(TEXTS["form_chatbot_icon"])

        icon_file = st.file_uploader(
            label="Icon",
            type=["png"],
            label_visibility="collapsed"
        )

        if icon_file is None:
            icon = chatbot.icon
            st.image(icon, width=80)
        elif icon_file.size > MAX_ICON_FILE_SIZE * 1000:
            st.error(f"File size must be less than {MAX_ICON_FILE_SIZE} Kb")
            icon_file = icon = None
        else:
            icon = icon_file.getvalue()
            st.image(icon, width=80)

        st.button(
            label="Update",
            icon=":material/save:",
            disabled=icon_file is None,
            type="primary",
            key="update_icon",
            on_click=app.update_chatbot,
            kwargs={
                "chatbot_id": chatbot_id,
                "icon": icon
            }
        )

    if len(chatbot.suggested_prompts) > 0:

        with st.container(border=True):

            st.markdown(
                """
                **Suggested prompts**

                Here are the suggested prompts of the chatbot. You can edit them if
                needed.
                """
            )

            for i, prompt in enumerate(chatbot.suggested_prompts):

                col0, col1 = st.columns([3, 1])

                new_prompt = col0.text_input(
                    label="Prompt",
                    value=prompt["prompt"],
                    label_visibility="collapsed",
                    key=f"suggested_prompt_{i}"
                )

                col1.button(
                    label="Update",
                    icon=":material/save:",
                    disabled=new_prompt == prompt["prompt"],
                    type="primary",
                    key=f"update_suggested_prompt_{i}",
                    on_click=app.update_suggested_prompt,
                    kwargs={
                        "chatbot_id": chatbot_id,
                        "prompt_id": prompt["id"],
                        "new_prompt": new_prompt
                    }
                )

    delete_chatbot = st.button(
        label="Delete Chat Bot",
        type="primary",
        icon=":material/delete:"
    )

    if delete_chatbot:
        app.delete_chatbot(chatbot_id)

with tab_documents:

    with st.container(border=True):

        documents_files = app.form_documents()

        add_documents = st.button(
            label="Add document(s)",
            disabled=len(documents_files)==0,
            type="primary",
        )

        if add_documents:

            documents = []
            for document in documents_files: # type: ignore
                documents.append(
                    {
                        "filename": document.name,
                        "bytes": document.getvalue()
                    }
                )

            total_nb_documents = len(documents_files) + len(chatbot.service.documents)
            if total_nb_documents > MAX_NB_DOC_PER_CHATBOT:
                st.error(
                    "The total number of documents should be less "
                    f"than {MAX_NB_DOC_PER_CHATBOT}."
                )
            else:

                total_pages = sum(
                    [document["nb_pages"] for document in chatbot.service.documents]
                )
                for document in documents:
                    document["nb_pages"] = get_nb_pages_pdf(document["bytes"])
                    total_pages += document["nb_pages"]

                if total_pages > MAX_NB_PAGES_PER_CHATBOT:
                    st.error(
                        "The total number of pages in the documents must be less "
                        f"than {MAX_NB_PAGES_PER_CHATBOT}."
                    )
                else:
                    app.add_documents(
                        chatbot_id=chatbot_id,
                        documents=documents
                    )

    with st.container(border=True):

        st.markdown("**Delete existing document(s)**")

        options_filenames = app.docu_talk.get_filenames(chatbot_id)

        filenames = st.multiselect(
            label="Documents",
            options=options_filenames,
        )

        st.button(
            label="Delete document(s)",
            disabled=len(filenames)==0,
            type="primary",
            on_click=app.delete_documents,
            kwargs={
                "chatbot_id": chatbot_id,
                "filenames": filenames
            }
        )

with tab_access:

    if app.auth.user["is_guest"] is True:
        st.warning(
            "As a guest, you do not have access to the "
            "Access Management functionalities."
        )
    elif chatbot.access == "public":
        st.info("This Chat Bot is public and shared with all users of the application.")
    else:

        with st.container(border=True):

            st.markdown("**Share Chat Bot**")

            col0, col1 = st.columns([2, 1])

            user_email = col0.text_input(
                label="User Email"
            )

            role = col1.selectbox(
                label="Role",
                options=["User", "Admin"],
                help=(
                    "As well as being able to chat with the Chat Bot, "
                    "Admins can manage the Chat Bot's settings."
                )
            )

            st.button(
                label="Share",
                disabled=user_email == "",
                type="primary",
                on_click=app.share_chatbot,
                kwargs={
                    "chatbot_id": chatbot_id,
                    "user_email": user_email,
                    "role": role,
                    "chatbot_name": chatbot.title
                }
            )

        with st.container(border=True):

            st.markdown("**Remove access to Chat Bot**")

            chatbot_users = app.docu_talk.get_chatbot_users(chatbot_id)
            chatbot_users.remove(app.auth.user["email"])

            user_email = st.selectbox(
                label="Email",
                options=chatbot_users,
            )

            st.button(
                label="Remove Access",
                disabled=user_email is None, # type: ignore
                type="primary",
                on_click=app.remove_access_chatbot,
                kwargs={
                    "chatbot_id": chatbot_id,
                    "user_email": user_email
                }
            )

        with st.container(border=True):

            st.markdown(TEXTS["request_public_access"])

            if chatbot.access == "pending_public_request":
                st.info("Your already requested for public sharing")
            elif chatbot.access == "private":

                st.button(
                    label="Request for public sharing",
                    type="primary",
                    on_click=app.request_public_sharing,
                    kwargs={"chatbot_id": chatbot_id}
                )
