import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Cart } from '../types'
import { cartService } from '../services/cart.service'
import { getErrorMessage } from '../utils/errors'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  itemCount: number
  loading: boolean
  error: string | null
  pendingItemId: number | null
  clearError: () => void
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return }
    try {
      setLoading(true)
      const data = await cartService.getCart()
      setCart(data)
    } catch { setCart(null) }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { refreshCart() }, [refreshCart])

  const runMutation = useCallback(async (
    key: number,
    action: () => Promise<Cart | void>,
    fallbackMessage: string,
  ) => {
    setError(null)
    setPendingItemId(key)
    try {
      const data = await action()
      if (data) setCart(data)
    } catch (err) {
      setError(getErrorMessage(err, fallbackMessage))
      throw err
    } finally {
      setPendingItemId(null)
    }
  }, [])

  const addItem = useCallback((productId: number, quantity = 1) =>
    runMutation(productId, () => cartService.addItem(productId, quantity), 'No se pudo agregar el producto al carrito'), [runMutation])

  const updateQuantity = useCallback((itemId: number, quantity: number) =>
    runMutation(itemId, () => cartService.updateQuantity(itemId, quantity), 'No se pudo actualizar la cantidad'), [runMutation])

  const removeItem = useCallback((itemId: number) =>
    runMutation(itemId, () => cartService.removeItem(itemId), 'No se pudo eliminar el producto'), [runMutation])

  const clearCart = useCallback(async () => {
    setError(null)
    setPendingItemId(-1)
    try {
      await cartService.clearCart()
      setCart(null)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo vaciar el carrito'))
      throw err
    } finally {
      setPendingItemId(null)
    }
  }, [])

  const value = useMemo(
    () => ({ cart, itemCount: cart?.itemCount || 0, loading, error, pendingItemId, clearError, addItem, updateQuantity, removeItem, clearCart, refreshCart }),
    [cart, loading, error, pendingItemId, clearError, addItem, updateQuantity, removeItem, clearCart, refreshCart]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
