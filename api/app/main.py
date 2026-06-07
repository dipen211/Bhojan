from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.middleware.logging_middleware import (
    LoggingMiddleware
)
from app.api.v1.routes.client_routes import (
    router as client_router
)
from app.api.v1.routes.branch_routes import (
    router as branch_router
)
from app.api.v1.routes.menu_routes import (
    router as menu_router
)
from app.api.v1.routes.order_routes import (
    router as order_router
)
from app.api.v1.routes.auth_routes import (
    router as auth_router
)
from app.api.v1.routes.tenant_routes import (
    router as tenant_router
)
from app.api.v1.routes.admin_routes import (
    router as admin_router
)
from app.api.v1.routes.category_routes import (
    router as category_router
)
from app.api.v1.routes.menu_item_routes import (
    router as menu_item_router
)
from app.api.v1.routes.user_routes import (
    router as user_router
)
from app.api.v1.routes.storefront_routes import (
    router as storefront_router
)
from app.websocket.order_socket import (
    router as websocket_router
)

from app.middleware.tenant_middleware import (
    TenantMiddleware
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.add_middleware(TenantMiddleware)

app.add_middleware(LoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://172.27.29.161:3000",
        "https://mybhojan.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Bhojan SaaS API Running"
    }

app.include_router(
    client_router,

    prefix="/api/v1"
)
app.include_router(
    branch_router,

    prefix="/api/v1"
)
app.include_router(
    menu_router,

    prefix="/api/v1"
)
app.include_router(
    order_router,

    prefix="/api/v1"
)
app.include_router(
    auth_router,

    prefix="/api/v1"
)
app.include_router(
    tenant_router,

    prefix="/api/v1"
)
app.include_router(
    admin_router,

    prefix="/api/v1"
)
app.include_router(
    category_router,

    prefix="/api/v1"
)
app.include_router(
    menu_item_router,

    prefix="/api/v1"
)
app.include_router(
    user_router,

    prefix="/api/v1"
)
app.include_router(
    storefront_router,

    prefix="/api/v1"
)

app.include_router(websocket_router)
