from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.active_connections = {}

    async def connect(
        self,
        branch_id: int,
        websocket: WebSocket
    ):

        await websocket.accept()

        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = []

        self.active_connections[branch_id].append(
            websocket
        )

    def disconnect(
        self,
        branch_id: int,
        websocket: WebSocket
    ):

        if branch_id in self.active_connections:

            self.active_connections[
                branch_id
            ].remove(websocket)

    async def broadcast_to_branch(
        self,
        branch_id: int,
        message: dict
    ):

        if branch_id not in self.active_connections:
            return

        for connection in self.active_connections[
            branch_id
        ]:

            await connection.send_json(message)