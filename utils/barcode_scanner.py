import sqlite3

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def scan_barcode(barcode):
    conn = get_db_connection()
    item = conn.execute("SELECT * FROM items WHERE id = ?", (barcode,)).fetchone()
    conn.close()
    return dict(item) if item else {"error": "Item not found"}
