"""Scalable request boundary for QR generation."""

import base64
from collections.abc import Mapping

from ..errors import InvalidRequestError
from ..qr_generator import generate_png


def generate_qr_response(request: Mapping[str, object]) -> dict[str, object]:
    """Validate a component request and return a serializable response."""
    nonce = request.get("nonce")
    if not isinstance(nonce, str) or not nonce:
        raise InvalidRequestError("Request nonce is required")

    content = request.get("content")
    if not isinstance(content, str) or not content.strip():
        raise InvalidRequestError("Content is required")

    png = generate_png(
        content.strip(),
        str(request.get("foreground") or "#000000"),
        str(request.get("background") or "#ffffff"),
        str(request.get("dot_style") or "square"),
        str(request.get("logo") or ""),
    )
    return {
        "nonce": nonce,
        "ok": True,
        "image": "data:image/png;base64," + base64.b64encode(png).decode("ascii"),
    }
