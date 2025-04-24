import json
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config.config import (
    CREDIT_EXCHANGE_RATE,
    check_user_access,
    docu_talk,
    get_current_user,
)

router = APIRouter()

class Message(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

class Conversation(BaseModel):
    id: str
    title: str
    messages: list[Message]

@router.get("/get_ask_estimation_duration")
async def get_ask_estimation_duration(
        chatbot_id: str,
        model: str,
        email: str = Depends(get_current_user)
    ):
    """
    Estimate the response duration for a chatbot query based on chatbot data and model.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    model : str
        The model used to process the chatbot query.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A dictionary containing:
        - estimated_duration : float
            Predicted duration for answering a question using the chatbot.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email
    )

    documents = docu_talk.db.get_data(
        table="Documents",
        filter={"chatbot_id": chatbot_id}
    )

    total_pages = sum(d["nb_pages"] for d in documents)

    estimated_duration = docu_talk.predictor.predict(
        metric="ask_chatbot_duration",
        data={
            "nb_documents": len(documents),
            "total_pages": total_pages,
            "model": model,
            "timestamp": datetime.now()
        }
    )

    return {"estimated_duration": round(estimated_duration, 1)}

@router.post("/get_conversations")
async def get_conversations(
        chatbot_id: str = Form(...),
        email: str = Depends(get_current_user)
    ) -> list[Conversation]:
    """
    Retrieve all conversations associated with a chatbot for the current user.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    email : str
        The current authenticated user's email.

    Returns
    -------
    list of Conversation
        A list of conversation objects, each containing messages exchanged with the
        chatbot.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email
    )

    conversations_data = docu_talk.db.get_data(
        table="Conversations",
        filter={
            "chatbot_id": chatbot_id,
            "user_id": email
        }
    )

    conversations = []
    for conversation_data in conversations_data:

        messages_data = docu_talk.db.get_data(
            table="Messages",
            filter={
                "conversation_id": conversation_data["id"]
            }
        )

        conversation_data["messages"] = []
        for message_data in messages_data:
            message = Message.model_validate(message_data)
            conversation_data["messages"].append(message)

        conversation = Conversation.model_validate(conversation_data)
        conversations.append(conversation)

    return conversations

@router.post("/create_conversation")
async def create_conversation(
        chatbot_id: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Create a new conversation instance for a specific chatbot and user.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A dictionary containing:
        - conversation_id : str
            The unique identifier of the newly created conversation.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email
    )

    conversation_id = str(uuid4())

    docu_talk.db.insert_data(
        table="Conversations",
        data={
            "id": conversation_id,
            "chatbot_id": chatbot_id,
            "title": "New Chat",
            "user_id": email
        }
    )

    return {"conversation_id": conversation_id}

async def stream_ask_chatbot(
        chatbot_id: str,
        message: str,
        conversation_id: str,
        model: str,
        email: str
    ):
    """
    Stream the response from the chatbot for a given user message, while handling credit
    usage and logging.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    message : str
        The user's input message to the chatbot.
    conversation_id : str
        The conversation context in which the message is sent.
    model : str
        The model used to generate the chatbot response.
    email : str
        The current authenticated user's email.

    Yields
    ------
    str
        Chunks of the chatbot's response followed by credit consumption updates as
        Server-Sent Events (SSE).
    """

    start_time = datetime.now()

    chatbot = docu_talk.start_chat(chatbot_id)

    messages_data = docu_talk.db.get_data(
        table="Messages",
        filter={"conversation_id": conversation_id}
    )

    previous_messages = [
        {
            "role": message["role"],
            "content": message["content"]
        }
        for message in messages_data
    ]

    chatbot.service.messages.extend(previous_messages)

    stream = chatbot.service.ask(
        message=message,
        model=model,
        # document_ids=selected_document_ids
    )

    answer = ""
    for chunk in stream:
        answer += chunk
        yield chunk

    qty = chatbot.service.last_usages["qty"] * 4

    price = docu_talk.store_usage(
        user_id=email,
        model_name=model,
        qty=qty,
    )

    consumed_credits = round(price * CREDIT_EXCHANGE_RATE, 2)

    yield (
        f"event: credits\nid: {int(datetime.now().timestamp())}\n"
        f"data: {json.dumps({'consumed_credits': consumed_credits})}\n\n"
    )

    docu_talk.db.insert_data(
        table="Messages",
        data={
            "conversation_id": conversation_id,
            "role": "user",
            "content": message
        }
    )

    docu_talk.db.insert_data(
        table="Messages",
        data={
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": answer
        }
    )

    docu_talk.predictor.log_ask_chatbot_metrics(
        duration=(datetime.now() - start_time).total_seconds(),
        token_count=chatbot.service.last_usages["qty"],
        nb_documents=len(chatbot.service.documents),
        total_pages=sum(d["nb_pages"] for d in chatbot.service.documents),
        model=model,
        chatbot_id=chatbot_id
    )

