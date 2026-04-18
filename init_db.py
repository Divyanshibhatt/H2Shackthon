import sqlite3

DATABASE = "warehouse.db"

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Create items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            supplier TEXT NOT NULL,
            price REAL NOT NULL
        )
    ''')

    # Clear existing data to avoid duplicates if run multiple times
    cursor.execute('DELETE FROM items')

    # Insert dummy data
    dummy_items = [
        ('Widget A', 150, 'Supplier X', 10.50),
        ('Widget B', 5, 'Supplier Y', 25.00),
        ('Gadget C', 8, 'Supplier X', 55.20),
        ('Gadget D', 200, 'Supplier Z', 5.00),
        ('Thingamajig', 0, 'Supplier Y', 100.00),
    ]

    cursor.executemany('''
        INSERT INTO items (name, quantity, supplier, price)
        VALUES (?, ?, ?, ?)
    ''', dummy_items)

    conn.commit()
    conn.close()
    print("Database initialized with dummy data.")

if __name__ == "__main__":
    init_db()
