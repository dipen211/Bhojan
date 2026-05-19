from pydantic import (
    BaseModel
)

from typing import List


class OrderItemSchema(BaseModel):
    menu_item_id: int
    name: str
    quantity: int
    price: float


class OrderCreateSchema(BaseModel):
    tenant_id: int
    branch_id: int
    customer_name: str
    customer_phone: str
    total_amount: float
    payment_status: str
    items: List[OrderItemSchema]


class OrderStatusUpdateSchema(BaseModel):
    status: str