import sqlite3

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def get_analytics():
    conn = get_db_connection()
    top_items = conn.execute("""
        SELECT name, SUM(quantity) as total_sold
        FROM items
        GROUP BY name
        ORDER BY total_sold DESC
        LIMIT 5
    """).fetchall()

    supplier_stats = conn.execute("""
        SELECT supplier, COUNT(*) as items_supplied
        FROM items
        GROUP BY supplier
    """).fetchall()

    conn.close()
    return {
        "top_items": [dict(item) for item in top_items],
        "supplier_stats": [dict(s) for s in supplier_stats]
    }
