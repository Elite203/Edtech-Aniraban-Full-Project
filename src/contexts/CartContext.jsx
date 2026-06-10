
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localCart = localStorage.getItem('anirbansAcademyCart');
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('anirbansAcademyCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (course) => {
    setCart((prevCart) => {
      const existingCourse = prevCart.find(item => item.id === course.id);
      if (existingCourse) {
        // Optionally, you could increase quantity here if courses could be added multiple times
        // For now, just ensure it's in the cart
        return prevCart;
      }
      // Store only essential fields to avoid localStorage quota exceeded error
      return [...prevCart, { 
        id: course.id, 
        title: course.title, 
        price: course.price, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (courseId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
