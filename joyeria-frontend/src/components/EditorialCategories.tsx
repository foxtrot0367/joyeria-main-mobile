import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Maximize2 } from 'lucide-react'
import type { Category } from '../types'
import SmartImage from './SmartImage'
import ImageLightbox from './ImageLightbox'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

/** Ancho de cada círculo para lograr filas de 2 (móvil), 3 (tablet) y 4 fijas (escritorio), siempre centradas. */
const ITEM_WIDTH =
  'w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1.333rem)] lg:w-[15rem] lg:flex-none lg:max-w-none'

interface CategoryCircleProps {
  category: Category
  image: string | null
  index: number
  className?: string
  onZoom: (src: string | null, alt: string) => void
}

function CategoryCircle({ category, image, index, className = '', onZoom }: CategoryCircleProps) {
  const href = `/productos?category=${category.id}`

  return (
    <motion.figure
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 4) * 0.08 }}
      className={`group/cat flex flex-col items-center text-center ${className}`}
    >
      <div className="relative w-full">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full border border-[#C9A227]/25 transition-colors duration-500 group-hover/cat:border-[#C9A227]/50 sm:-inset-3"
        />
        <button
          type="button"
          onClick={() => onZoom(image, category.name)}
          aria-label={`Ampliar imagen de ${category.name}`}
          className="group/photo relative block aspect-square w-full overflow-hidden rounded-full border border-[#C9A227]/30 bg-surface-muted shadow-[0_26px_55px_-30px_rgba(120,90,20,0.65)] transition-shadow duration-500 hover:shadow-[0_34px_70px_-30px_rgba(120,90,20,0.72)] focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F5EC] dark:focus-visible:ring-offset-background-warm"
        >
          <SmartImage
            src={image}
            alt={category.name}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover/photo:scale-[1.06]"
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[#8a6d1a] shadow-lg">
              <Maximize2 size={17} />
            </span>
          </span>
        </button>
      </div>

      <figcaption className="mt-6 flex w-full flex-col items-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#C9A227]">
          Colección {String(index + 1).padStart(2, '0')}
        </span>
        <Link
          to={href}
          className="mt-2 font-serif text-lg font-medium leading-snug text-foreground transition-colors hover:text-[#C9A227] md:text-xl"
        >
          {category.name}
        </Link>
        <Link
          to={href}
          className="group/link mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted transition-colors hover:text-[#C9A227]"
        >
          Ver piezas
          <ArrowRight size={13} className="transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </figcaption>
    </motion.figure>
  )
}

interface EditorialCategoriesProps {
  categories: Category[]
  images?: Record<string, string>
  loading?: boolean
}

/**
 * Sección editorial de colecciones: una retícula simétrica y centrada de
 * círculos con foto real (zoom al hacer clic) y enlaces de navegación.
 */
export default function EditorialCategories({ categories, images = {}, loading = false }: EditorialCategoriesProps) {
  const [zoom, setZoom] = useState<{ src: string | null; alt: string } | null>(null)

  const imageFor = (category: Category) => images[category.id] ?? category.image ?? null
  const openZoom = (src: string | null, altName: string) => setZoom({ src, alt: altName })

  return (
    <section className="bg-[#F8F5EC] py-24 dark:bg-background-warm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[#C9A227]">Explora el atelier</p>
            <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl">Una casa para cada momento</h2>
            <div className="mt-6 h-px w-28 bg-gradient-to-r from-[#C9A227] to-transparent" />
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Link
              to="/productos"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-foreground-muted transition-colors hover:text-[#C9A227]"
            >
              Ver todas las categorías
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-14 sm:gap-x-8 lg:gap-x-12 lg:gap-y-16">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${ITEM_WIDTH} max-w-[15rem]`}>
                  <div className="aspect-square w-full animate-pulse rounded-full bg-surface-elevated" />
                  <div className="mx-auto mt-6 h-3 w-24 animate-pulse rounded bg-surface-elevated" />
                  <div className="mx-auto mt-3 h-4 w-20 animate-pulse rounded bg-surface-elevated" />
                </div>
              ))
            : categories.map((category, i) => (
                <CategoryCircle
                  key={category.id}
                  category={category}
                  image={imageFor(category)}
                  index={i}
                  className={ITEM_WIDTH}
                  onZoom={openZoom}
                />
              ))}
        </div>
      </div>

      <ImageLightbox
        src={zoom?.src ?? null}
        alt={zoom?.alt ?? ''}
        isOpen={zoom !== null}
        onClose={() => setZoom(null)}
        caption={zoom?.alt}
      />
    </section>
  )
}
