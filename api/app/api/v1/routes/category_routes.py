from fastapi import APIRouter, Depends

from app.constants.roles import (
    BRANCH_MANAGER,
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.core.access_control import (
    get_authenticated_user,
    get_scoped_branch,
    require_roles
)
from app.schemas.category_schema import (
    CategoryCreateSchema,
    CategoryUpdateSchema
)

from app.services.category_service import (
    CategoryService
)

from app.core.responses import (
    success_response,
    error_response
)
from app.middleware.auth_middleware import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.get("")
def get_categories(
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        categories = CategoryService.get_all_categories()
    elif user["role"] == CLIENT_ADMIN:
        categories = [
            category
            for category in CategoryService.get_all_categories()
            if category["tenant_id"] == user["tenant_id"]
        ]
    else:
        categories = CategoryService.get_branch_categories(
            user["branch_id"]
        )

    return success_response(
        "Categories fetched successfully",
        categories
    )


@router.get("/branch/{branch_id}")
def get_branch_categories(
    branch_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    get_scoped_branch(user, branch_id)

    categories = CategoryService.get_branch_categories(
        branch_id
    )

    return success_response(
        "Branch categories fetched successfully",
        categories
    )


@router.post("")
def create_category(
    payload: CategoryCreateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])
    branch = get_scoped_branch(user, payload.branch_id)

    if payload.tenant_id != branch["tenant_id"]:
        return error_response("Tenant and branch do not match", 403)

    category = CategoryService.create_category(
        payload
    )

    return success_response(
        "Category created successfully",
        category
    )


@router.put("/{category_id}")
def update_category(
    category_id: int,
    payload: CategoryUpdateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])

    existing_categories = [
        category
        for category in CategoryService.get_all_categories()
        if category["id"] == category_id
    ]

    if not existing_categories:
        return error_response("Category not found", 404)

    get_scoped_branch(user, existing_categories[0]["branch_id"])

    category = CategoryService.update_category(
        category_id,
        payload
    )

    if not category:
        return error_response(
            "Category not found",
            404
        )

    return success_response(
        "Category updated successfully",
        category
    )


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])

    existing_categories = [
        category
        for category in CategoryService.get_all_categories()
        if category["id"] == category_id
    ]

    if not existing_categories:
        return error_response("Category not found", 404)

    get_scoped_branch(user, existing_categories[0]["branch_id"])

    deleted = CategoryService.delete_category(
        category_id
    )

    if not deleted:
        return error_response(
            "Category not found",
            404
        )

    return success_response(
        "Category deleted successfully"
    )
