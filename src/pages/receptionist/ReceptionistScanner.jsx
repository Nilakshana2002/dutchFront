import React, { useState, useEffect, useCallback } from 'react';
import { ScanLine, Clock, Users, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRScanner from '../../components/admin_components/QRScanner';
import { scanAttendance, fetchTodayAttendance } from '../../utils/api';

const ReceptionistScanner = () => {
    const [scanHistory, setScanHistory] = useState([]);
    const [todaySummary, setTodaySummary] = useState({ totalEmployees: 0, present: 0, late: 0, absent: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load today's summary
    const loadSummary = useCallback(async () => {
        try {
            const data = await fetchTodayAttendance();
            setTodaySummary(data);
        } catch (e) {
            console.warn('Could not load attendance summary:', e.message);
        }
    }, []);

    useEffect(() => { loadSummary(); }, [loadSummary]);

    const handleScan = async (employeeId) => {
        const result = await scanAttendance(employeeId);
        setScanHistory(prev => [{ ...result, time: new Date() }, ...prev].slice(0, 10));
        loadSummary(); // refresh summary
        return result;
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                        <ScanLine size={24} className="text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-navy-950">Attendance Scanner</h1>
                        <p className="text-navy-500 text-sm font-medium">Log staff entry and exit via QR badges</p>
                    </div>
                </div>
                <div className="text-right bg-white px-6 py-3 rounded-2xl border border-navy-100 shadow-sm">
                    <div className="text-2xl font-bold text-navy-950 font-mono tabular-nums leading-none">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-navy-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Scanner */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-[2rem] border border-navy-100 p-8 shadow-sm h-fit sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-navy-950 flex items-center justify-center">
                                <ScanLine size={20} className="text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-navy-950 font-bold">Live Scanner</h2>
                                <p className="text-navy-400 text-xs font-medium">Point camera at QR code</p>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] overflow-hidden">
                            <QRScanner onScan={handleScan} />
                        </div>
                        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <Clock size={18} className="text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                <strong>Tip:</strong> Ensure the QR code is well-lit and centered in the frame for faster recognition.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Summary + History */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Today's Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SummaryTile icon={Users} label="Total Staff" value={todaySummary.totalEmployees} color="navy" />
                        <SummaryTile icon={CheckCircle2} label="Present" value={todaySummary.present} color="emerald" />
                        <SummaryTile icon={Clock} label="Late" value={todaySummary.late} color="orange" />
                        <SummaryTile icon={XCircle} label="Absent" value={todaySummary.absent} color="red" />
                    </div>

                    {/* Recent Scans */}
                    <div className="bg-white rounded-[2rem] border border-navy-100 overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-navy-50 flex items-center justify-between bg-navy-50/20">
                            <div>
                                <h3 className="text-navy-950 font-bold">Recent Scans</h3>
                                <p className="text-navy-400 text-xs font-medium mt-0.5">Last 10 activities today</p>
                            </div>
                            <button onClick={loadSummary} className="p-2.5 hover:bg-navy-100 rounded-xl text-navy-400 hover:text-navy-900 transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {scanHistory.length === 0 ? (
                            <div className="text-center py-20 px-8">
                                <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-6 text-navy-200">
                                    <ScanLine size={40} />
                                </div>
                                <h4 className="text-navy-950 font-bold mb-2">No scans yet today</h4>
                                <p className="text-navy-400 text-sm max-w-xs mx-auto italic font-medium leading-relaxed">
                                    Scanning an employee's QR badge will automatically record their check-in or check-out time.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-navy-50">
                                {scanHistory.map((scan, i) => (
                                    <div key={i} className="px-8 py-5 flex items-center gap-5 hover:bg-navy-50/30 transition-colors">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                            scan.action === 'check-in' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-navy-950 text-base font-bold truncate">{scan.employee?.name}</p>
                                            <p className="text-navy-400 text-xs font-bold uppercase tracking-wider mt-0.5">{scan.employee?.department} • {scan.employee?.jobTitle}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                                scan.action === 'check-in' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                                {scan.action === 'check-in' ? 'CHECK-IN' : 'CHECK-OUT'}
                                            </span>
                                            <p className="text-navy-400 text-sm mt-2 font-bold font-mono">
                                                {scan.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryTile = ({ icon: Icon, label, value, color }) => {
    const colors = {
        navy: 'bg-navy-50 text-navy-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600'
    };

    return (
        <div className="bg-white rounded-[1.5rem] border border-navy-100 p-5 text-center shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mx-auto mb-3`}>
                <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-navy-950 leading-none">{value}</p>
            <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mt-2">{label}</p>
        </div>
    );
};

export default ReceptionistScanner;
