import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import type { Product } from '../types'
import Price from './Price'
import Rating from './Rating'
import SmartImage from './SmartImage'

interface Props {
  product: Product
  onAddToCart?: (id: number) => void
  onQuickView?: (product: Product) => void
  onToggleFavorite?: (id: number) => void
  isFavorite?: boolean
}

function ProductCard({ product, onAddToCart, onQuickView, onToggleFavorite, isFavorite }: Props) {
  const img = product.images?.length ? product.images[0].url : ''
  const img2 = product.images && product.images.length > 1 ? product.images[1].url : ''
  const reduced = useReducedMotion()
  const lowStock = product.stock > 0 && product.stock <= 5
  const outOfStock = product.stock <= 0

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-surface rounded-xl overflow-hidden border border-line/70 hover:border-[#C9A227]/30 transition-all duration-300 shadow-sm hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
        <Link to={`/productos/${product.slug}`} className="block h-full">
          <SmartImage src={img} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          {img2 && (
            <SmartImage src={img2} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
        </Link>

        {/* Quick view */}
        {onQuickView && (
          <button onClick={() => onQuickView(product)} aria-label={`Vista rápida de ${product.name}`}
            className="absolute inset-x-3 bottom-3 bg-surface/90 backdrop-blur-sm text-foreground text-xs font-medium py-3 min-h-[44px] rounded-lg shadow-sm opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5">
            <Eye size={14} /> Vista rápida
          </button>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discountPercent > 0 && (
            <span className="bg-red-500/95 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-accent-green/95 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">Nuevo</span>
          )}
          {lowStock && !outOfStock && (
            <span className="bg-ink/85 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
              Pocas unidades
            </span>
          )}
        </div>

        {/* Wishlist */}
        {onToggleFavorite && (
          <motion.button
            whileTap={reduced ? undefined : { scale: 0.85 }}
            onClick={(e) => { e.preventDefault(); onToggleFavorite(product.id) }}
            className={`absolute top-3 right-3 w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors ${
              isFavorite ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-surface/90 text-foreground-faint hover:text-red-500'}`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/productos/${product.slug}`}>
          <p className="text-[11px] text-[#C9A227] font-medium uppercase tracking-wider mb-1">{product.categoryName}</p>
          <h3 className="font-serif text-foreground font-medium text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <Rating value={product.averageRating} count={product.reviewCount} className="mt-1.5" />
        <div className="mt-2.5">
          <Price price={product.price} comparePrice={product.comparePrice} size="sm" />
        </div>

        <div className="mt-auto pt-3">
          {outOfStock ? (
            <div className="flex-1 text-center text-sm text-foreground-faint py-2 border border-line/70 rounded-lg">Agotado</div>
          ) : onAddToCart ? (
            <button onClick={(e) => { e.preventDefault(); onAddToCart(product.id) }}
              className="w-full bg-foreground hover:bg-primary text-background text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <ShoppingCart size={14} /> Agregar al carrito
            </button>
          ) : (
            <Link to={`/productos/${product.slug}`}
              className="block w-full text-center bg-foreground hover:bg-primary text-background text-xs font-medium py-2.5 rounded-lg transition-colors">
              Ver producto
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default memo(ProductCard)