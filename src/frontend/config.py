import json
import os

from utils.file_io import get_encoded_image, recursive_read

LOGO_PATH = os.path.join(os.path.dirname(__file__), "assets", "logo_docu_talk.png")
ENCODED_LOGO = get_encoded_image(path=LOGO_PATH)
BASE_URL = os.getenv("BASE_URL")

TEXTS = recursive_read(
    folder=os.path.join(os.path.dirname(__file__), "assets", "texts"),
    extensions=(".md")
)

path = os.path.join(os.path.dirname(__file__), "config.json")
with open(path) as f:
    CONFIG = json.load(f)

DISPLAY_GUEST_MODE = CONFIG["display_guest_mode"]
TOKEN_EXPIRATION_HOURS = CONFIG["token_expiration_hours"]
BASIC_MODEL_NAME = CONFIG["models"]["basic"]
PREMIUM_MODEL_NAME = CONFIG["models"]["premium"]
USER_PERIOD_DOLLAR_AMOUNT = CONFIG["credits"]["period_dollar_amount"]["user"]
GUEST_PERIOD_DOLLAR_AMOUNT = CONFIG["credits"]["period_dollar_amount"]["guest"]
CREDIT_EXCHANGE_RATE = CONFIG["credits"]["credit_exchange_rate"]
MAX_ICON_FILE_SIZE = CONFIG["limits"]["max_icon_file_size"]
MAX_NB_DOC_PER_CHATBOT = CONFIG["limits"]["max_nb_doc_per_chatbot"]
MAX_NB_PAGES_PER_CHATBOT = CONFIG["limits"]["max_nb_pages_per_chatbot"]
