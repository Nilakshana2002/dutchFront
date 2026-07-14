import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchRoomsByCategory, checkRoomAvailability, fetchActiveOffers, fetchMealPlans } from '../utils/api'
import Footer from '../components/Footer'
import BookingModal from '../components/BookingModal'

const today = new Date().toISOString().split('T')[0]
const checkInTime = "12:00 PM - 2:00 PM";
const checkOutTime = "9:00 AM - 11:00 AM";
const DaycheckInTime = "9:00 AM - 7:00 PM";

const FALLBACK_IMAGES = [
    'https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325411/unnamed_7_zt9tzo.webp'
]



const getGalleryImages = (room) => {
    const base = room.images?.length ? room.images : []
    const combined = room.image && !base.includes(room.image) ? [room.image, ...base] : base
    const unique = [...new Set(combined.filter(Boolean))]
    let fallbackIdx = 0
    while (unique.length < 4 && fallbackIdx < FALLBACK_IMAGES.length) {
        const fb = FALLBACK_IMAGES[fallbackIdx]
        if (!unique.includes(fb)) {
            unique.push(fb)
        }
        fallbackIdx++
    }
    return unique.slice(0, 4)
}

const HeroParticles = ({ color = 'rgba(96, 165, 250, 0.3)' }) => (
    <>
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                className="particle"
                style={{
                    width: `${4 + Math.random() * 6}px`,
                    height: `${4 + Math.random() * 6}px`,
                    background: color,
                    left: `${10 + i * 15}%`,
                    bottom: `${10 + Math.random() * 30}%`,
                    animationDuration: `${4 + Math.random() * 4}s`,
                    animationDelay: `${i * 0.7}s`,
                }}
            />
        ))}
    </>
)

