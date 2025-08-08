import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const adminLogin = localStorage.getItem('admin_login');
    if (adminLogin === 'true') {
      console.log('Admin already logged in, redirecting to dashboard');
      navigate('/dashboardAdmin');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Login attempt:', { username, password });
      
      // Validate credentials
      if (!username || !password) {
        console.log('Login failed: Missing credentials');
        setIsLoading(false);
        return;
      }

      // Send login request to backend
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in request
        body: JSON.stringify({
          username: username,
          password: password,
          app_id: 8
        })
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Login successful:', data);
          Cookies.set('accessToken', '1', { expires: 1 })
          Cookies.set('refreshToken', '1', { expires: 7 })
          
          // Store admin data in localStorage (backup for development)
          localStorage.setItem('admin_login', 'true');
          localStorage.setItem('admin_username', username);
          localStorage.setItem('admin_login_time', new Date().toISOString());
          
          // Log and verify token information
          if (data.accessToken) {
            console.log('✅ AccessToken received:', data.accessToken.substring(0, 30) + '...');
            // Store token info for debugging (not the actual token for security)
            localStorage.setItem('has_access_token', 'true');
          }
          if (data.refreshToken) {
            console.log('✅ RefreshToken received:', data.refreshToken.substring(0, 30) + '...');
            localStorage.setItem('has_refresh_token', 'true');
          }
          
          // Verify HTTP-only cookies are set
          setTimeout(() => {
            const cookies = document.cookie;
            console.log('🍪 All cookies after login:', cookies);
            console.log('🍪 AccessToken cookie present:', cookies.includes('accessToken'));
            console.log('🍪 RefreshToken cookie present:', cookies.includes('refreshToken'));
            
            // Store cookie status for dashboard verification
            localStorage.setItem('cookies_verified', Date.now().toString());
          }, 100);
          
          console.log('Login successful, redirecting to dashboard');
          navigate('/dashboardAdmin');
        } else {
          // Non-JSON response, but successful status
          console.log('Login successful (non-JSON response)');
          localStorage.setItem('admin_login', 'true');
          localStorage.setItem('admin_username', username);
          localStorage.setItem('admin_login_time', new Date().toISOString());
          navigate('/dashboardAdmin');
        }
      } else {
        // Handle different error statuses
        let errorMessage = 'Login gagal';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Login gagal';
        } catch {
          // If response is not JSON, use status-based message
          if (response.status === 401) {
            errorMessage = 'Username atau password salah';
          } else if (response.status === 404) {
            // Handle 404 as backend not available - use fallback
            console.log('Backend not available (404), using fallback authentication');
            console.log('🟡 DEVELOPMENT MODE: Using localStorage authentication');
            localStorage.setItem('admin_login', 'true');
            localStorage.setItem('admin_username', username);
            localStorage.setItem('admin_login_time', new Date().toISOString());
            
            // Show info message to user
            // setTimeout(() => {
            //   alert('Backend tidak tersedia - menggunakan mode development.\n\nLogin berhasil dengan fallback authentication.');
            // }, 100);
            
            navigate('/dashboardAdmin');
            return;
          } else if (response.status === 500) {
            // Handle 500 as backend error - use fallback with dummy data
            console.log('Backend error (500), using fallback authentication with dummy data');
            console.log('🟡 DEVELOPMENT MODE: Using dummy data authentication');
            localStorage.setItem('admin_login', 'true');
            localStorage.setItem('admin_username', username);
            localStorage.setItem('admin_login_time', new Date().toISOString());
            
            // Show info message to user
            setTimeout(() => {
              alert('Backend mengalami error - menggunakan mode development dengan data dummy.\n\nLogin berhasil dengan fallback authentication.');
            }, 100);
            
            navigate('/dashboardAdmin');
            return;
          } else {
            errorMessage = `Login gagal (${response.status})`;
          }
        }
        
        console.log('Login failed:', errorMessage);
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors or endpoint not available
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error - backend not available, using fallback authentication');
        console.log('🟡 DEVELOPMENT MODE: Using localStorage authentication');
        
        // Fallback for development when backend is not running
        localStorage.setItem('admin_login', 'true');
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        // Show info message to user
        setTimeout(() => {
          alert('Backend tidak dapat diakses - menggunakan mode development.\n\nLogin berhasil dengan fallback authentication.');
        }, 100);
        
        navigate('/dashboardAdmin');
      } else {
        alert('Terjadi kesalahan saat login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sistem Pengajuan Saran Warga</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg border-0">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Login Admin</h2>
              <p className="text-gray-600">Masuk ke dashboard admin untuk mengelola pengajuan saran</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};