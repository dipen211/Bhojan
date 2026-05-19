from fastapi import APIRouter

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

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.get("")
def get_categories():

    categories = CategoryService.get_all_categories()

    return success_response(
        "Categories fetched successfully",
        categories
    )


@router.get("/branch/{branch_id}")
def get_branch_categories(
    branch_id: int
):

    categories = CategoryService.get_branch_categories(
        branch_id
    )

    return success_response(
        "Branch categories fetched successfully",
        categories
    )


@router.post("")
def create_category(
    payload: CategoryCreateSchema
):

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
    payload: CategoryUpdateSchema
):

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
    category_id: int
):

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