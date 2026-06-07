from fastapi import APIRouter, Depends

from app.constants.roles import (
    BRANCH_MANAGER,
    CLIENT_ADMIN,
    SUPER_ADMIN
)
from app.core.access_control import (
    get_authenticated_user,
    get_scoped_branch,
    require_roles
)
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
from app.middleware.auth_middleware import get_current_user

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.get("")
def get_orders(
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    if user["role"] == SUPER_ADMIN:
        orders = OrderService.get_all_orders()
    elif user["role"] == CLIENT_ADMIN:
        orders = OrderService.get_tenant_orders(
            user["tenant_id"]
        )
    else:
        orders = OrderService.get_branch_orders(
            user["branch_id"]
        )

    return success_response(
        "Orders fetched successfully",
        orders
    )


@router.get("/{order_id}")
def get_order(
    order_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)

    order = OrderService.get_order_by_id(
        order_id
    )

    if not order:
        return error_response(
            "Order not found",
            404
        )

    branch = get_scoped_branch(
        user,
        order["branch_id"]
    )

    return success_response(
        "Order fetched successfully",
        order
    )


@router.get("/branch/{branch_id}")
def get_branch_orders(
    branch_id: int,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    get_scoped_branch(user, branch_id)

    orders = OrderService.get_branch_orders(
        branch_id
    )

    return success_response(
        "Branch orders fetched successfully",
        orders
    )


@router.post("")
async def create_order(
    payload: OrderCreateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])
    branch = get_scoped_branch(user, payload.branch_id)

    if payload.tenant_id != branch["tenant_id"]:
        return error_response("Tenant and branch do not match", 403)

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
    payload: OrderStatusUpdateSchema,
    token_payload=Depends(get_current_user)
):
    user = get_authenticated_user(token_payload)
    require_roles(user, [SUPER_ADMIN, CLIENT_ADMIN, BRANCH_MANAGER])

    existing_order = OrderService.get_order_by_id(
        order_id
    )

    if not existing_order:
        return error_response("Order not found", 404)

    get_scoped_branch(user, existing_order["branch_id"])

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
