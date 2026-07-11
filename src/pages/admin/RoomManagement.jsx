import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, BedDouble,
    CheckCircle, Wrench, XCircle, RefreshCw, Save, LogOut, UserCircle
} from 'lucide-react';
import { 
    fetchRooms, createRoom, updateRoom, deleteRoom, 
    updateRoomStatusByNumber, updateBookingStatus,
    fetchRoomFeatures, createRoomFeature 
} from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';
import ImageUpload from '../../components/admin_components/ImageUpload';
import { useAuth } from '../../context/AuthContext';

const ROOM_TYPES = ['deluxe', 'luxury', 'semiluxury', 'dayOuting', 'couple'];
const STATUS_OPTIONS = ['available', 'occupied', 'maintenance'];


const EMPTY_FORM = {
    name: '', roomNumber: '', type: 'deluxe', price: '', guests: '', description: '',
    features: [], image: '', images: '', status: 'available', view: 'ocean',
};

const statusConfig = {
    available: { label: 'Available', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    reserved: { label: 'Reserved', icon: CheckCircle, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    occupied: { label: 'Occupied', icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    maintenance: { label: 'Maintenance', icon: Wrench, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function RoomManagement() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [dynamicFeatures, setDynamicFeatures] = useState([]);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [creatingFeature, setCreatingFeature] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [roomsData, featuresData] = await Promise.all([
                fetchRooms({ limit: 100 }),
                fetchRoomFeatures()
            ]);
            setRooms(Array.isArray(roomsData.rooms) ? roomsData.rooms : (Array.isArray(roomsData) ? roomsData : []));
            setDynamicFeatures(Array.isArray(featuresData) ? featuresData : []);
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditingRoom(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (room) => {
        setEditingRoom(room);
        setForm({
            name: room.name, roomNumber: room.roomNumber || '', type: room.type, price: room.price,
            guests: room.guests, description: room.description,
            features: Array.isArray(room.features) ? room.features : [],
            image: room.image,
            status: room.status,
            view: room.view || 'ocean',
            images: (room.images || []).join(', '),
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                guests: Number(form.guests),
                features: form.features,
                images: form.images.split(',').map(f => f.trim()).filter(Boolean),
            };
            if (editingRoom) {
                const updated = await updateRoom(editingRoom._id, payload);
                setRooms(prev => prev.map(r => r._id === updated._id ? updated : r));
                showToast('Room updated successfully');
            } else {
                const created = await createRoom(payload);
                setRooms(prev => [created, ...prev]);
                showToast('Room added successfully');
            }
            setModalOpen(false);
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (room) => {
        if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
        try {
            await deleteRoom(room._id);
            setRooms(prev => prev.filter(r => r._id !== room._id));
            showToast('Room deleted');
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleStatusToggle = async (room, newStatus) => {
        try {
            if (room.roomNumber) {
                await updateRoomStatusByNumber(room.roomNumber, newStatus);
                load();
                showToast(`All rooms with number ${room.roomNumber} marked as ${newStatus}`);
            } else {
                const updated = await updateRoom(room._id, { status: newStatus });
                setRooms(prev => prev.map(r => r._id === updated._id ? updated : r));
                showToast(`Room marked as ${newStatus}`);
            }
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleAddFeature = async () => {
        if (!newFeatureName.trim()) return;
        setCreatingFeature(true);
        try {
            const newFeat = await createRoomFeature({ name: newFeatureName.trim() });
            setDynamicFeatures(prev => [...prev, newFeat]);
            // Automatically select it
            setForm(prev => ({
                ...prev,
                features: [...prev.features, newFeat.name]
            }));
            setNewFeatureName('');
            showToast('New feature added to database');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setCreatingFeature(false);
        }
    };

    const filtered = rooms.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || r.status === filterStatus;
        const matchType = filterType === 'all' || r.type === filterType;
        return matchSearch && matchStatus && matchType;
    });

    const counts = {
        available: (rooms || []).filter(r => r && r.status === 'available' && !r.activeBooking).length,
        occupied: (rooms || []).filter(r => r && (r.status === 'occupied' || r.activeBooking)).length,
        maintenance: (rooms || []).filter(r => r && r.status === 'maintenance').length,
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}


            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Room Management</h1>
                    <p className="text-navy-400 text-sm mt-0.5">{rooms.length} rooms total</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    {user?.role !== 'receptionist' && (
                        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm">
                            <Plus size={16} />
                            Add Room
                        </button>
                    )}
                </div>
            </div>

            {/* Today's Available Rooms Quick List (For Receptionist view) */}
            {user?.role === 'receptionist' && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-emerald-950 font-serif">Today's Available Rooms</h3>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Quick reference list for prompt check-ins and walk-in guest assignments.</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
                            {(rooms || []).filter(r => r && r.status === 'available' && !r.activeBooking).length} Free Room(s)
                        </span>
                    </div>
                    {(rooms || []).filter(r => r && r.status === 'available' && !r.activeBooking).length === 0 ? (
                        <p className="text-emerald-800/60 text-sm italic font-medium">All rooms are currently occupied or under maintenance.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2.5">
                            {(rooms || []).filter(r => r && r.status === 'available' && !r.activeBooking).map(r => (
                                <div 
                                    key={r._id} 
                                    className="bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm px-4 py-2.5 rounded-2xl flex flex-col items-center min-w-[70px] transition-all cursor-default select-none"
                                >
                                    <span className="text-sm font-black text-emerald-950 font-mono">#{r.roomNumber}</span>
                                    <span className="text-[9px] font-extrabold uppercase text-emerald-600 mt-0.5 tracking-wider">{r.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            <div className="grid grid-cols-3 gap-4">
                {Object.entries(counts).map(([key, count]) => {
                    const cfg = statusConfig[key];
                    const Icon = cfg.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${filterStatus === key ? `${cfg.bg} ${cfg.border} border` : 'bg-white border-navy-100 hover:border-navy-200'}`}
                        >
                            <Icon size={20} className={cfg.text} />
                            <div className="text-left">
                                <p className="text-xl font-bold text-navy-900">{count}</p>
                                <p className="text-xs text-navy-400 capitalize">{cfg.label}</p>
                            </div>
                        </button>
                    );
                })}
            </div>


            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-navy-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="all">All Types</option>
                    {ROOM_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
            </div>


            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-navy-100 overflow-hidden animate-pulse">
                            <div className="h-44 bg-navy-100" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-navy-100 rounded w-3/4" />
                                <div className="h-3 bg-navy-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-navy-100">
                    <BedDouble size={48} className="mx-auto text-navy-200 mb-3" />
                    <h3 className="text-lg font-semibold text-navy-700">No rooms found</h3>
                    <p className="text-navy-400 text-sm mt-1 mb-4">
                        {rooms.length === 0 ? 'Start by adding your first room.' : 'Try adjusting your filters.'}
                    </p>
                    {rooms.length === 0 && (
                        <button onClick={openAdd} className="px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
                            Add First Room
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(room => {
                        const cfg = statusConfig[room.status] || statusConfig.available;
                        const StatusIcon = cfg.icon;
                        return (
                            <div key={room._id} className="bg-white rounded-2xl border border-navy-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="relative h-44 bg-navy-100 overflow-hidden">
                                    {room.image || (room.images && room.images[0]) ? (
                                        <img src={room.image || room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BedDouble size={40} className="text-navy-300" />
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 flex flex-col items-end gap-1.5`}>
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm flex items-center gap-1 capitalize ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                            <StatusIcon size={11} />
                                            {cfg.label}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-navy-900 text-sm leading-tight">{room.name}</h3>
                                        <span className="text-lg font-bold text-teal-600 flex-shrink-0">Rs. {room.price}<span className="text-xs font-normal text-navy-400">/night</span></span>
                                    </div>
                                    <p className="text-xs text-navy-600 font-bold mb-1">Room No: {room.roomNumber || 'N/A'}</p>
                                    <p className="text-xs text-navy-400 capitalize mb-1">{room.type} · {room.guests} guests · {room.view} view</p>

                                    {room.activeBooking ? (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-red-600">Guest Currently Staying</p>
                                                    <p className="text-[9px] font-bold text-navy-400">ID: #{room.activeBooking.bookingId}</p>
                                                </div>
                                                <div className="px-2 py-0.5 bg-red-100 rounded text-[9px] font-bold text-red-700">
                                                    {room.activeBooking.nights} Night{room.activeBooking.nights !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-navy-900 truncate flex items-center gap-1.5 mb-2">
                                                <UserCircle size={14} className="text-navy-400" />
                                                {room.activeBooking.user?.firstName || room.activeBooking.guestInfo?.firstName} {room.activeBooking.user?.lastName || room.activeBooking.guestInfo?.lastName}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 bg-white/50 p-2 rounded-lg border border-red-50">
                                                <div>
                                                    <p className="text-[9px] text-navy-400 uppercase font-bold">Check-In</p>
                                                    <p className="text-[10px] font-bold text-navy-800">{new Date(room.activeBooking.checkIn).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-navy-400 uppercase font-bold">Check-Out</p>
                                                    <p className="text-[10px] font-bold text-navy-800">{new Date(room.activeBooking.checkOut).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (

                                        <div className="mb-3 py-1.5 border-y border-dashed border-navy-100">
                                            <p className="text-[10px] text-navy-300 text-center font-medium">Ready for guests</p>
                                        </div>
                                    )}


                                    <div className="flex items-center justify-between mb-3 bg-navy-50/50 p-2 rounded-xl border border-navy-50">
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm flex items-center gap-1.5 capitalize ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                            <StatusIcon size={13} />
                                            {room.status}
                                        </div>
                                        {room.status === 'available' && (
                                            <button
                                                onClick={() => handleStatusToggle(room, 'maintenance')}
                                                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                            >
                                                <Wrench size={12} /> Set Maintenance
                                            </button>
                                        )}
                                        {room.status === 'maintenance' && (
                                            <button
                                                onClick={() => handleStatusToggle(room, 'available')}
                                                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle size={12} /> Set Available
                                            </button>
                                        )}
                                    </div>

                                    {user?.role !== 'receptionist' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(room)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-lg text-xs font-medium transition-colors">
                                                <Edit2 size={13} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(room)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-navy-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-navy-900">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-navy-50 rounded-xl text-navy-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Room Name *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ocean Suite" className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Room Number *</label>
                                    <input required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. 101" className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Type *</label>
                                    <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        {ROOM_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Status (Managed Auto)</label>
                                    <input value={form.status} readOnly className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm bg-navy-50 text-navy-500 capitalize cursor-not-allowed focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Price / Night (Rs.) *</label>
                                    <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 250" className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Max Guests *</label>
                                    <input required type="number" min="1" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} placeholder="e.g. 2" className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">View</label>
                                    <input value={form.view} onChange={e => setForm({ ...form, view: e.target.value })} placeholder="e.g. ocean, garden, pool" className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div className="col-span-2">
                                    <ImageUpload 
                                        label="Main Image *"
                                        currentImage={form.image}
                                        onUploadSuccess={(url) => setForm({ ...form, image: url })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Additional Image URLs <span className="text-navy-400 normal-case font-normal">(comma-separated or upload more)</span></label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            value={form.images} 
                                            onChange={e => setForm({ ...form, images: e.target.value })} 
                                            placeholder="https://image1.jpg, https://image2.jpg..." 
                                            className="flex-1 px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <ImageUpload 
                                            label=""
                                            onUploadSuccess={(url) => {
                                                const current = form.images ? form.images.split(',').map(i => i.trim()) : [];
                                                setForm({ ...form, images: [...current, url].join(', ') });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Description *</label>
                                    <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Room description..." className="w-full px-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-3">Room Features</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-navy-50/50 p-4 rounded-2xl border border-navy-100">
                                        {dynamicFeatures.map(feature => (
                                            <label key={feature._id} className="flex items-center gap-2 group cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={form.features.includes(feature.name)}
                                                        onChange={(e) => {
                                                            const newFeatures = e.target.checked 
                                                                ? [...form.features, feature.name]
                                                                : form.features.filter(f => f !== feature.name);
                                                            setForm({ ...form, features: newFeatures });
                                                        }}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 border-2 border-navy-200 rounded-lg transition-all peer-checked:border-teal-500 peer-checked:bg-teal-500 group-hover:border-teal-400">
                                                        <CheckCircle className="w-full h-full text-white scale-0 transition-transform peer-checked:scale-75" />
                                                    </div>
                                                </div>
                                                <span className="text-sm text-navy-700 font-medium group-hover:text-navy-900 transition-colors">{feature.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1 ml-1">Add New Feature to Database</label>
                                        <div className="flex gap-2">
                                            <input 
                                                value={newFeatureName} 
                                                onChange={e => setNewFeatureName(e.target.value)} 
                                                placeholder="e.g. Jacuzzi, Smart TV..." 
                                                className="flex-1 px-4 py-2 border border-navy-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddFeature}
                                                disabled={creatingFeature || !newFeatureName.trim()}
                                                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                                            >
                                                {creatingFeature ? 'Adding...' : 'Add Feature'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-navy-200 text-navy-600 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60">
                                    {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                                    {editingRoom ? 'Save Changes' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
