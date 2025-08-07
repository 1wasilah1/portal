import { useNavigate } from 'react-router-dom';

export const logout = (navigate: ReturnType<typeof useNavigate>) => {
  // Clear all localStorage items
  localStorage.removeItem('userToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userData');
  localStorage.removeItem('coordinates');
  localStorage.removeItem('adminLoginStatus');
  localStorage.removeItem('adminLoginTime');
  
  // Clear all cookies
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'admin_login=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'admin_login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  // Redirect to login page
  navigate('/login/citizen/register');
};

export const isLoggedIn = (): boolean => {
  const userToken = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  return !!(userToken && userEmail);
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken');
};

// Check if HTTP-only cookies are present (for admin authentication)
export const hasHttpOnlyCookies = (): boolean => {
  const cookies = document.cookie;
  return cookies.includes('accessToken') && cookies.includes('refreshToken');
};

// Check admin authentication status
export const isAdminLoggedIn = (): boolean => {
  // First check for HTTP-only cookies (preferred method)
  if (hasHttpOnlyCookies()) {
    return true;
  }
  
  // Fallback to localStorage (development mode)
  const adminLogin = localStorage.getItem('admin_login');
  return adminLogin === 'true';
};

// Get admin data
export const getAdminData = () => {
  const adminUsername = localStorage.getItem('admin_username');
  const adminLoginTime = localStorage.getItem('admin_login_time');
  
  if (adminUsername) {
    return {
      username: adminUsername,
      role: 'admin',
      loginTime: adminLoginTime
    };
  }
  
  return null;
};

// Get detailed token information
export const getTokenInfo = () => {
  const cookies = document.cookie;
  const hasAccessTokenFlag = localStorage.getItem('has_access_token') === 'true';
  const hasRefreshTokenFlag = localStorage.getItem('has_refresh_token') === 'true';
  const cookiesVerified = localStorage.getItem('cookies_verified');
  
  return {
    // HTTP-only cookies detection (might not work due to HttpOnly)
    cookiesInDocument: {
      hasAccessToken: cookies.includes('accessToken'),
      hasRefreshToken: cookies.includes('refreshToken'),
      allCookies: cookies
    },
    // Token flags from API response
    tokenFlags: {
      hasAccessTokenFlag,
      hasRefreshTokenFlag,
      cookiesVerified: !!cookiesVerified,
      verifiedAt: cookiesVerified ? new Date(parseInt(cookiesVerified)).toISOString() : null
    },
    // Overall token status
    hasTokens: hasAccessTokenFlag && hasRefreshTokenFlag
  };
};

// Log detailed token information
export const logTokenInfo = () => {
  const tokenInfo = getTokenInfo();
  console.log('🔍 Complete Token Information:');
  console.log('  🍪 Cookies in document:', tokenInfo.cookiesInDocument);
  console.log('  🏷️  Token flags:', tokenInfo.tokenFlags);
  console.log('  ✅ Has tokens:', tokenInfo.hasTokens);
  return tokenInfo;
};

// Admin logout function
export const adminLogout = async (navigate: ReturnType<typeof useNavigate>) => {
  try {
    // Try to call backend logout endpoint
    await fetch('/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.warn('Admin logout API call failed:', error);
  }
  
  // Clear localStorage
  localStorage.removeItem('admin_login');
  localStorage.removeItem('admin_username');
  localStorage.removeItem('admin_login_time');
  localStorage.removeItem('has_access_token');
  localStorage.removeItem('has_refresh_token');
  localStorage.removeItem('cookies_verified');
  
  // Clear HTTP-only cookies (attempt - might not work due to HttpOnly flag)
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; Secure; SameSite=Strict';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; Secure; SameSite=Strict';
  
  // Redirect to admin login
  navigate('/loginAdmin');
}; 