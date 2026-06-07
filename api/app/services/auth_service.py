from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.dummy_db.users import users


class AuthService:

    @staticmethod
    def register(payload):
        existing_user = next(
            (
                user
                for user in users
                if user["email"] == payload.email
            ),
            None
        )

        if existing_user:
            return None

        new_user = {
            "id": len(users) + 1,
            "name": payload.name,
            "email": payload.email,
            "password": hash_password(payload.password),
            "role": "CLIENT_ADMIN",
            "tenant_id": None,
            "branch_id": None
        }

        users.append(new_user)

        return new_user

    @staticmethod
    def login(payload):
        user = next(
            (
                user
                for user in users
                if user["email"] == payload.email
            ),
            None
        )

        if not user:
            return None

        stored_password = user["password"]

        if isinstance(stored_password, str) and stored_password.startswith("$2"):
            is_valid_password = verify_password(
                payload.password,
                stored_password
            )
        else:
            is_valid_password = payload.password == stored_password
        
        if not is_valid_password:
            return None

        token = create_access_token({
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"]
        })

        return {
            "access_token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "tenant_id": user.get("tenant_id"),
                "branch_id": user.get("branch_id")
            }
        }
