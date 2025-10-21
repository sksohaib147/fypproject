import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    pets: 'Pets',
    cart: 'Cart',
    login: 'Login',
    signup: 'Sign Up',
    profile: 'Profile',
    
    // Categories
    categories: 'Product Categories',
    dogFood: 'Dog Food',
    catFood: 'Cat Food',
    rabbitFood: 'Rabbit Food',
    toys: 'Toys',
    beltsAndCages: 'Belts and Cages',
    
    // Flash Sales
    today: 'Today',
    flashSales: 'Flash Sales',
    
    // Best Selling
    topRated: 'Top Rated',
    bestSellingPets: 'Best Selling Pets',
    viewAll: 'View All',
  },
  ur: {
    // Navigation
    home: 'ہوم',
    products: 'پروڈکٹس',
    pets: 'پالتو جانور',
    cart: 'کارٹ',
    login: 'لاگ ان',
    signup: 'سائن اپ',
    profile: 'پروفائل',
    
    // Categories
    categories: 'پروڈکٹ کیٹیگریز',
    dogFood: 'کتوں کا کھانا',
    catFood: 'بلیوں کا کھانا',
    rabbitFood: 'خرگوش کا کھانا',
    toys: 'کھلونے',
    beltsAndCages: 'پٹے اور پنجرے',
    
    // Flash Sales
    today: 'آج',
    flashSales: 'فلیش سیلز',
    
    // Best Selling
    topRated: 'سب سے زیادہ ریٹڈ',
    bestSellingPets: 'سب سے زیادہ فروخت ہونے والے پالتو جانور',
    viewAll: 'سب دیکھیں',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'ur' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 