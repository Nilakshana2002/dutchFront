import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw, Star, Clock, Utensils, X } from 'lucide-react';
import { fetchFoods, createFood, updateFood, deleteFood } from '../../utils/api';
import ImageUpload from '../../components/admin_components/ImageUpload';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Sri Lankan Special', 'Side Dish'];

const EMPTY_FORM = {
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    discount: '0',
    status: 'Available',
    image: '',
    rating: '5',
    prepTime: '15-20 min'
};

const DiningManagement = () => {
    const { toast, showToast, clearToast } = useToast();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const loadFoods = async () => {
        setLoading(true);
        try {
            const data = await fetchFoods();
            setFoods(data || []);
        } catch (e) {
            showToast(e.message || 'Failed to load food items', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFoods();
    }, []);

    const openAdd = () => {
        setEditingFood(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (food) => {
        setEditingFood(food);
        setForm({
            name: food.name,
            description: food.description || '',
            category: food.category || 'Main Course',
            price: food.price ? food.price.toString() : '',
            discount: food.discount ? food.discount.toString() : '0',
            status: food.status || 'Available',
            image: food.image || '',
            rating: food.rating ? food.rating.toString() : '5',
            prepTime: food.prepTime || '15-20 min'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast('Please enter a food item name', 'error');
            return;
        }
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
            showToast('Please enter a valid price', 'error');
            return;
        }

        setSaving(true);
        try {
            const rawPrice = Number(form.price);
            const rawDiscount = Number(form.discount) || 0;
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                category: form.category,
                price: rawPrice,
                discount: rawDiscount,
                rating: Number(form.rating) || 5,
                prepTime: form.prepTime.trim() || '15-20 min',
                status: form.status,
                image: form.image,
                sellingPrice: rawPrice - (rawPrice * (rawDiscount / 100))
            };

            if (editingFood) {
                await updateFood(editingFood._id, payload);
                showToast('Food item updated successfully');
            } else {
                await createFood(payload);
                showToast('Food item added successfully');
            }
            setModalOpen(false);
            loadFoods();
        } catch (e) {
            showToast(e.message || 'Failed to save food item', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this food item?')) return;
        try {
            await deleteFood(id);
            showToast('Food item removed successfully');
            loadFoods();
        } catch (e) {
            showToast(e.message || 'Failed to delete food item', 'error');
        }
    };

    const filteredFoods = foods.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'All' || food.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight font-serif flex items-center gap-2">
                        <Utensils className="text-teal-500" size={28} />
                        Dining & Food Management
                    </h1>
                    <p className="text-navy-500 text-sm mt-1 font-medium">
                        Add and edit food items displayed on the beachfront dining menu
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-navy-950 text-white rounded-2xl hover:bg-navy-900 hover:shadow-lg transition-all text-xs uppercase tracking-widest font-bold active:scale-95 flex-shrink-0 cursor-pointer"
                >
                    <Plus size={16} />
                    Add Food Item
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-navy-50 p-4 rounded-3xl shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search food items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'All' ? 'bg-navy-950 text-white' : 'bg-slate-50 text-navy-500 hover:bg-navy-100'}`}
                    >
                        All ({foods.length})
                    </button>
                    {CATEGORIES.map(cat => {
                        const count = foods.filter(f => f.category === cat).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-navy-950 text-white' : 'bg-slate-50 text-navy-500 hover:bg-navy-100'}`}
                            >
                                {cat} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Food Grid */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-teal-500" size={32} />
                </div>
            ) : filteredFoods.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-navy-100/60 text-center max-w-lg mx-auto shadow-sm">
                    <Utensils className="mx-auto text-navy-200 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-navy-950 font-serif">No food items found</h3>
                    <p className="text-sm text-navy-400 mt-1">Add items to populate the menu categories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFoods.map(food => {
                        const actualSellingPrice = food.sellingPrice || food.price;
                        const hasDiscount = food.discount > 0;
                        return (
                            <div key={food._id} className="group bg-white rounded-2xl border border-navy-100/60 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                        {food.image ? (
                                            <img
                                                src={food.image}
                                                alt={food.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="text-5xl">🍽️</div>
                                        )}
                                        <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10">
                                            {food.category}
                                        </span>
                                        <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-1 rounded-lg border shadow-sm ${food.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {food.status}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-navy-900 text-sm leading-snug truncate" title={food.name}>
                                                {food.name}
                                            </h3>
                                            <div className="text-right flex-shrink-0">
                                                <span className="text-teal-600 font-bold text-sm">Rs. {actualSellingPrice.toFixed(2)}</span>
                                                {hasDiscount && (
                                                    <span className="block text-[10px] text-navy-300 line-through">Rs. {food.price.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        {food.description && (
                                            <p className="text-xs text-navy-400 line-clamp-2 italic">
                                                "{food.description}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-[11px] text-navy-500 pt-1 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Star className="text-amber-500 fill-amber-500" size={12} />
                                                <span>{food.rating} / 5</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>{food.prepTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 pt-0 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(food)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={13} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(food._id)}
                                        className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-navy-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-navy-950 font-serif">
                                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 hover:bg-navy-50 text-navy-400 hover:text-navy-900 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Food Name */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Food Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium"
                                    placeholder="e.g. Seafood Fried Rice"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-semibold"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-semibold"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Price (Rs.) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium"
                                        placeholder="1200"
                                        required
                                    />
                                </div>

                                {/* Discount */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.discount}
                                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Rating (1-5)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        value={form.rating}
                                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium"
                                    />
                                </div>

                                {/* Prep Time */}
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                        Prep Time
                                    </label>
                                    <input
                                        type="text"
                                        value={form.prepTime}
                                        onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium"
                                        placeholder="e.g. 15-20 min"
                                    />
                                </div>
                            </div>

                            {/* Food Image */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Food Image
                                </label>
                                <ImageUpload
                                    label="Upload Photo to Cloudinary"
                                    currentImage={form.image}
                                    onUploadSuccess={(url) => setForm({ ...form, image: url })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm text-navy-950 font-medium resize-none"
                                    placeholder="Brief description of flavors or ingredients..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-3 border border-navy-100 text-navy-600 rounded-xl hover:bg-slate-50 text-xs uppercase tracking-widest font-extrabold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-navy-950 text-white rounded-xl hover:bg-navy-900 disabled:opacity-50 text-xs uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-2"
                                >
                                    {saving && <RefreshCw className="animate-spin" size={12} />}
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiningManagement;
