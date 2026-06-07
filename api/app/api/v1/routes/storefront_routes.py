from secrets import compare_digest

from fastapi import APIRouter, HTTPException

from app.core.order_status import (
    ACCEPTED,
    CANCELLED,
    DELIVERED,
    READY
)
from app.core.responses import success_response
from app.repositories.branch_repository import BranchRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.client_repository import ClientRepository
from app.repositories.menu_item_repository import MenuItemRepository
from app.schemas.order_schema import OrderCreateSchema
from app.services.order_service import OrderService

router = APIRouter(
    prefix="/storefront",
    tags=["Storefront"]
)


def _get_storefront_branch(tenant_slug: str, branch_slug: str):
    client = ClientRepository.find_by_slug(tenant_slug)

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found"
        )

    branch = BranchRepository.find_by_slug_and_tenant_id(
        branch_slug,
        client["id"]
    )

    if not branch:
        raise HTTPException(
            status_code=404,
            detail="Branch not found"
        )

    return client, branch


@router.get("/{tenant_slug}/{branch_slug}")
def get_storefront(
    tenant_slug: str,
    branch_slug: str
):
    client, branch = _get_storefront_branch(
        tenant_slug,
        branch_slug
    )

    categories = CategoryRepository.find_by_branch_id(
        branch["id"]
    )
    menu_items = MenuItemRepository.find_by_branch_id(
        branch["id"]
    )

    return success_response(
        "Storefront fetched successfully",
        {
            "client": client,
            "branch": branch,
            "categories": categories,
            "menu_items": menu_items
        }
    )


@router.post("/{tenant_slug}/{branch_slug}/orders")
async def create_storefront_order(
    tenant_slug: str,
    branch_slug: str,
    payload: OrderCreateSchema
):
    _, branch = _get_storefront_branch(
        tenant_slug,
        branch_slug
    )

    if payload.branch_id != branch["id"] or payload.tenant_id != branch["tenant_id"]:
        raise HTTPException(
            status_code=403,
            detail="Order branch mismatch"
        )

    order = await OrderService.create_order(payload)

    return success_response(
        "Order created successfully",
        order
    )


@router.get("/{tenant_slug}/{branch_slug}/orders/{order_id}")
def get_storefront_order(
    tenant_slug: str,
    branch_slug: str,
    order_id: int,
    token: str
):
    _, branch = _get_storefront_branch(
        tenant_slug,
        branch_slug
    )

    order = OrderService.get_public_order(
        order_id,
        branch["id"]
    )

    if not order or not compare_digest(order["customer_token"], token):
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return success_response(
        "Order fetched successfully",
        order
    )


@router.patch("/{tenant_slug}/{branch_slug}/orders/{order_id}/cancel")
async def cancel_storefront_order(
    tenant_slug: str,
    branch_slug: str,
    order_id: int,
    token: str
):
    _, branch = _get_storefront_branch(
        tenant_slug,
        branch_slug
    )

    order = OrderService.get_public_order(
        order_id,
        branch["id"]
    )

    if not order or not compare_digest(order["customer_token"], token):
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order["status"] in [ACCEPTED, READY, DELIVERED, CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="This order can no longer be cancelled"
        )

    updated_order = await OrderService.update_order_status(
        order_id,
        CANCELLED
    )

    return success_response(
        "Order cancelled successfully",
        updated_order
    )
