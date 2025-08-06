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
  navigate('/citizen/register');
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