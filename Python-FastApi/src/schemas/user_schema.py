from pydantic import BaseModel


class AuthUser(BaseModel):
    email: str
    password: str


class NewUser(BaseModel):
    email: str
    hashed_password: str


class CurrentUser(NewUser):
    session_id: str = None

    class Config:
        from_attributes = True


class SessionData(BaseModel):
    user_id: str
    last_used_at: float


class SessionResponse(BaseModel):
    session_id: str
