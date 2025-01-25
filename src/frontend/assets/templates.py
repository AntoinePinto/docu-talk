import base64
import json
import os

from string import Template

active_dir = os.path.dirname(__file__)

# remaining_credits_html
path = os.path.join(active_dir, "remaining_credits.html")
with open(path, "r", encoding="utf-8") as f:
    remaining_credits_html = f.read()

# about_html
path = os.path.join(active_dir, "about", "about.html")
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

path = os.path.join(active_dir, "about", "photo.jpg")
with open(path, "rb") as f:
    encoded_string = base64.b64encode(f.read()).decode()

about_html = Template(html).substitute(image=encoded_string)

# waiting_tips
path = os.path.join(active_dir, "waiting_tips", "waiting_tips.json")
with open(path, encoding="utf-8") as f:
    waiting_tips = json.load(f)

# waiting_tips_template
path = os.path.join(active_dir, "waiting_tips", "waiting_tips_template.html")
with open(path, encoding="utf-8") as f:
    waiting_tips_template = f.read()

__all__ = [
    "remaining_credits_html",
    "about_html",
    "waiting_tips",
    "waiting_tips_template"
]
