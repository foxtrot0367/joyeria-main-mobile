import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, ShoppingBag, Lock, Check } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { orderService } from '../services/order.service'
import { paymentService } from '../services/misc.service'
import { couponService } from '../services/misc.service'
import Button from '../components/Button'
import { formatPrice } from '../utils/format'

export default function Checkout() {
  const { cart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState<any>(null)
  const [shipping, setShipping] = useState<{ address: string; city: string; department: string; recipient: string; phone: string }>({ address: '', city: '', department: '', recipient: '', phone: '' })
  const [payment, setPayment] = useState<{ method: string; cardNumber: string; cardName: string; expiry: string; cvv: string }>({ method: 'card', cardNumber: '', cardName: '', expiry: '', cvv: '' })

  const applyCoupon = async () => {
    try {
      const c = await couponService.validate(coupon)
      setCouponApplied(c)
      toast('¡Cupón aplicado!')
    } catch { toast('Cupón inválido', 'error') }
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      const order = await orderService.createOrder({
        shippingAddress: shipping.address, shippingCity: shipping.city,
        shippingDepartment: shipping.department, recipientName: shipping.recipient,
        phone: shipping.phone, paymentMethod: payment.method === 'card' ? 'card' : 'pse',
        couponCode: couponApplied?.code || undefined, notes: ''
      })

      await paymentService.processPayment({ orderId: order.id, paymentMethod: payment.method, cardNumber: payment.cardNumber })
      navigate(`/pedido-confirmado/${order.orderNumber}`)
    } catch (err: any) {
      toast(err.response?.data?.message || `Error: ${err.response?.data?.data} ${err.response?.data?.message || ''}`, 'error')
    } finally { setLoading(false) }
  }

  const shippingCost = (cart?.subtotal || 0) >= 500000 ? 0 : 15000
  let discount = 0
  if (couponApplied) {
    discount = couponApplied.discountType === 'PERCENTAGE'
      ? ((cart?.subtotal || 0) * couponApplied.discountValue) / 100
      : Math.min(couponApplied.discountValue, cart?.subtotal || 0)
  }
  const total = (cart?.subtotal || 0) - discount + shippingCost

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-serif text-2xl text-foreground mb-4">No tienes productos en el carrito</h1>
        <Button onClick={() => navigate('/productos')}>Ir a la tienda</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Finalizar compra</h1>

      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-4">
            <button onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${step >= s ? 'bg-[#C9A227] text-white' : 'bg-surface-elevated text-foreground-faint'}`}>
              {step > s ? <Check size={16} /> : s}
            </button>
            <span className={`text-sm hidden md:block ${step >= s ? 'text-foreground font-medium' : 'text-foreground-faint'}`}>
              {s === 1 ? 'Envío' : s === 2 ? 'Pago' : 'Confirmación'}
            </span>
            {s < 3 && <div className="w-10 h-0.5 bg-surface-elevated" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface rounded-lg border border-line/70 p-6">
              <div className="flex items-center gap-2 mb-4"><MapPin size={18} className="text-[#C9A227]" /><h2 className="font-medium text-foreground">Datos de envío</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs font-medium text-foreground-faint mb-1">Dirección *</label>
                  <input value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} required className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" placeholder="Calle 123 # 45-67, Apto 301" /></div>
                <div><label className="block text-xs font-medium text-foreground-faint mb-1">Ciudad *</label>
                  <input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} required className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" placeholder="Bogotá" /></div>
                <div><label className="block text-xs font-medium text-foreground-faint mb-1">Departamento</label>
                  <input value={shipping.department} onChange={e => setShipping({ ...shipping, department: e.target.value })} className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" placeholder="Cundinamarca" /></div>
                <div><label className="block text-xs font-medium text-foreground-faint mb-1">Destinatario *</label>
                  <input value={shipping.recipient} onChange={e => setShipping({ ...shipping, recipient: e.target.value })} required className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" placeholder="María García" /></div>
                <div><label className="block text-xs font-medium text-foreground-faint mb-1">Teléfono *</label>
                  <input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} required className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" placeholder="+57 300 000 0000" /></div>
              </div>
              <Button className="mt-6 w-full" size="lg" onClick={() => setStep(2)}>Continuar al pago</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface rounded-lg border border-line/70 p-6">
              <div className="flex items-center gap-2 mb-4"><CreditCard size={18} className="text-[#C9A227]" /><h2 className="font-medium text-foreground">Método de pago</h2></div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['card', 'pse'].map(m => (
                  <button key={m} onClick={() => setPayment({ ...payment, method: m })}
                    className={`p-4 rounded-lg border-2 text-center transition ${payment.method === m ? 'border-[#C9A227] bg-[#C9A227]/5' : 'border-line hover:border-line'}`}>
                    <p className="font-medium text-sm text-foreground">{m === 'card' ? 'Tarjeta de crédito/débito' : 'PSE (Débito)'}</p>
                    <p className="text-xs text-foreground-faint mt-1">{m === 'card' ? 'Visa, Mastercard, Amex' : 'Transferencia bancaria'}</p>
                  </button>
                ))}
              </div>
              {payment.method === 'card' ? (
                <div className="space-y-4">
                  <div><label className="block text-xs font-medium text-foreground-faint mb-1">Número de tarjeta</label>
                    <input value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" /></div>
                  <div><label className="block text-xs font-medium text-foreground-faint mb-1">Nombre en la tarjeta</label>
                    <input value={payment.cardName} onChange={e => setPayment({ ...payment, cardName: e.target.value })} placeholder="NOMBRE APELLIDO"
                      className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-foreground-faint mb-1">Caducidad</label>
                      <input value={payment.expiry} onChange={e => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM/AA"
                        className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" /></div>
                    <div><label className="block text-xs font-medium text-foreground-faint mb-1">CVV</label>
                      <input value={payment.cvv} onChange={e => setPayment({ ...payment, cvv: e.target.value })} placeholder="123" type="password"
                        className="w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227]" /></div>
                  </div>
                  <p className="text-xs text-foreground-faint flex items-center gap-1.5"><Lock size={12} /> Tu información de pago está protegida. No almacenamos datos de tarjetas.</p>
                </div>
              ) : (
                <div className="p-6 bg-background-warm rounded-lg text-center">
                  <img src="https://www.pse.com.co/static/img/PSE_Payment_icono.svg" alt="PSE" className="w-24 mx-auto mb-3" />
                  <p className="text-sm text-foreground-faint">Serás redirigido a tu banco para completar la transferencia.</p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
                <Button size="lg" className="flex-1" onClick={handlePay} loading={loading}>
                  Pagar {formatPrice(total)}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-lg border border-line/70 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-accent-green" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-foreground mb-2">¡Gracias por tu compra!</h2>
              <p className="text-foreground-faint mb-6">Tu pedido ha sido confirmado y está siendo procesado.</p>
              <Button onClick={() => navigate('/cuenta/pedidos')}>Ver mis pedidos</Button>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg border border-line/70 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4"><ShoppingBag size={16} className="text-[#C9A227]" /><h3 className="font-medium text-sm text-foreground">Tu pedido</h3></div>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-background-warm flex items-center justify-center text-[10px] text-foreground/20 shrink-0">
                    {item.productImage ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded" /> : '🪙'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.productName}</p>
                    <p className="text-xs text-foreground-faint">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line/70 pt-3 mb-4">
              <div className="flex gap-2 mb-3">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Código de cupón"
                  className="flex-1 px-3 py-2 border border-line rounded-lg text-xs outline-none focus:border-[#C9A227]" />
                <button onClick={applyCoupon} className="text-xs text-[#C9A227] font-medium">Aplicar</button>
              </div>
              {couponApplied && <p className="text-xs text-accent-green mb-3">Cupón {couponApplied.code} aplicado (-{formatPrice(discount)})</p>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground-faint">Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-foreground-faint">Descuento</span><span className="text-accent-green">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-foreground-faint">Envío</span><span>{shippingCost === 0 ? <span className="text-accent-green">Gratis</span> : formatPrice(shippingCost)}</span></div>
              <div className="border-t border-line/70 pt-2 flex justify-between font-semibold text-foreground">
                <span>Total</span><span className="text-[#C9A227]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
