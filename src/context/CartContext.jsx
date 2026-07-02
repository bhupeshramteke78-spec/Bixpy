import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { orderMenuItems } from '../data/orderMenu'

const CartContext = createContext(null)
const storageKey = 'cornbite-cart-v1'
const validProductIds = new Set(orderMenuItems.map(item=>item.id))

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(parsed) ? parsed.filter(item => validProductIds.has(item?.id) && Number.isInteger(item.quantity) && item.quantity > 0) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)) }, [items])

  const addItem = (item,openCart=true) => {
    setItems(current => {
      const existing = current.find(entry => entry.id === item.id)
      if (existing) return current.map(entry => entry.id === item.id ? { ...entry, quantity: Math.min(entry.quantity + 1, 20) } : entry)
      return [...current, { id:item.id, name:item.name, price:item.price, image:item.image, quantity:1 }]
    })
    if(openCart)setIsOpen(true)
  }

  const setQuantity = (id, quantity) => setItems(current => quantity < 1 ? current.filter(item => item.id !== id) : current.map(item => item.id === id ? { ...item, quantity:Math.min(quantity,20) } : item))
  const removeItem = id => setItems(current => current.filter(item => item.id !== id))
  const clearCart = () => setItems([])
  const itemCount = items.reduce((total,item) => total + item.quantity, 0)
  const subtotal = items.reduce((total,item) => total + item.price * item.quantity, 0)
  const value = useMemo(() => ({ items,itemCount,subtotal,isOpen,setIsOpen,addItem,setQuantity,removeItem,clearCart }), [items,itemCount,subtotal,isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() { return useContext(CartContext) }
