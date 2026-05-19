from pydantic import (
    BaseModel,
    EmailStr
)


class ClientCreateSchema(BaseModel):
    name: str
    company_name: str
    email: EmailStr
    phone: str
    slug: str
    domain: str


class ClientUpdateSchema(BaseModel):
    name: str
    company_name: str
    email: EmailStr
    phone: str
    slug: str
    domain: str