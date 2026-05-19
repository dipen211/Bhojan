from pydantic import (
    BaseModel,
    EmailStr
)


class BranchCreateSchema(BaseModel):
    tenant_id: int
    name: str
    slug: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: EmailStr
    manager_name: str
    opening_time: str
    closing_time: str


class BranchUpdateSchema(BaseModel):
    name: str
    slug: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: EmailStr
    manager_name: str
    opening_time: str
    closing_time: str