"""Frontend component integration."""

from pathlib import Path
from typing import Any

import streamlit.components.v1 as components


def declare_qr_component(name: str, frontend_directory: Path) -> Any:
    """Declare the local QR Studio frontend component."""
    if not frontend_directory.is_dir():
        raise FileNotFoundError(f"Frontend directory not found: {frontend_directory}")
    return components.declare_component(name, path=str(frontend_directory))
