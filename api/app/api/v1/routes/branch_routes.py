from fastapi import APIRouter, Depends

from app.constants.roles import (
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.core.access_control import (
    enforce_tenant_scope,
    get_authenticated_user,
    get_scoped_branch,
    require_roles
)
from app.middleware.auth_middleware import get_current_user
from app.schemas.branch_schema import (
    BranchCreateSchema,
    BranchUpdateSchema
)

from app.services.branch_service import (
    BranchService
)

from app.core.responses import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/branches",
    tags=["Branches"]
)


@router.get("")
def get_branches(
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        branches = BranchService.get_all_branches()
    elif user["role"] == CLIENT_ADMIN:
        branches = BranchService.get_tenant_branches(
            user["tenant_id"]
        )
    elif user.get("branch_id") is not None:
        branch = get_scoped_branch(
            user,
            user["branch_id"]
        )
        branches = [branch]
    else:
        branches = []

    return success_response(
        "Branches fetched successfully",
        branches
    )


@router.get("/{branch_id}")
def get_branch(
    branch_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    branch = get_scoped_branch(user, branch_id)

    return success_response(
        "Branch fetched successfully",
        branch
    )


@router.get("/tenant/{tenant_id}")
def get_tenant_branches(
    tenant_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    enforce_tenant_scope(user, tenant_id)

    branches = BranchService.get_tenant_branches(
        tenant_id
    )

    return success_response(
        "Tenant branches fetched successfully",
        branches
    )


@router.post("")
def create_branch(
    payload: BranchCreateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN])
    enforce_tenant_scope(user, payload.tenant_id)

    branch = BranchService.create_branch(
        payload
    )

    return success_response(
        "Branch created successfully",
        branch
    )


@router.put("/{branch_id}")
def update_branch(
    branch_id: int,
    payload: BranchUpdateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN])
    get_scoped_branch(user, branch_id)

    branch = BranchService.update_branch(
        branch_id,
        payload
    )

    if not branch:
        return error_response(
            "Branch not found",
            404
        )

    return success_response(
        "Branch updated successfully",
        branch
    )


@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN])
    get_scoped_branch(user, branch_id)

    deleted = BranchService.delete_branch(
        branch_id
    )

    if not deleted:
        return error_response(
            "Branch not found",
            404
        )

    return success_response(
        "Branch deleted successfully"
    )
