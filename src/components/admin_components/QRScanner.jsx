import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RotateCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    const startScanner = async () => {
        setError(null);
        setResult(null);

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    // Pause scanning on success
                    await scanner.pause();
                    setLoading(true);

                    try {
                        const response = await onScan(decodedText);
                        setResult(response);
                    } catch (err) {
                        setError(err.message || 'Scan failed');
                    } finally {
                        setLoading(false);
                    }
                },
                () => {} // ignore errors during scanning
            );

            setScanning(true);
        } catch (err) {
            setError('Could not access camera. Please allow camera permissions.');
            console.error('Scanner error:', err);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2 || state === 3) { // SCANNING or PAUSED
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.warn('Stop scanner error:', err);
            }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const resetScanner = async () => {
        setResult(null);
        setError(null);
        if (scannerRef.current) {
            try {
                await scannerRef.current.resume();
            } catch {
                await stopScanner();
                await startScanner();
            }
        } else {
            await startScanner();
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Camera Feed */}
            <div className="relative rounded-2xl overflow-hidden bg-navy-900 border border-navy-200" ref={containerRef}>
                <div id="qr-reader" className="w-full" style={{ minHeight: scanning ? '300px' : '0px' }} />

                {!scanning && !result && !error && (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center mb-4">
                            <Camera size={36} className="text-teal-400" />
                        </div>
                        <p className="text-white font-medium text-center">Click Start to open camera</p>
                        <p className="text-navy-400 text-sm mt-1 text-center">Point the camera at an employee's QR badge</p>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center gap-3 py-4 bg-navy-50 rounded-xl border border-navy-100">
                    <Loader2 size={20} className="text-teal-600 animate-spin" />
                    <span className="text-navy-600 font-medium text-sm">Processing scan...</span>
                </div>
            )}

            {/* Success Result */}
            {result && !loading && (
                <div className={`p-4 rounded-xl border-2 ${
                    result.action === 'check-in'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={24} className={result.action === 'check-in' ? 'text-emerald-600' : 'text-blue-600'} />
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm ${result.action === 'check-in' ? 'text-emerald-800' : 'text-blue-800'}`}>
                                {result.action === 'check-in' ? '✓ Checked In' : '✓ Checked Out'}
                            </h4>
                            <p className="text-sm mt-1 text-navy-700 font-medium">{result.employee?.name}</p>
                            <p className="text-xs text-navy-500">{result.employee?.department} • {result.employee?.jobTitle}</p>
                            <p className="text-xs text-navy-400 mt-1">{result.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Result */}
            {error && !loading && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                    <div className="flex items-start gap-3">
                        <XCircle size={24} className="text-red-600" />
                        <div>
                            <h4 className="font-bold text-sm text-red-800">Scan Failed</h4>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
                {!scanning ? (
                    <button
                        onClick={startScanner}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        <Camera size={16} />
                        Start Scanner
                    </button>
                ) : (
                    <button
                        onClick={stopScanner}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        <CameraOff size={16} />
                        Stop Scanner
                    </button>
                )}

                {(result || error) && (
                    <button
                        onClick={resetScanner}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-navy-200 text-navy-600 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors"
                    >
                        <RotateCcw size={16} />
                        Scan Next
                    </button>
                )}

                {onClose && (
                    <button
                        onClick={() => { stopScanner(); onClose(); }}
                        className="px-6 py-3 border border-navy-200 text-navy-600 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
