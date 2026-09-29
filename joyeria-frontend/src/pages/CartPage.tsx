import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import Button from '../components/Button'
import { formatPrice } from '../utils/format'

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-background-warm flex items-center justify-center mb-4">
          <ShoppingBag size={32} className="text-[#C9A227]" />
        </div>
        <h1 className="font-serif text-2xl font-medium text-foreground mb-2">Tu carrito está vacío</h1>
        <p className="text-foreground-faint mb-6">Descubre nuestra colección de joyas exclusivas</p>
        <Link to="/productos"><Button size="lg">Explorar productos</Button></Link>
      </div>
    )
  }

  const shipping = cart.subtotal >= 500000 ? 0 : 15000
  const total = cart.subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Carrito de compras</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <motion.div key={item.id} layout className="bg-surface rounded-lg border border-line/70 p-4 flex gap-4">
              <Link to={`/productos/${item.productSlug}`} className="shrink-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-background-warm">
                  {item.productImage ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-foreground/20">J</div>}
                </div>
              </Link>
              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <Link to={`/productos/${item.productSlug}`}>
                    <h3 className="font-medium text-foreground hover:text-[#C9A227] transition-colors">{item.productName}</h3>
                    <p className="text-sm text-foreground-faint mt-1">{formatPrice(item.productPrice)} c/u</p>
                  </Link>
                  <button onClick={() => removeItem(item.id)} className="text-foreground/20 hover:text-red-500 transition-colors h-fit">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-line rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-foreground-faint hover:text-[#C9A227]"><Minus size={14} /></button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-foreground-faint hover:text-[#C9A227]"><Plus size={14} /></button>
                  </div>
                  <p className="font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg border border-line/70 p-6 sticky top-24">
            <h2 className="font-serif text-lg font-medium text-foreground mb-4">Resumen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-foreground-faint">Subtotal</span><span className="font-medium">{formatPrice(cart.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-foreground-faint">Envío</span><span className="font-medium">{shipping === 0 ? <span className="text-accent-green">Gratis</span> : formatPrice(shipping)}</span></div>
              {shipping > 0 && <p className="text-xs text-foreground-faint">Envío gratis en compras superiores a {formatPrice(500000)}</p>}
              <div className="border-t border-line/70 pt-3 flex justify-between text-base">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-[#C9A227]">{formatPrice(total)}</span>
              </div>
            </div>
            <Button size="lg" className="w-full mt-5" onClick={() => navigate('/checkout')}>
              Proceder al pago <ArrowRight size={18} />
            </Button>
            <Link to="/productos" className="block text-center text-sm text-foreground-faint hover:text-[#C9A227] mt-3">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
