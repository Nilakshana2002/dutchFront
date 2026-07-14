const fs = require('fs');
const path = require('path');

const applyChanges = (filename) => {
    const filePath = path.join('src/pages', filename);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update Imports
    content = content.replace(
        /import \{ fetchRoomsByCategory, checkRoomAvailability, fetchActiveOffers \} from '\.\.\/utils\/api'/,
        `import { fetchRoomsByCategory, checkRoomAvailability, fetchActiveOffers, fetchMealPlans } from '../utils/api'`
    );
    content = content.replace(/import BookingModal from '\.\.\/components\/BookingModal'[\r\n]+/g, '');

    // 2. State definitions
    const stateHookTarget = /const \[selectedRoom, setSelectedRoom\] = useState\(null\)/;
    const stateHookReplacement = `const [selectedRoom, setSelectedRoom] = useState(null)
    const [mealPlans, setMealPlans] = useState([])
    const [mealPlan, setMealPlan] = useState('room-only')
    const [loadingMealPlans, setLoadingMealPlans] = useState(true)`;
    content = content.replace(stateHookTarget, stateHookReplacement);

    content = content.replace(/const \[showBookingModal, setShowBookingModal\] = useState\(false\)[\r\n]+/g, '');

    // 3. fetchMealPlans Hook
    const fetchMealPlansHook = `
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
    }, []);
`;
    content = content.replace(/(const navigate = useNavigate\(\)[\r\n]+)/, `$1${fetchMealPlansHook}`);

    // 4. Replace handleConfirmBooking with handleContactUs
    const handleConfirmRegex = /const handleConfirmBooking = \(\) => \{[\s\S]*?\n\s{4}\}/;
    const handleContactUs = `const handleContactUs = () => {
        if (!selectedRoom || !checkIn || (selectedPackage !== 'day-use' && !checkOut)) return;

        const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const checkOutDate = selectedPackage === 'day-use' ? checkInDate : new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        let nights = 0;
        let totalAmountStr = '';
        let planLabel = '';

        if (selectedPackage === 'day-use') {
            nights = 1;
            planLabel = 'Day Use (No Meals)';
            totalAmountStr = formatPrice(selectedRoom.price * parseInt(guests));
        } else {
            nights = calcNights();
            const plan = mealPlans.find(p => p.code === mealPlan);
            planLabel = plan ? plan.label : 'Room Only';
            totalAmountStr = formatPrice((selectedRoom.price + ((plan?.rate || 0) * parseInt(guests))) * nights);
        }
        
        const text = \`Hello! I would like to book a room at Dutch Point Resort.

*Room:* \${selectedRoom.name}
*Package:* \${selectedPackage === 'day-use' ? 'Day Use' : 'Overnight Stay'}
*Check-In:* \${checkInDate}
\${selectedPackage !== 'day-use' ? \`*Check-Out:* \${checkOutDate}\\n*Nights:* \${nights}\\n\` : ''}*Guests:* \${guests}
*Meal Plan:* \${planLabel}
*Total Estimate:* \${totalAmountStr}

Please let me know the next steps for booking.\`;
        
        const whatsappUrl = \`https://wa.me/94764219211?text=\${encodeURIComponent(text)}\`;
        window.open(whatsappUrl, '_blank');
    }`;
    content = content.replace(handleConfirmRegex, handleContactUs);

    // 5. Remove BookingModal from JSX
    content = content.replace(/<BookingModal[\s\S]*?\/>/g, '');

    // 6. UI Updates
    content = content.replace(/onClick=\{handleConfirmBooking\}/g, 'onClick={handleContactUs}');
    content = content.replace(/'Confirm Booking'/g, "'Contact Us to Book'");

    // Insert Meal Plans selection
    const mealPlanUI = `
                                        {/* Meal Plans */}
                                        {selectedPackage !== 'day-use' && (
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
                                            </div>
                                        )}`;
                                        
    content = content.replace(
        /(<div className="ornament-divider !my-3"><span>Details<\/span><\/div>)/, 
        mealPlanUI + '\n\n                                        $1'
    );

    // Update the Total Price calculation block
    const oldPriceCalc = /\{formatPrice\(selectedRoom\.price \* \(selectedPackage === 'day-use' \? 1 : calcNights\(\)\)\)\} Total/;
    const newPriceCalc = `{selectedPackage === 'day-use' ? formatPrice(selectedRoom.price * parseInt(guests)) : formatPrice((selectedRoom.price + ((mealPlans.find(p => p.code === mealPlan)?.rate || 0) * parseInt(guests))) * calcNights())} Total`;
    content = content.replace(oldPriceCalc, newPriceCalc);

    fs.writeFileSync(filePath, content, 'utf8');
};

applyChanges('semiLuxuryRooms.jsx');
applyChanges('luxuryRooms.jsx');
console.log('Finished updating files.');
