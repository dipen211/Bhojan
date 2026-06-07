from app.repositories.order_repository import (
    OrderRepository
)
from app.websocket.order_socket import (
    manager
)


class OrderService:

    @staticmethod
    def get_all_orders():
        return OrderRepository.find_all()

    @staticmethod
    def get_tenant_orders(
        tenant_id: int
    ):
        return OrderRepository.find_by_tenant_id(
            tenant_id
        )

    @staticmethod
    def get_branch_orders(
        branch_id: int
    ):
        return OrderRepository.find_by_branch_id(
            branch_id
        )

    @staticmethod
    def get_order_by_id(
        order_id: int
    ):

        order = OrderRepository.find_by_id(
            order_id
        )

        if not order:
            return None

        items = OrderRepository.get_order_items(
            order_id
        )

        order["items"] = items

        return order

    @staticmethod
    def get_public_order(
        order_id: int,
        branch_id: int
    ):
        order = OrderService.get_order_by_id(
            order_id
        )

        if not order or order["branch_id"] != branch_id:
            return None

        return order

    @staticmethod
    async def create_order(payload):

        order = OrderRepository.create(
            payload
        )

        await manager.broadcast_to_branch(
            payload.branch_id,
            {
                "event": "NEW_ORDER",
                "data": order
            }
        )

        return order

    @staticmethod
    async def update_order_status(
        order_id: int,
        status: str
    ):

        order = OrderRepository.update_status(
            order_id,
            status
        )

        if not order:
            return None

        await manager.broadcast_to_branch(
            order["branch_id"],
            {
                "event": "ORDER_STATUS_UPDATED",
                "data": order
            }
        )

        return order
