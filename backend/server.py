import os, json, secrets, time, threading
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import mercadopago

load_dotenv()

app = FastAPI(title="Alvaro Big Boss API")

# CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MercadoPago
sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN", ""))
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://alvarobigboss.onrender.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Simple token store
admin_tokens = {}

from db import get_db

# ─── Models ───
class CreatePreference(BaseModel):
    items: list
    customer_email: str
    delivery_method: str = "shipping"
    shipping_address: str = ""

class ConfirmOrder(BaseModel):
    order_id: str

class CancelPayment(BaseModel):
    order_id: str

class AdminLogin(BaseModel):
    password: str

class ProductCreate(BaseModel):
    category: str
    name: str
    price: int
    stock: int
    img: str
    specs: list = []
    tags: list = []
    stock_by_size: dict = {}

class StockUpdate(BaseModel):
    stock: int

class StockBySizeUpdate(BaseModel):
    stock_by_size: dict

# ─── Auth helper ───
def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No autorizado")
    token = authorization.split(" ")[1]
    if token not in admin_tokens or admin_tokens[token] < time.time():
        raise HTTPException(401, "Token expirado")
    return True

def parse_product(r):
    d = dict(r)
    d["specs"] = json.loads(r["specs"])
    d["tags"] = json.loads(r["tags"])
    d["stock_by_size"] = json.loads(r["stock_by_size"]) if r["stock_by_size"] else {}
    return d

# ─── Public endpoints ───
@app.get("/products")
def list_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products WHERE stock > 0 ORDER BY id").fetchall()
    conn.close()
    return [parse_product(r) for r in rows]

@app.post("/create-preference")
def create_preference(data: CreatePreference):
    conn = get_db()
    try:
        subtotal = 0
        order_items = []
        mp_items = []

        for item in data.items:
            row = conn.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
            if not row:
                raise HTTPException(400, f"Producto {item['id']} no encontrado")

            size = item.get("size", "M")
            qty = item["qty"]

            # Check stock by size
            stock_by_size = json.loads(row["stock_by_size"]) if row["stock_by_size"] else {}
            if stock_by_size:
                size_stock = stock_by_size.get(size, 0)
                if size_stock < qty:
                    raise HTTPException(400, f"Stock insuficiente para {row['name']} talla {size}")
            else:
                if row["stock"] < qty:
                    raise HTTPException(400, f"Stock insuficiente para {row['name']}")

            subtotal += row["price"] * qty
            order_items.append({
                "id": row["id"], "name": row["name"], "price": row["price"],
                "qty": qty, "size": size
            })
            mp_items.append({
                "title": f"{row['name']} (Talla {size})",
                "quantity": qty,
                "unit_price": row["price"],
                "currency_id": "CLP"
            })

        # Tax & shipping
        iva = round(subtotal * 0.19)
        shipping = 0 if data.delivery_method == "pickup" or subtotal >= 100000 else 5000
        total = subtotal + iva + shipping

        order_id = f"ABB-{secrets.token_hex(4).upper()}"

        # Decrement stock atomically (by size)
        for item in data.items:
            row = conn.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
            stock_by_size = json.loads(row["stock_by_size"]) if row["stock_by_size"] else {}
            size = item.get("size", "M")
            qty = item["qty"]

            if stock_by_size:
                stock_by_size[size] = stock_by_size.get(size, 0) - qty
                new_total = sum(v for v in stock_by_size.values())
                conn.execute(
                    "UPDATE products SET stock_by_size = ?, stock = ? WHERE id = ?",
                    (json.dumps(stock_by_size), new_total, item["id"])
                )
            else:
                conn.execute(
                    "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                    (qty, item["id"], qty)
                )

        conn.execute(
            "INSERT INTO orders (id, items, total, status, customer_email, shipping_address, delivery_method) VALUES (?,?,?,?,?,?,?)",
            (order_id, json.dumps(order_items), total, "pending", data.customer_email, data.shipping_address, data.delivery_method)
        )
        conn.commit()

        if shipping > 0:
            mp_items.append({"title": "Envío", "quantity": 1, "unit_price": shipping, "currency_id": "CLP"})
        mp_items.append({"title": "IVA (19%)", "quantity": 1, "unit_price": iva, "currency_id": "CLP"})

        preference = {
            "items": mp_items,
            "payer": {"email": data.customer_email},
            "external_reference": order_id,
        }
        if "localhost" not in FRONTEND_URL and "127.0.0.1" not in FRONTEND_URL:
            preference["back_urls"] = {
                "success": f"{FRONTEND_URL}?status=approved&order_id={order_id}",
                "failure": f"{FRONTEND_URL}?status=rejected&order_id={order_id}",
                "pending": f"{FRONTEND_URL}?status=pending&order_id={order_id}",
            }
            preference["auto_return"] = "approved"
        result = sdk.preference().create(preference)
        body = result.get("response", {})

        return {
            "init_point": body.get("init_point") or body.get("sandbox_init_point"),
            "order_id": order_id,
            "total": total
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500, str(e))
    finally:
        conn.close()

