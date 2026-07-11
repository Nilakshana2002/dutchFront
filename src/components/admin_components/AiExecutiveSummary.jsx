import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    TrendingUp, 
    TrendingDown, 
    AlertCircle, 
    Brain, 
    Zap, 
    PlayCircle,
    Square
} from 'lucide-react';
import { fetchAiSummary } from '../../utils/api';

const AiExecutiveSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePillar, setActivePillar] = useState('financial');
    const [streamIndex, setStreamIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);

    const loadSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAiSummary();
            setSummary(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
        
        
        const handleVoicesChanged = () => {
            setAvailableVoices(window.speechSynthesis.getVoices());
        };
        
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        handleVoicesChanged(); // Initial call

        return () => {
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const handleVoiceBriefing = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const text = summary?.pillars[activePillar];
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Priority search for Sinhala voices
            const sinhalaVoice = availableVoices.find(v => 
                v.lang.includes('si') || 
                v.lang.includes('SI') || 
                v.name.toLowerCase().includes('sinhala')
            );

            if (sinhalaVoice) {
                utterance.voice = sinhalaVoice;
            }
            
            utterance.lang = 'si-LK';
            utterance.pitch = 1;
            utterance.rate = 0.9; 

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                setIsSpeaking(false);
            };

            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Thought stream animation loop
    useEffect(() => {
        if (loading && !summary) {
            const interval = setInterval(() => {
                setStreamIndex((prev) => (prev + 1) % 4);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [loading, summary]);

    const thoughts = summary?.thoughtStream || [
        "Analyzing booking velocity...",
        "Cross-referencing revenue streams...",
        "Synthesizing operational data...",
        "Preparing companion briefing..."
    ];

    const getMoodColor = (mood) => {
        switch (mood) {
            case 'growth': return 'from-teal-500/20 to-emerald-500/20 text-emerald-700 border-emerald-200';
            case 'caution': return 'from-amber-500/20 to-orange-500/20 text-orange-700 border-orange-200';
            default: return 'from-blue-500/20 to-indigo-500/20 text-indigo-700 border-indigo-200';
        }
    };

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span className="font-bold text-red-700">AI Butler Error</span>
                <button onClick={loadSummary} className="ml-auto underline font-bold">Retry Connection</button>
            </div>
            <p className="text-xs text-red-500 ml-7 italic">"{error}"</p>
        </div>
    );

    return (
        <div className="relative overflow-hidden bg-white rounded-3xl border border-navy-100 shadow-sm transition-all duration-500 hover:shadow-xl">
            {/* Animated Background Pulse */}
            <AnimatePresence>
                {!loading && summary && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute inset-0 bg-gradient-to-br ${getMoodColor(summary.mood)} opacity-30 z-0`}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative z-10 p-6 border-b border-navy-50 flex items-center justify-between bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-navy-900 flex items-center justify-center text-white shadow-lg shadow-navy-200">
                        <Brain size={20} className={loading ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
                            AI Companion
                            <Sparkles size={16} className="text-amber-500 animate-bounce" />
                        </h2>
                        <p className="text-xs text-navy-400 font-medium">Real-time intelligence dashboard</p>
                    </div>
                </div>
                {!loading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-navy-100 rounded-full shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-bold text-navy-600 uppercase tracking-widest">Live Score: {summary?.score}%</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative z-10 p-6 min-h-[320px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        {/* The "Thinking" Animation */}
                        <div className="relative w-24 h-24">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="absolute inset-0 border-4 border-dashed border-teal-500/30 rounded-full"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-4 bg-navy-900 rounded-3xl flex items-center justify-center text-white shadow-xl"
                            >
                                <Zap size={32} />
                            </motion.div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-navy-900 animate-pulse">{thoughts[streamIndex]}</p>
                            <p className="text-[10px] text-navy-400 uppercase tracking-widest mt-2">Connecting to Neural Engine...</p>
                        </div>
                        
                        {/* Scan Line Animation */}
                        <motion.div 
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_rgba(45,212,191,0.5)] z-20"
                        />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Pillars Tabs */}
                        <div className="flex bg-navy-50 p-1 rounded-2xl border border-navy-100 w-fit">
                            {['financial', 'operational', 'guestExperience'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivePillar(p)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activePillar === p ? 'bg-white text-navy-900 shadow-md' : 'text-navy-400 hover:text-navy-600'}`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1')}
                                </button>
                            ))}
                        </div>

                       
                        <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-sm">
                            <p className="text-sm leading-relaxed text-navy-800 font-medium whitespace-pre-wrap">
                                {summary.pillars[activePillar]}
                            </p>
                        </div>

                        
                        <div>
                            <h4 className="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles size={12} className="text-amber-500" />
                                Smart Recommendations
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {summary.recommendations.map((rec, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-white/50 backdrop-blur-sm border border-navy-100 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-teal-500"
                                    >
                                        <p className="text-xs font-bold text-navy-900 leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer Briefing Button */}
            <div className="relative z-10 p-4 bg-navy-900/5 backdrop-blur-md border-t border-navy-50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-navy-400">Data synthesized from 5 integrated modules</p>
                <button 
                    onClick={handleVoiceBriefing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-md active:scale-95 ${isSpeaking ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-navy-900 text-white hover:bg-teal-700'}`}
                >
                    {isSpeaking ? (
                        <>
                            <Square size={14} fill="white" />
                            Stop Briefing
                        </>
                    ) : (
                        <>
                            <PlayCircle size={14} />
                            Voice Briefing
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AiExecutiveSummary;
