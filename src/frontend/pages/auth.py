from string import Template

import streamlit as st
from assets import templates
from config import BASE_URL, DISPLAY_GUEST_MODE, ENCODED_LOGO, TEXTS
from st_docu_talk import StreamlitDocuTalk

app : StreamlitDocuTalk = st.session_state["app"]

if "login_provider" in st.query_params:
    st.login(provider=st.query_params["login_provider"])
    st.stop()
elif st.experimental_user.is_logged_in is True:
    app.auth.sign_in_from_provider()

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

        html_header = Template(templates.auth_header).substitute(
            logo=ENCODED_LOGO
        )

        st.html(html_header)

        sign_in, sign_up = st.tabs(["Sign in",  "Sign Up"])

        with sign_in:

            email = st.text_input(
                label="Email",
                placeholder="Email",
                label_visibility="collapsed",
                key="sign_in_mail"
            )

            password = st.text_input(
                label="Password",
                type="password",
                placeholder="Password",
                label_visibility="collapsed",
                key="sign_in_password"
            )

            sign_in_button = st.form_submit_button(
                label="Continue",
                type="primary",
                use_container_width=True
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
                placeholder="Email",
                label_visibility="collapsed",
                key="sign_up_mail"
            )

            first_name = col0.text_input(
                label="First Name",
                placeholder="First Name",
                label_visibility="collapsed"
            )

            last_name = col1.text_input(
                label="Last Name",
                placeholder="Last Name",
                label_visibility="collapsed"
            )

            sign_up_button = st.form_submit_button(
                label="Sign Up",
                type="primary",
                use_container_width=True
            )

        if sign_up_button:

            app.auth.sign_up(
                email=email.lower(),
                first_name=first_name,
                last_name=last_name
            )

        st.html(templates.auth_or)

        html = Template(templates.auth_provider).substitute(
            redirect_url=f"{BASE_URL}?login_provider=google",
            text="Continue with Google",
            logo=(
                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/"
                "Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
            )
        )

        st.html(html)

        html = Template(templates.auth_provider).substitute(
            redirect_url=f"{BASE_URL}?login_provider=microsoft",
            text="Continue with Microsoft",
            logo="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        )

        st.html(html)

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
