# Warehouse Management System Backend in Python + SQLite
# Single-file backend serving the React Frontend

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

# =============================
# 1. APP CONFIGURATION
# =============================

REACT_BUILD_DIR = os.path.join("my-react-app", "dist")
app = Flask(__name__, static_folder=REACT_BUILD_DIR, static_url_path="/")
CORS(app)

PORT = 5000
DATABASE = "warehouse.db"

# =============================
# 2. DATABASE HELPER
# =============================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# =============================
# 3. HELPER FUNCTION
# =============================

def add_log(action, item_name, quantity, user="Admin"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO logs (action, itemName, quantity, user, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (action, item_name, quantity, user, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

# =============================
# 4. INVENTORY ROUTES
# =============================

@app.route("/api/items", methods=["GET"])
def get_items():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items")
    rows = cursor.fetchall()
    items = []
    for row in rows:
        item = dict(row)
        item["_id"] = str(item["_id"])
        items.append(item)
    conn.close()
    return jsonify(items)


@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO items (name, category, warehouse, quantity, price, minStock, supplier, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get("name"), data.get("category"), data.get("warehouse"),
        data.get("quantity"), data.get("price"), data.get("minStock"),
        data.get("supplier"), datetime.utcnow().isoformat()
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    
    cursor.execute("SELECT * FROM items WHERE _id = ?", (inserted_id,))
    item = dict(cursor.fetchone())
    item["_id"] = str(item["_id"])
    conn.close()

    add_log("ADD", item["name"], item["quantity"])
    return jsonify(item), 201


@app.route("/api/items/<id>", methods=["PUT"])
def update_item(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    update_fields = []
    params = []
    for key, value in data.items():
        if key != "_id" and key != "id":
            update_fields.append(f"{key} = ?")
            params.append(value)
            
    if update_fields:
        params.append(int(id))
        query = f"UPDATE items SET {', '.join(update_fields)} WHERE _id = ?"
        cursor.execute(query, params)
        conn.commit()

    cursor.execute("SELECT * FROM items WHERE _id = ?", (int(id),))
    updated_item = dict(cursor.fetchone())
    updated_item["_id"] = str(updated_item["_id"])
    conn.close()

    add_log("UPDATE", updated_item.get("name"), updated_item.get("quantity"))
    return jsonify(updated_item)


@app.route("/api/items/<id>", methods=["DELETE"])
def delete_item(id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM items WHERE _id = ?", (int(id),))
    row = cursor.fetchone()
    if row:
        item = dict(row)
        cursor.execute("DELETE FROM items WHERE _id = ?", (int(id),))
        conn.commit()
        add_log("DELETE", item.get("name"), item.get("quantity"))
        
    conn.close()
    return jsonify({"message": "Item deleted"})


# =============================
# 5. SUPPLIER ROUTES
# =============================

@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM suppliers")
    rows = cursor.fetchall()
    suppliers = []
    for row in rows:
        sup = dict(row)
        sup["_id"] = str(sup["_id"])
        suppliers.append(sup)
    conn.close()
    return jsonify(suppliers)


@app.route("/api/suppliers", methods=["POST"])
def add_supplier():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO suppliers (name, email, phone, status, createdAt)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data.get("name"), data.get("email"), data.get("phone"),
        data.get("status", "Active"), datetime.utcnow().isoformat()
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    
    cursor.execute("SELECT * FROM suppliers WHERE _id = ?", (inserted_id,))
    supplier = dict(cursor.fetchone())
    supplier["_id"] = str(supplier["_id"])
    conn.close()

    add_log("ADD SUPPLIER", supplier["name"], 0)
    return jsonify(supplier), 201


@app.route("/api/suppliers/<id>", methods=["DELETE"])
def delete_supplier(id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM suppliers WHERE _id = ?", (int(id),))
    row = cursor.fetchone()
    if row:
        supplier = dict(row)
        cursor.execute("DELETE FROM suppliers WHERE _id = ?", (int(id),))
        conn.commit()
        add_log("DELETE SUPPLIER", supplier.get("name"), 0)
        
    conn.close()
    return jsonify({"message": "Supplier deleted"})


# =============================
# 6. ACTIVITY LOG ROUTES
# =============================

@app.route("/api/logs", methods=["GET"])
def get_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    logs = []
    for row in rows:
        log = dict(row)
        log["_id"] = str(log["_id"])
        logs.append(log)
    conn.close()
    return jsonify(logs)


# =============================
# 7. DASHBOARD ROUTE
# =============================

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_items FROM items")
    total_items = cursor.fetchone()["total_items"]
    
    cursor.execute("SELECT COUNT(*) as low_stock FROM items WHERE quantity <= minStock")
    low_stock = cursor.fetchone()["low_stock"]
    
    cursor.execute("SELECT SUM(quantity * price) as total_value FROM items")
    row = cursor.fetchone()
    total_value = row["total_value"] if row["total_value"] else 0
    
    conn.close()

    return jsonify({
        "totalItems": total_items,
        "lowStock": low_stock,
        "totalValue": total_value
    })


# =============================
# 8. LOGIN ROUTE (DEMO)
# =============================

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    role = data.get("role")
    if not role:
        return jsonify({"message": "Role required"}), 400
    return jsonify({
        "message": "Login successful",
        "role": role
    })

# =============================
# 9. SERVE REACT FRONTEND
# =============================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# =============================
# 10. RUN SERVER
# =============================

if __name__ == "__main__":
    print("Server running on port", PORT)
    app.run(debug=True, port=PORT)
