import random
import re
import string

from bcrypt import hashpw, gensalt, checkpw

def is_valid_email(email: str):
    """
    Validates whether the provided string is a properly formatted email address.

    Parameters
    ----------
    email : str
        The email address to validate.

    Returns
    -------
    bool
        True if the email address is valid, False otherwise.
    """

    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, email) is not None

def generate_password(length: int = 12):
    """
    Generates a random password with a specified length, ensuring it includes at least 
    one character from each of the following categories: uppercase letters, lowercase 
    letters, digits, and special characters.

    Parameters
    ----------
    length : int, optional
        The length of the password to generate (default is 12).

    Returns
    -------
    str
        The generated password.
    """
    
    list_character_types = [
        "!@#$%&*?",
        string.ascii_uppercase, 
        string.ascii_lowercase, 
        string.digits
    ]
    
    character_pool, password = "", []
    for character_types in list_character_types:
        password.append(random.choice(character_types))
        character_pool += character_types      
    
    while len(password) < length:
        password.append(random.choice(character_pool))
    
    random.shuffle(password)
    
    return ''.join(password)

def hash_password(password: str):
    """
    Hashes a password using bcrypt.

    Parameters
    ----------
    password : str
        The plaintext password to hash.

    Returns
    -------
    bytes
        The hashed password.
    """

    return hashpw(password.encode('utf-8'), gensalt())

def verify_password(
        password: str, 
        hashed: str
    ):
    """
    Verifies a plaintext password against a hashed password.

    Parameters
    ----------
    password : str
        The plaintext password to verify.
    hashed : str
        The hashed password to compare against.

    Returns
    -------
    bool
        True if the password matches the hash, False otherwise.
    """
    
    return checkpw(password.encode('utf-8'), hashed)