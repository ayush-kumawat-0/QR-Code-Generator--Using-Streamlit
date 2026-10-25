"""QR image generation service."""

import base64
import binascii
import io

import qrcode
from PIL import Image, UnidentifiedImageError
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers import CircleModuleDrawer, RoundedModuleDrawer

from .errors import InvalidRequestError


def _adaptive_box_size(matrix_size: int) -> int:
    if matrix_size <= 0:
        return 10
    target_pixels = 960
    return max(2, min(10, target_pixels // matrix_size))


def _hex_rgb(value: str) -> tuple[int, int, int]:
    raw = (value or "").lstrip("#")
    if len(raw) != 6:
        raise InvalidRequestError("Colors must be six-digit hexadecimal values")
    try:
        return tuple(int(raw[index:index + 2], 16) for index in (0, 2, 4))
    except ValueError as exc:
        raise InvalidRequestError("Colors must be valid hexadecimal values") from exc


def _add_logo(image: Image.Image, logo_data: str) -> Image.Image:
    if not logo_data:
        return image

    raw = logo_data.split(",", 1)[-1]
    try:
        logo = Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGBA")
    except (binascii.Error, ValueError, UnidentifiedImageError) as exc:
        raise InvalidRequestError("The uploaded logo is not a valid image") from exc

    logo_size = int(image.width * 0.15)
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    position = ((image.width - logo.width) // 2, (image.height - logo.height) // 2)
    image.alpha_composite(logo, position)
    return image


def generate_png(
    content: str,
    foreground: str,
    background: str,
    dot_style: str,
    logo_data: str,
) -> bytes:
    """Generate a PNG QR image from an encoded payload."""
    if not content or not content.strip():
        raise InvalidRequestError("Content is required")

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=1,
        border=1,
    )
    qr.add_data(content)
    qr.make(fit=True)
    qr.box_size = _adaptive_box_size(len(qr.get_matrix()))

    if dot_style == "rounded":
        image = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(radius_ratio=0.8),
            color_mask=SolidFillColorMask(
                front_color=_hex_rgb(foreground),
                back_color=_hex_rgb(background),
            ),
        )
    elif dot_style == "soft":
        image = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=CircleModuleDrawer(),
            color_mask=SolidFillColorMask(
                front_color=_hex_rgb(foreground),
                back_color=_hex_rgb(background),
            ),
        )
    else:
        image = qr.make_image(fill_color=foreground, back_color=background)

    output = io.BytesIO()
    _add_logo(image.convert("RGBA"), logo_data).save(output, format="PNG")
    return output.getvalue()
