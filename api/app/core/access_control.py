from fastapi import HTTPException

from app.constants.roles import (
    BRANCH_MANAGER,
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.repositories.branch_repository import (
    BranchRepository
)
from app.repositories.client_repository import (
    ClientRepository
)
from app.repositories.user_repository import (
    UserRepository
)


def get_authenticated_user(payload: dict):
    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    user = UserRepository.find_raw_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return UserRepository._sanitize(user)


def require_roles(user: dict, allowed_roles: list[str]):
    if user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return user


def enforce_tenant_scope(user: dict, tenant_id: int):
    if user["role"] == SUPER_ADMIN:
        return

    if user.get("tenant_id") != tenant_id:
        raise HTTPException(
            status_code=403,
            detail="Tenant access denied"
        )


def enforce_branch_scope(user: dict, branch: dict):
    if user["role"] == SUPER_ADMIN:
        return

    if user["role"] == CLIENT_ADMIN:
        if branch["tenant_id"] != user.get("tenant_id"):
            raise HTTPException(
                status_code=403,
                detail="Branch access denied"
            )
        return

    if user["role"] == BRANCH_MANAGER:
        if branch["id"] != user.get("branch_id"):
            raise HTTPException(
                status_code=403,
                detail="Branch access denied"
            )
        return

    raise HTTPException(
        status_code=403,
        detail="Branch access denied"
    )


def get_scoped_client(user: dict, client_id: int):
    client = ClientRepository.find_by_id(client_id)

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    enforce_tenant_scope(user, client["id"])

    return client


def get_scoped_branch(user: dict, branch_id: int):
    branch = BranchRepository.find_by_id(branch_id)

    if not branch:
        raise HTTPException(
            status_code=404,
            detail="Branch not found"
        )

    enforce_branch_scope(user, branch)

    return branch


def validate_user_payload_scope(user: dict, tenant_id: int | None, branch_id: int | None):
    if branch_id is not None:
        branch = BranchRepository.find_by_id(branch_id)

        if not branch:
            raise HTTPException(
                status_code=403,
                detail="Branch assignment denied"
            )

        if tenant_id is not None and branch["tenant_id"] != tenant_id:
            raise HTTPException(
                status_code=403,
                detail="Branch assignment denied"
            )

    if user["role"] == SUPER_ADMIN:
        return

    if user["role"] == CLIENT_ADMIN:
        if tenant_id != user.get("tenant_id"):
            raise HTTPException(
                status_code=403,
                detail="Tenant assignment denied"
            )
        return

    raise HTTPException(
        status_code=403,
        detail="User management denied"
    )
