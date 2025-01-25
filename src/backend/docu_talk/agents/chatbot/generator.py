from typing import Generator

import vertexai

from google.api_core.exceptions import ResourceExhausted
from vertexai.generative_models import GenerativeModel, SafetySetting

from utils.misc import get_param_or_env
from utils.decorators import retry_with_exponential_backoff

class Gemini:
    """
    A class to interface with the Gemini generative model for content generation and 
    handling safety settings.
    """

    safety_settings = [
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_NONE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_NONE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_NONE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_NONE
        ),
    ]

    def __init__(
            self, 
            project_id: str | None = None, 
            location: str | None = None
        ) -> None:
        """
        Initializes the Gemini instance with Google Vertex AI settings.

        Parameters
        ----------
        project_id : str or None, optional
            The Google Cloud project ID (default is None, fetched from the environment).
        location : str or None, optional
            The Vertex AI location (default is None, fetched from the environment).
        """
        
        project_id = get_param_or_env(project_id, "GEMINI_PROJECT_ID")
        location = get_param_or_env(location, "GEMINI_LOCATION")

        vertexai.init(
            project=project_id, 
            location=location
        )
    
    def get_contents(
            self, 
            messages: list[str]
        ) -> list[dict]:
        """
        Converts message parts into structured content suitable for the Gemini model.

        Parameters
        ----------
        messages : list of str
            A list of messages with parts to process.

        Returns
        -------
        list of dict
            A list of structured content dictionaries.
        """

        contents = []
        for message in messages:

            new_parts = []
            for part in message["parts"]:
            
                if part.startswith("gs://"):
                    part = {
                        "file_data": {
                            "mime_type": "application/pdf",
                            "file_uri": part
                        }
                    }
                else:
                    part = {
                        "text": part
                    }
                    
                new_parts.append(part)

            message["parts"] = new_parts

            contents.append(message)

        return contents

    @retry_with_exponential_backoff(errors=(ResourceExhausted,))
    def get_answer(
            self,
            messages: list,
            model: str = "gemini-1.5-pro-002",
            stream: bool = False,
            context: str | None = None,
            **kwargs
        ):
        """
        Retrieves a response from the Gemini model, with options for streaming or 
        non-streaming.

        Parameters
        ----------
        messages : list
            A list of messages to send to the model.
        model : str, optional
            The model name (default is "gemini-1.5-pro-002").
        stream : bool, optional
            Whether to stream the response (default is False).
        context : str or None, optional
            Context or system instruction for the model (default is None).

        Returns
        -------
        Generator or dict
            A streamed response or a complete response depending on the mode.
        """

        client = GenerativeModel(
            model_name=model,
            system_instruction=context
        )

        contents = self.get_contents(messages)
        
        if stream is True:
            
            response = self.get_streamed_response(
                client=client,
                contents=contents,
                **kwargs
            )
        
        else:
            
            response = self.get_unstreamed_response(
                client=client,
                contents=contents,
                **kwargs
            )
        
        return response
    
    def get_streamed_response(
            self,
            client: GenerativeModel,
            contents: list,
            **kwargs
        ) -> Generator:
        """
        Retrieves a streamed response from the Gemini model.

        Parameters
        ----------
        client : GenerativeModel
            The initialized Gemini model client.
        contents : list
            The structured content to send to the model.
        kwargs : dict
            Additional configuration options for the generation.

        Yields
        ------
        str or dict
            Streamed content parts and usage information.
        """

        completion = client.generate_content(
            contents=contents,
            generation_config=kwargs,
            stream=True,
            safety_settings=self.safety_settings
        )

        for chunk in completion:
            part = chunk.candidates[0].content.parts[0].text
            yield part

        usages = {
            "model": chunk._raw_response.model_version,
            "unit": "characters",
            "qty": chunk.usage_metadata.total_token_count
        }

        yield usages

    def get_unstreamed_response(
            self,
            client: GenerativeModel,
            contents: list,
            **kwargs
        ) -> dict[str, str | dict[str, str | int]]:
        """
        Retrieves a complete, unstreamed response from the Gemini model.

        Parameters
        ----------
        client : GenerativeModel
            The initialized Gemini model client.
        contents : list
            The structured content to send to the model.
        kwargs : dict
            Additional configuration options for the generation.

        Returns
        -------
        dict
            A dictionary containing the answer and usage information.
        """

        completion = client.generate_content(
            contents=contents,
            generation_config=kwargs,
            stream=False,
            safety_settings=self.safety_settings
        )

        response = {
            "answer": completion.text,
            "usages": {
                "model": completion._raw_response.model_version,
                "unit": "characters",
                "qty": completion.to_dict()["usage_metadata"]["total_token_count"]
            }
        }
        
        return response