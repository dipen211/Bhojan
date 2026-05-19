from fastapi import (
    APIRouter,
    Depends
)

from app.middleware.auth_middleware import (
    get_current_user
)

from app.middleware.permission_middleware import (
    require_permission
)

from app.core.responses import (
    success_response
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    user = Depends(get_current_user)
):

    require_permission(
        "view_reports"
    )(user)

    return success_response(
        "Admin dashboard fetched successfully",
        {
            "user": user
        }
    )