from fastapi import APIRouter

from app.schemas.client_schema import (
    ClientCreateSchema
)

from app.services.client_service import ClientService
from app.utils.response import success_response

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)


@router.get("")
def get_clients():
    clients = ClientService.get_all_clients()

    return success_response(
        message="Clients fetched successfully",
        data=clients
    )


@router.get("/{client_id}")
def get_client(client_id: int):
    client = ClientService.get_client_by_id(client_id)

    return success_response(
        message="Client fetched successfully",
        data=client
    )


@router.post("")
def create_client(payload: ClientCreateSchema):
    client = ClientService.create_client(payload)

    return success_response(
        message="Client created successfully",
        data=client
    )
