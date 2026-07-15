import React from 'react'
import Footer from '../components/Footer'

const venueImages = [
    {
        url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
        title: 'Grand Ballroom',
        description: 'Our most opulent space, perfect for large weddings and corporate galas.',
        capacity: 'Up to 500 guests'
    },
    {
        url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        title: 'Garden Pavilion',
        description: 'An open-air sanctuary surrounded by tropical flora and gentle breezes.',
        capacity: 'Up to 200 guests'
    },
    {
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
        title: 'Ocean Front Deck',
        description: 'Breathtaking views of the Negombo coastline for intimate sunsets.',
        capacity: 'Up to 80 guests'
    },
    {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        title: 'Executive Suite',
        description: 'Modern, professional setting for high-level meetings and workshops.',
        capacity: 'Up to 30 guests'
    },
    {
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
        title: 'Poolside Lounge',
        description: 'Chic and relaxed atmosphere for cocktail parties and birthdays.',
        capacity: 'Up to 150 guests'
    },
    {
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
        title: 'Moonlight Terrace',
        description: 'Elevated stargazing venue for romantic anniversaries.',
        capacity: 'Up to 50 guests'
    }
]

export default function VenueGallery() {
    return (
        <div className="min-h-screen bg-sand-50">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=90" 
                        alt="Venue Hero" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[2px]" />
                </div>
                
                <div className="relative z-10 text-center px-4">
                    <span className="text-sand-400 font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Exquisite Spaces</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                        Our Venues
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Discover the perfect backdrop for your most precious moments. 
                        From grand celebrations to intimate gatherings.
                    </p>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {venueImages.map((item, index) => (
                        <div key={index} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-navy-900/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-navy-50">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img 
                                    src={item.url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-navy-900 uppercase tracking-wider z-10">
                                    {item.capacity}
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-navy-950 mb-3 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                                    {item.title}
                                </h3>
                                <p className="text-navy-500 text-sm font-light leading-relaxed mb-6">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-navy-50">
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Available for Booking</span>
                                    <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                        →
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-24 bg-navy-950 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-sand-500/5 rounded-full -ml-48 -mb-48 blur-3xl" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                            Ready to start planning?
                        </h2>
                        <p className="text-white/60 max-w-xl mx-auto mb-10 font-light">
                            Our dedicated event planning team is here to help you customize 
                            every detail of your celebration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/event-management" className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-teal-500 transition-all shadow-lg shadow-teal-950/20">
                                Book a Venue
                            </a>
                            <a href="/contact" className="px-10 py-4 border border-white/20 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                Contact Planner
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
