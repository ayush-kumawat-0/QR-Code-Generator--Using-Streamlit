"""Application configuration loaded from environment variables."""

from dataclasses import dataclass
import os
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    page_title: str = "QR Studio"
    page_icon: str = "⌁"
    component_name: str = "qr_studio"
    component_height: int = 900

    @classmethod
    def from_environment(cls) -> "Settings":
        height = os.getenv("QR_STUDIO_COMPONENT_HEIGHT", str(cls.component_height))
        try:
            component_height = int(height)
        except ValueError as exc:
            raise ValueError(
                "QR_STUDIO_COMPONENT_HEIGHT must be a positive integer"
            ) from exc
        if component_height <= 0:
            raise ValueError("QR_STUDIO_COMPONENT_HEIGHT must be a positive integer")

        return cls(
            page_title=os.getenv("QR_STUDIO_PAGE_TITLE", cls.page_title),
            page_icon=os.getenv("QR_STUDIO_PAGE_ICON", cls.page_icon),
            component_name=os.getenv("QR_STUDIO_COMPONENT_NAME", cls.component_name),
            component_height=component_height,
        )

    @property
    def frontend_directory(self) -> Path:
        return Path(__file__).resolve().parent.parent / "frontend"


settings = Settings.from_environment()
