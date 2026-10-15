import { useEffect, useState } from 'react'
import { Star, Check, X } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { userService } from '../../services/user.service'
import { useToast } from '../../contexts/ToastContext'
import type { Review } from '../../types'
import Skeleton from '../../components/Skeleton'
import { formatDate } from '../../utils/format'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try { setReviews(await userService.getRecentReviews()) } catch { setReviews([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const moderate = async (id: number, status: string) => {
    try {
      await adminService.moderateReview(id, status)
      toast(status === 'APPROVED' ? 'Reseña aprobada' : 'Reseña rechazada', status === 'APPROVED' ? 'success' : 'info')
      load()
    } catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al moderar'
      toast(message || 'Error al moderar', 'error')
    }
  }

  if (loading) return <Skeleton className="h-80" />

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-foreground mb-6">Moderación de reseñas</h1>

      {reviews.length === 0 ? (
        <div className="bg-surface rounded-lg border border-line/70 p-12 text-center text-foreground-faint">
          <Star size={40} className="mx-auto mb-3 text-foreground/20" />
          No hay reseñas para moderar.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-surface rounded-lg border border-line/70 p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className={i <= r.rating ? 'text-[#C9A227] fill-[#C9A227]' : 'text-foreground/20'} />
                    ))}
                    <span className="text-sm font-medium text-foreground ml-2">{r.userName}</span>
                  </div>
                  {r.productName && <p className="text-xs text-foreground-faint">Producto: {r.productName}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                  <button onClick={() => moderate(r.id, 'APPROVED')} title="Aprobar"
                    className="p-2 text-foreground-faint hover:text-accent-green border border-line rounded-lg"><Check size={15} /></button>
                  <button onClick={() => moderate(r.id, 'REJECTED')} title="Rechazar"
                    className="p-2 text-foreground-faint hover:text-red-500 border border-line rounded-lg"><X size={15} /></button>
                </div>
              </div>
              {r.title && <p className="font-medium text-sm text-foreground mb-1">{r.title}</p>}
              {r.comment && <p className="text-sm text-foreground-muted leading-relaxed mb-2">{r.comment}</p>}
              <p className="text-xs text-foreground-faint">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}