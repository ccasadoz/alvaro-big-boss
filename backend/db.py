import sqlite3, json, os

DB_PATH = os.path.join(os.path.dirname(__file__), "bigboss.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

SHOE_SIZES = ["36","37","38","39","40","41","42","43","44","45","46"]
KIDS_SHOE_SIZES = ["28","29","30","31","32","33","34","35"]
CLOTHING_SIZES = ["XS","S","M","L","XL","XXL"]
KIDS_CLOTHING_SIZES = ["4","6","8","10","12","14"]

def default_stock_by_size(category, tags, total_stock):
    """Distribute total stock across sizes based on category."""
    is_kids = "Niños" in (tags if isinstance(tags, list) else json.loads(tags or '[]'))
    if category == "Zapatillas":
        sizes = KIDS_SHOE_SIZES if is_kids else SHOE_SIZES
    elif category == "Accesorios":
        return json.dumps({"UNICA": total_stock})
    else:
        sizes = KIDS_CLOTHING_SIZES if is_kids else CLOTHING_SIZES

    per_size = total_stock // len(sizes)
    remainder = total_stock % len(sizes)
    stock_map = {}
    for i, s in enumerate(sizes):
        stock_map[s] = per_size + (1 if i < remainder else 0)
    return json.dumps(stock_map)

def init_db():
    conn = get_db()

    # Check if columns exist
    cols = [row[1] for row in conn.execute("PRAGMA table_info(products)").fetchall()]

    if "original_price" not in cols:
        try:
            conn.execute("ALTER TABLE products ADD COLUMN original_price INTEGER DEFAULT 0")
            conn.commit()
        except:
            pass

    if "stock_by_size" not in cols:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                img TEXT NOT NULL,
                specs TEXT DEFAULT '[]',
                tags TEXT DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                items TEXT NOT NULL,
                total INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                customer_email TEXT,
                shipping_address TEXT,
                delivery_method TEXT DEFAULT 'shipping',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Add stock_by_size column
        try:
            conn.execute("ALTER TABLE products ADD COLUMN stock_by_size TEXT DEFAULT '{}'")
            conn.commit()
        except:
            pass

        # Migrate existing products
        rows = conn.execute("SELECT id, category, stock, tags FROM products").fetchall()
        for row in rows:
            stock_json = default_stock_by_size(row["category"], row["tags"], row["stock"])
            conn.execute("UPDATE products SET stock_by_size = ? WHERE id = ?", (stock_json, row["id"]))
        conn.commit()
    else:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                img TEXT NOT NULL,
                specs TEXT DEFAULT '[]',
                tags TEXT DEFAULT '[]',
                stock_by_size TEXT DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                items TEXT NOT NULL,
                total INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                customer_email TEXT,
                shipping_address TEXT,
                delivery_method TEXT DEFAULT 'shipping',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

    # Seed products if empty
    count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        products = [
            ("Zapatillas", "Boss Runner X1", 89990, 15, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", '["Suela de goma premium","Mesh transpirable","Amortiguación responsive"]', '["Hombre","Deportes","Lo nuevo"]'),
            ("Zapatillas", "Boss Air Force", 109990, 12, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop", '["Cuero sintético","Suela Air visible","Clásico reinventado"]', '["Hombre","Mujer","Exclusivos"]'),
            ("Poleras", "Boss Classic Tee", 34990, 30, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop", '["Algodón 100%","Fit regular","Logo bordado"]', '["Hombre","Lo nuevo"]'),
            ("Zapatillas", "Boss Retro High", 119990, 8, "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop", '["Caña alta acolchada","Suela vulcanizada","Edición limitada"]', '["Mujer","Exclusivos"]'),
            ("Zapatillas", "Boss Speed Lite", 99990, 20, "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop", '["Ultra liviana 220g","Placa de carbono","Para competición"]', '["Hombre","Mujer","Deportes"]'),
            ("Polerones", "Boss Oversize Hoodie", 59990, 25, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop", '["Algodón fleece 350g","Capucha doble","Bolsillo canguro"]', '["Hombre","Mujer","Lo nuevo"]'),
            ("Zapatillas", "Boss Dunk Low", 129990, 6, "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop", '["Cuero premium","Colorway exclusivo","Edición Chile"]', '["Hombre","Mujer","Exclusivos","Lo nuevo"]'),
            ("Poleras", "Boss Dry-Fit Pro", 44990, 18, "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop", '["Tecnología Dry-Fit","Anti-transpirante","UV Protection 50+"]', '["Hombre","Deportes"]'),
            ("Shorts", "Boss Flex Short", 39990, 22, "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop", '["Tela stretch 4 vías","Bolsillos con cierre","Liner integrado"]', '["Hombre","Deportes"]'),
            ("Zapatillas", "Boss Pink Cloud", 94990, 14, "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop", '["Foam ultra suave","Diseño femenino","Slip-on easy"]', '["Mujer","Lo nuevo"]'),
            ("Polerones", "Boss Cropped Hoodie", 49990, 16, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop", '["Corte cropped","French terry","Colores pasteles"]', '["Mujer","Lo nuevo"]'),
            ("Accesorios", "Boss Mochila Urban", 64990, 10, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", '["30L capacidad","Compartimiento laptop","Tela impermeable"]', '["Hombre","Mujer","Lo nuevo"]'),
            ("Zapatillas", "Boss Junior Star", 59990, 20, "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&h=600&fit=crop", '["Tallas 28-35","Velcro fácil","Suela antideslizante"]', '["Niños"]'),
            ("Poleras", "Boss Kids Tee", 24990, 28, "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=600&fit=crop", '["Algodón orgánico","Estampados divertidos","Anti-manchas"]', '["Niños"]'),
            ("Shorts", "Boss Kids Short", 19990, 30, "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=600&fit=crop", '["Cintura elástica","Secado rápido","Colores vibrantes"]', '["Niños"]'),
            ("Zapatillas", "Boss Trail Beast", 139990, 7, "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop", '["Gore-Tex waterproof","Suela Vibram","Protección de roca"]', '["Hombre","Deportes"]'),
        ]
        for p in products:
            cat, name, price, stock, img, specs, tags = p
            stock_json = default_stock_by_size(cat, tags, stock)
            conn.execute(
                "INSERT INTO products (category, name, price, stock, img, specs, tags, stock_by_size) VALUES (?,?,?,?,?,?,?,?)",
                (cat, name, price, stock, img, specs, tags, stock_json)
            )
        conn.commit()
    conn.close()

init_db()
