import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { 
    Truck, TrendingUp, Edit, Trash2, XCircle, CheckCircle2, 
    Activity, ShieldCheck, Mail, Phone, MapPin 
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupplierModule = forwardRef(({ 
    suppliers, 
    loading, 
    allLogs, 
    updateSupplier, 
    createSupplier, 
    deleteSupplier, 
    loadData,
    setActiveTab,
    setFinanceSupplier,
    setStartDate,
    setEndDate,
    inventoryCategories
}, ref) => {
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierStatus, setSupplierStatus] = useState('active');

    useImperativeHandle(ref, () => ({
        openAddModal: () => {
            setSelectedSupplier(null);
            setSupplierStatus('active');
            setIsSupplierModalOpen(true);
        }
    }));


    return (
        <>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-navy-50/30 border-b border-navy-100">
                        <th className="px-8 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Supplier Identity</th>
                        <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Communication</th>
                        <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Category</th>
                        <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Total Trade</th>
                        <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="px-8 py-24 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-navy-400 uppercase tracking-widest">Loading Partners...</p>
                                </div>
                            </td>
                        </tr>
                    ) : suppliers.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-8 py-24 text-center text-navy-400">No suppliers found.</td>
                        </tr>
                    ) : (
                        suppliers.map((supplier) => (
                            <tr key={supplier._id} className="hover:bg-navy-50/50 transition-all duration-300 group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-navy-900 leading-none mb-1">{supplier.name}</p>
                                            <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">{supplier.contactPerson}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-navy-900">{supplier.phone}</div>
                                        <div className="text-[10px] text-navy-400 font-medium">{supplier.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-900/5 text-navy-900 text-[10px] font-black uppercase tracking-widest">
                                        {supplier.category}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="text-sm font-bold text-teal-600">
                                        Rs.{(allLogs || [])
                                            .filter(l => l.changeType === 'IN' && (l.supplier?._id === supplier._id || l.item?.supplier?._id === supplier._id))
                                            .reduce((acc, log) => acc + ((log.unitCost || log.item?.price || 0) * log.quantity), 0)
                                            .toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${supplier.status === 'active' ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${supplier.status === 'active' ? 'bg-teal-500' : 'bg-red-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {supplier.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button 
                                            onClick={() => {
                                                setFinanceSupplier(supplier._id);
                                                setActiveTab('purchases');
                                                setStartDate('');
                                                setEndDate('');
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 text-navy-400 hover:bg-teal-50 hover:text-teal-600"
                                            title="Transactions"
                                        >
                                            <TrendingUp size={18} />
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setSelectedSupplier(supplier); 
                                                setSupplierStatus(supplier.status || 'active');
                                                setIsSupplierModalOpen(true); 
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 text-navy-400 hover:bg-amber-50 hover:text-amber-600"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (window.confirm('Delete this supplier?')) {
                                                    try {
                                                        await deleteSupplier(supplier._id);
                                                        toast.success('Supplier removed');
                                                        loadData();
                                                    } catch (err) { toast.error(err.message); }
                                                }
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 text-navy-400 hover:bg-red-50 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Supplier Modal */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold">{selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button onClick={() => setIsSupplierModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <form id="supplierForm" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const data = Object.fromEntries(formData);
                                
                                // Email validation
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(data.email)) {
                                    return toast.error('Please enter a valid email address');
                                }

                                // Phone validation (exactly 10 digits only)
                                if (!/^\d{10}$/.test(data.phone)) {
                                    return toast.error('Phone number must be exactly 10 digits');
                                }

                                try {
                                    if (selectedSupplier) {
                                        await updateSupplier(selectedSupplier._id, data);
                                        toast.success('Supplier profile updated');
                                    } else {
                                        await createSupplier(data);
                                        toast.success('New supplier onboarded');
                                    }
                                    setIsSupplierModalOpen(false);
                                    loadData();
                                } catch (err) { toast.error(err.message); }
                            }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Company / Supplier Identity</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                                                <Truck size={18} />
                                            </div>
                                            <input 
                                                name="name" 
                                                defaultValue={selectedSupplier?.name} 
                                                placeholder="e.g. Global Kitchen Supplies Ltd."
                                                required 
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Primary Contact Person</label>
                                        <input 
                                            name="contactPerson" 
                                            defaultValue={selectedSupplier?.contactPerson} 
                                            required 
                                            placeholder="Full Name"
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Supply Classification</label>
                                        <select 
                                            name="category" 
                                            defaultValue={selectedSupplier?.category || 'Kitchen & Restaurant'} 
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all bg-white"
                                        >
                                            {Object.keys(inventoryCategories).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Direct Phone</label>
                                        <input 
                                            name="phone" 
                                            type="tel"
                                            defaultValue={selectedSupplier?.phone} 
                                            required 
                                            placeholder="e.g. 0712345678"
                                            maxLength={10}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Business Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            defaultValue={selectedSupplier?.email} 
                                            required 
                                            placeholder="contact@supplier.com"
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Corporate Address</label>
                                        <textarea 
                                            name="address" 
                                            defaultValue={selectedSupplier?.address} 
                                            placeholder="Physical location or warehouse address..."
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm h-24 resize-none transition-all" 
                                        />
                                    </div>

                                    {selectedSupplier && (
                                        <div className="col-span-2 p-6 rounded-2xl bg-navy-50 border border-navy-100 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Activity size={16} className="text-navy-400" />
                                                <p className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Partnership Status</p>
                                            </div>
                                            <input type="hidden" name="status" value={supplierStatus} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <button type="button" onClick={() => setSupplierStatus('active')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                                    supplierStatus === 'active' ? 'border-teal-500 bg-white shadow-md' : 'border-navy-100 bg-transparent hover:border-teal-200'
                                                }`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${supplierStatus === 'active' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-600'}`}>
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-navy-900">Active Vendor</p>
                                                        <p className="text-[9px] text-navy-400">Regular Procurement</p>
                                                    </div>
                                                </button>
                                                <button type="button" onClick={() => setSupplierStatus('inactive')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                                    supplierStatus === 'inactive' ? 'border-red-400 bg-white shadow-md' : 'border-navy-100 bg-transparent hover:border-red-200'
                                                }`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${supplierStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'}`}>
                                                        <XCircle size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-navy-900">Blacklisted / Paused</p>
                                                        <p className="text-[9px] text-navy-400">No active orders</p>
                                                    </div>
                                                </button>
                                            </div>
                                            {supplierStatus === 'inactive' && (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <label className="block text-[10px] font-bold text-navy-500 uppercase mb-2 ml-1">Reason for Deactivation</label>
                                                    <textarea
                                                        name="statusReason"
                                                        defaultValue={selectedSupplier?.statusReason}
                                                        placeholder="e.g. Contract expired, Quality issues..."
                                                        className="w-full px-4 py-3 rounded-xl border border-navy-100 bg-white focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-400 text-sm h-20 resize-none transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-navy-50 flex items-center justify-end gap-4 bg-navy-50/30">
                            <button 
                                type="button" 
                                onClick={() => setIsSupplierModalOpen(false)} 
                                className="px-6 py-3 rounded-xl border border-navy-200 font-bold text-navy-600 hover:bg-white transition-all text-xs"
                            >
                                Cancel
                            </button>
                            <button 
                                form="supplierForm"
                                type="submit" 
                                className="px-8 py-3 rounded-xl bg-navy-900 text-white font-bold shadow-xl shadow-navy-900/20 hover:bg-navy-800 hover:shadow-navy-900/30 active:scale-95 transition-all text-xs"
                            >
                                {selectedSupplier ? 'Update Profile' : 'Synchronize Supplier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default SupplierModule;
