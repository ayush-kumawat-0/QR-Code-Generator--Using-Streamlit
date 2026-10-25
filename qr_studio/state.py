"""Streamlit session-state management."""

from typing import Any

import streamlit as st


def initialize_state() -> None:
    """Initialize state keys without overwriting an active request."""
    if "qr_response" not in st.session_state:
        st.session_state.qr_response = None
    if "handled_nonce" not in st.session_state:
        st.session_state.handled_nonce = None


def has_handled_nonce(nonce: Any) -> bool:
    return bool(nonce) and nonce == st.session_state.handled_nonce


def remember_nonce(nonce: str) -> None:
    st.session_state.handled_nonce = nonce


def set_qr_response(response: dict[str, object]) -> None:
    st.session_state.qr_response = response
