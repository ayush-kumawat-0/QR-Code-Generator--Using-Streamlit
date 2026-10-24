"""Domain errors used by QR Studio."""


class QRStudioError(Exception):
    """Base class for expected QR Studio errors."""


class InvalidRequestError(QRStudioError):
    """Raised when a frontend generation request is invalid."""
