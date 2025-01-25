from datetime import datetime
from typing import Union

from docu_talk.database.base import (
    Access,
    AskChatbotDuration,
    AskChatbotTokenCount,
    Chatbot,
    CreateChatbotDuration,
    Document,
    ServiceModels,
    SuggestedPrompt,
    Usage,
    User,
)
from pymongo import MongoClient


class Database:
    """
    A class for managing database operations in the DocuTalk application.
    """

    tables = [
        User,
        Usage,
        ServiceModels,
        Chatbot,
        Document,
        Access,
        SuggestedPrompt,
        CreateChatbotDuration,
        AskChatbotDuration,
        AskChatbotTokenCount
    ]

    def __init__(
            self,
            uri: str,
            database_name: str
        ) -> None:
        """
        Initializes the database connection.

        Parameters
        ----------
        uri : str
            The MongoDB connection URI.
        database_name : str
            The name of the database to connect to.
        """

        self.uri = uri
        self.database_name = database_name

        self.client = MongoClient(self.uri, uuidRepresentation="standard")
        self.database = self.client[self.database_name]

    def disconnect(self) -> None:
        """
        Closes the database connection.
        """

        self.client.close()

    def table_list(self) -> list:
        """
        Retrieves the list of collection names in the database.

        Returns
        -------
        list
            A list of collection names.
        """

        return self.database.list_collection_names()

    def clear_database(
            self,
            collections: Union[list, None] = None
        ) -> None:
        """
        Clears the database by dropping specified collections or all collections.

        Parameters
        ----------
        collections : list or None, optional
            A list of collections to drop. If None, all collections are dropped.
        """

        if collections is None:
            collections = self.database.list_collection_names()

        for collection in collections:
            self.database[collection].drop()

    def insert_data(
            self,
            table: str,
            data: dict
        ) -> str:
        """
        Inserts a record into the specified table and returns its ID.

        Parameters
        ----------
        table : str
            The name of the table (collection) to insert data into.
        data : dict
            The data to insert.

        Returns
        -------
        str
            The ID of the inserted record.
        """

        table_class = next(t for t in self.tables if t.__tablename__ == table)

        from uuid import uuid4
        if "id" not in data:
            data["id"] = str(uuid4())
        data["timestamp"] = datetime.now()

        table_class(**data)

        print(f"Inserting a record into table `{table}`")
        self.database[table].insert_one(data)

        return data["id"]

    def get_data(
            self,
            table: str,
            filter: dict | None = None,
            sort: dict | None = None,
            limit: int | None = None
        ) -> list:
        """
        Retrieves data from a specified table based on filter criteria.

        Parameters
        ----------
        table : str
            The name of the table (collection) to retrieve data from.
        filter : dict or None, optional
            The filter criteria for retrieving data.
        sort : dict or None, optional
            The sort criteria, including column and direction (default is None).
        limit : int or None, optional
            The maximum number of records to retrieve (default is None).

        Returns
        -------
        list
            A list of documents matching the criteria.
        """

        if filter is None:
            filter = {}

        cursor = self.database[table].find(filter)

        if sort is not None:
            cursor = cursor.sort(sort["column"], sort["direction"])

        if limit is not None:
            cursor = cursor.limit(4)

        documents = list(cursor)

        return documents

    def update_data(
            self,
            table: str,
            filter: dict,
            updates: dict
        ):
        """
        Updates a record in the specified table based on filter criteria.

        Parameters
        ----------
        table : str
            The name of the table (collection) to update.
        filter : dict
            The filter criteria to locate the record to update.
        updates : dict
            The updates to apply to the record.

        Returns
        -------
        pymongo.results.UpdateResult
            The result of the update operation.
        """

        result = self.database[table].update_one(
            filter=filter,
            update={"$set": updates},
            upsert=True
        )

        return result

    def delete_data(
            self,
            table: str,
            filter: dict
        ):
        """
        Deletes records from the specified table based on filter criteria.

        Parameters
        ----------
        table : str
            The name of the table (collection) to delete data from.
        filter : dict
            The filter criteria for identifying records to delete.

        Returns
        -------
        pymongo.results.DeleteResult
            The result of the delete operation.
        """

        result = self.database[table].delete_many(filter)

        return result
