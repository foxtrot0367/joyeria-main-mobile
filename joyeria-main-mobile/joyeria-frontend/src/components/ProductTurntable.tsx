interface ProductTurntableProps {
  src?: string
  alt?: string
  className?: string
  photoSizeClass?: string
}

/**
 * Vitrina 3D tipo tornamesa: la foto rota 360° en el eje vertical sobre
 * una plataforma dorada que gira en horizontal (vista en perspectiva).
 *
 * Buenas prácticas:
 * - Sin dependencias: solo CSS 3D (`perspective` + `rotateY`/`rotateZ`).
 * - Respeta `prefers-reduced-motion` (el media query global congela las animaciones).
 * - Se pausa al hacer hover para inspeccionar la pieza.
 * - Solo pinta la imagen si existe; si no, muestra un espacio neutro.
 */
export default function ProductTurntable({ src, alt = 'Pieza AURA', className = '', photoSizeClass = 'w-40 sm:w-48' }: ProductTurntableProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Halo dorado tras la pieza */}
      <div aria-hidden className="absolute inset-x-6 bottom-0 h-24 bg-[#C9A227]/20 blur-3xl rounded-full" />

      {/* Platter giratorio */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-6 flex justify-center" style={{ perspective: '800px' }}>
        <div className="tt-spin-platter relative w-[76%] max-w-xs h-14 sm:h-16">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#C9A227,#F5D06F,#7A5F1E,#C9A227)] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.65)]" />
          <div className="absolute inset-[10%] rounded-full bg-[#171310] opacity-85" />
          <div className="absolute inset-[16%] rounded-full border border-[#F5D06F]/40 opacity-50" />
        </div>
      </div>

      {/* Foto girando en 3D */}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 sm:bottom-12 flex justify-center">
        {src ? (
          <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false}
            className={`tt-spin-photo rounded-xl object-cover shadow-[0_24px_40px_-16px_rgba(0,0,0,0.65)] ${photoSizeClass}`} />
        ) : (
          <div className={`tt-spin-photo h-28 rounded-xl bg-gradient-to-br from-[#5A7A5D] to-[#3E5A41] ${photoSizeClass}`} />
        )}
      </div>

      {/* Insignia 360° */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-[#F5D06F]/40 bg-black/30 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] text-[#F5D06F] backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="tt-spin-badge w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v6h-6" />
        </svg>
        360°
      </div>
    </div>
  )
}