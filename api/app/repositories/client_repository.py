from app.dummy_db.clients import clients


class ClientRepository:

    @staticmethod
    def find_all():
        return clients

    @staticmethod
    def find_by_id(client_id: int):

        return next(
            (
                client
                for client in clients
                if client["id"] == client_id
            ),
            None
        )

    @staticmethod
    def create(payload):

        new_client = {
            "id": len(clients) + 1,
            "name": payload.name,
            "company_name": payload.company_name,
            "email": payload.email,
            "phone": payload.phone,
            "slug": payload.slug,
            "domain": payload.domain,
            "is_active": True
        }

        clients.append(new_client)

        return new_client

    @staticmethod
    def update(
        client_id: int,
        payload
    ):

        client = ClientRepository.find_by_id(
            client_id
        )

        if not client:
            return None

        client["name"] = payload.name
        client["company_name"] = payload.company_name
        client["email"] = payload.email
        client["phone"] = payload.phone
        client["slug"] = payload.slug
        client["domain"] = payload.domain

        return client

    @staticmethod
    def delete(client_id: int):

        client = ClientRepository.find_by_id(
            client_id
        )

        if not client:
            return False

        clients.remove(client)

        return True