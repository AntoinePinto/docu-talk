import streamlit as st
from config import TEXTS
from st_docu_talk import StreamlitDocuTalk

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="centered",
    back_page_path="src/frontend/pages/home.py",
    back_page_name="Home"
)

with st.container(border=True):

    st.markdown(TEXTS["terms_of_use_preview"])

    st.button(
        label="Display Terms Of Use",
        type="primary",
        on_click=app.sidebar.display_terms_of_use
    )

with st.container(border=True):

    st.markdown(TEXTS["delete_account"])

    st.button(
        label="Delete Account",
        type="primary",
        on_click=app.delete_user
    )
