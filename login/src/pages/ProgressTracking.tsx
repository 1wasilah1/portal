import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/Layout';
import { ProgressPipeline, ProgressStep } from '@/components/progress/ProgressPipeline';
import { PlusCircle, FileText, LogOut, Home, Navigation, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InputField } from '@/components/ui/input-field';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { logout } from '@/utils/auth';
import { Header } from '@/components/Header';

const mockSubmissions = [
  {
    id: '1',
    title: 'Perbaikan Jalan Rusak di RT 05',
    submittedDate: '15 Jan 2024',
    steps: [
      {
        id: '1',
        title: 'Pengajuan Diterima',
        description: 'Saran Anda telah berhasil dikirim dan diterima oleh sistem',
        status: 'completed' as const,
        date: '15 Jan 2024'
      },
      {
        id: '2',
        title: 'Verifikasi Data',
        description: 'Tim verifikasi sedang memeriksa kelengkapan dan validitas pengajuan',
        status: 'completed' as const,
        date: '16 Jan 2024'
      },
      {
        id: '3',
        title: 'Review oleh Admin',
        description: 'Admin sedang melakukan review mendalam terhadap pengajuan Anda',
        status: 'active' as const,
        date: '18 Jan 2024'
      },
      {
        id: '4',
        title: 'Keputusan Final',
        description: 'Pengajuan akan mendapat keputusan akhir dari pihak berwenang',
        status: 'pending' as const
      },
      {
        id: '5',
        title: 'Implementasi',
        description: 'Jika disetujui, pengajuan akan diimplementasikan sesuai rencana',
        status: 'pending' as const
      }
    ]
  },
  {
    id: '2',
    title: 'Pengadaan Taman Bermain Anak',
    submittedDate: '10 Jan 2024',
    steps: [
      {
        id: '1',
        title: 'Pengajuan Diterima',
        description: 'Saran Anda telah berhasil dikirim dan diterima oleh sistem',
        status: 'completed' as const,
        date: '10 Jan 2024'
      },
      {
        id: '2',
        title: 'Verifikasi Data',
        description: 'Tim verifikasi sedang memeriksa kelengkapan dan validitas pengajuan',
        status: 'completed' as const,
        date: '11 Jan 2024'
      },
      {
        id: '3',
        title: 'Review oleh Admin',
        description: 'Admin telah menyelesaikan review terhadap pengajuan Anda',
        status: 'completed' as const,
        date: '12 Jan 2024'
      },
      {
        id: '4',
        title: 'Keputusan Final',
        description: 'Pengajuan telah mendapat persetujuan dari pihak berwenang',
        status: 'completed' as const,
        date: '14 Jan 2024'
      },
      {
        id: '5',
        title: 'Implementasi',
        description: 'Proyek sedang dalam tahap pelaksanaan',
        status: 'active' as const,
        date: '16 Jan 2024'
      }
    ]
  }
];

export const ProgressTracking = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(mockSubmissions[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const storedUserEmail = localStorage.getItem('userEmail');
    if (!storedUserEmail) {
      // User not logged in, redirect to register page
              navigate('/loginCitizen');
      return;
    }
    setUserEmail(storedUserEmail);
  }, [navigate]);

  // Read coordinates from localStorage and show modal if exists
  useEffect(() => {
    const storedCoordinates = localStorage.getItem('coordinates');
    if (storedCoordinates) {
      try {
        const coordData = JSON.parse(storedCoordinates);
        setCoordinates(coordData);
        // Show modal automatically if coordinates exist
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error parsing coordinates from localStorage:', error);
      }
    }
  }, []);

  const handleNewSubmission = () => {
    setIsModalOpen(true);
  };

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
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logout(navigate);
    toast({
      title: "Logout Berhasil",
      description: "Terima kasih telah menggunakan sistem kami",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Header 
          title="Progress Pengajuan"
          subtitle="Pantau status pengajuan saran Anda"
          showHomeButton={false}
        />
        
        <div className="flex justify-end mb-6">
          <Button variant="success" onClick={handleNewSubmission}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajukan Saran Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Daftar Pengajuan</h2>
            {mockSubmissions.map((submission) => (
              <Card 
                key={submission.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-elegant ${
                  selectedSubmission.id === submission.id ? 'border-primary shadow-md' : ''
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground">Diajukan: {submission.submittedDate}</p>
                      <div className="mt-2">
                        {(() => {
                          const activeStep = submission.steps.find(step => step.status === 'active');
                          const completedSteps = submission.steps.filter(step => step.status === 'completed').length;
                          const totalSteps = submission.steps.length;
                          
                          return (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">
                                {activeStep ? activeStep.title : 'Menunggu review'}
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-primary h-1.5 rounded-full transition-all duration-500 animate-progress-fill"
                                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Pipeline */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{selectedSubmission.title}</CardTitle>
                <CardDescription>
                  Diajukan pada {selectedSubmission.submittedDate} • Status terkini dalam proses review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressPipeline steps={selectedSubmission.steps} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">2</div>
                <div className="text-sm opacity-90">Total Pengajuan</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-accent text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">1</div>
                <div className="text-sm opacity-90">Sedang Diproses</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-civic-green text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">1</div>
                <div className="text-sm opacity-90">Disetujui</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Form untuk Pengajuan Baru */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ajukan Saran Baru</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk mengajukan saran atau keluhan
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
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmitForm} variant="success">
                Kirim Pengajuan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};