@app.post("/confirm-order")
def confirm_order(data: ConfirmOrder):
    conn = get_db()
    conn.execute("UPDATE orders SET status = 'confirmed' WHERE id = ?", (data.order_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.post("/cancel-payment")
def cancel_payment(data: CancelPayment):
    conn = get_db()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (data.order_id,)).fetchone()
    if order and order["status"] == "pending":
        items = json.loads(order["items"])
        for item in items:
            row = conn.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
            if row:
                stock_by_size = json.loads(row["stock_by_size"]) if row["stock_by_size"] else {}
                size = item.get("size", "M")
                if stock_by_size:
                    stock_by_size[size] = stock_by_size.get(size, 0) + item["qty"]
                    new_total = sum(v for v in stock_by_size.values())
                    conn.execute(
                        "UPDATE products SET stock_by_size = ?, stock = ? WHERE id = ?",
                        (json.dumps(stock_by_size), new_total, item["id"])
                    )
                else:
                    conn.execute("UPDATE products SET stock = stock + ? WHERE id = ?", (item["qty"], item["id"]))
        conn.execute("UPDATE orders SET status = 'cancelled' WHERE id = ?", (data.order_id,))
        conn.commit()
    conn.close()
    return {"ok": True}

# ─── Admin endpoints ───
@app.post("/admin/login")
def admin_login(data: AdminLogin):
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Contraseña incorrecta")
    token = secrets.token_hex(32)
    admin_tokens[token] = time.time() + 8 * 3600
    return {"token": token}

@app.get("/admin/products")
def admin_products(auth: bool = Depends(verify_admin)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM products ORDER BY id").fetchall()
    conn.close()
    return [parse_product(r) for r in rows]

@app.post("/admin/products")
def admin_create_product(product: ProductCreate, auth: bool = Depends(verify_admin)):
    conn = get_db()
    stock_by_size = product.stock_by_size if product.stock_by_size else {}
    total_stock = sum(stock_by_size.values()) if stock_by_size else product.stock
    cur = conn.execute(
        "INSERT INTO products (category, name, price, stock, img, specs, tags, stock_by_size) VALUES (?,?,?,?,?,?,?,?)",
        (product.category, product.name, product.price, total_stock, product.img,
         json.dumps(product.specs), json.dumps(product.tags), json.dumps(stock_by_size))
    )
    conn.commit()
    pid = cur.lastrowid
    conn.close()
    return {"id": pid}

@app.put("/admin/products/{pid}")
def admin_update_product(pid: int, product: ProductCreate, auth: bool = Depends(verify_admin)):
    conn = get_db()
    stock_by_size = product.stock_by_size if product.stock_by_size else {}
    total_stock = sum(stock_by_size.values()) if stock_by_size else product.stock
    conn.execute(
        "UPDATE products SET category=?, name=?, price=?, stock=?, img=?, specs=?, tags=?, stock_by_size=? WHERE id=?",
        (product.category, product.name, product.price, total_stock, product.img,
         json.dumps(product.specs), json.dumps(product.tags), json.dumps(stock_by_size), pid)
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/admin/products/{pid}/stock")
def admin_update_stock(pid: int, data: StockUpdate, auth: bool = Depends(verify_admin)):
    conn = get_db()
    conn.execute("UPDATE products SET stock = ? WHERE id = ?", (data.stock, pid))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/admin/products/{pid}/stock-by-size")
def admin_update_stock_by_size(pid: int, data: StockBySizeUpdate, auth: bool = Depends(verify_admin)):
    conn = get_db()
    total = sum(data.stock_by_size.values())
    conn.execute(
        "UPDATE products SET stock_by_size = ?, stock = ? WHERE id = ?",
        (json.dumps(data.stock_by_size), total, pid)
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/admin/products/{pid}")
def admin_delete_product(pid: int, auth: bool = Depends(verify_admin)):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.get("/admin/orders")
def admin_orders(auth: bool = Depends(verify_admin)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50").fetchall()
    conn.close()
    return [{**dict(r), "items": json.loads(r["items"])} for r in rows]

# ─── Cleanup job ───
def cleanup_pending_orders():
    while True:
        time.sleep(1800)
        try:
            conn = get_db()
            old = conn.execute(
                "SELECT * FROM orders WHERE status = 'pending' AND created_at < datetime('now', '-30 minutes')"
            ).fetchall()
            for order in old:
                items = json.loads(order["items"])
                for item in items:
                    row = conn.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
                    if row:
                        stock_by_size = json.loads(row["stock_by_size"]) if row["stock_by_size"] else {}
                        size = item.get("size", "M")
                        if stock_by_size:
                            stock_by_size[size] = stock_by_size.get(size, 0) + item["qty"]
                            new_total = sum(v for v in stock_by_size.values())
                            conn.execute(
                                "UPDATE products SET stock_by_size = ?, stock = ? WHERE id = ?",
                                (json.dumps(stock_by_size), new_total, item["id"])
                            )
                        else:
                            conn.execute("UPDATE products SET stock = stock + ? WHERE id = ?", (item["qty"], item["id"]))
                conn.execute("UPDATE orders SET status = 'expired' WHERE id = ?", (order["id"],))
            conn.commit()
            conn.close()
        except:
            pass

threading.Thread(target=cleanup_pending_orders, daemon=True).start()
