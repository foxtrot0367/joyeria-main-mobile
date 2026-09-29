import { useState } from 'react'
import { motion } from 'framer-motion'
import { LifeBuoy, Send, CheckCircle } from 'lucide-react'
import { userService } from '../services/user.service'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/Button'

const categories = ['Consulta de producto', 'Estado de pedido', 'Devolución o cambio', 'Pago y facturación', 'Otro']

export default function SupportPage() {
  const [ticket, setTicket] = useState({ subject: '', message: '', category: categories[0] })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userService.createSupportTicket(ticket)
      setSent(true)
      toast('Ticket creado: te contactaremos pronto')
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error al enviar el ticket', 'error')
    } finally { setLoading(false) }
  }

  const input = 'w-full px-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227] transition'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#C9A227]/10 flex items-center justify-center mx-auto mb-4">
          <LifeBuoy size={32} className="text-[#C9A227]" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Centro de soporte</h1>
        <p className="text-foreground-faint">Cuéntanos qué necesitas y te ayudaremos a la brevedad</p>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-lg border border-line/70 p-10 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-accent-green" />
          <h2 className="font-serif text-xl font-medium text-foreground mb-2">¡Ticket enviado!</h2>
          <p className="text-foreground-faint mb-6">Nuestro equipo responderá tu solicitud lo antes posible.</p>
          <Button variant="outline" onClick={() => { setSent(false); setTicket({ subject: '', message: '', category: categories[0] }) }}>
            Enviar otro ticket
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="bg-surface rounded-lg border border-line/70 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-faint mb-1">Categoría</label>
            <select value={ticket.category} onChange={e => setTicket({ ...ticket, category: e.target.value })} className={input}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-faint mb-1">Asunto *</label>
            <input value={ticket.subject} onChange={e => setTicket({ ...ticket, subject: e.target.value })} required className={input} placeholder="Breve resumen de tu consulta" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-faint mb-1">Mensaje *</label>
            <textarea value={ticket.message} onChange={e => setTicket({ ...ticket, message: e.target.value })} required rows={6} className={`${input} resize-none`} placeholder="Describe tu situación con el mayor detalle posible..." />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Enviar ticket <Send size={18} />
          </Button>
          <p className="text-xs text-foreground-faint text-center">
            También puedes escribirnos a <span className="text-[#C9A227]">soporte@aurajoyeria.com</span>
          </p>
        </form>
      )}
    </div>
  )
}