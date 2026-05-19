from fastapi import APIRouter

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
def get_branches():

    branches = BranchService.get_all_branches()

    return success_response(
        "Branches fetched successfully",
        branches
    )


@router.get("/{branch_id}")
def get_branch(branch_id: int):

    branch = BranchService.get_branch_by_id(
        branch_id
    )

    if not branch:
        return error_response(
            "Branch not found",
            404
        )

    return success_response(
        "Branch fetched successfully",
        branch
    )


@router.get("/tenant/{tenant_id}")
def get_tenant_branches(
    tenant_id: int
):

    branches = BranchService.get_tenant_branches(
        tenant_id
    )

    return success_response(
        "Tenant branches fetched successfully",
        branches
    )


@router.post("")
def create_branch(
    payload: BranchCreateSchema
):

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
    payload: BranchUpdateSchema
):

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
def delete_branch(branch_id: int):

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