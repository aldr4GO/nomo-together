import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///momo_orders.db"
    )
    CORS_ORIGINS = ["https://nomo-frontend.vercel.app", "http://localhost:5173"]


class ProductionConfig(Config):

    SECRET_KEY = 'qazxswedcvfrtgbnhyujm'  # must be set in env
    # SECRET_KEY = os.environ.get("SECRET_KEY")  # must be set in env
    SQLALCHEMY_DATABASE_URI = "postgresql://momo_orders_db_user:WtwwVZ0Z3cqBkWyJpasBrNeNKs8O6ogt@dpg-d568t7mmcj7s73fonjlg-a/momo_orders_db"
    # SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    # CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    CORS_ORIGINS = ["https://nomo-frontend.vercel.app", "http://localhost:5173"]

    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY must be set in production")

