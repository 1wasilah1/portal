import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CenteredLayout } from '@/components/layout/Layout';
import { Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the proxy server instead of direct SSO API
      const response = await fetch('/login/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
        credentials: 'include', // Include cookies
        mode: 'cors' // Enable CORS
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if we received cookies from the SSO API
        const cookies = document.cookie;
        console.log('SSO Login successful');
        console.log('Response data:', data);
        console.log('Received cookies:', cookies);
        
        // Check for specific SSO cookies
        const hasRefreshToken = cookies.includes('refreshToken');
        const hasAccessToken = cookies.includes('accessToken');
        console.log('Has refreshToken:', hasRefreshToken);
        console.log('Has accessToken:', hasAccessToken);
        
        // Store admin login status in localStorage for frontend tracking
        localStorage.setItem('admin_login', 'true');
        localStorage.setItem('admin_username', data.data?.username || 'admin');
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        // Simulate SSO API response structure
        console.log('Expected SSO /auth/me response: { id: 2, username: "wasil", role: "admin" }');
        
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di dashboard admin",
        });
        
        // Redirect to admin dashboard - HTTP-only cookies will be automatically sent
        window.location.href = 'https://localhost:9200/login/admin/dashboard';
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Gagal",
          description: errorData.message || "Username atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan pada server atau kredensial salah",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredLayout>
      <div className="text-center mb-8 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Portal</h1>
        <p className="text-muted-foreground">Sistem Pengajuan Saran Warga</p>
      </div>

      <Card className="shadow-elegant border-0 animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Login Admin</CardTitle>
          <CardDescription>Masuk ke dashboard admin untuk mengelola pengajuan saran</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="wasil"
              required
            />
            
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              placeholder="Masukkan password"
              required
            />

            <Button 
              type="submit" 
              variant="civic" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Sedang Login..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/citizen/register')}
              className="text-sm"
            >
              Daftar sebagai warga →
            </Button>
          </div>
        </CardContent>
      </Card>
    </CenteredLayout>
  );
};