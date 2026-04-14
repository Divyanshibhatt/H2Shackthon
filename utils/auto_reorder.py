import sqlite3

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def create_reorder(item_id, reorder_qty=50):
    conn = get_db_connection()
    item = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()

    if item:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reorders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER,
                supplier TEXT,
                quantity INTEGER,
                status TEXT
            )
        """)
        conn.execute("""
            INSERT INTO reorders (item_id, supplier, quantity, status)
            VALUES (?, ?, ?, ?)
        """, (item_id, item["supplier"], reorder_qty, "Pending"))
        conn.commit()
    conn.close()
    return {"message": "Reorder request created"}
