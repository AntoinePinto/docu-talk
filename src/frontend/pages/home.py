import streamlit as st

from st_docu_talk import StreamlitDocuTalk

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="centered"
)

st.markdown("## Your Private Chat Bots")

private_chatbots, public_chatbots = {}, {}
for id, chatbot in app.auth.user["chatbots"].items():
    if chatbot["access"] == "public":
        public_chatbots[id] = chatbot
    elif chatbot["access"] == "private":
        private_chatbots[id] = chatbot

if len(private_chatbots) == 0:

    st.warning(
        body="*You have no Private Chat Bot for now*",
        icon=":material/block:"
    )

else:

    for id, chatbot in private_chatbots.items():

        container = st.container(border=True)

        subcol0, subcol1, subcol2 = container.columns(
            spec=[1, 7, 2],
            vertical_alignment="center",
            gap="medium"
        )

        subcol0.image(
            image=chatbot["icon"],
            width=40
        )

        subcol1.markdown(
            f"""
            **{chatbot['title']}**:  {chatbot["description"]}
            """
        )

        open_chatbot = subcol2.button(
            label="Chat",
            icon=":material/chat:",
            use_container_width=True,
            type="primary",
            key=f"private_{id}"
        )

        if open_chatbot:
            app.chatbot_id = chatbot["id"]
            st.switch_page("src/frontend/pages/chatbot.py")

create_chatbot = st.button(
    label="Create a Private Chat bot",
    type="primary",
    use_container_width=True,
    icon=":material/add:"
)

if create_chatbot:
    st.switch_page("src/frontend/pages/create-chatbot.py")

st.markdown("___")

st.markdown("## Public Chat Bots")

for id, chatbot in public_chatbots.items():

    container = st.container(border=True)

    subcol0, subcol1, subcol2 = container.columns(
        spec=[1, 7, 2],
        vertical_alignment="center",
        gap="medium"
    )

    subcol0.image(
        image=chatbot["icon"],
        width=40
    )

    subcol1.markdown(
        f"""
        **{chatbot['title']}**:  {chatbot["description"]}
        """
    )

    open_chatbot = subcol2.button(
        label="Chat",
        icon=":material/chat:",
        use_container_width=True,
        type="primary",
        key=f"public_{id}"
    )

    if open_chatbot:
        app.chatbot_id = chatbot["id"]
        st.switch_page("src/frontend/pages/chatbot.py")
