from typing import Tuple
from urllib.parse import urlparse

from datetime import datetime, timedelta, timezone

from google.cloud import storage

class GoogleCloudStorageManager:
    """
    A class to manage Google Cloud Storage operations, including file uploads,
    downloads, and deletions.
    """

    def __init__(
            self,
            project_id: str,
            bucket_name: str
        ) -> None:
        """
        Initializes the Google Cloud Storage Manager.

        Parameters
        ----------
        project_id : str
            The Google Cloud project ID.
        bucket_name : str
            The name of the Google Cloud Storage bucket.
        """

        self.bucket_name = bucket_name
        self.bucket = storage.Client(project_id).bucket(bucket_name)

    def save_from_file(
            self,
            file: str,
            gcs_path: str
        ) -> Tuple[str, str]:
        """
        Saves a file to Google Cloud Storage and returns its URIs.

        Parameters
        ----------
        file : str
            The content of the file as a string.
        gcs_path : str
            The destination path in the bucket.

        Returns
        -------
        tuple of str
            A tuple containing the GCS URI and the public path of the file.
        """

        blob = self.bucket.blob(gcs_path)
        blob.upload_from_string(file, content_type="application/pdf")

        uri = f"gs://{self.bucket_name}/{gcs_path}"
        public_path = f"https://storage.cloud.google.com/{self.bucket_name}/{gcs_path}"

        return uri, public_path

    def get_blob_name(
            self,
            uri: str
        ) -> str:
        """
        Extracts the blob name from a GCS URI.

        Parameters
        ----------
        uri : str
            The GCS URI.

        Returns
        -------
        str
            The blob name extracted from the URI.

        Raises
        ------
        ValueError
            If the URI scheme is not 'gs'.
        """

        parsed_uri = urlparse(uri)
        if parsed_uri.scheme != 'gs':
            raise ValueError("Invalid URI scheme. Expected 'gs://'.")

        blob_name = parsed_uri.path.lstrip('/')

        return blob_name

    def generate_signed_url(
            self,
            uri: str,
            expiration_minutes: int = 15
        ) -> str:
        """
        Generates a signed URL for a GCS object.

        Parameters
        ----------
        uri : str
            The GCS URI of the object.
        expiration_minutes : int, optional
            The validity period of the signed URL in minutes (default is 15).

        Returns
        -------
        str
            The signed URL for accessing the object.
        """

        blob_name = self.get_blob_name(uri)
        blob = self.bucket.blob(blob_name)

        expiration = datetime.now(timezone.utc) + timedelta(minutes=expiration_minutes)
        signed_url = blob.generate_signed_url(
            expiration=expiration,
            method="GET"
        )

        return signed_url

    def delete_from_gcs(
            self,
            uri: str
        ) -> None:
        """
        Deletes an object from Google Cloud Storage.

        Parameters
        ----------
        uri : str
            The GCS URI of the object to delete.
        """

        blob_name = self.get_blob_name(uri)
        blob = self.bucket.blob(blob_name)
        blob.delete()

    def delete_directory_from_gcs(
            self,
            directory_path: str
        ) -> None:
        """
        Deletes all objects within a directory in Google Cloud Storage.

        Parameters
        ----------
        directory_path : str
            The directory path in the bucket. Should end with a '/'.
        """

        if not directory_path.endswith('/'):
            directory_path += '/'

        blobs = self.bucket.list_blobs(prefix=directory_path)
        for blob in blobs:
            blob.delete()
