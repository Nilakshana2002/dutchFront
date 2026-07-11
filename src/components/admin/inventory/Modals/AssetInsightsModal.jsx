import React from 'react';
import { XCircle, Activity, Info, TrendingDown, ShieldAlert, Calendar, ShieldCheck, History } from 'lucide-react';

const AssetInsightsModal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    getStatusColor, 
    openLogs 
}) => {
    if (!isOpen || !selectedItem) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="bg-navy-900 px-8 py-8 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-teal-500 text-white shadow-lg shadow-teal-500/20`}>
                                {selectedItem.category}
                            </div>
                            <span className="text-navy-300 font-mono text-xs">{selectedItem.sku}</span>
                        </div>
                        <h3 className="text-white font-bold text-2xl leading-tight">{selectedItem.name}</h3>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {selectedItem.imageUrl && (
                        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border border-navy-100 shadow-sm group">
                            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent" />
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                            <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Current Stock</p>
                            <p className="text-xl font-black text-navy-900">{selectedItem.quantity} <span className="text-xs font-bold text-navy-400 uppercase">{selectedItem.unit}</span></p>
                        </div>
                        <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                            <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Unit Valuation</p>
                            <p className="text-xl font-black text-navy-900">Rs.{selectedItem.price.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                            <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Total Value</p>
                            <p className="text-xl font-black text-teal-600">Rs.{(selectedItem.price * selectedItem.quantity).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-navy-400" />
                            Operational Status
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-navy-100 bg-white shadow-sm">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(selectedItem.status, 'bg')} ${getStatusColor(selectedItem.status, 'text')}`}>
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-navy-400 uppercase">Availability</p>
                                    <p className="text-xs font-bold text-navy-900 capitalize">{selectedItem.status.replace('-', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-navy-100 bg-white shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <TrendingDown size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-navy-400 uppercase">Reorder Point</p>
                                    <p className="text-xs font-bold text-navy-900">{selectedItem.reorderLevel} {selectedItem.unit}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(selectedItem.expiryDate || selectedItem.warrantyInfo) && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={14} className="text-teal-600" />
                                Asset Compliance
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedItem.expiryDate && (
                                    <div className={`p-4 rounded-2xl border ${new Date(selectedItem.expiryDate) < new Date() ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar size={14} className={new Date(selectedItem.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'} />
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-navy-700">Expiry Date</p>
                                        </div>
                                        <p className="text-sm font-black text-navy-900">{new Date(selectedItem.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p className={`text-[9px] font-bold mt-1 uppercase ${new Date(selectedItem.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                                            {new Date(selectedItem.expiryDate) < new Date() ? 'Expired' : `${Math.ceil((new Date(selectedItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} Days Remaining`}
                                        </p>
                                    </div>
                                )}
                                {selectedItem.warrantyInfo && (
                                    <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck size={14} className="text-teal-600" />
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-navy-700">Warranty Policy</p>
                                        </div>
                                        <p className="text-sm font-black text-navy-900">{selectedItem.warrantyInfo}</p>
                                        <p className="text-[9px] font-bold text-teal-600 mt-1 uppercase tracking-widest">Active Protection</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-navy-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => { onClose(); openLogs(selectedItem); }}
                                className="text-xs font-bold text-navy-400 hover:text-navy-900 flex items-center gap-1.5 transition-colors"
                            >
                                <History size={14} /> Full Audit Log
                            </button>
                        </div>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl bg-navy-900 text-white font-bold text-xs shadow-xl shadow-navy-900/20 hover:scale-105 transition-all"
                        >
                            Dismiss Insights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetInsightsModal;
