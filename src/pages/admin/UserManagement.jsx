import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Search, Mail, Phone, Shield, Edit2, Trash2, X, Eye, EyeOff,
    User, MapPin, Calendar, CheckCircle, XCircle, Clock, RefreshCw,
} from 'lucide-react';
import { fetchUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, fetchBookings } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const ROLE_MAP = { guest: 'Guest', admin: 'Admin', staff: 'Staff' };
const ROLE_TO_API = { 'Guest': 'guest', 'Admin': 'admin', 'Staff': 'staff' };

const normalise = (u) => ({
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone || '',
    role: ROLE_MAP[u.role] || 'Guest',
    status: u.status || 'Active',
    joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
    totalBookings: u.totalBookings || 0,
    totalSpent: u.totalSpent || 0,
    avatar: `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase(),
    _raw: u,
});

const UserManagement = () => {
    const { toast, showToast, clearToast } = useToast();
    const [users, setUsers] = useState([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '', lastName: '', email: '', phone: '', role: 'Guest', status: 'Active', password: '',
    });
    const [userBookings, setUserBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const roles = ['Guest', 'Staff', 'Admin'];
    const statuses = ['Active', 'Inactive', 'Suspended'];

    const loadUsers = useCallback(async () => {
        setApiLoading(true);
        try {
            const data = await fetchUsers({ limit: 100 });
            setUsers(data.users.map(normalise));
        } catch (e) {
            console.warn('API error:', e.message);
        } finally {
            setApiLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const openAddModal = () => {
        setIsEditing(false);
        setNewUser({ firstName: '', lastName: '', email: '', phone: '', role: 'Guest', status: 'Active', password: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setSelectedUser(user);
        const [firstName, ...rest] = user.name.split(' ');
        setNewUser({
            firstName: firstName || '',
            lastName: rest.join(' ') || '',
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        
        if (newUser.password && newUser.password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        if (newUser.phone && newUser.phone.length !== 10) {
            showToast('Phone number must be exactly 10 digits', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                firstName: newUser.firstName, 
                lastName: newUser.lastName, 
                email: newUser.email, 
                phone: newUser.phone,
                role: ROLE_TO_API[newUser.role] || 'guest',
                status: newUser.status
            };
            if (newUser.password) payload.password = newUser.password;

            if (isEditing && selectedUser) {
                const userId = selectedUser._raw?._id || selectedUser.id;
                const updated = await apiUpdateUser(userId, payload);
                setUsers(prev => prev.map(u => (u.id === selectedUser.id ? normalise(updated) : u)));
                showToast('User updated successfully');
            } else {
                const created = await apiCreateUser(payload);
                setUsers(prev => [normalise(created), ...prev]);
                showToast('User created successfully');
            }
            setIsModalOpen(false);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (user, newStatus) => {
        try {
            const userId = user._raw?._id || user.id;
            const updated = await apiUpdateUser(userId, { status: newStatus });
            const normalised = normalise(updated);
            setUsers(prev => prev.map(u => (u.id === user.id ? normalised : u)));
            if (selectedUser?.id === user.id) setSelectedUser(normalised);
            showToast(`Status updated to ${newStatus}`);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
        try {
            const userId = user._raw?._id || user.id;
            if (typeof userId === 'string' && userId.length > 20) {
                await apiDeleteUser(userId);
            }
            setUsers(prev => prev.filter(u => u.id !== id));
            showToast('User deleted successfully');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Active': return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', icon: CheckCircle };
            case 'Inactive': return { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20', icon: Clock };
            case 'Suspended': return { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20', icon: XCircle };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20', icon: Clock };
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
            case 'Staff': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20';
            default: return 'bg-navy-50 text-navy-600 ring-1 ring-navy-500/20';
        }
    };

    const getAvatarGradient = (id) => {
        const gradients = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-teal-400 to-teal-600', 'from-pink-400 to-pink-600', 'from-amber-400 to-amber-600', 'from-emerald-400 to-emerald-600'];
        const index = typeof id === 'string' ? id.charCodeAt(0) : id;
        return gradients[index % gradients.length];
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
                    <p className="text-navy-400 mt-0.5 text-sm">Manage guests and user accounts</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadUsers} disabled={apiLoading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={apiLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={openAddModal} className="bg-navy-900 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-teal-700 transition-all duration-300 shadow-sm">
                        <UserPlus size={18} className="mr-2" />
                        Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-navy-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
                    <input type="text" placeholder="Search by name, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border border-navy-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                        <option value="all">All Roles</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-navy-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                        <option value="all">All Status</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-navy-50 text-navy-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50">
                            {filteredUsers.map((user) => {
                                const statusConfig = getStatusConfig(user.status);
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <tr key={user.id} className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm`}>
                                                    {user.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-navy-900 text-sm">{user.name}</div>
                                                    <div className="text-xs text-navy-400">{user.location}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-navy-700 flex items-center"><Mail size={12} className="mr-1.5 text-navy-400" />{user.email}</div>
                                            <div className="text-xs text-navy-400 flex items-center mt-1"><Phone size={12} className="mr-1.5" />{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig.bg} ${statusConfig.text} ring-1 ${statusConfig.ring}`}>
                                                <StatusIcon size={10} /> {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={async () => {
                                                        setSelectedUser(user);
                                                        setIsDetailOpen(true);
                                                        setLoadingBookings(true);
                                                        try {
                                                            const bData = await fetchBookings({ userId: user.id });
                                                            setUserBookings(bData.bookings || []);
                                                        } catch (e) {
                                                            console.error(e);
                                                        } finally {
                                                            setLoadingBookings(false);
                                                        }
                                                    }} 
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all duration-200 group"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button onClick={() => openEditModal(user)} className="p-2 hover:bg-navy-100 rounded-lg text-navy-400 hover:text-navy-600 transition-colors" title="Edit User"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 rounded-lg text-navy-400 hover:text-red-500 transition-colors" title="Delete User"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-3xl overflow-hidden w-full max-w-xl shadow-2xl border border-white/20">
                        <div className="bg-navy-900 px-8 py-6 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-bold">{isEditing ? 'Edit User Profile' : 'Register New User'}</h2>
                                <p className="text-navy-300 text-xs mt-1">{isEditing ? 'Modify account details and permissions' : 'Create a new account for guest or staff'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveUser} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">First Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                                        <input required type="text" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="John" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Last Name</label>
                                    <input type="text" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                                        <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                                        <input required type="tel" pattern="[0-9]{10}" title="Ten digits only" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full pl-10 pr-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="0712345678" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Account Password</label>
                                <div className="relative">
                                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                                    <input required={!isEditing} type={showPassword ? 'text' : 'password'} minLength={8} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder={isEditing ? 'Leave blank to keep current password' : 'At least 8 characters'} className="w-full pl-10 pr-12 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-navy-100 rounded-lg text-navy-400 transition-colors">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Access Role</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer font-medium">
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Account Status</label>
                                    <select value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer font-medium">
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-navy-200 rounded-xl text-navy-600 font-semibold hover:bg-navy-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-[2] bg-navy-900 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none">
                                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    {isEditing ? 'Update User Details' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDetailOpen && selectedUser && (
                <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex justify-end z-[1000]">
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-navy-50 flex justify-between items-center bg-navy-50/30">
                            <div>
                                <h2 className="text-xl font-bold text-navy-900">User Profile</h2>
                                <p className="text-navy-400 text-xs mt-0.5">UID: {selectedUser.id}</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-navy-100 rounded-full transition-colors text-navy-400 hover:text-navy-900"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Profile Hero */}
                            <div className="flex items-center gap-6 pb-2">
                                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getAvatarGradient(selectedUser.id)} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white`}>
                                    {selectedUser._raw?.photoURL ? (
                                        <img src={selectedUser._raw.photoURL} alt="" className="w-full h-full object-cover rounded-3xl" />
                                    ) : selectedUser.avatar}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-navy-900 leading-tight">{selectedUser.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${getRoleBadge(selectedUser.role)}`}>{selectedUser.role}</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${getStatusConfig(selectedUser.status).bg} ${getStatusConfig(selectedUser.status).text} ${getStatusConfig(selectedUser.status).ring}`}>{selectedUser.status}</span>
                                    </div>
                                    {selectedUser._raw?.googleId && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit uppercase tracking-tighter">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Google Authenticated
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info Cards */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-200 transition-colors">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 border border-slate-100"><Mail size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-semibold text-navy-900">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-teal-200 transition-colors">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-teal-600 border border-slate-100"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Mobile Phone</p>
                                        <p className="text-sm font-semibold text-navy-900">{selectedUser.phone || 'No phone provided'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-200 transition-colors">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-purple-600 border border-slate-100"><Calendar size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Registration Date</p>
                                        <p className="text-sm font-semibold text-navy-900">{new Date(selectedUser._raw?.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-navy-900 p-5 rounded-3xl text-white shadow-lg">
                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">Bookings</p>
                                    <p className="text-3xl font-black mt-1">{userBookings.length}</p>
                                    <p className="text-[10px] opacity-40 mt-2">Lifetime reservations</p>
                                </div>
                                <div className="bg-teal-600 p-5 rounded-3xl text-white shadow-lg">
                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">Status</p>
                                    <p className="text-xl font-black mt-2 leading-none">{selectedUser.status}</p>
                                    <p className="text-[10px] opacity-40 mt-3 flex items-center gap-1 italic"><Clock size={10} /> Active Member</p>
                                </div>
                            </div>
                            
                            {/* Booking History section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-navy-900 uppercase tracking-widest">Reservation History</h3>
                                    <span className="text-[10px] font-bold bg-navy-100 px-2 py-0.5 rounded text-navy-600">{userBookings.length} Total</span>
                                </div>

                                {loadingBookings ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-navy-300">
                                        <RefreshCw size={24} className="animate-spin mb-3" />
                                        <p className="text-xs font-medium uppercase tracking-widest">Syncing Data...</p>
                                    </div>
                                ) : userBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {userBookings.map((b) => (
                                            <div key={b._id} className="group relative bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:border-navy-100">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">#{b.bookingId || b._id.slice(-6)}</span>
                                                        <p className="font-bold text-navy-900">{b.room?.name || `Room ${b.room?.roomNumber}`}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>{b.status}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-[11px] text-navy-500 font-medium">
                                                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-navy-300" /> {new Date(b.checkIn).toLocaleDateString()}</div>
                                                    <div className="w-1 h-1 rounded-full bg-navy-200"></div>
                                                    <div>{b.nights} Nights</div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                                    <p className="text-xs font-bold text-navy-900">Paid Amount</p>
                                                    <p className="text-sm font-black text-navy-900">${b.total}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300"><Clock size={20} /></div>
                                        <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">No Activity Found</p>
                                        <p className="text-[10px] text-navy-300 italic">This user hasn't made any bookings yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
