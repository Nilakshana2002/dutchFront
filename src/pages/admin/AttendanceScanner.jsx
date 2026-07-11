import React, { useState, useEffect, useCallback } from 'react';
import { ScanLine, Clock, Users, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRScanner from '../../components/admin_components/QRScanner';
import { scanAttendance, fetchTodayAttendance } from '../../utils/api';

const AttendanceScanner = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
            {/* Top Bar */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/staff" className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-white font-bold text-lg">Attendance Scanner</h1>
                        <p className="text-teal-400 text-xs font-medium tracking-wider uppercase">Dutch-Point Hotel</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white font-mono tabular-nums">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-white/50 text-xs">
                        {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
                {/* Left: Scanner */}
                <div className="flex-1 lg:max-w-xl">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <ScanLine size={20} className="text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold">Scan Employee Badge</h2>
                                <p className="text-white/50 text-xs">Point camera at QR code</p>
                            </div>
                        </div>
                        <QRScanner onScan={handleScan} />
                    </div>
                </div>

                {/* Right: Summary + History */}
                <div className="flex-1 space-y-6">
                    {/* Today's Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                            <Users size={20} className="mx-auto text-white/50 mb-2" />
                            <p className="text-2xl font-bold text-white">{todaySummary.totalEmployees}</p>
                            <p className="text-white/40 text-xs font-medium">Total Staff</p>
                        </div>
                        <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-4 text-center">
                            <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-2" />
                            <p className="text-2xl font-bold text-emerald-400">{todaySummary.present}</p>
                            <p className="text-emerald-400/60 text-xs font-medium">Present</p>
                        </div>
                        <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4 text-center">
                            <Clock size={20} className="mx-auto text-orange-400 mb-2" />
                            <p className="text-2xl font-bold text-orange-400">{todaySummary.late}</p>
                            <p className="text-orange-400/60 text-xs font-medium">Late</p>
                        </div>
                        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-4 text-center">
                            <XCircle size={20} className="mx-auto text-red-400 mb-2" />
                            <p className="text-2xl font-bold text-red-400">{todaySummary.absent}</p>
                            <p className="text-red-400/60 text-xs font-medium">Absent</p>
                        </div>
                    </div>

                    {/* Recent Scans */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-sm">Recent Scans</h3>
                            <button onClick={loadSummary} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        {scanHistory.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <ScanLine size={32} className="mx-auto text-white/20 mb-3" />
                                <p className="text-white/40 text-sm">No scans yet today</p>
                                <p className="text-white/25 text-xs mt-1">Scan an employee's QR badge to begin</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {scanHistory.map((scan, i) => (
                                    <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            scan.action === 'check-in' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                                        }`}>
                                            <CheckCircle2 size={16} className={scan.action === 'check-in' ? 'text-emerald-400' : 'text-blue-400'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{scan.employee?.name}</p>
                                            <p className="text-white/40 text-xs">{scan.employee?.department} • {scan.employee?.jobTitle}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                scan.action === 'check-in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {scan.action === 'check-in' ? 'IN' : 'OUT'}
                                            </span>
                                            <p className="text-white/30 text-xs mt-0.5 font-mono">
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

export default AttendanceScanner;
