import { useState, useEffect } from 'react';

// Lazy load the actual AdminLogin component to ensure it only renders on client
const AdminLogin = ({ lazy }: { lazy: typeof import('./AdminLogin').default }) => lazy;

export default function AdminLoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [AdminLoginComponent, setAdminLoginComponent] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import AdminLogin only on client
    import('./AdminLogin').then((mod) => {
      setAdminLoginComponent(() => mod.default);
    });
  }, []);

  if (!isClient || !AdminLoginComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return <AdminLoginComponent />;
}
