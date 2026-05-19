from starlette.middleware.base import BaseHTTPMiddleware


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request,
        call_next
    ):
        print(
            f"{request.method} {request.url.path}"
        )

        response = await call_next(request)

        return response