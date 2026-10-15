import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star, Shield, Truck, Award, BadgeCheck, Gem, Sparkles, Pencil, Hammer, Gift, Calendar, Quote } from 'lucide-react'
import { productService } from '../services/product.service'
import { categoryService } from '../services/category.service'
import { materialService } from '../services/material.service'
import type { Product, Category, Review, Material } from '../types'
import Showcase from '../components/Showcase'
import QuickViewModal from '../components/QuickViewModal'
import Logo from '../components/Logo'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { userService } from '../services/user.service'
import Skeleton from '../components/Skeleton'

const heroSlides = [
  { eyebrow: 'La Colección 2026', title: 'El brillo que nunca se apaga', subtitle: 'Formas puras, luz cálida y acabados impecables para el día a día y para siempre.' },
  { eyebrow: 'Los más deseados', title: 'Piezas que cuentan historias', subtitle: 'Las creaciones que nuestros clientes eligen una y otra vez.' },
  { eyebrow: 'Hecho a mano en Bogotá', title: 'Artesanía que perdura', subtitle: 'Del taller a tu mano: cada pieza pasa por doce pares de manos expertas.' },
  { eyebrow: 'Materiales nobles', title: 'Oro, plata y gemas con alma', subtitle: 'Materiales certificados, seleccionados a mano por nuestro atelier.' },
]

const materialData: Array<{ name: string; desc: string; color: string }> = [
  { name: 'Oro 18K', desc: 'El estándar de excelencia en joyería fina.', color: '#D4AF37' },
  { name: 'Plata 925', desc: 'Brillantez y durabilidad.', color: '#C0C0C0' },
  { name: 'Oro Blanco', desc: 'Acabado elegante y moderno.', color: '#E5E5E0' },
  { name: 'Oro Rosa', desc: 'Tonos cálidos y románticos.', color: '#E8B4B8' },
  { name: 'Piedras Preciosas', desc: 'Diamantes, esmeraldas y más.', color: '#6F8F72' },
  { name: 'Perlas', desc: 'Perlas cultivadas de alta calidad.', color: '#F5F5F0' },
]

const craftSteps = [
  { icon: Pencil, step: '01', title: 'Diseño & boceto', desc: 'Cada pieza nace de un trazo: proporción, luz y movimiento pensados para ti.' },
  { icon: Hammer, step: '02', title: 'Fundición y acabado', desc: 'Manos expertas modelan y pulen el metal hasta lograr el brillo perfecto.' },
  { icon: BadgeCheck, step: '03', title: 'Control de calidad', desc: 'Revisamos cada engaste y cada pulido. Solo lo impecable lleva el sello AURA.' },
  { icon: Gift, step: '04', title: 'Entrega con historia', desc: 'Tu pieza viaja en un estuche de regalo, lista para su primer momento.' },
]

const storyTraits = [
  { icon: BadgeCheck, title: 'Autoría única', desc: 'Diseños originales creados en nuestro taller.' },
  { icon: Gem, title: 'Piedras certificadas', desc: 'Diamantes y gemas de origen trazable.' },
  { icon: Sparkles, title: 'Acabados a mano', desc: 'Cada pieza recibe un acabado final artesanal.' },
]

const HERO_INTERVAL = 6500
const HERO_IMAGES = 4

/** Mapea el slug/nombre de una categoría al tipo de joya 3D correspondiente. */


