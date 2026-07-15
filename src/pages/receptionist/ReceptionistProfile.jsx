import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { fetchMyProfile, updateMyProfile } from '../../utils/api';
import Toast from '../../components/admin_components/Toast';
import { useToast } from '../../components/admin_components/useToast';

const ReceptionistProfile = () => {
    const { toast, showToast, clearToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staff, setStaff] = useState(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', phone: '', password: '', photoURL: ''
    });

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await fetchMyProfile();
            setStaff(data);
            setForm({
                firstName: data.user?.firstName || '',
                lastName: data.user?.lastName || '',
                phone: data.user?.phone || '',
                photoURL: data.user?.photoURL || '',
                password: ''
            });
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateMyProfile(form);
            showToast('Profile updated successfully');
            loadProfile();
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-navy-400">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
            
            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-navy-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-teal-500/20">
                            {form.photoURL ? (
                                <img src={form.photoURL} alt="Profile" className="w-full h-full object-cover rounded-[2rem]" />
                            ) : (
                                form.firstName.charAt(0)
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg border-2 border-white">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-navy-950 font-serif">{form.firstName} {form.lastName}</h2>
                        <p className="text-teal-600 font-bold uppercase tracking-widest text-xs mt-2">{staff?.jobTitle} • {staff?.department}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                            <div className="px-4 py-2 bg-navy-50 rounded-xl text-navy-600 text-xs font-bold flex items-center gap-2">
                                <Mail size={14} className="text-navy-400" /> {staff?.email}
                            </div>
                            <div className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">
                                ID: {staff?.employeeId}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="First Name" value={form.firstName} onChange={v => setForm({...form, firstName: v})} />
                        <Field label="Last Name" value={form.lastName} onChange={v => setForm({...form, lastName: v})} />
                        <Field label="Contact Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} />
                        <Field label="Security Credentials (Password)" value={form.password} onChange={v => setForm({...form, password: v})} type="password" placeholder="New password" />
                        <div className="md:col-span-2">
                            <Field label="Profile Image URL" value={form.photoURL} onChange={v => setForm({...form, photoURL: v})} placeholder="https://..." />
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-navy-50 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-navy-950 text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-teal-600 transition-all shadow-xl shadow-navy-950/20 disabled:opacity-50 flex items-center gap-3"
                        >
                            {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                            Save Profile Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, type = "text", placeholder = "" }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] px-1">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 bg-navy-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy-900 placeholder:text-navy-200"
        />
    </div>
);

export default ReceptionistProfile;
