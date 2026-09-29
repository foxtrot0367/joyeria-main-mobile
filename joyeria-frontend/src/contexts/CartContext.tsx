import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Cart } from '../types'
import { cartService } from '../services/cart.service'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  itemCount: number
  loading: boolean
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

  const addItem = async (productId: number, quantity = 1) => {
    const data = await cartService.addItem(productId, quantity)
    setCart(data)
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    const data = await cartService.updateQuantity(itemId, quantity)
    setCart(data)
  }

  const removeItem = async (itemId: number) => {
    const data = await cartService.removeItem(itemId)
    setCart(data)
  }

  const clearCart = async () => {
    await cartService.clearCart()
    setCart(null)
  }

  return (
    <CartContext.Provider value={{ cart, itemCount: cart?.itemCount || 0, loading, addItem, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)