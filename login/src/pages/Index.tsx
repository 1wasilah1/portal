import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { Users, Shield, FileText, TrendingUp } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout className="flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-12 animate-fade-in">
        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer group" onClick={() => navigate('/citizen/register')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-foreground">Portal</CardTitle>
              <CardDescription>Daftar dan ajukan saran untuk kemajuan lingkungan</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="success" className="w-full">
                Masuk sebagai Warga
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer group" onClick={() => navigate('/admin/login')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-foreground">Portal Admin</CardTitle>
              <CardDescription>Kelola dan review pengajuan saran warga</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="civic" className="w-full">
                Masuk sebagai Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-civic-blue/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-civic-blue" />
            </div>
            <h3 className="font-semibold text-foreground">Mudah Digunakan</h3>
            <p className="text-sm text-muted-foreground">Interface yang sederhana dan intuitif untuk semua kalangan</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-civic-green/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-civic-green" />
            </div>
            <h3 className="font-semibold text-foreground">Tracking Realtime</h3>
            <p className="text-sm text-muted-foreground">Pantau progress pengajuan Anda secara realtime</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Transparansi</h3>
            <p className="text-sm text-muted-foreground">Proses yang transparan dan akuntabel untuk semua</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
