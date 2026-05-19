from fastapi import HTTPException

from app.utils.permissions import (
    ROLE_PERMISSIONS
)


def require_permission(
    permission: str
):

    def permission_checker(user):

        role = user.get("role")

        permissions = ROLE_PERMISSIONS.get(
            role,
            []
        )

        if "*" in permissions:
            return user

        if permission not in permissions:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        return user

    return permission_checker