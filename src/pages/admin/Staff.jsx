import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Clock, Banknote, Search, Shield, Trash2, Edit2, X, RefreshCw, Save, QrCode, ScanLine, Users, Calendar, Timer, AlertCircle, AlertTriangle } from 'lucide-react';
import { fetchStaff, createStaff, updateStaff, deleteStaff, fetchTodayAttendance, fetchAttendance, scanAttendance, fetchPayroll } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';
import QRCodeBadge from '../../components/admin_components/QRCodeBadge';
import QRScanner from '../../components/admin_components/QRScanner';

const DEPARTMENTS = ['Operations', 'Kitchen', 'Front Desk', 'Housekeeping', 'Dining', 'Security', 'Maintenance', 'Finance', 'HR'];
const JOB_TITLES = [
    'Hotel Manager',
    'Receptionist',
    'Housekeeper',
    'Chef',
    'Cook / Kitchen Assistant',
    'Waiter / Waitress',
    'Security Guard',
    'Maintenance Technician',
    'Accountant / Cashier',
    'Storekeeper'
];
const EMPTY_FORM = { 
    name: '', email: '', phone: '', jobTitle: JOB_TITLES[0], password: '', 
    department: 'Front Desk', status: 'Active', salary: '', hireDate: '',
    nic: '', address: '', dateOfBirth: '', emergencyContact: '', gender: 'Male'
};

