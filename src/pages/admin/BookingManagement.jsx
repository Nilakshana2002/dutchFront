import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw, Calendar, BedDouble, User, Phone, Mail,
    ChevronLeft, ChevronRight, Plus, Eye, X, CheckCircle, XCircle, Clock, Search
} from 'lucide-react';
import { fetchBookings, updateBookingStatus, fetchRooms, createBooking as apiCreateBooking } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const STATUS_FLOW = {
    pending: { next: ['reserved', 'cancelled'], color: 'bg-amber-50 text-amber-700 border-amber-200' },
    reserved: { next: ['checked_in', 'cancelled'], color: 'bg-blue-50 text-blue-700 border-blue-200' },
    checked_in: { next: ['checked_out'], color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    checked_out: { next: [], color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { next: ['pending'], color: 'bg-red-50 text-red-700 border-red-200' },
};

const StatusIcon = ({ status }) => {
    if (status === 'reserved') return <CheckCircle size={12} />;
    if (status === 'cancelled') return <XCircle size={12} />;
    if (status === 'checked_out') return <CheckCircle size={12} />;
    if (status === 'checked_in') return <Clock size={12} />;
    return <Clock size={12} />;
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (n) => `Rs. ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const canCheckIn = (booking) => {
    if (!booking || !booking.checkIn) return false;
    const today = new Date();
    const checkInDate = new Date(booking.checkIn);
    return today.toDateString() === checkInDate.toDateString();
};

export default function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [creating, setCreating] = useState(false);
    const [newBooking, setNewBooking] = useState({
        roomId: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        guestInfo: { firstName: '', lastName: '', email: '', phone: '' }
    });
    const { toast, showToast, clearToast } = useToast();
    const [limit, setLimit] = useState(15);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: limit };
            if (filterStatus !== 'all') params.status = filterStatus;
            if (debouncedSearch) params.search = debouncedSearch.trim();
            const data = await fetchBookings(params);
            const bookingsArray = Array.isArray(data.bookings) ? data.bookings : [];
            setBookings(bookingsArray);
            setTotal(data.total || 0);
            setPage(data.page || 1);
            setPages(data.pages || 1);
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, debouncedSearch, limit, showToast]);

    useEffect(() => { load(1); }, [load]);

    const handleStatusChange = async (bookingId, newStatus) => {
        setUpdatingId(bookingId);
        try {
            const updated = await updateBookingStatus(bookingId, newStatus);
            setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
            if (selectedBooking?._id === bookingId) setSelectedBooking(updated);
            showToast(`Booking marked as ${newStatus}`);
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        const checkInDate = new Date(newBooking.checkIn);
        const checkOutDate = new Date(newBooking.checkOut);
        
        if (checkOutDate <= checkInDate) {
            showToast('Check-out date must be after check-in date', 'error');
            setCreating(false);
            return;
        }

        try {
            await apiCreateBooking({
                ...newBooking,
                paymentMethod: 'onsite'
            });
            showToast('Manual booking created successfully');
            setIsCreateModalOpen(false);
            load(1);
            setNewBooking({
                roomId: '',
                checkIn: '',
                checkOut: '',
                guests: 1,
                guestInfo: { firstName: '', lastName: '', email: '', phone: '' }
            });
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = async () => {
        setIsCreateModalOpen(true);
        try {
            const data = await fetchRooms({ limit: 100 });
            setRooms(Array.isArray(data.rooms) ? data.rooms : (Array.isArray(data) ? data : []));
        } catch (e) {
            showToast('Failed to fetch rooms', 'error');
        }
    };

    const filtered = bookings || [];

    const statusCounts = {
        all: total || 0,
        pending: (Array.isArray(bookings) ? bookings : []).filter(b => b?.status === 'pending').length,
        reserved: (Array.isArray(bookings) ? bookings : []).filter(b => b?.status === 'reserved').length,
        checked_in: (Array.isArray(bookings) ? bookings : []).filter(b => b?.status === 'checked_in').length,
        checked_out: (Array.isArray(bookings) ? bookings : []).filter(b => b?.status === 'checked_out').length,
        cancelled: (Array.isArray(bookings) ? bookings : []).filter(b => b?.status === 'cancelled').length,
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Booking Management</h1>
                    <p className="text-navy-400 text-sm mt-0.5">{total} total bookings</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => load(1)} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl hover:bg-teal-700 transition-all text-sm font-medium shadow-md">
                        <Plus size={16} /> Create Booking
                    </button>
                </div>
            </div>

            
            <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-navy-100 shadow-sm w-fit flex-wrap">
                {['all', 'pending', 'reserved', 'checked_in', 'checked_out', 'cancelled'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setFilterStatus(s); }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                            filterStatus === s
                                ? 'bg-navy-900 text-white shadow-sm'
                                : 'text-navy-500 hover:bg-navy-50'
                        }`}
                    >
                        {s} {statusCounts[s] > 0 && `(${statusCounts[s]})`}
                    </button>
                ))}
            </div>

            
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                    type="text"
                    placeholder="Search guest, email, booking ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
            </div>

           
            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Calendar size={48} className="mx-auto text-navy-200 mb-3" />
                        <h3 className="text-lg font-semibold text-navy-700">No bookings found</h3>
                        <p className="text-navy-400 text-sm mt-1">
                            {(bookings || []).length === 0 ? 'Bookings will appear here once guests make reservations.' : 'Try adjusting your filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-navy-50 text-navy-500 text-xs uppercase font-semibold tracking-wide">
                                <tr>
                                    <th className="px-5 py-3.5">Booking ID</th>
                                    <th className="px-5 py-3.5">Guest</th>
                                    <th className="px-5 py-3.5">Room</th>
                                    <th className="px-5 py-3.5">Check-in</th>
                                    <th className="px-5 py-3.5">Check-out</th>
                                    <th className="px-5 py-3.5 text-right">Total</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-50">
                                {filtered.map(b => {
                                    const cfg = STATUS_FLOW[b.status] || STATUS_FLOW.pending;
                                    const isUpdating = updatingId === b._id;
                                    return (
                                        <tr 
                                            key={b._id} 
                                            onClick={() => setSelectedBooking(b)}
                                            className="hover:bg-navy-50/60 transition-colors cursor-pointer group/row"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-navy-600 bg-navy-50 px-2 py-1 rounded-lg group-hover/row:bg-white transition-colors">
                                                    {b.bookingId || b._id.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-navy-900 text-sm">
                                                    {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestInfo?.firstName || 'Guest'}
                                                </p>
                                                <p className="text-xs text-navy-400">{b.user?.email || b.guestInfo?.email || ''}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-navy-800">{b.room?.name || 'N/A'}</p>
                                                <p className="text-xs text-navy-400">No: {b.room?.roomNumber || '—'} · <span className="capitalize">{b.room?.type || ''}</span></p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-navy-600">{formatDate(b.checkIn)}</td>
                                            <td className="px-5 py-4 text-sm text-navy-600">{formatDate(b.checkOut)}</td>
                                            <td className="px-5 py-4 text-right font-bold text-navy-900 font-mono text-sm">
                                                {formatCurrency(b.total)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cfg.color}`}>
                                                    {isUpdating ? <RefreshCw size={11} className="animate-spin" /> : <StatusIcon status={b.status} />}
                                                    {b.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setSelectedBooking(b)}
                                                        className="p-2 hover:bg-teal-50 rounded-lg text-navy-400 hover:text-teal-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    {cfg.next.map(ns => {
                                                        const isCheckInDisabled = ns === 'checked_in' && !canCheckIn(b);
                                                        return (
                                                            <button
                                                                key={ns}
                                                                onClick={(e) => { e.stopPropagation(); handleStatusChange(b._id, ns); }}
                                                                disabled={isUpdating || isCheckInDisabled}
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                                                                    isCheckInDisabled ? 'bg-navy-100 text-navy-400 cursor-not-allowed border border-navy-200' :
                                                                    ns === 'reserved' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                                                    ns === 'checked_in' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' :
                                                                    ns === 'checked_out' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                                                                    ns === 'pending' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                                                                    'bg-red-50 text-red-600 hover:bg-red-100'
                                                                }`}
                                                                title={isCheckInDisabled ? "Check-in is only available on the check-in date" : ""}
                                                            >
                                                                {ns.replace('_', ' ')}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                
                {total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-navy-50 bg-navy-50/30 gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-navy-500">Page {page} of {pages} ({total} items)</p>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-navy-400">Show:</span>
                                <select 
                                    value={limit} 
                                    onChange={(e) => setLimit(Number(e.target.value))} 
                                    className="bg-white border border-navy-200 rounded-lg text-xs px-2 py-1 text-navy-600 focus:outline-none"
                                >
                                    {[10, 15, 30, 50].map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                            <button 
                                onClick={() => load(1)} 
                                disabled={page <= 1} 
                                className="px-2 py-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-all text-xs font-semibold"
                            >
                                First
                            </button>
                            <button 
                                onClick={() => load(page - 1)} 
                                disabled={page <= 1} 
                                className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {(() => {
                                const pageNumbers = [];
                                const maxVisiblePages = 5;
                                let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(pages, startPage + maxVisiblePages - 1);

                                if (endPage - startPage + 1 < maxVisiblePages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pageNumbers.push(i);
                                }
                                return pageNumbers;
                            })().map(p => (
                                <button
                                    key={p}
                                    onClick={() => load(p)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        page === p
                                            ? 'bg-navy-900 text-white shadow-sm'
                                            : 'text-navy-500 hover:bg-navy-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button 
                                onClick={() => load(page + 1)} 
                                disabled={page >= pages} 
                                className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button 
                                onClick={() => load(pages)} 
                                disabled={page >= pages} 
                                className="px-2 py-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-all text-xs font-semibold"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>

            
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedBooking(null)}>
                    <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-navy-100 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="font-bold text-navy-900">Booking Details</h3>
                                <p className="text-xs text-navy-400 font-mono mt-0.5">
                                    {selectedBooking.bookingId || selectedBooking._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-navy-50 rounded-xl text-navy-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 flex-1">
                           
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Current Status</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_FLOW[selectedBooking.status]?.color}`}>
                                    <StatusIcon status={selectedBooking.status} />
                                    {selectedBooking.status.replace('_', ' ')}
                                </span>
                            </div>

                           
                            <div className="bg-navy-50 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">Guest Info</p>
                                <div className="flex items-center gap-2 text-sm text-navy-700">
                                    <User size={14} className="text-navy-400" />
                                    {selectedBooking.user
                                        ? `${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`
                                        : `${selectedBooking.guestInfo?.firstName} ${selectedBooking.guestInfo?.lastName}`}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-navy-600">
                                    <Mail size={14} className="text-navy-400" />
                                    {selectedBooking.user?.email || selectedBooking.guestInfo?.email}
                                </div>
                                {(selectedBooking.user?.phone || selectedBooking.guestInfo?.phone) && (
                                    <div className="flex items-center gap-2 text-sm text-navy-600">
                                        <Phone size={14} className="text-navy-400" />
                                        {selectedBooking.user?.phone || selectedBooking.guestInfo?.phone}
                                    </div>
                                )}
                            </div>

                            
                            <div className="bg-navy-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">Room</p>
                                <div className="flex items-center gap-2 text-sm text-navy-700">
                                    <BedDouble size={14} className="text-navy-400" />
                                    {selectedBooking.room?.name || 'N/A'} (No: {selectedBooking.room?.roomNumber || '—'}) · <span className="capitalize text-navy-500">{selectedBooking.room?.type}</span>
                                </div>
                            </div>

                            
                            <div className="bg-navy-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">Stay</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-navy-400 text-xs mb-0.5">Check-in</p>
                                        <p className="font-semibold text-navy-900">{formatDate(selectedBooking.checkIn)}</p>
                                    </div>
                                    <div>
                                        <p className="text-navy-400 text-xs mb-0.5">Check-out</p>
                                        <p className="font-semibold text-navy-900">{formatDate(selectedBooking.checkOut)}</p>
                                    </div>
                                    <div>
                                        <p className="text-navy-400 text-xs mb-0.5">Nights</p>
                                        <p className="font-semibold text-navy-900">{selectedBooking.nights}</p>
                                    </div>
                                    <div>
                                        <p className="text-navy-400 text-xs mb-0.5">Guests</p>
                                        <p className="font-semibold text-navy-900">{selectedBooking.guests}</p>
                                    </div>
                                </div>
                            </div>

                           
                            <div className="bg-navy-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">Payment</p>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-navy-600"><span>Subtotal</span><span>{formatCurrency(selectedBooking.subtotal)}</span></div>
                                    {selectedBooking.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(selectedBooking.discount)}</span></div>}
                                    <div className="flex justify-between font-bold text-navy-900 pt-1.5 border-t border-navy-200"><span>Total</span><span>{formatCurrency(selectedBooking.total)}</span></div>
                                </div>
                            </div>

                           
                            {selectedBooking.guestInfo?.specialRequests && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Special Requests</p>
                                    <p className="text-sm text-amber-800">{selectedBooking.guestInfo.specialRequests}</p>
                                </div>
                            )}

                            
                            {(STATUS_FLOW[selectedBooking.status]?.next || []).length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-2">Update Status</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {STATUS_FLOW[selectedBooking.status].next.map(ns => {
                                             const isCheckInDisabled = ns === 'checked_in' && !canCheckIn(selectedBooking);
                                             return (
                                                 <button
                                                     key={ns}
                                                     onClick={() => handleStatusChange(selectedBooking._id, ns)}
                                                     disabled={updatingId === selectedBooking._id || isCheckInDisabled}
                                                     className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                                                         isCheckInDisabled ? 'bg-navy-100 text-navy-400 cursor-not-allowed border border-navy-200' :
                                                         ns === 'reserved' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                                         ns === 'checked_in' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                                                         ns === 'checked_out' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                                                         ns === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                                                         'bg-red-500 text-white hover:bg-red-600'
                                                     } disabled:opacity-50`}
                                                     title={isCheckInDisabled ? "Check-in is only available on the check-in date" : ""}
                                                 >
                                                     Mark as {ns.replace('_', ' ')}
                                                 </button>
                                             );
                                         })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 pb-4">
                                <button onClick={() => setSelectedBooking(null)} className="w-full py-3 border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors font-semibold flex items-center justify-center gap-2">
                                    <X size={16} /> Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Manual Booking Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="bg-navy-900 px-8 py-6 flex justify-between items-center text-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold">Manual Room Booking</h2>
                                <p className="text-navy-300 text-xs mt-1">Receptionist manual reservation entry</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateBooking} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Guest First Name</label>
                                    <input required type="text" value={newBooking.guestInfo.firstName} onChange={e => setNewBooking({ ...newBooking, guestInfo: { ...newBooking.guestInfo, firstName: e.target.value } })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="John" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Guest Last Name</label>
                                    <input required type="text" value={newBooking.guestInfo.lastName} onChange={e => setNewBooking({ ...newBooking, guestInfo: { ...newBooking.guestInfo, lastName: e.target.value } })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Email Address</label>
                                    <input required type="email" value={newBooking.guestInfo.email} onChange={e => setNewBooking({ ...newBooking, guestInfo: { ...newBooking.guestInfo, email: e.target.value } })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" placeholder="guest@example.com" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input 
                                        required 
                                        type="tel" 
                                        pattern="[0-9]{10}"
                                        title="Please enter a valid 10-digit phone number"
                                        value={newBooking.guestInfo.phone} 
                                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setNewBooking({ ...newBooking, guestInfo: { ...newBooking.guestInfo, phone: val } });
                                        }} 
                                        className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" 
                                        placeholder="0712345678" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Select Room <span className="text-red-500">*</span></label>
                                <input type="text" required value={newBooking.roomId} className="opacity-0 absolute w-0 h-0 bottom-0 left-1/2" readOnly tabIndex={-1} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1.5 rounded-xl bg-navy-50/40 border border-navy-100">
                                    {rooms.length === 0 ? (
                                        <div className="col-span-full py-6 text-center text-navy-400 text-sm">No rooms available to book.</div>
                                    ) : (
                                        rooms.map(r => (
                                            <div 
                                                key={r._id} 
                                                onClick={() => setNewBooking({ ...newBooking, roomId: r._id })}
                                                className={`rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                                                    newBooking.roomId === r._id 
                                                    ? 'border-teal-500 bg-teal-50 shadow-sm' 
                                                    : 'border-white bg-white hover:border-navy-200 shadow-sm'
                                                }`}
                                            >
                                                <div className="h-20 bg-navy-100 relative">
                                                    {(r.image || (r.images && r.images[0])) ? (
                                                        <img src={r.image || r.images[0]} alt={r.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-navy-300">
                                                            <BedDouble size={20} />
                                                        </div>
                                                    )}
                                                    {newBooking.roomId === r._id && (
                                                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                                                            <CheckCircle size={20} className="text-white drop-shadow-md" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-2.5">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className="font-bold text-navy-900 text-xs">Room {r.roomNumber}</p>
                                                    </div>
                                                    <p className="text-[10px] text-navy-500 truncate" title={r.name}>{r.name}</p>
                                                    <p className="text-teal-600 font-bold text-xs mt-1">{formatCurrency(r.price)}<span className="text-navy-400 font-normal text-[9px]">/n</span></p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Check-in</label>
                                    <input required type="date" value={newBooking.checkIn} onChange={e => setNewBooking({ ...newBooking, checkIn: e.target.value })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Check-out</label>
                                    <input 
                                        required 
                                        type="date" 
                                        min={newBooking.checkIn ? new Date(new Date(newBooking.checkIn).getTime() + 86400000).toISOString().split('T')[0] : ''}
                                        value={newBooking.checkOut} 
                                        onChange={e => setNewBooking({ ...newBooking, checkOut: e.target.value })} 
                                        className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Guests</label>
                                    <input required type="number" min="1" max="10" value={newBooking.guests} onChange={e => setNewBooking({ ...newBooking, guests: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-navy-50/50 border border-navy-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-3 border border-navy-200 rounded-xl text-navy-600 font-semibold hover:bg-navy-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={creating} className="flex-[2] bg-navy-900 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-900/20 active:scale-[0.98] transition-all disabled:opacity-50">
                                    {creating ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    Create Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
