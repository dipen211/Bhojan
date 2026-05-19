from app.repositories.category_repository import (
    CategoryRepository
)


class CategoryService:

    @staticmethod
    def get_all_categories():
        return CategoryRepository.find_all()

    @staticmethod
    def get_branch_categories(
        branch_id: int
    ):
        return CategoryRepository.find_by_branch_id(
            branch_id
        )

    @staticmethod
    def create_category(payload):
        return CategoryRepository.create(
            payload
        )

    @staticmethod
    def update_category(
        category_id: int,
        payload
    ):
        return CategoryRepository.update(
            category_id,
            payload
        )

    @staticmethod
    def delete_category(
        category_id: int
    ):
        return CategoryRepository.delete(
            category_id
        )