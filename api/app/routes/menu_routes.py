from fastapi import APIRouter

from app.schemas.menu_schema import MenuItemCreateSchema
from app.services.menu_service import MenuService
from app.utils.response import success_response

router = APIRouter(
    prefix="/menus",
    tags=["Menus"]
)


@router.get("")
def get_menu_items():
    menu_items = MenuService.get_all_menu_items()

    return success_response(
        message="Menu items fetched successfully",
        data=menu_items
    )


@router.post("")
def create_menu_item(payload: MenuItemCreateSchema):
    item = MenuService.create_menu_item(payload)

    return success_response(
        message="Menu item created successfully",
        data=item
    )