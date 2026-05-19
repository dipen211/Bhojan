from app.core.roles import (
    SUPER_ADMIN,
    CLIENT_ADMIN,
    BRANCH_MANAGER,
    CUSTOMER
)

ROLE_PERMISSIONS = {

    SUPER_ADMIN: [
        "*"
    ],

    CLIENT_ADMIN: [
        "manage_branches",
        "manage_menus",
        "manage_orders",
        "view_reports"
    ],

    BRANCH_MANAGER: [
        "manage_branch_orders",
        "manage_branch_menu"
    ],

    CUSTOMER: [
        "place_order",
        "view_menu"
    ]
}