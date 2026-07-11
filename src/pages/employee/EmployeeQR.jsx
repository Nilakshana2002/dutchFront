import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { fetchMyQRToken } from '../../utils/api';

const EmployeeQR = () => {
    const [qrData, setQrData] = useState(null);
    const [countdown, setCountdown] = useState(90);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const loadToken = useCallback(async (isManual = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMyQRToken();
            setQrData(data);
            setCountdown(data.expiresInSeconds);
            if (isManual) {
                setLastRefreshed(new Date().toLocaleTimeString());
                setTimeout(() => setLastRefreshed(null), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to load QR. Are you logged in?');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and periodic refresh
    useEffect(() => {
        loadToken();
        const refreshInterval = setInterval(() => loadToken(), 90000);
        return () => clearInterval(refreshInterval);
    }, [loadToken]);

    // Countdown timer
    useEffect(() => {
        if (loading || error || !qrData) return;
        
        const tick = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // When countdown hits zero, trigger a reload outside the setter
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(tick);
    }, [loading, error, qrData]);

    // Trigger reload when countdown hits 0
    useEffect(() => {
        if (countdown === 0 && !loading) {
            loadToken();
        }
    }, [countdown, loading, loadToken]);

    const urgency = countdown <= 10 ? 'red' : countdown <= 20 ? 'amber' : 'teal';
    const urgencyColors = {
        red: { ring: 'ring-red-400', text: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
        amber: { ring: 'ring-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
        teal: { ring: 'ring-teal-400', text: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-500' },
    };
    const colors = urgencyColors[urgency];

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-navy-900">My Attendance QR</h1>
                <p className="text-navy-400 mt-1 text-sm">Show this live QR to the scanner for check-in / check-out</p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl">
                <ShieldCheck size={18} className="text-teal-600 flex-shrink-0" />
                <p className="text-sm text-teal-700 font-medium">
                    This QR refreshes every 90 seconds — screenshots cannot be misused
                </p>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
                {loading && !qrData ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-navy-400 text-sm font-medium">Generating secure QR...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 px-6 text-center">
                        <AlertCircle size={40} className="text-red-400" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={() => loadToken(true)}
                            className="px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Employee Info */}
                        <div className="px-6 pt-6 pb-4 text-center border-b border-navy-50">
                            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold text-xl mb-3">
                                {qrData?.name?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-navy-900 text-lg">{qrData?.name}</h3>
                            <p className="text-sm text-navy-500">{qrData?.jobTitle}</p>
                            <span className="inline-block mt-1 px-3 py-0.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full">
                                {qrData?.department}
                            </span>
                            <p className="text-xs text-navy-400 mt-1 font-mono">{qrData?.employeeId}</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center px-6 py-6 relative">
                            <div className={`p-4 bg-white rounded-2xl border-4 ${colors.ring} ring-2 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
                                {qrData?.token && (
                                    <QRCodeSVG
                                        value={qrData.token}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                        bgColor="#ffffff"
                                        fgColor="#0f172a"
                                    />
                                )}
                            </div>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw size={40} className="text-teal-600 animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Countdown */}
                        <div className={`mx-6 mb-4 px-4 py-3 rounded-xl ${colors.bg} flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className={colors.text} />
                                <span className={`text-sm font-semibold ${colors.text}`}>
                                    {countdown <= 10 ? 'Expiring soon!' : 'Refreshes in'}
                                </span>
                            </div>
                            <span className={`text-2xl font-black font-mono ${colors.text}`}>
                                {countdown}s
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mx-6 mb-6 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${colors.bar} transition-all duration-1000`}
                                style={{ width: `${(countdown / 90) * 100}%` }}
                            />
                        </div>

                        {/* Manual refresh */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => loadToken(true)}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 border border-navy-200 text-navy-600 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Refreshing...' : 'Refresh Now'}
                            </button>
                            {lastRefreshed && (
                                <p className="text-center text-[10px] text-teal-600 font-bold uppercase mt-2 animate-bounce">
                                    Last Refreshed at {lastRefreshed}
                                </p>
                            )}
                        </div>
                    </>
                )
}
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-navy-100 p-4 space-y-2">
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">How to use</p>
                <ul className="text-sm text-navy-600 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">1.</span> Open this page on your phone each morning</li>
                    <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">2.</span> Show the QR to the admin scanner for check-in</li>
                    <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">3.</span> Show it again when leaving for check-out</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 font-bold mt-0.5">✗</span> Screenshots will NOT work — the QR must be live</li>
                </ul>
            </div>
        </div>
    );
};

export default EmployeeQR;
