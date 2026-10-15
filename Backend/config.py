import os
from dotenv import load_dotenv

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_DATABASE_URL = os.getenv("DATABASE_URL")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-key")

    SQLALCHEMY_DATABASE_URI = (
        _DATABASE_URL
        or "sqlite:///" + os.path.join(_BASE_DIR, "instance", "krishimitra.db")
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
                "connect_timeout": 10,
            },
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
