import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, User, Clock } from 'lucide-react';

const QRCodeBadge = ({ employee, onClose }) => {
    const badgeRef = useRef(null);

    if (!employee) return null;

    const handlePrint = () => {
        const content = badgeRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Employee Badge - ${employee.name}</title>
                <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Segoe UI', sans-serif; background: #f8fafc; }
                    .badge { width: 320px; padding: 32px; border: 2px solid #0f172a; border-radius: 16px; text-align: center; background: white; }
                    .logo { font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
                    .subtitle { font-size: 10px; color: #14b8a6; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
                    .name { font-size: 20px; font-weight: 700; color: #0f172a; margin: 16px 0 4px; }
                    .role { font-size: 12px; color: #64748b; }
                    .dept { display: inline-block; padding: 4px 12px; background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 600; border-radius: 20px; margin-top: 8px; }
                    .id { font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace; margin-top: 16px; letter-spacing: 2px; }
                    .qr-container { margin: 16px auto; }
                    @media print { body { background: white; } }
                </style>
            </head>
            <body>
                <div class="badge">
                    <div class="logo">Dutch-Point</div>
                    <div class="subtitle">Hotel & Resort</div>
                    <div class="qr-container">${content.querySelector('.qr-wrapper').innerHTML}</div>
                    <div class="name">${employee.name}</div>
                    <div class="role">${employee.jobTitle}</div>
                    <div class="dept">${employee.department}</div>
                    <div class="id">${employee.employeeId}</div>
                </div>
            </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => { win.print(); }, 500);
    };

    const handleDownload = () => {
        const svg = badgeRef.current?.querySelector('.qr-wrapper svg');
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
            a.download = `QR-${employee.employeeId}-${employee.name.replace(/\s+/g, '_')}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]" ref={badgeRef}>
                {/* Header */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg">Employee Badge</h3>
                        <p className="text-teal-400 text-xs font-medium tracking-wider uppercase">QR Code ID Card</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Badge Content */}
                <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
                        <User size={28} className="text-teal-700" />
                    </div>

                    <h4 className="text-xl font-bold text-navy-900">{employee.name}</h4>
                    <p className="text-sm text-navy-500 mt-0.5">{employee.jobTitle}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full">
                        {employee.department}
                    </span>

                    {/* QR Code — Permanent Identification */}
                    <div className="mt-6 mb-4 flex flex-col items-center qr-wrapper">
                        <div className="p-4 bg-white border-2 border-navy-100 rounded-2xl shadow-sm mb-4">
                            <QRCodeSVG
                                value={`ID:${employee.employeeId}`}
                                size={160}
                                level="H"
                                includeMargin={false}
                                bgColor="#ffffff"
                                fgColor="#0f172a"
                            />
                        </div>
                        
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center w-full">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
                                <Clock size={10} /> Attendance Notice
                            </p>
                            <p className="text-[10px] text-amber-700 mt-1 leading-tight">
                                This static QR is for ID only. Use <strong>Live QR</strong> from the Employee Portal for attendance.
                            </p>
                        </div>
                    </div>

                    <p className="text-lg font-bold text-navy-900 font-mono tracking-widest">{employee.employeeId}</p>
                    <p className="text-xs text-navy-400 mt-1">Scan for attendance check-in / check-out</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-navy-200 text-navy-600 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors"
                    >
                        <Download size={15} />
                        Download
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        <Printer size={15} />
                        Print Badge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeBadge;
