from pydantic import BaseModel


class CategoryCreateSchema(BaseModel):
    tenant_id: int
    branch_id: int
    name: str
    sort_order: int


class CategoryUpdateSchema(BaseModel):
    name: str
    sort_order: int