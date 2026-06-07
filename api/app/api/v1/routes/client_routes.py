from fastapi import APIRouter, Depends

from app.constants.roles import (
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.core.access_control import (
    get_authenticated_user,
    get_scoped_client,
    require_roles
)
from app.middleware.auth_middleware import get_current_user
from app.schemas.client_schema import (
    ClientCreateSchema,
    ClientUpdateSchema
)

from app.services.client_service import (
    ClientService
)

from app.core.responses import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)


@router.get("")
def get_clients(
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        clients = ClientService.get_all_clients()
    elif user["role"] == CLIENT_ADMIN and user.get("tenant_id") is not None:
        clients = [get_scoped_client(user, user["tenant_id"])]
    else:
        clients = []

    return success_response(
        "Clients fetched successfully",
        clients
    )


@router.get("/{client_id}")
def get_client(
    client_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    client = get_scoped_client(user, client_id)

    return success_response(
        "Client fetched successfully",
        client
    )


@router.post("")
def create_client(
    payload: ClientCreateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN])

    client = ClientService.create_client(
        payload
    )

    return success_response(
        "Client created successfully",
        client
    )


@router.put("/{client_id}")
def update_client(
    client_id: int,
    payload: ClientUpdateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN])

    client = ClientService.update_client(
        client_id,
        payload
    )

    if not client:
        return error_response("Client not found", 404)

    return success_response(
        "Client updated successfully",
        client
    )


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN])

    deleted = ClientService.delete_client(
        client_id
    )

    if not deleted:
        return error_response(
            "Client not found",
            404
        )

    return success_response(
        "Client deleted successfully"
    )
