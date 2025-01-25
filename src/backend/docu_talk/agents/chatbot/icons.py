import io
import os

from PIL import Image, ImageDraw, ImageFont

def get_icon_bytes(
        icon_id: str,
        size: int = 256,
        color: str = "black"
    ) -> bytes:
    """
    Generates an icon as a PNG image and returns its binary representation.

    Parameters
    ----------
    icon_id : str
        The Unicode identifier for the icon, represented as a hexadecimal string.
    size : int, optional
        The size (width and height) of the generated icon in pixels (default is 256).
    color : str, optional
        The color of the icon (default is "black").

    Returns
    -------
    bytes
        The binary content of the generated PNG icon.
    """

    font_path = os.path.join(
        os.path.dirname(__file__),
        "src",
        "MaterialIcons-Regular.ttf"
    )

    # Load the font
    font = ImageFont.truetype(font_path, size)

    # Create a blank image with a transparent background
    image = Image.new("RGBA", (size, size), (255, 255, 255, 0))

    # Draw the icon on the image
    draw = ImageDraw.Draw(image)
    text_bbox = draw.textbbox((0, 0), text=chr(int("0x" + icon_id, 16)), font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    draw.text(
        ((size - text_width) / 2, (size - text_height) / 2),
        text=chr(int("0x" + icon_id, 16)),  # Icon unicode
        font=font,
        fill=color
    )

    byte_array = io.BytesIO()
    image.save(byte_array, format="PNG")
    
    return byte_array.getvalue()
