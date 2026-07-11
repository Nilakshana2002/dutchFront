import { useState, useEffect, useCallback } from 'react'
import { fetchGalleryRooms } from '../utils/api'

const CATEGORIES = ['All', 'Rooms', 'Events', 'Resort', 'Dining']



const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [lightboxIndex, setLightboxIndex] = useState(null)

    useEffect(() => {
        const loadImages = async () => {
            setLoading(true)
            try {
                // Fetch dynamic room images
                const roomsData = await fetchGalleryRooms()
                const roomImages = (roomsData || []).flatMap(room =>
                    (room.images || []).map(imgUrl => ({
                        url: imgUrl,
                        title: room.name,
                        category: 'Rooms'
                    }))
                )

                setImages(roomImages)
            } catch (err) {
                console.error('Error fetching gallery images:', err)
                setImages([])
            } finally {
                setLoading(false)
            }
        }
        loadImages()
    }, [])

    const filteredImages = selectedCategory === 'All'
        ? images
        : images.filter(img => img.category === selectedCategory)

    const openLightbox = (idx) => setLightboxIndex(idx)
    const closeLightbox = () => setLightboxIndex(null)
    const lightboxPrev = useCallback(() => setLightboxIndex(i => (i - 1 + filteredImages.length) % filteredImages.length), [filteredImages])
    const lightboxNext = useCallback(() => setLightboxIndex(i => (i + 1) % filteredImages.length), [filteredImages])

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

    return (
        <div className="min-h-screen bg-white">
            {/* Lightbox Overlay */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-navy-950/95 backdrop-blur-xl flex items-center justify-center animate-fade-in"
                    onClick={closeLightbox}
                >
                    <button onClick={closeLightbox} className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-light transition-all z-10">×</button>
                    <button onClick={(e) => { e.stopPropagation(); lightboxPrev() }} className="absolute left-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-all z-10">‹</button>

                    <div className="relative group max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={filteredImages[lightboxIndex].url}
                            alt={filteredImages[lightboxIndex].title}
                            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                            <p className="text-white text-xl font-bold italic">{filteredImages[lightboxIndex].title}</p>
                            <p className="text-white/60 text-sm uppercase tracking-widest">{filteredImages[lightboxIndex].category}</p>
                        </div>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); lightboxNext() }} className="absolute right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-all z-10">›</button>
                </div>
            )}

            {/* ===== HERO SECTION ===== */}
            <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center animate-hero-zoom"
                    style={{ backgroundImage: "url('https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325413/unnamed_6_lun1kc.webp')" }}
                />
                <div className="absolute inset-0 bg-navy-950/60" />

                <div className="relative z-10 text-center px-4">
                    <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.3em] rounded-full mb-6 border border-white/30 animate-fade-in-up">
                        Exquisite Visuals
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up animation-delay-200">
                        Our <span className="italic font-serif text-blue-300">Gallery</span>
                    </h1>
                    <div className="w-24 h-1 bg-blue-400 mx-auto rounded-full animate-fade-in-up animation-delay-400" />
                </div>
            </section>

            {/* ===== CATEGORY FILTERS ===== */}
            <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-navy-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                        {CATEGORIES.map((cat, i) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 ${selectedCategory === cat
                                    ? 'bg-navy-950 text-white shadow-xl scale-105'
                                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                                    }`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== GALLERY GRID ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[4/3] bg-navy-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                        {filteredImages.map((img, idx) => (
                            <div
                                key={`${img.url}-${idx}`}
                                className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-navy-50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${(idx % 10) * 100}ms` }}
                                onClick={() => openLightbox(idx)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.title}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                        {img.category}
                                    </span>
                                    <h3 className="text-white text-xl font-bold italic transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                        {img.title}
                                    </h3>
                                    <div className="mt-4 w-0 group-hover:w-full h-0.5 bg-blue-400 transition-all duration-500 delay-300" />
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                                    <span className="text-white text-lg">🔍</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📷</div>
                        <h3 className="text-xl font-bold text-navy-800">No images found</h3>
                        <p className="text-navy-400 mt-2">Try selecting another category.</p>
                    </div>
                )}
            </section>

            {/* ===== FOOTER CTA ===== */}
            <section className="bg-navy-950 py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 italic">Experience Luxury Firsthand</h2>
                    <p className="text-white/60 text-lg mb-10 leading-relaxed">
                        Every photo tells a story, but nothing compares to the real experience. Join us at Dutch-Point Negombo Beach Resort and create your own memories.
                    </p>
                    <a
                        href="/deluxeRooms"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1"
                    >
                        Book Your Stay
                    </a>
                </div>
            </section>
        </div>
    )
}

export default Gallery
