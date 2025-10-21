import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  const notify = useCallback((message, type = 'info') => {
    setNotification({ open: true, message, type });
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification((n) => ({ ...n, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}; 