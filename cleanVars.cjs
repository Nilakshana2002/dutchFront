const fs = require('fs');
let p = 'D:/final_give/dutchFront/src/pages/luxuryRooms.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /const handleCheckInChange = \(val\) => \{\s*setCheckIn\(val\)\s*setAvailability\(null\)\s*if \(selectedPackage === 'day-use'\) \{\s*setCheckOut\(val\)\s*\} else if \(checkOut && checkOut <= val\) \{\s*setCheckOut\(''\)\s*\}\s*\}/g,
    `const handleCheckInChange = (val) => {
        setCheckIn(val)
        setAvailability(null)
        if (checkOut && checkOut <= val) {
            setCheckOut('')
        }
    }`
);

c = c.replace(
    /const handleConfirmBooking = \(\) => \{\s*if \(!selectedRoom \|\| !checkIn \|\| \(selectedPackage !== 'day-use' && !checkOut\)\) return\s*setShowBookingModal\(true\)\s*\}/g,
    `const handleContactUs = () => {
        if (!selectedRoom || !checkIn || !checkOut) return;
        
        const nights = calcNights();
        const basePrice = selectedRoom.price;
        const mp = mealPlans.find(p => p.code === mealPlan);
        const mealPlanRate = mp ? mp.rate : 0;
        const mealPlanLabel = mp ? mp.label : 'Room Only';
        
        const total = (basePrice + (mealPlanRate * parseInt(guests))) * nights;
        
        const message = \`Hello, I would like to book a Luxury Suite.
- Check-in: \${checkIn}
- Check-out: \${checkOut}
- Guests: \${guests}
- Meal Plan: \${mealPlanLabel}
- Total estimated: Rs. \${total.toLocaleString()}

Please confirm availability.\`;

        const waUrl = \`https://wa.me/94770000000?text=\${encodeURIComponent(message)}\`;
        window.open(waUrl, '_blank');
    }`
);

c = c.replace(
    /<div>\s*<label className="block text-\[10px\] font-bold text-navy-400 uppercase tracking-widest mb-1 sm:mb-2">Package Type<\/label>\s*<div className="inline-flex rounded-2xl bg-navy-50\/80 p-1 border border-navy-100\/50">\s*<button onClick=\{\(\) => setSelectedPackage\('full-board'\)\}\s*className=\{`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 \$\{selectedPackage === 'full-board' \? 'bg-amber-500 text-white shadow-lg shadow-amber-200\/50' : 'text-navy-600 hover:text-navy-900 hover:bg-white\/60'\}`\}>\s*Full Board\s*<\/button>\s*<button onClick=\{\(\) => setSelectedPackage\('day-use'\)\}\s*className=\{`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 \$\{selectedPackage === 'day-use' \? 'bg-amber-500 text-white shadow-lg shadow-amber-200\/50' : 'text-navy-600 hover:text-navy-900 hover:bg-white\/60'\}`\}>\s*Day Use\s*<\/button>\s*<\/div>\s*<\/div>/g,
    ""
);

c = c.replace(/\{selectedPackage === 'day-use' \? 'Select Date' : 'Check-In'\}/g, "'Check-In'");
c = c.replace(/\{selectedPackage !== 'day-use' && \(/g, "{true && (");
c = c.replace(/\{checkIn && checkOut && selectedPackage !== 'day-use' && calcNights\(\) > 0 && \(/g, "{checkIn && checkOut && calcNights() > 0 && (");
c = c.replace(/\{selectedPackage === 'day-use' && checkIn && \(/g, "{false && (");
c = c.replace(/\{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && selectedRoom && \(/g, "{checkIn && checkOut && calcNights() > 0 && selectedRoom && (");
c = c.replace(/\{checkIn && !checkOut && selectedPackage !== 'day-use' &&/g, "{checkIn && !checkOut &&");
c = c.replace(/\{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && \(/g, "{checkIn && checkOut && calcNights() > 0 && (");
c = c.replace(/\{`rounded-xl px-3 py-2 border \$\{selectedPackage === 'day-use' \? 'col-span-1 sm:col-span-2 bg-amber-50 border-amber-100' : 'bg-amber-50 border-amber-100'\}`\}/g, `"rounded-xl px-3 py-2 border bg-amber-50 border-amber-100"`);
c = c.replace(/\{selectedPackage === 'day-use' \? 'Visit Date' : 'Check-In'\}/g, "'Check-In'");
c = c.replace(/\{new Date\(checkIn\)\.toLocaleDateString\('en-US', \{ month: 'short', day: 'numeric', year: 'numeric' \}\)} \| \{selectedPackage === 'day-use' \? DaycheckInTime : checkInTime\}/g, "{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {checkInTime}");
c = c.replace(/\{selectedPackage === 'day-use' \? 'Day Use' : `\$\{calcNights\(\)\} Night\$\{calcNights\(\) > 1 \? 's' : ''\}`\}/g, "{calcNights()} Night{calcNights() > 1 ? 's' : ''}");

fs.writeFileSync(p, c, 'utf8');
console.log('Cleanup complete');
