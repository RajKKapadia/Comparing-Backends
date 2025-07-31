from fastapi import FastAPI

from src.routes.home_route import router as health_router
from src.routes.auth_route import router as auth_router
from src.routes.bookmark_route import router as bookmark_router
from src.routes.redirect_route import router as redirect_router

app = FastAPI()


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(bookmark_router)
app.include_router(redirect_router)
