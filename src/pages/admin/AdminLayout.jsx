import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../../components/admin_components/Sidebar';
import NotificationCenter from '../../components/admin_components/NotificationCenter';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-navy-500 font-bold">Loading...</div>;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 lg:ml-64 flex flex-col h-screen min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-navy-100 flex items-center justify-between px-6 lg:px-8 z-20 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-navy-500 hover:text-teal-600 hover:bg-navy-50 rounded-xl lg:hidden transition-colors"
                            aria-label="Open Sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-base lg:text-lg font-bold text-navy-900 tracking-tight">Admin Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
