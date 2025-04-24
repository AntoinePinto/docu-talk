import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, chatbot_settings, chatbots, create_chatbot

load_dotenv()

app = FastAPI(
    title="DocuTalk API",
    description="Backend API for DocuTalk application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    router=auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    router=chatbots.router,
    prefix="/api/chatbots",
    tags=["Chatbots"]
)

app.include_router(
    router=chatbot_settings.router,
    prefix="/api/chatbot_settings",
    tags=["Chatbots Settings"]
)

app.include_router(
    router=create_chatbot.router,
    prefix="/api/create_chatbot",
    tags=["Create Chatbot"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to DocuTalk API"}
