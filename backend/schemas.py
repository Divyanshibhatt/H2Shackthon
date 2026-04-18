from pydantic import BaseModel
from typing import Optional

# Item Schemas
class ItemBase(BaseModel):
    name: str
    category: str
    quantity: int
    price: float
    supplier: str
    warehouse: str
    minStock: int = 10

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    contact: str
    status: str = "Active"

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True

# Log Schemas
class LogBase(BaseModel):
    timestamp: str
    action: str
    item: str
    qty: int
    user: str

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: int

    class Config:
        from_attributes = True
