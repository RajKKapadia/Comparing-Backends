from sqlalchemy import Column, String, Boolean

from src.models.base_model import Base, generate_uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(511), primary_key=True, default=generate_uuid)
    email = Column(String(127), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
