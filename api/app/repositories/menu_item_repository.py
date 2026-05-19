from app.dummy_db.menu_items import (
    menu_items
)


class MenuItemRepository:

    @staticmethod
    def find_all():
        return menu_items

    @staticmethod
    def find_by_branch_id(
        branch_id: int
    ):

        return [
            item
            for item in menu_items
            if item["branch_id"] == branch_id
        ]

    @staticmethod
    def find_by_id(item_id: int):

        return next(
            (
                item
                for item in menu_items
                if item["id"] == item_id
            ),
            None
        )

    @staticmethod
    def create(payload):

        new_item = {
            "id": len(menu_items) + 1,
            "tenant_id": payload.tenant_id,
            "branch_id": payload.branch_id,
            "category_id": payload.category_id,
            "name": payload.name,
            "description": payload.description,
            "price": payload.price,
            "is_veg": payload.is_veg,
            "is_available": True,
            "preparation_time": payload.preparation_time,
            "image": payload.image,
            "is_active": True
        }

        menu_items.append(new_item)

        return new_item

    @staticmethod
    def update(
        item_id: int,
        payload
    ):

        item = MenuItemRepository.find_by_id(
            item_id
        )

        if not item:
            return None

        item["name"] = payload.name
        item["description"] = payload.description
        item["price"] = payload.price
        item["is_veg"] = payload.is_veg
        item["is_available"] = payload.is_available
        item["preparation_time"] = payload.preparation_time
        item["image"] = payload.image

        return item

    @staticmethod
    def delete(item_id: int):

        item = MenuItemRepository.find_by_id(
            item_id
        )

        if not item:
            return False

        menu_items.remove(item)

        return True