import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin_components/StatCard';
import {
    ClipboardList,
    Banknote,
    Users,
    BedDouble,
    Clock,
    CheckCircle,
    ArrowRight,
    TrendingUp,
    RefreshCw,
    CalendarDays,
    UserCircle,
    Activity,
    Compass
} from 'lucide-react';
import { fetchDashboardStats, fetchMonthlyRevenue } from '../../utils/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const QuickAction = ({ to, icon: Icon, label, desc, color }) => (
    <Link
        to={to}
        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-navy-200 hover:shadow-lg transition-all duration-300 group"
    >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-navy-950 group-hover:text-teal-600 transition-colors">{label}</p>
            <p className="text-xs text-navy-400 truncate mt-0.5">{desc}</p>
        </div>
        <ArrowRight size={16} className="text-navy-300 group-hover:text-teal-500 transition-colors transform group-hover:translate-x-1" />
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const adminName = (() => {
        try {
            const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
            return u.firstName || 'Admin';
        } catch { return 'Admin'; }
    })();

    const getGreeting = () => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Good morning';
        if (hr < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const load = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const [s] = await Promise.all([
                fetchDashboardStats(),
            ]);
            setStats(s);
            setMonthly([]);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);
    
    const formatLabel = (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
        return Math.round(val);
    };

    const maxVal = Math.max(...monthly.map(m => m.revenue || 0), 1);
    const activeMonths = monthly.filter(m => (m.revenue || 0) > 0);
    const avgRevenue = activeMonths.length > 0 
        ? activeMonths.reduce((sum, m) => sum + (m.revenue || 0), 0) / activeMonths.length 
        : 0;
    const avgLinePct = maxVal > 0 ? (avgRevenue / maxVal) * 100 : 0;

    // Computed metrics for high-fidelity widgets
    const totalBookings = stats?.totalBookings ?? 0;
    const completedBookings = stats?.completedBookings ?? stats?.confirmedBookings ?? 0;
    const pendingBookings = stats?.pendingBookings ?? 0;
    const availableRooms = stats?.availableRooms ?? 0;
    const totalRooms = stats?.totalRooms ?? 15;
    const occupiedRooms = stats?.occupiedRooms ?? 0;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Minimal Premium Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-navy-955 tracking-tight font-serif">
                        {getGreeting()}, {adminName} 👋
                    </h1>
                    <p className="text-navy-500 text-sm mt-1 flex items-center gap-1.5 font-medium italic">
                        <CalendarDays size={14} className="text-teal-500" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => load(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-navy-100 text-navy-700 rounded-2xl hover:bg-navy-50 hover:border-navy-200 transition-all text-xs uppercase tracking-widest font-bold shadow-sm disabled:opacity-50 active:scale-95 flex-shrink-0"
                >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                    Refresh Stats
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl text-sm shadow-sm animate-shake">
                    <span className="font-bold">Error loading live statistics:</span>
                    <span className="opacity-95">{error}</span>
                    <button onClick={() => load()} className="ml-auto text-red-700 underline font-semibold text-xs hover:text-red-900">Retry</button>
                </div>
            )}

            {/* High-Fidelity Custom Command Center Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Custom Widget 2: Occupancy Gauge Ring */}
                <div className="bg-white rounded-[2rem] p-8 border border-navy-100/60 shadow-sm flex items-center justify-between min-h-[220px] hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                <BedDouble size={16} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Resort Status</span>
                        </div>
                        <p className="text-navy-500 text-xs font-bold uppercase">Room Occupancy</p>
                        <h3 className="text-2xl font-black text-navy-950 mt-1 leading-none">{availableRooms} Available</h3>
                        <p className="text-navy-400 text-xs mt-2.5 font-medium">{occupiedRooms} of {totalRooms} rooms reserved today</p>
                    </div>
                    
                    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="38" className="stroke-navy-50 fill-none" strokeWidth="7" />
                            <circle 
                                cx="48" 
                                cy="48" 
                                r="38" 
                                className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out" 
                                strokeWidth="7" 
                                strokeDasharray={238}
                                strokeDashoffset={238 - (238 * occupancyRate) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-base font-black text-navy-950 leading-none">{occupancyRate}%</span>
                            <span className="text-[8px] font-extrabold text-navy-400 uppercase tracking-wider mt-0.5">Filled</span>
                        </div>
                    </div>
                </div>

                {/* Custom Widget 3: Distribution Activity Bar */}
                <div className="bg-white rounded-[2rem] p-8 border border-navy-100/60 shadow-sm flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm">
                                    <ClipboardList size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Activity flow</span>
                            </div>
                            <span className="text-[10px] font-bold text-teal-600 px-2 py-0.5 bg-teal-50 rounded-lg">Today</span>
                        </div>
                        <p className="text-navy-500 text-xs font-bold uppercase">Total Bookings</p>
                        <h3 className="text-3xl font-black text-navy-950 mt-1 leading-none">{totalBookings}</h3>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-navy-400 font-bold mb-1.5 uppercase tracking-wider">
                            <span>Completed ({completedBookings})</span>
                            <span>Pending ({pendingBookings})</span>
                        </div>
                        <div className="h-2.5 w-full bg-navy-50/50 rounded-full overflow-hidden flex border border-navy-50">
                            <div 
                                className="bg-blue-500 transition-all duration-1000" 
                                style={{ width: `${totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}%` }} 
                            />
                            <div 
                                className="bg-orange-500 transition-all duration-1000" 
                                style={{ width: `${totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0}%` }} 
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Inline Info / Second Level Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white px-6 py-4 rounded-2xl border border-navy-100/60 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Guests Checked In</p>
                        <p className="text-sm font-extrabold text-navy-950 mt-0.5">{stats?.totalCustomers ?? 0}</p>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 rounded-2xl border border-navy-100/60 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Pending Arrivals</p>
                        <p className="text-sm font-extrabold text-navy-950 mt-0.5">{stats?.pendingBookings ?? 0}</p>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 rounded-2xl border border-navy-100/60 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CheckCircle size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Completed Stays</p>
                        <p className="text-sm font-extrabold text-navy-950 mt-0.5">{stats?.completedBookings ?? stats?.confirmedBookings ?? 0}</p>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 rounded-2xl border border-navy-100/60 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BedDouble size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Available Keys</p>
                        <p className="text-sm font-extrabold text-navy-950 mt-0.5">{stats?.availableRooms ?? 0}</p>
                    </div>
                </div>
            </div>            {/* Quick Actions Panel */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-navy-100 p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest">
                    <Compass size={16} />
                    Shortcuts
                </div>
                <h3 className="text-xl font-bold text-navy-955 mt-1 mb-1 font-serif">Quick Actions</h3>
                <p className="text-xs text-navy-400 mb-6 font-medium">Frequently used management tools</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickAction to="/admin/bookings" icon={ClipboardList} label="Manage Bookings" desc="View & update booking status" color="from-teal-500 to-teal-600" />
                    <QuickAction to="/admin/rooms" icon={BedDouble} label="Manage Rooms" desc="Add, edit room availability" color="from-amber-500 to-amber-600" />
                    <QuickAction to="/admin/users" icon={UserCircle} label="Manage Users" desc="View guests and accounts" color="from-navy-600 to-navy-700" />
                </div>

                <div className="mt-8 pt-6 border-t border-navy-50 text-center">
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">
                        Dutch Point Resort System v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
