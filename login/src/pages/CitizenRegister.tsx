import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CenteredLayout } from '@/components/layout/Layout';
import { User, Mail, Phone, MapPin, Lock, Users, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const CitizenRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserEmail) {
      // User already logged in, redirect to progress page
      navigate('/login/citizen/progress');
    }
  }, [navigate]);

  // Extract coordinates from URL parameters and save to localStorage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      const coordData = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
      
      // Save coordinates to localStorage instead of displaying
      localStorage.setItem('coordinates', JSON.stringify(coordData));
      
      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  const handleSubmitForm = () => {
    if (!submissionForm.title || !submissionForm.description) {
      toast({
        title: "Formulir Tidak Lengkap",
        description: "Mohon isi judul dan deskripsi pengajuan",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Pengajuan Berhasil",
      description: "Saran Anda telah berhasil dikirim dan sedang diproses",
    });

    // Clear form and close modal
    setSubmissionForm({
      title: '',
      description: '',
      category: '',
      priority: 'medium'
    });
    setShowLocationModal(false);
    
    // Clear coordinates from localStorage
    localStorage.removeItem('coordinates');
    
    // Navigate to progress page
    navigate('/citizen/progress');
  };

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda telah dibuat. Silakan login untuk melanjutkan.",
      });
      setIsLoading(false);
      // Reset form and switch to login tab
      setRegisterForm({ name: '', email: '', phone: '', address: '' });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Save user email to localStorage
      localStorage.setItem('userEmail', loginForm.email);
      
      toast({
        title: "Login Berhasil",
        description: "Selamat datang! Anda dapat mulai mengajukan saran.",
      });
      
      // Check if coordinates exist in localStorage
      const storedCoordinates = localStorage.getItem('coordinates');
      if (storedCoordinates) {
        try {
          const coordData = JSON.parse(storedCoordinates);
          setCoordinates(coordData);
          setShowLocationModal(true);
        } catch (error) {
          console.error('Error parsing coordinates:', error);
          navigate('/citizen/progress');
        }
      } else {
        navigate('/citizen/progress');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <CenteredLayout>
      <div className="text-center mb-8 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-4 shadow-glow">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>

      <Card className="shadow-elegant border-0 animate-fade-in w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Akses Portal</CardTitle>
          <CardDescription>Daftar atau masuk untuk mengajukan saran</CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Jika sudah punya akun silahkan masuk dengan menggunakan email yang sudah terdaftar
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Daftar</TabsTrigger>
              <TabsTrigger value="login">Masuk</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <InputField
                  label="Nama Lengkap"
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  icon={<User className="w-4 h-4" />}
                  placeholder="Masukkan nama lengkap"
                  required
                />
                
                <InputField
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="contoh@email.com"
                  required
                />
                
                <InputField
                  label="Nomor HP"
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="08xxxxxxxxxx"
                  required
                />
                
                <InputField
                  label="Alamat"
                  type="text"
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="Alamat lengkap"
                  required
                />

                <Button 
                  type="submit" 
                  variant="success" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  label="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="Masukkan email terdaftar"
                  required
                />

                <Button 
                  type="submit" 
                  variant="civic" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sedang Masuk..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/admin/login')}
              className="text-sm"
            >
              ← Kembali ke login admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog untuk Pengajuan dengan Koordinat */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ajukan Saran Baru</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk mengajukan saran atau keluhan berdasarkan lokasi yang Anda pilih
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Koordinat Lokasi */}
            {coordinates && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Navigation className="w-4 h-4" />
                  <span className="font-medium">Lokasi Terdeteksi</span>
                </div>
                <div className="text-sm text-blue-600">
                  Latitude: {coordinates.lat.toFixed(6)}, Longitude: {coordinates.lng.toFixed(6)}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <InputField
                  label="Judul Pengajuan"
                  id="title"
                  type="text"
                  value={submissionForm.title}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Perbaikan Jalan Rusak di RT 05"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={submissionForm.category}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Pilih kategori</option>
                  <option value="infrastructure">Infrastruktur</option>
                  <option value="environment">Lingkungan</option>
                  <option value="security">Keamanan</option>
                  <option value="social">Sosial</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Prioritas</Label>
                <select
                  id="priority"
                  value={submissionForm.priority}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Mendesak</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi Detail</Label>
                <Textarea
                  id="description"
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan detail saran atau keluhan Anda..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => {
                setShowLocationModal(false);
                localStorage.removeItem('coordinates');
                navigate('/citizen/progress');
              }}>
                Lewati
              </Button>
              <Button onClick={handleSubmitForm} variant="success">
                Kirim Pengajuan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CenteredLayout>
  );
};