from fastapi import APIRouter

from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema
)

from app.services.auth_service import (
    AuthService
)

from app.core.responses import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/register")
def register(payload: RegisterSchema):

    user = AuthService.register(payload)

    if not user:
        return error_response(
            "User already exists"
        )

    return success_response(
        "User registered successfully",
        {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    )


@router.post("/login")
def login(payload: LoginSchema):

    response = AuthService.login(payload)

    if not response:
        return error_response(
            "Invalid email or password",
            401
        )

    return success_response(
        "Login successful",
        response
    )