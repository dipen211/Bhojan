from app.core.security import hash_password
from app.dummy_db.users import users


class UserRepository:

    @staticmethod
    def find_all():
        return [
            UserRepository._sanitize(user)
            for user in users
        ]

    @staticmethod
    def find_by_id(user_id: int):
        user = next(
            (
                item
                for item in users
                if item["id"] == user_id
            ),
            None
        )

        if not user:
            return None

        return UserRepository._sanitize(user)

    @staticmethod
    def find_raw_by_id(user_id: int):
        return next(
            (
                item
                for item in users
                if item["id"] == user_id
            ),
            None
        )

    @staticmethod
    def find_raw_by_email(email: str):
        return next(
            (
                item
                for item in users
                if item["email"] == email
            ),
            None
        )

    @staticmethod
    def find_filtered(
        role: str = None,
        tenant_id: int = None,
        branch_id: int = None
    ):
        filtered = users

        if role:
            filtered = [
                user
                for user in filtered
                if user["role"] == role
            ]

        if tenant_id is not None:
            filtered = [
                user
                for user in filtered
                if user.get("tenant_id") == tenant_id
            ]

        if branch_id is not None:
            filtered = [
                user
                for user in filtered
                if user.get("branch_id") == branch_id
            ]

        return [
            UserRepository._sanitize(user)
            for user in filtered
        ]

    @staticmethod
    def create(payload):
        new_user = {
            "id": len(users) + 1,
            "name": payload.name,
            "email": payload.email,
            "password": hash_password(payload.password),
            "role": payload.role,
            "tenant_id": payload.tenant_id,
            "branch_id": payload.branch_id
        }

        users.append(new_user)

        return UserRepository._sanitize(new_user)

    @staticmethod
    def update(user_id: int, payload):
        user = next(
            (
                item
                for item in users
                if item["id"] == user_id
            ),
            None
        )

        if not user:
            return None

        user["name"] = payload.name
        user["email"] = payload.email
        user["role"] = payload.role
        user["tenant_id"] = payload.tenant_id
        user["branch_id"] = payload.branch_id

        if payload.password:
            user["password"] = hash_password(
                payload.password
            )

        return UserRepository._sanitize(user)

    @staticmethod
    def delete(user_id: int):
        user = next(
            (
                item
                for item in users
                if item["id"] == user_id
            ),
            None
        )

        if not user:
            return False

        users.remove(user)

        return True

    @staticmethod
    def _sanitize(user: dict):
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "tenant_id": user.get("tenant_id"),
            "branch_id": user.get("branch_id")
        }
