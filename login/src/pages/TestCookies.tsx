import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TestCookies = () => {
  const [cookieStatus, setCookieStatus] = useState('');

  const setTestCookies = () => {
    const currentDomain = window.location.hostname;
    const cookieDomain = currentDomain === 'localhost' ? 'localhost' : currentDomain;
    
    document.cookie = `refreshToken=test_refresh_token; path=/; domain=${cookieDomain}; max-age=86400`;
    document.cookie = `accessToken=test_access_token; path=/; domain=${cookieDomain}; max-age=86400`;
    document.cookie = `admin_login=true; path=/; domain=${cookieDomain}; max-age=86400`;
    document.cookie = `admin_login_time=${new Date().toISOString()}; path=/; domain=${cookieDomain}; max-age=86400`;
    
    setCookieStatus('Cookies set successfully');
    console.log('Test cookies set for domain:', cookieDomain);
    console.log('All cookies:', document.cookie);
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    setCookieStatus(`Current cookies: ${cookies}`);
    console.log('Current cookies:', cookies);
  };

  const testBackendCall = async () => {
    try {
      const response = await fetch('/admin/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setCookieStatus(`Backend response: ${JSON.stringify(data)}`);
      console.log('Backend response:', data);
    } catch (error) {
      setCookieStatus(`Error: ${error.message}`);
      console.error('Backend call error:', error);
    }
  };

  const testAdminLogin = async () => {
    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'wasil',
          password: 'wasil123'
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      setCookieStatus(`Admin login response: ${JSON.stringify(data)}`);
      console.log('Admin login response:', data);
    } catch (error) {
      setCookieStatus(`Admin login error: ${error.message}`);
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Cookies & Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={setTestCookies} className="w-full">
            Set Test Cookies
          </Button>
          
          <Button onClick={checkCookies} className="w-full">
            Check Cookies
          </Button>
          
          <Button onClick={testBackendCall} className="w-full">
            Test Backend Call
          </Button>

          <Button onClick={testAdminLogin} className="w-full">
            Test Admin Login
          </Button>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm">{cookieStatus}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 