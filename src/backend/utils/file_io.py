import base64
import os

from typing import Dict, Any

import fitz

from easyenvi import file

def recursive_read(
        folder: str, 
        extensions: tuple[str] = (".sql",),
        remove_extension_in_key_name: bool = True
    ) -> Dict[str, Any]:
    """
    Recursively reads files in a folder with specified extensions and returns their 
    content.

    Parameters
    ----------
    folder : str
        The folder path to read files from.
    extensions : tuple of str, optional
        File extensions to include (default is (".sql",)).
    remove_extension_in_key_name : bool, optional
        Whether to exclude file extensions in the dictionary keys (default is True).

    Returns
    -------
    dict
        A dictionary where keys are file names (or folder names for nested structures) 
        and values are file contents or nested dictionaries.
    """
    
    result: Dict[str, Any] = {}
    
    for item in os.listdir(folder):
        item_path = os.path.join(folder, item)
        if os.path.isdir(item_path):
            result[item] = recursive_read(item_path, extensions=extensions)
        else:
            name, extension = os.path.splitext(item)
            
            if extension.endswith(extensions):
                
                if remove_extension_in_key_name:
                    key = name
                else:
                    key = item

                if extension == ".html":
                    with open(item_path, "r", encoding="utf-8") as f:
                        result[key] = f.read()
                else:
                    result[key] = file.load(item_path)
    
    return result

def get_encoded_image(path):
    """
    Encodes an image file in base64 format.

    Parameters
    ----------
    path : str
        The file path to the image.

    Returns
    -------
    str
        The base64-encoded string representation of the image.
    """

    with open(path, "rb") as f:            
        encoded_image = base64.b64encode(f.read()).decode()

    return encoded_image

def get_nb_pages_pdf(pdf_bytes):
    """
    Retrieves the number of pages in a PDF document.

    Parameters
    ----------
    pdf_bytes : bytes
        The binary content of the PDF file.

    Returns
    -------
    int
        The number of pages in the PDF document.
    """
    
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    return pdf_document.page_count