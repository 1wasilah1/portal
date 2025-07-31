import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-subtle ${className}`}>
      {children}
    </div>
  );
};

export const CenteredLayout = ({ children, className = "" }: LayoutProps) => {
  return (
    <Layout className={`flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        {children}
      </div>
    </Layout>
  );
};

export const DashboardLayout = ({ children, className = "" }: LayoutProps) => {
  return (
    <Layout className={`p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </Layout>
  );
};