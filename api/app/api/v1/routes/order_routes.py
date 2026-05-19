from fastapi import APIRouter

from app.schemas.order_schema import (
    OrderCreateSchema,
    OrderStatusUpdateSchema
)

from app.services.order_service import (
    OrderService
)

from app.core.responses import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.get("")
def get_orders():

    orders = OrderService.get_all_orders()

    return success_response(
        "Orders fetched successfully",
        orders
    )


@router.get("/{order_id}")
def get_order(order_id: int):

    order = OrderService.get_order_by_id(
        order_id
    )

    if not order:
        return error_response(
            "Order not found",
            404
        )

    return success_response(
        "Order fetched successfully",
        order
    )


@router.get("/branch/{branch_id}")
def get_branch_orders(
    branch_id: int
):

    orders = OrderService.get_branch_orders(
        branch_id
    )

    return success_response(
        "Branch orders fetched successfully",
        orders
    )


@router.post("")
async def create_order(
    payload: OrderCreateSchema
):

    order = await OrderService.create_order(
        payload
    )

    return success_response(
        "Order created successfully",
        order
    )


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdateSchema
):

    order = await OrderService.update_order_status(
        order_id,
        payload.status
    )

    if not order:
        return error_response(
            "Order not found",
            404
        )

    return success_response(
        "Order status updated successfully",
        order
    )