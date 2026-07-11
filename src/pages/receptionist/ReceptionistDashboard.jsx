import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Hotel, Calendar, Clock, 
    RefreshCw, CheckCircle2, AlertCircle, ScanLine, ArrowRight
} from 'lucide-react';
import { fetchBookings, fetchRooms, updateBookingStatus } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const ReceptionistDashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeRooms: 0,
        pendingCheckins: 0,
        completedToday: 0
    });
    const [todayCheckins, setTodayCheckins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const navigate = useNavigate();
    const { toast, showToast, clearToast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [bookingsData, roomsData] = await Promise.all([
                fetchBookings({ limit: 100 }),
                fetchRooms({ limit: 100 })
            ]);

            const bookings = bookingsData.bookings || [];
            const rooms = roomsData.rooms || [];

            const today = new Date().toISOString().split('T')[0];
            
            // Filter bookings that check in today and are in 'reserved' status
            const checkins = bookings.filter(b => b.status === 'reserved' && b.checkIn && b.checkIn.startsWith(today));
            setTodayCheckins(checkins);

            setStats({
                totalBookings: bookings.length,
                activeRooms: rooms.filter(r => r.status === 'available').length,
                pendingCheckins: checkins.length,
                completedToday: bookings.filter(b => b.status === 'checked_out' && b.updatedAt && b.updatedAt.startsWith(today)).length
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleCheckIn = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, { status: 'checked_in' });
            showToast('Guest checked in successfully!', 'success');
            loadDashboardData();
        } catch (error) {
            showToast('Failed to check in: ' + error.message, 'error');
        }
    };

    // Helper to get initials from name
    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0) : '';
        const l = lastName ? lastName.charAt(0) : '';
        return (f + l).toUpperCase() || 'G';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

            {/* Header */}
            <div className="bg-gradient-to-r from-navy-900 via-teal-800 to-teal-700 p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-1/3 w-56 h-20 bg-white/5 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
                        </h1>
                        <p className="text-white/80 mt-1.5 text-sm font-medium">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Reception Overview
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/25 flex items-center gap-3">
                            <Clock size={18} className="text-white/80" />
                            <p className="text-2xl font-bold font-mono text-white leading-none">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <button 
                            onClick={loadDashboardData}
                            className="p-3 bg-white/20 backdrop-blur-sm border border-white/25 hover:bg-white/30 rounded-2xl text-white transition-all active:scale-95"
                            title="Reload Dashboard Stats"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Available Rooms" 
                    value={stats.activeRooms} 
                    icon={Hotel} 
                    color="teal"
                    trend="Ready for guests"
                    onClick={() => navigate('/receptionist/rooms')}
                />
                <StatCard 
                    title="Total Bookings" 
                    value={stats.totalBookings} 
                    icon={Calendar} 
                    color="navy"
                    trend="In system"
                    onClick={() => navigate('/receptionist/bookings')}
                />
                <StatCard 
                    title="Today's Check-ins" 
                    value={stats.pendingCheckins} 
                    icon={Users} 
                    color="emerald"
                    trend="Pending arrival"
                    onClick={() => navigate('/receptionist/bookings')}
                />
                <StatCard 
                    title="Completed Stays" 
                    value={stats.completedToday} 
                    icon={CheckCircle2} 
                    color="orange"
                    trend="Checked out today"
                    onClick={() => navigate('/receptionist/bookings')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings / Quick Actions */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-md border border-navy-100/80">
                    <div className="flex items-center justify-between mb-8 border-b border-navy-50 pb-5">
                        <div>
                            <h3 className="text-xl font-bold text-navy-950 font-serif">Quick Check-in Status</h3>
                            <p className="text-xs text-navy-400 mt-1 font-medium">Verify guest identity and check them in instantly upon arrival.</p>
                        </div>
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest px-3 py-1.5 bg-teal-50 rounded-xl border border-teal-100 shadow-sm">Real-time</span>
                    </div>
                    
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <RefreshCw className="animate-spin text-navy-200" size={36} />
                            </div>
                        ) : todayCheckins.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <CheckCircle2 className="text-teal-500/30 mb-3" size={48} />
                                <p className="text-navy-950 font-bold text-sm">All Caught Up!</p>
                                <p className="text-navy-400 text-xs mt-1 max-w-[280px] leading-relaxed">
                                    No pending check-ins scheduled for today. Use the "Room Bookings" tab to check details.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayCheckins.map((booking) => {
                                    const guestInitial = getInitials(booking.guestInfo?.firstName, booking.guestInfo?.lastName);
                                    return (
                                        <div key={booking._id} className="flex items-center justify-between p-4 bg-navy-50/20 hover:bg-navy-50/50 rounded-2xl border border-navy-100 hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/10">
                                                    {guestInitial}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-bold text-navy-950">
                                                            {booking.guestInfo ? `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` : 'Guest'}
                                                        </p>
                                                        <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-lg shadow-sm">
                                                            Room: {booking.room?.roomNumber || '—'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-navy-400 mt-1 font-medium">
                                                        Staying: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—'} to {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—'} ({booking.nights} {booking.nights === 1 ? 'night' : 'nights'})
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCheckIn(booking._id)}
                                                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-teal-600/15 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                                            >
                                                Check-in <ArrowRight size={13} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Information/Status */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/15 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                        <AlertCircle className="text-teal-400 mb-6" size={32} />
                        <h3 className="text-xl font-bold mb-4 font-serif">Daily Memo</h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                            "Ensure all guest identification documents are scanned and uploaded to the portal during check-in for security compliance."
                        </p>
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Management Notice</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-navy-100/80">
                        <h3 className="text-lg font-bold text-navy-950 mb-4 font-serif">Staff Attendance</h3>
                        <div className="space-y-4">
                            <p className="text-navy-400 text-xs leading-relaxed font-medium">
                                Use the Attendance Scanner to log staff check-ins and check-outs at the front desk.
                            </p>
                            <button 
                                onClick={() => window.location.href = '/receptionist/scanner'}
                                className="w-full py-4 bg-navy-50 text-navy-950 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-teal-600 transition-all duration-300 flex items-center justify-center gap-2 border border-navy-100 hover:border-teal-600 shadow-sm"
                            >
                                <ScanLine size={16} />
                                Open Scanner
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => {
    const colors = {
        teal: {
            iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
            glow: 'shadow-teal-500/20',
            accent: 'from-teal-400 to-teal-600',
        },
        navy: {
            iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
            glow: 'shadow-indigo-500/20',
            accent: 'from-indigo-400 to-indigo-600',
        },
        emerald: {
            iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
            glow: 'shadow-emerald-500/20',
            accent: 'from-emerald-400 to-emerald-600',
        },
        orange: {
            iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
            glow: 'shadow-orange-500/20',
            accent: 'from-amber-400 to-orange-500',
        }
    };

    const cfg = colors[color] || colors.teal;

    return (
        <div 
            onClick={onClick}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-navy-100 hover:shadow-xl cursor-pointer hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
        >
            {/* Bottom gradient accent */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center shadow-lg ${cfg.glow} group-hover:scale-105 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-4xl font-black text-navy-950 font-mono leading-none">{value}</h3>
            </div>
            <p className="text-navy-600 text-sm font-bold mt-3">{title}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <p className="text-[10px] font-medium text-navy-400 uppercase tracking-wider">{trend}</p>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
