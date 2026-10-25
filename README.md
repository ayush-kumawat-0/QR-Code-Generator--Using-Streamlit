# QR Studio

QR Studio is a Streamlit QR generator with a responsive HTML/CSS/JavaScript
interface and a Python image-generation service.

## Features

- Website and WhatsApp QR codes
- Email, SMS, Wi-Fi, contact-card, and calendar-event QR codes
- Custom colors, dot styles, and center logos
- Adaptive QR image sizing to avoid UI layout shifts on long payloads
- PNG download and image copy
- Local browser history and light/dark themes
- Responsive layout for desktop and mobile
- Sticky section navigation with an active-section indicator and mobile menu
- Visual Features, How It Works, and FAQ sections that match the QR Studio design
- Step-by-step usage guidance and scan-quality tips

## Project structure

```text
QR-Code-Generator--Using-Streamlit-main/
├── app.py                         # Streamlit entrypoint
├── frontend/
│   └── index.html                 # UI, styles, and browser interactions
├── qr_studio/
│   ├── api/
│   │   └── qr_api.py              # Request validation and response boundary
│   ├── ui/
│   │   ├── component.py           # Streamlit component declaration
│   │   └── styles.py              # Streamlit shell styles
│   ├── config.py                  # Environment-backed settings
│   ├── errors.py                  # Expected application errors
│   ├── qr_generator.py            # QR image generation and logo handling
│   └── state.py                   # Session-state access
├── .env.example                   # Optional local configuration template
├── requirements.txt
└── README.md
```

## Run locally

```powershell
pip install -r requirements.txt
streamlit run app.py
```

The frontend is served as a local Streamlit component. QR content is
processed locally by the application and is not sent to an external API.

## Configuration

Use `.env.example` as a reference and set the variables in the shell
environment or your deployment platform. The project intentionally uses
standard-library environment access, so no additional dotenv dependency is
required.

| Variable | Purpose | Default |
|---|---|---|
| `QR_STUDIO_PAGE_TITLE` | Browser page title | `QR Studio` |
| `QR_STUDIO_PAGE_ICON` | Streamlit page icon | `⌁` |
| `QR_STUDIO_COMPONENT_NAME` | Component registration name | `qr_studio` |
| `QR_STUDIO_COMPONENT_HEIGHT` | Component iframe height | `900` |

## Architecture

The browser sends a small JSON generation request through the Streamlit
component protocol. `app.py` delegates that request to
`qr_studio.api.qr_api.generate_qr_response`, which validates the request and
calls `qr_studio.qr_generator.generate_png`. The resulting PNG is returned as
a data URL to the browser. This boundary can be reused by a future HTTP API
without moving QR-generation logic into the UI.
