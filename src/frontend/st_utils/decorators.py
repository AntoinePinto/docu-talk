import streamlit as st


def st_progress(
        in_progress_message="...",
        success_message="Success",
        success_icon="✅"
    ):
    """
    A decorator to display a progress spinner and toast messages during function
    execution.

    Parameters
    ----------
    in_progress_message : str, optional
        Message to display during the progress spinner (default is "...").
    success_message : str, optional
        Message to display upon successful execution (default is "Success").
    success_icon : str, optional
        Icon to display with the success toast (default is "✅").

    Returns
    -------
    function
        The wrapped function with progress indicators.
    """

    def decorator(func):

        def wrapper(*args, **kwargs):

            with st.spinner(in_progress_message):
                result = func(*args, **kwargs)
                st.toast(success_message, icon=success_icon)
            return result

        return wrapper

    return decorator

def st_confirmation_dialog(
        title: str | None = "Confirmation",
        content: str | None = None,
        button_label: str = "I confirm"
    ):
    """
    A decorator to display a confirmation dialog before executing a function.

    Parameters
    ----------
    title : str or None, optional
        Title of the confirmation dialog (default is "Confirmation").
    content : str or None, optional
        Content to display in the dialog (default is None).
    button_label : str, optional
        Label for the confirmation button (default is "I confirm").

    Returns
    -------
    function
        The wrapped function with a confirmation dialog.
    """

    def decorator(func):
        @st.dialog(title=title, width="large") # type: ignore
        def wrapper(*args, **kwargs):

            if content is not None:
                st.markdown(content)

            confirmation = st.button(
                label=button_label,
                type="primary",
                key="confirmation"
            )

            if confirmation:
                func(*args, **kwargs)
                st.rerun()

        return wrapper

    return decorator
