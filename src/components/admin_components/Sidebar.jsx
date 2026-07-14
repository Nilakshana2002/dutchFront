import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    UtensilsCrossed,
    MessageSquare,
    Users,
    UserCircle,
    CalendarCheck,
    BedDouble,
    FileBarChart,
    LogOut,
    ExternalLink,
    ChevronRight,
    Truck,
    PartyPopper,
    Package as PackageIcon,
    Banknote,
    Tags,
    Image,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuGroups = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
            ],
        },
        {
            label: 'Property',
            items: [
                { name: 'Rooms', icon: BedDouble, path: '/admin/rooms' },
                { name: 'Bookings', icon: CalendarCheck, path: '/admin/bookings' },
                { name: 'Offers', icon: Tags, path: '/admin/offers' },
                { name: 'Gallery', icon: Image, path: '/admin/gallery' },
                { name: 'Dining', icon: UtensilsCrossed, path: '/admin/dining' },
            ],
        },
        {
            label: 'People',
            items: [
                { name: 'Users', icon: UserCircle, path: '/admin/users' },
            ],
        },
        {
            label: 'Operations',
            items: [
                { name: 'Guest Feedback', icon: MessageSquare, path: '/admin/feedback' },
            ],
        },
    ];


    const adminName = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
            return user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin';
        } catch { return 'Admin'; }
    })();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) =>
        path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(path);

    return (
        <div className={`h-screen w-64 bg-navy-900 text-white fixed left-0 top-0 flex flex-col shadow-2xl z-40 transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <Link to="/admin" className="block group" onClick={onClose}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-lg flex-shrink-0">
                            <img 
                                src="https://res.cloudinary.com/dtdgufs9u/image/upload/v1772345832/ChatGPT_Image_Feb_13_2026_02_11_36_PM_jgcxnu.png" 
                                alt="Logo" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-none tracking-wide">Dutch-Point</h1>
                            <p className="text-teal-400 text-xs mt-0.5 tracking-widest uppercase font-medium">Admin Panel</p>
                        </div>
                    </div>
                </Link>
                <button 
                    onClick={onClose}
                    className="lg:hidden p-2 text-navy-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {menuGroups.map((group) => (
                    <div key={group.label}>
                        <p className="px-4 text-[10px] font-semibold tracking-widest uppercase text-navy-400 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                                            active
                                                ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-sm'
                                                : 'text-navy-200 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon
                                                size={17}
                                                className={`mr-3 flex-shrink-0 ${
                                                    active ? 'text-teal-400' : 'text-navy-400 group-hover:text-navy-200'
                                                }`}
                                            />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        {active && <ChevronRight size={14} className="text-teal-400" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                    to="/"
                    className="flex items-center px-4 py-2.5 rounded-xl text-navy-300 hover:bg-white/5 hover:text-white transition-all group text-sm"
                >
                    <ExternalLink size={16} className="mr-3 text-navy-400 group-hover:text-teal-400" />
                    View Live Site
                </Link>
                <div className="flex items-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 shadow-sm">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{adminName}</p>
                        <p className="text-xs text-navy-400 truncate">Administrator</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="ml-2 p-1.5 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
