import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Clock, Trash2, CheckCircle, MessageSquare, Search, Filter, User, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchFeedbacks, updateFeedbackStatus, deleteFeedback } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const statusConfig = {
    new: { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    read: { label: 'Read', bg: 'bg-navy-50', text: 'text-navy-700', border: 'border-navy-200' },
    responded: { label: 'Responded', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export default function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [counts, setCounts] = useState({ all: 0, new: 0, read: 0, responded: 0 });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const { toast, showToast, clearToast } = useToast();

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
            if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
            if (debouncedSearch) params.search = debouncedSearch.trim();
            
            const data = await fetchFeedbacks(params);
            setFeedbacks(Array.isArray(data.contacts) ? data.contacts : []);
            setTotal(data.total || 0);
            setPage(data.page || 1);
            setPages(data.pages || 1);
            if (data.counts) {
                setCounts(data.counts);
            }
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filterStatus, limit, showToast]);

    useEffect(() => {
        load(1);
    }, [load]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateFeedbackStatus(id, status);
            showToast(`Marked as ${status}`, 'success');
            load(page);
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteFeedback(id);
            showToast('Message deleted', 'success');
            load(1);
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Guest Feedback & Inquiries</h1>
                    <p className="text-navy-400 text-sm mt-0.5">{counts.all} messages total</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-navy-100 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-navy-900 text-white shadow-lg' : 'bg-white text-navy-600 border border-navy-100 hover:bg-navy-50'}`}>All ({counts.all})</button>
                <button onClick={() => setFilterStatus('new')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === 'new' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'}`}>New ({counts.new})</button>
                <button onClick={() => setFilterStatus('read')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === 'read' ? 'bg-navy-500 text-white shadow-lg' : 'bg-white text-navy-600 border border-navy-100 hover:bg-navy-50'}`}>Read ({counts.read})</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-navy-50" />)
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-navy-100">
                        <MessageSquare size={48} className="mx-auto text-navy-200 mb-3" />
                        <h3 className="text-navy-900 font-bold">No messages found</h3>
                        <p className="text-navy-400 text-sm mt-1">Guest inquiries from the Contact page will appear here.</p>
                    </div>
                ) : (
                    feedbacks.map(f => (
                        <div key={f._id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${f.status === 'new' ? 'border-blue-200 ring-1 ring-blue-50' : 'border-navy-100'}`}>
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="lg:w-1/4 space-y-3 pr-6 border-r border-navy-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600">
                                            <User size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-navy-900 truncate">{f.name}</p>
                                            <p className="text-[10px] text-navy-400 uppercase font-medium tracking-wider">Guest</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-navy-600">
                                            <Mail size={14} className="flex-shrink-0" />
                                            <p className="text-xs truncate">{f.email}</p>
                                        </div>
                                        {f.phone && (
                                            <div className="flex items-center gap-2 text-navy-600">
                                                <Phone size={14} className="flex-shrink-0" />
                                                <p className="text-xs">{f.phone}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-navy-400">
                                            <CalendarDays size={14} className="flex-shrink-0" />
                                            <p className="text-[11px] font-medium">{new Date(f.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig[f.status].bg} ${statusConfig[f.status].text} ${statusConfig[f.status].border}`}>
                                            {statusConfig[f.status].label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-1">Subject</p>
                                        <h3 className="text-lg font-bold text-navy-900">{f.subject}</h3>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-1">Message</p>
                                        <div className="bg-navy-50/50 p-4 rounded-2xl border border-navy-100">
                                            <p className="text-navy-700 text-sm leading-relaxed whitespace-pre-wrap">{f.message}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-48 flex flex-col gap-2 justify-center">
                                    {f.status === 'new' && (
                                        <button onClick={() => handleStatusUpdate(f._id, 'read')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors">
                                            <CheckCircle size={14} /> Mark as Read
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(f._id)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border border-navy-100 rounded-3xl bg-white gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-navy-500 font-medium">Page {page} of {pages} ({total} messages)</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-navy-400">Show:</span>
                            <select 
                                value={limit} 
                                onChange={(e) => setLimit(Number(e.target.value))} 
                                className="bg-white border border-navy-200 rounded-lg text-xs px-2 py-1 text-navy-600 focus:outline-none"
                            >
                                {[5, 10, 20, 50].map(sz => (
                                    <option key={sz} value={sz}>{sz}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        <button 
                            onClick={() => load(1)} 
                            disabled={page <= 1} 
                            className="px-2.5 py-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-all text-xs font-bold"
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
                            className="px-2.5 py-1.5 rounded-lg hover:bg-navy-100 text-navy-500 disabled:opacity-30 transition-all text-xs font-bold"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
