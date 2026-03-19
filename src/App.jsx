import React, { useState, useEffect, useCallback } from 'react'
import { API_BASE_URL } from './config'
import {
  Search, Heart, ShoppingBag, X, Plus, Minus, Trash2, ChevronLeft, ChevronRight,
  Menu, User, MapPin, Phone, Mail, Play, Star, Truck, ShieldCheck, RotateCcw,
  CreditCard, ChevronDown, Filter, ArrowRight, Eye, EyeOff, Package, LogOut,
  Edit3, Save, PlusCircle, AlertCircle, Check, Clock, XCircle
} from 'lucide-react'

/* ────── helpers ────── */
const fmt = (n) => '$' + Number(n).toLocaleString('es-CL')
const CATEGORIES = ['Lo nuevo', 'Hombre', 'Mujer', 'Niños', 'Deportes', 'Ofertas', 'Exclusivos']

const FALLBACK_PRODUCTS = [
  { id: 1, category: 'Zapatillas', name: 'Boss Runner X1', price: 89990, stock: 15, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', specs: ['Suela de goma premium', 'Mesh transpirable', 'Amortiguación responsive'], tags: ['Hombre', 'Deportes', 'Lo nuevo'] },
  { id: 2, category: 'Zapatillas', name: 'Boss Air Force', price: 109990, stock: 12, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop', specs: ['Cuero sintético', 'Suela Air visible', 'Clásico reinventado'], tags: ['Hombre', 'Mujer', 'Exclusivos'] },
  { id: 3, category: 'Poleras', name: 'Boss Classic Tee', price: 34990, stock: 30, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', specs: ['Algodón 100%', 'Fit regular', 'Logo bordado'], tags: ['Hombre', 'Lo nuevo'] },
  { id: 4, category: 'Zapatillas', name: 'Boss Retro High', price: 119990, stock: 8, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop', specs: ['Caña alta acolchada', 'Suela vulcanizada', 'Edición limitada'], tags: ['Mujer', 'Exclusivos'] },
  { id: 5, category: 'Zapatillas', name: 'Boss Speed Lite', price: 99990, stock: 20, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop', specs: ['Ultra liviana 220g', 'Placa de carbono', 'Para competición'], tags: ['Hombre', 'Mujer', 'Deportes'] },
  { id: 6, category: 'Polerones', name: 'Boss Oversize Hoodie', price: 59990, stock: 25, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', specs: ['Algodón fleece 350g', 'Capucha doble', 'Bolsillo canguro'], tags: ['Hombre', 'Mujer', 'Lo nuevo'] },
  { id: 7, category: 'Zapatillas', name: 'Boss Dunk Low', price: 129990, stock: 6, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop', specs: ['Cuero premium', 'Colorway exclusivo', 'Edición Chile'], tags: ['Hombre', 'Mujer', 'Exclusivos', 'Lo nuevo'] },
  { id: 8, category: 'Poleras', name: 'Boss Dry-Fit Pro', price: 44990, stock: 18, img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop', specs: ['Tecnología Dry-Fit', 'Anti-transpirante', 'UV Protection 50+'], tags: ['Hombre', 'Deportes'] },
  { id: 9, category: 'Shorts', name: 'Boss Flex Short', price: 39990, stock: 22, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop', specs: ['Tela stretch 4 vías', 'Bolsillos con cierre', 'Liner integrado'], tags: ['Hombre', 'Deportes'] },
  { id: 10, category: 'Zapatillas', name: 'Boss Pink Cloud', price: 94990, stock: 14, img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop', specs: ['Foam ultra suave', 'Diseño femenino', 'Slip-on easy'], tags: ['Mujer', 'Lo nuevo'] },
  { id: 11, category: 'Polerones', name: 'Boss Cropped Hoodie', price: 49990, stock: 16, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop', specs: ['Corte cropped', 'French terry', 'Colores pasteles'], tags: ['Mujer', 'Lo nuevo'] },
  { id: 12, category: 'Accesorios', name: 'Boss Mochila Urban', price: 64990, stock: 10, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', specs: ['30L capacidad', 'Compartimiento laptop', 'Tela impermeable'], tags: ['Hombre', 'Mujer', 'Lo nuevo'] },
  { id: 13, category: 'Zapatillas', name: 'Boss Junior Star', price: 59990, stock: 20, img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&h=600&fit=crop', specs: ['Tallas 28-35', 'Velcro fácil', 'Suela antideslizante'], tags: ['Niños'] },
  { id: 14, category: 'Poleras', name: 'Boss Kids Tee', price: 24990, stock: 28, img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=600&fit=crop', specs: ['Algodón orgánico', 'Estampados divertidos', 'Anti-manchas'], tags: ['Niños'] },
  { id: 15, category: 'Shorts', name: 'Boss Kids Short', price: 19990, stock: 30, img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=600&fit=crop', specs: ['Cintura elástica', 'Secado rápido', 'Colores vibrantes'], tags: ['Niños'] },
  { id: 16, category: 'Zapatillas', name: 'Boss Trail Beast', price: 139990, stock: 7, img: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop', specs: ['Gore-Tex waterproof', 'Suela Vibram', 'Protección de roca'], tags: ['Hombre', 'Deportes'] },
]

/* ────── MAIN APP ────── */
export default function App() {
  const [page, setPage] = useState('home')
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abb_cart')) || [] } catch { return [] }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abb_favs')) || [] } catch { return [] }
  })
  const [favsOpen, setFavsOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abb_user')) } catch { return null }
  })
  const [authModal, setAuthModal] = useState(null) // 'login' | 'register' | null
  const [orderResult, setOrderResult] = useState(null)

  // Persist cart & favs
  useEffect(() => { localStorage.setItem('abb_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('abb_favs', JSON.stringify(favorites)) }, [favorites])
  useEffect(() => {
    if (user) localStorage.setItem('abb_user', JSON.stringify(user))
    else localStorage.removeItem('abb_user')
  }, [user])

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/products`)
      if (r.ok) setProducts(await r.json())
    } catch { /* offline fallback handled below */ }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Handle payment return URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const orderId = params.get('order_id')
    if (status && orderId) {
      if (status === 'approved') {
        fetch(`${API_BASE_URL}/confirm-order`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId })
        })
        setOrderResult({ status: 'approved', orderId })
        setCart([])
        setPage('result')
      } else if (status === 'rejected' || status === 'failure') {
        fetch(`${API_BASE_URL}/cancel-payment`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId })
        })
        setOrderResult({ status: 'rejected', orderId })
        setPage('result')
      } else {
        setOrderResult({ status: 'pending', orderId })
        setPage('result')
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // No fallback needed - products initialized from FALLBACK_PRODUCTS

  /* ── Cart helpers ── */
  const addToCart = (product, size = 'M') => {
    setCart(prev => {
      const key = `${product.id}-${size}`
      const exists = prev.find(i => `${i.id}-${i.size}` === key)
      if (exists) return prev.map(i => `${i.id}-${i.size}` === key ? { ...i, qty: Math.min(i.qty + 1, product.stock) } : i)
      return [...prev, { ...product, qty: 1, size }]
    })
    setCartOpen(true)
  }

  const updateQty = (id, size, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.size === size) {
        const newQty = i.qty + delta
        if (newQty <= 0) return null
        return { ...i, qty: Math.min(newQty, i.stock) }
      }
      return i
    }).filter(Boolean))
  }

  const removeFromCart = (id, size) => setCart(prev => prev.filter(i => !(i.id === id && i.size === size)))
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  /* ── Favorites ── */
  const toggleFav = (productId) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  /* ── Filtered products ── */
  const getFilteredProducts = () => {
    let filtered = products
    if (selectedCategory) {
      if (selectedCategory === 'Ofertas') {
        filtered = filtered.filter(p => p.price < 50000)
      } else {
        filtered = filtered.filter(p => p.tags?.includes(selectedCategory) || p.category === selectedCategory)
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    return filtered
  }

  /* ── Navigation handler ── */
  const navigate = (target) => {
    setPage(target)
    setMobileMenu(false)
    setSearchOpen(false)
    window.scrollTo(0, 0)
  }

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-white">
      {/* ===== TOP BAR ===== */}
      <div className="bg-[#f5f5f5] flex justify-between items-center px-4 md:px-10 py-2 text-xs">
        <span className="font-bold tracking-wider text-sm">ABB</span>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate('giftcard')} className="hover:text-gray-500 cursor-pointer">Gift card</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => navigate('ayuda')} className="hover:text-gray-500 cursor-pointer">Centro de ayuda</button>
          <span className="text-gray-300">|</span>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.name}</span>
              <button onClick={() => { setUser(null); navigate('home') }} className="hover:text-gray-500 cursor-pointer">Salir</button>
            </div>
          ) : (
            <button onClick={() => setAuthModal('login')} className="hover:text-gray-500 cursor-pointer">Regístrate / Login</button>
          )}
        </div>
      </div>

      {/* ===== MAIN NAV ===== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 flex justify-between items-center px-4 md:px-10 py-3">
        <button onClick={() => navigate('home')} className="font-oswald text-2xl font-bold tracking-wider uppercase cursor-pointer">
          Alvaro <span className="text-[#c41e3a]">Big Boss</span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden lg:flex gap-6">
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                onClick={() => { setSelectedCategory(cat); setSearchQuery(''); navigate('catalog') }}
                className={`text-sm font-medium pb-1 border-b-2 cursor-pointer transition-colors ${
                  selectedCategory === cat ? 'border-black' : 'border-transparent hover:border-black'
                } ${cat === 'Ofertas' ? 'text-[#c41e3a]' : ''}`}
              >{cat}</button>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center bg-[#f5f5f5] rounded-full px-3 py-1.5 gap-2">
                <Search size={18} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { setSelectedCategory(null); navigate('catalog') } }}
                  placeholder="Buscar"
                  className="bg-transparent outline-none text-sm w-28 md:w-40"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="cursor-pointer"><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-1 cursor-pointer">
                <Search size={22} />
              </button>
            )}
          </div>

          {/* Favorites */}
          <button onClick={() => setFavsOpen(true)} className="p-1 relative cursor-pointer">
            <Heart size={22} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#c41e3a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{favorites.length}</span>
            )}
          </button>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} className="p-1 relative cursor-pointer">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#c41e3a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-1 cursor-pointer">
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenu && (
        <div className="lg:hidden bg-white border-b shadow-lg px-6 py-4 space-y-3">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSearchQuery(''); navigate('catalog') }}
              className={`block w-full text-left text-base font-medium py-1 cursor-pointer ${cat === 'Ofertas' ? 'text-[#c41e3a]' : ''}`}>
              {cat}
            </button>
          ))}
          <hr />
          {user ? (
            <>
              <p className="text-sm text-gray-500">Hola, {user.name}</p>
              <button onClick={() => { setUser(null); navigate('home') }} className="text-sm text-[#c41e3a] cursor-pointer">Cerrar sesión</button>
            </>
          ) : (
            <button onClick={() => { setAuthModal('login'); setMobileMenu(false) }} className="text-sm font-medium cursor-pointer">Regístrate / Login</button>
          )}
        </div>
      )}

      {/* ===== PROMO BANNER ===== */}
      <PromoBanner />

      {/* ===== PAGE CONTENT ===== */}
      {page === 'home' && <HomePage products={products} addToCart={addToCart} toggleFav={toggleFav} favorites={favorites}
        setSelectedCategory={setSelectedCategory} navigate={navigate} setSelectedProduct={setSelectedProduct} />}

      {page === 'catalog' && <CatalogPage products={getFilteredProducts()} addToCart={addToCart} toggleFav={toggleFav}
        favorites={favorites} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery} setSelectedProduct={setSelectedProduct} navigate={navigate} />}

      {page === 'product' && selectedProduct && <ProductPage product={selectedProduct} addToCart={addToCart}
        toggleFav={toggleFav} favorites={favorites} products={products} setSelectedProduct={setSelectedProduct} navigate={navigate} />}

      {page === 'checkout' && <CheckoutPage cart={cart} cartTotal={cartTotal} user={user}
        setUser={setUser} setOrderResult={setOrderResult} setCart={setCart} navigate={navigate} />}

      {page === 'result' && orderResult && <ResultPage result={orderResult} navigate={navigate} />}

      {page === 'giftcard' && <GiftCardPage navigate={navigate} />}
      {page === 'ayuda' && <AyudaPage navigate={navigate} />}
      {page === 'admin' && <AdminPanel />}

      {/* ===== FOOTER ===== */}
      <Footer navigate={navigate} setSelectedCategory={setSelectedCategory} setPage={setPage} />

      {/* ===== CART SIDEBAR ===== */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty}
        removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} setCartOpen={setCartOpen} />

      {/* ===== FAVS SIDEBAR ===== */}
      <FavsSidebar open={favsOpen} onClose={() => setFavsOpen(false)} favorites={favorites} products={products}
        toggleFav={toggleFav} addToCart={addToCart} setSelectedProduct={setSelectedProduct} navigate={navigate} setFavsOpen={setFavsOpen} />

      {/* ===== AUTH MODAL ===== */}
      {authModal && <AuthModal mode={authModal} setMode={setAuthModal} setUser={setUser} onClose={() => setAuthModal(null)} />}

      {/* ===== WHATSAPP ===== */}
      <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  )
}


/* ══════════════════════════════════════════════
   PROMO BANNER
   ══════════════════════════════════════════════ */
function PromoBanner() {
  const promos = [
    'Compra en hasta 12 cuotas sin interés',
    'Envío gratis en compras sobre $100.000',
    'Nuevos miembros: 15% OFF con código BIGBOSS'
  ]
  const [idx, setIdx] = useState(0)
  return (
    <div className="bg-[#f5f5f5] text-center py-2.5 px-14 relative text-sm">
      <button onClick={() => setIdx((idx - 1 + promos.length) % promos.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-xl cursor-pointer">&lsaquo;</button>
      <p>{promos[idx]}</p>
      <a href="#" className="font-bold underline text-xs">Comprar</a>
      <button onClick={() => setIdx((idx + 1) % promos.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-xl cursor-pointer">&rsaquo;</button>
    </div>
  )
}


/* ══════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════ */
function HomePage({ products, addToCart, toggleFav, favorites, setSelectedCategory, navigate, setSelectedProduct }) {
  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[85vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop"
          className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 text-white text-center">
          <p className="italic text-lg tracking-wide mb-2">Colección Premium</p>
          <h1 className="font-oswald text-5xl md:text-7xl font-bold tracking-wider mb-3">HECHO PARA GANAR</h1>
          <p className="text-lg mb-6">Estilo. Poder. Actitud. Esto es Alvaro Big Boss.</p>
          <button onClick={() => { setSelectedCategory(null); navigate('catalog') }}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition cursor-pointer">
            Comprar el equipo
          </button>
        </div>
      </section>

      {/* SPLIT CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
        {[
          { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', title: 'Running Elite', desc: 'Zapatillas para romper tus límites', cat: 'Deportes' },
          { img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=600&fit=crop', title: 'Urban Street', desc: 'Poleras y ropa urbana exclusiva', cat: 'Exclusivos' },
        ].map((c, i) => (
          <div key={i} className="relative h-[400px] md:h-[500px] overflow-hidden group cursor-pointer"
            onClick={() => { setSelectedCategory(c.cat); navigate('catalog') }}>
            <img src={c.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
              <h2 className="font-oswald text-3xl md:text-4xl font-bold uppercase mb-1">{c.title}</h2>
              <p className="text-sm mb-4">{c.desc}</p>
              <span className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium w-fit hover:bg-gray-200 transition">Comprar</span>
            </div>
          </div>
        ))}
      </section>

      {/* SECOND HERO */}
      <section className="relative w-full h-[85vh] overflow-hidden mt-3">
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&h=900&fit=crop"
          className="absolute inset-0 w-full h-full object-cover" alt="Boss Max Ultra" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-black/70 rounded flex items-center justify-center cursor-pointer hover:bg-black/90 transition">
          <Play className="text-white ml-1" size={22} fill="white" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 text-white text-center">
          <h2 className="font-oswald text-5xl md:text-7xl font-bold tracking-wider mb-2">BOSS MAX ULTRA</h2>
          <p className="text-lg mb-6">Comodidad total.</p>
          <button onClick={() => { setSelectedCategory('Lo nuevo'); navigate('catalog') }}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition cursor-pointer">Comprar</button>
        </div>
      </section>

      {/* PRODUCT CAROUSEL */}
      <h2 className="font-oswald text-2xl font-medium px-6 md:px-10 pt-10 pb-4">Compra los clásicos</h2>
      <div className="flex gap-4 px-6 md:px-10 pb-10 overflow-x-auto scrollbar-hide">
        {products.slice(0, 8).map(p => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} toggleFav={toggleFav}
            isFav={favorites.includes(p.id)} onClick={() => { setSelectedProduct(p); navigate('product') }} />
        ))}
      </div>

      {/* CATEGORY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
        {[
          { img: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&h=500&fit=crop', label: 'Hombre' },
          { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=500&fit=crop', label: 'Mujer' },
          { img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=500&fit=crop', label: 'Niños' },
        ].map((c, i) => (
          <div key={i} className="relative h-[400px] overflow-hidden group cursor-pointer"
            onClick={() => { setSelectedCategory(c.label); navigate('catalog') }}>
            <img src={c.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.label} />
            <button className="absolute bottom-6 left-6 bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition cursor-pointer">
              {c.label}
            </button>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 md:px-10 py-16">
        {[
          { icon: <Truck size={28} />, title: 'Envío Gratis', desc: 'En compras sobre $100.000' },
          { icon: <ShieldCheck size={28} />, title: 'Pago Seguro', desc: 'Encriptación SSL 256-bit' },
          { icon: <RotateCcw size={28} />, title: 'Devoluciones', desc: '30 días para cambios' },
          { icon: <CreditCard size={28} />, title: '12 Cuotas', desc: 'Sin interés con todas las tarjetas' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-medium text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#f5f5f5] text-center py-14 px-4">
        <Mail size={36} className="mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-1">Recibe las novedades de Alvaro Big Boss</h3>
        <p className="text-sm text-gray-500 mb-5">Suscríbete al Newsletter de novedades.</p>
        <div className="inline-flex border border-gray-300 rounded bg-white overflow-hidden">
          <input type="email" placeholder="Ingresa tu email" className="px-4 py-2.5 text-sm outline-none w-64" />
          <button className="px-4 text-lg cursor-pointer hover:bg-gray-100">&rsaquo;</button>
        </div>
      </section>
    </>
  )
}


/* ══════════════════════════════════════════════
   PRODUCT CARD (reusable)
   ══════════════════════════════════════════════ */
function ProductCard({ product, addToCart, toggleFav, isFav, onClick }) {
  return (
    <div className="flex-shrink-0 w-[260px] md:w-[280px] group">
      <div className="relative bg-[#f5f5f5] rounded-xl overflow-hidden mb-4 cursor-pointer aspect-square" onClick={onClick}>
        <img src={product.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
        <button onClick={e => { e.stopPropagation(); toggleFav(product.id) }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition cursor-pointer">
          <Heart size={16} fill={isFav ? '#c41e3a' : 'none'} color={isFav ? '#c41e3a' : '#111'} />
        </button>
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-[#c41e3a] text-white text-[11px] font-medium px-3 py-1 rounded-full">Últimas unidades</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black text-sm font-bold px-5 py-1.5 rounded-full">Agotado</span>
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); if (product.stock > 0) addToCart(product) }}
          className="absolute bottom-3 right-3 bg-black text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-gray-800 hover:scale-110 disabled:opacity-30"
          disabled={product.stock === 0}>
          <ShoppingBag size={16} />
        </button>
      </div>
      <p className="font-medium text-[15px] line-clamp-2 cursor-pointer leading-snug" onClick={onClick}>{product.name}</p>
      <p className="text-xs text-gray-400 mt-1">{product.category}</p>
      <p className="font-semibold text-[15px] mt-1.5">{fmt(product.price)}</p>
    </div>
  )
}


/* ══════════════════════════════════════════════
   CATALOG PAGE
   ══════════════════════════════════════════════ */
function CatalogPage({ products, addToCart, toggleFav, favorites, selectedCategory, setSelectedCategory, searchQuery, setSelectedProduct, navigate }) {
  const [sortBy, setSortBy] = useState('default')

  let sorted = [...products]
  if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price)
  if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-tight">
            {searchQuery ? `Resultados: "${searchQuery}"` : selectedCategory || 'Todos los productos'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">{sorted.length} producto{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Category pills */}
          <div className="hidden md:flex gap-2.5 flex-wrap">
            <button onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all ${!selectedCategory ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all ${selectedCategory === cat ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                {cat}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 text-sm outline-none cursor-pointer hover:border-black transition">
            <option value="default">Ordenar por</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-24">
          <Search size={56} className="mx-auto mb-6 text-gray-200" />
          <p className="text-xl font-medium">No encontramos productos</p>
          <p className="text-sm text-gray-400 mt-2">Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
          {sorted.map(p => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} toggleFav={toggleFav}
              isFav={favorites.includes(p.id)} onClick={() => { setSelectedProduct(p); navigate('product') }} />
          ))}
        </div>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════
   PRODUCT DETAIL PAGE
   ══════════════════════════════════════════════ */
function ProductPage({ product, addToCart, toggleFav, favorites, products, setSelectedProduct, navigate }) {
  const [selectedSize, setSelectedSize] = useState('M')
  const [qty, setQty] = useState(1)
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const isFav = favorites.includes(product.id)
  const related = products.filter(p => p.id !== product.id && (p.category === product.category || p.tags?.some(t => product.tags?.includes(t)))).slice(0, 4)

  return (
    <div className="px-4 md:px-10 py-8">
      <button onClick={() => navigate('catalog')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1 cursor-pointer">
        <ChevronLeft size={16} /> Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-[#f5f5f5] rounded-xl overflow-hidden">
          <img src={product.img} className="w-full h-[500px] md:h-[600px] object-cover" alt={product.name} />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h1 className="font-oswald text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-medium mb-4">{fmt(product.price)}</p>

          {/* Stock */}
          {product.stock > 0 ? (
            <p className="text-sm text-green-600 flex items-center gap-1 mb-6">
              <Check size={14} /> {product.stock > 10 ? 'En stock' : `Solo quedan ${product.stock} unidades`}
            </p>
          ) : (
            <p className="text-sm text-red-500 flex items-center gap-1 mb-6">
              <XCircle size={14} /> Agotado
            </p>
          )}

          {/* Sizes */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Talla</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 rounded-lg border text-sm font-medium cursor-pointer transition ${
                    selectedSize === s ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Cantidad</p>
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 cursor-pointer"><Minus size={16} /></button>
              <span className="px-4 py-2 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 cursor-pointer"><Plus size={16} /></button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-8">
            <button onClick={() => { for (let i = 0; i < qty; i++) addToCart(product, selectedSize) }}
              disabled={product.stock === 0}
              className="flex-1 bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              Agregar al carro
            </button>
            <button onClick={() => toggleFav(product.id)}
              className="w-14 h-14 border border-gray-300 rounded-full flex items-center justify-center hover:border-black transition cursor-pointer">
              <Heart size={20} fill={isFav ? '#c41e3a' : 'none'} color={isFav ? '#c41e3a' : '#111'} />
            </button>
          </div>

          {/* Specs */}
          {product.specs && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-sm mb-3">Detalles del producto</h3>
              <ul className="space-y-2">
                {product.specs.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shipping info */}
          <div className="border-t mt-6 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck size={18} className="text-gray-400" />
              <span>Envío gratis en compras sobre $100.000</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw size={18} className="text-gray-400" />
              <span>30 días para devoluciones gratuitas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck size={18} className="text-gray-400" />
              <span>Garantía de autenticidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-oswald text-2xl font-medium mb-6">También te puede gustar</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} addToCart={addToCart} toggleFav={toggleFav}
                isFav={favorites.includes(p.id)} onClick={() => { setSelectedProduct(p); navigate('product') }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════
   CART SIDEBAR
   ══════════════════════════════════════════════ */
function CartSidebar({ open, onClose, cart, updateQty, removeFromCart, cartTotal, navigate, setCartOpen }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-oswald text-xl font-bold">Tu Carro ({cart.length})</h2>
          <button onClick={onClose} className="cursor-pointer"><X size={22} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Tu carro está vacío</p>
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4">
              <img src={item.img} className="w-20 h-20 object-cover rounded-lg bg-gray-100" alt={item.name} />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">Talla: {item.size}</p>
                <p className="text-sm font-medium mt-1">{fmt(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item.id, item.size, -1)}
                    className="w-7 h-7 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.size, 1)}
                    className="w-7 h-7 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeFromCart(item.id, item.size)} className="cursor-pointer text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
                <span className="text-sm font-medium">{fmt(item.price * item.qty)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            <p className="text-xs text-gray-500">Impuestos y envío calculados en checkout</p>
            <button onClick={() => { setCartOpen(false); navigate('checkout') }}
              className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer">
              Ir al Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   FAVORITES SIDEBAR
   ══════════════════════════════════════════════ */
function FavsSidebar({ open, onClose, favorites, products, toggleFav, addToCart, setSelectedProduct, navigate, setFavsOpen }) {
  if (!open) return null
  const favProducts = products.filter(p => favorites.includes(p.id))
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-oswald text-xl font-bold">Favoritos ({favProducts.length})</h2>
          <button onClick={onClose} className="cursor-pointer"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No tienes favoritos aún</p>
            </div>
          ) : favProducts.map(p => (
            <div key={p.id} className="flex gap-4 items-center">
              <img src={p.img} className="w-20 h-20 object-cover rounded-lg bg-gray-100 cursor-pointer"
                onClick={() => { setSelectedProduct(p); setFavsOpen(false); navigate('product') }} alt={p.name} />
              <div className="flex-1">
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-sm">{fmt(p.price)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => addToCart(p)} className="bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800">
                  <ShoppingBag size={14} />
                </button>
                <button onClick={() => toggleFav(p.id)} className="text-gray-400 hover:text-red-500 cursor-pointer p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   AUTH MODAL
   ══════════════════════════════════════════════ */
function AuthModal({ mode, setMode, setUser, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'register' && !name.trim()) return setError('Ingresa tu nombre')
    if (!email.trim()) return setError('Ingresa tu email')
    if (!pass.trim() || pass.length < 4) return setError('Contraseña mínimo 4 caracteres')

    // Simulated auth (local)
    const userData = { name: name || email.split('@')[0], email }
    setUser(userData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer"><X size={20} /></button>
        <h2 className="font-oswald text-2xl font-bold mb-6">{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium block mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
              className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••"
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}

          <button type="submit"
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer">
            {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-black font-medium underline cursor-pointer">
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   CHECKOUT PAGE
   ══════════════════════════════════════════════ */
function CheckoutPage({ cart, cartTotal, user, setUser, setOrderResult, setCart, navigate }) {
  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', region: '', zip: '' })
  const [delivery, setDelivery] = useState('shipping') // 'shipping' | 'pickup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0) return (
    <div className="text-center py-20 px-4">
      <ShoppingBag size={56} className="mx-auto mb-4 text-gray-300" />
      <h2 className="font-oswald text-2xl font-bold mb-2">Tu carro está vacío</h2>
      <button onClick={() => navigate('home')} className="mt-4 bg-black text-white px-8 py-3 rounded-full cursor-pointer hover:bg-gray-800">Seguir comprando</button>
    </div>
  )

  const subtotal = cartTotal
  const iva = Math.round(subtotal * 0.19)
  const shippingCost = delivery === 'pickup' || subtotal >= 100000 ? 0 : 5000
  const total = subtotal + iva + shippingCost

  const handlePay = async () => {
    if (!shipping.name || !shipping.email) return setError('Completa nombre y email')
    if (delivery === 'shipping' && (!shipping.address || !shipping.city)) return setError('Completa la dirección')

    setLoading(true)
    setError('')
    try {
      const r = await fetch(`${API_BASE_URL}/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, size: i.size })),
          customer_email: shipping.email,
          delivery_method: delivery,
          shipping_address: delivery === 'shipping' ? `${shipping.address}, ${shipping.city}, ${shipping.region}` : 'Retiro en tienda'
        })
      })
      const data = await r.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.detail || 'Error al crear el pago')
        setLoading(false)
      }
    } catch {
      setError('No se pudo conectar con el servidor de pagos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Checkout Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate('home')} className="font-oswald text-xl font-bold tracking-wider uppercase cursor-pointer">
            Alvaro <span className="text-[#c41e3a]">Big Boss</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ShieldCheck size={16} /> Pago 100% seguro
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => navigate('home')} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1.5 cursor-pointer transition">
          <ChevronLeft size={16} /> Volver a la tienda
        </button>

        <h1 className="font-oswald text-4xl font-bold mb-10 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Shipping */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="font-oswald text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Información de envío
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Nombre completo *</label>
                  <input value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Email *</label>
                  <input type="email" value={shipping.email} onChange={e => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Teléfono</label>
                  <input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="+56 9 1234 5678" />
                </div>
              </div>

              {/* Delivery method */}
              <div className="mt-8">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Método de entrega</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => setDelivery('shipping')}
                    className={`border-2 rounded-2xl p-5 text-left cursor-pointer transition-all ${delivery === 'shipping' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Truck size={20} />
                    </div>
                    <p className="font-semibold text-sm">Despacho a domicilio</p>
                    <p className="text-xs text-gray-400 mt-1">{subtotal >= 100000 ? 'Gratis' : fmt(5000)} · 3-5 días hábiles</p>
                  </button>
                  <button onClick={() => setDelivery('pickup')}
                    className={`border-2 rounded-2xl p-5 text-left cursor-pointer transition-all ${delivery === 'pickup' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <MapPin size={20} />
                    </div>
                    <p className="font-semibold text-sm">Retiro en tienda</p>
                    <p className="text-xs text-gray-400 mt-1">Gratis · Av. Providencia 1234</p>
                  </button>
                </div>
              </div>

              {/* Address fields (if shipping) */}
              {delivery === 'shipping' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Dirección *</label>
                    <input value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Ciudad *</label>
                    <input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Región</label>
                    <input value={shipping.region} onChange={e => setShipping({ ...shipping, region: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pay */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="font-oswald text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Pago
              </h2>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400"><ShieldCheck size={16} /> SSL Seguro</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><CreditCard size={16} /> Todas las tarjetas</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><RotateCcw size={16} /> 30 días devolución</div>
              </div>

              <p className="text-sm text-gray-500 mb-6">Serás redirigido a MercadoPago para completar tu compra de forma segura con tarjeta, transferencia o efectivo.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button onClick={handlePay} disabled={loading}
                className="w-full bg-[#009ee3] text-white py-4 rounded-2xl font-semibold text-base hover:bg-[#0087c9] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-[#009ee3]/20">
                {loading ? <span className="animate-spin">⏳</span> : <CreditCard size={20} />}
                {loading ? 'Procesando...' : `Pagar ${fmt(total)} con MercadoPago`}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-4">Al hacer click en "Pagar", aceptas nuestros términos y condiciones</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-8 shadow-sm sticky top-24">
              <h2 className="font-oswald text-xl font-semibold mb-6">Resumen del pedido</h2>
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                    <div className="relative flex-shrink-0">
                      <img src={item.img} className="w-20 h-20 object-cover rounded-xl bg-gray-100" alt={item.name} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-[11px] font-bold rounded-full flex items-center justify-center">{item.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Talla: {item.size}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">IVA (19%)</span><span className="font-medium">{fmt(iva)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Envío</span><span className="font-medium">{shippingCost === 0 ? <span className="text-green-600">Gratis</span> : fmt(shippingCost)}</span></div>
              </div>

              <div className="border-t-2 border-black mt-4 pt-4">
                <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              {/* Trust */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} /> Compra protegida por MercadoPago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   RESULT PAGE
   ══════════════════════════════════════════════ */
function ResultPage({ result, navigate }) {
  return (
    <div className="max-w-lg mx-auto text-center py-20 px-4">
      {result.status === 'approved' && (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="font-oswald text-3xl font-bold mb-2">¡Compra exitosa!</h1>
          <p className="text-gray-500 mb-2">Tu pedido ha sido confirmado</p>
          <p className="text-sm bg-gray-100 inline-block px-4 py-2 rounded-full font-mono mb-6">Orden: {result.orderId}</p>
          <p className="text-sm text-gray-500 mb-8">Recibirás un email con los detalles de tu compra.</p>
        </>
      )}
      {result.status === 'rejected' && (
        <>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-600" />
          </div>
          <h1 className="font-oswald text-3xl font-bold mb-2">Pago rechazado</h1>
          <p className="text-gray-500 mb-6">Tu pago no pudo ser procesado. Intenta con otro medio de pago.</p>
        </>
      )}
      {result.status === 'pending' && (
        <>
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-yellow-600" />
          </div>
          <h1 className="font-oswald text-3xl font-bold mb-2">Pago pendiente</h1>
          <p className="text-gray-500 mb-6">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
          <p className="text-sm bg-gray-100 inline-block px-4 py-2 rounded-full font-mono mb-6">Orden: {result.orderId}</p>
        </>
      )}
      <button onClick={() => navigate('home')}
        className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer">
        Volver a la tienda
      </button>
    </div>
  )
}


/* ══════════════════════════════════════════════
   GIFT CARD PAGE
   ══════════════════════════════════════════════ */
function GiftCardPage({ navigate }) {
  const [amount, setAmount] = useState(25000)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const amounts = [15000, 25000, 50000, 100000]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate('home')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1 cursor-pointer">
        <ChevronLeft size={16} /> Volver
      </button>
      <h1 className="font-oswald text-4xl font-bold mb-2">Gift Card</h1>
      <p className="text-gray-500 mb-8">Regala estilo Alvaro Big Boss a quien tú quieras</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-8 text-white aspect-video flex flex-col justify-between">
          <div className="font-oswald text-xl font-bold tracking-wider">ALVARO <span className="text-[#c41e3a]">BIG BOSS</span></div>
          <div>
            <p className="text-xs text-gray-400 mb-1">GIFT CARD</p>
            <p className="text-3xl font-bold">{fmt(amount)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Monto</label>
            <div className="flex gap-2 flex-wrap">
              {amounts.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  className={`px-4 py-2 rounded-full text-sm border cursor-pointer ${amount === a ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                  {fmt(a)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email del destinatario</label>
            <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
              placeholder="amigo@email.com"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Mensaje (opcional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="¡Feliz cumpleaños!"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black h-24 resize-none" />
          </div>
          <button className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer">
            Comprar Gift Card {fmt(amount)}
          </button>
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   AYUDA PAGE
   ══════════════════════════════════════════════ */
function AyudaPage({ navigate }) {
  const [openFaq, setOpenFaq] = useState(null)
  const faqs = [
    { q: '¿Cuáles son los tiempos de envío?', a: 'El envío estándar demora entre 3-5 días hábiles para Santiago y 5-7 días hábiles para regiones. Envío express disponible para Santiago en 24 horas.' },
    { q: '¿Cómo puedo hacer una devolución?', a: 'Tienes 30 días desde la fecha de compra para solicitar una devolución. El producto debe estar sin uso y con su etiqueta original. Envía un email a devoluciones@alvarobigboss.cl' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos todas las tarjetas de crédito y débito a través de MercadoPago. También puedes pagar en cuotas sin interés.' },
    { q: '¿Cómo uso mi Gift Card?', a: 'Ingresa el código de tu Gift Card al momento del checkout en el campo "Código de descuento". El monto se descontará automáticamente.' },
    { q: '¿Cómo sé mi talla?', a: 'Consulta nuestra guía de tallas disponible en cada página de producto. Si tienes dudas, escríbenos por WhatsApp y te ayudamos.' },
    { q: '¿Realizan envíos internacionales?', a: 'Actualmente solo realizamos envíos dentro de Chile. Estamos trabajando para expandir a más países de Latinoamérica pronto.' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate('home')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1 cursor-pointer">
        <ChevronLeft size={16} /> Volver
      </button>
      <h1 className="font-oswald text-4xl font-bold mb-2">Centro de Ayuda</h1>
      <p className="text-gray-500 mb-8">¿En qué podemos ayudarte?</p>

      {/* Contact cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer"
          className="border rounded-xl p-5 text-center hover:border-black transition">
          <Phone size={24} className="mx-auto mb-2" />
          <p className="font-medium text-sm">WhatsApp</p>
          <p className="text-xs text-gray-500">+56 9 1234 5678</p>
        </a>
        <a href="mailto:contacto@alvarobigboss.cl"
          className="border rounded-xl p-5 text-center hover:border-black transition">
          <Mail size={24} className="mx-auto mb-2" />
          <p className="font-medium text-sm">Email</p>
          <p className="text-xs text-gray-500">contacto@alvarobigboss.cl</p>
        </a>
        <div className="border rounded-xl p-5 text-center">
          <MapPin size={24} className="mx-auto mb-2" />
          <p className="font-medium text-sm">Tienda</p>
          <p className="text-xs text-gray-500">Av. Providencia 1234, Santiago</p>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-oswald text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex justify-between items-center px-5 py-4 text-left cursor-pointer hover:bg-gray-50">
              <span className="font-medium text-sm">{faq.q}</span>
              <ChevronDown size={18} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   ADMIN PANEL
   ══════════════════════════════════════════════ */
function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('abb_admin_token'))
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('inventory')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [editingStock, setEditingStock] = useState({})

  const login = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      })
      if (r.ok) {
        const data = await r.json()
        setToken(data.token)
        sessionStorage.setItem('abb_admin_token', data.token)
      } else setError('Contraseña incorrecta')
    } catch { setError('Error de conexión') }
  }

  const headers = { Authorization: `Bearer ${token}` }

  const loadData = async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products`, { headers }),
        fetch(`${API_BASE_URL}/admin/orders`, { headers })
      ])
      if (pRes.ok) setProducts(await pRes.json())
      if (oRes.ok) setOrders(await oRes.json())
    } catch {}
  }

  useEffect(() => { if (token) loadData() }, [token])

  const updateStock = async (id, stock) => {
    await fetch(`${API_BASE_URL}/admin/products/${id}/stock`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(stock) })
    })
    loadData()
    setEditingStock(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  if (!token) return (
    <div className="max-w-sm mx-auto py-20 px-4">
      <h1 className="font-oswald text-3xl font-bold mb-6 text-center">Admin Panel</h1>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña"
        onKeyDown={e => e.key === 'Enter' && login()}
        className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black mb-3" />
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button onClick={login} className="w-full bg-black text-white py-3 rounded-full font-medium cursor-pointer hover:bg-gray-800">Ingresar</button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-oswald text-3xl font-bold">Admin Panel</h1>
        <button onClick={() => { setToken(null); sessionStorage.removeItem('abb_admin_token') }}
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer">
          <LogOut size={16} /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {['inventory', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium cursor-pointer border-b-2 ${tab === t ? 'border-black' : 'border-transparent text-gray-500'}`}>
            {t === 'inventory' ? 'Inventario' : 'Órdenes'}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-3">Producto</th><th className="pb-3">Categoría</th><th className="pb-3">Precio</th><th className="pb-3">Stock</th><th className="pb-3">Acciones</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 flex items-center gap-3">
                    <img src={p.img} className="w-10 h-10 rounded object-cover" alt="" />
                    {p.name}
                  </td>
                  <td className="py-3">{p.category}</td>
                  <td className="py-3">{fmt(p.price)}</td>
                  <td className="py-3">
                    {editingStock[p.id] !== undefined ? (
                      <input type="number" value={editingStock[p.id]} onChange={e => setEditingStock({ ...editingStock, [p.id]: e.target.value })}
                        className="w-20 border rounded px-2 py-1 text-sm" />
                    ) : (
                      <span className={p.stock < 5 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                    )}
                  </td>
                  <td className="py-3">
                    {editingStock[p.id] !== undefined ? (
                      <button onClick={() => updateStock(p.id, editingStock[p.id])}
                        className="text-green-600 hover:text-green-800 cursor-pointer"><Save size={16} /></button>
                    ) : (
                      <button onClick={() => setEditingStock({ ...editingStock, [p.id]: p.stock })}
                        className="text-gray-500 hover:text-black cursor-pointer"><Edit3 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No hay órdenes aún</p>
          ) : orders.map(o => (
            <div key={o.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-mono text-sm font-medium">{o.id}</p>
                <p className="text-xs text-gray-500">{o.customer_email} · {new Date(o.created_at).toLocaleDateString('es-CL')}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{fmt(o.total)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  o.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════ */
function Footer({ navigate, setSelectedCategory, setPage }) {
  return (
    <>
      <footer className="border-t px-4 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-wrap gap-12 md:gap-20">
          <div>
            <h4 className="text-xs font-bold uppercase mb-4">Recursos</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><button onClick={() => navigate('giftcard')} className="hover:text-black cursor-pointer">Gift Cards</button></li>
              <li><button className="hover:text-black cursor-pointer">Consulta tu Gift Card</button></li>
              <li><button className="hover:text-black cursor-pointer">Encuentra una tienda</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4">Ayuda</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><button onClick={() => navigate('ayuda')} className="hover:text-black cursor-pointer">Centro de ayuda</button></li>
              <li><button className="hover:text-black cursor-pointer">Bases legales</button></li>
              <li><button className="hover:text-black cursor-pointer">Guía de tallas</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4">Acerca de ABB</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><button className="hover:text-black cursor-pointer">Noticias</button></li>
              <li><button className="hover:text-black cursor-pointer">Empleos</button></li>
              <li><button className="hover:text-black cursor-pointer">Sustentabilidad</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-4">Eventos</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><button className="hover:text-black cursor-pointer">Live Shopping</button></li>
              <li><button className="hover:text-black cursor-pointer">Cyber Big Boss</button></li>
              <li><button className="hover:text-black cursor-pointer">Black Friday Boss</button></li>
              <li><button className="hover:text-black cursor-pointer">Members Days</button></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4">
          <div className="flex gap-3">
            {['tw', 'fb', 'yt', 'ig'].map(s => (
              <a key={s} href="#" className="w-9 h-9 bg-gray-500 hover:bg-black rounded-full flex items-center justify-center text-white text-xs font-bold transition">{s}</a>
            ))}
          </div>
          <span className="text-xs text-gray-500">🌐 Chile</span>
        </div>
      </footer>

      {/* Bottom bar */}
      <div className="border-t flex flex-col md:flex-row justify-between items-center px-4 md:px-10 py-4 text-xs text-gray-500 gap-2">
        <span>© 2026 Alvaro Big Boss Chile SpA. Todos los derechos reservados</span>
        <div className="flex gap-4 flex-wrap">
          <button className="hover:text-black cursor-pointer">Guías de Tallas</button>
          <button className="hover:text-black cursor-pointer">Condiciones de venta</button>
          <button className="hover:text-black cursor-pointer">Condiciones de uso</button>
          <button className="hover:text-black cursor-pointer">Política de privacidad</button>
          <button onClick={() => setPage('admin')} className="hover:text-black cursor-pointer">Admin</button>
        </div>
      </div>
    </>
  )
}
