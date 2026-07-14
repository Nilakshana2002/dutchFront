const fs = require('fs');

const path = 'D:/final_give/dutchFront/src/pages/luxuryRooms.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add fetchMealPlans import
content = content.replace(
    "import { fetchRoomsByCategory, checkRoomAvailability, fetchActiveOffers } from '../utils/api'",
    "import { fetchRoomsByCategory, checkRoomAvailability, fetchActiveOffers, fetchMealPlans } from '../utils/api'"
);

// 2. Replace selectedPackage state with mealPlan states
content = content.replace(
    "const [selectedPackage, setSelectedPackage] = useState(state?.isDayUse ? 'day-use' : 'full-board')",
    "const [mealPlans, setMealPlans] = useState([]);\n    const [mealPlan, setMealPlan] = useState('room-only');\n    const [loadingMealPlans, setLoadingMealPlans] = useState(true);"
);

// 3. Add fetchMealPlans useEffect after useNavigate
const navigateTarget = "const navigate = useNavigate()";
const mealPlansEffect = `

    useEffect(() => {
        fetchMealPlans()
            .then(data => {
                setMealPlans(data);
                setLoadingMealPlans(false);
            })
            .catch(err => {
                console.error('Failed to fetch meal plans', err);
                setLoadingMealPlans(false);
            });
    }, []);`;
content = content.replace(navigateTarget, navigateTarget + mealPlansEffect);

// 4. Update the room fetching useEffect
content = content.replace(
    "fetchRoomsByCategory('luxury', selectedPackage, checkIn, checkOut)",
    "fetchRoomsByCategory('luxury', null, checkIn, checkOut)"
);
content = content.replace(
    "}, [selectedPackage, guests, checkIn, checkOut])",
    "}, [guests, checkIn, checkOut])"
);

// 5. Add dynamic pricing
const normalizeTarget = "const roomObj = normalizeRoom(room);";
const dynamicPricing = `const roomObj = normalizeRoom(room);
                    roomObj.price = parseInt(guests) <= 2 ? 35000 : 40000;`;
content = content.replace(normalizeTarget, dynamicPricing);

// 6. Update handleCheckInChange
content = content.replace(
    `if (selectedPackage === 'day-use') {
            setCheckOut(val)
        } else if (checkOut && checkOut <= val) {
            setCheckOut('')
        }`,
    `if (checkOut && checkOut <= val) {
            setCheckOut('')
        }`
);

// 7. Update handleConfirmBooking to handleContactUs
const confirmBookingTarget = `const handleConfirmBooking = () => {
        if (!selectedRoom || !checkIn || (selectedPackage !== 'day-use' && !checkOut)) return
        setShowBookingModal(true)
    }`;
const contactUsFunc = `const handleContactUs = () => {
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
    }`;
content = content.replace(confirmBookingTarget, contactUsFunc);

// 8. Remove the Package Type selector in the UI
const packageUIStart = `<label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1 sm:mb-2">Package Type</label>`;
const packageUIEnd = `</button>
                            </div>
                        </div>`;
const packageUIFull = content.substring(content.indexOf(packageUIStart), content.indexOf(packageUIEnd) + packageUIEnd.length);
if(packageUIFull.includes("Package Type")) {
    content = content.replace(packageUIFull, "");
}

