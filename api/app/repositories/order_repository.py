from app.dummy_db.orders import (
    orders
)

from app.dummy_db.order_items import (
    order_items
)

from app.core.order_status import (
    PENDING
)
from secrets import token_urlsafe


class OrderRepository:

    @staticmethod
    def find_all():
        return orders

    @staticmethod
    def find_by_tenant_id(
        tenant_id: int
    ):
        return [
            order
            for order in orders
            if order["tenant_id"] == tenant_id
        ]

    @staticmethod
    def find_by_branch_id(
        branch_id: int
    ):

        return [
            order
            for order in orders
            if order["branch_id"] == branch_id
        ]

    @staticmethod
    def find_by_id(order_id: int):

        return next(
            (
                order
                for order in orders
                if order["id"] == order_id
            ),
            None
        )

    @staticmethod
    def create(payload):

        new_order = {
            "id": len(orders) + 1,
            "tenant_id": payload.tenant_id,
            "branch_id": payload.branch_id,
            "customer_name": payload.customer_name,
            "customer_phone": payload.customer_phone,
            "total_amount": payload.total_amount,
            "status": PENDING,
            "payment_status": payload.payment_status,
            "customer_token": token_urlsafe(18)
        }

        orders.append(new_order)

        for item in payload.items:

            order_items.append({
                "id": len(order_items) + 1,
                "order_id": new_order["id"],
                "menu_item_id": item.menu_item_id,
                "name": item.name,
                "quantity": item.quantity,
                "price": item.price
            })

        return new_order

    @staticmethod
    def update_status(
        order_id: int,
        status: str
    ):

        order = OrderRepository.find_by_id(
            order_id
        )

        if not order:
            return None

        order["status"] = status

        return order

    @staticmethod
    def get_order_items(
        order_id: int
    ):

        return [
            item
            for item in order_items
            if item["order_id"] == order_id
        ]
