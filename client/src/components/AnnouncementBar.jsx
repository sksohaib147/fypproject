import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Box } from '@mui/material';

const AnnouncementBar = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    if (e.target.value === 'ur' && language === 'en') {
      toggleLanguage();
    } else if (e.target.value === 'en' && language === 'ur') {
      toggleLanguage();
    }
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', color: 'text.primary', fontSize: '0.875rem', py: 1, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background-color 0.3s' }}>
      <div className="flex-1 flex justify-center">
        <span className="text-center">
          Winter Sale On Pet Products With Free Express Delivery - OFF 25%{' '}
          <Link to="/pcmarketplace" className="font-bold underline ml-1">ShopNow</Link>
        </span>
      </div>
      <div className="flex items-center ml-4">
        <select 
          className="bg-black text-white text-xs border-none focus:ring-0 cursor-pointer"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="ur">اردو</option>
        </select>
      </div>
    </Box>
  );
};

export default AnnouncementBar; 