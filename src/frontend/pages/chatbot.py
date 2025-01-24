import random

from datetime import datetime

import streamlit as st

from config import (
    TEXTS,
    BASIC_MODEL_NAME,
    PREMIUM_MODEL_NAME
)
from docu_talk.base import ChatBot
from docu_talk.exceptions import BadOutputFormat
from st_docu_talk import StreamlitDocuTalk

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="centered",
    back_page_path="src/frontend/pages/home.py",
    back_page_name="Home"
)

if "chatbot_id" not in st.query_params:
    st.query_params["chatbot_id"] = app.chatbot_id # to remove in a future version a Streamlit (see https://github.com/streamlit/streamlit/issues/8112)

chatbot_id = st.query_params.chatbot_id

if chatbot_id not in app.chatbots:

    if chatbot_id not in app.auth.user["chatbots"]:
        st.error("You do not have access to this Chat Bot or it does not exist.")
        st.stop()

    app.chatbots[chatbot_id] = app.docu_talk.start_chat(chatbot_id)

chatbot : ChatBot = app.chatbots[chatbot_id]

best_model = st.toggle(
    label="Use Premium AI Model",
    value=False,
    help="Premium model is better but slower and more expensive"
)

if best_model:
    model = PREMIUM_MODEL_NAME
else:
    model = BASIC_MODEL_NAME

new_message = st.chat_message("assistant", avatar=chatbot.icon)
new_message.markdown(f"Hello {app.auth.user['first_name']}👋 I am the Chat Bot **{chatbot.title}**!")

col0, col1, _ = new_message.columns([4, 2, 3])

popover = col0.popover(
    label=f"**{len(chatbot.service.documents)}** linked documents", 
    icon=":material/picture_as_pdf:",
    use_container_width=True
)

with popover:

    selected_document_ids = []
    total_pages = 0
    for document in chatbot.service.documents:

        signed_url = app.docu_talk.storage_manager.generate_signed_url(document["uri"])

        subcol0, subcol1 = st.columns([1, 5], vertical_alignment="center")
        
        selected = subcol0.checkbox(
            label="check",
            label_visibility="collapsed",
            value=True,
            key=f"document_{document['id']}_check"
        )

        subcol1.markdown(f"[{document['filename']}]({signed_url})")

        if selected:
            selected_document_ids.append(document["id"])
            total_pages += document["nb_pages"]

open_chatbot_settings = col1.button(
    label="Settings", 
    icon=":material/settings:",
    disabled=app.auth.user["chatbots"][chatbot_id]["user_role"] != "Admin",
    use_container_width=True,
    key="private_settings"
)

if open_chatbot_settings:
    st.switch_page("src/frontend/pages/chatbot-settings.py")

if len(chatbot.suggested_prompts) > 2:
    random_prompts = random.sample(chatbot.suggested_prompts, 3)
    suggested_prompt_list = "\n".join([f"*  *{prompt['prompt']}*" for prompt in random_prompts])
    markdown = TEXTS["suggested_prompts"].format(suggested_prompt_list=suggested_prompt_list)
    new_message.markdown(markdown)

for msg in chatbot.service.messages:
    avatar = chatbot.icon if (msg["role"] == "assistant") else "👤"
    new_message = st.chat_message(msg["role"], avatar=avatar)
    new_message.markdown(msg["content"])

if message := st.chat_input("Your message"):

    new_message = st.chat_message("user", avatar="👤")
    new_message.markdown(message)

    new_message = st.chat_message("assistant", avatar=chatbot.icon)
    with new_message:

        estimated_duration = app.docu_talk.predictor.predict(
            metric="ask_chatbot_duration",
            data={
                "nb_documents": len(selected_document_ids),
                "total_pages": total_pages,
                "model": model,
                "timestamp": datetime.now()
            }
        )

        message_placeholder = st.empty()

        with st.spinner(f"Estimated duration: {estimated_duration:.0f} seconds..."):

            start_time = datetime.now()
            
            answer = chatbot.service.ask(
                message=message, 
                model=model,
                document_ids=selected_document_ids
            )
            
            message_placeholder.write_stream(answer)

            app.store_usage(
                model_name=chatbot.service.last_usages["model"],
                qty=chatbot.service.last_usages["qty"] * 4
            )

            end_time = datetime.now()

            app.docu_talk.predictor.log_ask_chatbot_metrics(
                duration=(end_time - start_time).total_seconds(),
                token_count=chatbot.service.last_usages["qty"],
                nb_documents=len(selected_document_ids),
                total_pages=total_pages,
                model=model,
                chatbot_id=chatbot_id
            )

if len(chatbot.service.messages) > 0:

    with new_message:

        if st.button(label="✨ Try source identification ✨"):

            estimated_duration = app.docu_talk.predictor.predict(
                metric="ask_chatbot_duration",
                data={
                    "nb_documents": len(selected_document_ids),
                    "total_pages": total_pages,
                    "model": model,
                    "timestamp": datetime.now()
                }
            )
            
            message_placeholder = st.empty()

            with st.spinner(f"Estimated duration: {estimated_duration:.0f} seconds..."):
                
                try:

                    start_time = datetime.now()

                    sources = chatbot.service.get_last_message_sources(
                        model=model,
                        document_ids=selected_document_ids
                    )

                    if sources == []:
                        st.warning("Unable to identify sources")
                    else:
                        parts = []
                        for source in sources:
                            parts.append(TEXTS["source_citation"].format(**source))
                        message_placeholder.markdown("\n\n".join(parts))

                    end_time = datetime.now()

                    app.docu_talk.predictor.log_ask_chatbot_metrics(
                        duration=(end_time - start_time).total_seconds(),
                        token_count=chatbot.service.last_usages["qty"],
                        nb_documents=len(selected_document_ids),
                        total_pages=total_pages,
                        model=model,
                        chatbot_id=chatbot_id
                    )

                except BadOutputFormat:
                    st.markdown("Sorry, an internal error has occurred.")

                finally:
                    app.store_usage(
                        model_name=chatbot.service.last_usages["model"],
                        qty=chatbot.service.last_usages["qty"] * 4
                    )

    st.button(
        label="🔄 Reset conversation",
        on_click=chatbot.service.reset_conversation
    )