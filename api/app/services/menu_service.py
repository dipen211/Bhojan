from app.dummy_db.menus import menus


class MenuService:

    @staticmethod
    def get_all_menu_items():
        return menus

    @staticmethod
    def create_menu_item(payload):
        new_item = {
            "id": len(menus) + 1,
            "name": payload.name,
            "price": payload.price,
            "is_available": payload.is_available,
            "branch_id": payload.branch_id
        }

        menus.append(new_item)

        return new_item