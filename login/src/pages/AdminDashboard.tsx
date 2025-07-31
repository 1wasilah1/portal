import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/Layout';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockSuggestions = [
  {
    id: '1',
    title: 'Perbaikan Jalan Rusak di RT 05',
    description: 'Jalan di RT 05 mengalami kerusakan parah dengan banyak lubang yang membahayakan pengendara.',
    submitterName: 'Ahmad Sudirman',
    submitterEmail: 'ahmad.sudirman@email.com',
    submittedDate: '15 Jan 2024',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Pengadaan Taman Bermain Anak',
    description: 'Usulan pembangunan taman bermain anak di area kosong dekat masjid untuk meningkatkan kualitas hidup warga.',
    submitterName: 'Siti Nurhaliza',
    submitterEmail: 'siti.nurhaliza@email.com',
    submittedDate: '10 Jan 2024',
    status: 'approved',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Perbaikan Sistem Drainase',
    description: 'Sistem drainase di RW 03 sering mampet saat hujan deras menyebabkan banjir di pemukiman.',
    submitterName: 'Budi Santoso',
    submitterEmail: 'budi.santoso@email.com',
    submittedDate: '8 Jan 2024',
    status: 'rejected',
    priority: 'high'
  },
  {
    id: '4',
    title: 'Pengadaan Lampu Jalan',
    description: 'Beberapa titik jalan gelap karena lampu rusak, perlu diperbaiki untuk keamanan warga.',
    submitterName: 'Maria Goretti',
    submitterEmail: 'maria.goretti@email.com',
    submittedDate: '5 Jan 2024',
    status: 'pending',
    priority: 'medium'
  }
];

const mockCitizens = [
  {
    id: '1',
    name: 'Ahmad Sudirman',
    email: 'ahmad.sudirman@email.com',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 45, RT 05/RW 02',
    registeredDate: '10 Jan 2024',
    totalSubmissions: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@email.com',
    phone: '082345678901',
    address: 'Jl. Sudirman No. 12, RT 03/RW 01',
    registeredDate: '8 Jan 2024',
    totalSubmissions: 2,
    status: 'active'
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '083456789012',
    address: 'Jl. Pahlawan No. 78, RT 01/RW 03',
    registeredDate: '5 Jan 2024',
    totalSubmissions: 1,
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Maria Goretti',
    email: 'maria.goretti@email.com',
    phone: '084567890123',
    address: 'Jl. Pemuda No. 23, RT 02/RW 01',
    registeredDate: '3 Jan 2024',
    totalSubmissions: 4,
    status: 'active'
  }
];

export const AdminDashboard = () => {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [citizens, setCitizens] = useState(mockCitizens);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id ? { ...suggestion, status: 'approved' } : suggestion
      )
    );
    toast({
      title: "Pengajuan Disetujui",
      description: "Pengajuan telah berhasil disetujui",
    });
  };

  const handleReject = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id ? { ...suggestion, status: 'rejected' } : suggestion
      )
    );
    toast({
      title: "Pengajuan Ditolak",
      description: "Pengajuan telah ditolak",
      variant: "destructive",
    });
  };

  const handleCitizenStatusToggle = (id: string) => {
    setCitizens(prev => 
      prev.map(citizen => 
        citizen.id === id 
          ? { ...citizen, status: citizen.status === 'active' ? 'inactive' : 'active' }
          : citizen
      )
    );
    toast({
      title: "Status Warga Diperbarui",
      description: "Status warga berhasil diubah",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem admin",
    });
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'pending':
        return <Badge variant="secondary">Menunggu</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Tinggi</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-white">Sedang</Badge>;
      case 'low':
        return <Badge variant="outline">Rendah</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = {
    totalSuggestions: suggestions.length,
    pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
    approvedSuggestions: suggestions.filter(s => s.status === 'approved').length,
    rejectedSuggestions: suggestions.filter(s => s.status === 'rejected').length,
    totalCitizens: citizens.length,
    activeCitizens: citizens.filter(c => c.status === 'active').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-1">Kelola pengajuan saran dan data warga</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.totalSuggestions}</div>
                  <div className="text-sm opacity-90">Total Pengajuan</div>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.pendingSuggestions}</div>
                  <div className="text-sm opacity-90">Menunggu Review</div>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-accent text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.approvedSuggestions}</div>
                  <div className="text-sm opacity-90">Disetujui</div>
                </div>
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-civic-blue text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.activeCitizens}</div>
                  <div className="text-sm opacity-90">Warga Aktif</div>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="suggestions">Pengajuan Saran</TabsTrigger>
            <TabsTrigger value="citizens">Data Warga</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid gap-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="shadow-card hover:shadow-elegant transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-2">{suggestion.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {getStatusBadge(suggestion.status)}
                        {getPriorityBadge(suggestion.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{suggestion.submitterName}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{suggestion.submitterEmail}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{suggestion.submittedDate}</span>
                        </div>
                      </div>
                      
                      {suggestion.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleApprove(suggestion.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Setujui
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(suggestion.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="citizens" className="space-y-6">
            <div className="grid gap-6">
              {citizens.map((citizen) => (
                <Card key={citizen.id} className="shadow-card hover:shadow-elegant transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">{citizen.name}</CardTitle>
                        <CardDescription>
                          Terdaftar sejak {citizen.registeredDate} • {citizen.totalSubmissions} pengajuan
                        </CardDescription>
                      </div>
                      <Badge 
                        className={citizen.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}
                      >
                        {citizen.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{citizen.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{citizen.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{citizen.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span>{citizen.totalSubmissions} pengajuan diajukan</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCitizenStatusToggle(citizen.id)}
                      >
                        {citizen.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};