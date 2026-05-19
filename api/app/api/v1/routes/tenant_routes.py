from fastapi import APIRouter, Request

from app.core.responses import (
    success_response
)

router = APIRouter(
    prefix="/tenant",
    tags=["Tenant"]
)


@router.get("")
def get_current_tenant(
    request: Request
):

    return success_response(
        "Tenant fetched successfully",
        request.state.tenant
    )