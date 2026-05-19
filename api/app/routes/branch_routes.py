from fastapi import APIRouter

from app.schemas.branch_schema import BranchCreateSchema
from app.services.branch_service import BranchService
from app.utils.response import success_response

router = APIRouter(
    prefix="/branches",
    tags=["Branches"]
)


@router.get("")
def get_branches():
    branches = BranchService.get_all_branches()

    return success_response(
        message="Branches fetched successfully",
        data=branches
    )


@router.post("")
def create_branch(payload: BranchCreateSchema):
    branch = BranchService.create_branch(payload)

    return success_response(
        message="Branch created successfully",
        data=branch
    )