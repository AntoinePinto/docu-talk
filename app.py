import sys

import streamlit as st

from dotenv import load_dotenv

load_dotenv()

sys.path.extend(["src/frontend", "src/backend"])
from st_docu_talk import StreamlitDocuTalk

if "app" not in st.session_state:
    st.session_state["app"] = StreamlitDocuTalk()
    st.rerun()

app : StreamlitDocuTalk = st.session_state["app"]

if app.auth.logged_in is False:
    pg = st.navigation(
        [
            st.Page("src/frontend/pages/auth.py", title="Auth")
        ],
        position="hidden"
    )
else:
    pg = st.navigation(
        [
            st.Page("src/frontend/pages/home.py", title="Home", default=True),
            st.Page("src/frontend/pages/chatbot.py", title="Docu Talk"),
            st.Page("src/frontend/pages/create-chatbot.py", title="Create Chat Bot"),
            st.Page("src/frontend/pages/settings.py", title="Settings"),
            st.Page("src/frontend/pages/chatbot-settings.py", title="Chat Bot Settings")
        ],
        position="hidden"
    )

pg.run()
