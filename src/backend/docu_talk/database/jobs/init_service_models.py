import json
import os
import sys

from datetime import datetime
from dotenv import load_dotenv
from uuid import uuid4

from pymongo import MongoClient

sys.path.append("src/backend")
from docu_talk.database.base import ServiceModels

if __name__ == '__main__':

    load_dotenv()

    uri = os.getenv("MONGO_DB_URI")
    database_name = os.getenv("MONGO_DB_NAME")

    client = MongoClient(uri, uuidRepresentation="standard")
    database = client[database_name]

    path = os.path.join(os.path.dirname(__file__), "data", "service_models.json")
    with open(path) as f:
        data = json.load(f)

    for model in data:

        model["id"] = str(uuid4())
        model["timestamp"] = datetime.now()

        ServiceModels(**model)

        database["ServiceModels"].insert_one(model)
