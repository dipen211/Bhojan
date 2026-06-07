from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.constants.roles import (
    BRANCH_MANAGER,
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.core.access_control import (
    get_authenticated_user,
    require_roles,
    validate_user_payload_scope
)
from app.core.responses import (
    error_response,
    success_response
)
from app.middleware.auth_middleware import get_current_user
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
    branch_id: Optional[int] = Query(None),
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        scoped_tenant_id = tenant_id
        scoped_branch_id = branch_id
    elif user["role"] == CLIENT_ADMIN:
        scoped_tenant_id = user["tenant_id"]
        scoped_branch_id = branch_id
        role = role or BRANCH_MANAGER
    else:
        scoped_tenant_id = user.get("tenant_id")
        scoped_branch_id = user.get("branch_id")

    users = UserService.get_users(
        role,
        scoped_tenant_id,
        scoped_branch_id
    )

    return success_response(
        "Users fetched successfully",
        users
    )


@router.get("/{user_id}")
def get_user(
    user_id: int,
    token_payload=Depends(get_current_user)
):
    current_user = get_authenticated_user(token_payload)
    user = UserService.get_user_by_id(user_id)

    if not user:
        return error_response(
            "User not found",
            404
        )

    if current_user["role"] == CLIENT_ADMIN:
        if user.get("tenant_id") != current_user.get("tenant_id"):
            return error_response("User not found", 404)
    elif current_user["role"] == BRANCH_MANAGER:
        if user["id"] != current_user["id"]:
            return error_response("User not found", 404)

    return success_response(
        "User fetched successfully",
        user
    )


@router.post("")
def create_user(
    payload: UserCreateSchema,
    token_payload=Depends(get_current_user)
):
    current_user = get_authenticated_user(token_payload)
    require_roles(current_user, [SUPER_ADMIN, CLIENT_ADMIN])

    if current_user["role"] == CLIENT_ADMIN and payload.role != BRANCH_MANAGER:
        return error_response("Client admin can only create branch managers", 403)

    validate_user_payload_scope(
        current_user,
        payload.tenant_id,
        payload.branch_id
    )

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
    payload: UserUpdateSchema,
    token_payload=Depends(get_current_user)
):
    current_user = get_authenticated_user(token_payload)
    require_roles(current_user, [SUPER_ADMIN, CLIENT_ADMIN])

    existing_user = UserService.get_user_by_id(user_id)

    if not existing_user:
        return error_response("User not found", 404)

    if current_user["role"] == CLIENT_ADMIN:
        if existing_user.get("tenant_id") != current_user.get("tenant_id") or existing_user["role"] != BRANCH_MANAGER:
            return error_response("User not found", 404)
        if payload.role != BRANCH_MANAGER:
            return error_response("Client admin can only manage branch managers", 403)

    validate_user_payload_scope(
        current_user,
        payload.tenant_id,
        payload.branch_id
    )

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
def delete_user(
    user_id: int,
    token_payload=Depends(get_current_user)
):
    current_user = get_authenticated_user(token_payload)
    require_roles(current_user, [SUPER_ADMIN, CLIENT_ADMIN])

    existing_user = UserService.get_user_by_id(user_id)

    if not existing_user:
        return error_response("User not found", 404)

    if current_user["role"] == CLIENT_ADMIN:
        if existing_user.get("tenant_id") != current_user.get("tenant_id") or existing_user["role"] != BRANCH_MANAGER:
            return error_response("User not found", 404)

    deleted = UserService.delete_user(user_id)

    if not deleted:
        return error_response(
            "User not found",
            404
        )

    return success_response(
        "User deleted successfully"
    )
