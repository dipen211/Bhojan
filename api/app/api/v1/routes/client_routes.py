from fastapi import APIRouter

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
def get_clients():

    clients = ClientService.get_all_clients()

    return success_response(
        "Clients fetched successfully",
        clients
    )


@router.get("/{client_id}")
def get_client(client_id: int):

    client = ClientService.get_client_by_id(
        client_id
    )

    if not client:
        return error_response(
            "Client not found",
            404
        )

    return success_response(
        "Client fetched successfully",
        client
    )


@router.post("")
def create_client(
    payload: ClientCreateSchema
):

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
    payload: ClientUpdateSchema
):

    client = ClientService.update_client(
        client_id,
        payload
    )

    if not client:
        return error_response(
            "Client not found",
            404
        )

    return success_response(
        "Client updated successfully",
        client
    )


@router.delete("/{client_id}")
def delete_client(client_id: int):

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