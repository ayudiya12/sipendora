import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';

// Specialized Dashboard Components
import AdminDashboard from '../admin/AdminDashboard';
import PimpinanDashboard from '../pimpinan/PimpinanDashboard';
import PenyewaDashboard from '../penyewa/Dashboard';

/**
 * MainDashboard acts as a dispatcher that renders the appropriate dashboard 
 * based on the authenticated user's role.
 */
const MainDashboard = () => {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();

  return (
    <MainLayout title="Dashboard">
      <div className="animate-fade-up">
        {role === 'admin' && <AdminDashboard />}
        {role === 'pimpinan' && <PimpinanDashboard />}
        {role === 'penyewa' && <PenyewaDashboard />}
        
        {/* Fallback for unknown roles */}
        {!['admin', 'pimpinan', 'penyewa'].includes(role) && (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest italic">
                    Peran pengguna tidak dikenali. Silakan hubungi administrator.
                </p>
            </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MainDashboard;
