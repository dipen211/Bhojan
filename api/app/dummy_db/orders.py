from app.core.order_status import (
    ACCEPTED,
    PENDING,
    PREPARING
)

orders = [
    {
        "id": 1,
        "tenant_id": 1,
        "branch_id": 1,
        "customer_name": "Dipen",
        "customer_phone": "9999999999",
        "total_amount": 120,
        "status": PENDING,
        "payment_status": "PAID"
    },
    {
        "id": 2,
        "tenant_id": 1,
        "branch_id": 2,
        "customer_name": "Riya",
        "customer_phone": "8888888888",
        "total_amount": 155,
        "status": ACCEPTED,
        "payment_status": "PAID"
    },
    {
        "id": 3,
        "tenant_id": 1,
        "branch_id": 3,
        "customer_name": "Aman",
        "customer_phone": "7777777777",
        "total_amount": 110,
        "status": PREPARING,
        "payment_status": "COD"
    }
]
