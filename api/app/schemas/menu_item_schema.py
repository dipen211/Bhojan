from pydantic import BaseModel


class MenuItemCreateSchema(BaseModel):
    tenant_id: int
    branch_id: int
    category_id: int
    name: str
    description: str
    price: float
    is_veg: bool
    preparation_time: int
    image: str


class MenuItemUpdateSchema(BaseModel):
    name: str
    description: str
    price: float
    is_veg: bool
    is_available: bool
    preparation_time: int
    image: str