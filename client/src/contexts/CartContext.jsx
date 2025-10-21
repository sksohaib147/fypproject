import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    products: [],
    pets: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Handle legacy cart format
        if (Array.isArray(parsedCart)) {
          setCart({
            products: parsedCart.filter(item => item.type !== 'pet'),
            pets: parsedCart.filter(item => item.type === 'pet')
          });
        } else {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCart({ products: [], pets: [] });
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, type = 'product') => {
    setCart((prevCart) => {
      const cartType = type === 'pet' ? 'pets' : 'products';
      const existingItem = prevCart[cartType].find((i) => i._id === item._id);
      
      if (existingItem) {
        // For products, increment quantity; for pets, replace (can't have multiple of same pet)
        if (type === 'product') {
          return {
            ...prevCart,
            [cartType]: prevCart[cartType].map((i) =>
              i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        } else {
          // For pets, show message that it's already in cart
          return prevCart;
        }
      }
      
      return {
        ...prevCart,
        [cartType]: [...prevCart[cartType], { ...item, quantity: type === 'product' ? 1 : 1, type }]
      };
    });
  };

  const removeFromCart = (itemId, type = 'product') => {
    setCart((prevCart) => {
      const cartType = type === 'pet' ? 'pets' : 'products';
      return {
        ...prevCart,
        [cartType]: prevCart[cartType].filter((item) => item._id !== itemId)
      };
    });
  };

  const updateQuantity = (itemId, quantity, type = 'product') => {
    if (quantity < 1) return;
    
    setCart((prevCart) => {
      const cartType = type === 'pet' ? 'pets' : 'products';
      return {
        ...prevCart,
        [cartType]: prevCart[cartType].map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        )
      };
    });
  };

  const clearCart = () => {
    setCart({ products: [], pets: [] });
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    const productsTotal = cart.products.reduce((total, item) => total + (item.priceUSD || item.price) * item.quantity, 0);
    const petsTotal = cart.pets.reduce((total, item) => total + (item.price || 0), 0);
    return productsTotal + petsTotal;
  };

  const getCartItemCount = () => {
    const productsCount = cart.products.reduce((total, item) => total + item.quantity, 0);
    const petsCount = cart.pets.length;
    return productsCount + petsCount;
  };

  const getCartItems = () => {
    return [...cart.products, ...cart.pets];
  };

  const isCartEmpty = () => {
    return cart.products.length === 0 && cart.pets.length === 0;
  };

  const validateCart = () => {
    const errors = [];
    
    // Check if products are still available
    cart.products.forEach(item => {
      if (item.quantity > (item.stock || 0)) {
        errors.push(`${item.name} - Insufficient stock. Available: ${item.stock}`);
      }
    });
    
    // Check if pets are still available
    cart.pets.forEach(item => {
      if (item.status !== 'available') {
        errors.push(`${item.name} - No longer available`);
      }
    });
    
    return errors;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getCartItems,
    isCartEmpty,
    validateCart,
    loading,
    setLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 