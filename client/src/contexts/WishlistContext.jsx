import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load wishlist from localStorage on mount
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Validate that parsed data is an array
        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        } else {
          console.error('Invalid wishlist data structure, resetting to empty array');
          setWishlist([]);
          localStorage.removeItem('wishlist');
        }
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        setWishlist([]);
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes
    if (wishlist.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } else {
      localStorage.removeItem('wishlist');
    }
  }, [wishlist]);

  const addToWishlist = (item) => {
    if (!item || !item._id) {
      console.error('Invalid item provided to wishlist:', item);
      return;
    }

    setWishlist((prevWishlist) => {
      const existingItem = prevWishlist.find((i) => i._id === item._id);
      if (existingItem) {
        return prevWishlist; // Item already in wishlist
      }
      
      // Ensure item has proper structure
      const wishlistItem = {
        ...item,
        addedAt: new Date().toISOString(),
        // Ensure type is set based on item structure
        type: item.type || (item.breed ? 'pet' : 'product')
      };
      
      return [...prevWishlist, wishlistItem];
    });
  };

  const removeFromWishlist = (itemId) => {
    if (!itemId) {
      console.error('Invalid itemId provided to removeFromWishlist:', itemId);
      return;
    }
    
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item._id !== itemId));
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('wishlist');
  };

  const isInWishlist = (itemId) => {
    if (!itemId) return false;
    return wishlist.some((item) => item._id === itemId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const getWishlistItems = () => {
    return wishlist;
  };

  const moveToCart = (itemId, cartContext) => {
    const item = wishlist.find((i) => i._id === itemId);
    if (item) {
      cartContext.addToCart(item, item.type || 'product');
      removeFromWishlist(itemId);
    }
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    getWishlistItems,
    moveToCart,
    loading,
    setLoading
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext; 