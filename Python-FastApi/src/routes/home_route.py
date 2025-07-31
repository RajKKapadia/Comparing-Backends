from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/status")
async def handle_get_status():
    return "OK"
