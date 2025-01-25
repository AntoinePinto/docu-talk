import ast
import json

import regex

class UnfoundPattern(Exception):
    
    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

def extract_pattern(
        text: str,
        patterns: list,
        *args
    ):
    """
    Extracts the first matching pattern from the given text.

    Parameters
    ----------
    text : str
        The input text to search in.
    patterns : list
        A list of regex patterns to match.

    Returns
    -------
    str
        The first matching pattern.

    Raises
    ------
    UnfoundPattern
        If no matching pattern is found.
    """

    for pattern in patterns:
        match = regex.search(pattern, text, *args)
        if match is not None:
            return match.group(0)
    
    raise UnfoundPattern("Pattern not found")

def parse_str(text: str):
    """
    Parses a string into a Python object using `ast.literal_eval` or `json.loads`.

    Parameters
    ----------
    text : str
        The input string to parse.

    Returns
    -------
    Any
        The parsed Python object.

    Raises
    ------
    UnfoundPattern
        If the string cannot be parsed.
    """

    for parser in (ast.literal_eval, json.loads):
    
        try:
            return parser(text)
        except (SyntaxError, ValueError, json.decoder.JSONDecodeError):
            continue
    
    raise UnfoundPattern("Pattern not found")

def correct_dict(d: dict):
    """
    Converts string boolean values in a dictionary to actual boolean values.

    Parameters
    ----------
    d : dict
        The input dictionary.

    Returns
    -------
    dict
        The corrected dictionary with boolean values.
    """

    for k, v in d.items():
        if v == "False":
            d[k] = False
        elif v == "True":
            d[k] = True

    return d

def extract_dict(text: str):
    """
    Extracts a dictionary from a text string.

    Parameters
    ----------
    text : str
        The input text containing a dictionary.

    Returns
    -------
    dict
        The extracted dictionary.

    Raises
    ------
    UnfoundPattern
        If no dictionary pattern is found or parsing fails.
    """

    try:
        d = parse_str(text)
        if not isinstance(d, dict):
            raise UnfoundPattern("Unfound Pattern")
    except UnfoundPattern:
        pattern = extract_pattern(
            text=text,
            patterns=[r"\{(?:[^{}]|(?R))*\}", r"\{\n([\s\S]*?)\n\}", r"\{([\s\S]*?)\}"]
        )
        d = parse_str(pattern)
        
    d = correct_dict(d)

    return d

def extract_list(text):
    """
    Extracts a list from a text string.

    Parameters
    ----------
    text : str
        The input text containing a list.

    Returns
    -------
    list
        The extracted list.

    Raises
    ------
    UnfoundPattern
        If no list pattern is found or parsing fails.
    """
    
    try:
        pattern = extract_pattern(text, [r'\[\[.*?\]\]', r'\[.*?\]'], regex.DOTALL)
        return parse_str(pattern)
    except UnfoundPattern:
        return []
    
def extract_list_of_dicts(text):
    """
    Extracts a list of dictionaries from a text string.

    Parameters
    ----------
    text : str
        The input text containing a list of dictionaries.

    Returns
    -------
    list of dict
        The extracted list of dictionaries.
    """
    
    try:
        parsed_text = parse_str(text)
        if isinstance(parsed_text, list):
            return parsed_text
        elif isinstance(parsed_text, dict):
            return [parsed_text]
        else:
            raise UnfoundPattern("Unfound Pattern")
    except UnfoundPattern:
        pass

    dict_list = []
    patterns = regex.findall(r"\{[\s\S]*?\}", text)
    for pattern in patterns:
        try:
            parsed_text = parse_str(pattern)
            if isinstance(parsed_text, dict):
                dict_list.append(parsed_text)
        except UnfoundPattern:
            continue

    dict_list = [correct_dict(d) for d in dict_list]

    return dict_list

if __name__ == '__main__':

    texts_dict = [
        (
            "Some text before the dictionary {\"key1\": \"value1\", \"key2\": "
            "\"value2\"} and some text after."
        ),
        "Here is a dict: {\"is_active\": \"True\", \"is_deleted\": \"False\"}",
        "Start: {'user': 'admin', 'password': '1234'} End.",
        (
            "Data contains: {\"user\": {\"name\": \"Alice\", \"age\": 30}, "
            "\"active\": \"True\"}"
        ),
        "Here is the data:\n{\n\"key1\": \"value1\",\n\"key2\": \"value2\"\n}",
        (
            "Info: {\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", "
            "\"active\": \"True\"}"
        ),
        "Numbers and types: {\"age\": 25, \"score\": 99.5, \"active\": \"False\"}",
        "First dict: {\"a\": 1} and second dict: {\"b\": 2}"
    ]

    for text in texts_dict:
        extracted_dicts = extract_dict(text)
        print(extracted_dicts)

    texts_list = [
        "Here is a list: [1, 2, 3, 4, 5] with some additional text.",
        "Numbers in a list: [10, 20, 30, 40].",
        "A mixed list: [\"apple\", 42, True, 3.14].",
        "Nested list: [[1, 2], [3, 4], [5, 6]].",
        "This text has no list to extract.",
        "Empty list: [].",
        "Some data: [\"item1\", \"item2\", \"item3\"] and more info.",
        "list: [1, 2, 'three', 4]."
    ]

    for text in texts_list:
        extracted_list = extract_list(text)
        print(extracted_list)

    texts_list_of_dicts = [
        "Here is a list of dicts: [{\"key1\": \"value1\"}, {\"key2\": \"value2\"}].",
        (
            "Nested dictionaries: [{\"user\": {\"name\": \"Alice\"}}, "
            "{\"settings\": {\"theme\": \"dark\"}}]."
        ),
        (
            "Multiple dicts: {\"key1\": \"value1\"}, {\"key2\": \"value2\"}, "
            "and {\"key3\": \"value3\"}."
        ),
        "Single dict in text: {\"name\": \"John Doe\", \"age\": 30}.",
        "Dictionary with booleans: [{\"active\": \"True\"}, {\"deleted\": \"False\"}].",
    ]

    for text in texts_list_of_dicts:
        extracted_list_of_dicts = extract_list_of_dicts(text)
        print(extracted_list_of_dicts)