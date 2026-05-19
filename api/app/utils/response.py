from fastapi.responses import JSONResponse


def success_response(message: str, data=None):
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )


def error_response(message: str):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": message
        }
    )