import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    User, Calendar, Clock, Banknote, Save, RefreshCw, 
    TrendingUp, ShieldCheck, Mail, Phone,
    CheckCircle, Timer, QrCode, Download, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchMyProfile, updateMyProfile, fetchMyAttendance, fetchMyLastPayroll } from '../utils/api';
import Toast from '../components/admin_components/Toast';
import { useToast } from '../components/admin_components/useToast';

const EmployeeDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'summary';
    const qrRef = useRef(null);
    
    const { toast, showToast, clearToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [staff, setStaff] = useState(null);
    const [attendance, setAttendance] = useState({ records: [], summary: { present: 0, late: 0, totalHours: 0 } });
    const [payroll, setPayroll] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        firstName: '', lastName: '', phone: '', password: '', photoURL: ''
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileData, payrollData, attendanceData] = await Promise.all([
                fetchMyProfile(),
                fetchMyLastPayroll(),
                fetchMyAttendance({ month: new Date().getMonth(), year: new Date().getFullYear() })
            ]);
            
            if (!profileData) throw new Error('Could not load profile data');
            
            setStaff(profileData);
            setPayroll(payrollData);
            setAttendance(attendanceData || { records: [], summary: { present: 0, late: 0, totalHours: 0 } });
            
            setForm({
                firstName: profileData.user?.firstName || '',
                lastName: profileData.user?.lastName || '',
                phone: profileData.user?.phone || '',
                photoURL: profileData.user?.photoURL || '',
                password: ''
            });
        } catch (e) {
            console.error('Dashboard Error:', e);
            setError(e.message);
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateMyProfile(form);
            showToast('Profile updated successfully');
            loadData();
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const a = document.createElement('a');
            a.download = `QR-${staff?.employeeId}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-navy-400 text-xs font-bold uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    if (error && !staff) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-6 bg-white rounded-3xl border-2 border-dashed border-navy-100 p-10">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <ShieldCheck size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-navy-950 mb-2">Sync Connection Error</h3>
                    <p className="text-navy-400 text-sm max-w-sm">{error}. Please try refreshing your session.</p>
                </div>
                <button onClick={loadData} className="px-6 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors flex items-center gap-2">
                    <RefreshCw size={18} />
                    Retry Connection
                </button>
            </div>
        );
    }

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-navy-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                            {staff?.user?.photoURL ? (
                                <img src={staff.user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                staff?.user?.firstName?.charAt(0)
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-lg shadow-md border-2 border-white">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-navy-950">{staff?.user?.firstName} {staff?.user?.lastName}</h1>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-100">Active Account</span>
                        </div>
                        <p className="text-navy-500 font-medium text-base mb-4">{staff?.jobTitle} • <span className="text-teal-600">{staff?.department}</span></p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6">
                            <div className="flex items-center gap-2 text-navy-400 text-sm">
                                <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center text-navy-400">
                                    <Mail size={14} />
                                </div>
                                {staff?.email}
                            </div>
                            <div className="flex items-center gap-2 text-navy-400 text-sm">
                                <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center text-navy-400">
                                    <Phone size={14} />
                                </div>
                                {staff?.phone}
                            </div>
                            <div className="flex items-center gap-2 text-navy-400 text-sm font-bold bg-navy-900 text-white px-3 py-1 rounded-lg">
                                ID: {staff?.employeeId}
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={loadData} className="p-4 bg-navy-50 text-navy-400 rounded-2xl hover:bg-navy-100 hover:text-teal-600 transition-all group">
                        <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="space-y-10">
                
                {/* Summary Tab */}
                {activeTab === 'summary' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 hover:shadow-md transition-shadow group">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={28} />
                                </div>
                                <p className="text-navy-400 text-xs font-bold uppercase tracking-widest">Days Present</p>
                                <h3 className="text-4xl font-bold text-navy-950 mt-2">{attendance.summary.present + attendance.summary.late}</h3>
                                <div className="w-full h-1 bg-navy-50 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 hover:shadow-md transition-shadow group">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Timer size={28} />
                                </div>
                                <p className="text-navy-400 text-xs font-bold uppercase tracking-widest">Total Work Hours</p>
                                <h3 className="text-4xl font-bold text-navy-950 mt-2">{attendance.summary.totalHours}h</h3>
                                <div className="w-full h-1 bg-navy-50 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 hover:shadow-md transition-shadow group">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Calendar size={28} />
                                </div>
                                <p className="text-navy-400 text-xs font-bold uppercase tracking-widest">Remaining Leaves</p>
                                <h3 className="text-4xl font-bold text-navy-950 mt-2">{staff?.annualLeaveBalance || 14}</h3>
                                <div className="w-full h-1 bg-navy-50 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(staff?.annualLeaveBalance / 14) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-navy-950">Recent Activity Log</h3>
                                    <button onClick={() => setSearchParams({ tab: 'attendance' })} className="text-xs font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors">View All History</button>
                                </div>
                                <div className="space-y-4">
                                    {attendance.records.slice(0, 5).map((record, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-navy-50/30 rounded-2xl border border-transparent hover:border-navy-100 hover:bg-white transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-3 rounded-xl shadow-sm ${
                                                    record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                                                    record.status === 'Late' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-navy-950">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                                                        record.status === 'Present' ? 'text-emerald-600' : 
                                                        record.status === 'Late' ? 'text-orange-600' : 'text-red-600'
                                                    }`}>Logged as {record.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {attendance.records.length === 0 && (
                                        <div className="text-center py-16 bg-navy-50/20 rounded-3xl border-2 border-dashed border-navy-100">
                                            <div className="w-16 h-16 bg-navy-100/50 rounded-full flex items-center justify-center mx-auto mb-4 text-navy-300">
                                                <Calendar size={32} />
                                            </div>
                                            <p className="text-navy-400 text-sm italic">No activity recorded for this period.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR Quick Access Card */}
                            <div className="bg-navy-950 rounded-3xl p-8 shadow-xl shadow-navy-950/20 border border-white/5 flex flex-col items-center justify-center text-center text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
                                <QrCode size={32} className="text-teal-400 mb-6" />
                                <h3 className="text-xl font-bold mb-2">My Attendance QR</h3>
                                <p className="text-white/50 text-xs mb-8 max-w-xs uppercase tracking-widest font-bold">Use this code for daily check-in/out</p>
                                
                                <div className="p-4 bg-white rounded-3xl mb-8 group-hover:scale-105 transition-transform">
                                    <QRCodeSVG value={staff?.employeeId || ''} size={150} level="H" fgColor="#0f172a" />
                                </div>
                                
                                <button 
                                    onClick={() => setSearchParams({ tab: 'qr' })}
                                    className="px-8 py-3 bg-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
                                >
                                    View Full Badge
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Tab */}
                {activeTab === 'qr' && (
                    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-md border border-navy-100" ref={qrRef}>
                            <div className="bg-navy-950 p-8 text-center relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-teal-500/30">
                                    DP
                                </div>
                                <h3 className="text-white text-2xl font-bold tracking-tight">Employee Badge</h3>
                                <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dutch-Point Hotel & Resort</p>
                            </div>
                            
                            <div className="p-10 text-center">
                                <div className="mb-10 flex justify-center">
                                    <div className="p-6 bg-white border-4 border-navy-50 rounded-[2.5rem] shadow-inner">
                                        <QRCodeSVG value={staff?.employeeId || ''} size={220} level="H" fgColor="#0f172a" />
                                    </div>
                                </div>
                                
                                <h4 className="text-3xl font-black text-navy-950 mb-2">{staff?.user?.firstName} {staff?.user?.lastName}</h4>
                                <p className="text-navy-500 font-bold text-sm uppercase tracking-widest mb-6">{staff?.jobTitle} • {staff?.department}</p>
                                
                                <div className="bg-navy-50 py-3 px-6 rounded-2xl inline-block mb-10">
                                    <p className="text-navy-900 font-black font-mono text-xl tracking-[0.3em]">{staff?.employeeId}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={handleDownloadQR} className="flex items-center justify-center gap-3 py-4 bg-navy-50 text-navy-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-navy-100 transition-all">
                                        <Download size={18} />
                                        Save PNG
                                    </button>
                                    <button onClick={() => window.print()} className="flex items-center justify-center gap-3 py-4 bg-navy-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-teal-600 transition-all">
                                        <Printer size={18} />
                                        Print Card
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-navy-50 p-6 text-center">
                                <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">Digital Identification Document</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance History Tab */}
                {activeTab === 'attendance' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-8 border-b border-navy-50 flex justify-between items-center bg-navy-50/10">
                            <div>
                                <h3 className="text-xl font-bold text-navy-950 mb-1">Full Attendance Log</h3>
                                <p className="text-xs text-navy-400 font-medium tracking-wide">Historical records of your daily attendance punch-ins.</p>
                            </div>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl uppercase tracking-widest">{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-navy-950 text-white text-[10px] uppercase font-bold tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5 text-center">In Time</th>
                                        <th className="px-8 py-5 text-center">Out Time</th>
                                        <th className="px-8 py-5 text-center">Duration</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy-50">
                                    {attendance.records.map((r, i) => (
                                        <tr key={i} className="hover:bg-navy-50/40 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-navy-950">{new Date(r.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-navy-400 font-medium">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center text-sm font-mono text-navy-600 font-bold bg-navy-50/20 group-hover:bg-white transition-colors">
                                                {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="px-8 py-5 text-center text-sm font-mono text-navy-600 font-bold bg-navy-50/20 group-hover:bg-white transition-colors">
                                                {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-sm font-bold text-navy-800">{r.workHours || '0.00'}</span>
                                                <span className="text-[10px] text-navy-400 font-bold uppercase ml-1">hrs</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                    r.status === 'Present' ? 'bg-emerald-500 text-white' :
                                                    r.status === 'Late' ? 'bg-orange-500 text-white' :
                                                    r.status === 'Half-Day' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                                }`}>{r.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payroll Tab */}
                {activeTab === 'payroll' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-navy-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-navy-950/40 border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-950/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <p className="text-teal-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Last Month Performance</p>
                                        <h2 className="text-5xl font-bold tracking-tight">Rs. {payroll?.netPay?.toLocaleString() || '0'}</h2>
                                    </div>
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <Banknote size={28} className="text-teal-400" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
                                    <div>
                                        <p className="text-white/40 text-[10px] mb-2 uppercase font-black tracking-widest">Base Salary</p>
                                        <p className="text-xl font-bold tracking-tight">Rs. {payroll?.salary?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] mb-2 uppercase font-black tracking-widest">Working Period</p>
                                        <p className="text-xl font-bold tracking-tight">{MONTHS[payroll?.month || 0]} {payroll?.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] mb-2 uppercase font-black tracking-widest">Working Days</p>
                                        <p className="text-xl font-bold tracking-tight">{payroll?.workingDays || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] mb-2 uppercase font-black tracking-widest">Status</p>
                                        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-navy-100">
                            <h3 className="text-2xl font-bold text-navy-950 mb-10 tracking-tight">Earnings Breakdown</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-5 border-b border-navy-50 group hover:bg-navy-50/30 px-4 rounded-xl transition-colors">
                                    <span className="text-navy-500 font-medium">Standard Working Days (Mon-Sat)</span>
                                    <span className="font-bold text-navy-950 text-lg font-mono">{payroll?.workingDays || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-navy-50 group hover:bg-navy-50/30 px-4 rounded-xl transition-colors">
                                    <span className="text-navy-500 font-medium">Recorded Present Days</span>
                                    <span className="font-bold text-emerald-600 text-lg font-mono">+{payroll?.presentDays || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-navy-50 group hover:bg-navy-50/30 px-4 rounded-xl transition-colors">
                                    <span className="text-navy-500 font-medium">Late Arrival Occurrences</span>
                                    <span className="font-bold text-orange-600 text-lg font-mono">{payroll?.lateDays || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-navy-50 group hover:bg-navy-50/30 px-4 rounded-xl transition-colors">
                                    <span className="text-navy-500 font-medium">Total Deductions (Lates/Absents)</span>
                                    <span className="font-bold text-red-600 text-lg font-mono">-Rs. {payroll?.deductions?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center py-8 bg-navy-950 px-10 rounded-3xl mt-10 shadow-xl shadow-navy-950/20 border-t-4 border-teal-500">
                                    <div>
                                        <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Final Net Payout</p>
                                        <span className="text-white font-bold text-sm">Transferable to Bank</span>
                                    </div>
                                    <span className="font-bold text-white text-3xl font-mono tracking-tighter">Rs. {payroll?.netPay?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Settings Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-navy-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-navy-950 tracking-tight mb-2">Account Settings</h3>
                            <p className="text-navy-400 font-medium tracking-wide">Maintain your personal information and security credentials.</p>
                        </div>
                        
                        <form onSubmit={handleUpdateProfile} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">First Name</label>
                                    <input 
                                        type="text" 
                                        value={form.firstName} 
                                        onChange={e => setForm({...form, firstName: e.target.value})}
                                        className="w-full px-6 py-4.5 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={form.lastName} 
                                        onChange={e => setForm({...form, lastName: e.target.value})}
                                        className="w-full px-6 py-4.5 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">Contact Phone</label>
                                    <input 
                                        type="text" 
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        className="w-full px-6 py-4.5 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">Security Credentials (Password)</label>
                                    <input 
                                        type="password" 
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})}
                                        placeholder="Enter new password to change"
                                        className="w-full px-6 py-4.5 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">Avatar / Profile Image URL</label>
                                    <input 
                                        type="text" 
                                        value={form.photoURL} 
                                        onChange={e => setForm({...form, photoURL: e.target.value})}
                                        placeholder="https://images.unsplash.com/your-photo"
                                        className="w-full px-6 py-4.5 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end border-t border-navy-50 pt-10">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="group flex items-center gap-3 bg-navy-950 text-white px-10 py-5 rounded-[1.5rem] font-bold text-sm tracking-widest uppercase hover:bg-teal-600 transition-all shadow-xl shadow-navy-950/20 disabled:opacity-50 transform hover:-translate-y-1"
                                >
                                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                                    Sync Account Details
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmployeeDashboard;