export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [materials, setMaterials] = useState<Material[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const parallaxRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { addItem } = useCart()
  const { toast } = useToast()

  const heroProducts = bestSellers.length >= HERO_IMAGES ? bestSellers.slice(0, HERO_IMAGES) : bestSellers

  useEffect(() => {
    Promise.all([
      productService.getFeatured().then(setFeatured),
      productService.getNew().then(setNewProducts),
      productService.getBestSellers().then(setBestSellers),
      categoryService.getAll().then(setCategories),
      materialService.getAll().then(setMaterials),
      userService.getRecentReviews().then(setReviews),
      productService.getAll({ size: 100 }).then(res => {
        const map: Record<string, string> = {}
        for (const p of res.content) {
          const key = String(p.categoryId ?? '')
          const url = p.images?.[0]?.url
          if (key && url && !(key in map)) map[key] = url
        }
        setCategoryImages(map)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), HERO_INTERVAL)
    return () => clearInterval(timer)
  }, [reduced])

  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  const handleAddToCart = async (id: number, qty = 1) => {
    try { await addItem(id, qty); toast('Agregado al carrito') }
    catch { toast('Error al agregar', 'error') }
  }

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
  const stagger = { visible: { transition: { staggerChildren: 0.1 } } }
  const quoteProduct = newProducts[0] || featured[0] || bestSellers[0]

  return (
    <div>
      {/* ===== HERO full-bleed ===== */}
      <section className="relative h-[70vh] min-h-[520px] max-h-[780px] overflow-hidden bg-[#151515]">
        {Array.from({ length: Math.max(HERO_IMAGES, heroProducts.length) }).map((_, i) => {
          const active = i === heroIndex
          const url = heroProducts[i]?.images?.[0]?.url
          const isActive = i < heroSlides.length
          return (
            <motion.div key={i} className={`absolute inset-0 ${!url ? 'bg-gradient-to-br from-[#2A2A2A] to-[#151515]' : ''}`}
              initial={false}
              animate={{ opacity: active && isActive ? 1 : 0 }}
              transition={{ opacity: { duration: 1.1 }, scale: { duration: HERO_INTERVAL / 1000, ease: 'linear' } }}>
              {url && (
                <motion.img src={url} alt={active ? heroSlides[i]?.title : ''} decoding="async"
                  className="w-full h-full object-cover"
                  initial={false}
                  animate={{ scale: active && !reduced ? [1, 1.1] : 1 }}
                  transition={{ opacity: { duration: 1.1 }, scale: { duration: HERO_INTERVAL / 1000, ease: 'linear' } }} />
              )}
            </motion.div>
          )
        })}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end md:items-center pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={heroIndex}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl text-white">
              <p className="text-xs font-medium tracking-[0.3em] text-[#F5D06F] uppercase mb-4">{heroSlides[heroIndex].eyebrow}</p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.08] mb-5 text-white">
                {heroSlides[heroIndex].title}
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl">{heroSlides[heroIndex].subtitle}</p>
              <div className="flex flex-wrap gap-4">
                {heroProducts[heroIndex] ? (
                  <Link to={`/productos/${heroProducts[heroIndex].slug}`}
                    className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-primary px-8 py-3.5 rounded-full font-medium text-sm transition-colors">
                    Ver esta pieza <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link to="/productos"
                    className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-primary px-8 py-3.5 rounded-full font-medium text-sm transition-colors">
                    Explorar la colección <ArrowRight size={16} />
                  </Link>
                )}
                <Link to="/productos?sort=soldCount&dir=desc"
                  className="inline-flex items-center gap-2 border border-white/30 text-white hover:border-white hover:bg-white/10 px-8 py-3.5 rounded-full font-medium text-sm transition-colors">
                  Los más deseados
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress lines */}
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} aria-label={`Diapositiva ${i + 1}`}
              className="relative flex-1 h-[2px] max-w-24 bg-white/30 overflow-hidden">
              {i === heroIndex && (
                <motion.span
                  key={`${heroIndex}-${Math.random()}`}
                  className="absolute inset-y-0 left-0 bg-[#F5D06F]"
                  initial={{ width: '0%' }}
                  animate={{ width: reduced ? '100%' : '100%' }}
                  transition={{ duration: reduced ? 0 : HERO_INTERVAL / 1000, ease: 'linear' }} />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="bg-background border-b border-line/70">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { icon: Truck, title: 'Envío sin costo', desc: 'En compras +$500.000' },
            { icon: Shield, title: 'Compra protegida', desc: 'Pago seguro' },
            { icon: Award, title: 'Garantía de por vida', desc: 'En todas las piezas' },
            { icon: Star, title: 'Asesoría cercana', desc: 'Soporte dedicado' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }} className="flex items-center justify-center gap-3">
              <item.icon size={18} className="text-[#C9A227] shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-foreground tracking-wide">{item.title}</p>
                <p className="text-[11px] text-foreground-faint">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Categories — editorial magazine ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="flex items-end justify-between mb-14">
          <div>
            <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Explora el atelier</p>
            <h2 className="font-serif text-4xl font-medium text-foreground">Una casa para cada momento</h2>
          </div>
          <Link to="/productos" className="hidden md:flex items-center gap-1.5 text-sm text-foreground dark:text-gray-300 dark:hover:text-[#F5D06F] hover:text-[#C9A227] transition-colors">
            Ver todas las categorías <ArrowRight size={15} />
          </Link>
        </motion.div>

        {loading ? <Skeleton className="h-72" count={4} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {categories.map((cat, i) => {
              const large = i === 0
              return (
                <motion.div key={cat.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.08 }}
                  className={large ? 'sm:col-span-2' : ''}>
                  <Link to={`/productos?category=${cat.id}`}
                    className={`group block ${large ? 'aspect-[4/5] sm:aspect-auto lg:h-full' : 'aspect-[4/5]'}`}>
                    <div className="relative h-full flex flex-col overflow-hidden rounded-3xl border border-line/40 transition-colors group-hover:border-[#C9A227]/70 bg-gradient-to-br from-[#241F19] to-[#0C0A08] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
                      {/* Stage decor */}
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C9A227] to-[#F5D06F] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                      <div aria-hidden className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#C9A227]/10 blur-2xl" />
                      <div aria-hidden className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-[#C9A227]/10 blur-2xl" />

                      {/* Foto real del producto */}
                      <div className="relative mx-3 mt-4 sm:mx-4 overflow-hidden rounded-2xl bg-[#17130E]/60">
                        <img
                          src={categoryImages[cat.id] || cat.image || undefined}
                          alt={cat.name}
                          loading="lazy"
                          decoding="async"
                          className={`h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${large ? 'max-h-48 sm:max-h-60 lg:max-h-72' : 'max-h-44 sm:max-h-52'}`}
                        />
                      </div>

                      {/* Text layer */}
                      <div className={`relative mt-auto ${large ? 'p-5 md:p-7' : 'p-5'}`}>
                        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#F5D06F] uppercase mb-2">Colección {String(i + 1).padStart(2, '0')}</p>
                        <h3 className={`font-serif text-white font-medium leading-[1.12] ${large ? 'text-2xl md:text-3xl mb-4' : 'text-xl mb-3'}`}>{cat.name}</h3>
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white/95 rounded-full border border-white/35 px-5 py-2 backdrop-blur-sm transition-all group-hover:border-[#F5D06F] group-hover:text-[#F5D06F]">
                          Ver piezas <ArrowRight size={14} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>

                      {/* Glam estático */}
                      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl"
                        style={{ background: 'radial-gradient(420px circle at 50% 35%, rgba(245,208,111,0.10), transparent 45%)' }} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* ===== Story editorial ===== */}
      <section className="bg-background-warm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">La Colección</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-medium text-foreground leading-[1.12] mb-4">
              Historias forjadas en oro
            </motion.h2>
            <motion.div variants={fadeUp} className="h-[3px] w-20 rounded-full bg-gradient-to-r from-[#C9A227] to-[#F5D06F] mb-6" />
            <motion.p variants={fadeUp} className="text-foreground-faint leading-relaxed mb-9 max-w-lg">
              Cada pieza AURA comienza como una historia: un compromiso, un aniversario, un logro.
              Nuestros maestros joyeros la transforman en un objeto que la preserva para siempre.
            </motion.p>
            <motion.ul variants={fadeUp} className="space-y-5 mb-10">
              {storyTraits.map(t => (
                <li key={t.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-green/15 flex items-center justify-center shrink-0 mt-0.5">
                    <t.icon size={17} className="text-accent-green" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{t.title}</p>
                    <p className="text-[13px] text-foreground-faint">{t.desc}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Link to="/productos" className="inline-flex items-center gap-2 bg-foreground hover:bg-primary text-background px-8 py-3.5 rounded-full font-medium text-sm transition-colors">
                Conocer la colección <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative">
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {bestSellers.slice(0, 3).map((p, i) => {
                const img = p.images?.[0]?.url
                return (
                  <Link key={p.id} to={`/productos/${p.slug}`}
                    className={`group relative block overflow-hidden rounded-2xl bg-surface-muted ${i === 0 ? 'row-span-2 h-full' : ''}`}>
                    {img && (
                      <img src={img} alt={p.name} loading="lazy" decoding="async"
                        className={`w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.1] ${i === 0 ? 'min-h-[420px]' : 'aspect-[4/5] min-h-[200px]'}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className={`absolute bottom-4 left-4 text-white text-xs font-medium ${i !== 0 && 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all'}`}>
                      {p.name}
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="absolute -bottom-5 -left-5 hidden lg:block w-32 h-32 bg-[#C9A227]/15 border border-[#C9A227]/25 rounded-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ===== Personalización: joyas y regalos a tu medida ===== */}
      <section className="bg-background py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Hecho para ti</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-medium text-foreground leading-[1.12] mb-4">
              Una joya, contada a tu manera
            </motion.h2>
            <motion.div variants={fadeUp} className="h-[3px] w-20 rounded-full bg-gradient-to-r from-[#C9A227] to-[#F5D06F] mb-6" />
            <motion.p variants={fadeUp} className="text-foreground-faint leading-relaxed mb-8 max-w-lg">
              Elige una pieza base y cuéntanos tu historia: nombres, fechas, grabados y detalles
              que convierten una joya en un recuerdo. Nuestro atelier la hace única para ti.
            </motion.p>
            <motion.ul variants={fadeUp} className="space-y-4 mb-9">
              {[
                { icon: Quote, title: 'Grabados con significado', desc: 'Nombres, fechas y mensajes grabados en el metal.' },
                { icon: Calendar, title: 'Una fecha que recordar', desc: 'Celebra un aniversario, un logro o un reencuentro.' },
                { icon: Gem, title: 'Pieza única en su tipo', desc: 'Material, piedra y acabado pensados para quien la recibe.' },
              ].map(t => (
                <li key={t.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A227]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <t.icon size={17} className="text-[#C9A227]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{t.title}</p>
                    <p className="text-[13px] text-foreground-faint">{t.desc}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/personaliza" className="inline-flex items-center gap-2 bg-foreground hover:bg-primary text-background px-7 py-3.5 rounded-full font-medium text-sm transition-colors">
                Personalizar una joya <ArrowRight size={16} />
              </Link>
              <Link to="/productos?category=8" className="inline-flex items-center gap-2 border border-line text-foreground-muted hover:border-[#C9A227] hover:text-[#C9A227] px-7 py-3.5 rounded-full font-medium text-sm transition-colors">
                Regalos con historia <Gift size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid gap-5">
            {[
              { icon: Sparkles, to: '/personaliza', title: 'Joyería personalizada', desc: 'Grabados, piedras y acabados a tu elección. Tú diseñas la historia.', cta: 'Empezar ahora' },
              { icon: Gift, to: '/productos?category=8', title: 'Regalos con historia', desc: 'Estuches de regalo, dedicatorias y piezas pensadas para emocionar.', cta: 'Descubrir regalos' },
            ].map((c, i) => (
              <motion.div key={c.title} variants={fadeUp} transition={{ delay: i * 0.08 }}
                className="group bg-surface rounded-2xl border border-line/70 hover:border-[#D4AF37]/40 transition-all duration-300 p-8 flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <c.icon size={22} className="text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-foreground-faint leading-relaxed mb-4">{c.desc}</p>
                  <Link to={c.to} className="group/btn relative inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37] transition-colors duration-300">
                    <span className="relative">
                      {c.cta}
                      <span className="absolute -bottom-1.5 left-0 h-[1px] w-0 bg-[#D4AF37] transition-all duration-300 ease-out group-hover/btn:w-full" />
                    </span>
                    <ArrowRight size={13} className="-ml-1 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Los más deseados — big showcase ===== */}
      {featured.length > 0 && (
        <section className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Destacados</p>
                <h2 className="font-serif text-4xl font-medium text-foreground">Los más deseados</h2>
              </div>
              <Link to="/productos" className="hidden md:flex items-center gap-1.5 text-sm text-foreground dark:text-gray-300 dark:hover:text-[#F5D06F] hover:text-[#C9A227] transition-colors">
                Ver todos <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
            <Showcase products={featured.slice(0, 12)} onQuickView={(p) => setQuickView(p)} />
          </div>
        </section>
      )}

      {/* ===== Materials ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Materiales</p>
          <h2 className="font-serif text-4xl font-medium text-foreground">Materiales que inspiran</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {materialData.map((m, i) => {
            const match = materials.find(x => x.name.toLowerCase().replace(/ /g, '') === m.name.toLowerCase().replace(/ /g, ''))
            const inner = (
              <div className="h-full p-6 rounded-2xl bg-surface border border-line/70 hover:border-[#C9A227]/40 hover:shadow-md transition-all text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full mb-3 border-2 relative" style={{ borderColor: m.color }}>
                  <div className="absolute inset-1.5 rounded-full" style={{ background: m.color, opacity: 0.15 }} />
                </div>
                <h4 className="font-serif text-sm font-medium text-foreground mb-1">{m.name}</h4>
                <p className="text-xs text-foreground-faint">{m.desc}</p>
              </div>
            )
            return (
              <motion.div key={i} variants={fadeUp} className={match ? 'cursor-pointer' : ''}>
                {match ? <Link to={`/productos?material=${match.id}`}>{inner}</Link> : inner}
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ===== Craft process ===== */}
      <section className="bg-ink text-white py-24 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Nuestro oficio</p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">El proceso artesanal</h2>
            <p className="text-white/70 max-w-xl mx-auto">Del boceto a la mano que te espera: cuatro pasos, cero atajos.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {craftSteps.map(s => (
              <motion.div key={s.step} variants={fadeUp}
                className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.07] hover:border-[#C9A227]/40 transition-colors">
                <span className="font-serif text-5xl text-[#C9A227]/30 absolute top-4 right-6">{s.step}</span>
                <div className="w-11 h-11 rounded-full bg-[#C9A227]/15 flex items-center justify-center mb-5">
                  <s.icon size={18} className="text-[#F5D06F]" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-2 text-white">{s.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
      </section>

      {/* ===== New collection — big showcase ===== */}
      {newProducts.length > 0 && (
        <section className="py-24 bg-background-warm dark:bg-[#121212]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Novedades</p>
                <h2 className="font-serif text-4xl font-medium text-foreground dark:text-white">Nueva Colección</h2>
              </div>
              <Link to="/productos?sort=createdAt&dir=desc" className="hidden md:flex items-center gap-1.5 text-sm text-foreground dark:text-gray-300 dark:hover:text-[#F5D06F] hover:text-[#C9A227] transition-colors">
                Ver todas <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Showcase products={newProducts.slice(0, 12)} onQuickView={(p) => setQuickView(p)} />
          </div>
        </section>
      )}

      {/* ===== Brand parallax banner ===== */}
      <section ref={parallaxRef} className="relative overflow-hidden py-32 md:py-44">
        <motion.div style={reduced ? undefined : { y: parallaxY }} className="absolute -inset-y-[15%] inset-x-0">
          {quoteProduct?.images?.[0]?.url && (
            <img src={quoteProduct.images[0].url} alt="" decoding="async" className="w-full h-full object-cover scale-110" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Logo variant="dark" className="w-48 mx-auto mb-10" />
            <p className="text-sm font-medium tracking-[0.25em] text-[#F5D06F] uppercase mb-5">Nuestra Filosofía</p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-7 leading-[1.15]">
              Forjada a mano para durar generaciones.
            </h2>
            <p className="text-white/75 leading-relaxed max-w-2xl mx-auto mb-10">
              AURA nace del respeto por el oficio: materiales nobles, diseño original y manos expertas.
              Diseñamos para quienes valoran la elegancia y la calidad en cada detalle de su vida.
            </p>
            <Link to="/productos"
              className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-primary px-9 py-3.5 rounded-full font-medium text-sm transition-colors">
              Descubrir la colección <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== Reviews ===== */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.25em] text-[#C9A227] uppercase mb-3">Opiniones</p>
            <h2 className="font-serif text-4xl font-medium text-foreground">Lo que dicen nuestros clientes</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-surface rounded-2xl p-7 border border-line/70">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'text-[#C9A227] fill-[#C9A227]' : 'text-foreground/20'} />)}
                </div>
                {r.title && <p className="font-medium text-sm text-foreground mb-2">{r.title}</p>}
                <p className="text-sm text-foreground-faint mb-3 line-clamp-3">{r.comment}</p>
                <p className="text-xs text-foreground-faint font-medium">{r.userName}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Newsletter ===== */}
      <section className="bg-gradient-to-r from-[#C9A227] to-[#D4AF37] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="font-serif text-3xl font-medium mb-4">Únete al círculo AURA</h2>
          <p className="text-white/85 mb-6">Recibe ofertas exclusivas, adelantos de colección y contenido especial directamente en tu correo.</p>
          <form onSubmit={e => { e.preventDefault(); toast('¡Gracias por suscribirte!') }}
            className="flex max-w-md mx-auto">
            <input type="email" placeholder="Tu email" required className="flex-1 bg-white/20 backdrop-blur text-white placeholder-white/70 rounded-l-full px-5 py-3 outline-none border border-white/30 focus:border-white" />
            <button type="submit" className="bg-foreground text-background px-7 py-3 rounded-r-full font-medium hover:opacity-90 transition-opacity">Suscribir</button>
          </form>
        </div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAddToCart={handleAddToCart} />
    </div>
  )
}