from app.repositories.client_repository import (
    ClientRepository
)


class ClientService:

    @staticmethod
    def get_all_clients():
        return ClientRepository.find_all()

    @staticmethod
    def get_client_by_id(
        client_id: int
    ):
        return ClientRepository.find_by_id(
            client_id
        )

    @staticmethod
    def create_client(payload):
        return ClientRepository.create(
            payload
        )

    @staticmethod
    def update_client(
        client_id: int,
        payload
    ):
        return ClientRepository.update(
            client_id,
            payload
        )

    @staticmethod
    def delete_client(
        client_id: int
    ):
        return ClientRepository.delete(
            client_id
        )