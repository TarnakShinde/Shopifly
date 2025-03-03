"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(currentCart => {
      // Check if product already exists in cart
      const existingProduct = currentCart.find(item => item.unique_id === product.unique_id);

      if (existingProduct) {
        // If exists, increase quantity
        return currentCart.map(item =>
          item.unique_id === product.unique_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // If not exists, add new product with quantity 1
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (unique_id) => {
    setCart(currentCart => currentCart.filter(item => item.unique_id !== unique_id));
  };

  const updateQuantity = (unique_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(unique_id);
    } else {
      setCart(currentCart =>
        currentCart.map(item =>
          item.unique_id === unique_id
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
