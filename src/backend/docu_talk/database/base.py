from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class User(BaseModel):
    __tablename__ = "Users"

    id: str
    timestamp: datetime
    first_name: str
    last_name: str
    password_hash: str
    period_dollar_amount: float
    terms_of_use_displayed: bool
    is_guest: bool

class Usage(BaseModel):
    __tablename__ = "Usages"

    id: str
    timestamp: datetime
    user_id: str
    model: str
    unit: str
    qty: int
    price: float

class ServiceModels(BaseModel):
    __tablename__ = "ServiceModels"

    id: str
    timestamp: datetime
    name: str
    unit: str
    price_per_unit: float

class Chatbot(BaseModel):
    __tablename__ = "Chatbots"

    id: str
    timestamp: datetime
    created_by: str
    title: Optional[str]
    description: Optional[str]
    icon: Optional[bytes]
    access: Literal["public", "private", "pending_public_request"]

class CreateChatbotDuration(BaseModel):
    __tablename__ = "CreateChatbotDurations"

    id: str
    timestamp: datetime
    value: float
    nb_documents: int
    total_pages: int
    model: str
    metadata: dict

class AskChatbotDuration(BaseModel):
    __tablename__ = "AskChatbotDurations"

    id: str
    timestamp: datetime
    value: float
    nb_documents: int
    total_pages: int
    model: str
    metadata: dict

class AskChatbotTokenCount(BaseModel):
    __tablename__ = "AskChatbotTokenCounts"

    id: str
    timestamp: datetime
    value: int
    nb_documents: int
    total_pages: int
    model: str
    metadata: dict

class Document(BaseModel):
    __tablename__ = "Documents"

    id: str
    timestamp: datetime
    chatbot_id: str
    created_by: str
    filename: str
    public_path: str
    uri: str
    nb_pages: int

class SuggestedPrompt(BaseModel):
    __tablename__ = "SuggestedPrompts"

    id: str
    timestamp: datetime
    chatbot_id: str
    prompt: str

class Access(BaseModel):
    __tablename__ = "Access"

    id: str
    timestamp: datetime
    chatbot_id: str
    user_id: str
    role: str
