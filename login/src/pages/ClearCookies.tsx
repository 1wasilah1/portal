import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CenteredLayout } from '@/components/layout/Layout';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ClearCookies = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { toast } = useToast();

  const clearDummyCookies = () => {
    setIsClearing(true);
    
    // Clear all dummy cookies
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'admin_login=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'admin_login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Clear localStorage
    localStorage.removeItem('adminLoginStatus');
    localStorage.removeItem('adminLoginTime');
    
    toast({
      title: "Cookies Dihapus",
      description: "Semua cookies dummy telah dibersihkan",
    });
    
    setIsClearing(false);
  };

  const testSSOAPI = async () => {
    setIsTesting(true);
    setTestResult('');
    
    try {
      const response = await fetch('https://localhost:3500/api/sso/v1/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ SSO API berfungsi\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ SSO API error\nStatus: ${response.status}\nResponse: ${await response.text()}`);
      }
    } catch (error) {
      setTestResult(`❌ SSO API tidak dapat diakses\nError: ${error.message}`);
    }
    
    setIsTesting(false);
  };

  const getCurrentCookies = () => {
    return document.cookie || 'Tidak ada cookies';
  };

  return (
    <CenteredLayout>
      <div className="text-center mb-8 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
          <Trash2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Clear Cookies</h1>
        <p className="text-muted-foreground">Membersihkan cookies dummy dan test SSO API</p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-elegant border-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Clear Dummy Cookies
            </CardTitle>
            <CardDescription>
              Hapus semua cookies dummy yang tersisa dari login sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">
                Current Cookies: {getCurrentCookies()}
              </p>
            </div>
            <Button 
              onClick={clearDummyCookies}
              disabled={isClearing}
              variant="destructive"
              className="w-full"
            >
              {isClearing ? "Membersihkan..." : "Clear All Dummy Cookies"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Test SSO API
            </CardTitle>
            <CardDescription>
              Test konektivitas ke SSO API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testSSOAPI}
              disabled={isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? "Testing..." : "Test SSO API Connectivity"}
            </Button>
            
            {testResult && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono whitespace-pre-wrap">
                  {testResult}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              1. Klik "Clear All Dummy Cookies" untuk menghapus cookies dummy
            </p>
            <p className="text-sm">
              2. Klik "Test SSO API" untuk memverifikasi konektivitas
            </p>
            <p className="text-sm">
              3. Jika SSO API berfungsi, coba login dengan kredensial SSO yang valid
            </p>
            <p className="text-sm">
              4. Jika SSO API tidak berfungsi, hubungi administrator
            </p>
          </CardContent>
        </Card>
      </div>
    </CenteredLayout>
  );
}; 