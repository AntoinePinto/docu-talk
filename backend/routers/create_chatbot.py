import json
from base64 import b64encode
from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import StreamingResponse

from config.config import CREDIT_EXCHANGE_RATE, docu_talk, get_current_user
from utils.file_io import get_nb_pages_pdf

router = APIRouter()

@router.post("/get_create_chatbot_estimations")
async def get_create_chatbot_estimations(
        documents_files: List[UploadFile] = File(...),
        model: str = Form(...)
    ):
    """
    Estimate chatbot creation metrics based on uploaded documents and selected model.

    Parameters
    ----------
    documents_files : List[UploadFile]
        List of uploaded PDF documents for which the chatbot will be created.
    model : str
        The name of the model to be used for chatbot creation.

    Returns
    -------
    dict
        A dictionary containing:
        - total_pages : int
            Total number of pages across all uploaded documents.
        - estimated_duration : float
            Predicted duration for creating the chatbot.
    """

    total_pages = 0
    for document in documents_files:
        document_bytes = await document.read()
        nb_pages = get_nb_pages_pdf(document_bytes)
        total_pages += nb_pages

    estimated_duration = docu_talk.predictor.predict(
        metric="create_chatbot_duration",
        data={
            "nb_documents": len(documents_files),
            "total_pages": total_pages,
            "model": model,
            "timestamp": datetime.now()
        }
    )

    return {
        "total_pages": total_pages,
        "estimated_duration": estimated_duration
    }

def create_chatbot_stream(
        chatbot_id: str,
        documents: list[dict],
        model: str,
        email: str
    ):
    """
    Stream the chatbot creation process including title, description, icon, prompts, and
    credit consumption.

    Parameters
    ----------
    chatbot_id : str
        Unique identifier for the chatbot being created.
    documents : list of dict
        List of dictionaries containing document metadata and content.
    model : str
        The model name to guide the chatbot generation process.
    email : str
        Email of the user creating the chatbot.

    Yields
    ------
    str
        JSON-formatted strings or Server-Sent Events (SSE) representing different stages
        of chatbot creation.
    """

    chatbot = docu_talk.get_chatbot_service(
        chatbot_id=chatbot_id,
        documents=documents
    )

    title, description = chatbot.generate_title_description(
        model=model
    )

    yield json.dumps({
        "title": title,
        "description": description
    }) + "\n"

    price = docu_talk.store_usage(
        user_id=email,
        model_name=model,
        qty=chatbot.last_usages["qty"] * 4,
    )

    consumed_credits = round(price * CREDIT_EXCHANGE_RATE, 2)

    yield (
        f"event: credits\nid: {int(datetime.now().timestamp())}\n"
        f"data: {json.dumps({'consumed_credits': consumed_credits})}\n\n"
    )

    icon = chatbot.generate_icon(
        description=description,
        model=model
    )

    icon_base64 = b64encode(icon).decode("utf-8")

    yield json.dumps({
        "icon": icon_base64
    }) + "\n"

    price = docu_talk.store_usage(
        user_id=email,
        model_name=model,
        qty=chatbot.last_usages["qty"] * 4,
    )

    consumed_credits = round(price * CREDIT_EXCHANGE_RATE, 2)

    yield (
        f"event: credits\nid: {int(datetime.now().timestamp())}\n"
        f"data: {json.dumps({'consumed_credits': consumed_credits})}\n\n"
    )

    suggested_prompts = chatbot.get_suggested_prompts(
        model=model
    )

    yield json.dumps({
        "suggested_prompts": suggested_prompts
    }) + "\n"

    price = docu_talk.store_usage(
        user_id=email,
        model_name=model,
        qty=chatbot.last_usages["qty"] * 4,
    )

    consumed_credits = round(price * CREDIT_EXCHANGE_RATE, 2)

    yield (
        f"event: credits\nid: {int(datetime.now().timestamp())}\n"
        f"data: {json.dumps({'consumed_credits': consumed_credits})}\n\n"
    )

    docu_talk.create_chatbot(
        chatbot_id=chatbot_id,
        created_by=email,
        title=title,
        description=description,
        icon=icon,
        access="private",
        documents=chatbot.documents,
        suggested_prompts=suggested_prompts
    )

    yield json.dumps({
        "chatbot_id": chatbot_id
    }) + "\n"

@router.post("/create_chatbot")
async def create_chatbot(
        documents_files: List[UploadFile] = File(...),
        model: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Endpoint to initiate chatbot creation from uploaded documents and stream progress
    to the client.

    Parameters
    ----------
    documents_files : List[UploadFile]
        List of uploaded PDF documents to base the chatbot on.
    model : str
        The model to be used for generating the chatbot.
    email : str
        The current authenticated user's email, injected via dependency.

    Returns
    -------
    StreamingResponse
        A streaming HTTP response using Server-Sent Events (SSE) to provide real-time
        updates on the chatbot creation process.
    """

    start_time = datetime.now()

    documents = []
    total_pages = 0
    for document in documents_files:

        document_bytes = await document.read()
        nb_pages = get_nb_pages_pdf(document_bytes)

        documents.append(
            {
                "filename": document.filename,
                "bytes": document_bytes,
                "nb_pages": nb_pages
            }
        )

        total_pages += nb_pages

    chatbot_id = str(uuid4())

    stream = create_chatbot_stream(
        chatbot_id=chatbot_id,
        documents=documents,
        model=model,
        email=email
    )

    response = StreamingResponse(
        content=stream,
        media_type="text/event-stream",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cafche",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
            "Content-Encoding": "none"
        }
    )

    docu_talk.predictor.log_create_chatbot_metric(
        duration=(datetime.now() - start_time).total_seconds(),
        nb_documents=len(documents),
        total_pages=total_pages,
        model=model,
        chatbot_id=chatbot_id
    )

    return response
