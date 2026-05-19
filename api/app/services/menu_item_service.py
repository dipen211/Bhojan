from app.repositories.menu_item_repository import (
    MenuItemRepository
)


class MenuItemService:

    @staticmethod
    def get_all_items():
        return MenuItemRepository.find_all()

    @staticmethod
    def get_branch_items(
        branch_id: int
    ):
        return MenuItemRepository.find_by_branch_id(
            branch_id
        )

    @staticmethod
    def create_item(payload):
        return MenuItemRepository.create(
            payload
        )

    @staticmethod
    def update_item(
        item_id: int,
        payload
    ):
        return MenuItemRepository.update(
            item_id,
            payload
        )

    @staticmethod
    def delete_item(
        item_id: int
    ):
        return MenuItemRepository.delete(
            item_id
        )