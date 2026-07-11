import React from 'react';
import { XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AuditTrailModal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    logs 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                <div className="bg-navy-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-white font-bold">Stock History</h3>
                        <p className="text-navy-400 text-xs tracking-wide uppercase">{selectedItem?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <XCircle size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="text-center py-12 text-navy-400">No logs found for this item.</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log._id} className="flex gap-4 p-4 rounded-2xl bg-navy-50/50 border border-navy-100 relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${log.changeType === 'IN' ? 'bg-teal-500' : 'bg-red-500'}`} />
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${log.changeType === 'IN' ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}`}>
                                        {log.changeType === 'IN' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-navy-900">
                                                    {log.changeType === 'IN' ? 'Restocked' : 'Consumed'} {log.quantity} {selectedItem?.unit}
                                                </p>
                                                {log.changeType === 'IN' && log.unitCost > 0 && (
                                                    <p className="text-[10px] text-teal-600 font-bold tracking-wide mt-0.5">
                                                        COST: Rs.{log.unitCost} / UNIT (Total: Rs.{(log.unitCost * log.quantity).toFixed(2)})
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-navy-400 font-medium">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-xs text-navy-600 line-clamp-2 italic">"{log.reason}"</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-navy-400 uppercase font-bold tracking-tighter">By</span>
                                                <span className="text-[10px] text-navy-900 font-bold underline decoration-teal-500/30 underline-offset-2">{log.user?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditTrailModal;
