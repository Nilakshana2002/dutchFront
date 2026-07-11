import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchRoomsByCategory, checkRoomAvailability, fetchPackagesByType, fetchActiveOffers } from '../utils/api'
import Footer from '../components/Footer'
import BookingModal from '../components/BookingModal'

const today = new Date().toISOString().split('T')[0]

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

const HeroParticles = ({ color = 'rgba(20, 184, 166, 0.3)' }) => (
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


const DayOutingRooms = () => {
    const location = useLocation()
    const { state } = location

    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [view, setView] = useState(state?.checkIn ? 'rooms' : 'categories')
    const [selectedCategory, setSelectedCategory] = useState(state?.checkIn ? 'couple' : null)
    const [outingDate, setOutingDate] = useState(state?.checkIn || '')
    const [guests, setGuests] = useState(state?.guests || '1')
    const [availability, setAvailability] = useState(null)
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [packages, setPackages] = useState([])
    const [packagesLoading, setPackagesLoading] = useState(false)
    const [packagesError, setPackagesError] = useState(null)
    const navigate = useNavigate()

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

    useEffect(() => {
        if (view === 'info' && selectedCategory) {
            console.log('Fetching packages for category:', selectedCategory);
            setPackagesLoading(true)
            setPackagesError(null)
            fetchPackagesByType(selectedCategory)
                .then(data => {
                    console.log('Fetched packages data:', data);
                    setPackages(data);
                })
                .catch(err => {
                    console.error('Fetch packages error:', err);
                    setPackagesError('Unable to load packages. Please try again.');
                })
                .finally(() => setPackagesLoading(false))
        }
    }, [view, selectedCategory])

    const normalizeRoom = (room) => ({
        ...room,
        tagline: room.tagline || room.description || '',
        tags: [...new Set([...(room.tags || []), ...(room.features || [])])].slice(0, 4),
        capacity: room.capacity || `${room.guests || 2} Guests`,
        size: room.size || '',
        badge: room.badge || (room.view ? `${room.view} view` : 'Day Outing'),
        badgeColor: room.badgeColor || 'bg-teal-500',
        facilities: [
            ...(room.facilities || []),
            ...(room.features || []).filter(f => !(room.facilities || []).some(fac => fac.label === f)).map(f => ({ icon: '', label: f }))
        ],
        includes: room.includes?.length
            ? room.includes
            : ['Pool access', 'Day use amenities', 'Complimentary lunch'],
    })

    useEffect(() => {
        setLoading(true)
        setError(null)
        setSelectedRoom(null)
        setAvailability(null)
        
        Promise.all([
            fetchRoomsByCategory('couple', null, outingDate, outingDate),
            fetchActiveOffers().catch(() => [])
        ])
            .then(([data, activeOffers]) => {
                const normalized = data.map(room => {
                    const roomObj = normalizeRoom(room);
                    if (outingDate && activeOffers.length > 0) {
                        const outDate = new Date(outingDate);
                        const applicableOffer = activeOffers.find(offer => {
                            const start = new Date(offer.startDate);
                            const end = new Date(offer.endDate);
                            return (offer.applicableRoomTypes.includes('dayOuting') || offer.applicableRoomTypes.includes('couple')) &&
                                   outDate >= start && outDate <= end;
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
    }, [guests, outingDate])

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat)
        if (cat === 'couple') {
            setView('rooms')
        } else {
            setView('info')
        }
    }

    const handleBack = () => {
        setView('categories')
        setSelectedCategory(null)
        setSelectedRoom(null)
    }

    const handleSelectRoom = (room) => {
        setSelectedRoom(room)
        setAvailability(null)
    }

    const handleCheckAvailability = async () => {
        if (!selectedRoom || !outingDate) return
        setAvailability('checking')
        try {
            const result = await checkRoomAvailability(
                selectedRoom._id,
                outingDate,
                outingDate
            )
            setAvailability(result.available)
        } catch {
            setAvailability(false)
        }
    }

    const handleConfirmBooking = () => {
        if (!selectedRoom || !outingDate) return
        setShowBookingModal(true)
    }





    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'N/A';
        return `Rs. ${price.toLocaleString()}`;
    }

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

            {/*BANNer*/}
            <section className="relative h-64 sm:h-80 md:h-[28rem] flex items-end overflow-hidden hero-sweep">
                <div
                    className="absolute inset-0 bg-cover bg-center animate-hero-zoom"
                    style={{
                        backgroundImage:
                            "url('https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325414/2026-03-09_mhruyv.webp')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-800/50 to-navy-900/20" />
                <HeroParticles color="rgba(20, 184, 166, 0.35)" />


                <div className="hidden sm:block absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-2xl z-10 animate-fade-in" />
                <div className="hidden sm:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-2xl z-10 animate-fade-in" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full">
                    <nav className="breadcrumb-trail mb-4 animate-fade-in">
                        <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
                        <span className="text-white/30">›</span>
                        <span className="text-white/80">Day Outing</span>
                    </nav>

                    <span className="inline-block px-4 py-1.5 bg-teal-500/90 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 backdrop-blur-sm animate-badge-pulse animate-fade-in-up">
                        ☀ Day Outing Package
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-200">
                        Day Outing{' '}
                        <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent italic animate-gradient-text">
                            Rooms & Packages
                        </span>
                    </h1>
                    <p className="text-white/70 mt-3 text-base sm:text-lg max-w-xl animate-fade-in-up animation-delay-400 leading-relaxed">
                        Choose your perfect room and enjoy a full-day luxury escape at Dutch Point Resort.
                    </p>

                    <div className="flex flex-wrap gap-4 sm:gap-8 mt-6 animate-fade-in-up animation-delay-600">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">Full Day</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">Access</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">Lunch</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">Included</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">Pool</div>
                            <div className="text-white/50 text-xs uppercase tracking-wider">& Beach</div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Date Picker Bar*/}
            {view === 'rooms' && (
                <section className="bg-white border-b border-navy-100 shadow-sm hidden md:block">

                </section>
            )}

            {/*category select*/}
            {view === 'categories' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="ornament-divider mb-8">
                        <span>✦ Choose Your Experience ✦</span>
                    </div>
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-navy-900 mb-4">Choose Your Experience</h2>
                        <p className="text-navy-500 max-w-2xl mx-auto italic">Whether it's a romantic escape, a family reunion, or a corporate bonding session, we have the perfect package tailored for you.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Couple Category */}
                        <div
                            onClick={() => handleSelectCategory('couple')}
                            className="card-shine group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border border-blue-50 animate-card-reveal"
                            style={{ animationDelay: '0ms' }}
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775106320/couple_beach_bb7m0m.jpg" alt="Couple outing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/20 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block animate-badge-pulse">Day Use Rooms</span>
                                    <h3 className="text-2xl font-bold text-white italic">Couple Packages</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-navy-500 text-sm mb-6">Enjoy luxury private rooms specifically designed for couples seeking a peaceful day escape.</p>
                                <div className="flex items-center text-blue-600 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                                    Explore Rooms <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>

                        {/* Family Category */}
                        <div
                            onClick={() => handleSelectCategory('family')}
                            className="card-shine group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border border-teal-50 animate-card-reveal"
                            style={{ animationDelay: '150ms' }}
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775457458/family_ns56ob.avif" alt="Family outing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/20 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block animate-badge-pulse">Full Day Fun</span>
                                    <h3 className="text-2xl font-bold text-white italic">Family Packages</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-navy-500 text-sm mb-6">Create lasting memories with lunch, pool access, and games for kids and adults alike.</p>
                                <div className="flex items-center text-teal-600 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                                    View Packages <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>

                        {/* Team Category */}
                        <div
                            onClick={() => handleSelectCategory('team')}
                            className="card-shine group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border border-amber-50 animate-card-reveal"
                            style={{ animationDelay: '300ms' }}
                        >
                            <div className="h-64 relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80" alt="Team outing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/20 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block animate-badge-pulse">Corporate Special</span>
                                    <h3 className="text-2xl font-bold text-white italic">Team Packages</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-navy-500 text-sm mb-6">Optimized for corporate groups, offering bonding activities, catering, and venue facilities.</p>
                                <div className="flex items-center text-amber-600 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                                    View Packages <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/*couple room view*/}
            {view === 'rooms' && (
                <>
                    <section className="bg-white/80 backdrop-blur-md border-b border-navy-100/50 shadow-sm py-2.5 sm:py-4">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <button onClick={handleBack} className="flex items-center text-navy-500 hover:text-navy-900 font-bold text-sm transition-colors mb-4 group">
                                <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to Package Categories
                            </button>
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">Outing Date</label>
                                        <input
                                            type="date"
                                            value={outingDate}
                                            min={today}
                                            onChange={(e) => { setOutingDate(e.target.value); setAvailability(null) }}
                                            className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 bg-white text-sm transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">

                                    <div>
                                        <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">Guests</label>
                                        <select
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value)}
                                            className="border border-navy-200/60 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 bg-white text-sm transition-all cursor-pointer"
                                        >
                                            <option value="1">1 Guest</option>
                                            <option value="2">2 Guests</option>
                                            <option value="3">3 Guests</option>
                                            <option value="4">4 Guests</option>
                                            <option value="5">5+ Guests</option>
                                        </select>
                                    </div>
                                </div>
                                {outingDate && selectedRoom && (
                                    <button
                                        onClick={handleCheckAvailability}
                                        disabled={availability === 'checking'}
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-navy-900 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-navy-700 transition-all duration-200 shadow-md disabled:opacity-60"
                                    >
                                        {availability === 'checking' ? 'Checking…' : 'Check Availability'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="ornament-divider mb-10">
                            <span>✦ Couple Day Use Rooms ✦</span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10">
                            <div className="lg:w-3/5 space-y-6">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <h2 className="text-2xl font-bold text-navy-900 mb-1 italic">Select Your Day Use Room</h2>
                                        <p className="text-navy-500 text-sm">Choose a private space for your day outing.</p>
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
                                                <div className="flex flex-col sm:flex-row"><div className="sm:w-48 h-48 bg-navy-100 flex-shrink-0" /><div className="flex-1 p-6 space-y-3"><div className="h-5 bg-navy-100 rounded w-2/3" /><div className="h-4 bg-navy-100 rounded w-full" /></div></div>
                                            </div>
                                        ))}
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
                                        className={`card-shine group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 transform hover:-translate-y-1 ${selectedRoom?._id === room._id ? 'border-teal-500 scale-[1.01] animate-selected-ring' : 'border-transparent hover:border-teal-200'}`}
                                        style={{ animationDelay: `${idx * 120}ms` }}
                                    >
                                        {(room.isAvailable === false || room.status === 'maintenance') && (
                                            <div className="absolute inset-0 z-10 bg-navy-900/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                                <div className={`${room.status === 'maintenance' ? 'bg-amber-600' : 'bg-red-500'} text-white px-6 py-2 rounded-full font-bold text-lg shadow-2xl rotate-[-10deg] animate-pulse`}>
                                                    {room.status === 'maintenance' ? 'Maintenance' : room.status === 'occupied' ? 'Occupied' : 'Reserved'}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-48 md:w-56 h-48 sm:h-auto relative overflow-hidden flex-shrink-0">
                                                <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className={`absolute top-3 left-3 ${room.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>{room.badge}</div>
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-navy-900 mb-1 italic group-hover:text-teal-700 transition-colors duration-300">{room.name}</h3>
                                                    <p className="text-navy-500 text-sm mb-3 line-clamp-2">{room.tagline}</p>
                                                    <div className="flex gap-4 text-sm text-navy-500">
                                                        <span className="flex items-center gap-1">{room.capacity}</span>

                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                                                    <div>
                                                        {room.hasOffer ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-navy-400 block">Package Price</span>
                                                                <span className="text-xs text-navy-400 line-through">{formatPrice(room.originalPrice)}</span>
                                                                <span className="text-xl sm:text-2xl font-extrabold text-teal-600 italic">{formatPrice(room.price)}/-</span>
                                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{room.offerTitle}</span>
                                                            </div>
                                                        ) : (
                                                            <div><span className="text-xs text-navy-400 block">Package Price</span><span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span></div>
                                                        )}
                                                    </div>
                                                    <button
                                                        disabled={room.isAvailable === false || room.status === 'maintenance'}
                                                        className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${(room.isAvailable === false || room.status === 'maintenance')
                                                            ? 'bg-navy-200 text-navy-400 cursor-not-allowed'
                                                            : selectedRoom?._id === room._id
                                                                ? 'bg-teal-50 text-teal-600 shadow-lg border border-teal-200'
                                                                : 'bg-navy-900 text-white hover:bg-navy-700 shadow-md hover:shadow-lg'
                                                            }`}>
                                                        {room.status === 'maintenance' ? 'Maintenance' : room.isAvailable === false ? 'Not Available' : selectedRoom?._id === room._id ? 'Selected' : 'Select Room'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:w-2/5">
                                <div className="sticky top-28">
                                    {selectedRoom ? (
                                        <div className="glass-summary rounded-3xl shadow-2xl overflow-hidden border border-teal-100/50 animate-panel-slide">
                                            {/* Photo Gallery */}
                                            {(() => {
                                                const imgs = getGalleryImages(selectedRoom)
                                                return (
                                                    <div className="relative">
                                                        <div className="grid grid-cols-2 gap-0.5 bg-navy-100">
                                                            {imgs.map((src, i) => (
                                                                <div key={i} className="relative overflow-hidden cursor-pointer group/ph" style={{ height: '110px' }} onClick={() => openLightbox(i)}>
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
                                                        <span className="text-[10px] text-navy-400 block uppercase tracking-widest">Package Price</span>
                                                        {selectedRoom.hasOffer ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-navy-400 line-through">{formatPrice(selectedRoom.originalPrice)}</span>
                                                                <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{selectedRoom.offerTitle}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                        )}
                                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mt-1">Non-refundable</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-navy-400 block uppercase tracking-widest">Capacity</span>
                                                        <span className="text-navy-700 font-semibold">{selectedRoom.capacity}</span>
                                                    </div>
                                                </div>
                                                {outingDate && (
                                                    <div className="flex items-center gap-3 bg-teal-50 rounded-xl px-4 py-3 border border-teal-100 animate-fade-in">
                                                        <span className="text-xl">📅</span>
                                                        <div>
                                                            <span className="text-xs text-teal-600 font-bold block">Outing Date</span>
                                                            <span className="text-navy-800 font-semibold text-sm">{new Date(outingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} | {DaycheckInTime}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {availability === true && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 font-bold text-sm animate-scale-in">Available for selected date!</div>}
                                                {availability === false && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 font-bold text-sm animate-scale-in">Not available. Try another date.</div>}

                                                <div className="ornament-divider !my-3"><span>Details</span></div>

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
                                                                <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <button onClick={handleConfirmBooking} disabled={!outingDate || availability === false || availability === 'checking' || selectedRoom?.isAvailable === false || selectedRoom?.status === 'maintenance'} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-cta-glow transition-all duration-300 hover:from-teal-600 hover:to-teal-700 transform hover:-translate-y-0.5 active:translate-y-0">
                                                    {selectedRoom?.status === 'maintenance' ? 'Maintenance Mode' : (selectedRoom?.isAvailable === false) ? (selectedRoom?.status === 'occupied' ? 'Room Occupied' : 'Room Reserved') : !outingDate ? 'Select Date First' : 'Confirm Booking'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-3xl shadow-lg border border-dashed border-navy-200 p-12 text-center animate-fade-in">

                                            <h4 className="text-lg font-bold text-navy-800 mb-2">No Room Selected</h4>
                                            <p className="text-navy-400 text-sm leading-relaxed">Select a room to see full details.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/*Family/Team*/}
            {view === 'info' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <button onClick={handleBack} className="flex items-center text-navy-500 hover:text-navy-900 font-bold text-sm transition-colors mb-8 group">
                        <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to Package Categories
                    </button>

                    <div className="ornament-divider mb-8">
                        <span>{selectedCategory === 'family' ? '✦ Family Fun ✦' : '✦ Team Excellence ✦'}</span>
                    </div>

                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
                        <div>
                            <span className={`inline-block px-4 py-1.5 ${selectedCategory === 'family' ? 'bg-teal-500' : 'bg-amber-500'} text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 animate-badge-pulse`}>
                                {selectedCategory === 'family' ? 'Family Fun' : 'Team Excellence'}
                            </span>
                            <h2 className="text-3xl font-bold text-navy-900 italic">
                                {selectedCategory === 'family' ? 'Family Day Outing Packages' : 'Team & Corporate Outing Packages'}
                            </h2>
                        </div>
                        <p className="text-navy-500 max-w-md text-sm italic">These packages are designed for groups and include comprehensive dining and facility access. Contact us for custom requirements.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {packagesLoading ? (
                            [1, 2].map(i => (
                                <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-navy-50 h-96 animate-pulse" />
                            ))
                        ) : packagesError ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-red-500 font-bold">{packagesError}</p>
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-[2.5rem] shadow-sm border border-dashed border-navy-200">
                                <p className="text-navy-400">No packages available for this category yet.</p>
                            </div>
                        ) : packages.map((pkg, idx) => (
                            <div key={pkg._id} className="card-shine bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-navy-50 flex flex-col animate-card-reveal" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="h-72 relative overflow-hidden group">
                                    <img src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : FALLBACK_IMAGES[0]} alt={pkg.title || 'Package'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg text-center min-w-[120px]">
                                        <span className="text-navy-900 font-extrabold text-xl block leading-none">{formatPrice(pkg.pricePerPerson)}</span>
                                        <span className="text-navy-400 text-[10px] uppercase font-bold tracking-tighter">Per Person</span>
                                    </div>
                                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 text-white">
                                        {pkg.time && (
                                            <span className="bg-navy-900/80 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                                                🕒 {pkg.time.start || 'TBD'} - {pkg.time.end || 'TBD'}
                                            </span>
                                        )}
                                        {pkg.groupSize && (
                                            <span className="bg-teal-500/80 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                                                👥 Min {pkg.groupSize.min || 'N/A'} Persons
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-3xl font-bold text-navy-900 mb-2 italic tracking-tight">{pkg.title || 'Untitled Package'}</h3>
                                        {pkg.description && <p className="text-navy-500 text-sm leading-relaxed line-clamp-2">{pkg.description}</p>}
                                    </div>

                                    {/* Meal Info */}
                                    <div className="bg-navy-50/50 rounded-2xl p-4 mb-6 border border-navy-100/50">
                                        <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3">🍽️ Dining Experience</h4>
                                        <div className="space-y-2">
                                            {pkg.meals?.welcomeDrink && (
                                                <div className="flex items-center gap-2 text-xs text-navy-700 font-semibold">
                                                    <span className="text-teal-500">🍹</span> Welcome Drink Included
                                                </div>
                                            )}
                                            {pkg.meals?.lunch && (
                                                <div className="text-xs text-navy-600">
                                                    <span className="font-bold text-navy-800">Lunch:</span> {pkg.meals.lunch.type === 'buffet' ? 'International Buffet' : 'Curated Set Menu'}
                                                    {pkg.meals.lunch.items && pkg.meals.lunch.items.length > 0 && (
                                                        <span className="text-navy-400 block mt-0.5 ml-5">{pkg.meals.lunch.items.join(', ')}</span>
                                                    )}
                                                </div>
                                            )}
                                            {pkg.meals?.eveningTea?.enabled && (
                                                <div className="text-xs text-navy-600">
                                                    <span className="font-bold text-navy-800">Evening Tea:</span> {pkg.meals.eveningTea.items?.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="text-xs font-bold text-navy-800 uppercase tracking-widest mb-4">Package Facilities</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-8">
                                        {pkg.facilities && pkg.facilities.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[13px] text-navy-600 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                                <span className={`${selectedCategory === 'family' ? 'text-teal-500' : 'text-amber-500'} font-bold`}>•</span>
                                                {item}
                                            </div>
                                        ))}
                                        {pkg.locationFeatures && pkg.locationFeatures.map((item, i) => (
                                            <div key={`loc-${i}`} className="flex items-center gap-2 text-[13px] text-navy-600 animate-fade-in">
                                                <span className="text-navy-300">✦</span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {pkg.specialOffers && pkg.specialOffers.length > 0 && (
                                        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Exclusive Offers</h4>
                                            {pkg.specialOffers.map((offer, i) => (
                                                <div key={i} className="mb-1 last:mb-0">
                                                    <div className="text-xs font-bold text-amber-900">{offer.title}</div>
                                                    <div className="text-[10px] text-amber-700">{offer.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-navy-50 flex items-center justify-between gap-4">
                                        <button onClick={() => navigate("/contact-us")} className={`flex-1 py-4 ${selectedCategory === 'family' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-amber-500 hover:bg-amber-600'} text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 animate-cta-glow`}>
                                            Contact Us Now
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => { setShowBookingModal(false) }}
                room={selectedRoom}
                checkIn={outingDate}
                checkOut={outingDate}
                guests={guests}
                selectedPackage="day-use"
                onSuccess={() => { setAvailability(null) }}
            />
            <Footer />

        </div>
    )
}

export default DayOutingRooms
