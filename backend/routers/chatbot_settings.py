from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from config.config import (
    MAX_NB_DOC_PER_CHATBOT,
    MAX_NB_PAGES_PER_CHATBOT,
    check_user_access,
    docu_talk,
    get_current_user,
    mailing_bot,
)
from utils.file_io import get_nb_pages_pdf

router = APIRouter()

@router.post("/update_chatbot")
async def update_chatbot(
        chatbot_id: str = Form(...),
        title: str = Form(...),
        description: str = Form(...),
        icon: UploadFile = File(None),
        email: str = Depends(get_current_user)
    ):
    """
    Update the metadata and icon of an existing chatbot.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot to update.
    title : str
        The new title for the chatbot.
    description : str
        The new description for the chatbot.
    icon : UploadFile, optional
        An optional new icon file for the chatbot.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming successful update.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    icon_bytes = None
    if icon:
        icon_bytes = await icon.read()

    docu_talk.update_chatbot(
        chatbot_id=chatbot_id,
        title=title,
        description=description,
        icon=icon_bytes
    )

    return {"message": "Chatbot updated successfully"}

@router.delete("/delete_chatbot/{chatbot_id}")
async def delete_chatbot(
        chatbot_id: str,
        email: str = Depends(get_current_user)
    ):
    """
    Delete a chatbot permanently.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot to delete.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming successful deletion.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    docu_talk.delete_chatbot(
        chatbot_id=chatbot_id
    )

    return {"message": "Chatbot deleted successfully"}

@router.post("/share_chatbot")
async def share_chatbot(
        chatbot_id: str = Form(...),
        user_email: str = Form(...),
        role: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Share a chatbot with another user by assigning a role and sending a notification
    email.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot to share.
    user_email : str
        The email of the user to share the chatbot with.
    role : str
        The role to assign to the user (e.g., viewer, editor).
    email : str
        The current authenticated user's email.

    Returns
    -------
    None
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    docu_talk.share_chatbot(
        chatbot_id=chatbot_id,
        user_id=user_email,
        role=role
    )

    chatbot_data = docu_talk.db.get_data(
        table="Chatbots",
        filter={"id": chatbot_id}
    )

    chatbot_name = chatbot_data[0]["title"]

    mailing_bot.send_chatbot_shared_email(
        recipient=user_email,
        sharing_name=email,
        chatbot_name=chatbot_name
    )

@router.delete("/remove_access_chatbot/{chatbot_id}/{user_email}")
async def remove_access_chatbot(
        chatbot_id: str,
        user_email: str,
        email: str = Depends(get_current_user)
    ):
    """
    Remove a user's access to a shared chatbot.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    user_email : str
        The email of the user whose access is being revoked.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming successful access removal.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    docu_talk.remove_access_chatbot(
        chatbot_id=chatbot_id,
        user_id=user_email
    )

    return {"message": "Access removed successfully"}

@router.post("/request_for_public_sharing")
async def request_for_public_sharing(
        chatbot_id: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Submit a request to make a chatbot publicly accessible.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming submission of the public sharing request.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    docu_talk.db.update_data(
        table="Chatbots",
        filter={"id": chatbot_id},
        updates={"access": "pending_public_request"}
    )

    return {"message": "Public sharing request submitted successfully"}

@router.post("/add_documents")
async def add_documents(
        chatbot_id: str = Form(...),
        documents_files: List[UploadFile] = File(...),
        email: str = Depends(get_current_user)
    ):
    """
    Add new documents to an existing chatbot, respecting document and page limits.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    documents_files : list of UploadFile
        List of PDF documents to add.
    email : str
        The current authenticated user's email.

    Raises
    ------
    HTTPException
        If the maximum number of documents or pages per chatbot is exceeded.

    Returns
    -------
    None
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    existing_documents = docu_talk.db.get_data(
        table="Documents",
        filter={"chatbot_id": chatbot_id}
    )

    total_nb_documents = len(documents_files) + len(existing_documents)
    if total_nb_documents > MAX_NB_DOC_PER_CHATBOT:

        raise HTTPException(
            status_code=400,
            detail="You have reached the maximum number of documents per chatbot"
        )

    total_pages = sum([d["nb_pages"] for d in existing_documents])
    documents = []
    for document in documents_files:

        document_bytes = await document.read()
        nb_pages = get_nb_pages_pdf(document_bytes)

        documents.append(
            {
                "filename": document.filename,
                "pdf_bytes": document_bytes,
                "nb_pages": nb_pages
            }
        )

        total_pages += nb_pages

    if total_pages > MAX_NB_PAGES_PER_CHATBOT:
        raise HTTPException(
            status_code=400,
            detail="You have reached the maximum number of pages per chatbot"
        )

    for document in documents:

        docu_talk.add_document(
            chatbot_id=chatbot_id,
            created_by=email,
            filename=document["filename"],
            pdf_bytes=document["pdf_bytes"],
            nb_pages=document["nb_pages"]
        )

@router.delete("/delete_document/{chatbot_id}/{filename}")
async def delete_document(
        chatbot_id: str,
        filename: str,
        email: str = Depends(get_current_user)
    ):
    """
    Delete a specific document from a chatbot.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    filename : str
        The name of the document to delete.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A message confirming successful document deletion.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email,
        check_admin=True
    )

    docu_talk.remove_document(
        chatbot_id=chatbot_id,
        filename=filename
    )

    return {"message": "Document deleted successfully"}
