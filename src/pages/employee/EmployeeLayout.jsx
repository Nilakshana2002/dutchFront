import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import EmployeeSidebar from '../../components/employee_components/EmployeeSidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

const EmployeeLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
                <p className="text-navy-500 font-bold tracking-widest text-xs uppercase animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <EmployeeSidebar />
            <div className="flex-1 ml-64 flex flex-col h-screen min-w-0">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-navy-100 flex items-center justify-between px-10 z-[100] sticky top-0">
                    <div>
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.3em] mb-1">Employee Portal</p>
                        <h2 className="text-xl font-bold text-navy-950 tracking-tight">
                            Welcome back, <span className="text-navy-700 font-medium">{user.firstName}</span>
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        
                        <div className="h-10 w-px bg-navy-100 mx-2" />
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-navy-950 leading-none mb-1">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest leading-none">Employee ID: {user.employeeId || 'Active'}</p>
                            </div>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.firstName} className="w-11 h-11 rounded-xl object-cover border-2 border-navy-50 shadow-sm" />
                            ) : (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {user.firstName.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 overflow-y-auto w-full">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
