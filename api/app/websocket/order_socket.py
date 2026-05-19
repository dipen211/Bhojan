from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect
)

from app.websocket.connection_manager import (
    ConnectionManager
)

router = APIRouter()

manager = ConnectionManager()


@router.websocket(
    "/ws/orders/{branch_id}"
)
async def order_websocket(
    websocket: WebSocket,
    branch_id: int
):

    await manager.connect(
        branch_id,
        websocket
    )

    try:

        while True:

            data = await websocket.receive_text()

            await websocket.send_text(
                f"Message received: {data}"
            )

    except WebSocketDisconnect:

        manager.disconnect(
            branch_id,
            websocket
        )