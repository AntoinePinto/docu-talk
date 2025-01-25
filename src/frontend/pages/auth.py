import streamlit as st

from config import (
    DISPLAY_GUEST_MODE,
    TEXTS
)
from st_docu_talk import StreamlitDocuTalk

app : StreamlitDocuTalk = st.session_state["app"]

app.set_page_config(
    layout="wide",
    display_sidebar=False
)

col0, col1 = st.columns(2, gap="large")

with col0:

    with st.container(border=True):

        st.markdown(TEXTS["welcome"])

        st.video("./media/docu_talk.mp4")

with col1:

    # with st.container(border=True):
    with st.form(key="sign_in"):

        st.markdown("### Get Started - 100% Free")

        sign_in, sign_up = st.tabs(["Sign in",  "Sign Up"])

        with sign_in:

            email = st.text_input(
                label="Email",
                key="sign_in_mail"
            )

            password = st.text_input(
                label="Password",
                type="password",
                key="sign_in_password"
            )

            sign_in_button = st.form_submit_button(
                label="Login",
                type="primary",
            )

        if sign_in_button:
                
            app.auth.sign_in(
                email=email.lower(),
                password=password
            )
                    
        with sign_up:

            col0, col1 = st.columns(2)

            email = st.text_input(
                label="Email",
                key="sign_up_mail"
            )

            first_name = col0.text_input(
                label="First Name"
            )

            last_name = col1.text_input(
                label="Last Name"
            )

            sign_up_button = st.form_submit_button(
                label="Sign Up",
                type="primary"
            )

        if sign_up_button:
            
            app.auth.sign_up(
                email=email.lower(),
                first_name=first_name,
                last_name=last_name
            )

        if DISPLAY_GUEST_MODE:

            st.markdown("___")
        
            st.markdown("#### Or start in guest mode (Limited features)")

            sign_guest_button = st.form_submit_button(
                label="Start in Guest mode",
                icon=":material/visibility_off:",
                type="primary",
                use_container_width=True
            )

            if sign_guest_button:
                app.auth.sign_guest()