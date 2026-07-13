import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, X, RefreshCw, Layers, Tag, Film } from 'lucide-react';
import { fetchGalleryItems, createGalleryItem, deleteGalleryItem } from '../../utils/api';
import ImageUpload from '../../components/admin_components/ImageUpload';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const CATEGORIES = ['Rooms', 'Events', 'Resort', 'Dining'];

const GalleryManagement = () => {
    const { toast, showToast, clearToast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', category: 'Resort', url: '' });
    const [filter, setFilter] = useState('All');

    const loadGallery = async () => {
        setLoading(true);
        try {
            const data = await fetchGalleryItems();
            setItems(data || []);
        } catch (e) {
            showToast(e.message || 'Failed to load gallery items', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGallery();
    }, []);

    const handleCreateItem = async (e) => {
        e.preventDefault();
        if (!form.url) {
            showToast('Please upload or provide an image URL', 'error');
            return;
        }
        if (!form.title.trim()) {
            showToast('Please enter an image title', 'error');
            return;
        }

        setSaving(true);
        try {
            await createGalleryItem(form);
            showToast('Image successfully added to the gallery');
            setForm({ title: '', category: 'Resort', url: '' });
            setModalOpen(false);
            loadGallery();
        } catch (e) {
            showToast(e.message || 'Failed to save gallery item', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
        try {
            await deleteGalleryItem(id);
            showToast('Gallery image removed successfully');
            loadGallery();
        } catch (e) {
            showToast(e.message || 'Failed to delete gallery item', 'error');
        }
    };

    const filteredItems = filter === 'All' 
        ? items 
        : items.filter(item => item.category === filter);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-navy-955 tracking-tight font-serif flex items-center gap-2">
                        <Film className="text-teal-500" size={28} />
                        Gallery Management
                    </h1>
                    <p className="text-navy-500 text-sm mt-1 font-medium">
                        Upload and organize images in your resort's public website gallery
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-navy-950 text-white rounded-2xl hover:bg-navy-900 hover:shadow-lg transition-all text-xs uppercase tracking-widest font-bold active:scale-95 flex-shrink-0"
                >
                    <Plus size={16} />
                    Add New Image
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-4">
                <button
                    onClick={() => setFilter('All')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-navy-950 text-white' : 'bg-slate-50 text-navy-500 hover:bg-navy-50'}`}
                >
                    All Items ({items.length})
                </button>
                {CATEGORIES.map(cat => {
                    const count = items.filter(i => i.category === cat).length;
                    return (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-navy-950 text-white' : 'bg-slate-50 text-navy-500 hover:bg-navy-50'}`}
                        >
                            {cat} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-teal-500" size={32} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-navy-100/60 text-center max-w-lg mx-auto shadow-sm">
                    <Image className="mx-auto text-navy-200 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-navy-950 font-serif">No images found</h3>
                    <p className="text-sm text-navy-400 mt-1">Upload files to showcase resort rooms, event areas, or fine dining views.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="group bg-white rounded-2xl border border-navy-100/60 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                            <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10">
                                    {item.category}
                                </span>
                                <button
                                    onClick={() => handleDeleteItem(item._id)}
                                    className="absolute bottom-3 right-3 p-2 bg-red-600/90 backdrop-blur-md text-white rounded-xl shadow-md hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 duration-200"
                                    title="Delete Image"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="p-4 border-t border-navy-50 flex items-center justify-between">
                                <p className="text-xs font-bold text-navy-900 truncate" title={item.title}>
                                    {item.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Image Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-navy-100 animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-navy-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-navy-950 font-serif">Add Image to Gallery</h3>
                            <button
                                onClick={() => {
                                    setForm({ title: '', category: 'Resort', url: '' });
                                    setModalOpen(false);
                                }}
                                className="p-1.5 hover:bg-navy-50 text-navy-400 hover:text-navy-900 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateItem} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Image Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-sm text-navy-950 placeholder-navy-300 font-medium"
                                    placeholder="e.g. Poolside Sunset View"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Category
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-sm text-navy-950 font-semibold"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload Widget */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Gallery Image
                                </label>
                                <ImageUpload
                                    label="Upload Photo to Cloudinary"
                                    currentImage={form.url}
                                    onUploadSuccess={(url) => setForm({ ...form, url })}
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm({ title: '', category: 'Resort', url: '' });
                                        setModalOpen(false);
                                    }}
                                    className="flex-1 py-3 border border-navy-100 text-navy-600 rounded-xl hover:bg-slate-50 text-xs uppercase tracking-widest font-extrabold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !form.url}
                                    className="flex-1 py-3 bg-navy-950 text-white rounded-xl hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-2"
                                >
                                    {saving && <RefreshCw className="animate-spin" size={12} />}
                                    Save Image
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
