from pydantic import BaseModel


class MenuItemCreateSchema(BaseModel):
    name: str
    price: float
    is_available: bool
    branch_id: int


class MenuItemUpdateSchema(BaseModel):
    name: str
    price: float
    is_available: bool