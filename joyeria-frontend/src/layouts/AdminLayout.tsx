import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, FolderTree, Gem, ShoppingCart, Users, Star, LifeBuoy, Ticket, Link2, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const menu = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Productos', to: '/admin/productos', icon: Package },
  { label: 'Categorías', to: '/admin/categorias', icon: FolderTree },
  { label: 'Materiales', to: '/admin/materiales', icon: Gem },
  { label: 'Pedidos', to: '/admin/pedidos', icon: ShoppingCart },
  { label: 'Usuarios', to: '/admin/usuarios', icon: Users },
  { label: 'Reseñas', to: '/admin/resenas', icon: Star },
  { label: 'Soporte', to: '/admin/soporte', icon: LifeBuoy },
  { label: 'Cupones', to: '/admin/cupones', icon: Ticket },
  { label: 'Redes Sociales', to: '/admin/redes-sociales', icon: Link2 },
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-surface border-r border-line flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-line/70">
          <Link to="/" className="font-serif text-lg font-medium text-foreground">
            <span className="text-[#C9A227]">J</span>oyeria <span className="text-xs font-sans text-foreground-faint">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {menu.map(item => {
            const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-[#C9A227]/10 text-[#C9A227] font-medium' : 'text-foreground-muted hover:bg-surface-muted'}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-line/70">
          <div className="text-sm font-medium text-foreground mb-1">{user?.firstName}</div>
          <div className="text-xs text-foreground-faint mb-3">{user?.email}</div>
          <button onClick={logout} className="text-xs text-red-500 hover:text-red-600">Cerrar sesión</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
