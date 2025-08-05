import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home, User } from 'lucide-react';
import { logout } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/utils/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showHomeButton?: boolean;
  showLogoutButton?: boolean;
  onHomeClick?: () => void;
  className?: string;
}

export const Header = ({ 
  title, 
  subtitle, 
  showHomeButton = true, 
  showLogoutButton = true,
  onHomeClick,
  className = ''
}: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = getUserData();

  const handleLogout = () => {
    logout(navigate);
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/citizen/progress');
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
        {userData && (
          <div className="flex items-center gap-2 mt-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm text-blue-600">
              {userData.nama} ({userData.email})
            </span>
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        {showHomeButton && (
          <Button variant="outline" onClick={handleHomeClick}>
            <Home className="w-4 h-4 mr-2" />
            Beranda
          </Button>
        )}
        {showLogoutButton && (
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}; 