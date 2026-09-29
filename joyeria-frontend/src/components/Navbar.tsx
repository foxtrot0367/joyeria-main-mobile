import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, Search, ShoppingCart, Heart, User, LogOut, ChevronDown, Gem, Truck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { categoryService } from '../services/category.service'
import { materialService } from '../services/material.service'
import type { Category, Material } from '../types'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [shopAccordion, setShopAccordion] = useState(false)
  const reduced = useReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {})
    materialService.getAll().then(setMaterials).catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const closeAll = () => { setMobileOpen(false); setMegaOpen(false) }

  const navLinks = [
    { label: 'Novedades', to: '/productos?sort=createdAt&dir=desc' },
    { label: 'Más vendidos', to: '/productos?sort=soldCount&dir=desc' },
    { label: 'Soporte', to: '/soporte' },
  ]

  return (
    <motion.header
      initial={false}
      animate={{ paddingTop: scrolled ? 6 : 10, paddingBottom: scrolled ? 6 : 10 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-line/70' : 'bg-background'}`}>
      {/* Announcement bar */}
      <div className={`overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0' : 'max-h-10'}`}>
        <Link to="/faq" title="Política de envíos"
          className="flex items-center justify-center gap-2 bg-ink hover:bg-ink-soft text-[#EDE3CC] text-center text-[10px] sm:text-[11px] tracking-[0.18em] uppercase py-2 px-3 transition-colors">
          <Truck size={13} className="text-[#F5D06F] shrink-0" />
          <span className="truncate">
            Envíos a todo Colombia · <span className="text-[#F5D06F]">Sin costo desde $500.000</span>
          </span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground" aria-label="Abrir menú">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="shrink-0" aria-label="AURA - inicio">
              <Logo compact className="w-32 sm:w-36" />
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {/* Tienda: mega menu */}
              <div className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}>
                <button onClick={() => setMegaOpen(!megaOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-[#C9A227] transition-colors">
                  Tienda <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full pt-3">
                      <div className="w-[720px] bg-surface rounded-xl shadow-2xl border border-line/70 p-6 grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground-faint font-medium mb-3">Categorías</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {categories.map(c => (
                              <Link key={c.id} to={`/productos?category=${c.id}`} onClick={closeAll}
                                className="text-sm text-foreground-muted hover:text-[#C9A227] py-1 transition-colors truncate">{c.name}</Link>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground-faint font-medium mb-3">Materiales</p>
                          <div className="grid grid-cols-1 gap-y-1">
                            {materials.map(m => (
                              <Link key={m.id} to={`/productos?material=${m.id}`} onClick={closeAll}
                                className="text-sm text-foreground-muted hover:text-accent-green py-1 transition-colors">{m.name}</Link>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-4 flex flex-col gap-3">
                          <Link to="/personaliza" onClick={closeAll}
                            className="group block rounded-xl overflow-hidden relative min-h-[96px] bg-gradient-to-br from-[#5A7A5D] to-[#3E5A41] p-4">
                            <Gem size={18} className="text-[#F5D06F] mb-2" />
                            <p className="text-sm font-medium text-white">Piezas a tu medida</p>
                            <p className="text-xs text-white/70 mt-0.5">Grabados, piedras y acabados</p>
                            <span className="absolute right-3 bottom-2 text-[#F5D06F] text-xs opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Ver →</span>
                          </Link>
                          <Link to="/productos?category=8" onClick={closeAll}
                            className="group block rounded-xl overflow-hidden relative min-h-[64px] bg-gradient-to-br from-[#C9A227] to-[#8A6D15] p-3">
                            <p className="text-sm font-medium text-white">Regalos con historia</p>
                            <span className="absolute right-3 bottom-2 text-white/90 text-xs opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Ver →</span>
                          </Link>
                          <Link to="/productos" onClick={closeAll}
                            className="text-xs font-medium text-[#C9A227] hover:underline mt-auto">Ver todo el catálogo</Link>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-foreground-faint">
                        <Truck size={12} className="text-accent-green" />
                        Despacho de 24 a 72h · Garantía de por vida · Estuche de regalo
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map(l => (
                <Link key={l.label} to={l.to}
                  className="text-sm font-medium text-foreground-muted hover:text-[#C9A227] transition-colors">{l.label}</Link>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-surface-muted rounded-full border border-line px-4 py-1.5 w-56 lg:w-72">
            <Search size={16} className="text-foreground-faint mr-2" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar joyas..." className="bg-transparent text-sm outline-none w-full" />
          </form>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden lg:flex" />
            {isAuthenticated && (
              <Link to="/cuenta/favoritos" className="relative p-2 text-foreground-muted hover:text-[#C9A227] transition-colors" aria-label="Favoritos">
                <Heart size={20} />
              </Link>
            )}
            <Link to="/carrito" className="relative p-2 text-foreground-muted hover:text-[#C9A227] transition-colors" aria-label="Carrito">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C9A227] text-white text-[10px] min-w-4 h-4 px-0.5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative group hidden lg:block">
                <button className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-[#C9A227] transition-colors">
                  <User size={18} /> <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full w-52 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-surface rounded-lg shadow-lg border border-line/70 py-2">
                    <p className="px-4 py-2 text-sm font-medium text-foreground border-b border-line/70 mb-1">{user?.firstName} {user?.lastName}</p>
                    <Link to="/cuenta" className="block px-4 py-2 text-sm text-foreground-muted hover:bg-surface-muted">Mi cuenta</Link>
                    <Link to="/cuenta/pedidos" className="block px-4 py-2 text-sm text-foreground-muted hover:bg-surface-muted">Mis pedidos</Link>
                    <Link to="/cuenta/favoritos" className="block px-4 py-2 text-sm text-foreground-muted hover:bg-surface-muted">Favoritos</Link>
                    {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-[#C9A227] hover:bg-surface-muted font-medium">Admin Panel</Link>}
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-surface-muted mt-1 border-t border-line/70">
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-[#C9A227] transition-colors">
                <User size={18} /> Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-surface border-t border-line/70 py-4 px-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            <button onClick={() => setShopAccordion(!shopAccordion)} className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground">
              Tienda <ChevronDown size={15} className={`transition-transform ${shopAccordion ? 'rotate-180' : ''}`} />
            </button>
            {shopAccordion && (
              <div className="pb-3 border-b border-line/40">
                <p className="text-[11px] uppercase tracking-[0.2em] text-foreground-faint font-medium mt-1 mb-1 px-1">Categorías</p>
                {categories.map(c => (
                  <Link key={c.id} to={`/productos?category=${c.id}`} onClick={closeAll}
                    className="block py-1.5 px-1 text-sm text-foreground-muted">{c.name}</Link>
                ))}
                <p className="text-[11px] uppercase tracking-[0.2em] text-foreground-faint font-medium mt-4 mb-1 px-1">Materiales</p>
                {materials.map(m => (
                  <Link key={m.id} to={`/productos?material=${m.id}`} onClick={closeAll}
                    className="block py-1.5 px-1 text-sm text-foreground-muted">{m.name}</Link>
                ))}
              </div>
            )}
            {['Novedades', 'Más vendidos'].map(label => (
              <Link key={label} to={label === 'Novedades' ? '/productos?sort=createdAt&dir=desc' : '/productos?sort=soldCount&dir=desc'} onClick={closeAll}
                className="block py-3 text-sm font-medium text-foreground-muted border-b border-line/40">{label}</Link>
            ))}
            <Link to="/personaliza" onClick={closeAll} className="block py-3 text-sm font-medium text-[#C9A227] border-b border-line/40">Personaliza tu joya</Link>
            <button onClick={() => { setShopAccordion(false); setMobileOpen(false); navigate('/productos') }}
              className="block py-3 text-sm font-medium text-foreground-muted border-b border-line/40 text-left w-full">Productos</button>
            <Link to="/soporte" onClick={closeAll} className="block py-3 text-sm font-medium text-foreground-muted border-b border-line/40">Soporte</Link>
            <ThemeToggle className="py-3 border-b border-line/40" withText />

            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false) }} className="flex items-center bg-surface-muted rounded-full border border-line px-4 py-2 mt-4 md:hidden">
              <Search size={16} className="text-foreground-faint mr-2" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar..."
                className="bg-transparent text-sm outline-none w-full" />
            </form>
            <div className="mt-4 pt-4 border-t border-line/70 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/cuenta" onClick={closeAll} className="block py-2 text-sm font-medium text-foreground-muted">Mi cuenta</Link>
                  <Link to="/cuenta/pedidos" onClick={closeAll} className="block py-2 text-sm text-foreground-muted">Mis pedidos</Link>
                  {isAdmin && <Link to="/admin" onClick={closeAll} className="block py-2 text-sm text-[#C9A227] font-medium">Admin Panel</Link>}
                  <button onClick={() => { logout(); closeAll() }} className="flex items-center gap-2 py-2 text-sm text-red-500"><LogOut size={14} /> Cerrar sesión</button>
                </>
              ) : (
                <Link to="/login" onClick={closeAll} className="block py-2 text-sm font-medium text-[#C9A227]">Iniciar sesión</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}