import React, { useState } from 'react';
import { Upload, X, CheckCircle, RefreshCw } from 'lucide-react';

const ImageUpload = ({ onUploadSuccess, currentImage, label }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);


    const CLOUD_NAME = "dztzaoo6r";
    const UPLOAD_PRESET = "hotel_main";

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed. Please check your Cloudinary settings.');
            }

            const data = await response.json();
            onUploadSuccess(data.secure_url);
            setUploading(false);
        } catch (err) {
            console.error('Cloudinary Upload Error:', err);
            setError(err.message);
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">
                {label || 'Upload Image'}
            </label>
            
            <div className="flex items-center gap-4">
                {currentImage ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-navy-100 shadow-sm group">
                        <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                                <Upload size={14} className="text-white" />
                                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                            </label>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <RefreshCw size={16} className="text-navy-900 animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <label className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${error ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-navy-100 bg-navy-50 hover:bg-navy-100'}`}>
                        {uploading ? (
                            <RefreshCw size={20} className="text-navy-400 animate-spin" />
                        ) : (
                            <Upload size={20} className="text-navy-300" />
                        )}
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                    </label>
                )}

                <div className="flex-1">
                    {uploading ? (
                        <p className="text-xs text-navy-400 animate-pulse">Uploading to Cloudinary...</p>
                    ) : currentImage ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle size={14} />
                            <p className="text-xs font-medium">Image Uploaded</p>
                        </div>
                    ) : (
                        <p className="text-xs text-navy-400">JPG, PNG or WEBP (Max 5MB)</p>
                    )}
                    {error && <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
