import sqlite3
from datetime import datetime

DATABASE = "warehouse.db"

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Create items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            warehouse TEXT,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            minStock INTEGER NOT NULL,
            supplier TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    ''')

    # Create suppliers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suppliers (
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            status TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    ''')

    # Create logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            itemName TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            user TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')

    # Clear existing data to avoid duplicates if run multiple times
    cursor.execute('DELETE FROM items')
    cursor.execute('DELETE FROM suppliers')
    cursor.execute('DELETE FROM logs')

    current_time = datetime.utcnow().isoformat()

    # Insert dummy items
    dummy_items = [
        ('MacBook Pro M3', 'Electronics', 'NY-Main', 45, 1999.00, 20, 'Apple Inc', current_time),
        ('Ergonomic Chair', 'Furniture', 'NY-Main', 12, 350.00, 15, 'Herman Miller', current_time),
        ('Wireless Mouse', 'Electronics', 'SF-Hub', 200, 45.00, 50, 'Logitech', current_time),
        ('Standing Desk', 'Furniture', 'SF-Hub', 5, 600.00, 10, 'Uplift', current_time),
        ('USB-C Cable (2m)', 'Accessories', 'NY-Main', 8, 15.00, 50, 'Anker', current_time),
        ('LED Monitor 27"', 'Electronics', 'NY-Main', 30, 299.00, 10, 'Dell', current_time)
    ]

    cursor.executemany('''
        INSERT INTO items (name, category, warehouse, quantity, price, minStock, supplier, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', dummy_items)

    # Insert dummy suppliers
    dummy_suppliers = [
        ('Apple Inc', 'sales@apple.com', '123-456', 'Active', current_time),
        ('Herman Miller', 'b2b@hermanmiller.com', '123-456', 'Active', current_time),
        ('Logitech', 'supply@logitech.com', '123-456', 'Active', current_time),
        ('Uplift', 'orders@upliftdesk.com', '123-456', 'Inactive', current_time),
        ('Anker', 'wholesale@anker.com', '123-456', 'Active', current_time),
        ('Dell', 'enterprise@dell.com', '123-456', 'Active', current_time)
    ]

    cursor.executemany('''
        INSERT INTO suppliers (name, email, phone, status, createdAt)
        VALUES (?, ?, ?, ?, ?)
    ''', dummy_suppliers)
    
    conn.commit()
    conn.close()
    print("Database initialized with dummy data.")

if __name__ == "__main__":
    init_db()
