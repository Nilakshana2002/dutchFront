import React from 'react';
import { Truck, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FinanceModule = ({ 
    allLogs, 
    suppliers, 
    loading, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate, 
    financeSupplier, 
    setFinanceSupplier 
}) => {
    return (
        <div className="space-y-6 p-6">
            {/* Finance Filters */}
            <div className="bg-navy-50/50 p-6 rounded-3xl border border-navy-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest ml-1">From Date</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-navy-100 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-medium transition-all" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest ml-1">To Date</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-navy-100 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-medium transition-all" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest ml-1">Supplier Filter</label>
                    <select 
                        value={financeSupplier}
                        onChange={(e) => setFinanceSupplier(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-navy-100 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-medium transition-all"
                    >
                        <option value="all">All Suppliers</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => { setStartDate(''); setEndDate(''); setFinanceSupplier('all'); }}
                    className="px-6 py-2.5 text-navy-400 hover:text-navy-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:rounded-xl hover:shadow-sm"
                >
                    Clear Filters
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-navy-50/50 border-b border-navy-100">
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Flow</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Asset Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Volume</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Valuation</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-navy-400">Loading log data...</td>
                                </tr>
                            ) : (allLogs || []).filter(log => {
                                const logDate = new Date(log.createdAt).toISOString().split('T')[0];
                                const matchesDate = (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
                                const logSupplierId = log.supplier?._id || log.supplier;
                                const itemSupplierId = log.item?.supplier?._id || log.item?.supplier;
                                const matchesSupplier = financeSupplier === 'all' || logSupplierId === financeSupplier || itemSupplierId === financeSupplier;
                                return matchesDate && matchesSupplier;
                            }).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-navy-400">No stock records found.</td>
                                </tr>
                            ) : (
                                (allLogs || []).filter(log => {
                                    const logDate = new Date(log.createdAt).toISOString().split('T')[0];
                                    const matchesDate = (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
                                    const logSupplierId = log.supplier?._id || log.supplier;
                                    const itemSupplierId = log.item?.supplier?._id || log.item?.supplier;
                                    const matchesSupplier = financeSupplier === 'all' || logSupplierId === financeSupplier || itemSupplierId === financeSupplier;
                                    return matchesDate && matchesSupplier;
                                }).map((log) => (
                                    <tr key={log._id} className="hover:bg-navy-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-[10px] text-navy-900 font-black leading-none mb-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-navy-400 font-medium uppercase tracking-tighter">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${log.changeType === 'IN' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                                                {log.changeType === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {log.changeType === 'IN' ? 'IN' : 'OUT'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-navy-900 leading-none mb-1">{log.item?.name}</p>
                                            <p className="text-[10px] text-navy-400 font-mono font-bold uppercase tracking-tight">{log.item?.sku}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-base font-black ${log.changeType === 'IN' ? 'text-teal-600' : 'text-navy-900'}`}>
                                                {log.changeType === 'IN' ? '+' : '-'}{log.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-navy-900">
                                                    Rs.{((log.unitCost || log.item?.price || 0) * log.quantity).toFixed(2)}
                                                </span>
                                                <span className="text-[9px] text-navy-400 font-bold uppercase tracking-tight">Rs.{(log.unitCost || log.item?.price || 0).toFixed(2)}/u</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[10px] text-navy-700 font-bold uppercase tracking-tight">
                                                <Truck size={14} className="text-navy-300" />
                                                {log.supplier?.name || log.item?.supplier?.name || 'Local'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center text-[10px] font-black">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-xs text-navy-900 font-bold">{log.user?.name || 'System'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {(allLogs || []).filter(l => l.changeType === 'IN').length > 0 && (
                            <tfoot className="bg-navy-900 text-white">
                                <tr>
                                    <td colSpan="4" className="px-6 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400">Total Selection Expenditure:</td>
                                    <td className="px-6 py-6 text-xl font-bold text-teal-400">
                                        Rs.{(allLogs || [])
                                            .filter(log => {
                                                const logDate = new Date(log.createdAt).toISOString().split('T')[0];
                                                const matchesDate = (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
                                                const logSupplierId = log.supplier?._id || log.supplier;
                                                const itemSupplierId = log.item?.supplier?._id || log.item?.supplier;
                                                const matchesSupplier = financeSupplier === 'all' || logSupplierId === financeSupplier || itemSupplierId === financeSupplier;
                                                return log.changeType === 'IN' && matchesDate && matchesSupplier;
                                            })
                                            .reduce((acc, log) => acc + ((log.unitCost || log.item?.price || 0) * log.quantity), 0)
                                            .toFixed(2)}
                                    </td>
                                    <td colSpan="2" className="px-6 py-6"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceModule;
