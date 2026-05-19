from fastapi import APIRouter

from app.schemas.menu_item_schema import (
    MenuItemCreateSchema,
    MenuItemUpdateSchema
)

from app.services.menu_item_service import (
    MenuItemService
)

from app.core.responses import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/menu-items",
    tags=["Menu Items"]
)


@router.get("")
def get_menu_items():

    items = MenuItemService.get_all_items()

    return success_response(
        "Menu items fetched successfully",
        items
    )


@router.get("/branch/{branch_id}")
def get_branch_menu_items(
    branch_id: int
):

    items = MenuItemService.get_branch_items(
        branch_id
    )

    return success_response(
        "Branch menu items fetched successfully",
        items
    )


@router.post("")
def create_menu_item(
    payload: MenuItemCreateSchema
):

    item = MenuItemService.create_item(
        payload
    )

    return success_response(
        "Menu item created successfully",
        item
    )


@router.put("/{item_id}")
def update_menu_item(
    item_id: int,
    payload: MenuItemUpdateSchema
):

    item = MenuItemService.update_item(
        item_id,
        payload
    )

    if not item:
        return error_response(
            "Menu item not found",
            404
        )

    return success_response(
        "Menu item updated successfully",
        item
    )


@router.delete("/{item_id}")
def delete_menu_item(
    item_id: int
):

    deleted = MenuItemService.delete_item(
        item_id
    )

    if not deleted:
        return error_response(
            "Menu item not found",
            404
        )

    return success_response(
        "Menu item deleted successfully"
    )