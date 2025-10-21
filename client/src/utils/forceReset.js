// Force reset all authentication state
export const forceResetAuth = () => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Force clear specific auth items
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
  sessionStorage.removeItem('userToken');
  
  console.log('=== NUCLEAR RESET COMPLETE ===');
  console.log('All storage cleared. Reloading page...');
  
  // Reload the page
  window.location.reload();
};

// Check if user is actually authenticated
export const checkAuthStatus = () => {
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  const sessionToken = sessionStorage.getItem('userToken');
  
  console.log('=== AUTH STATUS CHECK ===');
  console.log('localStorage.userToken:', userToken);
  console.log('sessionStorage.userToken:', sessionToken);
  console.log('localStorage.adminToken:', adminToken);
  console.log('Has any token:', !!(userToken || adminToken || sessionToken));
  
  return {
    hasUserToken: !!userToken,
    hasAdminToken: !!adminToken,
    hasSessionToken: !!sessionToken,
    hasAnyToken: !!(userToken || adminToken || sessionToken)
  };
};

// Test authentication with current token
export const testAuthentication = async () => {
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('=== AUTHENTICATION TEST ===');
  
  if (userToken) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('User auth test status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('User auth test success:', data);
        return { success: true, type: 'user', data };
      } else {
        console.log('User auth test failed');
        return { success: false, type: 'user' };
      }
    } catch (error) {
      console.log('User auth test error:', error);
      return { success: false, type: 'user', error };
    }
  }
  
  if (adminToken) {
    try {
      const response = await fetch('http://localhost:5000/api/admin/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Admin auth test status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Admin auth test success:', data);
        return { success: true, type: 'admin', data };
      } else {
        console.log('Admin auth test failed');
        return { success: false, type: 'admin' };
      }
    } catch (error) {
      console.log('Admin auth test error:', error);
      return { success: false, type: 'admin', error };
    }
  }
  
  console.log('No tokens found for testing');
  return { success: false, type: 'none' };
}; 