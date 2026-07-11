import Reveal from "../components/Reveal";
import Footer from "../components/Footer";

const AboutUs = () => {
  return (
    <div className="w-full pt-28 md:pt-40">
      
      {/* ===== STORY SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <span className="text-teal-600 font-bold text-sm tracking-[0.2em] uppercase mb-4 block">Our Heritage</span>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-950 mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                The Story of Dutch Point
              </h1>
              <div className="space-y-6 text-lg text-navy-700 leading-relaxed">
                <p>
                  Nestled along the golden shores of Negombo, Dutch Point Negombo Beach Resort was created with a vision to offer a relaxing coastal escape that blends Sri Lanka’s natural beauty with warm, authentic hospitality.
                </p>
                <p>
                  Located just steps away from the sparkling waters of the Indian Ocean, our beachside resort welcomes both local and international travelers seeking comfort, tranquility, and unforgettable seaside experiences. From breathtaking sunsets over the ocean to the calming sound of the waves, every moment at Dutch Point is designed to reconnect you with nature.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="relative group">
                <div className="absolute -inset-4 border border-navy-100 rounded-3xl -z-10 group-hover:inset-0 transition-all duration-700" />
                <div className="rounded-3xl overflow-hidden shadow-2xl h-[500px]">
                  <img
                    src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325411/unnamed_7_zt9tzo.webp"
                    alt="Dutch Point Resort Exterior"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLES SECTION ===== */}
      <section className="py-24 bg-gradient-to-b from-white to-navy-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal width="100%">
            <div className="mb-20">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Commitment</span>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Our Core Principles
              </h2>
              <div className="w-24 h-1 bg-teal-500 mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: '💎',
                title: 'Uncompromising Luxury',
                desc: 'We believe in providing the finest experiences, where every detail matters and excellence is our standard.'
              },
              {
                icon: '🤝',
                title: 'Authentic Service',
                desc: 'Our dedicated team is committed to providing personalized service that anticipates and exceeds your needs.'
              },
              {
                icon: '🌿',
                title: 'Sustainable Coastal Care',
                desc: 'We are committed to preserving the natural beauty of our environment for future generations.'
              }
            ].map((value, idx) => (
              <Reveal key={idx} delay={idx * 0.2} width="100%">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-navy-900/5 hover:shadow-2xl hover:shadow-navy-900/10 transition-all duration-500 group border border-navy-50 h-full">
                  <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-10 group-hover:bg-teal-500 transition-colors duration-500">
                    <span className="text-4xl group-hover:scale-110 transition-all duration-500">{value.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-950 mb-6">{value.title}</h3>
                  <p className="text-navy-600 leading-relaxed">{value.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default AboutUs;
