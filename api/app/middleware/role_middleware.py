from fastapi import HTTPException


def require_role(allowed_roles: list):

    def role_checker(user=...):

        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return user

    return role_checker