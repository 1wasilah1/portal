import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CenteredLayout } from '@/components/layout/Layout';
import { Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'admin123') {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di dashboard admin",
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Login Gagal",
          description: "Email atau password salah",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="admin@example.com"
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