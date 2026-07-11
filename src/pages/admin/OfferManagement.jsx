import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { fetchOffers, createOffer, updateOffer, deleteOffer } from '../../utils/api';

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        applicableRoomTypes: [],
        isActive: true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const roomTypes = ['deluxe', 'luxury', 'semiluxury', 'dayOuting', 'couple'];

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            setLoading(true);
            const data = await fetchOffers();
            setOffers(data);
        } catch (err) {
            setError(err.message || 'Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (offer = null) => {
        if (offer) {
            setCurrentOffer(offer);
            setFormData({
                title: offer.title,
                description: offer.description || '',
                discountPercentage: offer.discountPercentage,
                startDate: new Date(offer.startDate).toISOString().split('T')[0],
                endDate: new Date(offer.endDate).toISOString().split('T')[0],
                applicableRoomTypes: offer.applicableRoomTypes,
                isActive: offer.isActive
            });
        } else {
            setCurrentOffer(null);
            setFormData({
                title: '',
                description: '',
                discountPercentage: '',
                startDate: '',
                endDate: '',
                applicableRoomTypes: [],
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleRoomTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            applicableRoomTypes: prev.applicableRoomTypes.includes(type)
                ? prev.applicableRoomTypes.filter(t => t !== type)
                : [...prev.applicableRoomTypes, type]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = { ...formData, discountPercentage: Number(formData.discountPercentage) };
            if (currentOffer) {
                await updateOffer(currentOffer._id, payload);
            } else {
                await createOffer(payload);
            }
            setIsModalOpen(false);
            loadOffers();
        } catch (err) {
            setError(err.message || 'Failed to save offer');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                await deleteOffer(id);
                loadOffers();
            } catch (err) {
                alert('Error deleting offer: ' + err.message);
            }
        }
    };

    const toggleStatus = async (offer) => {
        try {
            await updateOffer(offer._id, { isActive: !offer.isActive });
            loadOffers();
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const filteredOffers = offers.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Offer Management</h1>
                    <p className="text-sm text-navy-500">Manage promotional offers for rooms.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Add Offer
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
                <div className="p-4 border-b border-navy-100 bg-navy-50/50 flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search offers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy-50/50 text-navy-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Offer Title</th>
                                    <th className="p-4 font-semibold">Discount</th>
                                    <th className="p-4 font-semibold">Date Range</th>
                                    <th className="p-4 font-semibold">Rooms</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-50">
                                {filteredOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-navy-400">No offers found.</td>
                                    </tr>
                                ) : (
                                    filteredOffers.map((offer) => (
                                        <tr key={offer._id} className="hover:bg-navy-50/30 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-navy-900">{offer.title}</p>
                                                <p className="text-xs text-navy-500">{offer.description}</p>
                                            </td>
                                            <td className="p-4 font-bold text-green-600">{offer.discountPercentage}% OFF</td>
                                            <td className="p-4 text-sm text-navy-600">
                                                {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-navy-600">
                                                {offer.applicableRoomTypes.join(', ')}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleStatus(offer)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        offer.isActive
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {offer.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(offer)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(offer._id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-navy-100 flex justify-between items-center bg-navy-50">
                            <h3 className="font-bold text-navy-900 text-lg">
                                {currentOffer ? 'Edit Offer' : 'Add New Offer'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy-600 mb-1">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        placeholder="e.g. August Special Offer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy-600 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        placeholder="Optional description"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-600 mb-1">Start Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-600 mb-1">End Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy-600 mb-1">Discount Percentage (%)</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discountPercentage}
                                        onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                                        className="w-full bg-navy-50 border border-navy-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy-600 mb-2">Applicable Rooms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {roomTypes.map(type => (
                                            <button
                                                type="button"
                                                key={type}
                                                onClick={() => handleRoomTypeChange(type)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                                                    formData.applicableRoomTypes.includes(type)
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-navy-700">Active Offer</label>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white border-2 border-navy-100 text-navy-600 py-2.5 rounded-xl font-bold hover:bg-navy-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || formData.applicableRoomTypes.length === 0}
                                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving && <Loader2 className="animate-spin" size={16} />}
                                        Save Offer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
