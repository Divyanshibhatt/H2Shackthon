import sqlite3

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def chatbot_query(query):
    conn = get_db_connection()
    response = "Sorry, I didn’t understand that."

    if "low stock" in query.lower():
        items = conn.execute("SELECT * FROM items WHERE quantity < 10").fetchall()
        response = f"{len(items)} items are low in stock."
    elif "total value" in query.lower():
        total_value = conn.execute("SELECT SUM(quantity * price) as val FROM items").fetchone()["val"]
        response = f"Total warehouse value is {total_value}"

    conn.close()
    return response
