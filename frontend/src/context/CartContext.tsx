import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '../types';
import { cartApi } from '../api/services';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  fetchCart: () => void;
  addToCart: (productId: number, quantity: number, productName?: string, unitPrice?: number, imageUrl?: string) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || !user) return;
    try {
      setLoading(true);
      const resp = await cartApi.getCart(user.userId);
      setCart(resp.data.data);
    } catch (e) {
      console.error('Error fetching cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart(null);
  }, [isAuthenticated, user?.userId]);

  const addToCart = async (productId: number, quantity: number, productName?: string, unitPrice?: number, imageUrl?: string) => {
    if (!user) throw new Error('Login required');
    const resp = await cartApi.addItem(user.userId, { productId, quantity, productName, unitPrice, imageUrl });
    setCart(resp.data.data);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) throw new Error('Login required');
    const resp = await cartApi.updateItem(user.userId, productId, { quantity });
    setCart(resp.data.data);
  };

  const removeItem = async (productId: number) => {
    if (!user) throw new Error('Login required');
    const resp = await cartApi.removeItem(user.userId, productId);
    setCart(resp.data.data);
  };

  const clearCart = async () => {
    if (!user) throw new Error('Login required');
    await cartApi.clearCart(user.userId);
    setCart(prev => prev ? { ...prev, items: [], totalAmount: 0, itemCount: 0 } : null);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount: cart?.itemCount || 0,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
