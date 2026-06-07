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
from app.middleware.auth_middleware import get_current_user

router = APIRouter(
    prefix="/menu-items",
    tags=["Menu Items"]
)


@router.get("")
def get_menu_items(
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        items = MenuItemService.get_all_items()
    elif user["role"] == CLIENT_ADMIN:
        items = [
            item
            for item in MenuItemService.get_all_items()
            if item["tenant_id"] == user["tenant_id"]
        ]
    else:
        items = MenuItemService.get_branch_items(
            user["branch_id"]
        )

    return success_response(
        "Menu items fetched successfully",
        items
    )


@router.get("/branch/{branch_id}")
def get_branch_menu_items(
    branch_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    get_scoped_branch(user, branch_id)

    items = MenuItemService.get_branch_items(
        branch_id
    )

    return success_response(
        "Branch menu items fetched successfully",
        items
    )


@router.post("")
def create_menu_item(
    payload: MenuItemCreateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])
    branch = get_scoped_branch(user, payload.branch_id)

    if payload.tenant_id != branch["tenant_id"]:
        return error_response("Tenant and branch do not match", 403)

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
    payload: MenuItemUpdateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])

    existing_items = [
        item
        for item in MenuItemService.get_all_items()
        if item["id"] == item_id
    ]

    if not existing_items:
        return error_response("Menu item not found", 404)

    get_scoped_branch(user, existing_items[0]["branch_id"])

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
    item_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])

    existing_items = [
        item
        for item in MenuItemService.get_all_items()
        if item["id"] == item_id
    ]

    if not existing_items:
        return error_response("Menu item not found", 404)

    get_scoped_branch(user, existing_items[0]["branch_id"])

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
