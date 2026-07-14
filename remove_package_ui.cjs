const fs = require('fs');
const path = require('path');

const applyChanges = (filename) => {
    const filePath = path.join('src/pages', filename);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove selectedPackage state and replace its references in useEffect
    content = content.replace(/const \[selectedPackage, setSelectedPackage\] = useState\(state\?.isDayUse \? 'day-use' : 'full-board'\)[\r\n]+/g, '');
    
    content = content.replace(/fetchRoomsByCategory\(([^,]+), selectedPackage,/g, 'fetchRoomsByCategory($1, null,');
    content = content.replace(/fetchRoomsByCategory\(([^,]+),\s*selectedPackage,/g, 'fetchRoomsByCategory($1, null,');

    content = content.replace(/\[selectedPackage, guests, checkIn, checkOut\]/g, '[guests, checkIn, checkOut]');

    // 2. Remove Package Type UI from JSX
    const pkgUiRegex = /<div>\s*<label className="block text-\[10px\] font-bold text-(navy|amber|teal)-400 uppercase tracking-widest mb-1 sm:mb-2">Package Type<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap">/;
    
    content = content.replace(pkgUiRegex, `<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap">`);
    
    content = content.replace(/\{selectedPackage === 'day-use' \? 'Select Date' : 'Check-In'\}/g, 'Check-In');

    const checkOutBlockRegex = /\{selectedPackage !== 'day-use' && \([\s\S]*?<div>[\s\S]*?<label[\s\S]*?Check-Out<\/label>[\s\S]*?<input[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?\)\}/;
    const cleanCheckOutBlock = `<div>
                                    <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">Check-Out</label>
                                    <input type="date" value={checkOut} min={checkIn || today}
                                        onChange={(e) => { setCheckOut(e.target.value); setAvailability(null) }}
                                        className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 bg-white text-sm w-full sm:w-auto transition-all" />
                                </div>`;
    content = content.replace(checkOutBlockRegex, cleanCheckOutBlock);

    content = content.replace(/\{checkIn && checkOut && selectedPackage !== 'day-use' && calcNights\(\) > 0 && \(/g, '{checkIn && checkOut && calcNights() > 0 && (');

    const dayUseBlockRegex = /\{selectedPackage === 'day-use' && checkIn && \([\s\S]*?One Day Visit[\s\S]*?<\/div>[\s\S]*?\)\}/;
    content = content.replace(dayUseBlockRegex, '');

    content = content.replace(/\{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && selectedRoom && \(/g, '{checkIn && checkOut && calcNights() > 0 && selectedRoom && (');
    
    content = content.replace(/\{checkIn && !checkOut && selectedPackage !== 'day-use' && <p/g, '{checkIn && !checkOut && <p');

    // 3. Update handleContactUs logic to remove day-use check
    const handleContactUsRegex = /const handleContactUs = \(\) => \{[\s\S]*?const whatsappUrl = `https:\/\/wa.me\/94764219211\?text=\$\{encodeURIComponent\(text\)\}`;[\s\S]*?window\.open\(whatsappUrl, '_blank'\);[\s\S]*?\}/;
    
    const cleanHandleContactUs = `const handleContactUs = () => {
        if (!selectedRoom || !checkIn || !checkOut) return;

        const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const nights = calcNights();
        const plan = mealPlans.find(p => p.code === mealPlan);
        const planLabel = plan ? plan.label : 'Room Only';
        const totalAmountStr = formatPrice((selectedRoom.price + ((plan?.rate || 0) * parseInt(guests))) * nights);
        
        const text = \`Hello! I would like to book a room at Dutch Point Resort.

*Room:* \${selectedRoom.name}
*Check-In:* \${checkInDate}
*Check-Out:* \${checkOutDate}
*Nights:* \${nights}
*Guests:* \${guests}
*Meal Plan:* \${planLabel}
*Total Estimate:* \${totalAmountStr}

Please let me know the next steps for booking.\`;
        
        const whatsappUrl = \`https://wa.me/94764219211?text=\${encodeURIComponent(text)}\`;
        window.open(whatsappUrl, '_blank');
    }`;
    content = content.replace(handleContactUsRegex, cleanHandleContactUs);

    // 4. Summary UI updates (Details section)
    content = content.replace(/\{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && \(/g, '{checkIn && checkOut && calcNights() > 0 && (');

    content = content.replace(/<div className=\{`rounded-xl px-3 py-2 border \$\{selectedPackage === 'day-use' \? 'col-span-1 sm:col-span-2 bg-(teal|amber)-50 border-\1-100' : 'bg-\1-50 border-\1-100'\}`\}>/g, (match, color) => `<div className="rounded-xl px-3 py-2 border bg-${color}-50 border-${color}-100">`);

    content = content.replace(/\{selectedPackage === 'day-use' \? 'Visit Date' : 'Check-In'\}/g, 'Check-In');

    content = content.replace(/\{selectedPackage === 'day-use' \? DaycheckInTime : checkInTime\}/g, '{checkInTime}');

    const summaryCheckOutBlockRegex = /\{selectedPackage !== 'day-use' && \([\s\S]*?<div className="bg-(teal|amber)-50 rounded-xl px-3 py-2 border border-\1-100">[\s\S]*?<span className="text-xs text-\1-600 font-bold block">Check-Out<\/span>[\s\S]*?<span className="text-navy-800 font-semibold text-sm">\{new Date\(checkOut\)\.toLocaleDateString\('en-US', \{ month: 'short', day: 'numeric', year: 'numeric' \}\)\} \| \{checkOutTime\}<\/span>[\s\S]*?<\/div>[\s\S]*?\)\}/g;
    
    content = content.replace(summaryCheckOutBlockRegex, (match, color) => `<div className="bg-${color}-50 rounded-xl px-3 py-2 border border-${color}-100">
                                                        <span className="text-xs text-${color}-600 font-bold block">Check-Out</span>
                                                        <span className="text-navy-800 font-semibold text-sm">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {checkOutTime}</span>
                                                    </div>`);

    content = content.replace(/\{selectedPackage === 'day-use' \? 'Day Use' : `\$\{calcNights\(\)\} Night\$\{calcNights\(\) > 1 \? 's' : ''\}`\}/g, '{calcNights()} Night{calcNights() > 1 ? \'s\' : \'\'}');

    content = content.replace(/\{selectedPackage === 'day-use' \? formatPrice\(selectedRoom\.price \* parseInt\(guests\)\) : formatPrice\(\(selectedRoom\.price \+ \(\(mealPlans\.find\(p => p\.code === mealPlan\)\?\.rate \|\| 0\) \* parseInt\(guests\)\)\) \* calcNights\(\)\)\}/g, 
    '{formatPrice((selectedRoom.price + ((mealPlans.find(p => p.code === mealPlan)?.rate || 0) * parseInt(guests))) * calcNights())}');

    // Remove conditionally wrapping {selectedPackage !== 'day-use' && ( <div className="mt-4">...</div> )} around the meal plans
    const mealPlanWrapperRegex = /\{selectedPackage !== 'day-use' && \([\s\S]*?<div className="mt-4">[\s\S]*?Select Meal Plan[\s\S]*?<\/div>\s*<\/div>[\s\S]*?\)\}/;
    const cleanMealPlanUI = `<div className="mt-4">
                                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">
                                                    Select Meal Plan
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {mealPlans.map((plan) => (
                                                        <button
                                                            key={plan.code}
                                                            onClick={() => setMealPlan(plan.code)}
                                                            className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 border \${mealPlan === plan.code
                                                                ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-200/50'
                                                                : 'bg-navy-50/50 text-navy-600 border-navy-100 hover:bg-navy-100'
                                                                }\`}
                                                        >
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span>{plan.label}</span>
                                                                {plan.rate > 0 ? (
                                                                    <span className={\`text-[9px] font-medium \${mealPlan === plan.code ? 'text-teal-100' : 'text-navy-400'}\`}>
                                                                        + {formatPrice(plan.rate)}/pp
                                                                    </span>
                                                                ) : (
                                                                    <span className={\`text-[9px] font-medium \${mealPlan === plan.code ? 'text-teal-100' : 'text-navy-400'}\`}>
                                                                        Included
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>`;
    content = content.replace(mealPlanWrapperRegex, cleanMealPlanUI);
    
    // Replace handleCheckInChange
    const checkInChangeRegex = /const handleCheckInChange = \(val\) => \{[\s\S]*?if \(selectedPackage === 'day-use'\) \{[\s\S]*?setCheckOut\(val\)[\s\S]*?\} else if \(checkOut && checkOut <= val\) \{[\s\S]*?setCheckOut\(''\)[\s\S]*?\}[\s\S]*?\}/;
    const cleanCheckInChange = `const handleCheckInChange = (val) => {
        setCheckIn(val)
        setAvailability(null)
        if (checkOut && checkOut <= val) {
            setCheckOut('')
        }
    }`;
    content = content.replace(checkInChangeRegex, cleanCheckInChange);

    // Replace the handleContactUs disabled condition
    const disabledConditionRegex = /disabled=\{!checkIn \|\| \(selectedPackage !== 'day-use' && \(!checkOut \|\| calcNights\(\) <= 0\)\) \|\| availability === false \|\| availability === 'checking' \|\| selectedRoom\?\.isAvailable === false \|\| selectedRoom\?\.status === 'maintenance'\}/;
    const newDisabledCondition = `disabled={!checkIn || !checkOut || calcNights() <= 0 || availability === false || availability === 'checking' || selectedRoom?.isAvailable === false || selectedRoom?.status === 'maintenance'}`;
    content = content.replace(disabledConditionRegex, newDisabledCondition);

    // Replace the handleContactUs button text condition
    const btnTextRegex = /\{selectedRoom\?\.status === 'maintenance' \? 'Maintenance Mode' : selectedRoom\?\.isAvailable === false \? \(selectedRoom\?\.status === 'occupied' \? 'Room Occupied' : 'Room Reserved'\) : !checkIn \? 'Select Date First' : \(selectedPackage !== 'day-use' && !checkOut \? 'Select Check-Out' : 'Contact Us to Book'\)\}/;
    const newBtnText = `{selectedRoom?.status === 'maintenance' ? 'Maintenance Mode' : selectedRoom?.isAvailable === false ? (selectedRoom?.status === 'occupied' ? 'Room Occupied' : 'Room Reserved') : !checkIn ? 'Select Date First' : (!checkOut ? 'Select Check-Out' : 'Contact Us to Book')}`;
    content = content.replace(btnTextRegex, newBtnText);

    fs.writeFileSync(filePath, content, 'utf8');
};

applyChanges('semiLuxuryRooms.jsx');
applyChanges('luxuryRooms.jsx');
console.log('Finished updating UI files.');
