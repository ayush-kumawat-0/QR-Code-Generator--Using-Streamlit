"""Global Streamlit shell styles."""

import streamlit as st


def apply_shell_styles() -> None:
    st.markdown(
        """<style>
html, body, .stApp, [data-testid="stAppViewContainer"], .main {
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #f3efe8 !important;
}
[data-testid="stHeader"],
[data-testid="stToolbar"],
[data-testid="stDecoration"],
[data-testid="stBottom"],
#MainMenu,
footer {
    display: none !important;
    height: 0 !important;
}
.block-container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
}
iframe {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    z-index: 999999 !important;
}
</style>""",
        unsafe_allow_html=True,
    )
