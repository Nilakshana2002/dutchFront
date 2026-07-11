import React from 'react';
import { Package, Layers, Search, Eye, History, Activity, Edit, Trash2 } from 'lucide-react';

const InventoryTable = ({ 
    filteredInventory, 
    loading, 
    getStatusColor, 
    onViewDetails, 
    onAdjust, 
    onViewLogs, 
    onEdit, 
    onDelete 
}) => {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-navy-50/30 border-b border-navy-100">
                    <th className="px-8 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Item Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Unit Price</th>
                    <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Stock Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Quantity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] text-right">Management</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
                {loading ? (
                    <tr>
                        <td colSpan="6" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                <p className="text-sm font-bold text-navy-400 uppercase tracking-widest">Scanning Catalog...</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredInventory.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-3xl bg-navy-50 flex items-center justify-center text-navy-200">
                                    <Search size={32} />
                                </div>
                                <p className="text-lg font-bold text-navy-900">No matching items found</p>
                                <p className="text-sm text-navy-400">Try adjusting your search or filters.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredInventory.map((item) => {
                        const diff = item.expiryDate ? new Date(item.expiryDate) - new Date() : null;
                        const days = diff ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
                        const isExpired = days !== null && days <= 0;
                        const isExpiringSoon = days !== null && days > 0 && days <= 30;

                        return (
                            <tr 
                                key={item._id} 
                                className={`group transition-all duration-300 hover:bg-navy-50/50 ${
                                    isExpired ? 'bg-red-50/60 hover:bg-red-50/80 border-l-4 border-red-500' : 
                                    (item.expiryDate && !isExpiringSoon) ? 'bg-teal-50/40 hover:bg-teal-50/60 border-l-4 border-teal-500' : 
                                    isExpiringSoon ? 'bg-amber-50/40 hover:bg-amber-50/60 border-l-4 border-amber-500' : ''
                                }`}
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getStatusColor(item.status, 'bg')}`}>
                                            <Package size={24} className={getStatusColor(item.status, 'text')} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-navy-900 leading-none mb-1">{item.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-navy-400 font-mono font-bold uppercase tracking-tighter bg-navy-50 px-1.5 py-0.5 rounded border border-navy-100">
                                                    {item.sku}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-900/5 text-navy-900 text-[10px] font-black uppercase tracking-widest">
                                        <Layers size={12} className="text-navy-400" />
                                        {item.category}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="text-sm font-bold text-navy-900">Rs.{item.price?.toFixed(2) || '0.00'}</div>
                                    <p className="text-[9px] text-navy-400 font-bold uppercase">Per {item.unit}</p>
                                </td>
                                <td className="px-6 py-6">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(item.status, 'bg')} ${getStatusColor(item.status, 'text')} border-current/10`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusColor(item.status, 'dot')}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {item.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-navy-900">{item.quantity}</span>
                                        <span className="text-[10px] text-navy-400 font-bold uppercase tracking-tighter px-2 py-0.5 bg-navy-50 rounded-lg border border-navy-100">{item.unit}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {[
                                            { icon: Eye, color: 'navy', title: 'View Details', action: () => onViewDetails(item) },
                                            { icon: History, color: 'teal', title: 'Adjust', action: () => onAdjust(item) },
                                            { icon: Activity, color: 'blue', title: 'Logs', action: () => onViewLogs(item) },
                                            { icon: Edit, color: 'amber', title: 'Edit', action: () => onEdit(item) },
                                            { icon: Trash2, color: 'red', title: 'Delete', action: () => onDelete(item._id) }
                                        ].map((btn, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={btn.action}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 text-navy-400 hover:shadow-lg hover:shadow-${btn.color}-600/10 hover:bg-${btn.color}-50 hover:text-${btn.color}-600`}
                                                title={btn.title}
                                            >
                                                <btn.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
};

export default InventoryTable;
