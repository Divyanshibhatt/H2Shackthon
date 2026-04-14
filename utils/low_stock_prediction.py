import sqlite3

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def predict_low_stock(threshold_days=7, avg_daily_sales=2):
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM items").fetchall()
    conn.close()

    predictions = []
    for item in items:
        days_left = item["quantity"] / avg_daily_sales if item["quantity"] else 0
        if days_left < threshold_days:
            predictions.append({
                "id": item["id"],
                "name": item["name"],
                "days_left": days_left
            })
    return predictions
