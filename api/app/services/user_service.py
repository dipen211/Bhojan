from app.repositories.user_repository import (
    UserRepository
)


class UserService:

    @staticmethod
    def get_users(
        role: str = None,
        tenant_id: int = None,
        branch_id: int = None
    ):
        return UserRepository.find_filtered(
            role,
            tenant_id,
            branch_id
        )

    @staticmethod
    def get_user_by_id(user_id: int):
        return UserRepository.find_by_id(user_id)

    @staticmethod
    def get_raw_user_by_email(email: str):
        return UserRepository.find_raw_by_email(email)

    @staticmethod
    def create_user(payload):
        return UserRepository.create(payload)

    @staticmethod
    def update_user(
        user_id: int,
        payload
    ):
        return UserRepository.update(
            user_id,
            payload
        )

    @staticmethod
    def delete_user(user_id: int):
        return UserRepository.delete(user_id)
