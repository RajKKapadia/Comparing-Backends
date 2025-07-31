from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func

from src.models.user_model import User
from src.models.base_model import Base, generate_uuid


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(String(511), primary_key=True, default=generate_uuid)
    original_url = Column(Text)
    short_code = Column(String(15), unique=True, index=True)
    visit_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(String(511), ForeignKey(User.id))
