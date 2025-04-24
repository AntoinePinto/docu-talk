from dataclasses import dataclass

from docu_talk.agents import ChatBotService


@dataclass
class ChatBot:
    title: str
    description: str
    icon: bytes
    suggested_prompts: list
    access: str
    service: ChatBotService