@router.post("/ask_chatbot")
async def ask_chatbot(
        chatbot_id: str = Form(...),
        message: str = Form(...),
        model: str = Form(...),
        conversation_id: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Endpoint to send a message to the chatbot and stream the response in real-time.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    message : str
        The user's message to the chatbot.
    model : str
        The model to be used for generating the chatbot's response.
    conversation_id : str
        The conversation identifier for context.
    email : str
        The current authenticated user's email.

    Returns
    -------
    StreamingResponse
        A streaming HTTP response using Server-Sent Events (SSE) for delivering the
        chatbot's response and credit updates.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email
    )

    stream = stream_ask_chatbot(
        chatbot_id=chatbot_id,
        message=message,
        conversation_id=conversation_id,
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

    return response

@router.post("/get_last_message_sources")
async def get_last_message_sources(
        chatbot_id: str = Form(...),
        model: str = Form(...),
        conversation_id: str = Form(...),
        email: str = Depends(get_current_user)
    ):
    """
    Retrieve the source documents referenced in the chatbot's last response.

    Parameters
    ----------
    chatbot_id : str
        The unique identifier of the chatbot.
    model : str
        The model used for generating the response.
    conversation_id : str
        The conversation identifier to locate the last message.
    email : str
        The current authenticated user's email.

    Returns
    -------
    dict
        A dictionary containing:
        - answer : str
            A formatted string listing sources or a message indicating no sources were
            found.
        - consumed_credits : float
            The number of credits consumed by this operation.
    """

    check_user_access(
        chatbot_id=chatbot_id,
        email=email
    )

    start_time = datetime.now()

    chatbot = docu_talk.start_chat(chatbot_id)

    messages_data = docu_talk.db.get_data(
        table="Messages",
        filter={"conversation_id": conversation_id}
    )

    previous_messages = [
        {
            "role": message["role"],
            "content": message["content"]
        }
        for message in messages_data
    ]

    chatbot.service.messages.extend(previous_messages)

    sources = chatbot.service.get_last_message_sources(
        model=model,
        # document_ids=selected_document_ids
    )

    if len(sources) == 0:
        answer = "No sources found"
    else:
        parts = []
        for source in sources:
            part = "[{filename} - Page {page}]({url})\n\n*{citation}*".format(**source)
            parts.append(part)

        answer = "\n\n".join(parts)

    qty = chatbot.service.last_usages["qty"] * 4

    price = docu_talk.store_usage(
        user_id=email,
        model_name=model,
        qty=qty,
    )

    consumed_credits = round(price * CREDIT_EXCHANGE_RATE, 2)

    docu_talk.db.insert_data(
        table="Messages",
        data={
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": answer
        }
    )

    docu_talk.predictor.log_ask_chatbot_metrics(
        duration=(datetime.now() - start_time).total_seconds(),
        token_count=chatbot.service.last_usages["qty"],
        nb_documents=len(chatbot.service.documents),
        total_pages=sum(d["nb_pages"] for d in chatbot.service.documents),
        model=model,
        chatbot_id=chatbot_id
    )

    response = {
        "answer": answer,
        "consumed_credits": consumed_credits
    }

    return response
