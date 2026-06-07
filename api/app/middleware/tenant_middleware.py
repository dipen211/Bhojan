from starlette.middleware.base import (
    BaseHTTPMiddleware
)

from fastapi.responses import JSONResponse

from app.services.tenant_service import (
    TenantService
)


class TenantMiddleware(BaseHTTPMiddleware):

    @staticmethod
    def _should_skip_tenant_resolution(
        path: str,
        host: str
    ) -> bool:
        normalized_host = host.split(":")[0].lower()

        if (
            path == "/"
            or path.startswith("/api")
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi")
            or path.startswith("/ws")
        ):
            return True

        if normalized_host in [
            "localhost",
            "127.0.0.1",
            "api"
        ]:
            return True

        if normalized_host.endswith(".onrender.com"):
            return True

        return False

    async def dispatch(
        self,
        request,
        call_next
    ):
        host = (
            request.headers.get("x-forwarded-host")
            or request.headers.get("host")
        )

        if not host:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Host header missing"
                }
            )

        if self._should_skip_tenant_resolution(
            request.url.path,
            host
        ):
            request.state.tenant = None

            return await call_next(request)

        subdomain = host.split(":")[0].split(".")[0]

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
