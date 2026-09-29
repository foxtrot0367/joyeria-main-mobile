import { useEffect, useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { useToast } from '../../contexts/ToastContext'
import type { SupportTicket } from '../../types'
import Skeleton from '../../components/Skeleton'
import Pagination from '../../components/Pagination'
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/format'

const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => { load() }, [page])

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getTickets(page, 20)
      setTickets(data.content); setTotalPages(data.totalPages)
    } catch { setTickets([]); setTotalPages(0) }
    finally { setLoading(false) }
  }

  const changeStatus = async (id: number, status: string) => {
    try { await adminService.updateTicketStatus(id, status); toast('Estado actualizado'); load() }
    catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al actualizar'
      toast(message || 'Error al actualizar', 'error')
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-foreground mb-6">Tickets de soporte</h1>

      {loading ? (
        <Skeleton className="h-80" />
      ) : tickets.length === 0 ? (
        <div className="bg-surface rounded-lg border border-line/70 p-12 text-center text-foreground-faint">
          <LifeBuoy size={40} className="mx-auto mb-3 text-foreground/20" />
          No hay tickets de soporte.
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-line/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-foreground-faint border-b border-line/70 bg-background-warm">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Asunto</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-b border-line/40 last:border-0 align-top hover:bg-surface-muted/50">
                    <td className="p-4 font-medium text-foreground">#{t.ticketNumber}</td>
                    <td className="p-4">
                      <p className="text-foreground-muted">{t.customerName || '-'}</p>
                      {t.customerEmail && <p className="text-xs text-foreground-faint">{t.customerEmail}</p>}
                    </td>
                    <td className="p-4 text-foreground-faint">{t.category}</td>
                    <td className="p-4">
                      <p className="font-medium text-foreground mb-1">{t.subject}</p>
                      <p className="text-foreground-faint text-xs line-clamp-2">{t.message}</p>
                    </td>
                    <td className="p-4 text-foreground-faint whitespace-nowrap text-xs">{formatDate(t.createdAt)}</td>
                    <td className="p-4">
                      <select value={t.status} onChange={e => changeStatus(t.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg border border-line text-xs outline-none bg-surface ${getStatusColor(t.status)}`}>
                        {statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="p-4 border-t border-line/70"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  )
}