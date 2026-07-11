import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Minus, Tag, Sprout, Sparkles, Waves } from 'lucide-react'
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import QuickBookingBar from "../components/QuickBookingBar";
import { fetchFoods } from '../utils/api';
import beach from "../assets/images/beach.jpeg";
import room4 from "../assets/images/room4.jpeg";
import beach2 from "../assets/images/beach2.jpeg";
import room5 from "../assets/images/room5.jpeg";

const Home = () => {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalRooms = 4;
  const maxRoomIndex = Math.max(0, totalRooms - itemsPerView);

  const handleBookNow = () => {
    navigate('/deluxeRooms')
  }

  const openDayOutingRooms = (e) => {
    e.stopPropagation()
    navigate('/DayOutingRooms')
  }

  const openDeluxeRooms = (e) => {
    e.stopPropagation()
    navigate('/deluxeRooms')
  }

  const openSemiLuxuryRooms = (e) => {
    e.stopPropagation()
    navigate('/semiLuxuryRooms')
  }

  const openLuxuryRooms = (e) => {
    e.stopPropagation()
    navigate('/luxuryRooms')
  }

  const [placeData, setPlaceData] = useState({ rating: 4.8, userRatingCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await fetch('https://places.googleapis.com/v1/places/ChIJSeTqBADt4joRdyZCz1Dwf28?fields=displayName,rating,userRatingCount,reviews&key=AIzaSyAWyxrYDOrYFET60TsVZ_yCBZTpL-yc5QE');
        const data = await response.json();

        if (data.rating) {
          setPlaceData({
            rating: data.rating,
            userRatingCount: data.userRatingCount || 0
          });
        }

        if (data.reviews && data.reviews.length > 0) {
          // Filter reviews with rating between 3.8 and 5.0
          const filtered = data.reviews
            .filter(r => r.rating >= 3.8)
            .map(r => ({
              author_name: r.authorAttribution?.displayName || "Guest",
              profile_photo_url: r.authorAttribution?.photoUri || "https://i.pravatar.cc/150",
              rating: r.rating,
              text: r.text?.text || "",
              relative_time_description: r.relativePublishTimeDescription || "Recently"
            }));

          // Sort by length of text to get the most substantial ones first, then take top 3
          const top3 = filtered
            .sort((a, b) => b.text.length - a.text.length)
            .slice(0, 3);

          setReviews(top3);
        } else {
          // Fallback if no reviews or API error
          throw new Error("No reviews found");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([
          {
            author_name: "Sarah Thompson",
            profile_photo_url: "https://i.pravatar.cc/150?u=sarah",
            rating: 5,
            text: "An absolute paradise! The sound of the waves waking you up is something I will never forget. The staff at Dutch Point were incredibly attentive.",
            relative_time_description: "a week ago"
          },
          {
            author_name: "Marcus Chen",
            profile_photo_url: "https://i.pravatar.cc/150?u=marcus",
            rating: 5,
            text: "Exceptional service and the food at the beach restaurant was world-class. Highly recommend for anyone looking for a quiet luxury escape.",
            relative_time_description: "2 weeks ago"
          },
          {
            author_name: "Elena Rodriguez",
            profile_photo_url: "https://i.pravatar.cc/150?u=elena",
            rating: 5,
            text: "The perfect spot for our honeymoon. Private, luxurious, and the most beautiful sunsets in Negombo. We will definitely be back!",
            relative_time_description: "1 month ago"
          }
        ]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchGoogleReviews();
  }, []);
  
  const [featuredFoods, setFeaturedFoods] = useState([]);
  useEffect(() => {
    const loadFeaturedFoods = async () => {
      try {
        const data = await fetchFoods();
        // Get top 3 discounted items or just top 3 items
        const featured = data
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 3);
        setFeaturedFoods(featured);
      } catch (error) {
        console.error("Error fetching featured foods:", error);
      }
    };
    loadFeaturedFoods();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full">


      {/* ===== HERO SECTION: VISION 1 - EDITORIAL BOUTIQUE ===== */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center bg-white overflow-hidden pt-36 md:pt-48 lg:pt-20 pb-20 lg:pb-0">

        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-sand-50/50 -z-0 hidden lg:block"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column: Typography & Story */}
            <div className="text-left order-2 lg:order-1">
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-[1px] bg-sand-500"></div>
                  <span className="text-sand-600 text-xs font-bold tracking-[0.4em] uppercase">
                    Boutique Luxury
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-navy-950 mb-8 leading-[1.1] font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  Dutch Point <br />
                  <span className="text-sand-500 italic block mt-2">Negombo</span>
                </h1>

                <p className="text-lg md:text-xl text-navy-600 mb-10 font-light leading-relaxed max-w-lg">
                  Where the golden shores of Sri Lanka meet the pinnacle of coastal elegance. Experience a sanctuary designed for the discerning traveler.
                </p>

                <div className="flex flex-wrap items-center gap-6 mb-12">
                  <button
                    onClick={handleBookNow}
                    className="px-10 py-5 bg-navy-950 text-white font-bold rounded-full hover:bg-navy-900 transition-all duration-300 uppercase tracking-widest text-xs shadow-xl shadow-navy-950/20 transform hover:-translate-y-1"
                  >
                    Experience Luxury
                  </button>
                  <div className="flex items-center gap-2 px-6 py-2 border border-navy-100 rounded-full text-navy-400">
                    <span className="text-teal-500">🏖️</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Beachfront Paradise</span>
                  </div>
                </div>

                {/* Micro Highlights */}
                <div className="grid grid-cols-2 gap-8 border-t border-navy-50 pt-8">
                  <div>
                    <p className="text-2xl font-bold text-navy-950 mb-1">{placeData.rating} <span className="text-teal-500 text-sm">★</span></p>
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-[0.2em]">Guest Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-950 mb-1">Direct</p>
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-[0.2em]">Beach Access</p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Visual Composition */}
            <div className="relative order-1 lg:order-2 mb-12 lg:mb-0">
              <Reveal delay={0.3} width="100%">
                <div className="relative">

                  {/* Backdrop Decorative Card */}
                  <div className="absolute -inset-4 lg:-inset-8 border-2 border-sand-100 rounded-[3rem] lg:rounded-[5rem] -z-10 transform rotate-3"></div>

                  {/* Main Image Masked */}
                  <div className="relative h-[450px] md:h-[600px] w-full rounded-[2.5rem] lg:rounded-[4.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                    <img
                      src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325414/615939793_122116670343131125_2666782521558393514_n_pjxfqw.jpg"
                      alt="Dutch Point Resort"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2000ms]"
                    />
                    <div className="absolute inset-0 bg-navy-950/10 mix-blend-overlay"></div>
                  </div>

                  {/* Floating Detail Image */}
                  <div className="absolute -bottom-10 lg:-bottom-16 -left-10 lg:-left-20 w-40 h-56 lg:w-56 lg:h-72 rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white hidden sm:block transform -rotate-6 hover:rotate-0 transition-transform duration-700">
                    <img
                      src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325413/unnamed_6_lun1kc.webp"
                      alt="Detail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Floating Circular Badge */}
                  <div className="absolute -top-6 -right-6 lg:-top-10 lg:-right-10 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center p-2 shadow-2xl border border-navy-50 animate-float">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-sand-200 flex items-center justify-center text-center p-2">
                      <span className="text-[8px] lg:text-[10px] font-bold text-navy-900 uppercase tracking-widest">Negombo's Finest</span>
                    </div>
                  </div>

                  {/* Secondary Context Image Tip */}
                  <div className="absolute bottom-10 -right-12 w-32 h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden shadow-2xl border-4 border-white hidden xl:block">
                    <img
                      src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325414/unnamed_avhkpc.webp"
                      alt="Lobby Experience"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-8 hidden lg:block">
          <div className="flex flex-col items-center gap-12 w-6">
            <span className="text-navy-300 text-[10px] font-bold uppercase tracking-[0.4em] rotate-90 whitespace-nowrap mb-8">Scroll Perspective</span>
            <div className="w-[1px] h-24 bg-gradient-to-b from-navy-100 to-transparent"></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Reveal width="100%">
              <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                Enjoy Exclusive Benefits
              </h2>
              <div className="w-24 h-1 bg-sand-500 mx-auto mb-6"></div>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                Experience the perfect harmony of nature and luxury at Dutch Point Negombo Beach Resort.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-navy-100">
            {[
              {
                icon: <Tag size={40} strokeWidth={1.2} />,
                title: 'Best Rates Guaranteed',
                desc: 'Book directly for the most competitive pricing.'
              },
              {
                icon: <Sprout size={40} strokeWidth={1.2} />,
                title: 'Exclusive Eco-Friendly Experiences',
                desc: 'Sustainable luxury that respects our coastline.'
              },
              {
                icon: <Waves size={40} strokeWidth={1.2} />,
                title: 'Direct Beachfront Access',
                desc: 'Step onto the golden sands of Negombo.'
              },
              {
                icon: <Sparkles size={40} strokeWidth={1.2} />,
                title: 'Personalized Service And Offers',
                desc: 'Tailored experiences just for you.'
              }
            ].map((feature, idx) => (
              <Reveal key={idx} delay={idx * 0.15} width="100%">
                <div className="flex items-center gap-5 px-6 group py-4">
                  <div className="text-sand-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-navy-950 leading-tight mb-1 group-hover:text-sand-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-navy-500 leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-sand-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 px-2">
            <Reveal width="100%">
              <div className="text-left">
                <span className="text-teal-600 font-bold text-xs tracking-[0.3em] uppercase block mb-4">Accommodation</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  Our Suites & Rooms
                </h2>
                <div className="w-24 h-1 bg-teal-500 mb-6"></div>
                <p className="text-lg text-navy-600 max-w-2xl">
                  Hand-crafted spaces designed for ultimate relaxation and seaside comfort.
                </p>
              </div>
            </Reveal>

            {/* Slider Controls */}
            <div className="flex items-center gap-4 mt-8 md:mt-0">
              <button
                onClick={() => setRoomIndex(prev => Math.max(0, prev - 1))}
                disabled={roomIndex === 0}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${roomIndex === 0 ? 'border-navy-100 text-navy-200 cursor-not-allowed' : 'border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white shadow-lg shadow-teal-500/20 active:scale-95'}`}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={() => setRoomIndex(prev => Math.min(maxRoomIndex, prev + 1))}
                disabled={roomIndex >= maxRoomIndex}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${roomIndex >= maxRoomIndex ? 'border-navy-100 text-navy-200 cursor-not-allowed' : 'border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white shadow-lg shadow-teal-500/20 active:scale-95'}`}
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden py-10 px-2 lg:-mx-4">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)] gap-6"
                style={{ transform: `translateX(-${roomIndex * (100 / itemsPerView + (itemsPerView === 3 ? 1.2 : itemsPerView === 2 ? 1.5 : 2))}%)` }}
              >
                {[
                  {
                    id: 'deluxe',
                    title: 'Deluxe Rooms',
                    desc: 'The pinnacle of luxury with exclusive services and amenities.',
                    img: 'https://res.cloudinary.com/dztzaoo6r/image/upload/v1774813034/r1or2-1_nv4ynw.jpg',
                    tag: 'Featured',
                    color: 'teal',
                    onClick: openDeluxeRooms
                  },
                  {
                    id: 'luxury',
                    title: 'Luxury Rooms',
                    desc: 'Spacious rooms with premium features and breathtaking views.',
                    img: 'https://res.cloudinary.com/dztzaoo6r/image/upload/v1774813043/r5-11_etdeox.jpg',
                    tag: 'Premium',
                    color: 'amber',
                    onClick: openLuxuryRooms
                  },
                  {
                    id: 'semi-luxury',
                    title: 'Semi-Luxury Rooms',
                    desc: 'Comfortable and elegant rooms with essential amenities.',
                    img: 'https://res.cloudinary.com/dztzaoo6r/image/upload/v1774813040/r4-6_qujirj.jpg',
                    tag: 'Comfort',
                    color: 'blue',
                    onClick: openSemiLuxuryRooms
                  },
                  {
                    id: 'day-outing',
                    title: 'Day Outing Packages',
                    desc: 'Enjoy a full day of activities, dining, and relaxation.',
                    img: 'https://res.cloudinary.com/dztzaoo6r/image/upload/v1775151227/dayout_tqowqj.jpg',
                    tag: 'Leisure',
                    color: 'emerald',
                    onClick: openDayOutingRooms
                  }
                ].map((room, idx) => (
                  <div
                    key={room.id}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 group"
                  >
                    <div
                      className="relative overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] cursor-pointer h-[420px] transition-all duration-500 border border-navy-50"
                      onClick={room.onClick}
                    >
                      <img
                        src={room.img}
                        alt={room.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1200ms]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                      <div className="absolute top-6 left-6">
                        <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/20">
                          {room.tag}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
                        <h3 className="text-2xl font-bold text-white mb-3 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                          {room.title}
                        </h3>
                        <p className="text-white/70 mb-6 text-sm leading-relaxed line-clamp-2">
                          {room.desc}
                        </p>
                        <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                          <span>View Details</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DINING HIGHLIGHTS SECTION ===== */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 px-2">
            <Reveal width="100%">
              <div className="text-left">
                <span className="text-sand-600 font-bold text-xs tracking-[0.3em] uppercase block mb-4">Culinary Excellence</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  Dining Highlights
                </h2>
                <div className="w-24 h-1 bg-sand-500 mb-6"></div>
                <p className="text-lg text-navy-600 max-w-2xl">
                  A symphony of local flavors and international expertise.
                </p>
              </div>
            </Reveal>
            <button
              onClick={() => navigate('/foods')}
              className="mt-8 md:mt-0 flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-[0.2em] group transition-all"
            >
              Explore Full Menu
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredFoods.map((item, idx) => (
              <Reveal key={item._id} delay={idx * 0.1} width="100%">
                <div className="group bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-navy-950/5 border border-navy-50 hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                  <div className="h-64 overflow-hidden relative bg-navy-50 flex items-center justify-center">
                    {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                      />
                    ) : (
                      <div className="text-7xl group-hover:scale-110 transition-transform duration-700">
                        {item.image || '🍽️'}
                      </div>
                    )}
                    {item.discount > 0 && (
                      <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
                        {item.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-navy-950 leading-tight group-hover:text-sand-600 transition-colors">{item.name}</h3>
                      <div className="text-right">
                        <span className="text-teal-600 font-bold text-lg block">Rs. {(item.sellingPrice || item.price).toFixed(2)}</span>
                        {(item.discount > 0 || (item.sellingPrice && item.sellingPrice < item.price)) && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-navy-300 text-xs line-through font-medium">Rs. {item.price.toFixed(2)}</span>
                            <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">
                              {item.discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-navy-500 text-sm leading-relaxed mb-6 italic line-clamp-2">
                      "{item.description}"
                    </p>
                    <div className="mt-auto pt-6 border-t border-navy-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        {item.category}
                      </span>
                      <button 
                        onClick={() => navigate('/foods')}
                        className="text-[10px] font-bold text-navy-950 uppercase tracking-widest hover:text-teal-600 transition-colors"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="py-24 bg-sand-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            <div className="lg:w-1/3 text-left">
              <Reveal>
                <span className="text-sand-500 font-bold text-xs tracking-[0.3em] uppercase block mb-4">
                  Exclusive Offers
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-8 leading-tight font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  Unforgettable Stays,<br />Exclusive Offers
                </h2>
                <p className="text-navy-600 text-lg leading-relaxed mb-10 max-w-md">
                  Indulge in serene spa treatments, exquisite dining and a host of unique value-additions amidst Negombo's breathtaking beauty and tranquil coastal environment.
                </p>
                <button
                  onClick={() => navigate('/event')}
                  className="px-8 py-4 bg-sand-500 hover:bg-sand-600 text-white font-bold rounded-lg transition-all duration-300 uppercase tracking-widest text-xs"
                >
                  Explore All
                </button>
              </Reveal>
            </div>


            <div className="lg:w-2/3 relative">
              <Reveal delay={0.2} width="100%">
                <div className="flex items-center gap-8 relative overflow-visible">

                  <button className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-navy-400 hover:text-sand-500 transition-colors">
                    <ChevronLeft size={32} />
                  </button>
                  <button className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-navy-400 hover:text-sand-500 transition-colors">
                    <ChevronRight size={32} />
                  </button>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                    <div className="group cursor-pointer">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1558235282-378396a86c6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                          alt="Easter Break"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sand-100 text-4xl font-serif italic drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">Bunny Approved</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-navy-900 font-bold text-lg mb-2">Easter Break</h3>
                        <div className="w-12 h-0.5 bg-sand-400 mx-auto" />
                      </div>
                    </div>


                    <div className="group cursor-pointer">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                          alt="Romantic Dinner"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-navy-900 font-bold text-lg mb-2">Every Moment, Your Story</h3>
                        <div className="w-12 h-0.5 bg-sand-400 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section> */}

      <section className="relative py-32 overflow-hidden">

        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Resort Pool View"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal width="100%">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Start Your <span className="text-sand-400 italic">Journey</span> With Us
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto">
              Check availability and book your luxury escape at Dutch Point Negombo today.
            </p>
          </Reveal>

          <Reveal delay={0.2} width="100%">
            <div className="max-w-6xl mx-auto">
              <QuickBookingBar />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-navy-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="text-left">
              <Reveal>
                <span className="text-teal-600 font-bold text-sm tracking-[0.3em] uppercase block mb-4">
                  Visual Journey
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-8 leading-tight font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  Captured Moments at <br />
                  <span className="text-sand-600 italic">Dutch Point</span>
                </h2>
                <p className="text-navy-600 text-lg leading-relaxed mb-10 max-w-md">
                  Discover the exquisite beauty and tranquil atmosphere of our resort through these curated glimpses of paradise, from golden sunsets to luxury interiors.
                </p>
                <button
                  onClick={() => navigate('/gallery')}
                  className="group flex items-center gap-3 text-navy-950 font-bold uppercase tracking-widest text-xs hover:text-teal-600 transition-colors"
                >
                  View Full Gallery
                  <span className="w-10 h-10 border border-navy-200 rounded-full flex items-center justify-center group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-all duration-300">
                    <ChevronRight size={18} />
                  </span>
                </button>
              </Reveal>
            </div>


            <div className="relative">
              <div className="grid grid-cols-2 gap-4 h-[500px]">

                <div className="row-span-2">
                  <Reveal delay={0.2} width="100%" className="h-full">
                    <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl group">
                      <img src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325412/2026-02-01_hmkevm.webp" alt="Beachfront View" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  </Reveal>
                </div>


                <div className="flex flex-col gap-4 h-full">
                  <Reveal delay={0.4} width="100%" className="h-1/2">
                    <div className="relative h-full rounded-2xl overflow-hidden shadow-xl group">
                      <img src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325414/2026-03-09_mhruyv.webp" alt="Luxury Suite" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-navy-950/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  </Reveal>
                  <Reveal delay={0.6} width="100%" className="h-1/2">
                    <div className="relative h-full rounded-2xl overflow-hidden shadow-xl group">
                      <img src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325413/unnamed_6_lun1kc.webp" alt="Resort Activities" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-navy-950/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  </Reveal>
                </div>
              </div>


              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-teal-500/10 rounded-full -z-10 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-sand-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal width="100%">
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-4 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                Guest Experiences
              </h2>
              <div className="flex items-center gap-2 text-navy-600 bg-navy-50 px-4 py-2 rounded-full border border-navy-100">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.52-1.48 1.48-3.32 2.24-5.72 2.24-4.48 0-8.08-3.6-8.08-8.08s3.6-8.08 8.08-8.08c2.44 0 4.28.96 5.64 2.28L20.52 4.6C18.6 2.76 15.96 1.5 12.48 1.5 6.44 1.5 1.5 6.44 1.5 12.48s4.94 10.98 10.98 10.98c3.28 0 5.76-1.08 7.8-3.16 2.12-2.12 2.8-5.12 2.8-7.56 0-.72-.04-1.4-.16-2H12.48z" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-widest">{placeData.rating} Rating on Google</span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {loadingReviews ? (

              [1, 2, 3].map((i) => (
                <div key={i} className="bg-navy-50/50 border border-navy-100 p-10 rounded-3xl animate-pulse h-64">
                  <div className="w-24 h-4 bg-navy-200 rounded mb-6"></div>
                  <div className="w-full h-4 bg-navy-100 rounded mb-4"></div>
                  <div className="w-full h-4 bg-navy-100 rounded mb-4"></div>
                  <div className="w-2/3 h-4 bg-navy-100 rounded"></div>
                </div>
              ))
            ) : (
              reviews.map((review, idx) => (
                <Reveal key={idx} delay={idx * 0.2} width="100%">
                  <div className="bg-white border border-navy-100 p-8 rounded-2xl text-left h-full shadow-lg shadow-navy-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => <span key={i} className="text-gold-500 text-lg">★</span>)}
                      </div>
                      <svg className="w-5 h-5 text-navy-200 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.52-1.48 1.48-3.32 2.24-5.72 2.24-4.48 0-8.08-3.6-8.08-8.08s3.6-8.08 8.08-8.08c2.44 0 4.28.96 5.64 2.28L20.52 4.6C18.6 2.76 15.96 1.5 12.48 1.5 6.44 1.5 1.5 6.44 1.5 12.48s4.94 10.98 10.98 10.98c3.28 0 5.76-1.08 7.8-3.16 2.12-2.12 2.8-5.12 2.8-7.56 0-.72-.04-1.4-.16-2H12.48z" />
                      </svg>
                    </div>
                    <p className="text-base text-navy-800 mb-6 italic leading-relaxed font-light flex-grow">
                      "{review.text.length > 150 ? review.text.substring(0, 150) + "..." : review.text}"
                    </p>

                    <div className="flex items-center gap-3 border-t border-navy-50 pt-4">
                      <img src={review.profile_photo_url} alt={review.author_name} className="w-10 h-10 rounded-full border-2 border-teal-50" />
                      <div>
                        <p className="text-navy-900 font-bold uppercase tracking-widest text-[9px]">{review.author_name}</p>
                        <p className="text-navy-400 text-[9px] uppercase font-bold tracking-tighter">{review.relative_time_description}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))
            )}
          </div>

          <div className="max-w-4xl mx-auto py-24 border-t border-navy-100">
            <Reveal width="100%">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-950 mb-12 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                Frequently Asked Questions
              </h2>
            </Reveal>

            <div className="space-y-4 text-left">
              {[
                { q: "What are the check-in and check-out times?", a: "For full-day visits, check-in is available between 12:00 PM and 2:00 PM, while check-out is between 9:00 AM and 11:00 AM. For day visits, check-in starts at 9:00 AM and check-out is at 7:00 PM." },
                { q: "Is there free Wi-Fi?", a: "Yes, high-speed Wi-Fi is complimentary for all guests and is available throughout the resort, including guest rooms and the beach area." },
                { q: "Do you offer airport transfers?", a: "We currently do not provide airport pickup or drop-off services. Please contact our front desk if you need assistance with alternative transport arrangements." },
                { q: "Are pets allowed?", a: "To ensure the comfort and tranquility of all our guests, we currently do not allow pets on the resort premises." }
              ].map((faq, idx) => (
                <Reveal key={idx} delay={idx * 0.1} width="100%">
                  <div className="border-b border-navy-100 pb-4">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex justify-between items-center py-4 text-left group"
                    >
                      <span className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors">{faq.q}</span>
                      {openFaq === idx ? <Minus className="text-teal-600" /> : <Plus className="text-navy-400 group-hover:text-teal-600" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${openFaq === idx ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                      <p className="text-navy-600 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 overflow-hidden bg-navy-950">

        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sand-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal width="100%">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
                Ready to Experience <span className="text-sand-400 italic">Negombo</span>?
              </h2>
              <p className="text-white/60 text-lg font-light mb-8">
                Book your luxury escape on the golden shores today.
              </p>
              <button
                onClick={handleBookNow}
                className="px-10 py-4 font-bold text-white transition-all duration-300 bg-teal-500 rounded-full hover:bg-teal-400 hover:shadow-2xl hover:shadow-teal-500/40 transform hover:-translate-y-1 uppercase tracking-widest text-sm"
              >
                Reserve Your Room
              </button>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Home
