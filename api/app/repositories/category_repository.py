from app.dummy_db.categories import (
    categories
)


class CategoryRepository:

    @staticmethod
    def find_all():
        return categories

    @staticmethod
    def find_by_branch_id(
        branch_id: int
    ):

        return [
            category
            for category in categories
            if category["branch_id"] == branch_id
        ]

    @staticmethod
    def find_by_id(category_id: int):

        return next(
            (
                category
                for category in categories
                if category["id"] == category_id
            ),
            None
        )

    @staticmethod
    def create(payload):

        new_category = {
            "id": len(categories) + 1,
            "tenant_id": payload.tenant_id,
            "branch_id": payload.branch_id,
            "name": payload.name,
            "sort_order": payload.sort_order,
            "is_active": True
        }

        categories.append(new_category)

        return new_category

    @staticmethod
    def update(
        category_id: int,
        payload
    ):

        category = CategoryRepository.find_by_id(
            category_id
        )

        if not category:
            return None

        category["name"] = payload.name
        category["sort_order"] = payload.sort_order

        return category

    @staticmethod
    def delete(category_id: int):

        category = CategoryRepository.find_by_id(
            category_id
        )

        if not category:
            return False

        categories.remove(category)

        return True