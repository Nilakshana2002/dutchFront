import React, { useState, useEffect } from 'react';
import { XCircle, Activity, Tag, History, Boxes, ShieldAlert, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AssetRegistryModal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    inventoryCategories, 
    updateInventoryItem, 
    createInventoryItem, 
    loadData,
    generateSKU
}) => {
    const [itemCategory, setItemCategory] = useState('Housekeeping');
    const [itemName, setItemName] = useState('');
    const [formSKU, setFormSKU] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (selectedItem) {
            const cat = selectedItem.category;
            const validCat = inventoryCategories[cat] ? cat : (cat === 'Food & Beverage' ? 'Kitchen & Restaurant' : 'Housekeeping');
            setItemCategory(validCat);
            setItemName(selectedItem.name || '');
            setFormSKU(selectedItem.sku || '');
            setImagePreview(selectedItem.imageUrl || null);
        } else {
            setItemCategory('Housekeeping');
            setItemName('');
            setFormSKU(generateSKU('Housekeeping'));
            setImagePreview(null);
        }
    }, [selectedItem, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="bg-navy-900 px-8 py-6 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-white font-bold text-xl">{selectedItem ? 'Modify Inventory Item' : 'New Strategic Asset'}</h3>
                        <p className="text-navy-300 text-xs mt-1">Configure item specifications and tracking parameters.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form id="itemForm" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData);
                        
                        data.category = itemCategory;
                        data.price = Number(data.price) || 0;
                        data.quantity = Number(data.quantity) || 0;
                        data.reorderLevel = Number(data.reorderLevel) || 10;
                        if (imagePreview) data.imageUrl = imagePreview;

                        try {
                            setIsSubmitting(true);
                            if (selectedItem) {
                                await updateInventoryItem(selectedItem._id, data);
                                toast.success('Inventory asset updated');
                            } else {
                                await createInventoryItem(data);
                                toast.success('New asset synchronized');
                            }
                            onClose();
                            loadData();
                        } catch (err) { 
                            toast.error(err.message); 
                        } finally {
                            setIsSubmitting(false);
                        }
                    }} className="p-8 space-y-8">
                        
                        {/* Category Selection Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Inventory Classification</label>
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">Required Selection</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(inventoryCategories).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const isActive = itemCategory === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setItemCategory(key);
                                                if (!selectedItem) setFormSKU(generateSKU(key));
                                            }}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 group ${
                                                isActive 
                                                ? `border-${config.color}-500 bg-${config.color}-50 shadow-lg shadow-${config.color}-500/10` 
                                                : 'border-navy-50 hover:border-navy-200 bg-white'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                                isActive ? `bg-${config.color}-500 text-white` : `bg-${config.color}-50 text-${config.color}-500`
                                            }`}>
                                                <Icon size={20} />
                                            </div>
                                            <p className={`text-xs font-bold leading-tight ${isActive ? 'text-navy-900' : 'text-navy-700'}`}>{key}</p>
                                            <p className="text-[9px] text-navy-400 mt-1 line-clamp-1">{config.examples.split(',')[0]}...</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-3 bg-navy-50 rounded-xl border border-navy-100">
                                <p className="text-[10px] text-navy-600 italic flex items-center gap-2">
                                    <Tag size={12} className="text-navy-400" />
                                    Examples for {itemCategory}: <span className="font-bold not-italic">{(inventoryCategories[itemCategory] || inventoryCategories['Housekeeping']).examples}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-navy-50">
                                    <Activity size={16} className="text-navy-400" />
                                    <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-widest">Primary Identity</h4>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Asset Nomenclature</label>
                                        <div className="space-y-3">
                                            <select 
                                                key={itemCategory}
                                                name="suggestedName"
                                                defaultValue={inventoryCategories[itemCategory]?.suggestedItems.includes(selectedItem?.name) ? selectedItem?.name : (selectedItem?.name ? 'other' : '')}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const input = document.getElementById('customNameInput');
                                                    const container = document.getElementById('customNameContainer');
                                                    setItemName(val === 'other' ? '' : val);
                                                    if (val === 'other') {
                                                        container.style.display = 'block';
                                                        if (input) {
                                                            input.value = '';
                                                            input.focus();
                                                        }
                                                    } else {
                                                        container.style.display = 'none';
                                                        if (input) input.value = val;
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm bg-white transition-all shadow-sm"
                                            >
                                                <option value="">Select an item...</option>
                                                {(inventoryCategories[itemCategory]?.suggestedItems || []).map(item => (
                                                    <option key={item} value={item}>{item}</option>
                                                ))}
                                                <option value="other">+ Other (Type custom name)</option>
                                            </select>
                                            
                                            <div 
                                                id="customNameContainer" 
                                                style={{ display: selectedItem?.name && !inventoryCategories[itemCategory]?.suggestedItems.includes(selectedItem?.name) ? 'block' : 'none' }}
                                                className="animate-in slide-in-from-top-2 duration-300"
                                            >
                                                <label className="block text-[9px] font-bold text-navy-400 uppercase mb-1 ml-1">Custom Item Name</label>
                                                <input 
                                                    id="customNameInput"
                                                    name="name" 
                                                    defaultValue={selectedItem?.name} 
                                                    required 
                                                    onChange={(e) => setItemName(e.target.value)}
                                                    placeholder="Enter unique asset name..."
                                                    className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Stock Keeping Unit (SKU)</label>
                                            <div className="relative">
                                                <input 
                                                    name="sku" 
                                                    value={formSKU}
                                                    onChange={(e) => setFormSKU(e.target.value)}
                                                    required 
                                                    placeholder="INV-XXXXX"
                                                    className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 font-mono text-xs transition-all" 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormSKU(generateSKU(itemCategory))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-navy-400 hover:text-teal-600 transition-colors"
                                                    title="Regenerate SKU"
                                                >
                                                    <History size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Measurement Unit</label>
                                            <select 
                                                name="unit" 
                                                defaultValue={selectedItem?.unit || 'pcs'} 
                                                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm bg-white transition-all"
                                            >
                                                <option value="pcs">Pieces (pcs)</option>
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="liters">Liters (l)</option>
                                                <option value="meters">Meters (m)</option>
                                                <option value="boxes">Boxes</option>
                                                <option value="packets">Packets</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-navy-50">
                                    <Boxes size={16} className="text-navy-400" />
                                    <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-widest">Inventory Metrics</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Initial/Current Stock</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                name="quantity" 
                                                defaultValue={selectedItem?.quantity || 0} 
                                                disabled={!!selectedItem}
                                                required 
                                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all disabled:bg-navy-50 disabled:text-navy-400" 
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-navy-300 uppercase">{selectedItem?.unit || 'unit'}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Critical Reorder Point</label>
                                        <input 
                                            type="number" 
                                            name="reorderLevel" 
                                            defaultValue={selectedItem?.reorderLevel || 10} 
                                            required 
                                            className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1.5 ml-1">Valuation (Cost per Unit in Rs.)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 font-bold text-sm">Rs.</div>
                                            <input 
                                                type="number" 
                                                name="price" 
                                                defaultValue={selectedItem?.price || 0} 
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-navy-100 focus:outline-none focus:ring-4 focus:ring-navy-500/5 focus:border-navy-400 text-sm transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {((inventoryCategories[itemCategory] || inventoryCategories['Housekeeping']).hasExpiry || 
                         (inventoryCategories[itemCategory] || {}).hasWarranty) && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-2 pb-2 border-b border-navy-50">
                                    <ShieldAlert size={16} className="text-teal-500" />
                                    <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-widest">Compliance & Risk Management</h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(inventoryCategories[itemCategory] || inventoryCategories['Housekeeping']).hasExpiry && (
                                        <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                                    <Calendar size={16} />
                                                </div>
                                                <p className="text-xs font-bold text-orange-900 uppercase tracking-tight">Expiry Date Tracking</p>
                                            </div>
                                            <input 
                                                type="date" 
                                                name="expiryDate" 
                                                defaultValue={selectedItem?.expiryDate ? new Date(selectedItem.expiryDate).toISOString().split('T')[0] : ''}
                                                className="w-full px-4 py-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-sm transition-all" 
                                            />
                                            <p className="text-[10px] text-orange-700 mt-2.5 font-bold bg-orange-100/40 p-2 rounded-lg leading-relaxed">
                                                ⚠️ Notice: Expiry date is critical for perishable food ingredients and bar beverage stock.
                                            </p>
                                        </div>
                                    )}



                                    {itemCategory === 'Furniture & Equipment' && (
                                        <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                                    <ShieldCheck size={16} />
                                                </div>
                                                <p className="text-xs font-bold text-teal-900 uppercase tracking-tight">Asset Warranty Information</p>
                                            </div>
                                            <input 
                                                name="warrantyInfo" 
                                                placeholder="e.g. 2 Years Manufacturer, 1 Year Service"
                                                defaultValue={selectedItem?.warrantyInfo}
                                                className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all" 
                                            />
                                            <p className="text-[10px] text-teal-700 mt-2.5 font-bold bg-teal-100/40 p-2 rounded-lg leading-relaxed">
                                                ℹ️ Optional: Leave blank if this specific good does not have a warranty policy.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-8 border-t border-navy-50 flex items-center justify-end gap-4 bg-navy-50/30 flex-shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-xl border border-navy-200 font-bold text-navy-600 hover:bg-white transition-all text-xs"
                    >
                        Cancel
                    </button>
                    <button 
                        form="itemForm"
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl bg-navy-900 text-white font-bold shadow-xl shadow-navy-900/20 hover:bg-navy-800 hover:shadow-navy-900/30 active:scale-95 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processing...' : (selectedItem ? 'Save Changes' : 'Save Asset')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetRegistryModal;
