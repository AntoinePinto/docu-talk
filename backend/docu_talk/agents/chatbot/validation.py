from typing import List

from pydantic import BaseModel


class Source(BaseModel):
    filename: str
    page: int
    citation: str

class Icon(BaseModel):
    name: str
    color: str

class Desc(BaseModel):
    title: str
    description: str

class SuggestedPrompts(BaseModel):
    items: List[str]