// 9. Update Check-In / Check-Out UI logic to remove day-use
content = content.replace(/{selectedPackage === 'day-use' \? 'Select Date' : 'Check-In'}/g, "'Check-In'");
content = content.replace(/{selectedPackage !== 'day-use' && \(/g, "{true && (");
content = content.replace(/\{checkIn && checkOut && selectedPackage !== 'day-use' && calcNights\(\) > 0 && \(/g, "{checkIn && checkOut && calcNights() > 0 && (");
content = content.replace(/\{selectedPackage === 'day-use' && checkIn && \(/g, "{false && (");
content = content.replace(/\{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && selectedRoom && \(/g, "{checkIn && checkOut && calcNights() > 0 && selectedRoom && (");
content = content.replace(/\{checkIn && !checkOut && selectedPackage !== 'day-use' &&/g, "{checkIn && !checkOut &&");

// 10. Pricing note
content = content.replace(
    `<span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>`,
    `<span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>
                                                    <div className="text-[10px] text-navy-400 mt-1">
                                                        * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                    </div>`
);
content = content.replace(
    `<span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{room.offerTitle}</span>`,
    `<span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{room.offerTitle}</span>
                                                        <div className="text-[10px] text-navy-400 mt-1">
                                                            * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                        </div>`
);

// Sidebar Check-in / Checkout
content = content.replace(/{checkIn && \(selectedPackage === 'day-use' \|\| \(checkOut && calcNights\(\) > 0\)\) && \(/g, "{checkIn && checkOut && calcNights() > 0 && (");
content = content.replace(/\{`rounded-xl px-3 py-2 border \$\{selectedPackage === 'day-use' \? 'col-span-1 sm:col-span-2 bg-amber-50 border-amber-100' : 'bg-amber-50 border-amber-100'\}`\}/g, `"rounded-xl px-3 py-2 border bg-amber-50 border-amber-100"`);
content = content.replace(/\{selectedPackage === 'day-use' \? 'Visit Date' : 'Check-In'\}/g, "'Check-In'");
content = content.replace(/\{new Date\(checkIn\)\.toLocaleDateString\('en-US', \{ month: 'short', day: 'numeric', year: 'numeric' \}\)} \| \{selectedPackage === 'day-use' \? DaycheckInTime : checkInTime\}/g, "{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {checkInTime}");
content = content.replace(/\{selectedPackage === 'day-use' \? 'Day Use' : `\$\{calcNights\(\)\} Night\$\{calcNights\(\) > 1 \? 's' : ''\}`\}/g, "{calcNights()} Night{calcNights() > 1 ? 's' : ''}");

// 11. Add Meal Plans in sidebar, replace Total price logic
const sidebarTotalTarget = `{formatPrice(selectedRoom.price * (selectedPackage === 'day-use' ? 1 : calcNights()))} Total`;
content = content.replace(sidebarTotalTarget, `{formatPrice((selectedRoom.price + ((mealPlans.find(p => p.code === mealPlan)?.rate || 0) * parseInt(guests))) * calcNights())} Total`);

const detailsDivider = `<div className="ornament-divider !my-3"><span>Suite Details</span></div>`;
const mealPlanUI = `
                                        {/* Meal Plans */}
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">
                                                Select Meal Plan
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {mealPlans.map((plan) => (
                                                    <button
                                                        key={plan.code}
                                                        onClick={() => setMealPlan(plan.code)}
                                                        className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 border \${mealPlan === plan.code
                                                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/50'
                                                            : 'bg-navy-50/50 text-navy-600 border-navy-100 hover:bg-navy-100'
                                                            }\`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span>{plan.label}</span>
                                                            {plan.rate > 0 ? (
                                                                <span className={\`text-[9px] font-medium \${mealPlan === plan.code ? 'text-amber-100' : 'text-navy-400'}\`}>
                                                                    + {formatPrice(plan.rate)}/pp
                                                                </span>
                                                            ) : (
                                                                <span className={\`text-[9px] font-medium \${mealPlan === plan.code ? 'text-amber-100' : 'text-navy-400'}\`}>
                                                                    Included
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="ornament-divider !my-3"><span>Suite Details</span></div>`;
content = content.replace(detailsDivider, mealPlanUI);

// Includes list
const includesEndTarget = `</ul>
                                        </div>
                                        <button onClick={handleConfirmBooking}`;
const includesEndReplacement = `
                                                {mealPlans.find(p => p.code === mealPlan)?.includes?.map((item, i) => (
                                                    <li key={\`mp-\${item}\`} className="flex items-start gap-2 text-sm text-navy-600 font-semibold animate-fade-in" style={{ animationDelay: \`\${(selectedRoom.includes?.length + i) * 60}ms\` }}>
                                                        <span className="text-amber-500 mt-0.5 flex-shrink-0">🍽</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button onClick={handleContactUs}`;
content = content.replace(includesEndTarget, includesEndReplacement);

// Contact Us Button
content = content.replace(
    `disabled={!checkIn || (selectedPackage !== 'day-use' && (!checkOut || calcNights() <= 0)) || availability === false || availability === 'checking' || selectedRoom?.isAvailable === false || selectedRoom?.status === 'maintenance'}`,
    `disabled={!checkIn || !checkOut || calcNights() <= 0 || availability === false || availability === 'checking' || selectedRoom?.isAvailable === false || selectedRoom?.status === 'maintenance'}`
);
content = content.replace(
    `{selectedRoom?.status === 'maintenance' ? 'Maintenance Mode' : selectedRoom?.isAvailable === false ? (selectedRoom?.status === 'occupied' ? 'Room Occupied' : 'Room Reserved') : !checkIn ? 'Select Date First' : (selectedPackage !== 'day-use' && !checkOut ? 'Select Check-Out' : 'Confirm Booking')}`,
    `{selectedRoom?.status === 'maintenance' ? 'Maintenance Mode' : selectedRoom?.isAvailable === false ? (selectedRoom?.status === 'occupied' ? 'Room Occupied' : 'Room Reserved') : !checkIn ? 'Select Date First' : (!checkOut ? 'Select Check-Out' : 'Contact Us to Book')}`
);

// Add price note in sidebar
content = content.replace(
    `<span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>`,
    `<span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                    <div className="text-[10px] text-navy-400 mt-1">
                                                        * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                    </div>`
);
content = content.replace(
    `<span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{selectedRoom.offerTitle}</span>`,
    `<span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{selectedRoom.offerTitle}</span>
                                                        <div className="text-[10px] text-navy-400 mt-1">
                                                            * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                        </div>`
);

// Remove BookingModal
const bookingModalRegex = /<BookingModal[\s\S]*?\/>/;
content = content.replace(bookingModalRegex, '');
content = content.replace("import BookingModal from '../components/BookingModal'", "");

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated luxuryRooms.jsx');
