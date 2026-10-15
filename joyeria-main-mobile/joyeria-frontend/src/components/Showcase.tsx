import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '../types'
import Price from './Price'
import Rating from './Rating'

interface Props {
  products: Product[]
  onQuickView?: (product: Product) => void
}

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0Y3RjVGMCIvPjxwYXRoIGQ9Ik0yMDAgMjAwIGw1MiAzMCAtNTIgMzAgLTUyLTMwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzlBMjI3IiBzdHJva2Utd2lkdGg9IjEuNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGxldHRlci1zcGFjaW5nPSI5IiBmaWxsPSIjQjlBOTZCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BVVJBPC90ZXh0Pjwvc3ZnPg=='

export default function Showcase({ products, onQuickView }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const reduced = useReducedMotion()

  const update = () => {
    const el = scroller.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [products])

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <div className="relative">
      <div ref={scroller} className="flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1">
        {products.map((p, i) => {
          const img = p.images?.[0]?.url || PLACEHOLDER
          return (
            <motion.div key={p.id} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.55 }}
              className="w-[63vw] min-[420px]:w-[240px] sm:w-[290px] md:w-[330px] shrink-0 snap-start group relative">
              <Link to={`/productos/${p.slug}`} className="block relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-muted">
                <img src={img} alt={p.name} loading="lazy" decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                {/* Hover darken */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Quick view */}
                {onQuickView && (
                  <button onClick={(e) => { e.preventDefault(); onQuickView(p) }}
                    className="absolute inset-x-4 bottom-4 bg-surface/95 backdrop-blur text-foreground text-xs font-medium py-3 rounded-xl opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5">
                    Vista rápida
                  </button>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#F5D06F] font-medium">{p.categoryName}</p>
                  <h3 className="font-serif text-xl md:text-2xl text-white font-medium mt-1 leading-snug line-clamp-1">{p.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <Price price={p.price} size="sm" />
                    <Rating value={p.averageRating} size={12} className="text-[#F5D06F]" />
                  </div>
                </div>

                {p.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500/95 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">-{p.discountPercent}%</span>
                )}
                {p.isNew && (
                  <span className="absolute top-4 right-4 bg-surface/90 backdrop-blur text-foreground text-[11px] px-2 py-0.5 rounded-full font-medium">Nuevo</span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent hidden md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent hidden md:block" />

      {/* Arrows */}
      <div className="absolute -top-12 right-0 hidden md:flex items-center gap-2">
        <button onClick={() => scrollBy(-1)} disabled={!canLeft} aria-label="Anterior"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition disabled:opacity-30 ${canLeft ? 'border-line text-foreground hover:border-[#C9A227] hover:text-[#C9A227]' : 'border-line/70 text-foreground/20'}`}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => scrollBy(1)} disabled={!canRight} aria-label="Siguiente"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition disabled:opacity-30 ${canRight ? 'border-line text-foreground hover:border-[#C9A227] hover:text-[#C9A227]' : 'border-line/70 text-foreground/20'}`}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}