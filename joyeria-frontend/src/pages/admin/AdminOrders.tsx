import { useEffect, useState } from 'react'
import { adminService } from '../../services/admin.service'
import { useToast } from '../../contexts/ToastContext'
import type { Order } from '../../types'
import Skeleton from '../../components/Skeleton'
import Pagination from '../../components/Pagination'
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../../utils/format'

const statuses = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => { load() }, [page, filter])

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getOrders(page, 20, filter || undefined)
      setOrders(data.content); setTotalPages(data.totalPages)
    } catch { setOrders([]); setTotalPages(0) }
    finally { setLoading(false) }
  }

  const changeStatus = async (id: number, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status)
      toast('Estado actualizado')
      load()
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error al actualizar', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Pedidos</h1>
          <p className="text-sm text-foreground-faint">{orders.length} pedidos en esta página</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg text-sm transition ${filter === '' ? 'bg-[#C9A227] text-white' : 'bg-surface border border-line text-foreground-muted hover:border-[#C9A227]'}`}>
            Todos
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm transition ${filter === s ? 'bg-[#C9A227] text-white' : 'bg-surface border border-line text-foreground-muted hover:border-[#C9A227]'}`}>
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-80" />
      ) : (
        <div className="bg-surface rounded-lg border border-line/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-foreground-faint border-b border-line/70 bg-background-warm">
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Artículos</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-foreground-faint">No hay pedidos.</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="border-b border-line/40 last:border-0 hover:bg-surface-muted/50">
                    <td className="p-4 font-medium text-foreground">#{o.orderNumber}</td>
                    <td className="p-4 text-foreground-faint">{o.customerName || '-'}</td>
                    <td className="p-4 text-foreground-faint">{formatDate(o.createdAt)}</td>
                    <td className="p-4 text-foreground-faint">{o.items.reduce((a, i) => a + i.quantity, 0)}</td>
                    <td className="p-4 text-right font-medium">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-line text-xs outline-none focus:border-[#C9A227] bg-surface">
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