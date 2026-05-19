from starlette.middleware.base import (
    BaseHTTPMiddleware
)

from fastapi.responses import JSONResponse

from app.services.tenant_service import (
    TenantService
)


class TenantMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request,
        call_next
    ):

        # Skip websocket connections
        if request.url.path.startswith("/ws"):
            return await call_next(request)

        host = request.headers.get("host")

        if not host:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Host header missing"
                }
            )

        subdomain = host.split(".")[0]

        if subdomain in [
            "localhost:8000",
            "127",
            "127:8000",
            "api"
        ]:

            request.state.tenant = None

            return await call_next(request)

        tenant = TenantService.get_tenant_by_slug(
            subdomain
        )

        if not tenant:
            return JSONResponse(
                status_code=404,
                content={
                    "message": "Tenant not found"
                }
            )

        request.state.tenant = tenant

        response = await call_next(request)

        return response