const StandardRooms = () => {
    const location = useLocation()
    const { state } = location

    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [mealPlans, setMealPlans] = useState([])
    const [mealPlan, setMealPlan] = useState('room-only')
    const [loadingMealPlans, setLoadingMealPlans] = useState(true)
    const [checkIn, setCheckIn] = useState(state?.checkIn || '')
    const [checkOut, setCheckOut] = useState(state?.checkOut || '')
    const [guests, setGuests] = useState(state?.guests || '1')
    const [availability, setAvailability] = useState(null)
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const navigate = useNavigate()

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

    const openLightbox = (idx) => setLightboxIndex(idx)
    const closeLightbox = () => setLightboxIndex(null)
    const lightboxPrev = useCallback(() => setLightboxIndex(i => (i - 1 + 4) % 4), [])
    const lightboxNext = useCallback(() => setLightboxIndex(i => (i + 1) % 4), [])

    useEffect(() => {
        if (lightboxIndex === null) return
        const handler = (e) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') lightboxPrev()
            if (e.key === 'ArrowRight') lightboxNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [lightboxIndex, lightboxPrev, lightboxNext])


    const normalizeRoom = (room) => ({
        ...room,
        tagline: room.tagline || room.description || '',
        tags: [...new Set([...(room.tags || []), ...(room.features || [])])].slice(0, 4),
        capacity: room.capacity || `${room.guests || 2} Guests`,
        size: room.size || '',
        badge: room.badge || (room.view ? `${room.view} view` : 'Standard'),
        badgeColor: room.badgeColor || 'bg-blue-500',
        facilities: [
            ...(room.facilities || []),
            ...(room.features || []).filter(f => !(room.facilities || []).some(fac => fac.label === f)).map(f => ({ icon: '', label: f }))
        ],
        includes: room.includes || [],
    })
    
    useEffect(() => {
        setLoading(true)
        setError(null)
        setSelectedRoom(null)
        setAvailability(null)
        
        Promise.all([
            fetchRoomsByCategory('standard', null, checkIn, checkOut),
            fetchActiveOffers().catch(() => []) // fail gracefully if offers can't be fetched
        ])
            .then(([data, activeOffers]) => {
                const normalized = data.map(room => {
                    const roomObj = normalizeRoom(room);
                    
                    roomObj.baseRoomPrice = roomObj.price;
                    
                    // Check if there's an applicable offer for this room type and checkIn date
                    if (checkIn && activeOffers.length > 0) {
                        const checkInDate = new Date(checkIn);
                        const applicableOffer = activeOffers.find(offer => {
                            const start = new Date(offer.startDate);
                            const end = new Date(offer.endDate);
                            return offer.applicableRoomTypes.includes('standard') &&
                                   checkInDate >= start && checkInDate <= end;
                        });

                        if (applicableOffer) {
                            roomObj.originalPrice = roomObj.price;
                            roomObj.price = roomObj.price - (roomObj.price * (applicableOffer.discountPercentage / 100));
                            roomObj.hasOffer = true;
                            roomObj.offerTitle = `${applicableOffer.discountPercentage}% OFF - ${applicableOffer.title.toUpperCase()}`;
                        }
                    }
                    return roomObj;
                });
                const filtered = normalized.filter(room => room.guests >= parseInt(guests));
                setRooms(filtered);
            })
            .catch(() => setError('Unable to load rooms. Please try again.'))
            .finally(() => setLoading(false))
    }, [guests, checkIn, checkOut])

    const handleSelectRoom = (room) => {
        setSelectedRoom(room)
        setAvailability(null)
    }

    const handleCheckInChange = (val) => {
        setCheckIn(val)
        setAvailability(null)
        if (checkOut && checkOut <= val) {
            setCheckOut('')
        }
    }

    const handleCheckAvailability = async () => {
        if (!selectedRoom || !checkIn || !checkOut) return
        setAvailability('checking')
        try {
            const result = await checkRoomAvailability(selectedRoom._id, checkIn, checkOut)
            setAvailability(result.available)
        } catch {
            setAvailability(false)
        }
    }

    const handleContactUs = () => {
        if (!selectedRoom || !checkIn || !checkOut) return;

        const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const nights = calcNights();
        const plan = mealPlans.find(p => p.code === mealPlan);
        const planLabel = plan ? plan.label : 'Room Only';
        const totalAmount = formatPrice((selectedRoom.price + ((plan?.rate || 0) * parseInt(guests))) * nights);
        
        const text = `Hello! I would like to book a room at Dutch Point Resort.

*Room:* ${selectedRoom.name}
*Check-In:* ${checkInDate}
*Check-Out:* ${checkOutDate}
*Nights:* ${nights}
*Guests:* ${guests}
*Meal Plan:* ${planLabel}
*Total Estimate:* ${totalAmount}

Please let me know the next steps for booking.`;
        
        const whatsappUrl = `https://wa.me/94764219211?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }



    const calcNights = () => {
        if (!checkIn || !checkOut) return 0
        const diff = new Date(checkOut) - new Date(checkIn)
        return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
    }



    const formatPrice = (price) => `Rs. ${price.toLocaleString()}`

    return (
        <div className="min-h-screen bg-gradient-to-b from-navy-50 via-white to-navy-50/30">
            {/*photo shower*/}
            {lightboxIndex !== null && selectedRoom && (() => {
                const imgs = getGalleryImages(selectedRoom)
                return (
                    <div
                        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in"
                        onClick={closeLightbox}
                    >
                        <button onClick={closeLightbox} className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center text-2xl font-bold transition-colors z-10">×</button>
                        <button onClick={(e) => { e.stopPropagation(); lightboxPrev() }} className="absolute left-4 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors z-10">‹</button>
                        <img src={imgs[lightboxIndex]} alt={`${selectedRoom.name} photo ${lightboxIndex + 1}`} className="max-h-[88vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none" onClick={(e) => e.stopPropagation()} />
                        <button onClick={(e) => { e.stopPropagation(); lightboxNext() }} className="absolute right-4 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors z-10">›</button>
                        <div className="absolute bottom-5 flex gap-2">
                            {imgs.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }} className={`w-2.5 h-2.5 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
                            ))}
                        </div>
                    </div>
                )
            })()}

            {/*banner*/}
            <section className="relative h-64 sm:h-80 md:h-[28rem] flex items-end overflow-hidden hero-sweep">
                <div
                    className="absolute inset-0 bg-cover bg-center animate-hero-zoom"
                    style={{
                        backgroundImage:
                            "url('https://res.cloudinary.com/dztzaoo6r/image/upload/v1774813035/r3-4_ayc1bx.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-800/50 to-navy-900/20" />
                <HeroParticles color="rgba(96, 165, 250, 0.35)" />


                <div className="hidden sm:block absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-2xl z-10 animate-fade-in" />
                <div className="hidden sm:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-2xl z-10 animate-fade-in" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full">

                    <nav className="breadcrumb-trail mb-4 animate-fade-in">
                        <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
                        <span className="text-white/30">›</span>
                        <span className="text-white/80">Standard Rooms</span>
                    </nav>

                    <span className="inline-block px-4 py-1.5 bg-blue-500/90 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 backdrop-blur-sm animate-badge-pulse animate-fade-in-up">
                        ★ Standard Collection
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-200">
                        Standard{' '}
                        <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent italic animate-gradient-text">
                            Rooms
                        </span>
                    </h1>
                    <p className="text-white/70 mt-3 text-base sm:text-lg max-w-xl animate-fade-in-up animation-delay-400 leading-relaxed">
                        Enjoy premium comfort with exclusive amenities at Dutch Point Resort.
                    </p>

                    {/* Stats bar */}
                    <div className="flex flex-wrap gap-4 sm:gap-8 mt-6 animate-fade-in-up animation-delay-600">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">Room Service</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">4.8★</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">Guest Rating</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">Direct Beach</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">Access</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Package Selector*/}
            <section className="bg-white/80 backdrop-blur-md border-b border-navy-100/50 shadow-sm sm:sticky sm:top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        {/* Inline date selectors */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap">
                            <div>
                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">
                                    Check-In
                                </label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    min={today}
                                    onChange={(e) => handleCheckInChange(e.target.value)}
                                    className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-white text-sm w-full sm:w-auto transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">
                                    Check-Out
                                </label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    min={checkIn || today}
                                    onChange={(e) => { setCheckOut(e.target.value); setAvailability(null) }}
                                    className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-white text-sm w-full sm:w-auto transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">
                                    Guests
                                </label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-white text-sm w-full sm:w-auto transition-all cursor-pointer"
                                >
                                    <option value="1">1 Guest</option>
                                    <option value="2">2 Guests</option>
                                    <option value="3">3 Guests</option>
                                    <option value="4">4 Guests</option>
                                    <option value="5">5+ Guests</option>
                                </select>
                            </div>
                            {checkIn && checkOut && calcNights() > 0 && (
                                <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                                    <span className="text-blue-700 font-bold text-sm">{calcNights()} Night{calcNights() > 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {checkIn && checkOut && calcNights() > 0 && selectedRoom && (
                                <button
                                    onClick={handleCheckAvailability}
                                    disabled={availability === 'checking'}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-navy-900 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-navy-700 transition-all duration-200 shadow-md disabled:opacity-60"
                                >
                                    {availability === 'checking' ? 'Checking…' : 'Check Availability'}
                                </button>
                            )}
                            {!checkIn && (
                                <p className="text-sm text-navy-400 italic py-2">Select stay date</p>
                            )}
                            {checkIn && !checkOut && (
                                <p className="text-sm text-navy-400 italic py-2">Select check-out date</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/*main contendt*/}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                {/*horizontal line*/}
                <div className="ornament-divider mb-10">
                    <span>✦ Our Standard Collection ✦</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Room List */}
                    <div className="lg:w-3/5 space-y-6">
                        <div className="flex items-end justify-between mb-2">
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900 mb-1">Select Your Room</h2>
                                <p className="text-navy-500 text-sm">Click a room card to preview facilities and package details.</p>
                            </div>
                            {!loading && !error && (
                                <span className="text-navy-400 text-xs font-semibold bg-navy-50 px-3 py-1 rounded-full animate-count">
                                    {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {loading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-transparent animate-pulse">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-48 h-48 bg-navy-100 flex-shrink-0" />
                                            <div className="flex-1 p-6 space-y-3">
                                                <div className="h-5 bg-navy-100 rounded w-2/3" />
                                                <div className="h-4 bg-navy-100 rounded w-full" />
                                                <div className="h-4 bg-navy-100 rounded w-1/2" />
                                                <div className="h-8 bg-navy-100 rounded w-1/3 mt-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in">
                                <p className="text-red-600 font-semibold">{error}</p>
                            </div>
                        )}

                        {!loading && !error && rooms.length === 0 && (
                            <div className="bg-white rounded-3xl shadow-lg border border-dashed border-navy-200 p-12 text-center animate-fade-in col-span-full">

                                <h4 className="text-lg font-bold text-navy-800 mb-2">No Rooms Found</h4>
                                <p className="text-navy-400 text-sm leading-relaxed">No rooms in this category can accommodate {guests} guests. Please try another category or reduce guest count.</p>
                            </div>
                        )}

                        {!loading && !error && rooms.map((room, idx) => (
                            <div
                                key={room._id}
                                onClick={() => handleSelectRoom(room)}
                                className={`card-shine group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 transform hover:-translate-y-1 ${selectedRoom?._id === room._id
                                    ? 'border-blue-500 shadow-blue-100 shadow-2xl scale-[1.01] animate-selected-ring'
                                    : 'border-transparent hover:border-blue-200'
                                    }`}
                                style={{ animationDelay: `${idx * 120}ms` }}
                            >
                                {selectedRoom?._id === room._id && (
                                    <div className="absolute top-4 right-4 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow animate-badge-pulse">
                                        Selected
                                    </div>
                                )}

                                {(room.isAvailable === false || room.status === 'maintenance') && (
                                    <div className="absolute inset-0 z-10 bg-navy-900/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                        <div className={`${room.status === 'maintenance' ? 'bg-amber-600' : 'bg-red-500'} text-white px-6 py-2 rounded-full font-bold text-lg shadow-2xl rotate-[-10deg] animate-pulse`}>
                                            {room.status === 'maintenance' ? 'Maintenance' : room.status === 'occupied' ? 'Occupied' : 'Reserved'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-48 md:w-56 h-48 sm:h-auto relative overflow-hidden flex-shrink-0">
                                        <img src={room.images[0]} alt={room.names} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className={`absolute top-3 left-3 ${room.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                            {room.badge}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-navy-900 mb-1 italic group-hover:text-blue-700 transition-colors duration-300">{room.name}</h3>
                                            <p className="text-navy-500 text-sm mb-3 line-clamp-2">{room.tagline}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {room.tags?.map((t) => (
                                                    <span key={t} className="px-2.5 py-0.5 bg-gradient-to-r from-navy-50 to-blue-50 text-navy-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-navy-100/50">{t}</span>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 text-sm text-navy-500">
                                                <span className="flex items-center gap-1">{room.capacity}</span>

                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-navy-50">
                                            <div>
                                                {room.hasOffer && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-navy-400 line-through">{formatPrice(room.originalPrice)}</span>
                                                        <span className="text-xl sm:text-2xl font-extrabold text-blue-600 italic">{formatPrice(room.price)}/-</span>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{room.offerTitle}</span>
                                                    </div>
                                                )}
                                                {!room.hasOffer && (
                                                    <span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSelectRoom(room) }}
                                                disabled={room.isAvailable === false || room.status === 'maintenance'}
                                                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${(room.isAvailable === false || room.status === 'maintenance')
                                                    ? 'bg-navy-200 text-navy-400 cursor-not-allowed'
                                                    : selectedRoom?._id === room._id
                                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                                                        : 'bg-navy-900 text-white hover:bg-navy-700 shadow-md hover:shadow-lg'
                                                    }`}
                                            >
                                                {room.status === 'maintenance' ? 'Maintenance' : room.isAvailable === false ? 'Not Available' : selectedRoom?._id === room._id ? 'Selected' : 'Select Room'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* summery */}
                    <div className="lg:w-2/5">
                        <div className="sticky top-28">
                            {selectedRoom ? (
                                <div className="glass-summary rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 animate-panel-slide">
                                    {/* gallery*/}
                                    {(() => {
                                        const imgs = getGalleryImages(selectedRoom)
                                        return (
                                            <div className="relative">
                                                <div className="grid grid-cols-2 gap-0.5 bg-navy-100">
                                                    {imgs.map((src, i) => (
                                                        <div key={i} className="relative overflow-hidden cursor-pointer group/ph" style={{ height: '120px' }} onClick={() => openLightbox(i)}>
                                                            <img src={src} alt={`${selectedRoom.name} photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/ph:scale-110" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover/ph:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                                <span className="text-white text-2xl opacity-0 group-hover/ph:opacity-100 transition-opacity duration-200 drop-shadow-lg">🔍</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                    📷 {imgs.length} Photos
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900/80 to-transparent p-4">
                                                    <h3 className="text-lg font-bold text-white italic">{selectedRoom.name}</h3>
                                                    <p className="text-white/70 text-xs">{selectedRoom.tagline}</p>
                                                </div>
                                            </div>
                                        )
                                    })()}

                                    <div className="p-6 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {selectedRoom.hasOffer ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-navy-400 line-through">{formatPrice(selectedRoom.originalPrice)}</span>
                                                        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{selectedRoom.offerTitle}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-navy-400 block uppercase tracking-widest">Capacity</span>
                                                <span className="text-navy-700 font-semibold">{selectedRoom.capacity}</span>
                                                <span className="text-navy-400 text-xs block">{selectedRoom.size}</span>
                                            </div>
                                        </div>


                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">
                                                Select Meal Plan
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {mealPlans.map((plan) => (
                                                    <button
                                                        key={plan.code}
                                                        onClick={() => setMealPlan(plan.code)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${mealPlan === plan.code
                                                            ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200/50'
                                                            : 'bg-navy-50/50 text-navy-600 border-navy-100 hover:bg-navy-100'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span>{plan.label}</span>
                                                            {plan.rate > 0 ? (
                                                                <span className={`text-[9px] font-medium ${mealPlan === plan.code ? 'text-blue-100' : 'text-navy-400'}`}>
                                                                    + {formatPrice(plan.rate)}/pp
                                                                </span>
                                                            ) : (
                                                                <span className={`text-[9px] font-medium ${mealPlan === plan.code ? 'text-blue-100' : 'text-navy-400'}`}>
                                                                    Included
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {checkIn && checkOut && calcNights() > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in mt-4">
                                                <div className="bg-blue-50 border-blue-100 rounded-xl px-3 py-2 border">
                                                    <span className="text-xs text-blue-600 font-bold block">Check-In</span>
                                                    <span className="text-navy-800 font-semibold text-sm">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {checkInTime}</span>
                                                </div>
                                                <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                                                    <span className="text-xs text-blue-600 font-bold block">Check-Out</span>
                                                    <span className="text-navy-800 font-semibold text-sm">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {checkOutTime}</span>
                                                </div>
                                                
                                                <div className="col-span-1 sm:col-span-2 bg-gradient-to-r from-navy-50 to-blue-50/50 rounded-xl px-3 py-2 flex justify-between items-center">
                                                    <span className="text-navy-500 text-sm">
                                                        {calcNights()} Night{calcNights() > 1 ? 's' : ''} ({mealPlans.find(p => p.code === mealPlan)?.label || 'Room Only'})
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="text-navy-900 font-bold text-sm block">
                                                            {formatPrice((selectedRoom.price + ((mealPlans.find(p => p.code === mealPlan)?.rate || 0) * parseInt(guests))) * calcNights())} Total
                                                        </span>
                                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Non-refundable</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {availability === true && (
                                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-scale-in">

                                                <span className="text-green-700 font-bold text-sm">Available for selected dates!</span>
                                            </div>
                                        )}
                                        {availability === false && (
                                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scale-in">

                                                <span className="text-red-700 font-bold text-sm">Not available. Please try other dates.</span>
                                            </div>
                                        )}

                                        <div className="ornament-divider !my-3">
                                            <span>Details</span>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3">Room Facilities</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedRoom.facilities?.map((f, i) => (
                                                    <div key={f.label} className="flex items-center gap-2 bg-gradient-to-r from-navy-50 to-transparent rounded-xl px-3 py-2 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                                        <span className="text-lg">{f.icon}</span>
                                                        <span className="text-xs text-navy-700 font-medium">{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <hr className="border-navy-100/50" />

                                        <div>
                                            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3">Package Includes</h4>
                                            <ul className="space-y-1.5">
                                                {selectedRoom.includes?.map((item, i) => (
                                                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                                        <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                                                        {item}
                                                    </li>
                                                ))}
                                                {mealPlans.find(p => p.code === mealPlan)?.includes?.map((item, i) => (
                                                    <li key={`mp-${item}`} className="flex items-start gap-2 text-sm text-navy-600 font-semibold animate-fade-in" style={{ animationDelay: `${(selectedRoom.includes?.length + i) * 60}ms` }}>
                                                        <span className="text-amber-500 mt-0.5 flex-shrink-0">🍽</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={handleContactUs}
                                            disabled={!checkIn || !checkOut || calcNights() <= 0 || availability === false || availability === 'checking' || selectedRoom?.isAvailable === false || selectedRoom?.status === 'maintenance'}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-cta-glow"
                                        >
                                            {selectedRoom?.status === 'maintenance' ? 'Maintenance Mode' : selectedRoom?.isAvailable === false ? (selectedRoom?.status === 'occupied' ? 'Room Occupied' : 'Room Reserved') : !checkIn ? 'Select Date First' : (!checkOut ? 'Select Check-Out' : 'Contact Us to Book')}
                                        </button>

                                        <p className="text-center text-navy-400 text-xs">Check dates & times before booking</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-lg border border-dashed border-navy-200 p-12 text-center animate-fade-in">

                                    <h4 className="text-lg font-bold text-navy-800 mb-2">No Room Selected</h4>
                                    <p className="text-navy-400 text-sm leading-relaxed">Select check-in/out dates, then pick a room to see full details & pricing.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default StandardRooms
