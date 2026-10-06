import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/Button'

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast('Las contraseñas no coinciden', 'error'); return }
    setLoading(true)
    try {
      await register(form)
      toast('¡Cuenta creada exitosamente!')
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string; data?: { email?: string } } } }).response?.data?.message
          || (err as { response?: { data?: { data?: { email?: string } } } }).response?.data?.data?.email
        : 'Error al registrarse'
      toast(message || 'Error al registrarse', 'error')
    } finally { setLoading(false) }
  }

  const input = 'w-full pl-9 pr-3 py-2.5 border border-line rounded-lg text-sm outline-none focus:border-[#C9A227] transition'

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 bg-gradient-to-b from-background to-background-warm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-surface rounded-xl border border-line/70 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#C9A227] flex items-center justify-center mb-3">
            <span className="font-serif text-xl text-[#C9A227] font-bold">J</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Crear cuenta</h1>
          <p className="text-sm text-foreground-faint mt-1">Únete a la experiencia AURA</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">Nombre</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
                <input name="firstName" value={form.firstName} onChange={handleChange} required className={input} placeholder="María" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">Apellido</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
                <input name="lastName" value={form.lastName} onChange={handleChange} required className={input} placeholder="García" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
              <input type="email" name="email" value={form.email} onChange={handleChange} required className={input} placeholder="tu@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground-muted mb-1.5">Teléfono</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className={input} placeholder="+57 300 000 0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required minLength={8} className={input} placeholder="Mín. 8 caracteres" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-foreground-muted mb-1.5">Confirmar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength={8} className={input} placeholder="Repite" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-faint">
            <input type="checkbox" required className="accent-[#C9A227]" />
            Acepto los <Link to="/terminos" className="text-[#C9A227]">términos</Link> y la <Link to="/privacidad" className="text-[#C9A227]">política de privacidad</Link>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">Crear cuenta</Button>
        </form>
        <div className="mt-6 pt-6 border-t border-line/70 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line/70"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-foreground-faint">o continúa con</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast('Google OAuth no está configurado. Configura VITE_GOOGLE_CLIENT_ID', 'error')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-lg text-sm text-foreground hover:bg-surface-muted transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <p className="text-sm text-foreground-faint mt-4">¿Ya tienes cuenta? <Link to="/login" className="text-[#C9A227] font-medium hover:underline">Inicia sesión</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
