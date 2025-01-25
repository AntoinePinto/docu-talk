import joblib
import os
import sys

from dotenv import load_dotenv
from typing import Literal, Any

import pandas as pd

from sklearn.ensemble import RandomForestRegressor

load_dotenv()

sys.path.append("src/backend")
from docu_talk.database.database import Database

metrics = [
    "create_chatbot_duration",
    "ask_chatbot_duration",
    "ask_chatbot_token_count"
]

models = {}
for metric in metrics:
    path = os.path.join(os.path.dirname(__file__), "models", f"{metric}.pickle")
    models[metric] = joblib.load(path)

class Predictor:
    """
    A class to manage metrics logging, preprocessing, training, and predictions
    using machine learning models.
    """

    metric_tables = {
        "create_chatbot_duration": "CreateChatbotDurations",
        "ask_chatbot_duration": "AskChatbotDurations",
        "ask_chatbot_token_count": "AskChatbotTokenCounts"
    }

    models: dict[str, RandomForestRegressor] = models

    def __init__(self) -> None:
        """
        Initializes the Predictor with database and preloaded models.
        """

        self.db = Database(
            uri=os.getenv("MONGO_DB_URI"),
            database_name=os.getenv("MONGO_DB_NAME")
        )

    def log_metric(
            self,
            metric: Literal[
                "create_chatbot_duration",
                "ask_chatbot_duration",
                "ask_chatbot_token_count"
            ],
            value: Any,
            features: dict,
            metadata: dict | None = None
        ) -> None:
        """
        Logs a metric to the database.

        Parameters
        ----------
        metric : Literal
            The metric to log.
        value : Any
            The value of the metric.
        features : dict
            The features associated with the metric.
        metadata : dict or None, optional
            Additional metadata for the metric.
        """

        if metadata is None:
            metadata = {}

        data = {
            "value": value,
            "metadata": metadata
        }

        data.update(features)

        self.db.insert_data(
            table=self.metric_tables[metric],
            data=data
        )

    def log_create_chatbot_metric(
            self,
            duration: float,
            nb_documents: int,
            total_pages: int,
            model: str,
            chatbot_id: str
        ) -> None:
        """
        Logs the 'create_chatbot_duration' metric.

        Parameters
        ----------
        duration : float
            The duration for creating the chatbot.
        nb_documents : int
            Number of documents involved.
        total_pages : int
            Total number of pages in the documents.
        model : str
            The model used.
        chatbot_id : str
            The unique identifier of the chatbot.
        """

        self.log_metric(
            metric="create_chatbot_duration",
            value=duration,
            features={
                "nb_documents": nb_documents,
                "total_pages": total_pages,
                "model": model
            },
            metadata={"chatbot_id": chatbot_id}
        )

    def log_ask_chatbot_metrics(
            self,
            duration: float,
            token_count: int,
            nb_documents: int,
            total_pages: int,
            model: str,
            chatbot_id: str
        ) -> None:
        """
        Logs the 'ask_chatbot_duration' and 'ask_chatbot_token_count' metrics.

        Parameters
        ----------
        duration : float
            The duration of the chatbot query.
        token_count : int
            The token count for the query.
        nb_documents : int
            Number of documents involved.
        total_pages : int
            Total number of pages in the documents.
        model : str
            The model used.
        chatbot_id : str
            The unique identifier of the chatbot.
        """

        self.log_metric(
            metric="ask_chatbot_duration",
            value=duration,
            features={
                "nb_documents": nb_documents,
                "total_pages": total_pages,
                "model": model
            },
            metadata={"chatbot_id": chatbot_id}
        )

        self.log_metric(
            metric="ask_chatbot_token_count",
            value=token_count,
            features={
                "nb_documents": nb_documents,
                "total_pages": total_pages,
                "model": model
            },
            metadata={"chatbot_id": chatbot_id}
        )

    def preprocess(
            self,
            data: list
        ) -> pd.DataFrame:
        """
        Preprocesses data for model training or prediction.

        Parameters
        ----------
        data : list
            A list of data records to preprocess.

        Returns
        -------
        pd.DataFrame
            A preprocessed pandas DataFrame.
        """

        df = pd.DataFrame(data)

        for col in ["metadata", "value", "_id", "id"]:
            if col in df.columns:
                df = df.drop(columns=[col])

        df["model"] = df["model"].astype("category").cat.codes
        df["timestamp"] = pd.to_datetime(df["timestamp"]).astype(int) / 10**9

        return df

    def train(
            self,
            metric: Literal[
                "create_chatbot_duration",
                "ask_chatbot_duration",
                "ask_chatbot_token_count"
            ]
        ) -> None:
        """
        Trains a machine learning model for the specified metric.

        Parameters
        ----------
        metric : Literal
            The metric to train a model.
        """

        data = self.db.get_data(table=self.metric_tables[metric])

        x = self.preprocess(data)
        y = [d["value"] for d in data]

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(x, y)

        model_path = os.path.join(
            os.path.dirname(__file__),
            "models",
            f"{metric}.pickle"
        )

        joblib.dump(model, model_path)

    def predict(
            self,
            metric: Literal[
                "create_chatbot_duration",
                "ask_chatbot_duration",
                "ask_chatbot_token_count"
            ],
            data: dict
        ) -> int | float:
        """
        Predicts a value for the specified metric using the trained model.

        Parameters
        ----------
        metric : Literal
            The metric to predict ('create_chatbot_duration', 'ask_chatbot_duration',
            'ask_chatbot_token_count').
        data : dict
            The input data for prediction.

        Returns
        -------
        int or float
            The predicted value.
        """

        model = self.models[metric]

        x = self.preprocess([data])

        predictions = model.predict(X=x)

        prediction = predictions[0]

        return prediction

if __name__ == "__main__":

    predictor = Predictor()
    for metric in metrics:
        predictor.train(metric=metric)
