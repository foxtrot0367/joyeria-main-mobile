import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props { initialQuery?: string; onSearch?: (q: string) => void; compact?: boolean }

export default function SearchBar({ initialQuery = '', onSearch, compact }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('searchHistory') || '[]') } catch { return [] }
  })
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => setQuery(initialQuery), [initialQuery])

  const search = (q: string) => {
    if (!q.trim()) return
    const h = [q, ...history.filter(h => h !== q)].slice(0, 8)
    setHistory(h)
    localStorage.setItem('searchHistory', JSON.stringify(h))
    setShowHistory(false)
    if (onSearch) onSearch(q.trim())
    else navigate(`/productos?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="relative">
      <div className={`flex items-center border ${compact ? 'border-line rounded-full' : 'border-line rounded-lg'} bg-background`}>
        <Search size={18} className={`ml-3 text-foreground-faint ${compact ? 'hidden' : ''}`} />
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => history.length > 0 && setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="Buscar joyas..."
          className={`w-full bg-transparent outline-none ${compact ? 'py-2 px-4 text-sm rounded-full' : 'py-3 px-3 text-sm'}`} />
        {query && <button onClick={() => setQuery('')} className="mr-3 text-foreground-faint hover:text-foreground-muted"><X size={16} /></button>}
        <button onClick={() => search(query)}
          className={`${compact ? 'bg-[#C9A227] text-white rounded-full px-4 py-1.5 mr-1 text-xs' : 'bg-[#C9A227] text-white px-4 py-3 text-sm'}`}>Buscar</button>
      </div>
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-surface border border-line rounded-lg shadow-lg mt-1 z-50">
          {history.map(h => (
            <button key={h} onClick={() => { setQuery(h); search(h) }}
              className="block w-full text-left px-4 py-2.5 text-sm text-foreground-muted hover:bg-surface-muted">{h}</button>
          ))}
        </div>
      )}
    </div>
  )
}
