from sqlalchemy import Column, Integer, String, Float
from database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    quantity = Column(Integer)
    price = Column(Float)
    supplier = Column(String)
    warehouse = Column(String)
    minStock = Column(Integer, default=10)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String)
    status = Column(String, default="Active")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    action = Column(String)
    item = Column(String)
    qty = Column(Integer)
    user = Column(String)
