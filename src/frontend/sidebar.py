import random

from string import Template

import streamlit as st

from assets import templates
from auth.auth import Auth
from docu_talk.docu_talk import DocuTalk

from config import (
    ENCODED_LOGO,
    BASE_URL,
    TEXTS,
    CREDIT_EXCHANGE_RATE
)

class Sidebar:
    """
    A class for managing and displaying the Streamlit sidebar in the DocuTalk
    application.
    """

    def __init__(
            self,
            auth: Auth,
            docu_talk: DocuTalk
        ):
        """
        Initializes the Sidebar with authentication and DocuTalk services.

        Parameters
        ----------
        auth : Auth
            The authentication service instance.
        docu_talk : DocuTalk
            The DocuTalk service instance.
        """
        
        self.auth = auth
        self.docu_talk = docu_talk

    @st.dialog(title="Terms of Use", width="large")
    def display_terms_of_use(self):
        """
        Displays the Terms of Use dialog to the user and updates their acceptance
        status.
        """
        
        st.markdown(TEXTS["terms_of_use"])

        if not self.auth.user["terms_of_use_displayed"]:

            self.docu_talk.db.update_data(
                table="Users",
                filter={"email": self.auth.user["email"]},
                updates={"terms_of_use_displayed": True}
            )

            self.auth.user["terms_of_use_displayed"] = True

    @st.dialog(title="No credits left :(")
    def no_credit_message(self):
        """
        Displays a message to the user when they have no credits left.
        """

        st.markdown(TEXTS["no_credit"])

    def update_credit_placeholder(self):
        """
        Updates the credit information displayed in the sidebar.

        Returns
        -------
        int
            The remaining credits for the user.
        """

        consumed_price = self.docu_talk.get_consumed_price(
            user_id=self.auth.user["email"]
        )

        period_dollar_amount = self.auth.user["period_dollar_amount"]
        available_credits =  period_dollar_amount * CREDIT_EXCHANGE_RATE
        remaining_credits = available_credits - consumed_price * CREDIT_EXCHANGE_RATE

        html = Template(templates.remaining_credits_html).substitute(
            url_logo=BASE_URL,
            logo=ENCODED_LOGO,
            name=self.auth.user["friendly_name"],
            remaining_credits=round(remaining_credits),
            available_credits=available_credits
        )

        self.credit_placeholder.html(html)

        return remaining_credits
    
    def display_waiting_tips(self):
        """
        Displays a list of waiting tips in the sidebar, selected randomly.
        """

        random_tips = random.sample(templates.waiting_tips, 10)

        params = {}
        for i, tip in enumerate(random_tips):
            params[f"title{i}"] = tip["title"]
            params[f"content{i}"] = tip["content"]

        html = Template(templates.waiting_tips_template).substitute(**params)

        st.html(html)

    def display_sidebar(self):
        """
        Displays the sidebar with user credits, settings, logout options, and
        additional information.
        """

        with st.sidebar:

            self.credit_placeholder = st.empty()
            remaining_credits = self.update_credit_placeholder()

            col0, col1 = st.columns(2)

            open_settings = col0.button(
                label="",
                icon=":material/settings:",
                use_container_width=True
            )

            if open_settings:
                st.switch_page("src/frontend/pages/settings.py")

            col1.button(
                label="",
                icon=":material/logout:",
                use_container_width=True,
                on_click=self.auth.logout
            )

            self.display_waiting_tips()
             
            st.html(templates.about_html)

            if remaining_credits < 0:
                self.no_credit_message()
                st.stop()