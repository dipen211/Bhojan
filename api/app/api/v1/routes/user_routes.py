from typing import Optional

from fastapi import APIRouter, Query

from app.core.responses import (
    error_response,
    success_response
)
from app.schemas.user_schema import (
    UserCreateSchema,
    UserUpdateSchema
)
from app.services.user_service import (
    UserService
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("")
def get_users(
    role: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    branch_id: Optional[int] = Query(None)
):

    users = UserService.get_users(
        role,
        tenant_id,
        branch_id
    )

    return success_response(
        "Users fetched successfully",
        users
    )


@router.get("/{user_id}")
def get_user(user_id: int):
    user = UserService.get_user_by_id(user_id)

    if not user:
        return error_response(
            "User not found",
            404
        )

    return success_response(
        "User fetched successfully",
        user
    )


@router.post("")
def create_user(payload: UserCreateSchema):
    existing_user = UserService.get_raw_user_by_email(
        payload.email
    )

    if existing_user:
        return error_response(
            "User already exists"
        )

    user = UserService.create_user(payload)

    return success_response(
        "User created successfully",
        user
    )


@router.put("/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdateSchema
):
    user = UserService.update_user(
        user_id,
        payload
    )

    if not user:
        return error_response(
            "User not found",
            404
        )

    return success_response(
        "User updated successfully",
        user
    )


@router.delete("/{user_id}")
def delete_user(user_id: int):
    deleted = UserService.delete_user(user_id)

    if not deleted:
        return error_response(
            "User not found",
            404
        )

    return success_response(
        "User deleted successfully"
    )
