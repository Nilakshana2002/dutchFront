import React, { useState } from 'react';
import { XCircle, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StockAdjustmentModal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    suppliers, 
    onAdjust 
}) => {
    const [changeType, setChangeType] = useState('IN');

    if (!isOpen || !selectedItem) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        onAdjust(e, data);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className={`px-6 py-5 flex items-center justify-between transition-colors duration-300 ${changeType === 'IN' ? 'bg-teal-600' : 'bg-red-500'}`}>
                    <div>
                        <h3 className="text-white font-bold text-base">Stock Movement</h3>
                        <p className="text-white/70 text-xs mt-0.5">{selectedItem?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <XCircle size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50 border border-navy-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-navy-100 flex items-center justify-center">
                                <Package size={18} className="text-navy-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-navy-900">{selectedItem?.name}</p>
                                <p className="text-[10px] text-navy-400 font-mono">{selectedItem?.sku}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-navy-400 uppercase font-bold">Current Stock</p>
                            <p className="text-sm font-bold text-navy-900">{selectedItem?.quantity} <span className="text-navy-400 font-medium">{selectedItem?.unit}</span></p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3">Movement Direction</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setChangeType('IN')} className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${changeType === 'IN' ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/10' : 'border-navy-100 bg-white hover:border-teal-200'}`}>
                                {changeType === 'IN' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500" />}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${changeType === 'IN' ? 'bg-teal-500 text-white' : 'bg-navy-100 text-navy-400'}`}><ArrowUpRight size={24} /></div>
                                <div className="text-center">
                                    <p className={`text-sm font-black ${changeType === 'IN' ? 'text-teal-700' : 'text-navy-400'}`}>Stock IN</p>
                                    <p className="text-[9px] text-navy-400">Receiving stock</p>
                                </div>
                                <input type="radio" name="changeType" value="IN" checked={changeType === 'IN'} readOnly className="sr-only" />
                            </button>
                            <button type="button" onClick={() => setChangeType('OUT')} className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${changeType === 'OUT' ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/10' : 'border-navy-100 bg-white hover:border-red-200'}`}>
                                {changeType === 'OUT' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${changeType === 'OUT' ? 'bg-red-500 text-white' : 'bg-navy-100 text-navy-400'}`}><ArrowDownRight size={24} /></div>
                                <div className="text-center">
                                    <p className={`text-sm font-black ${changeType === 'OUT' ? 'text-red-700' : 'text-navy-400'}`}>Stock OUT</p>
                                    <p className="text-[9px] text-navy-400">Consuming stock</p>
                                </div>
                                <input type="radio" name="changeType" value="OUT" checked={changeType === 'OUT'} readOnly className="sr-only" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Quantity</label>
                        <div className="relative">
                            <input type="number" name="quantity" required min="1" placeholder="0" className={`w-full px-4 py-3 rounded-xl border-2 text-center text-xl font-black focus:outline-none transition-all ${changeType === 'IN' ? 'border-teal-200 focus:border-teal-500 text-teal-700' : 'border-red-200 focus:border-red-500 text-red-700'}`} />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-navy-400 font-bold uppercase">{selectedItem?.unit}</span>
                        </div>
                    </div>
                    {changeType === 'IN' && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Unit Cost (Rs.)</label>
                                <input type="number" name="unitCost" step="0.01" placeholder="0.00" defaultValue={selectedItem?.price} className="w-full px-3 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Supplier</label>
                                <select name="supplier" defaultValue={selectedItem?.supplier?._id} className="w-full px-3 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm">
                                    <option value="">No supplier</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Reason / Notes</label>
                        <textarea name="reason" required placeholder={changeType === 'IN' ? 'e.g., Monthly restocking from supplier...' : 'e.g., Used for banquet event, Room 201...'} className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-navy-500/10 focus:border-navy-400 text-sm h-20 resize-none" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-navy-100 text-navy-700 font-medium hover:bg-navy-50 transition-all text-sm">Cancel</button>
                        <button type="submit" className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold transition-all text-sm shadow-lg ${changeType === 'IN' ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}>
                            {changeType === 'IN' ? '+ Receive Stock' : '− Release Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
