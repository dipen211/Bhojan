from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreateSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    tenant_id: Optional[int] = None
    branch_id: Optional[int] = None


class UserUpdateSchema(BaseModel):
    name: str
    email: EmailStr
    role: str
    tenant_id: Optional[int] = None
    branch_id: Optional[int] = None
    password: Optional[str] = None
