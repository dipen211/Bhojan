from fastapi import APIRouter

from app.schemas.order_schema import OrderCreateSchema
from app.services.order_service import OrderService
from app.utils.response import success_response

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.get("")
def get_orders():
    orders = OrderService.get_all_orders()

    return success_response(
        message="Orders fetched successfully",
        data=orders
    )


@router.post("")
def create_order(payload: OrderCreateSchema):
    order = OrderService.create_order(payload)

    return success_response(
        message="Order created successfully",
        data=order
    )