const Staff = () => {
    const { toast, showToast, clearToast } = useToast();
    const [activeTab, setActiveTab] = useState('employees');

    // Employee state
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name') {
            if (!value.trim()) error = 'Name is required';
            else if (value.trim().length < 3) error = 'Min 3 characters';
        }
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) error = 'Email is required';
            else if (!emailRegex.test(value)) error = 'Invalid email format (e.g., user@domain.com)';
        }
        if (name === 'phone') {
            const phoneRegex = /^[0-9]{10}$/;
            if (!value.trim()) error = 'Phone number is required';
            else if (!phoneRegex.test(value)) error = 'Phone must be exactly 10 digits (e.g., 0701234567)';
        }
        if (name === 'jobTitle') {
            if (!value.trim()) error = 'Job title is required';
        }
        if (name === 'salary') {
            if (!value) error = 'Salary is required';
            else if (Number(value) <= 0) error = 'Must be a positive number';
        }
        if (name === 'password' && !editingStaff) {
            if (!value) error = 'Password is required';
            else if (value.length < 6) error = 'Min 6 characters';
        }
        if (name === 'nic') {
            const nicValue = value.trim();
            if (!nicValue) error = 'NIC / ID Number is required';
            // Sri Lankan NIC formats:
            // Old format: 9 digits + 1 letter (e.g., 123456789V)
            // New format: 12 digits (e.g., 199512345678)
            else if (!/^([0-9]{9}[VvXx]|[0-9]{12})$/.test(nicValue)) {
                error = 'Invalid NIC format. Use old format (9 digits + letter) or new format (12 digits)';
            }
        }
        if (name === 'dateOfBirth') {
            if (!value) error = 'Date of Birth is required';
            else {
                const dobDate = new Date(value);
                const today = new Date();
                
                // Check if date is in the past
                if (dobDate >= today) {
                    error = 'Date of Birth must be a past date';
                } else {
                    // Calculate age
                    let age = today.getFullYear() - dobDate.getFullYear();
                    const monthDiff = today.getMonth() - dobDate.getMonth();
                    
                    // Adjust age if birthday hasn't occurred this year yet
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
                        age--;
                    }
                    
                    // Check if employee is at least 18 years old
                    if (age < 18) {
                        error = `Employee must be at least 18 years old (Current age: ${age} years)`;
                    }
                }
            }
        }
        if (name === 'emergencyContact') {
            const contactValue = value.trim();
            const contactRegex = /^(?:[A-Za-z][A-Za-z\s.'-]{1,}\s*-\s*)?0\d{9}$/;

            if (!editingStaff && !contactValue) {
                error = 'Emergency contact is required';
            } else if (contactValue && !contactRegex.test(contactValue)) {
                error = 'Use a name + 10-digit phone number, e.g. John Doe - 0712345678';
            }
        }

        setFormErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateForm = () => {
        const fields = ['name', 'email', 'phone', 'jobTitle', 'department', 'salary', 'password', 'nic', 'dateOfBirth', 'emergencyContact'];
        let isValid = true;
        fields.forEach(f => {
            if (!validateField(f, form[f])) isValid = false;
        });
        return isValid;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone') {
            finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        }
        if (name === 'emergencyContact') {
            finalValue = value;
        }
        setForm(prev => ({ ...prev, [name]: finalValue }));
        validateField(name, finalValue);
    };

    // QR state
    const [qrEmployee, setQrEmployee] = useState(null);
    const [scannerOpen, setScannerOpen] = useState(false);

    // Attendance state
    const [attendanceData, setAttendanceData] = useState({ totalEmployees: 0, present: 0, late: 0, halfDay: 0, absent: 0, records: [] });
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Payroll state
    const [payrollData, setPayrollData] = useState({ payroll: [], totals: {} });
    const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth());
    const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
    const [payrollLoading, setPayrollLoading] = useState(false);

    // ─── Employee CRUD ───────────────────────────────────────────────────
    const loadEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchStaff();
            setEmployees(data);
        } catch (e) {
            console.warn('Staff API not available:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadEmployees(); }, [loadEmployees]);

    const openAdd = () => { 
        setEditingStaff(null); 
        setForm(EMPTY_FORM); 
        setFormErrors({});
        setModalOpen(true); 
    };
    const openEdit = (staff) => {
        setEditingStaff(staff);
        setFormErrors({});
        setForm({
            name: staff.name, email: staff.email, phone: staff.phone || '',
            jobTitle: staff.jobTitle, department: staff.department,
            password: '', // Keep empty when editing unless changing
            status: staff.status, salary: staff.salary, hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : '',
            nic: staff.nic || '', address: staff.address || '', 
            dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '',
            emergencyContact: staff.emergencyContact || '', gender: staff.gender || 'Male'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, salary: Number(form.salary) };
            if (editingStaff) {
                const updated = await updateStaff(editingStaff._id, payload);
                setEmployees(prev => prev.map(s => s._id === updated._id ? updated : s));
                showToast('Staff member updated');
            } else {
                const created = await createStaff(payload);
                setEmployees(prev => [created, ...prev]);
                showToast('Staff member added');
            }
            setModalOpen(false);
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (staff) => {
        setStaffToDelete(staff);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;
        try {
            await deleteStaff(staffToDelete._id);
            setEmployees(prev => prev.filter(s => s._id !== staffToDelete._id));
            showToast('Staff member removed');
            setIsDeleteModalOpen(false);
            setStaffToDelete(null);
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setStaffToDelete(null);
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
        e.department?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Attendance ──────────────────────────────────────────────────────
    const loadAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            if (attendanceDate === today) {
                const data = await fetchTodayAttendance();
                setAttendanceData(data);
            } else {
                const records = await fetchAttendance({ date: attendanceDate });
                const totalEmployees = employees.length;
                const present = records.filter(r => r.status === 'Present').length;
                const late = records.filter(r => r.status === 'Late').length;
                const halfDay = records.filter(r => r.status === 'Half-Day').length;
                setAttendanceData({ totalEmployees, present, late, halfDay, absent: totalEmployees - records.length, records });
            }
        } catch (e) {
            console.warn('Attendance API not available:', e.message);
        } finally {
            setAttendanceLoading(false);
        }
    }, [attendanceDate, employees.length]);

    useEffect(() => {
        if (activeTab === 'attendance') loadAttendance();
    }, [activeTab, loadAttendance]);

    const handleScan = async (employeeId) => {
        const result = await scanAttendance(employeeId);
        loadAttendance(); // refresh the table
        return result;
    };

    // ─── Payroll ─────────────────────────────────────────────────────────
    const loadPayroll = useCallback(async () => {
        setPayrollLoading(true);
        try {
            const data = await fetchPayroll({ month: payrollMonth, year: payrollYear });
            setPayrollData(data);
        } catch (e) {
            console.warn('Payroll API not available:', e.message);
        } finally {
            setPayrollLoading(false);
        }
    }, [payrollMonth, payrollYear]);

    useEffect(() => {
        if (activeTab === 'payroll') loadPayroll();
    }, [activeTab, loadPayroll]);

    // ─── Tabs ────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'employees', label: 'Employee Management', icon: UserPlus },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'payroll', label: 'Payroll', icon: Banknote },
    ];

    // ─── Render: Employees Tab ───────────────────────────────────────────
    const renderEmployees = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-navy-900">Employee Directory</h2>
                <div className="flex gap-2">
                    <button onClick={loadEmployees} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={openAdd} className="bg-navy-900 text-white px-4 py-2 rounded-xl flex items-center hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium">
                        <UserPlus size={16} className="mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
                <div className="p-4 border-b border-navy-50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, title, department..." className="w-full pl-9 pr-4 py-2 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <UserPlus size={40} className="mx-auto text-navy-200 mb-3" />
                        <p className="text-navy-500 font-medium">{employees.length === 0 ? 'No staff yet. Add your first employee.' : 'No results match your search.'}</p>
                        {employees.length === 0 && <button onClick={openAdd} className="mt-3 px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">Add Employee</button>}
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-navy-50 text-navy-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Salary</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-navy-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-navy-100 text-navy-700 rounded-lg text-xs font-mono font-bold">{emp.employeeId || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold mr-3 text-sm">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-navy-900">{emp.name}</div>
                                                <div className="text-xs text-navy-400">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-navy-700">
                                            <Shield size={13} className="mr-1.5 text-navy-400" />
                                            {emp.jobTitle}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-navy-600">{emp.department}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                                            emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>{emp.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-navy-700 font-mono">
                                        {emp.salary ? `Rs. ${Number(emp.salary).toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setQrEmployee(emp)} title="View QR Badge" className="p-2 hover:bg-teal-50 rounded-lg text-navy-400 hover:text-teal-600 transition-colors">
                                                <QrCode size={15} />
                                            </button>
                                            <button onClick={() => openEdit(emp)} title="Edit" className="p-2 hover:bg-navy-100 rounded-lg text-navy-400 hover:text-navy-600 transition-colors"><Edit2 size={15} /></button>
                                            <button onClick={() => handleDelete(emp)} title="Delete" className="p-2 hover:bg-red-50 rounded-lg text-navy-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
    );

    // ─── Render: Attendance Tab ──────────────────────────────────────────
    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-xl font-bold text-navy-900">Daily Attendance</h2>
                <div className="flex gap-2 flex-wrap">
                    <input
                        type="date"
                        value={attendanceDate}
                        onChange={e => setAttendanceDate(e.target.value)}
                        className="border border-navy-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button onClick={loadAttendance} disabled={attendanceLoading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={attendanceLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setScannerOpen(true)}
                        className="bg-linear-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-xl flex items-center hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/25 text-sm font-medium"
                    >
                        <ScanLine size={16} className="mr-2" />
                        Scan QR Code
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-navy-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
                            <Users size={18} className="text-navy-600" />
                        </div>
                        <div>
                            <p className="text-navy-400 text-xs font-medium">Total</p>
                            <p className="text-2xl font-bold text-navy-900">{attendanceData.totalEmployees}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Clock size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-emerald-500 text-xs font-medium">Present</p>
                            <p className="text-2xl font-bold text-emerald-700">{attendanceData.present}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <AlertCircle size={18} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-orange-500 text-xs font-medium">Late</p>
                            <p className="text-2xl font-bold text-orange-700">{attendanceData.late}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Timer size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-amber-500 text-xs font-medium">Half-Day</p>
                            <p className="text-2xl font-bold text-amber-700">{attendanceData.halfDay}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <X size={18} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-red-500 text-xs font-medium">Absent</p>
                            <p className="text-2xl font-bold text-red-700">{attendanceData.absent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
                {attendanceLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : attendanceData.records.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock size={40} className="mx-auto text-navy-200 mb-3" />
                        <p className="text-navy-500 font-medium">No attendance records for this date</p>
                        <p className="text-navy-400 text-sm mt-1">Scan an employee's QR code to record attendance</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-navy-50 text-navy-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Employee ID</th>
                                    <th className="px-6 py-4">Check In</th>
                                    <th className="px-6 py-4">Check Out</th>
                                    <th className="px-6 py-4">Work Hours</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-50">
                                {attendanceData.records.map((record) => (
                                    <tr key={record._id} className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold mr-3 text-xs">
                                                    {(record.employee?.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-navy-900 text-sm">{record.employee?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-navy-400">{record.employee?.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-navy-100 text-navy-700 rounded text-xs font-mono font-bold">{record.employeeId}</span>
                                        </td>
                                        <td className="px-6 py-4 text-navy-600 font-mono text-xs">
                                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-navy-600 font-mono text-xs">
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                                <span className="text-amber-500 italic">Working...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-navy-700">
                                            {record.workHours ? `${record.workHours}h` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                record.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                                record.status === 'Late' ? 'bg-orange-50 text-orange-700' :
                                                record.status === 'Half-Day' ? 'bg-amber-50 text-amber-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Render: Payroll Tab ─────────────────────────────────────────────
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const renderPayroll = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-xl font-bold text-navy-900">Monthly Payroll</h2>
                <div className="flex gap-2 items-center flex-wrap">
                    <select
                        value={payrollMonth}
                        onChange={e => setPayrollMonth(parseInt(e.target.value))}
                        className="border border-navy-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                        value={payrollYear}
                        onChange={e => setPayrollYear(parseInt(e.target.value))}
                        className="border border-navy-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={loadPayroll} disabled={payrollLoading} className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-200 text-navy-600 rounded-xl hover:bg-navy-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50">
                        <RefreshCw size={14} className={payrollLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
                    <p className="text-navy-500 text-sm mb-1">Total Payroll Cost</p>
                    <h3 className="text-3xl font-bold text-navy-900">Rs. {payrollData.totals?.totalPayroll?.toLocaleString() || '0'}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
                    <p className="text-navy-500 text-sm mb-1">Total Deductions</p>
                    <h3 className="text-3xl font-bold text-orange-500">Rs. {payrollData.totals?.totalDeductions?.toLocaleString() || '0'}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
                    <p className="text-navy-500 text-sm mb-1">Employees</p>
                    <h3 className="text-3xl font-bold text-teal-600">{payrollData.totals?.employeeCount || 0}</h3>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
                {payrollLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : payrollData.payroll.length === 0 ? (
                    <div className="text-center py-12">
                        <Banknote size={40} className="mx-auto text-navy-200 mb-3" />
                        <p className="text-navy-500 font-medium">No payroll data for this period</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-navy-50 text-navy-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4 text-center">Days Worked</th>
                                    <th className="px-6 py-4 text-center">Late</th>
                                    <th className="px-6 py-4 text-center">Hours</th>
                                    <th className="px-6 py-4 text-right">Base Salary</th>
                                    <th className="px-6 py-4 text-right">Deductions</th>
                                    <th className="px-6 py-4 text-right">Net Pay</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-50">
                                {payrollData.payroll.map((pay) => (
                                    <tr key={pay._id} className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-navy-900 text-sm">{pay.name}</div>
                                                <div className="text-xs text-navy-400">{pay.employeeId} • {pay.jobTitle}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-navy-600">{pay.department}</td>
                                        <td className="px-6 py-4 text-center text-sm text-navy-700 font-medium">
                                            {pay.presentDays + pay.halfDays * 0.5}<span className="text-navy-400 text-xs">/{pay.workingDays}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-medium ${pay.lateDays > 0 ? 'text-orange-600' : 'text-navy-400'}`}>{pay.lateDays}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-mono text-navy-600">{pay.totalWorkHours}h</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm">Rs. {pay.salary?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm text-red-600">{pay.deductions > 0 ? `-Rs. ${pay.deductions.toLocaleString()}` : 'Rs. 0'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-navy-900 font-mono">Rs. {pay.netPay?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                pay.status === 'Calculated' ? 'bg-emerald-50 text-emerald-700' :
                                                'bg-navy-100 text-navy-500'
                                            }`}>
                                                {pay.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Main Render ─────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
            <div>
                <h1 className="text-2xl font-bold text-navy-900">Staff & HR Management</h1>
                <p className="text-navy-400 mt-0.5 text-sm">Manage employees, QR attendance, and payroll</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-navy-100 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-navy-900 text-white shadow-md'
                            : 'text-navy-600 hover:bg-navy-50'
                            }`}
                    >
                        <tab.icon size={16} className="mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'employees' && renderEmployees()}
                {activeTab === 'attendance' && renderAttendance()}
                {activeTab === 'payroll' && renderPayroll()}
            </div>

            {/* Add / Edit Staff Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-5 border-b border-navy-100 shrink-0">
                            <h2 className="text-xl font-bold text-navy-900">{editingStaff ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-navy-50 rounded-xl text-navy-400"><X size={18} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                                {/* Section 1: Identity & Security */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={14} /> Identity & Security
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Full Name *" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} placeholder="Sarah Wilson" />
                                        <FormInput label="Email Address *" name="email" type="email" value={form.email} onChange={handleFormChange} error={formErrors.email} placeholder="user@domain.com" />
                                        <FormInput label="NIC / ID Number *" name="nic" value={form.nic} onChange={handleFormChange} error={formErrors.nic} placeholder="123456789V or 199512345678" />
                                        <FormInput label="Password *" name="password" type="password" value={form.password} onChange={handleFormChange} error={formErrors.password} placeholder={editingStaff ? "Leave blank to keep current" : "••••••••"} />
                                    </div>
                                </div>

                                {/* Section 2: Professional Details */}
                                <div className="space-y-4 pt-4 border-t border-navy-50">
                                    <h3 className="text-xs font-black text-navy-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={14} /> Professional Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormSelect label="Job Title *" name="jobTitle" value={form.jobTitle} onChange={handleFormChange} options={JOB_TITLES} />
                                        <FormSelect label="Department *" name="department" value={form.department} onChange={handleFormChange} options={DEPARTMENTS} />
                                        <FormInput label="Monthly Salary (Rs.) *" name="salary" type="number" value={form.salary} onChange={handleFormChange} error={formErrors.salary} placeholder="45000" />
                                        <FormInput label="Hire Date" name="hireDate" type="date" value={form.hireDate} onChange={handleFormChange} />
                                        <FormSelect label="Status" name="status" value={form.status} onChange={handleFormChange} options={['Active', 'On Leave', 'Terminated']} />
                                    </div>
                                </div>

                                {/* Section 3: Personal & Sensitive */}
                                <div className="space-y-4 pt-4 border-t border-navy-50">
                                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserPlus size={14} /> Personal & Sensitive Info
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Contact Phone *" name="phone" value={form.phone} onChange={handleFormChange} error={formErrors.phone} placeholder="0701234567" maxLength={10} />
                                        <FormSelect label="Gender" name="gender" value={form.gender} onChange={handleFormChange} options={['Male', 'Female', 'Other']} />
                                        <FormInput label="Date of Birth *" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleFormChange} error={formErrors.dateOfBirth} />
                                        <FormInput label="Emergency Contact *" name="emergencyContact" value={form.emergencyContact} onChange={handleFormChange} error={formErrors.emergencyContact} placeholder="John Doe - 0712345678" />
                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1.5 ml-1">Permanent Address</label>
                                            <textarea 
                                                name="address"
                                                value={form.address} 
                                                onChange={handleFormChange} 
                                                rows="3"
                                                placeholder="Enter full residential address..." 
                                                className="w-full px-4 py-3 bg-navy-50/50 border border-navy-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-navy-50">
                                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 border border-navy-200 text-navy-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-navy-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-3 py-4 bg-navy-900 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-navy-950/20 disabled:opacity-60">
                                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingStaff ? 'Update Record' : 'Create Record'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Badge Modal */}
            {qrEmployee && (
                <QRCodeBadge employee={qrEmployee} onClose={() => setQrEmployee(null)} />
            )}

            {/* QR Scanner Modal */}
            {scannerOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="bg-linear-to-r from-navy-900 to-navy-800 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg">QR Attendance Scanner</h3>
                                <p className="text-teal-400 text-xs font-medium">Scan employee badge to record attendance</p>
                            </div>
                            <button onClick={() => setScannerOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-200 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-navy-900">Delete Employee</h3>
                            <p className="text-sm text-navy-500 mt-1">
                                Are you sure you want to delete <span className="font-semibold text-navy-700">"{staffToDelete?.name}"</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex w-full gap-3 pt-2">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormInput = ({ label, name, value, onChange, error, type = "text", placeholder = "", ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest ml-1">{label}</label>
        <input 
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-navy-50/50 border ${error ? 'border-red-500' : 'border-navy-100'} rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium placeholder:text-navy-200`}
            {...props}
        />
        {error && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-tighter">{error}</p>}
    </div>
);

const FormSelect = ({ label, name, value, onChange, options }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest ml-1">{label}</label>
        <select 
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-navy-50/50 border border-navy-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium appearance-none"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

export default Staff;
