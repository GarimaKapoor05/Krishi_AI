import os
from dotenv import load_dotenv

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_DATABASE_URL = os.getenv("DATABASE_URL")
_APP_ENV = (os.getenv("APP_ENV") or os.getenv("FLASK_ENV") or "development").strip().lower()
_SECRET_KEY = os.getenv("SECRET_KEY")
_JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if _APP_ENV == "production":
    _missing_secrets = [
        name for name, value in (("SECRET_KEY", _SECRET_KEY), ("JWT_SECRET_KEY", _JWT_SECRET_KEY))
        if not value or value in {"dev-secret-key", "dev-jwt-key"}
    ]
    if _missing_secrets:
        raise RuntimeError(
            "Production requires unique SECRET_KEY and JWT_SECRET_KEY values; missing/unsafe: "
            + ", ".join(_missing_secrets)
        )


class Config:
    # Development defaults keep local setup simple. Production fails closed above.
    SECRET_KEY = _SECRET_KEY or "dev-secret-key"
    JWT_SECRET_KEY = _JWT_SECRET_KEY or "dev-jwt-key"

    SQLALCHEMY_DATABASE_URI = (
        _DATABASE_URL
        or "sqlite:///" + os.path.join(_BASE_DIR, "instance", "krishiai.db")
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Postgres-only pool tuning + SSL. SQLite (local dev) uses defaults.
    if _DATABASE_URL:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 5,
            "max_overflow": 2,
            "connect_args": {
                "sslmode": "require",
                "connect_timeout": 30,
            },
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
