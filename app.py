"""QR Studio Streamlit entrypoint."""

from collections.abc import Mapping

import streamlit as st

from qr_studio.api.qr_api import generate_qr_response
from qr_studio.config import settings
from qr_studio.errors import QRStudioError
from qr_studio.state import (
    has_handled_nonce,
    initialize_state,
    remember_nonce,
    set_qr_response,
)
from qr_studio.ui.component import declare_qr_component
from qr_studio.ui.styles import apply_shell_styles


def _handle_component_event(event: object) -> None:
    if not isinstance(event, Mapping) or event.get("action") != "generate":
        return

    nonce = event.get("nonce")
    if not isinstance(nonce, str) or has_handled_nonce(nonce):
        return

    remember_nonce(nonce)
    try:
        set_qr_response(generate_qr_response(event))
    except QRStudioError as exc:
        set_qr_response({"nonce": nonce, "ok": False, "error": str(exc)})
    except (ValueError, TypeError, OSError) as exc:
        set_qr_response(
            {
                "nonce": nonce,
                "ok": False,
                "error": str(exc) or "QR generation failed",
            }
        )
    st.rerun()


def main() -> None:
    st.set_page_config(
        page_title=settings.page_title,
        page_icon=settings.page_icon,
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    apply_shell_styles()
    initialize_state()

    qr_component = declare_qr_component(
        settings.component_name,
        settings.frontend_directory,
    )
    event = qr_component(
        qr_response=st.session_state.qr_response,
        height=settings.component_height,
        default=None,
        key="qr_studio_ui",
    )
    _handle_component_event(event)


if __name__ == "__main__":
    main()
